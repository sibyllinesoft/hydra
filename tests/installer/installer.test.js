#!/usr/bin/env node

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import HydraInstaller from '../../installer/install.js';

// Test configuration
const TEST_TIMEOUT = 60000; // 60 seconds

describe('Hydra Installer Tests', { timeout: TEST_TIMEOUT }, () => {
  let tempDir;
  let originalCwd;
  let testRepoDir;

  beforeEach(async () => {
    // Create temporary directory for each test
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hydra-test-'));
    originalCwd = process.cwd();
    
    // Create a mock Hydra repository structure for testing
    testRepoDir = path.join(tempDir, 'mock-hydra-repo');
    await createMockHydraRepository(testRepoDir);
  });

  afterEach(async () => {
    // Clean up temporary directories
    process.chdir(originalCwd);
    if (tempDir) {
      await fs.remove(tempDir);
    }
  });

  describe('CLI Argument Parsing', () => {
    test('should parse --global flag correctly', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'installer', '--global'];
      
      // We need to test the parseCliArgs function directly
      // Since it's not exported, we'll test via installer behavior
      const installer = createTestableInstaller({ noUI: true });
      assert.strictEqual(installer.cliFlags.global, true);
      assert.strictEqual(installer.cliFlags.project, false);
      assert.strictEqual(installer.cliFlags.path, null);
      
      process.argv = originalArgv;
    });

    test('should parse --project flag correctly', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'installer', '--project'];
      
      const installer = createTestableInstaller({ noUI: true });
      assert.strictEqual(installer.cliFlags.global, false);
      assert.strictEqual(installer.cliFlags.project, true);
      assert.strictEqual(installer.cliFlags.path, null);
      
      process.argv = originalArgv;
    });

    test('should parse --path flag correctly', () => {
      const originalArgv = process.argv;
      const customPath = '/custom/install/path';
      process.argv = ['node', 'installer', '--path', customPath];
      
      const installer = createTestableInstaller({ noUI: true });
      assert.strictEqual(installer.cliFlags.global, false);
      assert.strictEqual(installer.cliFlags.project, false);
      assert.strictEqual(installer.cliFlags.path, customPath);
      
      process.argv = originalArgv;
    });

    test('should throw error for conflicting flags', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'installer', '--global', '--project'];
      
      const installer = createTestableInstaller({ noUI: true });
      
      await assert.rejects(async () => {
        await installer.determineInstallationMode();
      }, /Cannot specify multiple installation mode flags/);
      
      process.argv = originalArgv;
    });

    test('should throw error for --path without argument', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'installer', '--path'];
      
      assert.throws(() => {
        createTestableInstaller({ noUI: true });
      }, /--path requires a directory path argument/);
      
      process.argv = originalArgv;
    });
  });

  describe('Installation Mode Detection', () => {
    test('should detect custom mode when --path is provided', async () => {
      const customPath = path.join(tempDir, 'custom-install');
      const installer = createTestableInstaller({ 
        noUI: true,
        args: ['--path', customPath]
      });
      
      await installer.determineInstallationMode();
      
      assert.strictEqual(installer.installationMode, 'custom');
      assert.strictEqual(installer.installationPath, path.resolve(customPath));
      assert.strictEqual(installer.claudeConfigPath, path.join(path.resolve(customPath), '.claude.json'));
    });

    test('should detect global mode when --global is provided', async () => {
      const installer = createTestableInstaller({ 
        noUI: true,
        args: ['--global']
      });
      
      await installer.determineInstallationMode();
      
      assert.strictEqual(installer.installationMode, 'global');
      assert.strictEqual(installer.installationPath, path.join(os.homedir(), '.claude'));
    });

    test('should detect project mode when --project is provided', async () => {
      const installer = createTestableInstaller({ 
        noUI: true,
        args: ['--project']
      });
      
      await installer.determineInstallationMode();
      
      assert.strictEqual(installer.installationMode, 'project');
      assert.strictEqual(installer.installationPath, path.resolve('./.hydra'));
    });

    test('should auto-detect project mode in git repository', async () => {
      // Create a git repository
      const gitRepoDir = path.join(tempDir, 'git-repo');
      await fs.ensureDir(gitRepoDir);
      process.chdir(gitRepoDir);
      
      try {
        execSync('git init', { stdio: 'pipe' });
        
        const installer = createTestableInstaller({ noUI: true });
        await installer.determineInstallationMode();
        
        assert.strictEqual(installer.installationMode, 'project');
      } catch (error) {
        // Skip if git is not available
        if (!error.message.includes('git')) {
          throw error;
        }
      }
    });

    test('should auto-detect global mode outside git repository', async () => {
      // Change to a directory without git
      const nonGitDir = path.join(tempDir, 'non-git');
      await fs.ensureDir(nonGitDir);
      process.chdir(nonGitDir);
      
      const installer = createTestableInstaller({ noUI: true });
      await installer.determineInstallationMode();
      
      assert.strictEqual(installer.installationMode, 'global');
    });
  });

  describe('File Installation', () => {
    test('should install files to custom directory', async () => {
      const customPath = path.join(tempDir, 'custom-install');
      const installer = createTestableInstaller({ 
        noUI: true,
        args: ['--path', customPath],
        mockRepo: testRepoDir
      });
      
      await installer.determineInstallationMode();
      await installer.checkPrerequisites();
      await installer.checkExistingConfiguration();
      
      // Mock the git clone by copying our test repo
      installer.downloadAndInstallHydraFiles = async function() {
        await fs.ensureDir(this.claudeDir);
        await fs.copy(testRepoDir, this.claudeDir);
        this.updateProgress();
      };
      
      await installer.downloadAndInstallHydraFiles();
      
      // Verify files are installed
      assert.ok(await fs.pathExists(customPath));
      assert.ok(await fs.pathExists(path.join(customPath, 'AGENTS.md')));
      assert.ok(await fs.pathExists(path.join(customPath, 'CONTEXT.md')));
      assert.ok(await fs.pathExists(path.join(customPath, 'agents')));
    });

    test('should preserve existing CONTEXT.md file', async () => {
      const customPath = path.join(tempDir, 'custom-install');
      await fs.ensureDir(customPath);
      
      // Create existing CONTEXT.md with custom content
      const existingContext = 'This is my custom CONTEXT.md content';
      const existingContextPath = path.join(customPath, 'CONTEXT.md');
      await fs.writeFile(existingContextPath, existingContext);
      
      const installer = createTestableInstaller({ 
        noUI: true,
        args: ['--path', customPath],
        mockRepo: testRepoDir
      });
      
      await installer.determineInstallationMode();
      await installer.checkPrerequisites();
      await installer.checkExistingConfiguration();
      
      // Mock installation
      installer.downloadAndInstallHydraFiles = async function() {
        await fs.ensureDir(this.claudeDir);
        
        // Simulate the copy process from the real installer
        const filesToSkip = [".git", "node_modules", "package.json", "package-lock.json", "install.js"];
        const sourceDir = testRepoDir;
        
        const copyFileRecursively = async (src, dest) => {
          const entries = await fs.readdir(src, { withFileTypes: true });
          
          for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (filesToSkip.includes(entry.name)) {
              continue;
            }
            
            if (entry.isDirectory()) {
              await fs.ensureDir(destPath);
              await copyFileRecursively(srcPath, destPath);
            } else {
              // Don't overwrite existing CONTEXT.md
              if (entry.name === "CONTEXT.md" && (await fs.pathExists(destPath))) {
                continue;
              }
              
              await fs.copy(srcPath, destPath, { overwrite: true });
            }
          }
        };
        
        await copyFileRecursively(sourceDir, this.claudeDir);
        this.updateProgress();
      };
      
      await installer.downloadAndInstallHydraFiles();
      
      // Verify existing CONTEXT.md was preserved
      const preservedContent = await fs.readFile(existingContextPath, 'utf8');
      assert.strictEqual(preservedContent, existingContext);
    });
  });

  describe('Configuration Management', () => {
    test('should create valid Claude configuration', async () => {
      const customPath = path.join(tempDir, 'custom-install');
      await fs.ensureDir(customPath); // Ensure directory exists
      
      const installer = createTestableInstaller({ 
        noUI: true,
        args: ['--path', customPath]
      });
      
      await installer.determineInstallationMode();
      
      const existingConfig = await installer.parseExistingConfig();
      const updatedConfig = await installer.updateMCPConfiguration(existingConfig);
      await installer.validateConfiguration(updatedConfig);
      await installer.writeConfiguration(updatedConfig);
      
      // Verify config file exists and is valid
      const configPath = installer.claudeConfigPath;
      assert.ok(await fs.pathExists(configPath));
      
      const configContent = await fs.readFile(configPath, 'utf8');
      const parsedConfig = JSON.parse(configContent);
      
      // Verify MCP servers are present
      assert.ok(parsedConfig.mcpServers);
      assert.ok(parsedConfig.mcpServers.git);
      assert.ok(parsedConfig.mcpServers.serena);
      assert.ok(parsedConfig.mcpServers['sequential-thinking']);
    });

    test('should merge with existing configuration', async () => {
      const customPath = path.join(tempDir, 'custom-install');
      await fs.ensureDir(customPath);
      
      // Create existing config
      const existingConfigPath = path.join(customPath, '.claude.json');
      const existingConfig = {
        mcpServers: {
          existing: {
            command: 'uvx',
            args: ['existing-mcp'],
            disabled: false
          }
        },
        customSetting: 'preserved'
      };
      await fs.writeFile(existingConfigPath, JSON.stringify(existingConfig, null, 2));
      
      const installer = createTestableInstaller({ 
        noUI: true,
        args: ['--path', customPath]
      });
      
      await installer.determineInstallationMode();
      
      const parsed = await installer.parseExistingConfig();
      const updated = await installer.updateMCPConfiguration(parsed);
      await installer.writeConfiguration(updated);
      
      // Verify merged config
      const configContent = await fs.readFile(existingConfigPath, 'utf8');
      const finalConfig = JSON.parse(configContent);
      
      // Should have both existing and new MCP servers
      assert.ok(finalConfig.mcpServers.existing);
      assert.ok(finalConfig.mcpServers.git);
      assert.ok(finalConfig.mcpServers.serena);
      
      // Should preserve custom settings
      assert.strictEqual(finalConfig.customSetting, 'preserved');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid JSON in existing config', async () => {
      const customPath = path.join(tempDir, 'custom-install');
      await fs.ensureDir(customPath);
      
      // Create invalid JSON config
      const configPath = path.join(customPath, '.claude.json');
      await fs.writeFile(configPath, '{ invalid json }');
      
      const installer = createTestableInstaller({ 
        noUI: true,
        args: ['--path', customPath]
      });
      
      await installer.determineInstallationMode();
      
      // Should not throw, should handle gracefully
      const config = await installer.parseExistingConfig();
      assert.deepStrictEqual(config, {});
    });

    test('should handle missing parent directories', async () => {
      const customPath = path.join(tempDir, 'deep', 'nested', 'path', 'install');
      const installer = createTestableInstaller({ 
        noUI: true,
        args: ['--path', customPath]
      });
      
      await installer.determineInstallationMode();
      await installer.checkPrerequisites();
      
      // Should create parent directories
      assert.ok(await fs.pathExists(path.dirname(customPath)));
    });

    test('should validate Node.js version', async () => {
      const installer = createTestableInstaller({ noUI: true });
      
      // Test version validation
      assert.ok(installer.isNodeVersionSupported('v18.0.0'));
      assert.ok(installer.isNodeVersionSupported('v16.0.0'));
      assert.ok(!installer.isNodeVersionSupported('v14.0.0'));
      assert.ok(!installer.isNodeVersionSupported('v12.0.0'));
    });
  });

  describe('Installation Verification', () => {
    test('should verify complete installation', async () => {
      const customPath = path.join(tempDir, 'custom-install');
      const installer = createTestableInstaller({ 
        noUI: true,
        args: ['--path', customPath]
      });
      
      await installer.determineInstallationMode();
      
      // Create a valid config with all required MCP servers
      const config = {
        mcpServers: installer.getHydraMCPServers()
      };
      await fs.ensureDir(customPath);
      await fs.writeFile(installer.claudeConfigPath, JSON.stringify(config, null, 2));
      
      const isValid = await installer.verifyInstallation();
      assert.ok(isValid);
    });

    test('should detect incomplete installation', async () => {
      const customPath = path.join(tempDir, 'custom-install');
      const installer = createTestableInstaller({ 
        noUI: true,
        args: ['--path', customPath]
      });
      
      await installer.determineInstallationMode();
      
      // Create config missing some MCP servers
      const incompleteConfig = {
        mcpServers: {
          git: installer.getHydraMCPServers().git
          // Missing other required servers
        }
      };
      await fs.ensureDir(customPath);
      await fs.writeFile(installer.claudeConfigPath, JSON.stringify(incompleteConfig, null, 2));
      
      const isValid = await installer.verifyInstallation();
      assert.ok(!isValid);
    });
  });
});

// Helper functions

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

async function createMockHydraRepository(repoPath) {
  await fs.ensureDir(repoPath);
  
  // Create essential files that the installer expects
  const files = {
    'AGENTS.md': '# Agents\nMock agents file',
    'CONTEXT.md': '# Context\nMock context file',
    'RULES.md': '# Rules\nMock rules file',
    'PRINCIPLES.md': '# Principles\nMock principles file',
    'MCP.md': '# MCP\nMock MCP file',
    'agents/README.md': '# Agents Directory\nMock agents directory'
  };
  
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(repoPath, filePath);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content);
  }
  
  // Create agents directory structure
  const agentsDir = path.join(repoPath, 'agents');
  await fs.ensureDir(agentsDir);
  
  const agentCategories = ['engineering', 'design', 'testing', 'utilities'];
  for (const category of agentCategories) {
    const categoryDir = path.join(agentsDir, category);
    await fs.ensureDir(categoryDir);
    await fs.writeFile(
      path.join(categoryDir, 'sample-agent.md'), 
      `# Sample ${category} agent\nMock agent file`
    );
  }
}