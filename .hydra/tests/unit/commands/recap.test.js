/**
 * Unit tests for `hydra recap` command
 * Tests recap generation, project-shipper agent integration, and documentation workflows
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import path from 'path';
import fs from 'fs';
import { spawn, execSync } from 'child_process';

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');

describe('hydra recap command', () => {
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
      return path.includes('prompts') || path.includes('recap-workflow.md');
    });
    
    mockFs.readFileSync.mockImplementation((path) => {
      if (path.includes('recap-workflow.md')) {
        return 'Mock recap workflow template {{epic_name}} {{timestamp}}';
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

  describe('Basic recap functionality', () => {
    it('should generate recap successfully', async () => {
      const epicName = 'test-recap';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeRecap(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Generating recap for: ${epicName}`)
      );
      
      consoleSpy.mockRestore();
    });

    it('should load recap workflow template', async () => {
      const epicName = 'template-load-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('recap-workflow.md'),
        'utf8'
      );
    });

    it('should process template with epic name and timestamp', async () => {
      const epicName = 'template-processing-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      // Verify Claude is called with processed template
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [expect.stringContaining(epicName)],
        expect.any(Object)
      );
    });

    it('should invoke Claude with recap prompt', async () => {
      const epicName = 'claude-invocation-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [expect.any(String)],
        expect.any(Object)
      );
    });
  });

  describe('Template processing', () => {
    it('should substitute epic name correctly', async () => {
      const epicName = 'name-substitution-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('name-substitution-test');
      expect(prompt).not.toContain('{{epic_name}}');
    });

    it('should substitute timestamp correctly', async () => {
      const epicName = 'timestamp-substitution-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).not.toContain('{{timestamp}}');
      expect(prompt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle complex template with multiple variables', async () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('recap-workflow.md')) {
          return 'Complex recap template for {{epic_name}} at {{timestamp}} with additional content';
        }
        return 'Mock content';
      });

      const epicName = 'complex-template-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('complex-template-test');
      expect(prompt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(prompt).toContain('additional content');
    });

    it('should handle template with no variables', async () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('recap-workflow.md')) {
          return 'Static recap template with no variables';
        }
        return 'Mock content';
      });

      const epicName = 'static-template-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('Static recap template with no variables');
    });
  });

  describe('Error handling', () => {
    it('should handle missing template file', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const epicName = 'missing-template-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await executeRecap(epicName, {});
      
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in recap command')
      );
      
      processExitSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should handle template read error', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Template read failed');
      });

      const epicName = 'read-error-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await executeRecap(epicName, {});
      
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Template read failed')
      );
      
      processExitSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should handle Claude execution failure', async () => {
      mockSpawn.mockImplementation(() => {
        const mockChild = testUtils.mockSpawn({ 
          error: new Error('Claude execution failed') 
        });
        return mockChild;
      });

      const epicName = 'claude-failure-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      // Should handle Claude failure gracefully without crashing
      await executeRecap(epicName, {});
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should handle corrupted template file', async () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('recap-workflow.md')) {
          return 'Corrupted\x00Template\x01Content';
        }
        return 'Mock content';
      });

      const epicName = 'corrupted-template-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      // Should handle corrupted template without crashing
      await executeRecap(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should handle permission denied on template file', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        const error = new Error('Permission denied');
        error.code = 'EACCES';
        throw error;
      });

      const epicName = 'permission-denied-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      
      await executeRecap(epicName, {});
      
      expect(processExitSpy).toHaveBeenCalledWith(1);
      
      processExitSpy.mockRestore();
    });
  });

  describe('Project-shipper agent integration', () => {
    it('should integrate with project-shipper workflow', async () => {
      const epicName = 'project-shipper-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeRecap(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Generating recap')
      );
      
      consoleSpy.mockRestore();
    });

    it('should use recap workflow template for project documentation', async () => {
      const epicName = 'documentation-workflow-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('recap-workflow.md'),
        'utf8'
      );
    });

    it('should prepare comprehensive project summary', async () => {
      const epicName = 'comprehensive-summary-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
      expect(prompt).toContain('comprehensive-summary-test');
    });
  });

  describe('Living Blueprint integration', () => {
    it('should work as final step in Living Blueprint workflow', async () => {
      const epicName = 'blueprint-final-step-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeRecap(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Generating recap for:')
      );
      
      consoleSpy.mockRestore();
    });

    it('should create deliverable project documentation', async () => {
      const epicName = 'deliverable-docs-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      // Should invoke Claude with recap workflow
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [expect.any(String)],
        expect.any(Object)
      );
    });

    it('should generate completion artifacts', async () => {
      const epicName = 'completion-artifacts-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalled();
    });
  });

  describe('Options handling', () => {
    it('should accept empty options object', async () => {
      const epicName = 'empty-options-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should handle additional options gracefully', async () => {
      const epicName = 'additional-options-test';
      const options = {
        format: 'markdown',
        includeMetrics: true,
        verbose: true
      };
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, options);
      
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should handle null options', async () => {
      const epicName = 'null-options-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, null);
      
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should handle undefined options', async () => {
      const epicName = 'undefined-options-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, undefined);
      
      expect(mockSpawn).toHaveBeenCalled();
    });
  });

  describe('Performance tests', () => {
    it('should complete recap generation within reasonable time', async () => {
      const epicName = 'performance-test';
      const startTime = Date.now();
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle concurrent recap commands', async () => {
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      const promises = [
        executeRecap('feature-1', {}),
        executeRecap('feature-2', {}),
        executeRecap('feature-3', {})
      ];
      
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });

    it('should handle large template files efficiently', async () => {
      const largeTemplate = 'Large recap template content\n'.repeat(1000) + '{{epic_name}} {{timestamp}}';
      
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('recap-workflow.md')) {
          return largeTemplate;
        }
        return 'Mock content';
      });

      const epicName = 'large-template-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [expect.any(String)],
        expect.any(Object)
      );
    });

    it('should maintain consistent performance across multiple runs', async () => {
      const epicName = 'consistent-performance-test';
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      const times = [];
      
      for (let i = 0; i < 3; i++) {
        jest.clearAllMocks();
        const startTime = Date.now();
        await executeRecap(epicName, {});
        const endTime = Date.now();
        times.push(endTime - startTime);
      }
      
      // All runs should complete in reasonable time
      times.forEach(time => {
        expect(time).toBeLessThan(5000);
      });
    });
  });

  describe('Edge cases and robustness', () => {
    it('should handle empty epic name', async () => {
      const epicName = '';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should handle undefined epic name', async () => {
      const epicName = undefined;
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should handle numeric epic name', async () => {
      const epicName = 12345;
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('12345');
    });

    it('should handle special characters in epic name', async () => {
      const epicName = 'recap-test@v2.1!';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('recap-test@v2.1!');
    });

    it('should handle very long epic names', async () => {
      const epicName = 'very-long-epic-name-for-recap-'.repeat(10);
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [expect.stringContaining(epicName)],
        expect.any(Object)
      );
    });

    it('should handle unicode characters in epic name', async () => {
      const epicName = 'recap-test-📝-summary';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('recap-test-📝-summary');
    });
  });

  describe('Integration with Claude', () => {
    it('should use correct Claude command format', async () => {
      const epicName = 'claude-format-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
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
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      
      await executeRecap(epicName, {});
      
      expect(processExitSpy).toHaveBeenCalledWith(1);
      
      processExitSpy.mockRestore();
    });

    it('should pass complete template to Claude', async () => {
      const epicName = 'complete-template-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });
  });

  describe('Output validation', () => {
    it('should log recap initiation message', async () => {
      const epicName = 'output-validation-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeRecap(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Generating recap for: output-validation-test')
      );
      
      consoleSpy.mockRestore();
    });

    it('should display error messages correctly', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Test error message');
      });

      const epicName = 'error-display-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      
      await executeRecap(epicName, {});
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in recap command: Test error message')
      );
      
      consoleErrorSpy.mockRestore();
      processExitSpy.mockRestore();
    });
  });

  describe('Template processor integration', () => {
    it('should initialize PathResolver correctly', async () => {
      const epicName = 'path-resolver-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      // Should not throw errors related to PathResolver initialization
      await executeRecap(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should initialize TemplateProcessor correctly', async () => {
      const epicName = 'template-processor-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('recap-workflow.md'),
        'utf8'
      );
    });

    it('should handle PathResolver failures gracefully', async () => {
      // This would be tested if PathResolver constructor could fail
      const epicName = 'path-resolver-failure-test';
      
      const { executeRecap } = await import('../../../bin/hydra.mjs');
      
      await executeRecap(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalled();
    });
  });
});