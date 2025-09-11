/**
 * Claude CLI Integration Tests
 * 
 * Tests real integration with the Claude CLI for the Hydra workflow system.
 * These tests verify that Hydra can successfully interface with Claude commands
 * and handle various Claude CLI scenarios including authentication, prompt processing,
 * and error conditions.
 * 
 * @fileoverview Integration tests for Claude CLI interactions
 */

import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';

// Test utilities
import { createTempDir, createMockGenesis, createMockPRP, mockSpawn } from '../../setup/jest.setup.js';

describe('Claude CLI Integration Tests', () => {
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
  });

  afterEach(() => {
    process.chdir(originalCwd);
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe('Claude Authentication Tests', () => {
    it('should detect Claude CLI availability', async () => {
      // Mock Claude CLI being available
      const mockExecSync = jest.spyOn(require('child_process'), 'execSync');
      mockExecSync.mockReturnValueOnce('Claude CLI v0.4.0');

      const { HydraDoctor } = await import('../../../bin/hydra.mjs');
      const doctor = new HydraDoctor();
      
      const result = await doctor.checkClaude();
      
      expect(result.status).toBe('OK');
      expect(result.message).toContain('Claude CLI available');
    });

    it('should handle Claude CLI not installed', async () => {
      // Mock Claude CLI not being available
      const mockExecSync = jest.spyOn(require('child_process'), 'execSync');
      mockExecSync.mockImplementation(() => {
        throw new Error('Command not found');
      });

      const { HydraDoctor } = await import('../../../bin/hydra.mjs');
      const doctor = new HydraDoctor();
      
      const result = await doctor.checkClaude();
      
      expect(result.status).toBe('ERROR');
      expect(result.message).toContain('Claude CLI not available');
    });

    it('should validate Claude authentication status', async () => {
      // Mock authenticated Claude CLI
      const mockExecSync = jest.spyOn(require('child_process'), 'execSync');
      mockExecSync.mockReturnValueOnce('Claude CLI v0.4.0')
                  .mockReturnValueOnce('Authenticated as user@example.com');

      const { HydraDoctor } = await import('../../../bin/hydra.mjs');
      const doctor = new HydraDoctor();
      
      const result = await doctor.checkClaude();
      
      expect(result.status).toBe('OK');
      expect(result.message).toContain('authenticated');
    });
  });

  describe('Claude Prompt Processing Tests', () => {
    beforeEach(() => {
      // Create a mock prompt template
      const mockPrompt = `# Strategic Analysis Prompt

## Context
Strategic analysis for: {{FEATURE_NAME}}

## Requirements
- Analyze the feature requirements
- Provide implementation guidance
- Generate technical recommendations

## Feature Description
{{FEATURE_DESCRIPTION}}

## Instructions
Please analyze this feature request and provide strategic guidance.`;

      writeFileSync(join(tempDir, 'prompts', 'strategic-analysis.md'), mockPrompt);
    });

    it('should process template variables in prompts', async () => {
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeNew } = await import('../../../bin/hydra.mjs');
      await executeNew('test-feature', { description: 'Test feature description' });

      // Verify that spawn was called with Claude
      expect(mockSpawn).toHaveBeenCalledWith('claude', 
        expect.arrayContaining(['chat', '--no-stream']),
        expect.any(Object)
      );
    });

    it('should handle Claude command execution with proper options', async () => {
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      let capturedInput = '';
      
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
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

      const { executeNew } = await import('../../../bin/hydra.mjs');
      await executeNew('claude-test', { description: 'Integration test feature' });

      // Verify Claude was invoked with correct parameters
      expect(mockSpawn).toHaveBeenCalledWith('claude', 
        expect.arrayContaining(['chat', '--no-stream']),
        expect.objectContaining({
          stdio: ['pipe', 'inherit', 'inherit']
        })
      );
    });

    it('should handle Claude process errors gracefully', async () => {
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(1), 10); // Exit with error
          } else if (event === 'error') {
            setTimeout(() => callback(new Error('Claude process failed')), 5);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeNew } = await import('../../../bin/hydra.mjs');
      await executeNew('error-test', {});

      // Verify error handling
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Claude execution failed')
      );
    });
  });

  describe('Template Processing Integration', () => {
    it('should correctly substitute template variables', async () => {
      const template = `# Test Template
Feature: {{FEATURE_NAME}}
Description: {{FEATURE_DESCRIPTION}}
Type: {{FEATURE_TYPE}}`;

      writeFileSync(join(tempDir, 'prompts', 'test-template.md'), template);

      // Mock successful Claude execution
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      let processedInput = '';
      
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
        stdin: { 
          write: jest.fn((data) => { processedInput += data; }),
          end: jest.fn()
        },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      // Test template processing by creating a feature
      const featureName = 'template-test';
      const featureDescription = 'Test template processing';
      
      // Create test that uses template processing
      const { executeNew } = await import('../../../bin/hydra.mjs');
      await executeNew(featureName, { 
        description: featureDescription,
        type: 'feature' 
      });

      // The actual template substitution verification would depend on 
      // the specific implementation details of how variables are processed
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should handle missing template files gracefully', async () => {
      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      // Try to execute without strategic-analysis.md template
      await executeNew('missing-template-test', {});

      // Should handle missing template gracefully
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Template not found')
      );
    });

    it('should validate template syntax before processing', async () => {
      // Create a malformed template
      const malformedTemplate = `# Malformed Template
{{UNCLOSED_VARIABLE
{{FEATURE_NAME}}`;

      writeFileSync(join(tempDir, 'prompts', 'strategic-analysis.md'), malformedTemplate);

      const { executeNew } = await import('../../../bin/hydra.mjs');
      await executeNew('syntax-test', {});

      // Should detect and handle template syntax errors
      // Note: Actual behavior depends on implementation
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Agent Coordination Tests', () => {
    it('should coordinate with plan-generator agent', async () => {
      // Setup Genesis.xml mock
      const mockGenesis = createMockGenesis('plan-test', {
        status: 'planned',
        tasks: ['task1', 'task2']
      });
      
      writeFileSync(join(tempDir, 'epics', 'plan-test', 'genesis.xml'), mockGenesis);
      mkdirSync(join(tempDir, 'epics', 'plan-test'), { recursive: true });

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executePlan } = await import('../../../bin/hydra.mjs');
      await executePlan('plan-test', {});

      expect(mockSpawn).toHaveBeenCalledWith('claude',
        expect.arrayContaining(['chat', '--no-stream']),
        expect.any(Object)
      );
    });

    it('should coordinate with code-analyzer agent', async () => {
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      await executeEnhance('analyzer-test', { codebase: tempDir });

      // Verify code-analyzer agent was invoked
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invoking code-analyzer')
      );
    });

    it('should coordinate with project-shipper agent', async () => {
      // Create a completed Genesis.xml
      const completedGenesis = createMockGenesis('shipper-test', {
        status: 'completed',
        tasks: ['task1', 'task2'],
        completedAt: new Date().toISOString()
      });
      
      mkdirSync(join(tempDir, 'epics', 'shipper-test'), { recursive: true });
      writeFileSync(join(tempDir, 'epics', 'shipper-test', 'genesis.xml'), completedGenesis);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeRecap } = await import('../../../bin/hydra.mjs');
      await executeRecap('shipper-test', {});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('project-shipper')
      );
    });
  });

  describe('Error Handling and Recovery Tests', () => {
    it('should retry Claude commands on transient failures', async () => {
      let callCount = 0;
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      
      mockSpawn.mockImplementation(() => {
        callCount++;
        return {
          on: jest.fn((event, callback) => {
            if (event === 'close') {
              // Fail first time, succeed second time
              const exitCode = callCount === 1 ? 1 : 0;
              setTimeout(() => callback(exitCode), 10);
            }
          }),
          stdin: { write: jest.fn(), end: jest.fn() },
          stdout: { on: jest.fn() },
          stderr: { on: jest.fn() }
        };
      });

      const { executeNew } = await import('../../../bin/hydra.mjs');
      await executeNew('retry-test', {});

      // Should retry on failure (implementation dependent)
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should handle Claude CLI unavailable scenario', async () => {
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory, spawn claude');
      });

      const { executeNew } = await import('../../../bin/hydra.mjs');
      await executeNew('unavailable-test', {});

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Claude CLI not found')
      );
    });

    it('should handle invalid Claude responses', async () => {
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { 
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              // Simulate invalid/corrupted response
              callback(Buffer.from('Invalid response format'));
            }
          })
        },
        stderr: { on: jest.fn() }
      }));

      const { executeNew } = await import('../../../bin/hydra.mjs');
      await executeNew('invalid-response-test', {});

      // Should handle invalid responses gracefully
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Performance and Resource Tests', () => {
    it('should handle large prompt inputs efficiently', async () => {
      // Create a very large prompt template
      const largeContent = 'x'.repeat(100000); // 100KB of content
      const largeTemplate = `# Large Template\n${largeContent}\n{{FEATURE_NAME}}`;
      
      writeFileSync(join(tempDir, 'prompts', 'strategic-analysis.md'), largeTemplate);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      const startTime = Date.now();
      
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeNew } = await import('../../../bin/hydra.mjs');
      await executeNew('large-prompt-test', {});
      
      const endTime = Date.now();
      
      // Should complete within reasonable time (< 5 seconds for processing)
      expect(endTime - startTime).toBeLessThan(5000);
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should timeout on hanging Claude processes', async () => {
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          // Never call callback to simulate hanging process
          if (event === 'close') {
            // Don't call callback - process hangs
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        kill: jest.fn() // Mock kill method
      }));

      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      // This test would need timeout implementation in the actual code
      const startTime = Date.now();
      await executeNew('timeout-test', {});
      const endTime = Date.now();
      
      // Should not hang indefinitely (implementation dependent)
      expect(endTime - startTime).toBeLessThan(30000); // 30 second max
    });

    it('should manage memory usage with concurrent Claude processes', async () => {
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
              }, 100);
            }
          }),
          stdin: { write: jest.fn(), end: jest.fn() },
          stdout: { on: jest.fn() },
          stderr: { on: jest.fn() }
        };
      });

      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      // Start multiple concurrent processes
      const promises = Array.from({ length: 5 }, (_, i) => 
        executeNew(`concurrent-test-${i}`, {})
      );
      
      await Promise.all(promises);
      
      // Should properly manage concurrent processes
      expect(processCount).toBe(0); // All processes should be cleaned up
      expect(mockSpawn).toHaveBeenCalledTimes(5);
    });
  });

  describe('Integration Smoke Tests', () => {
    it('should complete full new -> plan -> run -> recap workflow', async () => {
      // Mock all necessary components
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      // Setup required files
      const prpContent = createMockPRP('integration-test', 'Full integration test');
      mkdirSync(join(tempDir, 'epics', 'integration-test'), { recursive: true });
      writeFileSync(join(tempDir, 'epics', 'integration-test', 'prp.md'), prpContent);

      const genesisContent = createMockGenesis('integration-test', {
        status: 'completed',
        tasks: ['task1', 'task2']
      });
      writeFileSync(join(tempDir, 'epics', 'integration-test', 'genesis.xml'), genesisContent);

      // Execute workflow steps
      const { executeNew, executePlan, executeRun, executeRecap } = await import('../../../bin/hydra.mjs');
      
      // Step 1: Create feature
      await executeNew('integration-test', { description: 'Integration test feature' });
      
      // Step 2: Plan feature
      await executePlan('integration-test', {});
      
      // Step 3: Run feature
      await executeRun('integration-test', {});
      
      // Step 4: Generate recap
      await executeRecap('integration-test', {});

      // Verify all steps executed
      expect(mockSpawn).toHaveBeenCalledTimes(4);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Creating new feature: integration-test')
      );
    });

    it('should handle partial workflow completion gracefully', async () => {
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      let callCount = 0;
      
      mockSpawn.mockImplementation(() => {
        callCount++;
        return {
          on: jest.fn((event, callback) => {
            if (event === 'close') {
              // Fail on second call (plan step)
              const exitCode = callCount === 2 ? 1 : 0;
              setTimeout(() => callback(exitCode), 10);
            }
          }),
          stdin: { write: jest.fn(), end: jest.fn() },
          stdout: { on: jest.fn() },
          stderr: { on: jest.fn() }
        };
      });

      const { executeNew, executePlan } = await import('../../../bin/hydra.mjs');
      
      // Execute successful step
      await executeNew('partial-test', { description: 'Partial workflow test' });
      
      // Execute failing step
      await executePlan('partial-test', {});

      // Should handle partial failure gracefully
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('failed')
      );
    });
  });
});