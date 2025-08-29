/**
 * Unit tests for `hydra doctor` command (CRITICAL - NEW FUNCTIONALITY)
 * Tests health diagnostics, auto-fix functionality, and validation
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import path from 'path';
import fs from 'fs';
import { spawn, execSync } from 'child_process';

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');

describe('hydra doctor command', () => {
  let mockFs;
  let mockSpawn;
  let mockExecSync;
  let tempDir;

  beforeEach(() => {
    mockFs = fs;
    mockSpawn = spawn;
    mockExecSync = execSync;
    tempDir = testUtils.createTempDir();
    
    // Default mock implementations
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('mock file content');
    mockFs.writeFileSync.mockImplementation(() => {});
    mockFs.mkdirSync.mockImplementation(() => {});
    
    // Default successful execSync responses
    mockExecSync.mockImplementation((cmd) => {
      if (cmd.includes('gh auth status')) {
        return 'Logged in to github.com as testuser';
      }
      if (cmd.includes('xmlstarlet --version')) {
        return 'xmlstarlet version 1.6.1';
      }
      if (cmd.includes('xmlstarlet val')) {
        return ''; // Valid XML
      }
      if (cmd.includes('xmlstarlet sel')) {
        return 'test-value';
      }
      return '';
    });
  });

  afterEach(() => {
    testUtils.cleanupTempDir(tempDir);
    jest.clearAllMocks();
  });

  describe('Basic health checks', () => {
    it('should run all health checks without flags', async () => {
      const { executeDoctor } = await import('../../../bin/hydra.mjs');
      
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeDoctor({});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Running Hydra Health Diagnostics')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('All systems healthy')
      );
      
      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should check GitHub authentication', async () => {
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const result = await healthChecker.checkAuthentication();
      
      expect(result.status).toBe('OK');
      expect(result.message).toContain('GitHub authentication active');
      expect(mockExecSync).toHaveBeenCalledWith(
        'gh auth status',
        expect.any(Object)
      );
    });

    it('should handle GitHub authentication failure', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('gh auth status')) {
          throw new Error('Not logged in');
        }
        return '';
      });
      
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const result = await healthChecker.checkAuthentication();
      
      expect(result.status).toBe('ERROR');
      expect(result.message).toContain('GitHub CLI not available');
    });
  });

  describe('xmlstarlet dependency check', () => {
    it('should detect xmlstarlet availability', async () => {
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const result = await healthChecker.checkXmlstarlet();
      
      expect(result.status).toBe('OK');
      expect(result.message).toContain('xmlstarlet available');
      expect(mockExecSync).toHaveBeenCalledWith(
        'xmlstarlet --version',
        expect.any(Object)
      );
    });

    it('should handle missing xmlstarlet', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('xmlstarlet')) {
          throw new Error('Command not found');
        }
        return '';
      });
      
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = await healthChecker.checkXmlstarlet();
      
      expect(result.status).toBe('ERROR');
      expect(result.message).toContain('xmlstarlet dependency missing');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Installation Instructions')
      );
      
      consoleSpy.mockRestore();
    });

    it('should provide platform-specific installation instructions', async () => {
      const originalPlatform = process.platform;
      
      mockExecSync.mockImplementation(() => {
        throw new Error('Command not found');
      });
      
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      // Test different platforms
      const testCases = [
        { platform: 'darwin', expected: 'brew install xmlstarlet' },
        { platform: 'linux', expected: 'apt-get install xmlstarlet' },
        { platform: 'win32', expected: 'choco install xmlstarlet' }
      ];
      
      for (const testCase of testCases) {
        Object.defineProperty(process, 'platform', { value: testCase.platform });
        
        const instructions = healthChecker.getXmlstarletInstallInstructions(testCase.platform);
        expect(instructions.join(' ')).toContain(testCase.expected);
      }
      
      // Restore original platform
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });
  });

  describe('Living Blueprint validation', () => {
    it('should validate genesis.xml schema', async () => {
      mockFs.existsSync.mockImplementation((path) => {
        return path.includes('epics') || path.includes('.claude');
      });
      
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('find') && cmd.includes('genesis.xml')) {
          return '/test/epics/test-epic/genesis.xml';
        }
        if (cmd.includes('xmlstarlet val')) {
          return ''; // Valid XML
        }
        if (cmd.includes('xmlstarlet sel')) {
          return 'test-project'; // Mock element values
        }
        return '';
      });
      
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const result = await healthChecker.checkLivingBlueprints(false);
      
      expect(result.status).toBe('OK');
      expect(result.valid).toBeGreaterThan(0);
    });

    it('should detect malformed genesis.xml files', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('find') && cmd.includes('genesis.xml')) {
          return '/test/epics/bad-epic/genesis.xml';
        }
        if (cmd.includes('xmlstarlet val')) {
          throw new Error('XML validation failed');
        }
        return '';
      });
      
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const result = await healthChecker.checkLivingBlueprints(false);
      
      expect(result.status).toBe('WARNING');
      expect(result.invalid).toBeGreaterThan(0);
      expect(result.issues).toContain(expect.stringContaining('XML validation failed'));
    });

    it('should detect missing required elements', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('find') && cmd.includes('genesis.xml')) {
          return '/test/epics/incomplete-epic/genesis.xml';
        }
        if (cmd.includes('xmlstarlet val')) {
          return ''; // Valid XML structure
        }
        if (cmd.includes('xmlstarlet sel') && cmd.includes('projectName')) {
          return ''; // Missing project name
        }
        return 'test-value';
      });
      
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const result = await healthChecker.checkLivingBlueprints(false);
      
      expect(result.status).toBe('WARNING');
      expect(result.invalid).toBeGreaterThan(0);
      expect(result.issues).toContain(expect.stringContaining('Missing elements'));
    });
  });

  describe('Agent integrity validation', () => {
    it('should validate agent YAML frontmatter', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('find') && cmd.includes('.md')) {
          return '/test/agents/test-agent.md';
        }
        return '';
      });
      
      mockFs.readFileSync.mockReturnValue(`---
name: test-agent
role: Test Agent
capabilities:
  - Testing
  - Validation
---

Agent content here.`);
      
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const result = await healthChecker.checkAgentIntegrity(false);
      
      expect(result.status).toBe('OK');
      expect(result.valid).toBeGreaterThan(0);
    });

    it('should detect missing YAML frontmatter', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('find') && cmd.includes('.md')) {
          return '/test/agents/bad-agent.md';
        }
        return '';
      });
      
      mockFs.readFileSync.mockReturnValue('Agent content without frontmatter.');
      
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const result = await healthChecker.checkAgentIntegrity(false);
      
      expect(result.status).toBe('WARNING');
      expect(result.invalid).toBeGreaterThan(0);
      expect(result.issues).toContain(expect.stringContaining('Missing YAML frontmatter'));
    });

    it('should detect missing required YAML fields', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('find') && cmd.includes('.md')) {
          return '/test/agents/incomplete-agent.md';
        }
        return '';
      });
      
      mockFs.readFileSync.mockReturnValue(`---
name: incomplete-agent
# Missing role and capabilities
---

Agent content here.`);
      
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const result = await healthChecker.checkAgentIntegrity(false);
      
      expect(result.status).toBe('WARNING');
      expect(result.invalid).toBeGreaterThan(0);
      expect(result.issues).toContain(expect.stringContaining('Missing YAML fields'));
    });
  });

  describe('Auto-fix functionality', () => {
    it('should enable auto-fix with --auto-fix flag', async () => {
      const { executeDoctor } = await import('../../../bin/hydra.mjs');
      
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeDoctor({ autoFix: true });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Auto-fix Summary')
      );
      
      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should fix missing blueprint elements', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('find') && cmd.includes('genesis.xml')) {
          return '/test/epics/fix-epic/genesis.xml';
        }
        if (cmd.includes('xmlstarlet val')) {
          return ''; // Valid XML structure
        }
        if (cmd.includes('xmlstarlet sel') && cmd.includes('projectName')) {
          return ''; // Missing project name
        }
        return 'test-value';
      });
      
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const result = await healthChecker.checkLivingBlueprints(true);
      
      expect(result.fixed).toBeGreaterThan(0);
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('xmlstarlet ed'),
        expect.any(Object)
      );
    });

    it('should fix missing agent frontmatter', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('find') && cmd.includes('.md')) {
          return '/test/agents/fix-agent.md';
        }
        return '';
      });
      
      mockFs.readFileSync.mockReturnValue('Agent content without frontmatter.');
      
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const result = await healthChecker.checkAgentIntegrity(true);
      
      expect(result.fixed).toBeGreaterThan(0);
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('---\nname:'),
        undefined
      );
    });

    it('should handle auto-fix failures gracefully', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('xmlstarlet ed')) {
          throw new Error('Auto-fix failed');
        }
        if (cmd.includes('find') && cmd.includes('genesis.xml')) {
          return '/test/epics/unfixable-epic/genesis.xml';
        }
        if (cmd.includes('xmlstarlet val')) {
          throw new Error('XML validation failed');
        }
        return '';
      });
      
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = await healthChecker.checkLivingBlueprints(true);
      
      expect(result.fixed).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Auto-fix failed')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('File integrity checks', () => {
    it('should check file integrity against source', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('git clone')) {
          return '';
        }
        if (cmd.includes('diff -qr')) {
          return ''; // No differences
        }
        return '';
      });
      
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const result = await healthChecker.checkFileIntegrity();
      
      expect(result.status).toBe('OK');
      expect(result.missing).toBe(0);
      expect(result.modified).toBe(0);
    });

    it('should detect modified files', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('git clone')) {
          return '';
        }
        if (cmd.includes('diff -qr')) {
          throw new Error('Files differ'); // Files are different
        }
        return '';
      });
      
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const result = await healthChecker.checkFileIntegrity();
      
      expect(result.status).toBe('WARNING');
      expect(result.modified).toBeGreaterThan(0);
    });
  });

  describe('Exit codes and error handling', () => {
    it('should exit with code 1 on critical errors', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Critical error');
      });
      
      const { executeDoctor } = await import('../../../bin/hydra.mjs');
      
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      
      await executeDoctor({});
      
      expect(exitSpy).toHaveBeenCalledWith(1);
      exitSpy.mockRestore();
    });

    it('should exit with code 0 on warnings with auto-fix', async () => {
      // Mock a warning condition that can be auto-fixed
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('find') && cmd.includes('genesis.xml')) {
          return '/test/epics/warning-epic/genesis.xml';
        }
        if (cmd.includes('xmlstarlet sel') && cmd.includes('projectName')) {
          return ''; // Missing element (warning)
        }
        return 'test-value';
      });
      
      const { executeDoctor } = await import('../../../bin/hydra.mjs');
      
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeDoctor({ autoFix: true });
      
      expect(exitSpy).toHaveBeenCalledWith(0);
      
      exitSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('Performance and reliability', () => {
    it('should complete health check within reasonable time', async () => {
      const startTime = Date.now();
      
      const { executeDoctor } = await import('../../../bin/hydra.mjs');
      
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      
      await executeDoctor({});
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(10000); // 10 seconds max
      
      exitSpy.mockRestore();
    });

    it('should handle concurrent doctor commands', async () => {
      const { executeDoctor } = await import('../../../bin/hydra.mjs');
      
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      
      const promises = [
        executeDoctor({}),
        executeDoctor({}),
        executeDoctor({})
      ];
      
      await expect(Promise.all(promises)).resolves.toBeDefined();
      
      exitSpy.mockRestore();
    });

    it('should be memory efficient during health checks', async () => {
      const startMemory = testUtils.getMemoryUsage();
      
      const { executeDoctor } = await import('../../../bin/hydra.mjs');
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      
      await executeDoctor({});
      
      const endMemory = testUtils.getMemoryUsage();
      const memoryGrowth = endMemory.heapUsed - startMemory.heapUsed;
      
      expect(memoryGrowth).toBeMemoryEfficient(50); // Should use less than 50MB
      
      exitSpy.mockRestore();
    });

    it('should handle extremely large project structures efficiently', async () => {
      const stressData = testUtils.createStressTestData('large');
      
      // Mock finding many genesis.xml files
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('find') && cmd.includes('genesis.xml')) {
          return stressData.map((epic, i) => `/test/epics/epic-${i}/genesis.xml`).join('\n');
        }
        if (cmd.includes('xmlstarlet val')) {
          return ''; // All valid
        }
        return 'test-value';
      });
      
      const startTime = testUtils.startTimer();
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const result = await healthChecker.checkLivingBlueprints(false);
      const executionTime = testUtils.endTimer(startTime);
      
      expect(result.total).toBe(stressData.length);
      expect(executionTime).toHaveExecutionTime(30000); // Should complete within 30 seconds
    });
  });

  describe('Security and edge cases', () => {
    it('should sanitize file paths to prevent directory traversal', async () => {
      const maliciousPath = '../../../etc/passwd';
      
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('find') && cmd.includes('genesis.xml')) {
          return `/test/epics/${maliciousPath}/genesis.xml`;
        }
        return '';
      });
      
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const result = await healthChecker.checkLivingBlueprints(false);
      
      // Should not process files outside project directory
      expect(result.invalid).toBeGreaterThan(0);
      expect(result.issues).toContain(expect.stringContaining('security'));
    });

    it('should handle XML bomb attacks gracefully', async () => {
      const xmlBomb = `<?xml version="1.0"?>
<!DOCTYPE lolz [
  <!ENTITY lol "lol">
  <!ENTITY lol2 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
  <!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">
]>
<lolz>&lol3;</lolz>`;
      
      mockFs.readFileSync.mockReturnValue(xmlBomb);
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('find') && cmd.includes('genesis.xml')) {
          return '/test/epics/bomb-epic/genesis.xml';
        }
        if (cmd.includes('xmlstarlet val')) {
          // Simulate timeout due to XML bomb
          throw new Error('Operation timed out');
        }
        return '';
      });
      
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const result = await healthChecker.checkLivingBlueprints(false);
      
      expect(result.status).toBe('WARNING');
      expect(result.invalid).toBeGreaterThan(0);
      expect(result.issues).toContain(expect.stringContaining('timed out'));
    });

    it('should validate file permissions before auto-fixing', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });
      
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('find') && cmd.includes('.md')) {
          return '/test/agents/readonly-agent.md';
        }
        return '';
      });
      
      mockFs.readFileSync.mockReturnValue('Agent without frontmatter');
      
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = await healthChecker.checkAgentIntegrity(true);
      
      expect(result.fixed).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('permission denied')
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle corrupted binary files gracefully', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        // Simulate corrupted binary data
        throw new Error('EISDIR: illegal operation on a directory');
      });
      
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('find') && cmd.includes('.md')) {
          return '/test/agents/corrupted-agent.md';
        }
        return '';
      });
      
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const result = await healthChecker.checkAgentIntegrity(false);
      
      expect(result.status).toBe('WARNING');
      expect(result.invalid).toBeGreaterThan(0);
      expect(result.issues).toContain(expect.stringContaining('EISDIR'));
    });

    it('should validate against command injection in xmlstarlet calls', async () => {
      const maliciousInput = "; rm -rf /; echo ";
      
      mockExecSync.mockImplementation((cmd) => {
        // Ensure command injection is prevented
        expect(cmd).not.toContain('rm -rf');
        expect(cmd).not.toContain(';');
        
        if (cmd.includes('find') && cmd.includes('genesis.xml')) {
          return `/test/epics/injection-test/genesis.xml`;
        }
        return 'safe-output';
      });
      
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      // This should not trigger any injection
      const result = await healthChecker.checkLivingBlueprints(false);
      
      expect(result.status).toBe('OK');
    });
  });

  describe('Comprehensive health reporting', () => {
    it('should generate detailed health report with all metrics', async () => {
      const { executeDoctor } = await import('../../../bin/hydra.mjs');
      
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeDoctor({ verbose: true });
      
      // Verify comprehensive reporting
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Running Hydra Health Diagnostics')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('GitHub Authentication:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('xmlstarlet Dependency:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Living Blueprints:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Agent Integrity:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('File Integrity:')
      );
      
      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should provide actionable recommendations for issues found', async () => {
      // Mock multiple issues
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('gh auth status')) {
          throw new Error('Not authenticated');
        }
        if (cmd.includes('xmlstarlet --version')) {
          throw new Error('Command not found');
        }
        if (cmd.includes('find') && cmd.includes('genesis.xml')) {
          return '/test/epics/broken-epic/genesis.xml';
        }
        if (cmd.includes('xmlstarlet val')) {
          throw new Error('Malformed XML');
        }
        return '';
      });
      
      const { executeDoctor } = await import('../../../bin/hydra.mjs');
      
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeDoctor({});
      
      // Should provide specific recommendations
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('RECOMMENDATIONS:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Run: gh auth login')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Install xmlstarlet')
      );
      
      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should export health report in JSON format when requested', async () => {
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const report = await healthChecker.generateHealthReport();
      
      expect(report).toMatchObject({
        timestamp: expect.any(String),
        status: expect.stringMatching(/^(OK|WARNING|ERROR)$/),
        checks: expect.objectContaining({
          authentication: expect.any(Object),
          xmlstarlet: expect.any(Object),
          livingBlueprints: expect.any(Object),
          agentIntegrity: expect.any(Object),
          fileIntegrity: expect.any(Object)
        }),
        summary: expect.objectContaining({
          totalChecks: expect.any(Number),
          passed: expect.any(Number),
          warnings: expect.any(Number),
          errors: expect.any(Number)
        })
      });
    });
  });

  describe('Recovery and resilience', () => {
    it('should continue health checks even when individual checks fail', async () => {
      let authCheckCalled = false;
      let xmlCheckCalled = false;
      let blueprintCheckCalled = false;
      
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('gh auth status')) {
          authCheckCalled = true;
          throw new Error('Auth failed');
        }
        if (cmd.includes('xmlstarlet --version')) {
          xmlCheckCalled = true;
          return 'xmlstarlet version 1.6.1';
        }
        if (cmd.includes('find') && cmd.includes('genesis.xml')) {
          blueprintCheckCalled = true;
          return '/test/epics/test-epic/genesis.xml';
        }
        return 'test-value';
      });
      
      const { executeDoctor } = await import('../../../bin/hydra.mjs');
      
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeDoctor({});
      
      // All checks should have been attempted
      expect(authCheckCalled).toBe(true);
      expect(xmlCheckCalled).toBe(true);
      expect(blueprintCheckCalled).toBe(true);
      
      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should provide retry mechanism for transient failures', async () => {
      let attemptCount = 0;
      
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('gh auth status')) {
          attemptCount++;
          if (attemptCount < 3) {
            throw new Error('Network timeout');
          }
          return 'Logged in to github.com as testuser';
        }
        return '';
      });
      
      const { HealthChecker } = await import('../../../bin/hydra.mjs');
      const healthChecker = new HealthChecker({ getBasePath: () => '/test' });
      
      const result = await healthChecker.checkAuthentication();
      
      expect(attemptCount).toBe(3); // Should have retried
      expect(result.status).toBe('OK');
    });
  });
});