/**
 * Unit tests for `hydra plan` command
 * Tests PRP processing, Genesis.xml generation, and plan-generator agent integration
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import path from 'path';
import fs from 'fs';
import { spawn, execSync } from 'child_process';

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');

describe('hydra plan command', () => {
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
      return path.includes('prompts') || path.includes('.claude') || path.includes('prp.md');
    });
    
    mockFs.mkdirSync.mockImplementation(() => {});
    mockFs.readFileSync.mockImplementation((path) => {
      if (path.includes('prp.md')) {
        return 'Mock PRP content with strategic brief';
      }
      if (path.includes('plan-generation.md')) {
        return 'Mock plan generation template {{epic_name}} {{strategic_brief_path}}';
      }
      return 'Mock template content';
    });
    
    mockFs.writeFileSync.mockImplementation(() => {});
    
    // Mock successful Claude execution
    mockSpawn.mockImplementation(() => testUtils.mockSpawn({ code: 0 }));
  });

  afterEach(() => {
    testUtils.cleanupTempDir(tempDir);
    jest.clearAllMocks();
  });

  describe('Valid PRP input processing', () => {
    it('should successfully process existing PRP file', async () => {
      const epicName = 'test-feature';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePlan(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Generating detailed execution plan for: ${epicName}`)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Product Requirement Prompt (PRP):')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('plan-generator agent')
      );
      
      consoleSpy.mockRestore();
    });

    it('should verify PRP file path construction', async () => {
      const epicName = 'api-enhancement';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      await executePlan(epicName, {});
      
      expect(mockFs.existsSync).toHaveBeenCalledWith(
        expect.stringContaining(path.join('.claude', 'epics', 'api-enhancement', 'prp.md'))
      );
    });

    it('should read PRP content for template processing', async () => {
      const epicName = 'user-dashboard';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      await executePlan(epicName, {});
      
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('plan-generation.md'),
        'utf8'
      );
    });
  });

  describe('Missing PRP file handling', () => {
    it('should exit with error when PRP file missing', async () => {
      mockFs.existsSync.mockImplementation((path) => {
        return path.includes('prompts') || (path.includes('.claude') && !path.includes('prp.md'));
      });

      const epicName = 'missing-prp-feature';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      
      await executePlan(epicName, {});
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Product Requirement Prompt (PRP) not found')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
      
      consoleErrorSpy.mockRestore();
      processExitSpy.mockRestore();
    });

    it('should provide helpful tip for missing PRP', async () => {
      mockFs.existsSync.mockImplementation((path) => {
        return path.includes('prompts') && !path.includes('prp.md');
      });

      const epicName = 'no-prp-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      
      await executePlan(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Run 'hydra new ${epicName}' first`)
      );
      
      consoleSpy.mockRestore();
      processExitSpy.mockRestore();
    });

    it('should handle non-existent epic directory gracefully', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const epicName = 'nonexistent-epic';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      
      await executePlan(epicName, {});
      
      expect(processExitSpy).toHaveBeenCalledWith(1);
      
      processExitSpy.mockRestore();
    });
  });

  describe('Corrupted PRP file scenarios', () => {
    it('should handle PRP file read errors', async () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('prp.md')) {
          throw new Error('Corrupted PRP file');
        }
        return 'Mock template content';
      });

      const epicName = 'corrupted-prp-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      
      await executePlan(epicName, {});
      
      expect(processExitSpy).toHaveBeenCalledWith(1);
      
      processExitSpy.mockRestore();
    });

    it('should handle empty PRP files', async () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('prp.md')) {
          return '';
        }
        if (path.includes('plan-generation.md')) {
          return 'Template with {{epic_name}}';
        }
        return 'Mock content';
      });

      const epicName = 'empty-prp-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      // Should still proceed with empty PRP
      await executePlan(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should handle invalid PRP format gracefully', async () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('prp.md')) {
          return 'Invalid\x00Binary\x01Content';
        }
        if (path.includes('plan-generation.md')) {
          return 'Template content';
        }
        return 'Mock content';
      });

      const epicName = 'invalid-format-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      // Should handle binary content without crashing
      await executePlan(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalled();
    });
  });

  describe('Genesis.xml generation validation', () => {
    it('should specify correct Genesis.xml output path', async () => {
      const epicName = 'genesis-output-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePlan(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(path.join('.claude', 'epics', epicName, 'genesis.xml'))
      );
      
      consoleSpy.mockRestore();
    });

    it('should warn when Genesis.xml already exists', async () => {
      mockFs.existsSync.mockImplementation((path) => {
        return path.includes('prompts') || path.includes('.claude');
      });

      const epicName = 'existing-genesis-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePlan(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Genesis.xml already exists')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('This will be regenerated from the PRP')
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle Genesis.xml path construction correctly', async () => {
      const epicName = 'path-construction-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      await executePlan(epicName, {});
      
      // Verify path construction via mock calls
      expect(mockFs.existsSync).toHaveBeenCalledWith(
        expect.stringContaining('genesis.xml')
      );
    });
  });

  describe('Plan-generator agent integration', () => {
    it('should load plan generation template correctly', async () => {
      const epicName = 'template-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      await executePlan(epicName, {});
      
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('plan-generation.md'),
        'utf8'
      );
    });

    it('should process template with correct variables', async () => {
      const epicName = 'variable-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      await executePlan(epicName, {});
      
      // Verify Claude is called with processed template containing epic name
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [expect.stringContaining(epicName)],
        expect.any(Object)
      );
    });

    it('should invoke Claude with plan-generator agent', async () => {
      const epicName = 'agent-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePlan(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('plan-generator agent')
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle template processing failures', async () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('plan-generation.md')) {
          throw new Error('Template not found');
        }
        if (path.includes('prp.md')) {
          return 'Valid PRP content';
        }
        return 'Mock content';
      });

      const epicName = 'template-error-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      
      await executePlan(epicName, {});
      
      expect(processExitSpy).toHaveBeenCalledWith(1);
      
      processExitSpy.mockRestore();
    });
  });

  describe('XML schema compliance verification', () => {
    it('should include Genesis.xml output path in template variables', async () => {
      const epicName = 'schema-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      await executePlan(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('genesis.xml');
      expect(prompt).toContain('.claude/epics/schema-test');
    });

    it('should include timestamp in template processing', async () => {
      const epicName = 'timestamp-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      await executePlan(epicName, {});
      
      // Verify template processing includes timestamp
      expect(mockSpawn).toHaveBeenCalled();
      const promptCall = mockSpawn.mock.calls[0];
      expect(promptCall[1][0]).toBeDefined();
    });

    it('should ensure DAG creation specification in prompt', async () => {
      const epicName = 'dag-creation-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePlan(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('detailed DAG creation')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle template file missing', async () => {
      mockFs.existsSync.mockImplementation((path) => {
        return path.includes('prp.md') && !path.includes('plan-generation.md');
      });

      const epicName = 'missing-template-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      
      await executePlan(epicName, {});
      
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
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      // Should handle Claude failure gracefully
      await executePlan(epicName, {});
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should handle permission errors gracefully', async () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('prp.md')) {
          const error = new Error('Permission denied');
          error.code = 'EACCES';
          throw error;
        }
        return 'Mock content';
      });

      const epicName = 'permission-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      
      await executePlan(epicName, {});
      
      expect(processExitSpy).toHaveBeenCalledWith(1);
      
      processExitSpy.mockRestore();
    });
  });

  describe('Integration with workflow', () => {
    it('should prepare for hydra run handoff', async () => {
      const epicName = 'workflow-integration-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePlan(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Genesis Output:')
      );
      
      consoleSpy.mockRestore();
    });

    it('should log epic directory for reference', async () => {
      const epicName = 'directory-ref-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePlan(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Epic Directory:')
      );
      
      consoleSpy.mockRestore();
    });

    it('should indicate Living Blueprint workflow', async () => {
      const epicName = 'blueprint-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePlan(epicName, {});
      
      // Should indicate this is part of Living Blueprint system
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('plan-generator agent')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance and reliability tests', () => {
    it('should complete plan generation within reasonable time', async () => {
      const epicName = 'performance-test';
      const startTime = Date.now();
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      await executePlan(epicName, {});
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle concurrent plan commands', async () => {
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      const promises = [
        executePlan('feature-1', {}),
        executePlan('feature-2', {}),
        executePlan('feature-3', {})
      ];
      
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });

    it('should handle large PRP files', async () => {
      const largePrpContent = 'Large PRP content\n'.repeat(1000);
      
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('prp.md')) {
          return largePrpContent;
        }
        if (path.includes('plan-generation.md')) {
          return 'Template {{epic_name}} {{strategic_brief_path}}';
        }
        return 'Mock content';
      });

      const epicName = 'large-prp-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      await executePlan(epicName, {});
      
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [expect.any(String)],
        expect.any(Object)
      );
    });
  });

  describe('Output validation', () => {
    it('should log all expected stages', async () => {
      const epicName = 'output-validation-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePlan(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Generating detailed execution plan')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Product Requirement Prompt (PRP):')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Genesis Output:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invoking plan-generator agent')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Epic Directory:')
      );
      
      consoleSpy.mockRestore();
    });

    it('should display correct file paths', async () => {
      const epicName = 'file-paths-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePlan(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('.claude/epics/file-paths-test/prp.md')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('.claude/epics/file-paths-test/genesis.xml')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Template variable substitution', () => {
    it('should substitute epic_name correctly', async () => {
      const epicName = 'variable-substitution-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      await executePlan(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('variable-substitution-test');
    });

    it('should substitute strategic_brief_path correctly', async () => {
      const epicName = 'brief-path-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      await executePlan(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('.claude/epics/brief-path-test/prp.md');
    });

    it('should substitute genesis_output_path correctly', async () => {
      const epicName = 'output-path-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      await executePlan(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('.claude/epics/output-path-test/genesis.xml');
    });

    it('should include valid timestamp', async () => {
      const epicName = 'timestamp-validation-test';
      
      const { executePlan } = await import('../../../bin/hydra.mjs');
      
      await executePlan(epicName, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      // Should contain ISO timestamp format
      expect(prompt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});