#!/usr/bin/env node

/**
 * Hydra CLI - Development Lifecycle Orchestrator
 * Seamlessly hands off to Claude Code with dynamic prompt generation
 */

import { Command } from 'commander';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { homedir, tmpdir } from 'os';
import { HydraOrchestrator } from './orchestrator-daemon.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const program = new Command();

// Configuration
const HYDRA_VERSION = '1.0.0';
const CLAUDE_COMMAND = 'claude';

/**
 * Path Resolution - Support both global and project installations
 */
class PathResolver {
  constructor() {
    this.projectRoot = this.findProjectRoot();
    this.isGlobalInstall = !this.projectRoot;
    this.hydraPaths = this.resolveHydraPaths();
  }

  findProjectRoot() {
    let current = process.cwd();
    while (current !== '/') {
      if (existsSync(join(current, '.hydra')) || 
          existsSync(join(current, 'prds')) ||
          existsSync(join(current, 'package.json'))) {
        return current;
      }
      current = dirname(current);
    }
    return null;
  }

  resolveHydraPaths() {
    if (this.projectRoot) {
      // Project installation
      const hydraDirs = [
        join(this.projectRoot, '.hydra'),
        join(this.projectRoot)
      ];
      
      for (const dir of hydraDirs) {
        if (existsSync(join(dir, 'prompts'))) {
          return {
            prompts: join(dir, 'prompts'),
            base: dir
          };
        }
      }
    }

    // Global installation
    const globalPaths = [
      join(homedir(), '.claude', 'hydra'),
      join(__dirname, '..')
    ];

    for (const dir of globalPaths) {
      if (existsSync(join(dir, 'prompts'))) {
        return {
          prompts: join(dir, 'prompts'),
          base: dir
        };
      }
    }

    throw new Error('Hydra installation not found. Run installation first.');
  }

  getPromptsPath() {
    return this.hydraPaths.prompts;
  }

  getBasePath() {
    return this.hydraPaths.base;
  }
}

/**
 * Template Processing Engine
 */
class TemplateProcessor {
  constructor(pathResolver) {
    this.pathResolver = pathResolver;
  }

