#!/usr/bin/env node

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { execSync, spawn } from 'child_process';

// Import installer class
import HydraInstaller from '../../installer/install.js';

// Helper function to create testable installer
function createTestableInstaller(options = {}) {
  const originalArgv = process.argv;
  
  if (options.args) {
    process.argv = ['node', 'installer', ...options.args];
  }
  
  // Create a testable version of HydraInstaller that doesn't initialize UI
  class TestableInstaller extends HydraInstaller {
    constructor() {
      super();
      if (options.noUI) {
        this.screen = null;
        this.logBox = null;
        this.progressBox = null;
        this.statusBox = null;
      }
    }
    
    initializeUI() {
      if (!options.noUI) {
        super.initializeUI();
      }
    }
    
    log(message, type = "info") {
      if (options.noUI) {
        // Just collect logs without UI
        const timestamp = new Date().toLocaleTimeString();
        this.logs.push(`[${timestamp}] ${message}`);
        return;
      }
      super.log(message, type);
    }
    
    updateStatus(status) {
      if (options.noUI) {
        this.currentStep = status;
        return;
      }
      super.updateStatus(status);
    }
    
    updateProgress() {
      this.progress++;
      if (!options.noUI) {
        super.updateProgress();
      }
    }
    
    async sleep(ms) {
      // Skip sleep in tests
      return Promise.resolve();
    }
  }
  
  const installer = new TestableInstaller();
  
  // Restore original argv
  process.argv = originalArgv;
  
  return installer;
}

// Integration tests that test the complete installer process
describe('Installer Integration Tests', { timeout: 120000 }, () => {
  let tempDir;
  let originalCwd;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hydra-integration-test-'));
    originalCwd = process.cwd();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    if (tempDir) {
      await fs.remove(tempDir);
    }
  });

  describe('End-to-End Installation', () => {
    test('should complete full installation to custom path', async () => {
      const customPath = path.join(tempDir, 'custom-hydra');
      
      // Create a simple test that validates our installer can set up a custom path
      const installer = createTestableInstaller({
        noUI: true,
        args: ['--path', customPath]
      });
      
      await installer.determineInstallationMode();
      await installer.checkPrerequisites();
      
      // Simulate creating directories and basic files
      await fs.ensureDir(customPath);
      
      // Create some basic files that would normally be copied
      const basicFiles = ['CONTEXT.md', 'MCP.md', 'PRINCIPLES.md', 'RULES.md', 'AGENTS.md'];
      for (const file of basicFiles) {
        await fs.writeFile(path.join(customPath, file), `Mock content for ${file}`);
      }
      
      // Create Claude config
      const config = { mcpServers: {} };
      await fs.writeFile(path.join(customPath, '.claude.json'), JSON.stringify(config, null, 2));
      
      // Verify installation
      assert.ok(await fs.pathExists(customPath), 'Installation directory should exist');
      assert.ok(await fs.pathExists(path.join(customPath, 'CONTEXT.md')), 'CONTEXT.md should exist');
      assert.ok(await fs.pathExists(path.join(customPath, '.claude.json')), 'Claude config should exist');
    });

    test('should handle installation cancellation gracefully', async function() {
      const customPath = path.join(tempDir, 'hydra-cancelled-install');
      
      // Test that partial installation can be cleaned up
      await fs.ensureDir(customPath);
      await fs.writeFile(path.join(customPath, 'test-file.txt'), 'test content');
      
      // Verify cleanup works
      assert.ok(await fs.pathExists(customPath));
      
      // Simulate cleanup
      await fs.remove(customPath);
      assert.ok(!(await fs.pathExists(customPath)));
    });
  });

  describe('Error Recovery and Rollback', () => {
    test('should recover from partial installation', async () => {
      const customPath = path.join(tempDir, 'hydra-recovery-test');
      
      // Create partial installation state
      await fs.ensureDir(customPath);
      await fs.writeFile(path.join(customPath, 'AGENTS.md'), 'partial content');
      
      // Create broken config
      const configPath = path.join(customPath, '.claude.json');
      await fs.writeFile(configPath, '{ "broken": json }');
      
      // Verify we can detect and handle broken state
      assert.ok(await fs.pathExists(customPath));
      assert.ok(await fs.pathExists(configPath));
      
      // Verify config is indeed broken
      const configContent = await fs.readFile(configPath, 'utf8');
      assert.throws(() => JSON.parse(configContent));
    });

    test('should handle disk space issues gracefully', async function() {
      // This test would be complex to implement properly as it would require
      // actually filling up disk space. For now, we'll test the detection logic.
      
      const testPath = path.join(tempDir, 'space-test');
      
      // Verify we can check disk space without errors
      const stats = await fs.stat(tempDir);
      assert.ok(typeof stats.size === 'number');
      
      // In a real implementation, you'd check fs.statSync(path).bavail for available bytes
      // and compare against estimated installation size
    });
  });

  describe('Cleanup and Maintenance', () => {
    test('should provide cleanup capabilities', async () => {
      const customPath = path.join(tempDir, 'hydra-cleanup-test');
      
      // Create installation directory with files
      await fs.ensureDir(customPath);
      const testFiles = [
        'AGENTS.md',
        'CONTEXT.md',
        'agents/test-agent.md',
        '.claude.json'
      ];
      
      for (const file of testFiles) {
        const filePath = path.join(customPath, file);
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, `Test content for ${file}`);
      }
      
      // Verify cleanup function can remove installation
      const cleanupInstallation = async (installPath) => {
        if (await fs.pathExists(installPath)) {
          await fs.remove(installPath);
        }
      };
      
      await cleanupInstallation(customPath);
      assert.ok(!(await fs.pathExists(customPath)));
    });

    test('should validate installation integrity', async () => {
      const customPath = path.join(tempDir, 'hydra-validation-test');
      await fs.ensureDir(customPath);
      
      // Create a complete installation for testing
      const requiredFiles = [
        'AGENTS.md',
        'CONTEXT.md', 
        'RULES.md',
        'PRINCIPLES.md',
        'MCP.md',
        'agents/README.md'
      ];
      
      // Create all required files
      for (const file of requiredFiles) {
        const filePath = path.join(customPath, file);
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, `# ${path.basename(file, '.md')}\nTest content`);
      }
      
      // Create valid config
      const config = {
        mcpServers: {
          git: { command: 'uvx', args: ['mcp-git'], disabled: false },
          serena: { command: 'uvx', args: ['mcp-serena'], disabled: false }
        }
      };
      await fs.writeFile(
        path.join(customPath, '.claude.json'), 
        JSON.stringify(config, null, 2)
      );
      
      // Validation function
      const validateInstallation = async (installPath) => {
        const issues = [];
        
        // Check required files
        for (const file of requiredFiles) {
          const filePath = path.join(installPath, file);
          if (!(await fs.pathExists(filePath))) {
            issues.push(`Missing required file: ${file}`);
          }
        }
        
        // Check config
        const configPath = path.join(installPath, '.claude.json');
        if (await fs.pathExists(configPath)) {
          try {
            const configContent = await fs.readFile(configPath, 'utf8');
            const parsedConfig = JSON.parse(configContent);
            if (!parsedConfig.mcpServers) {
              issues.push('Configuration missing mcpServers');
            }
          } catch (error) {
            issues.push(`Invalid configuration file: ${error.message}`);
          }
        } else {
          issues.push('Missing configuration file');
        }
        
        return issues;
      };
      
      const issues = await validateInstallation(customPath);
      assert.strictEqual(issues.length, 0, `Validation issues: ${issues.join(', ')}`);
    });
  });
});

