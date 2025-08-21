#!/usr/bin/env node

console.log('[HYDRA-INSTALLER] Starting Hydra installation...');
console.log('[HYDRA-INSTALLER] Node version:', process.version);
console.log('[HYDRA-INSTALLER] Process argv:', process.argv);
console.log('[HYDRA-INSTALLER] Current working directory:', process.cwd());

import blessed from 'blessed';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import archiver from 'archiver';

const execAsync = promisify(exec);

console.log('[HYDRA-INSTALLER] All imports loaded successfully');

class HydraInstaller {
  constructor() {
    this.screen = null;
    this.logBox = null;
    this.progressBox = null;
    this.statusBox = null;
    this.logs = [];
    this.progress = 0;
    this.totalSteps = 9;
    this.currentStep = '';
    this.errors = [];
    this.warnings = [];
    
    // Installation paths
    this.homeDir = os.homedir();
    this.claudeDir = path.join(this.homeDir, '.claude');
    this.claudeConfigPath = path.join(this.homeDir, '.claude.json');
    this.backupPath = path.join(this.homeDir, `claude-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.zip`);
    
    this.initializeUI();
  }

  initializeUI() {
    // Create screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Hydra Claude Code Studio Installer',
      dockBorders: true,
      fullUnicode: true,
      autoPadding: true
    });

    // Header box with Hydra branding
    const header = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: 5,
      content: this.getHeaderContent(),
      tags: true,
      border: {
        type: 'line',
        fg: 'cyan'
      },
      style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'cyan'
        }
      }
    });

    // Progress box
    this.progressBox = blessed.box({
      label: ' Installation Progress ',
      top: 5,
      left: 0,
      width: '50%',
      height: 8,
      content: this.getProgressContent(),
      tags: true,
      border: {
        type: 'line',
        fg: 'green'
      },
      style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'green'
        }
      }
    });

    // Status box
    this.statusBox = blessed.box({
      label: ' Current Status ',
      top: 5,
      left: '50%',
      width: '50%',
      height: 8,
      content: 'Initializing...',
      tags: true,
      border: {
        type: 'line',
        fg: 'yellow'
      },
      style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'yellow'
        }
      }
    });

    // Log box (scrollable)
    this.logBox = blessed.log({
      label: ' Installation Log ',
      top: 13,
      left: 0,
      width: '100%',
      height: '100%-15',
      scrollable: true,
      alwaysScroll: true,
      mouse: true,
      keys: true,
      tags: true,
      border: {
        type: 'line',
        fg: 'blue'
      },
      style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'blue'
        }
      }
    });

    // Footer with instructions
    const footer = blessed.box({
      bottom: 0,
      left: 0,
      width: '100%',
      height: 2,
      content: '{center}Press Ctrl+C to exit | Use mouse or arrow keys to scroll logs{/center}',
      tags: true,
      style: {
        fg: 'gray',
        bg: 'black'
      }
    });

    // Append all boxes to screen
    this.screen.append(header);
    this.screen.append(this.progressBox);
    this.screen.append(this.statusBox);
    this.screen.append(this.logBox);
    this.screen.append(footer);

    // Key bindings
    this.screen.key(['escape', 'q', 'C-c'], () => {
      this.cleanup();
      return process.exit(0);
    });

    // Enable scrolling in log box
    this.logBox.focus();

    this.screen.render();
  }

  getHeaderContent() {
    return `{center}{bold}{cyan-fg}
╔══════════════════════════════════════════════════════════════╗
║                    🐲 HYDRA CLAUDE STUDIO                    ║
║              Professional AI Development Environment          ║
╚══════════════════════════════════════════════════════════════╝
{/cyan-fg}{/bold}{/center}`;
  }

  getProgressContent() {
    const percentage = Math.round((this.progress / this.totalSteps) * 100);
    const filledBars = Math.round((this.progress / this.totalSteps) * 30);
    const emptyBars = 30 - filledBars;
    
    const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);
    
    return `
{bold}Step ${this.progress}/${this.totalSteps} ({green-fg}${percentage}%{/green-fg}){/bold}

{green-fg}${progressBar}{/green-fg}

{bold}Current:{/bold} ${this.currentStep}

{bold}Status:{/bold}
• {green-fg}✓{/green-fg} Completed: ${this.progress}
• {red-fg}✗{/red-fg} Errors: ${this.errors.length}
• {yellow-fg}⚠{/yellow-fg} Warnings: ${this.warnings.length}`;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    let styledMessage = '';
    
    switch (type) {
      case 'info':
        styledMessage = `{cyan-fg}[${timestamp}]{/cyan-fg} ${message}`;
        break;
      case 'success':
        styledMessage = `{green-fg}[${timestamp}] ✓{/green-fg} ${message}`;
        break;
      case 'warning':
        styledMessage = `{yellow-fg}[${timestamp}] ⚠{/yellow-fg} ${message}`;
        this.warnings.push(message);
        break;
      case 'error':
        styledMessage = `{red-fg}[${timestamp}] ✗{/red-fg} ${message}`;
        this.errors.push(message);
        break;
      case 'step':
        styledMessage = `{bold}{magenta-fg}[${timestamp}] ➤{/magenta-fg}{/bold} ${message}`;
        break;
    }
    
    this.logs.push(styledMessage);
    this.logBox.add(styledMessage);
    this.screen.render();
  }

  updateStatus(status) {
    this.currentStep = status;
    this.statusBox.setContent(status);
    this.screen.render();
  }

  updateProgress() {
    this.progress++;
    this.progressBox.setContent(this.getProgressContent());
    this.screen.render();
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async checkPrerequisites() {
    this.log('Checking system prerequisites...', 'step');
    this.updateStatus('Checking prerequisites');
    
    try {
      // Check Node.js version
      const nodeVersion = process.version;
      this.log(`Node.js version: ${nodeVersion}`, 'info');
      
      if (!this.isNodeVersionSupported(nodeVersion)) {
        throw new Error(`Node.js ${nodeVersion} is not supported. Please upgrade to Node.js 16+`);
      }
      
      // Check if Claude config directory exists
      const claudeDir = path.dirname(this.claudeConfigPath);
      if (!await fs.pathExists(claudeDir)) {
        this.log(`Creating Claude config directory: ${claudeDir}`, 'info');
        await fs.ensureDir(claudeDir);
      }
      
      this.log('Prerequisites check completed successfully', 'success');
      this.updateProgress();
      
    } catch (error) {
      this.log(`Prerequisites check failed: ${error.message}`, 'error');
      throw error;
    }
  }

  isNodeVersionSupported(version) {
    const major = parseInt(version.slice(1).split('.')[0]);
    return major >= 16;
  }

  async backupExistingConfig() {
    this.log('Creating zipped backup of existing configuration...', 'step');
    this.updateStatus('Creating backup archive');
    
    try {
      const hasConfig = await fs.pathExists(this.claudeConfigPath);
      const hasClaudeDir = await fs.pathExists(this.claudeDir);
      
      if (!hasConfig && !hasClaudeDir) {
        this.log('No existing configuration found to backup', 'info');
        this.updateProgress();
        return;
      }

      // Create zip archive
      const archive = archiver('zip', { zlib: { level: 9 } });
      const output = fs.createWriteStream(this.backupPath);
      
      await new Promise((resolve, reject) => {
        output.on('close', resolve);
        archive.on('error', reject);
        
        archive.pipe(output);
        
        // Add .claude.json if it exists
        if (hasConfig) {
          archive.file(this.claudeConfigPath, { name: '.claude.json' });
        }
        
        // Add .claude directory if it exists
        if (hasClaudeDir) {
          archive.directory(this.claudeDir, '.claude');
        }
        
        archive.finalize();
      });
      
      const stats = await fs.stat(this.backupPath);
      const sizeKB = Math.round(stats.size / 1024);
      this.log(`Backup created: ${path.basename(this.backupPath)} (${sizeKB}KB)`, 'success');
      
      this.updateProgress();
      
    } catch (error) {
      this.log(`Backup failed: ${error.message}`, 'warning');
      // Don't throw - backup failure shouldn't stop installation
      this.updateProgress();
    }
  }

  async downloadAndInstallHydraFiles() {
    this.log('Downloading and installing Hydra files...', 'step');
    this.updateStatus('Cloning Hydra repository');
    
    try {
      const tempDir = path.join(os.tmpdir(), 'hydra-install-' + Date.now());
      const claudeDir = path.join(this.homeDir, '.claude');
      
      // Clone the repository
      this.log('Cloning Hydra repository from GitHub...', 'info');
      await execAsync(`git clone --depth 1 https://github.com/sibyllinesoft/hydra.git "${tempDir}"`);
      
      // Ensure .claude directory exists
      await fs.ensureDir(claudeDir);
      
      // Copy all files except .git, node_modules, and package files
      this.log('Installing Hydra files to ~/.claude/...', 'info');
      
      const filesToSkip = ['.git', 'node_modules', 'package.json', 'package-lock.json', 'install.js'];
      const sourceDir = tempDir;
      
      const copyFileRecursively = async (src, dest) => {
        const entries = await fs.readdir(src, { withFileTypes: true });
        
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          
          if (filesToSkip.includes(entry.name)) {
            this.log(`Skipping ${entry.name}`, 'info');
            continue;
          }
          
          if (entry.isDirectory()) {
            await fs.ensureDir(destPath);
            await copyFileRecursively(srcPath, destPath);
          } else {
            // Don't overwrite existing CONTEXT.md or other user customizations
            if (entry.name === 'CONTEXT.md' && await fs.pathExists(destPath)) {
              this.log(`Preserving existing ${entry.name}`, 'info');
              continue;
            }
            
            await fs.copy(srcPath, destPath, { overwrite: true });
            this.log(`Installed ${path.relative(claudeDir, destPath)}`, 'success');
          }
        }
      };
      
      await copyFileRecursively(sourceDir, claudeDir);
      
      // Clean up temp directory
      await fs.remove(tempDir);
      
      this.log('All Hydra files installed successfully', 'success');
      this.updateProgress();
      
    } catch (error) {
      this.log(`Failed to install Hydra files: ${error.message}`, 'error');
      throw new Error(`Installation failed: ${error.message}`);
    }
  }

  async parseExistingConfig() {
    this.log('Parsing existing Claude configuration...', 'step');
    this.updateStatus('Analyzing current config');
    
    try {
      let existingConfig = {};
      
      if (await fs.pathExists(this.claudeConfigPath)) {
        const configContent = await fs.readFile(this.claudeConfigPath, 'utf8');
        try {
          existingConfig = JSON.parse(configContent);
          this.log('Existing configuration parsed successfully', 'success');
        } catch (parseError) {
          this.log(`Invalid JSON in existing config, starting fresh: ${parseError.message}`, 'warning');
          existingConfig = {};
        }
      } else {
        this.log('No existing configuration found, creating new', 'info');
      }
      
      this.updateProgress();
      return existingConfig;
      
    } catch (error) {
      this.log(`Configuration parsing failed: ${error.message}`, 'error');
      throw error;
    }
  }

  getHydraMCPServers() {
    return {
      "git": {
        "command": "uvx",
        "args": ["mcp-git"],
        "disabled": false
      },
      "serena": {
        "command": "uvx", 
        "args": ["mcp-serena"],
        "disabled": false
      },
      "sequential-thinking": {
        "command": "uvx",
        "args": ["mcp-sequential-thinking"],
        "disabled": false
      },
      "context7": {
        "command": "uvx",
        "args": ["mcp-context7"],
        "disabled": false
      },
      "playwright": {
        "command": "uvx",
        "args": ["mcp-playwright"],
        "disabled": false
      },
      "vibe-kanban": {
        "command": "uvx", 
        "args": ["mcp-vibe-kanban"],
        "disabled": false
      },
      "ide": {
        "command": "uvx",
        "args": ["mcp-ide"],
        "disabled": false
      }
    };
  }

  async updateMCPConfiguration(existingConfig) {
    this.log('Updating MCP server configuration...', 'step');
    this.updateStatus('Configuring MCP servers');
    
    try {
      // Ensure mcpServers exists
      if (!existingConfig.mcpServers) {
        existingConfig.mcpServers = {};
        this.log('Created new mcpServers configuration section', 'info');
      }
      
      const hydraMCPs = this.getHydraMCPServers();
      let addedCount = 0;
      let skippedCount = 0;
      
      // Add each Hydra MCP server if not already present
      for (const [name, config] of Object.entries(hydraMCPs)) {
        if (existingConfig.mcpServers[name]) {
          this.log(`MCP server '${name}' already configured, skipping`, 'info');
          skippedCount++;
        } else {
          existingConfig.mcpServers[name] = config;
          this.log(`Added MCP server: ${name}`, 'success');
          addedCount++;
        }
      }
      
      this.log(`MCP configuration complete: ${addedCount} added, ${skippedCount} skipped`, 'success');
      this.updateProgress();
      
      return existingConfig;
      
    } catch (error) {
      this.log(`MCP configuration failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async validateConfiguration(config) {
    this.log('Validating final configuration...', 'step');
    this.updateStatus('Validating configuration');
    
    try {
      // Validate JSON structure
      if (!config || typeof config !== 'object') {
        throw new Error('Configuration must be a valid object');
      }
      
      // Validate MCP servers
      if (config.mcpServers) {
        for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
          if (!serverConfig.command) {
            throw new Error(`MCP server '${name}' missing required 'command' field`);
          }
          if (!Array.isArray(serverConfig.args)) {
            throw new Error(`MCP server '${name}' must have 'args' as an array`);
          }
        }
      }
      
      // Test JSON serialization
      JSON.stringify(config);
      
      this.log('Configuration validation passed', 'success');
      this.updateProgress();
      
      return true;
      
    } catch (error) {
      this.log(`Configuration validation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async writeConfiguration(config) {
    this.log('Writing configuration to disk...', 'step');
    this.updateStatus('Writing configuration');
    
    try {
      const configJSON = JSON.stringify(config, null, 2);
      await fs.writeFile(this.claudeConfigPath, configJSON, 'utf8');
      
      this.log(`Configuration written successfully to: ${this.claudeConfigPath}`, 'success');
      this.updateProgress();
      
    } catch (error) {
      this.log(`Failed to write configuration: ${error.message}`, 'error');
      throw error;
    }
  }

  async installExtras() {
    this.log('Installing extra tools...', 'step');
    this.updateStatus('Installing extras');
    
    try {
      const extrasDir = path.join(this.homeDir, '.claude', 'extras');
      await fs.ensureDir(extrasDir);
      
      const extras = [
        { name: 'claude-statusline', repo: 'https://github.com/ersinkoc/claude-statusline.git', dir: 'statusline' },
        { name: 'claude-code-docs', repo: 'https://github.com/ericbuess/claude-code-docs.git', dir: 'docs' },
        { name: 'claude-code-project-index', repo: 'https://github.com/ericbuess/claude-code-project-index.git', dir: 'project-index' }
      ];
      
      for (const extra of extras) {
        try {
          const targetDir = path.join(extrasDir, extra.dir);
          
          if (await fs.pathExists(targetDir)) {
            this.log(`${extra.name} already installed, skipping`, 'info');
            continue;
          }
          
          this.log(`Installing ${extra.name}...`, 'info');
          await execAsync(`git clone --depth 1 "${extra.repo}" "${targetDir}"`);
          this.log(`✓ ${extra.name} installed`, 'success');
          
        } catch (error) {
          this.log(`Warning: Failed to install ${extra.name}: ${error.message}`, 'warning');
          this.warnings.push(`${extra.name} installation failed`);
        }
      }
      
      this.log('Extra tools installation completed', 'success');
      this.updateProgress();
      
    } catch (error) {
      this.log(`Extras installation failed: ${error.message}`, 'warning');
      this.warnings.push('Some extra tools may not have installed correctly');
      this.updateProgress();
    }
  }

  async verifyInstallation() {
    this.log('Verifying installation...', 'step');
    this.updateStatus('Verifying installation');
    
    try {
      // Check if config file exists and is readable
      if (!await fs.pathExists(this.claudeConfigPath)) {
        throw new Error('Configuration file was not created');
      }
      
      // Verify file is valid JSON
      const configContent = await fs.readFile(this.claudeConfigPath, 'utf8');
      const parsedConfig = JSON.parse(configContent);
      
      // Check Hydra MCP servers are present
      const hydraMCPs = Object.keys(this.getHydraMCPServers());
      const installedMCPs = Object.keys(parsedConfig.mcpServers || {});
      
      let verifiedCount = 0;
      for (const mcpName of hydraMCPs) {
        if (installedMCPs.includes(mcpName)) {
          verifiedCount++;
        }
      }
      
      this.log(`Verification complete: ${verifiedCount}/${hydraMCPs.length} Hydra MCP servers found`, 'success');
      this.updateProgress();
      
      return verifiedCount === hydraMCPs.length;
      
    } catch (error) {
      this.log(`Installation verification failed: ${error.message}`, 'error');
      throw error;
    }
  }

  showCompletionSummary(startTime) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);
    
    this.updateStatus('Installation Complete! 🎉');
    
    this.log('', 'info');
    this.log('╔═══════════════════════════════════════════════╗', 'success');
    this.log('║           INSTALLATION COMPLETE! 🎉          ║', 'success');
    this.log('╚═══════════════════════════════════════════════╝', 'success');
    this.log('', 'info');
    this.log(`✅ Installation completed in ${duration} seconds`, 'success');
    this.log(`✅ Configuration saved to: ${this.claudeConfigPath}`, 'success');
    
    if (this.errors.length === 0) {
      this.log('✅ No errors encountered during installation', 'success');
    } else {
      this.log(`⚠️  ${this.errors.length} errors encountered (see log above)`, 'warning');
    }
    
    if (this.warnings.length > 0) {
      this.log(`⚠️  ${this.warnings.length} warnings (see log above)`, 'warning');
    }
    
    this.log('', 'info');
    this.log('Next Steps:', 'info');
    this.log('1. Restart Claude Code to load new MCP servers', 'info');
    this.log('2. Verify MCP servers are working in Claude', 'info');
    this.log('3. Check the Hydra documentation for usage guides', 'info');
    this.log('', 'info');
    this.log('Press Ctrl+C to exit', 'info');
  }

  async cleanup() {
    if (this.screen) {
      this.screen.destroy();
    }
  }

  async run() {
    console.log('[HYDRA-INSTALLER] HydraInstaller.run() method called');
    const startTime = Date.now();
    
    try {
      console.log('[HYDRA-INSTALLER] Starting installation process...');
      this.log('Starting Hydra Claude Code Studio installation...', 'info');
      this.log('', 'info');
      
      console.log('[HYDRA-INSTALLER] Calling checkPrerequisites...');
      await this.checkPrerequisites();
      await this.sleep(500);
      
      await this.backupExistingConfig();
      await this.sleep(500);
      
      await this.downloadAndInstallHydraFiles();
      await this.sleep(500);
      
      const existingConfig = await this.parseExistingConfig();
      await this.sleep(500);
      
      const updatedConfig = await this.updateMCPConfiguration(existingConfig);
      await this.sleep(500);
      
      await this.validateConfiguration(updatedConfig);
      await this.sleep(500);
      
      await this.writeConfiguration(updatedConfig);
      await this.sleep(500);
      
      await this.installExtras();
      await this.sleep(500);
      
      await this.verifyInstallation();
      await this.sleep(500);
      
      this.showCompletionSummary(startTime);
      
    } catch (error) {
      this.log('', 'error');
      this.log('╔═══════════════════════════════════════════════╗', 'error');
      this.log('║              INSTALLATION FAILED              ║', 'error');
      this.log('╚═══════════════════════════════════════════════╝', 'error');
      this.log('', 'error');
      this.log(`Fatal error: ${error.message}`, 'error');
      this.log('', 'error');
      this.log('Please check the error logs above and try again.', 'error');
      this.log('If the problem persists, please report it as an issue.', 'error');
      this.log('', 'error');
      this.log('Press Ctrl+C to exit', 'error');
      this.updateStatus('Installation Failed ❌');
    }
  }
}

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Main execution
console.log('[HYDRA-INSTALLER] Checking if running as main module...');
console.log('[HYDRA-INSTALLER] import.meta.url:', import.meta.url);
console.log('[HYDRA-INSTALLER] process.argv[1]:', process.argv[1]);
console.log('[HYDRA-INSTALLER] file comparison:', import.meta.url === `file://${process.argv[1]}`);

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('[HYDRA-INSTALLER] Running as main module, starting installer...');
  const installer = new HydraInstaller();
  installer.run().catch(error => {
    console.error('[HYDRA-INSTALLER] Fatal error:', error);
    process.exit(1);
  });
} else {
  console.log('[HYDRA-INSTALLER] Not running as main module, module loaded for import');
}

export default HydraInstaller;