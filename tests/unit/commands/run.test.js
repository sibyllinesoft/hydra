/**
 * Unit tests for `hydra run` command
 * Tests execution workflow initiation, template processing, and Claude integration
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import path from 'path';
import fs from 'fs';
import { spawn, execSync } from 'child_process';

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');

describe('hydra run command', () => {
  let mockFs;
  let mockSpawn;
  let mockExecSync;
  let tempDir;

  beforeEach(() => {
    mockFs = fs;
    mockSpawn = spawn;
    mockExecSync = execSync;
    tempDir = testUtils.createTempDir();
    
    // Mock fs methods
    mockFs.existsSync.mockImplementation((path) => {
      return path.includes('prompts') || path.includes('execution-workflow.md');
    });
    
    mockFs.readFileSync.mockImplementation((path) => {
      if (path.includes('execution-workflow.md')) {
        return 'Mock execution workflow template {{epic_name}} {{timestamp}}';
      }
      return 'Mock template content';
    });
    
    // Mock successful Claude execution
    mockSpawn.mockImplementation(() => testUtils.mockSpawn({ code: 0 }));
  });

  afterEach(() => {
    testUtils.cleanupTempDir(tempDir);
    jest.clearAllMocks();
  });

  describe('Basic execution workflow', () => {
    it('should initiate execution workflow successfully', async () => {
      const epicName = 'test-execution';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeRun(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Initiating execution workflow for: ${epicName}`)
      );
      
      consoleSpy.mockRestore();
    });

    it('should load execution workflow template', async () => {
      const epicName = 'template-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, {});
      
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('execution-workflow.md'),
        'utf8'
      );
    });

    it('should process template with epic name and timestamp', async () => {
      const epicName = 'variable-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, {});
      
      // Verify Claude is called with processed template
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [expect.stringContaining(epicName)],
        expect.any(Object)
      );
    });

    it('should invoke Claude with execution prompt', async () => {
      const epicName = 'claude-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [expect.any(String)],
        expect.any(Object)
      );
    });
  });

  describe('Template processing', () => {
    it('should substitute epic name in template', async () => {
      const epicName = 'substitution-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('substitution-test');
    });

    it('should include timestamp in template processing', async () => {
      const epicName = 'timestamp-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      // Should contain ISO timestamp format
      expect(prompt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle template with complex variables', async () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('execution-workflow.md')) {
          return 'Complex template: {{epic_name}} at {{timestamp}} with multiple {{variable_test}}';
        }
        return 'Mock content';
      });

      const epicName = 'complex-vars-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [expect.any(String)],
        expect.any(Object)
      );
    });
  });

  describe('Error handling', () => {
    it('should handle missing template file', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const epicName = 'missing-template-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await executeRun(epicName, {});
      
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in run command')
      );
      
      processExitSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should handle template read error', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Template read failed');
      });

      const epicName = 'read-error-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      
      await executeRun(epicName, {});
      
      expect(processExitSpy).toHaveBeenCalledWith(1);
      
      processExitSpy.mockRestore();
    });

    it('should handle Claude execution failure', async () => {
      mockSpawn.mockImplementation(() => {
        const mockChild = testUtils.mockSpawn({ 
          error: new Error('Claude execution failed') 
        });
        return mockChild;
      });

      const epicName = 'claude-failure-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      // Should handle Claude failure gracefully without crashing
      await executeRun(epicName, {});
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should handle empty epic name', async () => {
      const epicName = '';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      // Should process even with empty epic name
      await executeRun(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should handle special characters in epic name', async () => {
      const epicName = 'test-feature@v2.1!';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('test-feature@v2.1!');
    });
  });

  describe('Integration with Claude', () => {
    it('should use correct Claude command format', async () => {
      const epicName = 'claude-command-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [expect.any(String)],
        {
          stdio: ['pipe', 'inherit', 'inherit'],
          shell: false
        }
      );
    });

    it('should handle Claude process spawn failure', async () => {
      mockSpawn.mockImplementation(() => {
        throw new Error('Spawn failed');
      });

      const epicName = 'spawn-failure-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      
      await executeRun(epicName, {});
      
      expect(processExitSpy).toHaveBeenCalledWith(1);
      
      processExitSpy.mockRestore();
    });

    it('should pass complete workflow template to Claude', async () => {
      const epicName = 'complete-template-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });
  });

  describe('Options handling', () => {
    it('should accept empty options object', async () => {
      const epicName = 'empty-options-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should handle options with additional properties', async () => {
      const epicName = 'extended-options-test';
      const options = {
        verbose: true,
        dryRun: false,
        timeout: 30000
      };
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, options);
      
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should handle null options', async () => {
      const epicName = 'null-options-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, null);
      
      expect(mockSpawn).toHaveBeenCalled();
    });
  });

  describe('Performance tests', () => {
    it('should complete execution within reasonable time', async () => {
      const epicName = 'performance-test';
      const startTime = Date.now();
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, {});
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle concurrent run commands', async () => {
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      const promises = [
        executeRun('feature-1', {}),
        executeRun('feature-2', {}),
        executeRun('feature-3', {})
      ];
      
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });

    it('should handle large template files efficiently', async () => {
      const largeTemplate = 'Large template content\n'.repeat(1000) + '{{epic_name}} {{timestamp}}';
      
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('execution-workflow.md')) {
          return largeTemplate;
        }
        return 'Mock content';
      });

      const epicName = 'large-template-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [expect.any(String)],
        expect.any(Object)
      );
    });
  });

  describe('Workflow integration', () => {
    it('should be part of Living Blueprint workflow', async () => {
      const epicName = 'blueprint-workflow-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeRun(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('execution workflow')
      );
      
      consoleSpy.mockRestore();
    });

    it('should follow plan command in workflow sequence', async () => {
      const epicName = 'workflow-sequence-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      // Should execute without requiring specific preconditions
      await executeRun(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should prepare for orchestration and monitoring', async () => {
      const epicName = 'orchestration-prep-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, {});
      
      // Should invoke Claude with execution workflow template
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [expect.any(String)],
        expect.any(Object)
      );
    });
  });

  describe('Template variable validation', () => {
    it('should ensure epic_name variable is properly substituted', async () => {
      const epicName = 'variable-validation-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('variable-validation-test');
      expect(prompt).not.toContain('{{epic_name}}');
    });

    it('should ensure timestamp variable is properly substituted', async () => {
      const epicName = 'timestamp-validation-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).not.toContain('{{timestamp}}');
      expect(prompt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle template with no variables', async () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('execution-workflow.md')) {
          return 'Static template with no variables';
        }
        return 'Mock content';
      });

      const epicName = 'no-variables-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('Static template with no variables');
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined epic name', async () => {
      const epicName = undefined;
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should handle numeric epic name', async () => {
      const epicName = 12345;
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('12345');
    });

    it('should handle very long epic names', async () => {
      const epicName = 'very-long-epic-name-'.repeat(20);
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [expect.stringContaining(epicName)],
        expect.any(Object)
      );
    });

    it('should handle epic names with unicode characters', async () => {
      const epicName = 'test-epic-🚀-feature';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      await executeRun(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('test-epic-🚀-feature');
    });
  });

  describe('Output validation', () => {
    it('should log execution initiation message', async () => {
      const epicName = 'output-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeRun(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Initiating execution workflow for: output-test')
      );
      
      consoleSpy.mockRestore();
    });

    it('should display error message on failure', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Simulated failure');
      });

      const epicName = 'error-output-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      
      await executeRun(epicName, {});
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in run command: Simulated failure')
      );
      
      consoleErrorSpy.mockRestore();
      processExitSpy.mockRestore();
    });
  });

  describe('Reliability tests', () => {
    it('should handle template processor errors gracefully', async () => {
      // Mock PathResolver or TemplateProcessor failure
      mockFs.existsSync.mockReturnValue(false);

      const epicName = 'processor-error-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      
      await executeRun(epicName, {});
      
      expect(processExitSpy).toHaveBeenCalledWith(1);
      
      processExitSpy.mockRestore();
    });

    it('should maintain consistent behavior across multiple runs', async () => {
      const epicName = 'consistency-test';
      
      const { executeRun } = await import('../../../bin/hydra.mjs');
      
      const results = [];
      
      for (let i = 0; i < 3; i++) {
        jest.clearAllMocks();
        await executeRun(epicName, {});
        results.push(mockSpawn.mock.calls.length);
      }
      
      // All runs should have same number of Claude invocations
      expect(results.every(r => r === results[0])).toBe(true);
    });
  });
});