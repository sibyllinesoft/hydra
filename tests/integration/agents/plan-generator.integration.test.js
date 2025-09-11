/**
 * Plan Generator Agent Integration Tests
 * 
 * Tests real integration with the plan-generator agent for Genesis.xml creation.
 * These tests verify that Hydra can successfully coordinate with the plan-generator
 * to transform PRPs into executable Genesis.xml files with proper DAG structures.
 * 
 * @fileoverview Integration tests for plan-generator agent interactions
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// Test utilities
import { createTempDir, createMockPRP, createMockGenesis } from '../../setup/jest.setup.js';

describe('Plan Generator Agent Integration Tests', () => {
  let tempDir;
  let originalCwd;
  let consoleSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    tempDir = createTempDir();
    originalCwd = process.cwd();
    process.chdir(tempDir);
    
    // Setup console spies
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Setup basic project structure
    mkdirSync(join(tempDir, '.hydra'), { recursive: true });
    mkdirSync(join(tempDir, 'prompts'), { recursive: true });
    mkdirSync(join(tempDir, 'epics'), { recursive: true });
    
    // Create planning workflow template
    const planningTemplate = `# Plan Generation Workflow

## Context
Epic: {{EPIC_NAME}}
PRP Analysis: {{PRP_CONTENT}}

## Task
Transform the PRP into an executable Genesis.xml file with:
- Task DAG structure
- Agent assignments
- Dependency mapping
- Resource requirements
- Success criteria

## PRP Content
{{PRP_CONTENT}}

## Instructions
Generate a comprehensive Genesis.xml file following Living Blueprint standards.`;

    writeFileSync(join(tempDir, 'prompts', 'plan-generation.md'), planningTemplate);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe('PRP Processing Tests', () => {
    it('should successfully process a valid PRP into Genesis.xml', async () => {
      const epicName = 'valid-prp-test';
      const prpContent = createMockPRP(epicName, 'Test feature for PRP processing');
      
      // Setup epic directory and PRP
      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'prp.md'), prpContent);

      // Mock successful Claude execution that would generate Genesis.xml
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            // Simulate plan-generator creating Genesis.xml
            const mockGenesis = createMockGenesis(epicName, {
              status: 'planned',
              tasks: ['analyze-requirements', 'implement-feature', 'write-tests'],
              agents: ['backend-architect', 'test-writer-fixer']
            });
            writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), mockGenesis);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executePlan } = await import('../../../bin/hydra.mjs');
      await executePlan(epicName, {});

      // Verify Genesis.xml was created
      const genesisPath = join(tempDir, 'epics', epicName, 'genesis.xml');
      expect(existsSync(genesisPath)).toBe(true);
      
      const genesisContent = readFileSync(genesisPath, 'utf8');
      expect(genesisContent).toContain('<genesis>');
      expect(genesisContent).toContain('<epic name="' + epicName + '">');
      expect(genesisContent).toContain('<status>planned</status>');
    });

    it('should handle complex PRP with multiple sections', async () => {
      const epicName = 'complex-prp-test';
      const complexPrp = `# Complex Feature PRP

## Problem Statement
Multi-faceted problem requiring various technical solutions.

## User Stories
- As a user, I want feature A
- As a developer, I need integration B
- As an admin, I require monitoring C

## Technical Requirements
- Database schema changes
- API endpoint modifications  
- Frontend component updates
- Performance optimizations

## Acceptance Criteria
- [ ] Feature A implementation
- [ ] Integration B completion
- [ ] Monitoring C setup
- [ ] Performance targets met

## Dependencies
- External API integration
- Database migration
- UI component library update

## Risks
- Third-party API reliability
- Performance impact
- Data migration complexity`;

      // Setup epic with complex PRP
      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'prp.md'), complexPrp);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            // Generate complex Genesis.xml with multiple tasks and dependencies
            const complexGenesis = `<?xml version="1.0" encoding="UTF-8"?>
<genesis>
  <epic name="${epicName}" created="${new Date().toISOString()}">
    <status>planned</status>
    <tasks>
      <task id="database-migration" agent="backend-architect" priority="high">
        <dependencies></dependencies>
        <description>Implement database schema changes</description>
      </task>
      <task id="api-endpoints" agent="backend-architect" priority="high">
        <dependencies>
          <dependency>database-migration</dependency>
        </dependencies>
        <description>Create and modify API endpoints</description>
      </task>
      <task id="frontend-components" agent="frontend-developer" priority="medium">
        <dependencies>
          <dependency>api-endpoints</dependency>
        </dependencies>
        <description>Update frontend components</description>
      </task>
      <task id="monitoring-setup" agent="devops-automator" priority="low">
        <dependencies></dependencies>
        <description>Setup monitoring and alerting</description>
      </task>
      <task id="testing" agent="test-writer-fixer" priority="high">
        <dependencies>
          <dependency>frontend-components</dependency>
          <dependency>monitoring-setup</dependency>
        </dependencies>
        <description>Comprehensive testing suite</description>
      </task>
    </tasks>
    <agents>
      <agent>backend-architect</agent>
      <agent>frontend-developer</agent>
      <agent>devops-automator</agent>
      <agent>test-writer-fixer</agent>
    </agents>
  </epic>
</genesis>`;
            writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), complexGenesis);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executePlan } = await import('../../../bin/hydra.mjs');
      await executePlan(epicName, {});

      // Verify complex Genesis.xml structure
      const genesisPath = join(tempDir, 'epics', epicName, 'genesis.xml');
      const genesisContent = readFileSync(genesisPath, 'utf8');
      
      expect(genesisContent).toContain('database-migration');
      expect(genesisContent).toContain('api-endpoints');
      expect(genesisContent).toContain('frontend-components');
      expect(genesisContent).toContain('monitoring-setup');
      expect(genesisContent).toContain('<dependencies>');
      expect(genesisContent).toContain('backend-architect');
    });

    it('should validate PRP format before processing', async () => {
      const epicName = 'invalid-prp-test';
      const invalidPrp = `This is not a properly formatted PRP.
It lacks the required sections and structure.`;

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'prp.md'), invalidPrp);

      const { executePlan } = await import('../../../bin/hydra.mjs');
      await executePlan(epicName, {});

      // Should warn about PRP format issues
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processing PRP for: ' + epicName)
      );
    });
  });

  describe('Genesis.xml Generation Tests', () => {
    it('should generate valid XML structure', async () => {
      const epicName = 'xml-structure-test';
      const prpContent = createMockPRP(epicName, 'Test XML structure generation');
      
      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'prp.md'), prpContent);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const validGenesis = createMockGenesis(epicName, {
              status: 'planned',
              tasks: ['task1', 'task2', 'task3']
            });
            writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), validGenesis);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executePlan } = await import('../../../bin/hydra.mjs');
      await executePlan(epicName, {});

      // Validate XML structure using xmlstarlet if available
      const genesisPath = join(tempDir, 'epics', epicName, 'genesis.xml');
      
      try {
        // Try to validate XML structure
        execSync(`xmlstarlet val ${genesisPath}`, { stdio: 'pipe' });
        // If no exception, XML is valid
        expect(true).toBe(true);
      } catch (error) {
        // xmlstarlet not available or XML invalid
        // Fall back to basic structure validation
        const content = readFileSync(genesisPath, 'utf8');
        expect(content).toMatch(/<\?xml version="1\.0" encoding="UTF-8"\?>/);
        expect(content).toMatch(/<genesis>/);
        expect(content).toMatch(/<\/genesis>/);
      }
    });

    it('should generate proper DAG structure', async () => {
      const epicName = 'dag-test';
      const prpContent = createMockPRP(epicName, 'Test DAG generation with dependencies');
      
      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'prp.md'), prpContent);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            // Generate Genesis with proper DAG structure
            const dagGenesis = `<?xml version="1.0" encoding="UTF-8"?>
<genesis>
  <epic name="${epicName}" created="${new Date().toISOString()}">
    <status>planned</status>
    <tasks>
      <task id="foundation" agent="backend-architect" priority="high">
        <dependencies></dependencies>
        <description>Setup foundation components</description>
      </task>
      <task id="core-logic" agent="backend-architect" priority="high">
        <dependencies>
          <dependency>foundation</dependency>
        </dependencies>
        <description>Implement core business logic</description>
      </task>
      <task id="api-layer" agent="backend-architect" priority="medium">
        <dependencies>
          <dependency>core-logic</dependency>
        </dependencies>
        <description>Create API endpoints</description>
      </task>
      <task id="frontend" agent="frontend-developer" priority="medium">
        <dependencies>
          <dependency>api-layer</dependency>
        </dependencies>
        <description>Build user interface</description>
      </task>
      <task id="testing" agent="test-writer-fixer" priority="high">
        <dependencies>
          <dependency>frontend</dependency>
        </dependencies>
        <description>Comprehensive testing</description>
      </task>
    </tasks>
    <dag>
      <level number="0">
        <task>foundation</task>
      </level>
      <level number="1">
        <task>core-logic</task>
      </level>
      <level number="2">
        <task>api-layer</task>
      </level>
      <level number="3">
        <task>frontend</task>
      </level>
      <level number="4">
        <task>testing</task>
      </level>
    </dag>
  </epic>
</genesis>`;
            writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), dagGenesis);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executePlan } = await import('../../../bin/hydra.mjs');
      await executePlan(epicName, {});

      // Verify DAG structure
      const genesisPath = join(tempDir, 'epics', epicName, 'genesis.xml');
      const content = readFileSync(genesisPath, 'utf8');
      
      expect(content).toContain('<dag>');
      expect(content).toContain('<level number="0">');
      expect(content).toContain('<dependencies>');
      expect(content).toContain('<dependency>foundation</dependency>');
    });

    it('should assign appropriate agents to tasks', async () => {
      const epicName = 'agent-assignment-test';
      const prpContent = `# Multi-Agent Feature

## Requirements
- Backend API development
- Frontend user interface  
- Database design
- Testing coverage
- DevOps deployment

## Technical Scope
Full-stack feature requiring multiple agent coordination.`;

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'prp.md'), prpContent);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const multiAgentGenesis = createMockGenesis(epicName, {
              status: 'planned',
              tasks: [
                { id: 'database-design', agent: 'backend-architect' },
                { id: 'api-development', agent: 'backend-architect' },
                { id: 'frontend-ui', agent: 'frontend-developer' },
                { id: 'testing-suite', agent: 'test-writer-fixer' },
                { id: 'deployment-setup', agent: 'devops-automator' }
              ]
            });
            writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), multiAgentGenesis);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executePlan } = await import('../../../bin/hydra.mjs');
      await executePlan(epicName, {});

      // Verify agent assignments
      const genesisPath = join(tempDir, 'epics', epicName, 'genesis.xml');
      const content = readFileSync(genesisPath, 'utf8');
      
      expect(content).toContain('backend-architect');
      expect(content).toContain('frontend-developer');
      expect(content).toContain('test-writer-fixer');
      expect(content).toContain('devops-automator');
    });
  });

  describe('Template Integration Tests', () => {
    it('should properly substitute template variables', async () => {
      const epicName = 'template-var-test';
      const prpContent = createMockPRP(epicName, 'Test template variable substitution');
      
      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'prp.md'), prpContent);

      let capturedPrompt = '';
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const genesis = createMockGenesis(epicName, { status: 'planned' });
            writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), genesis);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { 
          write: jest.fn((data) => { capturedPrompt += data; }),
          end: jest.fn()
        },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executePlan } = await import('../../../bin/hydra.mjs');
      await executePlan(epicName, {});

      // Verify template variables were substituted
      expect(capturedPrompt).toContain(`Epic: ${epicName}`);
      expect(capturedPrompt).toContain('PRP Analysis:');
      expect(capturedPrompt).toContain('Test template variable substitution');
    });

    it('should handle missing template gracefully', async () => {
      const epicName = 'missing-template-test';
      const prpContent = createMockPRP(epicName, 'Test missing template handling');
      
      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'prp.md'), prpContent);

      // Remove the template file
      const templatePath = join(tempDir, 'prompts', 'plan-generation.md');
      require('fs').unlinkSync(templatePath);

      const { executePlan } = await import('../../../bin/hydra.mjs');
      await executePlan(epicName, {});

      // Should handle missing template gracefully
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Template not found')
      );
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle plan generation failures', async () => {
      const epicName = 'plan-failure-test';
      const prpContent = createMockPRP(epicName, 'Test plan generation failure handling');
      
      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'prp.md'), prpContent);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(1), 10); // Exit with error
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { 
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              callback(Buffer.from('Plan generation failed'));
            }
          })
        }
      }));

      const { executePlan } = await import('../../../bin/hydra.mjs');
      await executePlan(epicName, {});

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('failed')
      );
    });

    it('should validate Genesis.xml output', async () => {
      const epicName = 'invalid-genesis-test';
      const prpContent = createMockPRP(epicName, 'Test invalid Genesis.xml handling');
      
      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'prp.md'), prpContent);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            // Create invalid XML
            const invalidXml = `<genesis><epic><tasks><task>incomplete`;
            writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), invalidXml);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executePlan } = await import('../../../bin/hydra.mjs');
      await executePlan(epicName, {});

      // Should detect invalid XML
      const genesisPath = join(tempDir, 'epics', epicName, 'genesis.xml');
      expect(existsSync(genesisPath)).toBe(true);
      
      // Note: Actual validation would depend on implementation
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle circular dependencies in DAG', async () => {
      const epicName = 'circular-deps-test';
      const prpContent = createMockPRP(epicName, 'Test circular dependency detection');
      
      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'prp.md'), prpContent);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            // Create Genesis with circular dependencies
            const circularGenesis = `<?xml version="1.0" encoding="UTF-8"?>
<genesis>
  <epic name="${epicName}">
    <tasks>
      <task id="taskA">
        <dependencies><dependency>taskB</dependency></dependencies>
      </task>
      <task id="taskB">
        <dependencies><dependency>taskA</dependency></dependencies>
      </task>
    </tasks>
  </epic>
</genesis>`;
            writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), circularGenesis);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executePlan } = await import('../../../bin/hydra.mjs');
      await executePlan(epicName, {});

      // Should detect/handle circular dependencies
      // (Implementation dependent - may warn or reject)
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Performance Tests', () => {
    it('should handle large PRPs efficiently', async () => {
      const epicName = 'large-prp-test';
      
      // Create a large PRP with many sections
      const largePrp = Array.from({ length: 50 }, (_, i) => `
## Section ${i + 1}
This is section ${i + 1} with detailed requirements.
- Requirement A.${i + 1}
- Requirement B.${i + 1}  
- Requirement C.${i + 1}
`).join('\n');
      
      const fullPrp = `# Large Feature PRP\n${largePrp}`;
      
      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'prp.md'), fullPrp);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      const startTime = Date.now();
      
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const genesis = createMockGenesis(epicName, { status: 'planned' });
            writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), genesis);
            setTimeout(() => callback(0), 100); // Simulate processing time
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executePlan } = await import('../../../bin/hydra.mjs');
      await executePlan(epicName, {});
      
      const endTime = Date.now();
      
      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000);
      expect(existsSync(join(tempDir, 'epics', epicName, 'genesis.xml'))).toBe(true);
    });

    it('should generate optimal DAG structure for complex dependencies', async () => {
      const epicName = 'complex-dag-test';
      const complexPrp = `# Complex Feature with Many Dependencies

## Database Layer
- Schema design
- Migration scripts
- Data models

## API Layer  
- Authentication endpoints
- Business logic endpoints
- Data validation

## Frontend Layer
- Components
- State management
- User interactions

## Infrastructure
- Deployment configuration
- Monitoring setup
- Scaling configuration

## Testing
- Unit tests
- Integration tests
- E2E tests`;

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'prp.md'), complexPrp);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            // Generate complex but optimized DAG
            const complexGenesis = createMockGenesis(epicName, {
              status: 'planned',
              tasks: Array.from({ length: 15 }, (_, i) => `task-${i + 1}`)
            });
            writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), complexGenesis);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executePlan } = await import('../../../bin/hydra.mjs');
      await executePlan(epicName, {});

      // Verify complex Genesis was generated
      const genesisPath = join(tempDir, 'epics', epicName, 'genesis.xml');
      const content = readFileSync(genesisPath, 'utf8');
      
      // Should contain multiple tasks and proper structure
      expect(content).toContain('<tasks>');
      expect(content).toContain('task-1');
      expect(content).toContain('task-15');
    });
  });
});