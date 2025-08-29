/**
 * Unit tests for `hydra new` command
 * Tests feature creation, PRP generation, and error handling
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import path from 'path';
import fs from 'fs';
import { spawn, execSync } from 'child_process';

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');

describe('hydra new command', () => {
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
      return path.includes('prompts') || path.includes('.claude');
    });
    
    mockFs.mkdirSync.mockImplementation(() => {});
    mockFs.readFileSync.mockImplementation(() => 'Mock template content {{feature_name}}');
    
    // Mock successful Claude execution
    mockSpawn.mockImplementation(() => testUtils.mockSpawn({ code: 0 }));
  });

  afterEach(() => {
    testUtils.cleanupTempDir(tempDir);
    jest.clearAllMocks();
  });

  describe('Valid feature names', () => {
    it('should create epic directory for simple feature name', async () => {
      const featureName = 'user-authentication';
      
      // Mock the executeNew function from hydra.mjs
      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      await executeNew(featureName, {});
      
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('.claude/epics/user-authentication'),
        { recursive: true }
      );
    });

    it('should handle feature names with special characters', async () => {
      const featureName = 'oauth2.0-integration';
      
      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      await executeNew(featureName, {});
      
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('.claude/epics/oauth2.0-integration'),
        { recursive: true }
      );
    });

    it('should handle multi-word feature names', async () => {
      const featureName = 'advanced user dashboard';
      
      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      await executeNew(featureName, {});
      
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('.claude/epics/advanced user dashboard'),
        { recursive: true }
      );
    });
  });

  describe('Template processing', () => {
    it('should load strategic analysis template', async () => {
      const featureName = 'test-feature';
      
      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      await executeNew(featureName, {});
      
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('strategic-analysis.md'),
        'utf8'
      );
    });

    it('should process template variables correctly', async () => {
      const featureName = 'test-feature';
      
      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      await executeNew(featureName, {});
      
      // Verify Claude is called with processed template
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [expect.stringContaining('test-feature')],
        expect.any(Object)
      );
    });

    it('should handle missing template file', async () => {
      mockFs.existsSync.mockReturnValue(false);
      const featureName = 'test-feature';
      
      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      await expect(executeNew(featureName, {})).rejects.toThrow(
        expect.stringContaining('Template not found')
      );
    });
  });

  describe('Claude integration', () => {
    it('should spawn Claude with correct arguments', async () => {
      const featureName = 'api-integration';
      
      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      await executeNew(featureName, {});
      
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [expect.any(String)],
        {
          stdio: ['pipe', 'inherit', 'inherit'],
          shell: false
        }
      );
    });

    it('should handle Claude command not found', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command not found');
      });
      
      const featureName = 'test-feature';
      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      await expect(executeNew(featureName, {})).rejects.toThrow(
        expect.stringContaining('claude command not found')
      );
    });

    it('should handle Claude execution failure', async () => {
      mockSpawn.mockImplementation(() => {
        const mockChild = testUtils.mockSpawn({ error: new Error('Claude failed') });
        return mockChild;
      });
      
      const featureName = 'test-feature';
      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      // Should not throw but log error
      await executeNew(featureName, {});
      expect(mockSpawn).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle invalid feature names', async () => {
      const featureName = ''; // Empty name
      
      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      await expect(executeNew(featureName, {})).rejects.toThrow();
    });

    it('should handle directory creation failure', async () => {
      mockFs.mkdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      const featureName = 'test-feature';
      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      await expect(executeNew(featureName, {})).rejects.toThrow(
        expect.stringContaining('Permission denied')
      );
    });

    it('should handle template read failure', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Template corrupted');
      });
      
      const featureName = 'test-feature';
      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      await expect(executeNew(featureName, {})).rejects.toThrow(
        expect.stringContaining('Template corrupted')
      );
    });
  });

  describe('Directory structure validation', () => {
    it('should create .claude/epics/<feature-name> directory', async () => {
      const featureName = 'user-management';
      
      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      await executeNew(featureName, {});
      
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining(path.join('.claude', 'epics', 'user-management')),
        { recursive: true }
      );
    });

    it('should handle existing epic directory gracefully', async () => {
      const featureName = 'existing-feature';
      
      mockFs.existsSync.mockImplementation((path) => {
        return path.includes('existing-feature') || path.includes('prompts');
      });
      
      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      await executeNew(featureName, {});
      
      // Should not throw error for existing directory
      expect(mockSpawn).toHaveBeenCalled();
    });
  });

  describe('PRP file handling', () => {
    it('should generate correct PRP path in template', async () => {
      const featureName = 'payment-system';
      
      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      await executeNew(featureName, {});
      
      // Verify the PRP path is correctly generated
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [expect.stringContaining('payment-system')],
        expect.any(Object)
      );
    });
  });

  describe('Performance tests', () => {
    it('should complete within reasonable time', async () => {
      const featureName = 'performance-test';
      const startTime = Date.now();
      
      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      await executeNew(featureName, {});
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle concurrent new commands', async () => {
      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      const promises = [
        executeNew('feature-1', {}),
        executeNew('feature-2', {}),
        executeNew('feature-3', {})
      ];
      
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });
  });

  describe('Output validation', () => {
    it('should log expected messages during execution', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const featureName = 'logging-test';
      
      const { executeNew } = await import('../../../bin/hydra.mjs');
      
      await executeNew(featureName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Initiating strategic analysis')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('cofounder agent')
      );
      
      consoleSpy.mockRestore();
    });
  });
});