  loadTemplate(templateName) {
    const templatePath = join(this.pathResolver.getPromptsPath(), templateName);
    
    if (!existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    try {
      return readFileSync(templatePath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to read template ${templateName}: ${error.message}`);
    }
  }

  processTemplate(template, variables = {}) {
    let processed = template;
    
    // Replace template variables
    for (const [key, value] of Object.entries(variables)) {
      const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processed = processed.replace(pattern, value);
    }

    // Check for unresolved variables
    const unresolvedVars = processed.match(/\{\{[^}]+\}\}/g);
    if (unresolvedVars) {
      console.warn(`Warning: Unresolved template variables: ${unresolvedVars.join(', ')}`);
    }

    return processed;
  }
}

/**
 * Claude Integration
 */
class ClaudeIntegrator {
  static checkAvailability() {
    try {
      execSync(`which ${CLAUDE_COMMAND}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  static executeWithPrompt(prompt) {
    if (!this.checkAvailability()) {
      throw new Error(`${CLAUDE_COMMAND} command not found. Please install Claude Code first.`);
    }

    console.log('🚀 Launching Claude Code with generated prompt...\n');
    
    try {
      // Spawn Claude with the prompt as an argument
      // Use stdio: ['pipe', 'inherit', 'inherit'] to handle large prompts
      const claudeProcess = spawn(CLAUDE_COMMAND, [prompt], {
        stdio: ['pipe', 'inherit', 'inherit'],
        shell: false
      });

      claudeProcess.on('error', (error) => {
        console.error(`Failed to launch Claude: ${error.message}`);
        process.exit(1);
      });

      claudeProcess.on('exit', (code) => {
        console.log(`\n✅ Claude session completed with exit code ${code}`);
      });

    } catch (error) {
      throw new Error(`Failed to execute Claude: ${error.message}`);
    }
  }
}

/**
 * Health Check Diagnostics
 */
class HealthChecker {
  constructor(pathResolver) {
    this.pathResolver = pathResolver;
  }

  async runAllChecks(options = {}) {
    console.log('🏥 Running Hydra Health Diagnostics...\n');

    const results = {
      authentication: await this.checkAuthentication(),
      xmlstarlet: await this.checkXmlstarlet(),
      livingBlueprints: await this.checkLivingBlueprints(options.autoFix),
      agentIntegrity: await this.checkAgentIntegrity(options.autoFix),
      localIntegrity: await this.checkLocalIntegrity(),
      fileIntegrity: await this.checkFileIntegrity()
    };

    this.reportResults(results);
    return results;
  }

  async checkAuthentication() {
    console.log('🔐 Checking GitHub Authentication...');
    
    try {
      const output = execSync('gh auth status', { 
        encoding: 'utf8',
        stderr: 'inherit'
      });
      
      if (output.includes('Logged in')) {
        console.log('  ✅ GitHub authentication: OK\n');
        return { status: 'OK', message: 'GitHub authentication active' };
      } else {
        console.log('  ⚠️  GitHub authentication: NOT LOGGED IN\n');
        return { status: 'WARNING', message: 'GitHub authentication required' };
      }
    } catch (error) {
      console.log('  ❌ GitHub CLI not available or authentication failed\n');
      return { status: 'ERROR', message: 'GitHub CLI not available or authentication failed' };
    }
  }

  async checkXmlstarlet() {
    console.log('🔧 Checking xmlstarlet dependency...');
    
    try {
      const output = execSync('xmlstarlet --version', { 
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore']
      });
      
      const version = output.trim().split('\n')[0];
      console.log(`  ✅ xmlstarlet: ${version}\n`);
      return { status: 'OK', message: `xmlstarlet available - ${version}` };
    } catch (error) {
      console.log('  ❌ xmlstarlet not found or not executable\n');
      console.log('  📦 Installation Instructions:');
      
      // Provide platform-specific installation instructions
      const platform = process.platform;
      const instructions = this.getXmlstarletInstallInstructions(platform);
      instructions.forEach(instruction => {
        console.log(`     ${instruction}`);
      });
      console.log('');
      
      return { 
        status: 'ERROR', 
        message: 'xmlstarlet dependency missing - required for Living Blueprint system' 
      };
    }
  }

  getXmlstarletInstallInstructions(platform) {
    switch (platform) {
      case 'darwin': // macOS
        return [
          '🍺 macOS: brew install xmlstarlet',
          '🔄 Alternative: sudo port install xmlstarlet'
        ];
      
      case 'linux':
        return [
          '🐧 Ubuntu/Debian: sudo apt-get install xmlstarlet',
          '🎩 RHEL/CentOS/Fedora: sudo yum install xmlstarlet',
          '📦 Arch Linux: sudo pacman -S xmlstarlet'
        ];
      
      case 'win32': // Windows
        return [
          '🪟 Windows: choco install xmlstarlet',
          '🔄 Alternative: scoop install xmlstarlet',
          '📥 Manual: http://xmlstar.sourceforge.net/download.php'
        ];
      
      default:
        return [
          `🔧 ${platform}: Install via package manager`,
          '📥 Download: http://xmlstar.sourceforge.net/download.php',
          '🔍 Verify: xmlstarlet --version'
        ];
    }
  }

  async checkLocalIntegrity() {
    console.log('📁 Checking Local Project Structure...');
    
    const validateScript = join(this.pathResolver.getBasePath(), 'scripts', 'validate.mjs');
    
    if (!existsSync(validateScript)) {
      console.log('  ⚠️  Validation script not found\n');
      return { status: 'WARNING', message: 'Validation script not available' };
    }

    try {
      execSync(`node ${validateScript}`, { 
        encoding: 'utf8',
        stdio: 'inherit'
      });
      
      console.log('  ✅ Local integrity: OK\n');
      return { status: 'OK', message: 'Project structure validated' };
    } catch (error) {
      console.log('  ❌ Local integrity check failed\n');
      return { status: 'ERROR', message: 'Project structure validation failed' };
    }
  }

  async checkFileIntegrity() {
    console.log('🔍 Checking File Integrity Against Source...');
    
    const tempDir = join(tmpdir(), 'hydra-source-of-truth');
    const userInstallDir = this.pathResolver.getBasePath();
    
    try {
      // Clean up existing temp directory
      if (existsSync(tempDir)) {
        execSync(`rm -rf ${tempDir}`, { stdio: 'ignore' });
      }

      // Clone fresh repository
      console.log('  📥 Cloning source repository...');
      execSync(`git clone https://github.com/sibyllinesoft/hydra.git ${tempDir}`, { 
        stdio: 'ignore' 
      });

      // Compare directories
      const diffResult = this.compareDirectories(tempDir, userInstallDir);
      
      // Clean up
      execSync(`rm -rf ${tempDir}`, { stdio: 'ignore' });
      
      console.log('  ✅ File integrity check completed\n');
      return diffResult;
      
    } catch (error) {
      console.log(`  ❌ File integrity check failed: ${error.message}\n`);
      return { 
        status: 'ERROR', 
        message: `File integrity check failed: ${error.message}`,
        missing: 0,
        modified: 0,
        ok: 0
      };
    }
  }

  compareDirectories(sourceDir, targetDir) {
    const importantDirs = ['prompts', 'agents', 'commands', 'bin'];
    let missing = 0, modified = 0, ok = 0;
    const issues = [];

    for (const dir of importantDirs) {
      const sourcePath = join(sourceDir, dir);
      const targetPath = join(targetDir, dir);

      if (!existsSync(sourcePath)) continue;

      if (!existsSync(targetPath)) {
        missing++;
        issues.push(`[MISSING] ${dir}/`);
        continue;
      }

      try {
        // Use diff to compare directories
        execSync(`diff -qr ${sourcePath} ${targetPath}`, { stdio: 'ignore' });
        ok++;
      } catch {
        modified++;
        issues.push(`[MODIFIED] ${dir}/`);
      }
    }

    return {
      status: missing > 0 || modified > 0 ? 'WARNING' : 'OK',
      message: `Missing: ${missing}, Modified: ${modified}, OK: ${ok}`,
      missing,
      modified,
      ok,
      issues
    };
  }

  async checkLivingBlueprints(autoFix = false) {
    console.log('📋 Checking Living Blueprint Schema Integrity...');
    
    try {
      const epicsDirs = [
        join(process.cwd(), '.claude', 'epics'),
        join(process.cwd(), 'epics')
      ];
      
      let blueprintCount = 0;
      let validCount = 0;
      let invalidCount = 0;
      let fixedCount = 0;
      const issues = [];

      for (const epicsDir of epicsDirs) {
        if (!existsSync(epicsDir)) continue;

        const epics = execSync(`find ${epicsDir} -name "genesis.xml" -type f`, { 
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore']
        }).trim().split('\n').filter(f => f);

        for (const genesisFile of epics) {
          blueprintCount++;
          const epicName = genesisFile.split('/').slice(-2, -1)[0];
          
          // Validate XML structure using xmlstarlet
          try {
            execSync(`xmlstarlet val "${genesisFile}"`, { stdio: 'ignore' });
            
            // Validate required elements exist
            const requiredElements = [
              '/projectGenesis/metadata/projectName',
              '/projectGenesis/metadata/status',
              '/projectGenesis/vision/problemStatement',
              '/projectGenesis/executionPlan/executionDag',
              '/projectGenesis/metrics/progress'
            ];

            let missingElements = [];
            for (const element of requiredElements) {
              try {
                const value = execSync(`xmlstarlet sel -t -v '${element}' "${genesisFile}"`, { 
                  encoding: 'utf8', 
                  stdio: ['ignore', 'pipe', 'ignore'] 
                }).trim();
                if (!value) missingElements.push(element);
              } catch {
                missingElements.push(element);
              }
            }

            if (missingElements.length > 0) {
              invalidCount++;
              issues.push(`[${epicName}] Missing elements: ${missingElements.join(', ')}`);
              
              if (autoFix) {
                // Attempt to fix missing elements with defaults
                let fixed = await this.fixMissingBlueprintElements(genesisFile, missingElements);
                if (fixed) fixedCount++;
              }
            } else {
              validCount++;
            }

          } catch (error) {
            invalidCount++;
            issues.push(`[${epicName}] XML validation failed: ${error.message.split('\n')[0]}`);
            
            if (autoFix) {
              // Attempt to fix malformed XML
              let fixed = await this.fixMalformedXml(genesisFile);
              if (fixed) fixedCount++;
            }
          }
        }
      }

      const status = invalidCount > 0 ? 'WARNING' : blueprintCount > 0 ? 'OK' : 'INFO';
      const message = blueprintCount === 0 
        ? 'No Living Blueprints found' 
        : `${validCount} valid, ${invalidCount} invalid${autoFix ? `, ${fixedCount} auto-fixed` : ''} (${blueprintCount} total)`;

      console.log(`  ${status === 'OK' ? '✅' : status === 'WARNING' ? '⚠️' : 'ℹ️'} Living Blueprints: ${message}\n`);

      return { status, message, valid: validCount, invalid: invalidCount, fixed: fixedCount, issues };

    } catch (error) {
      console.log(`  ❌ Living Blueprint check failed: ${error.message}\n`);
      return { status: 'ERROR', message: `Check failed: ${error.message}`, issues: [] };
    }
  }

  async checkAgentIntegrity(autoFix = false) {
    console.log('🤖 Checking Agent YAML Frontmatter Integrity...');
    
    try {
      const agentDirs = [
        join(this.pathResolver.getBasePath(), 'agents'),
        join(process.cwd(), 'agents')
      ];
      
      let agentCount = 0;
      let validCount = 0;
      let invalidCount = 0;
      let fixedCount = 0;
      const issues = [];

      for (const agentsDir of agentDirs) {
        if (!existsSync(agentsDir)) continue;

        const agentFiles = execSync(`find ${agentsDir} -name "*.md" -type f`, { 
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore']
        }).trim().split('\n').filter(f => f);

        for (const agentFile of agentFiles) {
          agentCount++;
          const agentName = agentFile.split('/').pop().replace('.md', '');
          
          try {
            const content = readFileSync(agentFile, 'utf8');
            
            // Check for YAML frontmatter
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
            
            if (!frontmatterMatch) {
              invalidCount++;
              issues.push(`[${agentName}] Missing YAML frontmatter`);
              
              if (autoFix) {
                let fixed = await this.fixMissingFrontmatter(agentFile, agentName);
                if (fixed) fixedCount++;
              }
              continue;
            }

            // Parse and validate YAML
            const yamlContent = frontmatterMatch[1];
            
            // Basic validation - check for required fields
            const requiredFields = ['name', 'role', 'capabilities'];
            let missingFields = [];
            
            for (const field of requiredFields) {
              if (!yamlContent.includes(`${field}:`)) {
                missingFields.push(field);
              }
            }

            if (missingFields.length > 0) {
              invalidCount++;
              issues.push(`[${agentName}] Missing YAML fields: ${missingFields.join(', ')}`);
              
              if (autoFix) {
                let fixed = await this.fixMissingYamlFields(agentFile, missingFields, agentName);
                if (fixed) fixedCount++;
              }
            } else {
              validCount++;
            }

          } catch (error) {
            invalidCount++;
            issues.push(`[${agentName}] Read/parse failed: ${error.message}`);
          }
        }
      }

      const status = invalidCount > 0 ? 'WARNING' : agentCount > 0 ? 'OK' : 'INFO';
      const message = agentCount === 0 
        ? 'No agent files found' 
        : `${validCount} valid, ${invalidCount} invalid${autoFix ? `, ${fixedCount} auto-fixed` : ''} (${agentCount} total)`;

      console.log(`  ${status === 'OK' ? '✅' : status === 'WARNING' ? '⚠️' : 'ℹ️'} Agent Integrity: ${message}\n`);

      return { status, message, valid: validCount, invalid: invalidCount, fixed: fixedCount, issues };

    } catch (error) {
      console.log(`  ❌ Agent integrity check failed: ${error.message}\n`);
      return { status: 'ERROR', message: `Check failed: ${error.message}`, issues: [] };
    }
  }

  async fixMissingBlueprintElements(genesisFile, missingElements) {
    try {
      console.log(`    🔧 Auto-fixing ${genesisFile}...`);
      
      // Add missing elements with default values
      for (const element of missingElements) {
        const parts = element.split('/').filter(p => p);
        if (parts.length < 2) continue;
        
        const elementName = parts[parts.length - 1];
        const parentPath = '/' + parts.slice(0, -1).join('/');
        
        let defaultValue = '';
        switch (elementName) {
          case 'projectName': defaultValue = 'Unknown Project'; break;
          case 'status': defaultValue = 'planning'; break;
          case 'problemStatement': defaultValue = 'Problem statement needs definition'; break;
          case 'totalTasks': defaultValue = '0'; break;
          case 'completedTasks': defaultValue = '0'; break;
          case 'inProgressTasks': defaultValue = '0'; break;
          case 'percentageComplete': defaultValue = '0'; break;
          default: defaultValue = 'AUTO-GENERATED'; break;
        }
        
        // Use xmlstarlet to add the missing element
        execSync(`xmlstarlet ed -L -s "${parentPath}" -t elem -n "${elementName}" -v "${defaultValue}" "${genesisFile}"`, { stdio: 'ignore' });
      }
      
      return true;
    } catch (error) {
      console.log(`    ❌ Auto-fix failed: ${error.message}`);
      return false;
    }
  }

  async fixMalformedXml(genesisFile) {
    try {
      console.log(`    🔧 Attempting XML repair for ${genesisFile}...`);
      // Basic XML repair attempt - backup and try to fix common issues
      const backup = `${genesisFile}.backup.${Date.now()}`;
      execSync(`cp "${genesisFile}" "${backup}"`);
      
      const content = readFileSync(genesisFile, 'utf8');
      
      // Fix common XML issues
      let fixed = content
        .replace(/&(?!amp;|lt;|gt;|quot;|apos;)/g, '&amp;') // Fix unescaped ampersands
        .replace(/<([^>]+)>\s*<\/\1>/g, '<$1/>') // Convert empty elements to self-closing
        .trim();
      
      // Ensure proper XML declaration
      if (!fixed.startsWith('<?xml')) {
        fixed = '<?xml version="1.0" encoding="UTF-8"?>\n' + fixed;
      }
      
      writeFileSync(genesisFile, fixed);
      
      // Test if it's now valid
      execSync(`xmlstarlet val "${genesisFile}"`, { stdio: 'ignore' });
      return true;
    } catch (error) {
      // Restore backup if repair failed
      try {
        const backup = `${genesisFile}.backup.${Date.now()}`;
        if (existsSync(backup)) {
          execSync(`mv "${backup}" "${genesisFile}"`);
        }
      } catch {}
      return false;
    }
  }

  async fixMissingFrontmatter(agentFile, agentName) {
    try {
      console.log(`    🔧 Adding YAML frontmatter to ${agentName}...`);
      
      const content = readFileSync(agentFile, 'utf8');
      const frontmatter = `---
name: ${agentName}
role: ${agentName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
capabilities:
  - Task execution
  - Context analysis
version: 1.0
created: ${new Date().toISOString()}
---

`;
      
      writeFileSync(agentFile, frontmatter + content);
      return true;
    } catch (error) {
      console.log(`    ❌ Frontmatter fix failed: ${error.message}`);
      return false;
    }
  }

  async fixMissingYamlFields(agentFile, missingFields, agentName) {
    try {
      console.log(`    🔧 Adding missing YAML fields to ${agentName}...`);
      
      const content = readFileSync(agentFile, 'utf8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      
      if (!frontmatterMatch) return false;
      
      let yamlContent = frontmatterMatch[1];
      
      // Add missing fields
      for (const field of missingFields) {
        switch (field) {
          case 'name':
            yamlContent += `\nname: ${agentName}`;
            break;
          case 'role':
            yamlContent += `\nrole: ${agentName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
            break;
          case 'capabilities':
            yamlContent += `\ncapabilities:\n  - Task execution\n  - Context analysis`;
            break;
        }
      }
      
      const newContent = content.replace(/^---\n[\s\S]*?\n---/, `---\n${yamlContent}\n---`);
      writeFileSync(agentFile, newContent);
      return true;
    } catch (error) {
      console.log(`    ❌ YAML field fix failed: ${error.message}`);
      return false;
    }
  }

  reportResults(results) {
    console.log('📊 Health Check Summary:');
    console.log('========================');
    
    for (const [check, result] of Object.entries(results)) {
      const icon = result.status === 'OK' ? '✅' : 
                   result.status === 'WARNING' ? '⚠️' : '❌';
      console.log(`${icon} ${check}: ${result.message}`);
      
      if (result.issues && result.issues.length > 0) {
        result.issues.forEach(issue => console.log(`    ${issue}`));
      }
    }
    
    console.log('');
  }
}

/**
 * Command Implementations
 */
async function executeNew(featureName, options) {
  console.log(`🎯 Initiating strategic analysis for: ${featureName}\n`);
  
  try {
    const pathResolver = new PathResolver();
    const templateProcessor = new TemplateProcessor(pathResolver);
    
    // Create epic directory structure
    const epicDir = join(process.cwd(), '.claude', 'epics', featureName);
    if (!existsSync(epicDir)) {
      mkdirSync(epicDir, { recursive: true });
      console.log(`📁 Created epic directory: ${epicDir}`);
    }
    
    // Load and process the strategic analysis template for cofounder
    const template = templateProcessor.loadTemplate('strategic-analysis.md');
    const prpPath = join(epicDir, 'prp.md');
    const prompt = templateProcessor.processTemplate(template, {
      feature_name: featureName,
      epic_name: featureName,
      strategic_brief_path: prpPath,
      timestamp: new Date().toISOString()
    });
    
    console.log(`📋 Product Requirement Prompt (PRP) will be saved to: ${prpPath}`);
    console.log(`🧠 Invoking cofounder agent for strategic analysis...`);
    console.log(`🎯 Goal: Produce structured markdown Product Requirement Prompt (PRP) through Socratic questioning`);
    console.log(`📂 Epic Directory: ${epicDir}\n`);
    
    // Hand off to Claude with cofounder agent - always invoke cofounder for strategic analysis
    ClaudeIntegrator.executeWithPrompt(prompt);
    
  } catch (error) {
    console.error(`❌ Error in new command: ${error.message}`);
    process.exit(1);
  }
}

async function executeRun(epicName, options) {
  try {
    const pathResolver = new PathResolver();
    const templateProcessor = new TemplateProcessor(pathResolver);
    
    console.log(`🚀 Initiating execution workflow for: ${epicName}\n`);
    
    // Load and process the execution template
    const template = templateProcessor.loadTemplate('execution-workflow.md');
    const prompt = templateProcessor.processTemplate(template, {
      epic_name: epicName,
      timestamp: new Date().toISOString()
    });
    
    // Hand off to Claude
    ClaudeIntegrator.executeWithPrompt(prompt);
    
  } catch (error) {
    console.error(`❌ Error in run command: ${error.message}`);
    process.exit(1);
  }
}

async function executeDoctor(options) {
  try {
    const pathResolver = new PathResolver();
    const healthChecker = new HealthChecker(pathResolver);
    
    const results = await healthChecker.runAllChecks({ autoFix: options.autoFix });
    
    // Show auto-fix summary if used
    if (options.autoFix) {
      const fixedCount = Object.values(results)
        .filter(r => r.fixed !== undefined)
        .reduce((sum, r) => sum + r.fixed, 0);
      
      if (fixedCount > 0) {
        console.log(`🔧 Auto-fix Summary: ${fixedCount} issues automatically resolved\n`);
      }
    }
    
    // Determine overall health
    const hasErrors = Object.values(results).some(r => r.status === 'ERROR');
    const hasWarnings = Object.values(results).some(r => r.status === 'WARNING');
    
    if (hasErrors) {
      console.log('🚨 Critical issues detected. Please resolve before proceeding.');
      if (!options.autoFix) {
        console.log('💡 Tip: Run with --auto-fix to attempt automatic resolution');
      }
      process.exit(1);
    } else if (hasWarnings) {
      console.log('⚠️  Some issues detected. System functional but may need attention.');
      if (!options.autoFix) {
        console.log('💡 Tip: Run with --auto-fix to attempt automatic resolution');
      }
      process.exit(0);
    } else {
      console.log('🎉 All systems healthy! Ready for development.');
      process.exit(0);
    }
    
  } catch (error) {
    console.error(`❌ Error in doctor command: ${error.message}`);
    process.exit(1);
  }
}

async function executePlan(epicName, options) {
  console.log(`📋 Generating detailed execution plan for: ${epicName}\n`);
  
  try {
    const pathResolver = new PathResolver();
    const templateProcessor = new TemplateProcessor(pathResolver);
    
    // Check for PRP file
    const epicDir = join(process.cwd(), '.claude', 'epics', epicName);
    const prpPath = join(epicDir, 'prp.md');
    const genesisPath = join(epicDir, 'genesis.xml');
    
    if (!existsSync(prpPath)) {
      console.error(`❌ Product Requirement Prompt (PRP) not found: ${prpPath}`);
      console.log(`💡 Tip: Run 'hydra new ${epicName}' first to create the PRP`);
      process.exit(1);
    }
    
    if (existsSync(genesisPath)) {
      console.log(`⚠️  Genesis.xml already exists at: ${genesisPath}`);
      console.log(`   This will be regenerated from the PRP.`);
    }
    
    console.log(`📖 Product Requirement Prompt (PRP): ${prpPath}`);
    console.log(`🎯 Genesis Output: ${genesisPath}`);
    console.log(`🧠 Invoking plan-generator agent for detailed DAG creation...`);
    console.log(`📂 Epic Directory: ${epicDir}\n`);
    
    // Load and process the plan generation template
    const template = templateProcessor.loadTemplate('plan-generation.md');
    const prompt = templateProcessor.processTemplate(template, {
      epic_name: epicName,
      strategic_brief_path: prpPath,
      genesis_output_path: genesisPath,
      timestamp: new Date().toISOString()
    });
    
    // Hand off to Claude with plan-generator agent
    ClaudeIntegrator.executeWithPrompt(prompt);
    
  } catch (error) {
    console.error(`❌ Error in plan command: ${error.message}`);
    process.exit(1);
  }
}

async function executePmView(epicName, options) {
  console.log(`📊 Viewing project status for: ${epicName}\n`);
  
  try {
    const epicDir = join(process.cwd(), '.claude', 'epics', epicName);
    const genesisPath = join(epicDir, 'genesis.xml');
    
    if (!existsSync(genesisPath)) {
      console.error(`❌ Genesis.xml not found: ${genesisPath}`);
      console.log(`💡 Tip: Run 'hydra plan ${epicName}' first to generate the execution plan`);
      process.exit(1);
    }
    
    console.log(`📄 Reading genesis.xml: ${genesisPath}`);
    console.log(`🔍 Parsing project status and DAG structure...\n`);
    
    // Use xmlstarlet to parse and display key information
    try {
      // Extract project metadata
      const projectName = execSync(`xmlstarlet sel -t -v '/projectGenesis/metadata/projectName' "${genesisPath}"`, { encoding: 'utf8' }).trim();
      const status = execSync(`xmlstarlet sel -t -v '/projectGenesis/metadata/status' "${genesisPath}"`, { encoding: 'utf8' }).trim();
      const lastUpdated = execSync(`xmlstarlet sel -t -v '/projectGenesis/metadata/lastUpdatedAt' "${genesisPath}"`, { encoding: 'utf8' }).trim();
      
      // Extract vision summary
      const problemStatement = execSync(`xmlstarlet sel -t -v '/projectGenesis/vision/problemStatement' "${genesisPath}"`, { encoding: 'utf8' }).trim();
      
      // Extract progress metrics
      const totalTasks = execSync(`xmlstarlet sel -t -v '/projectGenesis/metrics/progress/totalTasks' "${genesisPath}"`, { encoding: 'utf8' }).trim();
      const completedTasks = execSync(`xmlstarlet sel -t -v '/projectGenesis/metrics/progress/completedTasks' "${genesisPath}"`, { encoding: 'utf8' }).trim();
      const inProgressTasks = execSync(`xmlstarlet sel -t -v '/projectGenesis/metrics/progress/inProgressTasks' "${genesisPath}"`, { encoding: 'utf8' }).trim();
      const percentComplete = execSync(`xmlstarlet sel -t -v '/projectGenesis/metrics/progress/percentageComplete' "${genesisPath}"`, { encoding: 'utf8' }).trim();
      
      // Display formatted summary
      console.log('═'.repeat(60));
      console.log(`  📋 PROJECT: ${projectName}`);
      console.log(`  📊 STATUS: ${status.toUpperCase()}`);
      console.log(`  🕐 LAST UPDATED: ${new Date(lastUpdated).toLocaleString()}`);
      console.log('═'.repeat(60));
      console.log();
      
      console.log('🎯 VISION SUMMARY:');
      console.log(`   ${problemStatement}`);
      console.log();
      
      console.log('📈 PROGRESS OVERVIEW:');
      console.log(`   Total Tasks: ${totalTasks}`);
      console.log(`   Completed: ${completedTasks}`);
      console.log(`   In Progress: ${inProgressTasks}`);
      console.log(`   Overall Progress: ${percentComplete}%`);
      console.log();
      
      // Extract and display DAG structure
      console.log('🔄 EXECUTION DAG:');
      const parallelGroups = execSync(`xmlstarlet sel -t -m '/projectGenesis/executionPlan/executionDag/parallelSets/parallelGroup' -v '@level' -o ':' -m 'taskRef' -v '@id' -o ' ' --nl "${genesisPath}"`, { encoding: 'utf8' }).trim();
      
      if (parallelGroups) {
        const levels = parallelGroups.split('\n').reduce((acc, line) => {
          const [level, tasks] = line.split(':');
          if (level && tasks) {
            acc[level] = tasks.trim().split(' ').filter(t => t);
          }
          return acc;
        }, {});
        
        Object.keys(levels).sort().forEach(level => {
          console.log(`   Level ${level}: ${levels[level].join(' → ')}`);
        });
      }
      console.log();
      
      // Display task status breakdown
      console.log('📋 TASK STATUS:');
      const pendingTasks = execSync(`xmlstarlet sel -t -m '/projectGenesis/executionPlan/statusTracker/pending/taskRef' -v '@id' -o ' ' "${genesisPath}"`, { encoding: 'utf8' }).trim();
      const inProgressTasksList = execSync(`xmlstarlet sel -t -m '/projectGenesis/executionPlan/statusTracker/inProgress/taskRef' -v '@id' -o ' ' "${genesisPath}"`, { encoding: 'utf8' }).trim();
      const completedTasksList = execSync(`xmlstarlet sel -t -m '/projectGenesis/executionPlan/statusTracker/completed/taskRef' -v '@id' -o ' ' "${genesisPath}"`, { encoding: 'utf8' }).trim();
      const failedTasks = execSync(`xmlstarlet sel -t -m '/projectGenesis/executionPlan/statusTracker/failed/taskRef' -v '@id' -o ' ' "${genesisPath}"`, { encoding: 'utf8' }).trim();
      
      if (pendingTasks) console.log(`   ⏳ Pending: ${pendingTasks.split(' ').filter(t => t).join(', ')}`);
      if (inProgressTasksList) console.log(`   🔄 In Progress: ${inProgressTasksList.split(' ').filter(t => t).join(', ')}`);
      if (completedTasksList) console.log(`   ✅ Completed: ${completedTasksList.split(' ').filter(t => t).join(', ')}`);
      if (failedTasks) console.log(`   ❌ Failed: ${failedTasks.split(' ').filter(t => t).join(', ')}`);
      
      console.log('═'.repeat(60));
      
    } catch (xmlError) {
      console.error(`❌ Error parsing genesis.xml: ${xmlError.message}`);
      console.log(`💡 The genesis.xml file may be malformed or incomplete.`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`❌ Error in pm view command: ${error.message}`);
    process.exit(1);
  }
}

async function executeEnhance(featureDescription, options) {
  try {
    const pathResolver = new PathResolver();
    const templateProcessor = new TemplateProcessor(pathResolver);
    
    console.log(`🔍 Analyzing codebase for enhancement: ${featureDescription}\n`);
    
    // Create epic directory structure
    const epicName = featureDescription.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const epicDir = join(process.cwd(), '.claude', 'epics', epicName);
    const prpPath = join(epicDir, 'prp.md');
    
    if (!existsSync(epicDir)) {
      mkdirSync(epicDir, { recursive: true });
      console.log(`📁 Created epic directory: ${epicDir}`);
    }
    
    console.log('📊 Invoking code-analyzer to understand existing codebase...');
    
    // Construct prompt for code-analyzer agent
    const prompt = `You are the code-analyzer agent. Task: Perform comprehensive static analysis of the existing codebase to enable intelligent enhancement planning.

**Target Directory**: ${process.cwd()}
**Enhancement Goal**: ${featureDescription}
**Output Location**: Must create synthetic PRP at ${prpPath}

## Your Mission:

1. **Codebase Analysis**: Perform deep static analysis of the current directory:
   - Detect programming languages, frameworks, and tech stack
   - Analyze architectural patterns and project structure
   - Assess code quality, technical debt, and integration points
   - Identify enhancement opportunities and constraints

2. **Synthetic PRP Generation**: Create a comprehensive Product Requirement Prompt (PRP) that combines:
   - Your codebase analysis findings
   - The user's feature description: "${featureDescription}"
   - Integration strategy based on existing patterns
   - Context-aware enhancement recommendations

3. **Save PRP**: Write the synthetic PRP to: ${prpPath}

The PRP should be structured for handoff to plan-generator agent and follow this format:

\`\`\`markdown
# Product Requirement Prompt (PRP): ${featureDescription}

**Created**: [DATE]
**Status**: Synthetic PRP for Brownfield Enhancement
**Source**: Hydra enhance command analysis

## Executive Summary
[Brief overview of enhancement in context of existing codebase]

## Codebase Context  
[Your comprehensive analysis findings]

## Enhancement Requirements
### Feature Description
${featureDescription}

### Integration Strategy
[How to integrate with existing architecture]

### Success Criteria
[Specific criteria based on codebase patterns]

## Next Steps & Handoff
**Recommended Next Action**: \`hydra plan ${epicName}\`
\`\`\`

**Success Criteria**:
- Complete codebase analysis report
- Synthetic PRP saved to ${prpPath}
- Ready for \`hydra plan ${epicName}\` handoff

Focus on understanding the existing codebase well enough to plan intelligent, context-aware enhancements.`;

    console.log(`📋 Synthetic PRP will be saved to: ${prpPath}`);
    console.log(`🧠 Invoking code-analyzer agent for brownfield analysis...`);
    console.log(`🎯 Goal: Analyze existing codebase and generate synthetic PRP`);
    console.log(`📂 Epic Directory: ${epicDir}\n`);
    
    // Hand off to Claude with code-analyzer agent
    ClaudeIntegrator.executeWithPrompt(prompt);
    
  } catch (error) {
    console.error(`❌ Error in enhance command: ${error.message}`);
    process.exit(1);
  }
}

async function executeRecap(epicName, options) {
  try {
    const pathResolver = new PathResolver();
    const templateProcessor = new TemplateProcessor(pathResolver);
    
    console.log(`📝 Generating recap for: ${epicName}\n`);
    
    // Load and process the recap template
    const template = templateProcessor.loadTemplate('recap-workflow.md');
    const prompt = templateProcessor.processTemplate(template, {
      epic_name: epicName,
      timestamp: new Date().toISOString()
    });
    
    // Hand off to Claude
    ClaudeIntegrator.executeWithPrompt(prompt);
    
  } catch (error) {
    console.error(`❌ Error in recap command: ${error.message}`);
    process.exit(1);
  }
}

async function executeOrchestrate(epicName, options) {
  try {
    const pathResolver = new PathResolver();
    
    // Check if genesis.xml exists for this epic
    const genesisPath = join(process.cwd(), '.claude', 'epics', epicName, 'genesis.xml');
    
    if (!existsSync(genesisPath)) {
      console.error(`❌ Genesis file not found: ${genesisPath}`);
      console.log('💡 Run `hydra plan ${epicName}` first to create the execution plan');
      process.exit(1);
    }

    if (options.status) {
      // Show orchestrator status
      console.log('📊 Orchestrator Status');
      console.log('==================');
      
      const logPath = join(process.cwd(), '.claude', 'orchestrator.log');
      if (existsSync(logPath)) {
        console.log('📝 Recent log entries:');
        const logs = readFileSync(logPath, 'utf8').split('\n').filter(Boolean).slice(-10);
        logs.forEach(log => console.log(log));
      } else {
        console.log('📋 No orchestrator log found - daemon may not be running');
      }
      return;
    }

    if (options.stop) {
      console.log('🛑 Stopping orchestrator daemon...');
      console.log('ℹ️  Use Ctrl+C on the running daemon process or kill the process manually');
      console.log('💡 Future enhancement: PID tracking for clean daemon management');
      return;
    }

    // Start the orchestrator
    const intervalMinutes = parseInt(options.interval) || 5;
    const intervalMs = intervalMinutes * 60 * 1000;
    
    console.log(`🤖 Starting Hydra Orchestrator for: ${epicName}`);
    console.log(`📋 Monitoring interval: ${intervalMinutes} minutes`);
    console.log(`📂 Genesis file: ${genesisPath}`);
    console.log('');
    
    if (options.daemon) {
      // Run as background daemon using orchestrator-daemon.mjs
      console.log('🔄 Starting as background daemon...');
      
      const daemonPath = join(__dirname, 'orchestrator-daemon.mjs');
      const daemonProcess = spawn('node', [daemonPath, 'start', epicName], {
        detached: true,
        stdio: ['ignore', 'ignore', 'ignore']
      });
      
      daemonProcess.unref();
      
      console.log(`✅ Orchestrator daemon started with PID: ${daemonProcess.pid}`);
      console.log(`📊 Monitor status with: hydra orchestrate ${epicName} --status`);
      console.log(`🛑 Stop daemon with: hydra orchestrate ${epicName} --stop`);
      
    } else {
      // Run in foreground
      console.log('🔄 Starting orchestrator in foreground mode...');
      console.log('💡 Use Ctrl+C to stop, or use --daemon flag for background mode');
      console.log('');
      
      const orchestrator = new HydraOrchestrator({ 
        epicName, 
        interval: intervalMs 
      });
      
      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        console.log('\n🛑 Received SIGINT, shutting down gracefully...');
        await orchestrator.stop();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
        await orchestrator.stop();
        process.exit(0);
      });

      await orchestrator.start();
      
      // Keep process alive
      process.stdin.resume();
    }
    
  } catch (error) {
    console.error(`❌ Error in orchestrate command: ${error.message}`);
    process.exit(1);
  }
}

async function executeInstall(options) {
  console.log('🚀 Running Hydra installer...\n');
  
  try {
    // Locate the installer
    const installerPath = join(__dirname, 'hydra-installer.mjs');
    
    if (!existsSync(installerPath)) {
      throw new Error('Hydra installer not found. Please ensure it\'s properly installed.');
    }

    // Build installer arguments
    const installerArgs = [];
    
    // Pass through supported flags
    if (options.global) {
      installerArgs.push('--global');
    }
    if (options.project) {
      installerArgs.push('--project');
    }
    if (options.help) {
      installerArgs.push('--help');
    }

    console.log(`📦 Executing installer: node ${installerPath} ${installerArgs.join(' ')}\n`);

    // Execute the installer
    const installerProcess = spawn('node', [installerPath, ...installerArgs], {
      stdio: 'inherit',
      shell: false
    });

    installerProcess.on('error', (error) => {
      console.error(`❌ Failed to launch installer: ${error.message}`);
      process.exit(1);
    });

    installerProcess.on('exit', (code) => {
      if (code === 0) {
        console.log(`\n✅ Installation completed successfully!`);
      } else {
        console.error(`\n❌ Installation failed with exit code ${code}`);
        process.exit(code);
      }
    });

  } catch (error) {
    console.error(`❌ Error in install command: ${error.message}`);
    process.exit(1);
  }
}

/**
 * CLI Configuration
 */
program
  .name('hydra')
  .description('Development Lifecycle Orchestrator - Seamless handoffs to Claude Code')
  .version(HYDRA_VERSION);

program
  .command('new')
  .description('Initiate strategic analysis for a new feature/epic using cofounder agent')
  .argument('<feature-name>', 'Name of the feature/epic for strategic analysis')
  .action(executeNew);

program
  .command('plan')
  .description('Generate detailed execution plan from Product Requirement Prompt (PRP) using plan-generator agent')
  .argument('<epic-name>', 'Name of the epic to generate plan for')
  .action(executePlan);

program
  .command('run')
  .description('Initiate autonomous execution workflow for an epic')
  .argument('<epic-name>', 'Name of the epic to execute')
  .action(executeRun);

program
  .command('pm-view')
  .description('View comprehensive project status from genesis.xml')
  .argument('<epic-name>', 'Name of the epic to view')
  .action(executePmView);

program
  .command('enhance')
  .description('Analyze existing codebase and generate enhancement plan for brownfield development')
  .argument('<feature-description>', 'Description of the feature to add to existing codebase')
  .action(executeEnhance);

program
  .command('doctor')
  .description('Run comprehensive health and integrity diagnostics')
  .option('--auto-fix', 'Automatically fix detected issues where possible')
  .action(executeDoctor);

program
  .command('recap')
  .description('Generate post-flight summary for completed work')
  .argument('<epic-name>', 'Name of the epic to summarize')
  .action(executeRecap);

program
  .command('orchestrate')
  .description('Start autonomous project management daemon for continuous execution')
  .argument('<epic-name>', 'Name of the epic to monitor and execute')
  .option('--interval <minutes>', 'Scanning interval in minutes', '5')
  .option('--daemon', 'Run as background daemon')
  .option('--stop', 'Stop running orchestrator')
  .option('--status', 'Show orchestrator status')
  .action(executeOrchestrate);

program
  .command('install')
  .description('Run the Hydra installer with smart defaults or specified options')
  .option('--global', 'Force global installation')
  .option('--project', 'Force project-specific installation')
  .option('--help', 'Show installer help')
  .action(executeInstall);

// Error handling
process.on('uncaughtException', (error) => {
  console.error(`❌ Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`❌ Unhandled rejection at:`, promise, 'reason:', reason);
  process.exit(1);
});

// Parse command line arguments
program.parse();