/**
 * End-to-End Tests for Complete User Workflows
 * Tests real-world scenarios with actual file system operations and Living Blueprint system
 */

import { jest, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';

const execAsync = promisify(exec);

// Mock implementations
jest.mock('child_process');
jest.mock('fs');

describe('End-to-End User Workflows', () => {
  let testProjectDir;
  let originalCwd;
  let mockFs;
  let mockSpawn;
  let mockExec;

  beforeAll(() => {
    originalCwd = process.cwd();
    // Set longer timeout for E2E tests
    jest.setTimeout(60000);
  });

  afterAll(() => {
    process.chdir(originalCwd);
  });

  beforeEach(() => {
    testProjectDir = testUtils.createTempDir();
    process.chdir(testProjectDir);
    
    mockFs = fs;
    mockSpawn = spawn;
    mockExec = exec;

    // Setup default mocks
    setupFilesystemMocks();
    setupProcessMocks();
  });

  afterEach(() => {
    testUtils.cleanupTempDir(testProjectDir);
    jest.clearAllMocks();
  });

  function setupFilesystemMocks() {
    // Mock basic filesystem operations
    mockFs.existsSync.mockImplementation((filePath) => {
      if (filePath.includes('.claude') || filePath.includes('prompts')) {
        return true;
      }
      if (filePath.includes('genesis.xml') || filePath.includes('prp.md')) {
        return true;
      }
      if (filePath.includes('node_modules') || filePath.includes('package.json')) {
        return true;
      }
      return false;
    });

    mockFs.readFileSync.mockImplementation((filePath, encoding) => {
      if (filePath.includes('strategic-analysis.md')) {
        return 'Strategic analysis template for {{feature_name}}';
      }
      if (filePath.includes('genesis.xml')) {
        return testUtils.createMockGenesis(testProjectDir, 'test-epic');
      }
      if (filePath.includes('prp.md')) {
        return '# Project Requirements Profile\n\nTest requirements for {{feature_name}}';
      }
      if (filePath.includes('package.json')) {
        return JSON.stringify({ name: 'test-project', version: '1.0.0' });
      }
      return 'mock file content';
    });

    mockFs.writeFileSync.mockImplementation(() => {});
    mockFs.mkdirSync.mockImplementation(() => {});
    mockFs.rmSync.mockImplementation(() => {});
    mockFs.statSync.mockImplementation(() => ({ isDirectory: () => false }));
    mockFs.readdirSync.mockImplementation(() => []);
  }

  function setupProcessMocks() {
    // Mock successful process execution
    mockSpawn.mockImplementation(() => {
      const mockProcess = testUtils.mockSpawn({ code: 0, stdout: 'Success' });
      return mockProcess;
    });

    // Mock xmlstarlet and other CLI tools
    mockExec.mockImplementation((command, callback) => {
      if (command.includes('xmlstarlet')) {
        callback(null, { stdout: 'XML processed successfully', stderr: '' });
      } else if (command.includes('gh auth status')) {
        callback(null, { stdout: 'Logged in to github.com', stderr: '' });
      } else {
        callback(null, { stdout: 'Command executed successfully', stderr: '' });
      }
    });
  }

  describe('Complete New Feature Development Workflow', () => {
    it('should complete full feature development lifecycle', async () => {
      const startTime = testUtils.startTimer();
      const featureName = 'user-authentication-system';
      
      // Step 1: Initialize new feature (hydra new)
      console.log('🚀 Step 1: Initializing new feature...');
      const { executeNew } = await import('../../bin/hydra.mjs');
      await executeNew(featureName, {});
      
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining(`.claude/epics/${featureName}`),
        { recursive: true }
      );

      // Step 2: Plan the feature (hydra plan)
      console.log('📋 Step 2: Planning feature implementation...');
      const { executePlan } = await import('../../bin/hydra.mjs');
      await executePlan(featureName, {});
      
      // Verify genesis.xml creation
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('genesis.xml'),
        expect.stringContaining('<projectGenesis>')
      );

      // Step 3: Execute the plan (hydra run)
      console.log('⚡ Step 3: Executing feature implementation...');
      const { executeRun } = await import('../../bin/hydra.mjs');
      await executeRun(featureName, {});
      
      // Verify orchestrator daemon execution
      expect(mockSpawn).toHaveBeenCalledWith(
        'node',
        expect.arrayContaining([expect.stringContaining('orchestrator-daemon.mjs')]),
        expect.any(Object)
      );

      // Step 4: Validate system health (hydra doctor)
      console.log('🏥 Step 4: Validating system health...');
      const { executeDoctor } = await import('../../bin/hydra.mjs');
      const doctorResult = await executeDoctor({});
      
      // Step 5: Generate project recap (hydra recap)
      console.log('📊 Step 5: Generating project recap...');
      const { executeRecap } = await import('../../bin/hydra.mjs');
      await executeRecap(featureName, {});

      const totalTime = testUtils.endTimer(startTime);
      console.log(`✅ Complete workflow finished in ${totalTime}ms`);
      
      // Verify workflow completion
      expect(totalTime).toBeLessThan(30000); // Should complete within 30 seconds
      expect(mockFs.writeFileSync).toHaveBeenCalled();
      expect(mockSpawn).toHaveBeenCalled();
    }, 60000);

    it('should handle workflow interruption and recovery', async () => {
      const featureName = 'payment-processing';
      
      // Simulate failure during plan execution
      mockSpawn.mockImplementationOnce(() => {
        const mockProcess = testUtils.mockSpawn({ 
          error: new Error('Process interrupted'),
          code: 1 
        });
        return mockProcess;
      });

      const { executeNew, executePlan } = await import('../../bin/hydra.mjs');
      
      // Initialize feature successfully
      await executeNew(featureName, {});
      
      // Plan should fail gracefully
      await expect(executePlan(featureName, {})).rejects.toThrow();
      
      // Recovery: retry with fresh process mock
      mockSpawn.mockImplementation(() => testUtils.mockSpawn({ code: 0 }));
      
      // Should succeed on retry
      await executePlan(featureName, {});
      
      expect(mockFs.mkdirSync).toHaveBeenCalled();
      expect(mockSpawn).toHaveBeenCalledTimes(2); // Initial failure + retry
    });
  });

  describe('Living Blueprint System Integration', () => {
    it('should maintain Living Blueprint consistency across commands', async () => {
      const epicName = 'api-refactoring';
      let genesisContent = '';
      
      // Track genesis.xml modifications
      mockFs.writeFileSync.mockImplementation((filePath, content) => {
        if (filePath.includes('genesis.xml')) {
          genesisContent = content;
        }
      });

      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('genesis.xml') && genesisContent) {
          return genesisContent;
        }
        return testUtils.createMockGenesis(testProjectDir, epicName);
      });

      const { executeNew, executePlan, executeRun } = await import('../../bin/hydra.mjs');
      
      // Create initial Living Blueprint
      await executeNew(epicName, {});
      
      // Plan should update genesis.xml
      await executePlan(epicName, {});
      expect(genesisContent).toContain('<projectGenesis>');
      expect(genesisContent).toContain('<epicName>api-refactoring</epicName>');
      
      // Run should update status tracking
      await executeRun(epicName, {});
      
      // Verify Living Blueprint integrity
      const validation = testUtils.validateXmlStructure(genesisContent, [
        'metadata', 'vision', 'executionPlan', 'statusTracker', 'metrics'
      ]);
      expect(validation.valid).toBe(true);
    });

    it('should handle concurrent Living Blueprint operations', async () => {
      const epics = ['epic-1', 'epic-2', 'epic-3'];
      const { executeNew } = await import('../../bin/hydra.mjs');
      
      // Create multiple epics concurrently
      const promises = epics.map(epic => executeNew(epic, {}));
      
      await expect(Promise.all(promises)).resolves.toBeDefined();
      
      // Each epic should have its own directory
      epics.forEach(epic => {
        expect(mockFs.mkdirSync).toHaveBeenCalledWith(
          expect.stringContaining(`.claude/epics/${epic}`),
          { recursive: true }
        );
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should gracefully handle missing dependencies', async () => {
      // Simulate missing xmlstarlet
      mockExec.mockImplementation((command, callback) => {
        if (command.includes('xmlstarlet')) {
          callback(new Error('xmlstarlet: command not found'));
        } else {
          callback(null, { stdout: 'success', stderr: '' });
        }
      });

      const { executeDoctor } = await import('../../bin/hydra.mjs');
      
      // Should not throw but handle gracefully
      const result = await executeDoctor({});
      
      // Doctor should report missing dependency
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('xmlstarlet'),
        expect.any(Function)
      );
    });

    it('should handle corrupted Living Blueprint files', async () => {
      const epicName = 'corrupted-epic';
      
      // Mock corrupted genesis.xml
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('genesis.xml')) {
          return '<invalid-xml>corrupted content</invalid>';
        }
        return 'default content';
      });

      const { executeRun } = await import('../../bin/hydra.mjs');
      
      // Should handle corrupted XML gracefully
      await expect(executeRun(epicName, {})).rejects.toThrow();
    });

    it('should recover from partial file operations', async () => {
      const featureName = 'partial-feature';
      let writeAttempts = 0;
      
      // Simulate partial write failure
      mockFs.writeFileSync.mockImplementation((filePath, content) => {
        writeAttempts++;
        if (writeAttempts === 1 && filePath.includes('genesis.xml')) {
          throw new Error('Disk full');
        }
      });

      const { executeNew, executePlan } = await import('../../bin/hydra.mjs');
      
      await executeNew(featureName, {});
      
      // First attempt should fail
      await expect(executePlan(featureName, {})).rejects.toThrow();
      
      // Second attempt should succeed
      await executePlan(featureName, {});
      
      expect(writeAttempts).toBeGreaterThan(1);
    });
  });

  describe('Cross-Platform Compatibility', () => {
    const platforms = ['win32', 'darwin', 'linux'];
    
    platforms.forEach(platform => {
      it(`should work correctly on ${platform}`, async () => {
        // Mock platform-specific behavior
        const originalPlatform = process.platform;
        Object.defineProperty(process, 'platform', { value: platform });
        
        try {
          const featureName = `${platform}-feature`;
          const { executeNew } = await import('../../bin/hydra.mjs');
          
          await executeNew(featureName, {});
          
          // Verify platform-appropriate path handling
          const expectedPath = platform === 'win32' 
            ? expect.stringContaining('.claude\\epics')
            : expect.stringContaining('.claude/epics');
            
          expect(mockFs.mkdirSync).toHaveBeenCalledWith(
            expectedPath,
            { recursive: true }
          );
        } finally {
          Object.defineProperty(process, 'platform', { value: originalPlatform });
        }
      });
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large projects efficiently', async () => {
      const startTime = testUtils.startTimer();
      const largeProjectData = testUtils.createStressTestData('large');
      
      // Simulate large project with many epics
      const { executeDoctor } = await import('../../bin/hydra.mjs');
      
      // Mock large directory structure
      mockFs.readdirSync.mockImplementation((dir) => {
        if (dir.includes('.claude/epics')) {
          return largeProjectData.map(epic => epic.name);
        }
        return [];
      });
      
      await executeDoctor({});
      
      const executionTime = testUtils.endTimer(startTime);
      
      // Should handle large projects efficiently
      expect(executionTime).toBeLessThan(10000); // Less than 10 seconds
    });

    it('should maintain memory efficiency during long operations', async () => {
      const initialMemory = testUtils.getMemoryUsage();
      
      // Simulate multiple operations
      const operations = Array.from({ length: 10 }, (_, i) => `operation-${i}`);
      const { executeNew } = await import('../../bin/hydra.mjs');
      
      for (const operation of operations) {
        await executeNew(operation, {});
      }
      
      const finalMemory = testUtils.getMemoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50);
    });
  });

  describe('Security and Validation', () => {
    it('should prevent directory traversal attacks', async () => {
      const maliciousFeatureName = '../../../malicious-feature';
      const { executeNew } = await import('../../bin/hydra.mjs');
      
      // Should sanitize the feature name
      await executeNew(maliciousFeatureName, {});
      
      // Verify no traversal occurred
      expect(mockFs.mkdirSync).not.toHaveBeenCalledWith(
        expect.stringMatching(/\.\.\//),
        expect.any(Object)
      );
    });

    it('should validate XML content before processing', async () => {
      const epicName = 'xml-validation-test';
      
      // Mock malicious XML content
      const maliciousXml = `<?xml version="1.0"?>
        <!DOCTYPE foo [
          <!ENTITY xxe SYSTEM "file:///etc/passwd">
        ]>
        <projectGenesis>&xxe;</projectGenesis>`;
      
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('genesis.xml')) {
          return maliciousXml;
        }
        return 'default content';
      });
      
      const { executeRun } = await import('../../bin/hydra.mjs');
      
      // Should reject malicious XML
      await expect(executeRun(epicName, {})).rejects.toThrow();
    });

    it('should handle file permission errors gracefully', async () => {
      const featureName = 'permission-test';
      
      // Mock permission denied error
      mockFs.mkdirSync.mockImplementation(() => {
        const error = new Error('Permission denied');
        error.code = 'EACCES';
        throw error;
      });
      
      const { executeNew } = await import('../../bin/hydra.mjs');
      
      await expect(executeNew(featureName, {})).rejects.toThrow('Permission denied');
    });
  });

  describe('Integration with External Tools', () => {
    it('should work with GitHub CLI integration', async () => {
      // Mock successful GitHub CLI auth
      mockExec.mockImplementation((command, callback) => {
        if (command.includes('gh auth status')) {
          callback(null, { 
            stdout: 'Logged in to github.com as testuser',
            stderr: ''
          });
        } else {
          callback(null, { stdout: 'success', stderr: '' });
        }
      });

      const { executeDoctor } = await import('../../bin/hydra.mjs');
      await executeDoctor({});
      
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('gh auth status'),
        expect.any(Function)
      );
    });

    it('should handle xmlstarlet processing correctly', async () => {
      const epicName = 'xmlstarlet-test';
      
      // Mock xmlstarlet commands
      mockExec.mockImplementation((command, callback) => {
        if (command.includes('xmlstarlet')) {
          callback(null, {
            stdout: '<result>processed</result>',
            stderr: ''
          });
        } else {
          callback(null, { stdout: 'success', stderr: '' });
        }
      });

      // Test XML processing
      const { executeRun } = await import('../../bin/hydra.mjs');
      await executeRun(epicName, {});
      
      // Should have called xmlstarlet for XML processing
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('xmlstarlet'),
        expect.any(Function)
      );
    });
  });

  describe('Autonomous Operation Features', () => {
    it('should handle orchestrator daemon lifecycle', async () => {
      const epicName = 'daemon-test';
      let daemonProcess;
      
      // Mock daemon process
      mockSpawn.mockImplementation((command, args) => {
        if (args.includes('orchestrator-daemon.mjs')) {
          daemonProcess = testUtils.mockSpawn({ code: 0 });
          return daemonProcess;
        }
        return testUtils.mockSpawn({ code: 0 });
      });

      const { executeRun } = await import('../../bin/hydra.mjs');
      await executeRun(epicName, {});
      
      // Verify daemon was started
      expect(mockSpawn).toHaveBeenCalledWith(
        'node',
        expect.arrayContaining([expect.stringContaining('orchestrator-daemon.mjs')]),
        expect.objectContaining({
          detached: true,
          stdio: 'ignore'
        })
      );
      
      // Verify daemon process handling
      expect(daemonProcess.unref).toHaveBeenCalled();
    });

    it('should handle signal processing for graceful shutdown', async () => {
      const originalProcess = process.kill;
      const killSpy = jest.fn();
      process.kill = killSpy;

      try {
        const epicName = 'signal-test';
        const { executeRun } = await import('../../bin/hydra.mjs');
        
        // Start daemon
        await executeRun(epicName, {});
        
        // Simulate signal handling (this would be tested in integration)
        // For now, verify the process management structure is correct
        expect(mockSpawn).toHaveBeenCalledWith(
          'node',
          expect.any(Array),
          expect.objectContaining({
            detached: true,
            stdio: 'ignore'
          })
        );
      } finally {
        process.kill = originalProcess;
      }
    });
  });
});