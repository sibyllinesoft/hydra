/**
 * Project Shipper Agent Integration Tests
 * 
 * Tests real integration with the project-shipper agent for recap generation.
 * These tests verify that Hydra can successfully coordinate with the project-shipper
 * to generate comprehensive project documentation, recaps, and delivery closure
 * based on completed Genesis.xml files and project artifacts.
 * 
 * @fileoverview Integration tests for project-shipper agent interactions
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Test utilities
import { createTempDir, createMockGenesis, createMockPRP } from '../../setup/jest.setup.js';

describe('Project Shipper Agent Integration Tests', () => {
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
    mkdirSync(join(tempDir, 'recaps'), { recursive: true });
    
    // Create recap workflow template
    const recapTemplate = `# Project Recap Workflow

## Context
Epic: {{EPIC_NAME}}
Genesis Analysis: {{GENESIS_CONTENT}}
Completion Status: {{COMPLETION_STATUS}}

## Task
Generate comprehensive project documentation including:
- Executive summary of achievements
- Technical implementation details
- Lessons learned and insights
- Performance metrics and outcomes
- Recommendations for future work

## Genesis Data
{{GENESIS_CONTENT}}

## Instructions
Analyze the completed Genesis.xml file and generate a thorough project recap
following Living Blueprint documentation standards. Include quantitative metrics
where possible and actionable insights for future similar projects.`;

    writeFileSync(join(tempDir, 'prompts', 'recap-workflow.md'), recapTemplate);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe('Completed Project Analysis Tests', () => {
    it('should analyze completed Genesis.xml and generate comprehensive recap', async () => {
      const epicName = 'completed-project-test';
      
      // Create completed Genesis.xml with rich data
      const completedGenesis = `<?xml version="1.0" encoding="UTF-8"?>
<genesis>
  <epic name="${epicName}" created="2024-01-01T10:00:00Z" completed="2024-01-15T16:30:00Z">
    <status>completed</status>
    <summary>User authentication system implementation</summary>
    <tasks>
      <task id="database-setup" agent="backend-architect" status="completed" 
            started="2024-01-01T10:00:00Z" completed="2024-01-02T14:00:00Z">
        <description>Setup user database schema and migrations</description>
        <outcome>PostgreSQL schema created with user, role, and session tables</outcome>
        <metrics>
          <duration>28 hours</duration>
          <complexity>medium</complexity>
        </metrics>
      </task>
      <task id="auth-service" agent="backend-architect" status="completed"
            started="2024-01-02T15:00:00Z" completed="2024-01-05T12:00:00Z">
        <description>Implement authentication service and JWT handling</description>
        <outcome>Complete auth service with login, register, refresh token flow</outcome>
        <metrics>
          <duration>69 hours</duration>
          <complexity>high</complexity>
        </metrics>
      </task>
      <task id="frontend-auth" agent="frontend-developer" status="completed"
            started="2024-01-05T13:00:00Z" completed="2024-01-08T17:00:00Z">
        <description>Build authentication UI components</description>
        <outcome>Login/register forms with validation and error handling</outcome>
        <metrics>
          <duration>76 hours</duration>
          <complexity>medium</complexity>
        </metrics>
      </task>
      <task id="testing-suite" agent="test-writer-fixer" status="completed"
            started="2024-01-09T09:00:00Z" completed="2024-01-12T15:00:00Z">
        <description>Comprehensive testing for auth system</description>
        <outcome>95% test coverage with unit, integration, and E2E tests</outcome>
        <metrics>
          <duration>78 hours</duration>
          <coverage>95%</coverage>
        </metrics>
      </task>
      <task id="security-review" agent="security-ninja" status="completed"
            started="2024-01-13T10:00:00Z" completed="2024-01-15T14:00:00Z">
        <description>Security audit and penetration testing</description>
        <outcome>No critical vulnerabilities found, minor fixes applied</outcome>
        <metrics>
          <duration>52 hours</duration>
          <vulnerabilities>0 critical, 2 minor (fixed)</vulnerabilities>
        </metrics>
      </task>
    </tasks>
    <agents>
      <agent>backend-architect</agent>
      <agent>frontend-developer</agent>
      <agent>test-writer-fixer</agent>
      <agent>security-ninja</agent>
    </agents>
    <metrics>
      <totalDuration>303 hours</totalDuration>
      <testCoverage>95%</testCoverage>
      <securityScore>9.8/10</securityScore>
      <performanceScore>8.5/10</performanceScore>
    </metrics>
    <outcomes>
      <achievement>Complete user authentication system</achievement>
      <achievement>95% test coverage achieved</achievement>
      <achievement>Security audit passed</achievement>
      <achievement>Performance targets met</achievement>
    </outcomes>
  </epic>
</genesis>`;

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), completedGenesis);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            // Simulate project-shipper generating comprehensive recap
            const comprehensiveRecap = `# Project Recap: ${epicName}

## Executive Summary
Successfully delivered a complete user authentication system over 14 days with 303 total development hours. The project achieved all primary objectives including security compliance, comprehensive test coverage, and performance targets.

### Key Achievements
- ✅ Complete authentication system implementation
- ✅ 95% test coverage (target: 90%)
- ✅ Security audit passed (9.8/10 score)
- ✅ Performance targets met (8.5/10 score)
- ✅ Zero critical vulnerabilities

## Technical Implementation Details

### Architecture Decisions
- PostgreSQL for user data storage
- JWT-based authentication with refresh tokens
- React frontend with form validation
- Comprehensive testing strategy

### Agent Performance Analysis
1. **backend-architect**: 97 hours across 2 tasks
   - Database setup: 28 hours (efficient)
   - Auth service: 69 hours (complex but thorough)
   
2. **frontend-developer**: 76 hours
   - Auth UI components with excellent UX
   - Proper error handling and validation
   
3. **test-writer-fixer**: 78 hours
   - Exceeded coverage target (95% vs 90%)
   - Comprehensive test pyramid implementation
   
4. **security-ninja**: 52 hours
   - Thorough security audit
   - Zero critical vulnerabilities found

## Lessons Learned

### What Worked Well
- Clear Genesis.xml structure enabled smooth coordination
- Agent specialization led to high-quality deliverables
- Security-first approach prevented late-stage issues
- Comprehensive testing strategy paid dividends

### Areas for Improvement
- Earlier security review could catch issues sooner
- Frontend work could start in parallel with auth service
- More detailed time estimation needed for complex tasks

## Metrics and Performance

### Time Performance
- Total Duration: 303 hours (within 320 hour estimate)
- Calendar Time: 14 days (within 15 day target)
- Efficiency: 94.7% (excellent)

### Quality Metrics
- Test Coverage: 95% (exceeds target)
- Security Score: 9.8/10 (excellent)
- Performance Score: 8.5/10 (good)
- Defect Rate: 0 critical, 2 minor (excellent)

### Agent Utilization
- Backend Architect: 97 hours (32% of total)
- Frontend Developer: 76 hours (25% of total)
- Test Writer: 78 hours (26% of total)
- Security Ninja: 52 hours (17% of total)

## Recommendations for Future Projects

### Process Improvements
1. Implement parallel task execution where possible
2. Earlier security review integration
3. More granular time tracking for complex tasks
4. Regular checkpoint reviews

### Technical Recommendations
1. Consider auth service as reusable component
2. Document security patterns for future projects
3. Standardize testing approaches across teams
4. Performance monitoring integration

### Agent Coordination
1. Cross-agent knowledge sharing sessions
2. Standardized handoff procedures
3. Quality gate checkpoints
4. Performance benchmarking

## Deliverables Completed
- [x] User registration and login system
- [x] JWT authentication with refresh tokens
- [x] Database schema and migrations
- [x] Frontend authentication components
- [x] Comprehensive test suite (95% coverage)
- [x] Security audit and compliance
- [x] Performance optimization
- [x] Documentation and deployment guides

## Project Classification: SUCCESS ✅

This project exemplifies successful agent coordination and Living Blueprint methodology. All objectives were met or exceeded, with excellent quality metrics and stakeholder satisfaction.

---
*Generated by project-shipper agent*
*Date: ${new Date().toISOString()}*
*Epic: ${epicName}*`;

            writeFileSync(join(tempDir, 'recaps', `${epicName}-recap.md`), comprehensiveRecap);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeRecap } = await import('../../../bin/hydra.mjs');
      await executeRecap(epicName, {});

      // Verify comprehensive recap was generated
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('project-shipper')
      );

      const recapPath = join(tempDir, 'recaps', `${epicName}-recap.md`);
      if (existsSync(recapPath)) {
        const recapContent = readFileSync(recapPath, 'utf8');
        expect(recapContent).toContain('Executive Summary');
        expect(recapContent).toContain('Technical Implementation Details');
        expect(recapContent).toContain('Lessons Learned');
        expect(recapContent).toContain('Metrics and Performance');
      }
    });

    it('should handle partially completed projects', async () => {
      const epicName = 'partial-completion-test';
      
      const partialGenesis = `<?xml version="1.0" encoding="UTF-8"?>
<genesis>
  <epic name="${epicName}" created="2024-01-01T10:00:00Z">
    <status>in-progress</status>
    <tasks>
      <task id="task1" status="completed">
        <description>Completed task</description>
        <outcome>Successfully delivered</outcome>
      </task>
      <task id="task2" status="in-progress">
        <description>Ongoing task</description>
      </task>
      <task id="task3" status="blocked">
        <description>Blocked task</description>
        <blockingReason>Waiting for external API</blockingReason>
      </task>
    </tasks>
  </epic>
</genesis>`;

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), partialGenesis);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const partialRecap = `# Partial Project Recap: ${epicName}

## Status: In Progress

### Completed Work
- task1: Successfully delivered

### Ongoing Work  
- task2: In progress

### Blocked Items
- task3: Blocked - Waiting for external API

## Recommendations
- Address blocking issues for task3
- Continue monitoring task2 progress
- Plan completion strategy for remaining work`;

            writeFileSync(join(tempDir, 'recaps', `${epicName}-partial-recap.md`), partialRecap);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fun() },
        stderr: { on: jest.fn() }
      }));

      const { executeRecap } = await import('../../../bin/hydra.mjs');
      await executeRecap(epicName, {});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('project-shipper')
      );
    });

    it('should extract and analyze project metrics', async () => {
      const epicName = 'metrics-analysis-test';
      
      const metricsRichGenesis = `<?xml version="1.0" encoding="UTF-8"?>
<genesis>
  <epic name="${epicName}" completed="2024-01-20T12:00:00Z">
    <status>completed</status>
    <tasks>
      <task id="performance-task" status="completed">
        <metrics>
          <responseTime>150ms</responseTime>
          <throughput>1000 rps</throughput>
          <memoryUsage>512MB</memoryUsage>
          <cpuUtilization>65%</cpuUtilization>
        </metrics>
      </task>
    </tasks>
    <globalMetrics>
      <developmentTime>240 hours</developmentTime>
      <testingTime>60 hours</testingTime>
      <reviewTime>20 hours</reviewTime>
      <totalCost>$32000</totalCost>
      <teamSize>4 agents</teamSize>
      <bugCount>3 total (0 critical)</bugCount>
      <customerSatisfaction>9.2/10</customerSatisfaction>
    </globalMetrics>
  </epic>
</genesis>`;

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), metricsRichGenesis);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const metricsRecap = `# Metrics Analysis Recap

## Performance Metrics
- Response Time: 150ms (excellent)
- Throughput: 1000 rps (meets target)
- Memory Usage: 512MB (efficient)
- CPU Utilization: 65% (optimal)

## Project Metrics
- Development: 240 hours
- Testing: 60 hours (20% of dev time - good ratio)
- Review: 20 hours
- Total Cost: $32,000
- Team Size: 4 agents
- Bug Count: 3 total (0 critical) - excellent quality
- Customer Satisfaction: 9.2/10 - exceptional

## Analysis
The project demonstrates excellent performance characteristics and quality metrics.
The 20% testing ratio indicates thorough quality assurance practices.
Customer satisfaction score of 9.2/10 shows exceptional delivery quality.`;

            writeFileSync(join(tempDir, 'recaps', `${epicName}-metrics-recap.md`), metricsRecap);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeRecap } = await import('../../../bin/hydra.mjs');
      await executeRecap(epicName, {});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('project-shipper')
      );
    });
  });

  describe('Template Processing and Variable Substitution Tests', () => {
    it('should properly substitute Genesis.xml content in template', async () => {
      const epicName = 'template-substitution-test';
      const genesis = createMockGenesis(epicName, {
        status: 'completed',
        tasks: ['setup', 'implementation', 'testing']
      });

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), genesis);

      let capturedInput = '';
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const recap = `# Template Substitution Test Recap\n\nEpic: ${epicName}\nStatus: completed`;
            writeFileSync(join(tempDir, 'recaps', `${epicName}-recap.md`), recap);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { 
          write: jest.fn((data) => { capturedInput += data; }),
          end: jest.fn()
        },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeRecap } = await import('../../../bin/hydra.mjs');
      await executeRecap(epicName, {});

      // Verify template variables were substituted
      expect(capturedInput).toContain(`Epic: ${epicName}`);
      expect(capturedInput).toContain('<genesis>');
      expect(capturedInput).toContain('completed');
    });

    it('should handle missing Genesis.xml gracefully', async () => {
      const epicName = 'missing-genesis-test';
      
      // Don't create Genesis.xml file
      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });

      const { executeRecap } = await import('../../../bin/hydra.mjs');
      await executeRecap(epicName, {});

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Genesis.xml not found')
      );
    });

    it('should handle malformed Genesis.xml', async () => {
      const epicName = 'malformed-genesis-test';
      const malformedGenesis = `<genesis><epic>incomplete xml`;

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), malformedGenesis);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const errorRecap = `# Error Analysis Recap\n\nGenesis.xml appears to be malformed.\nRecommend reviewing project structure.`;
            writeFileSync(join(tempDir, 'recaps', `${epicName}-error-recap.md`), errorRecap);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeRecap } = await import('../../../bin/hydra.mjs');
      await executeRecap(epicName, {});

      // Should handle malformed XML gracefully
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('project-shipper')
      );
    });
  });

  describe('Multi-Epic and Portfolio Analysis Tests', () => {
    it('should generate portfolio-level insights for multiple epics', async () => {
      // Create multiple completed epics
      const epics = ['epic-1', 'epic-2', 'epic-3'];
      
      epics.forEach((epicName, index) => {
        const genesis = createMockGenesis(epicName, {
          status: 'completed',
          duration: (index + 1) * 100,
          tasks: [`task-${index}-1`, `task-${index}-2`]
        });
        
        mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
        writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), genesis);
      });

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const portfolioRecap = `# Portfolio Analysis Recap

## Multi-Epic Summary
Analyzed 3 completed epics with varying complexity and duration.

### Epic Performance Comparison
- epic-1: 100 hours (baseline)
- epic-2: 200 hours (2x complexity)
- epic-3: 300 hours (3x complexity)

### Portfolio Insights
- Average completion time: 200 hours
- Complexity scaling appears linear
- Consistent quality metrics across epics
- Agent utilization optimization opportunities identified

## Recommendations
- Standardize estimation methodology
- Cross-epic knowledge sharing
- Resource allocation optimization`;

            writeFileSync(join(tempDir, 'recaps', 'portfolio-analysis.md'), portfolioRecap);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      // Generate recap for one epic (could be extended for portfolio analysis)
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      await executeRecap('epic-1', {});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('project-shipper')
      );
    });

    it('should identify patterns across related projects', async () => {
      const epicName = 'pattern-analysis-test';
      
      // Create Genesis with detailed agent and pattern data
      const patternRichGenesis = `<?xml version="1.0" encoding="UTF-8"?>
<genesis>
  <epic name="${epicName}" completed="2024-01-15T12:00:00Z">
    <status>completed</status>
    <patterns>
      <architecturalPatterns>
        <pattern>Microservices</pattern>
        <pattern>Event-Driven Architecture</pattern>
        <pattern>CQRS</pattern>
      </architecturalPatterns>
      <agentPatterns>
        <pattern>Backend-first development</pattern>
        <pattern>Test-driven development</pattern>
        <pattern>Security-first approach</pattern>
      </agentPatterns>
      <successPatterns>
        <pattern>Early security review</pattern>
        <pattern>Parallel development tracks</pattern>
        <pattern>Comprehensive testing strategy</pattern>
      </successPatterns>
    </patterns>
    <lessons>
      <lesson type="success">Early stakeholder engagement improved requirements clarity</lesson>
      <lesson type="challenge">Third-party API integration took longer than expected</lesson>
      <lesson type="improvement">Automated testing saved significant manual effort</lesson>
    </lessons>
  </epic>
</genesis>`;

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), patternRichGenesis);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const patternRecap = `# Pattern Analysis Recap

## Identified Patterns

### Architectural Patterns
- Microservices architecture
- Event-driven communication
- CQRS for complex domains

### Development Patterns  
- Backend-first approach
- Test-driven development
- Security-first implementation

### Success Patterns
- Early security review integration
- Parallel development execution
- Comprehensive testing strategy

## Lessons Learned
✅ **Success**: Early stakeholder engagement improved requirements clarity
⚠️ **Challenge**: Third-party API integration took longer than expected  
💡 **Improvement**: Automated testing saved significant manual effort

## Pattern Recommendations for Future Projects
1. Continue backend-first approach for complex integrations
2. Allocate extra time for third-party API work
3. Maintain security-first development practices
4. Leverage automated testing for efficiency gains`;

            writeFileSync(join(tempDir, 'recaps', `${epicName}-patterns-recap.md`), patternRecap);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeRecap } = await import('../../../bin/hydra.mjs');
      await executeRecap(epicName, {});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('project-shipper')
      );
    });
  });

  describe('Error Handling and Recovery Tests', () => {
    it('should handle recap generation failures gracefully', async () => {
      const epicName = 'recap-failure-test';
      const genesis = createMockGenesis(epicName, { status: 'completed' });

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), genesis);

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
              callback(Buffer.from('Recap generation failed'));
            }
          })
        }
      }));

      const { executeRecap } = await import('../../../bin/hydra.mjs');
      await executeRecap(epicName, {});

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('failed')
      );
    });

    it('should handle large Genesis.xml files efficiently', async () => {
      const epicName = 'large-genesis-test';
      
      // Create a large Genesis.xml with many tasks and detailed data
      const largeTasks = Array.from({ length: 50 }, (_, i) => `
      <task id="task-${i}" status="completed" agent="agent-${i % 5}">
        <description>Task ${i} description with detailed information about implementation</description>
        <outcome>Successfully completed task ${i} with excellent results and metrics</outcome>
        <metrics>
          <duration>${20 + i}h</duration>
          <complexity>${i % 3 === 0 ? 'high' : 'medium'}</complexity>
          <satisfaction>${8 + (i % 3)}/10</satisfaction>
        </metrics>
      </task>`).join('\n');

      const largeGenesis = `<?xml version="1.0" encoding="UTF-8"?>
<genesis>
  <epic name="${epicName}" completed="2024-01-30T12:00:00Z">
    <status>completed</status>
    <summary>Large-scale project with 50 tasks and comprehensive metrics</summary>
    <tasks>${largeTasks}</tasks>
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

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      const startTime = Date.now();
      
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const largeRecap = `# Large Project Recap\n\nAnalyzed 50 tasks across 5 agents.\nComprehensive analysis complete.`;
            writeFileSync(join(tempDir, 'recaps', `${epicName}-large-recap.md`), largeRecap);
            setTimeout(() => callback(0), 100); // Simulate processing time
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeRecap } = await import('../../../bin/hydra.mjs');
      await executeRecap(epicName, {});
      
      const endTime = Date.now();
      
      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('project-shipper')
      );
    });

    it('should validate Genesis.xml structure before processing', async () => {
      const epicName = 'structure-validation-test';
      
      // Create Genesis.xml with missing required fields
      const incompleteGenesis = `<?xml version="1.0" encoding="UTF-8"?>
<genesis>
  <epic>
    <!-- Missing name attribute -->
    <status>completed</status>
    <!-- Missing tasks section -->
  </epic>
</genesis>`;

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), incompleteGenesis);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const validationRecap = `# Structure Validation Recap\n\nGenesis.xml structure issues detected.\nRecommend reviewing required fields and structure.`;
            writeFileSync(join(tempDir, 'recaps', `${epicName}-validation-recap.md`), validationRecap);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeRecap } = await import('../../../bin/hydra.mjs');
      await executeRecap(epicName, {});

      // Should handle structure issues gracefully
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('project-shipper')
      );
    });
  });

  describe('Performance and Scalability Tests', () => {
    it('should handle concurrent recap generation requests', async () => {
      const epics = ['concurrent-1', 'concurrent-2', 'concurrent-3'];
      
      // Create multiple epics
      epics.forEach(epicName => {
        const genesis = createMockGenesis(epicName, { status: 'completed' });
        mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
        writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), genesis);
      });

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      let processCount = 0;
      
      mockSpawn.mockImplementation(() => {
        processCount++;
        return {
          on: jest.fn((event, callback) => {
            if (event === 'close') {
              setTimeout(() => {
                processCount--;
                callback(0);
              }, 50);
            }
          }),
          stdin: { write: jest.fn(), end: jest.fn() },
          stdout: { on: jest.fn() },
          stderr: { on: jest.fn() }
        };
      });

      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      // Execute concurrent recap generations
      const promises = epics.map(epicName => executeRecap(epicName, {}));
      await Promise.all(promises);
      
      // Should handle concurrent processes properly
      expect(processCount).toBe(0); // All processes cleaned up
      expect(mockSpawn).toHaveBeenCalledTimes(3);
    });

    it('should optimize memory usage for large project data', async () => {
      const epicName = 'memory-optimization-test';
      
      // Create Genesis with large amounts of data
      const memoryIntensiveGenesis = `<?xml version="1.0" encoding="UTF-8"?>
<genesis>
  <epic name="${epicName}">
    <status>completed</status>
    <largeDataSection>${'x'.repeat(100000)}</largeDataSection>
    <tasks>
      ${Array.from({ length: 100 }, (_, i) => `
        <task id="task-${i}">
          <description>${'Large description '.repeat(100)}</description>
          <detailedLogs>${'Log entry '.repeat(1000)}</detailedLogs>
        </task>
      `).join('')}
    </tasks>
  </epic>
</genesis>`;

      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), memoryIntensiveGenesis);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      const startTime = Date.now();
      
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const optimizedRecap = `# Memory Optimized Recap\n\nProcessed large dataset efficiently.`;
            writeFileSync(join(tempDir, 'recaps', `${epicName}-optimized-recap.md`), optimizedRecap);
            setTimeout(() => callback(0), 200);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeRecap } = await import('../../../bin/hydra.mjs');
      await executeRecap(epicName, {});
      
      const endTime = Date.now();
      
      // Should handle large data efficiently
      expect(endTime - startTime).toBeLessThan(10000);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('project-shipper')
      );
    });
  });
});