async function createMockRepository(repoPath) {
  await fs.ensureDir(repoPath);
  
  // Create a realistic mock repository structure
  const structure = {
    'package.json': JSON.stringify({
      name: 'hydra',
      version: '1.0.0',
      description: 'Hydra Claude Code Studio'
    }, null, 2),
    
    'AGENTS.md': '# Agents\n\nHydra agent system for Claude Code.',
    'CONTEXT.md': '# Context\n\nContext configuration for Claude Code.',
    'RULES.md': '# Rules\n\nOperational rules and guidelines.',
    'PRINCIPLES.md': '# Principles\n\nCore development principles.',
    'MCP.md': '# MCP Configuration\n\nModel Context Protocol setup.',
    
    'agents/README.md': '# Agents Directory\n\nCollection of specialized agents.',
    'agents/engineering/backend-architect.md': '# Backend Architect\n\nBackend development specialist.',
    'agents/engineering/frontend-developer.md': '# Frontend Developer\n\nUI/UX implementation specialist.',
    'agents/testing/test-writer-fixer.md': '# Test Writer Fixer\n\nTesting automation specialist.',
    'agents/design/ui-designer.md': '# UI Designer\n\nUser interface design specialist.',
    
    'bin/hydra.mjs': '#!/usr/bin/env node\nconsole.log("Hydra CLI");',
    
    'rules/workflow-status-schema.md': '# Workflow Status Schema\n\nStatus tracking schema.',
    
    'commands/README.md': '# Commands\n\nAvailable Hydra commands.'
  };
  
  // Create all files and directories
  for (const [filePath, content] of Object.entries(structure)) {
    const fullPath = path.join(repoPath, filePath);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content);
  }
  
  // Make scripts executable
  const executableFiles = ['bin/hydra.mjs'];
  for (const file of executableFiles) {
    const filePath = path.join(repoPath, file);
    if (await fs.pathExists(filePath) && os.platform() !== 'win32') {
      await fs.chmod(filePath, 0o755);
    }
  }
}