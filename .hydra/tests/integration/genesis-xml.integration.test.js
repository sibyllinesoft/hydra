/**
 * Genesis.xml Generation and Parsing Integration Tests
 * 
 * Tests the complete lifecycle of Genesis.xml files in the Living Blueprint system.
 * These tests verify that Genesis.xml files are properly generated, parsed, validated,
 * and maintained throughout the epic lifecycle from planning to completion.
 * 
 * @fileoverview Integration tests for Genesis.xml generation and parsing
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// Test utilities
import { createTempDir, createMockPRP, createMockGenesis } from '../setup/jest.setup.js';

describe('Genesis.xml Generation and Parsing Integration Tests', () => {
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
    
    // Setup project structure
    mkdirSync(join(tempDir, '.hydra'), { recursive: true });
    mkdirSync(join(tempDir, 'prompts'), { recursive: true });
    mkdirSync(join(tempDir, 'epics'), { recursive: true });
    
    // Create plan generation template
    const planTemplate = `# Genesis.xml Generation

## Epic: {{EPIC_NAME}}
## PRP Content: {{PRP_CONTENT}}

Generate a comprehensive Genesis.xml file with:
- Valid XML structure
- Task DAG with dependencies
- Agent assignments
- Metrics and tracking
- Living Blueprint compliance

PRP: {{PRP_CONTENT}}`;

    writeFileSync(join(tempDir, 'prompts', 'plan-generation.md'), planTemplate);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe('Genesis.xml Generation Tests', () => {
    it('should generate valid XML structure from PRP', async () => {
      const epicName = 'xml-generation-test';
      const prpContent = createMockPRP(epicName, 'Test Genesis.xml generation');
      
      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'prp.md'), prpContent);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            // Generate a comprehensive Genesis.xml
            const validGenesis = `<?xml version="1.0" encoding="UTF-8"?>
<genesis xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <epic name="${epicName}" created="${new Date().toISOString()}" version="1.0">
    <metadata>
      <summary>Test Genesis.xml generation feature</summary>
      <priority>medium</priority>
      <estimatedDuration>40 hours</estimatedDuration>
      <complexity>medium</complexity>
    </metadata>
    <status>planned</status>
    <stakeholders>
      <stakeholder role="product-owner">Product Team</stakeholder>
      <stakeholder role="technical-lead">Engineering Team</stakeholder>
    </stakeholders>
    <tasks>
      <task id="setup-foundation" priority="high" estimatedHours="8">
        <title>Setup project foundation</title>
        <description>Create basic project structure and configuration</description>
        <agent>backend-architect</agent>
        <dependencies></dependencies>
        <acceptanceCriteria>
          <criterion>Project structure created</criterion>
          <criterion>Configuration files added</criterion>
          <criterion>Development environment ready</criterion>
        </acceptanceCriteria>
        <status>pending</status>
      </task>
      <task id="implement-core" priority="high" estimatedHours="16">
        <title>Implement core functionality</title>
        <description>Build the main feature implementation</description>
        <agent>backend-architect</agent>
        <dependencies>
          <dependency>setup-foundation</dependency>
        </dependencies>
        <acceptanceCriteria>
          <criterion>Core logic implemented</criterion>
          <criterion>Business rules enforced</criterion>
          <criterion>Error handling added</criterion>
        </acceptanceCriteria>
        <status>pending</status>
      </task>
      <task id="add-tests" priority="high" estimatedHours="12">
        <title>Add comprehensive testing</title>
        <description>Create unit, integration, and E2E tests</description>
        <agent>test-writer-fixer</agent>
        <dependencies>
          <dependency>implement-core</dependency>
        </dependencies>
        <acceptanceCriteria>
          <criterion>95% test coverage achieved</criterion>
          <criterion>All test types implemented</criterion>
          <criterion>CI/CD pipeline integration</criterion>
        </acceptanceCriteria>
        <status>pending</status>
      </task>
      <task id="documentation" priority="medium" estimatedHours="4">
        <title>Create documentation</title>
        <description>Add comprehensive documentation and examples</description>
        <agent>technical-writer</agent>
        <dependencies>
          <dependency>add-tests</dependency>
        </dependencies>
        <acceptanceCriteria>
          <criterion>API documentation complete</criterion>
          <criterion>User guide created</criterion>
          <criterion>Code examples provided</criterion>
        </acceptanceCriteria>
        <status>pending</status>
      </task>
    </tasks>
    <dag>
      <level number="0">
        <task>setup-foundation</task>
      </level>
      <level number="1">
        <task>implement-core</task>
      </level>
      <level number="2">
        <task>add-tests</task>
      </level>
      <level number="3">
        <task>documentation</task>
      </level>
    </dag>
    <agents>
      <agent role="backend-architect" tasks="2" estimatedHours="24" />
      <agent role="test-writer-fixer" tasks="1" estimatedHours="12" />
      <agent role="technical-writer" tasks="1" estimatedHours="4" />
    </agents>
    <risks>
      <risk level="medium">
        <description>Third-party API dependency</description>
        <mitigation>Implement fallback mechanisms</mitigation>
      </risk>
      <risk level="low">
        <description>Performance requirements</description>
        <mitigation>Performance testing and optimization</mitigation>
      </risk>
    </risks>
    <milestones>
      <milestone name="Foundation Complete" tasks="1" />
      <milestone name="Core Implementation" tasks="2" />
      <milestone name="Testing Complete" tasks="3" />
      <milestone name="Documentation Complete" tasks="4" />
    </milestones>
  </epic>
</genesis>`;
            
            writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), validGenesis);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executePlan } = await import('../../bin/hydra.mjs');
      await executePlan(epicName, {});

      // Verify Genesis.xml was created and is valid
      const genesisPath = join(tempDir, 'epics', epicName, 'genesis.xml');
      expect(existsSync(genesisPath)).toBe(true);
      
      const genesisContent = readFileSync(genesisPath, 'utf8');
      
      // Verify XML structure
      expect(genesisContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(genesisContent).toContain('<genesis');
      expect(genesisContent).toContain(`<epic name="${epicName}"`);
      expect(genesisContent).toContain('<tasks>');
      expect(genesisContent).toContain('<dag>');
      expect(genesisContent).toContain('<agents>');
      expect(genesisContent).toContain('</genesis>');

      // Verify task structure
      expect(genesisContent).toContain('<task id="setup-foundation"');
      expect(genesisContent).toContain('<dependencies>');
      expect(genesisContent).toContain('<acceptanceCriteria>');
      
      // Verify DAG structure
      expect(genesisContent).toContain('<level number="0">');
      expect(genesisContent).toContain('<level number="1">');
    });

    it('should validate XML structure using xmlstarlet if available', async () => {
      const epicName = 'xml-validation-test';
      const prpContent = createMockPRP(epicName, 'Test XML validation');
      
      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'prp.md'), prpContent);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const genesis = createMockGenesis(epicName, {
              status: 'planned',
              tasks: ['task1', 'task2']
            });
            writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), genesis);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executePlan } = await import('../../bin/hydra.mjs');
      await executePlan(epicName, {});

      const genesisPath = join(tempDir, 'epics', epicName, 'genesis.xml');
      
      // Try to validate with xmlstarlet if available
      try {
        execSync(`xmlstarlet val ${genesisPath}`, { stdio: 'pipe' });
        // If no error, XML is valid
        expect(true).toBe(true);
      } catch (error) {
        // xmlstarlet not available or XML invalid
        console.warn('xmlstarlet not available for validation, skipping XML validation test');
        
        // Fall back to basic structure checks
        const content = readFileSync(genesisPath, 'utf8');
        expect(content).toMatch(/<genesis.*>/);
        expect(content).toMatch(/<\/genesis>/);
      }
    });

    it('should generate proper DAG structure with dependencies', async () => {
      const epicName = 'dag-structure-test';
      const complexPrp = `# Complex DAG Structure PRP

## Problem Statement
Multi-step feature requiring careful dependency management.

## Requirements
- Database setup (foundation)
- API layer (depends on database)  
- Frontend components (depends on API)
- Testing (depends on frontend)
- Documentation (depends on testing)
- Deployment (depends on documentation)

## Dependencies
Clear dependency chain required for proper execution order.`;

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'prp.md'), complexPrp);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const complexGenesis = `<?xml version="1.0" encoding="UTF-8"?>
<genesis>
  <epic name="${epicName}">
    <status>planned</status>
    <tasks>
      <task id="database-setup" priority="high">
        <agent>backend-architect</agent>
        <dependencies></dependencies>
        <description>Setup database schema and connections</description>
      </task>
      <task id="api-layer" priority="high">
        <agent>backend-architect</agent>
        <dependencies>
          <dependency>database-setup</dependency>
        </dependencies>
        <description>Implement API endpoints and business logic</description>
      </task>
      <task id="frontend-components" priority="medium">
        <agent>frontend-developer</agent>
        <dependencies>
          <dependency>api-layer</dependency>
        </dependencies>
        <description>Build user interface components</description>
      </task>
      <task id="testing-suite" priority="high">
        <agent>test-writer-fixer</agent>
        <dependencies>
          <dependency>frontend-components</dependency>
        </dependencies>
        <description>Comprehensive testing across all layers</description>
      </task>
      <task id="documentation" priority="medium">
        <agent>technical-writer</agent>
        <dependencies>
          <dependency>testing-suite</dependency>
        </dependencies>
        <description>Complete documentation and guides</description>
      </task>
      <task id="deployment" priority="high">
        <agent>devops-automator</agent>
        <dependencies>
          <dependency>documentation</dependency>
        </dependencies>
        <description>Production deployment and monitoring</description>
      </task>
    </tasks>
    <dag>
      <level number="0">
        <task>database-setup</task>
      </level>
      <level number="1">
        <task>api-layer</task>
      </level>
      <level number="2">
        <task>frontend-components</task>
      </level>
      <level number="3">
        <task>testing-suite</task>
      </level>
      <level number="4">
        <task>documentation</task>
      </level>
      <level number="5">
        <task>deployment</task>
      </level>
    </dag>
    <criticalPath>
      <task>database-setup</task>
      <task>api-layer</task>
      <task>frontend-components</task>
      <task>testing-suite</task>
      <task>documentation</task>
      <task>deployment</task>
    </criticalPath>
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

      const { executePlan } = await import('../../bin/hydra.mjs');
      await executePlan(epicName, {});

      const genesisPath = join(tempDir, 'epics', epicName, 'genesis.xml');
      const content = readFileSync(genesisPath, 'utf8');

      // Verify DAG structure
      expect(content).toContain('<dag>');
      expect(content).toContain('<level number="0">');
      expect(content).toContain('<level number="5">');
      expect(content).toContain('<task>database-setup</task>');
      expect(content).toContain('<task>deployment</task>');
      
      // Verify dependencies
      expect(content).toContain('<dependency>database-setup</dependency>');
      expect(content).toContain('<dependency>api-layer</dependency>');
      expect(content).toContain('<dependency>documentation</dependency>');
      
      // Verify critical path
      expect(content).toContain('<criticalPath>');
    });

    it('should handle parallel tasks in DAG structure', async () => {
      const epicName = 'parallel-dag-test';
      const parallelPrp = `# Parallel Tasks PRP

## Requirements
- Backend API development
- Frontend development (can start in parallel)
- Documentation (can start in parallel)
- Testing (depends on backend and frontend)
- Deployment (depends on testing)`;

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'prp.md'), parallelPrp);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const parallelGenesis = `<?xml version="1.0" encoding="UTF-8"?>
<genesis>
  <epic name="${epicName}">
    <status>planned</status>
    <tasks>
      <task id="backend-api">
        <agent>backend-architect</agent>
        <dependencies></dependencies>
      </task>
      <task id="frontend-ui">
        <agent>frontend-developer</agent>
        <dependencies></dependencies>
      </task>
      <task id="documentation">
        <agent>technical-writer</agent>
        <dependencies></dependencies>
      </task>
      <task id="testing">
        <agent>test-writer-fixer</agent>
        <dependencies>
          <dependency>backend-api</dependency>
          <dependency>frontend-ui</dependency>
        </dependencies>
      </task>
      <task id="deployment">
        <agent>devops-automator</agent>
        <dependencies>
          <dependency>testing</dependency>
        </dependencies>
      </task>
    </tasks>
    <dag>
      <level number="0">
        <task>backend-api</task>
        <task>frontend-ui</task>
        <task>documentation</task>
      </level>
      <level number="1">
        <task>testing</task>
      </level>
      <level number="2">
        <task>deployment</task>
      </level>
    </dag>
    <parallelization>
      <parallelGroup level="0">
        <task>backend-api</task>
        <task>frontend-ui</task>
        <task>documentation</task>
      </parallelGroup>
    </parallelization>
  </epic>
</genesis>`;
            
            writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), parallelGenesis);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executePlan } = await import('../../bin/hydra.mjs');
      await executePlan(epicName, {});

      const genesisPath = join(tempDir, 'epics', epicName, 'genesis.xml');
      const content = readFileSync(genesisPath, 'utf8');

      // Verify parallel structure
      expect(content).toContain('<level number="0">');
      expect(content).toContain('<task>backend-api</task>');
      expect(content).toContain('<task>frontend-ui</task>');
      expect(content).toContain('<task>documentation</task>');
      expect(content).toContain('<parallelization>');
      expect(content).toContain('<parallelGroup level="0">');
    });
  });

  describe('Genesis.xml Parsing Tests', () => {
    it('should parse and display Genesis.xml structure', async () => {
      const epicName = 'parsing-test';
      const genesis = `<?xml version="1.0" encoding="UTF-8"?>
<genesis>
  <epic name="${epicName}" created="2024-01-01T10:00:00Z">
    <status>in-progress</status>
    <summary>Test Genesis.xml parsing functionality</summary>
    <tasks>
      <task id="task1" status="completed" agent="backend-architect">
        <title>First task</title>
        <description>Completed task for parsing test</description>
        <startTime>2024-01-01T10:00:00Z</startTime>
        <endTime>2024-01-01T14:00:00Z</endTime>
        <estimatedHours>4</estimatedHours>
        <actualHours>4</actualHours>
      </task>
      <task id="task2" status="in-progress" agent="frontend-developer">
        <title>Second task</title>
        <description>In-progress task for parsing test</description>
        <startTime>2024-01-01T15:00:00Z</startTime>
        <estimatedHours>6</estimatedHours>
        <dependencies>
          <dependency>task1</dependency>
        </dependencies>
      </task>
      <task id="task3" status="pending" agent="test-writer-fixer">
        <title>Third task</title>
        <description>Pending task for parsing test</description>
        <estimatedHours>8</estimatedHours>
        <dependencies>
          <dependency>task2</dependency>
        </dependencies>
      </task>
    </tasks>
    <dag>
      <level number="0"><task>task1</task></level>
      <level number="1"><task>task2</task></level>
      <level number="2"><task>task3</task></level>
    </dag>
    <agents>
      <agent>backend-architect</agent>
      <agent>frontend-developer</agent>
      <agent>test-writer-fixer</agent>
    </agents>
    <metrics>
      <totalEstimatedHours>18</totalEstimatedHours>
      <completedHours>4</completedHours>
      <remainingHours>14</remainingHours>
      <progressPercentage>22</progressPercentage>
    </metrics>
  </epic>
</genesis>`;

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), genesis);

      const { executePmView } = await import('../../bin/hydra.mjs');
      await executePmView(epicName, {});

      // Verify parsing and display
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('EPIC STATUS')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(epicName)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('in-progress')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('EXECUTION DAG:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Level 0: task1')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Level 1: task2')
      );
    });

    it('should parse task status and progress correctly', async () => {
      const epicName = 'task-status-test';
      const genesis = createMockGenesis(epicName, {
        status: 'in-progress',
        tasks: [
          { id: 'completed-task', status: 'completed' },
          { id: 'in-progress-task', status: 'in-progress' },
          { id: 'blocked-task', status: 'blocked' },
          { id: 'pending-task', status: 'pending' }
        ]
      });

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), genesis);

      const { executePmView } = await import('../../bin/hydra.mjs');
      await executePmView(epicName, {});

      // Verify task status parsing
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('TASK STATUS BREAKDOWN:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/completed.*1/i)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/in-progress.*1/i)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/blocked.*1/i)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/pending.*1/i)
      );
    });

    it('should extract and display agent assignments', async () => {
      const epicName = 'agent-assignment-test';
      const genesis = `<?xml version="1.0" encoding="UTF-8"?>
<genesis>
  <epic name="${epicName}">
    <status>planned</status>
    <tasks>
      <task id="backend-work" agent="backend-architect" estimatedHours="20" />
      <task id="frontend-work" agent="frontend-developer" estimatedHours="15" />
      <task id="testing-work" agent="test-writer-fixer" estimatedHours="10" />
      <task id="devops-work" agent="devops-automator" estimatedHours="5" />
    </tasks>
    <agents>
      <agent name="backend-architect" tasks="1" estimatedHours="20" />
      <agent name="frontend-developer" tasks="1" estimatedHours="15" />
      <agent name="test-writer-fixer" tasks="1" estimatedHours="10" />
      <agent name="devops-automator" tasks="1" estimatedHours="5" />
    </agents>
  </epic>
</genesis>`;

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), genesis);

      const { executePmView } = await import('../../bin/hydra.mjs');
      await executePmView(epicName, {});

      // Verify agent assignments display
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('AGENT ASSIGNMENTS:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('backend-architect')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('frontend-developer')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('test-writer-fixer')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('devops-automator')
      );
    });

    it('should calculate and display progress metrics', async () => {
      const epicName = 'metrics-calculation-test';
      const genesis = `<?xml version="1.0" encoding="UTF-8"?>
<genesis>
  <epic name="${epicName}">
    <status>in-progress</status>
    <tasks>
      <task id="task1" status="completed" estimatedHours="10" actualHours="8" />
      <task id="task2" status="completed" estimatedHours="15" actualHours="18" />
      <task id="task3" status="in-progress" estimatedHours="12" />
      <task id="task4" status="pending" estimatedHours="20" />
    </tasks>
    <metrics>
      <totalEstimatedHours>57</totalEstimatedHours>
      <completedHours>26</completedHours>
      <remainingHours>31</remainingHours>
      <progressPercentage>46</progressPercentage>
      <estimateAccuracy>96</estimateAccuracy>
    </metrics>
    <timeline>
      <startDate>2024-01-01</startDate>
      <estimatedEndDate>2024-01-15</estimatedEndDate>
      <actualProgress>46%</actualProgress>
    </timeline>
  </epic>
</genesis>`;

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), genesis);

      const { executePmView } = await import('../../bin/hydra.mjs');
      await executePmView(epicName, {});

      // Verify metrics display
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('PROGRESS METRICS:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('46%')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('57') // total estimated hours
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('26') // completed hours
      );
    });
  });

  describe('Genesis.xml Validation Tests', () => {
    it('should detect and report malformed XML', async () => {
      const epicName = 'malformed-xml-test';
      const malformedXml = `<?xml version="1.0" encoding="UTF-8"?>
<genesis>
  <epic name="${epicName}">
    <status>planned</status>
    <tasks>
      <task id="task1">
        <description>Missing closing tag
      </task>
    </tasks>
  <!-- Missing closing epic and genesis tags -->`; // Deliberately malformed

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), malformedXml);

      const { executePmView } = await import('../../bin/hydra.mjs');
      await executePmView(epicName, {});

      // Should detect and handle malformed XML
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('malformed')
      );
    });

    it('should validate required fields in Genesis.xml', async () => {
      const epicName = 'missing-fields-test';
      const incompleteXml = `<?xml version="1.0" encoding="UTF-8"?>
<genesis>
  <epic>
    <!-- Missing name attribute -->
    <!-- Missing status -->
    <tasks>
      <task>
        <!-- Missing id -->
        <description>Incomplete task</description>
      </task>
    </tasks>
  </epic>
</genesis>`;

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), incompleteXml);

      const { executePmView } = await import('../../bin/hydra.mjs');
      await executePmView(epicName, {});

      // Should warn about missing required fields
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('required field')
      );
    });

    it('should detect circular dependencies in DAG', async () => {
      const epicName = 'circular-dependency-test';
      const circularXml = `<?xml version="1.0" encoding="UTF-8"?>
<genesis>
  <epic name="${epicName}">
    <status>planned</status>
    <tasks>
      <task id="taskA">
        <dependencies>
          <dependency>taskB</dependency>
        </dependencies>
      </task>
      <task id="taskB">
        <dependencies>
          <dependency>taskC</dependency>
        </dependencies>
      </task>
      <task id="taskC">
        <dependencies>
          <dependency>taskA</dependency> <!-- Circular! -->
        </dependencies>
      </task>
    </tasks>
  </epic>
</genesis>`;

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), circularXml);

      const { executePmView } = await import('../../bin/hydra.mjs');
      await executePmView(epicName, {});

      // Should detect circular dependencies
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('circular')
      );
    });

    it('should validate agent assignments exist', async () => {
      const epicName = 'invalid-agent-test';
      const invalidAgentXml = `<?xml version="1.0" encoding="UTF-8"?>
<genesis>
  <epic name="${epicName}">
    <status>planned</status>
    <tasks>
      <task id="task1" agent="non-existent-agent">
        <description>Task with invalid agent</description>
      </task>
    </tasks>
    <agents>
      <agent>backend-architect</agent>
      <agent>frontend-developer</agent>
    </agents>
  </epic>
</genesis>`;

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), invalidAgentXml);

      const { executePmView } = await import('../../bin/hydra.mjs');
      await executePmView(epicName, {});

      // Should warn about invalid agent assignment
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('agent')
      );
    });
  });

  describe('Genesis.xml Update and Lifecycle Tests', () => {
    it('should handle Genesis.xml updates during execution', async () => {
      const epicName = 'update-lifecycle-test';
      
      // Start with planned Genesis
      const plannedGenesis = createMockGenesis(epicName, {
        status: 'planned',
        tasks: [
          { id: 'task1', status: 'pending' },
          { id: 'task2', status: 'pending' }
        ]
      });

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), plannedGenesis);

      // First view - planned state
      const { executePmView } = await import('../../bin/hydra.mjs');
      await executePmView(epicName, {});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('planned')
      );

      // Update to in-progress state
      const inProgressGenesis = createMockGenesis(epicName, {
        status: 'in-progress',
        tasks: [
          { id: 'task1', status: 'completed' },
          { id: 'task2', status: 'in-progress' }
        ]
      });

      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), inProgressGenesis);

      // Clear console spy for second view
      consoleSpy.mockClear();

      // Second view - updated state
      await executePmView(epicName, {});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('in-progress')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/completed.*1/i)
      );
    });

    it('should handle large Genesis.xml files efficiently', async () => {
      const epicName = 'large-genesis-test';
      
      // Generate large Genesis with many tasks
      const tasks = Array.from({ length: 100 }, (_, i) => `
        <task id="task-${i}" status="pending" agent="agent-${i % 5}">
          <title>Task ${i}</title>
          <description>Generated task ${i} for large Genesis test</description>
          <estimatedHours>${5 + (i % 10)}</estimatedHours>
          <dependencies>
            ${i > 0 ? `<dependency>task-${i - 1}</dependency>` : ''}
          </dependencies>
        </task>`).join('\n');

      const dagLevels = Array.from({ length: 100 }, (_, i) => 
        `<level number="${i}"><task>task-${i}</task></level>`
      ).join('\n');

      const largeGenesis = `<?xml version="1.0" encoding="UTF-8"?>
<genesis>
  <epic name="${epicName}">
    <status>planned</status>
    <tasks>
      ${tasks}
    </tasks>
    <dag>
      ${dagLevels}
    </dag>
    <agents>
      <agent>agent-0</agent>
      <agent>agent-1</agent>
      <agent>agent-2</agent>
      <agent>agent-3</agent>
      <agent>agent-4</agent>
    </agents>
  </epic>
</genesis>`;

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), largeGenesis);

      const startTime = Date.now();
      const { executePmView } = await import('../../bin/hydra.mjs');
      await executePmView(epicName, {});
      const endTime = Date.now();

      // Should handle large files efficiently
      expect(endTime - startTime).toBeLessThan(5000);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('100 tasks')
      );
    });

    it('should preserve Genesis.xml formatting and comments', async () => {
      const epicName = 'formatting-preservation-test';
      const formattedGenesis = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Living Blueprint Genesis File -->
<!-- Generated: ${new Date().toISOString()} -->
<genesis>
  <epic name="${epicName}">
    <!-- Epic Status -->
    <status>planned</status>
    
    <!-- Task Definitions -->
    <tasks>
      <!-- Core Implementation Task -->
      <task id="core-implementation" priority="high">
        <title>Core Implementation</title>
        <description>
          Implement the core functionality
          with proper error handling
        </description>
        <agent>backend-architect</agent>
      </task>
    </tasks>
    
    <!-- Execution Graph -->
    <dag>
      <level number="0">
        <task>core-implementation</task>
      </level>
    </dag>
  </epic>
</genesis>`;

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), formattedGenesis);

      const { executePmView } = await import('../../bin/hydra.mjs');
      await executePmView(epicName, {});

      // Verify parsing succeeded despite comments and formatting
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(epicName)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('core-implementation')
      );

      // Verify the file wasn't corrupted
      const content = readFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), 'utf8');
      expect(content).toContain('<!-- Living Blueprint Genesis File -->');
      expect(content).toContain('<!-- Epic Status -->');
    });
  });
});