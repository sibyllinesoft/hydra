#!/usr/bin/env node

/**
 * Hydra CLI - Development Lifecycle Orchestrator
 * Seamlessly hands off to Claude Code with dynamic prompt generation
 */

import { Command } from 'commander';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { homedir, tmpdir } from 'os';

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

  async runAllChecks() {
    console.log('🏥 Running Hydra Health Diagnostics...\n');

    const results = {
      authentication: await this.checkAuthentication(),
      xmlstarlet: await this.checkXmlstarlet(),
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
    const strategicBriefPath = join(epicDir, 'strategic-brief.md');
    const prompt = templateProcessor.processTemplate(template, {
      feature_name: featureName,
      epic_name: featureName,
      strategic_brief_path: strategicBriefPath,
      timestamp: new Date().toISOString()
    });
    
    console.log(`📋 Strategic Brief will be saved to: ${strategicBriefPath}`);
    console.log(`🧠 Invoking cofounder agent for strategic analysis...`);
    console.log(`🎯 Goal: Produce structured markdown Strategic Brief through Socratic questioning`);
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
    
    const results = await healthChecker.runAllChecks();
    
    // Determine overall health
    const hasErrors = Object.values(results).some(r => r.status === 'ERROR');
    const hasWarnings = Object.values(results).some(r => r.status === 'WARNING');
    
    if (hasErrors) {
      console.log('🚨 Critical issues detected. Please resolve before proceeding.');
      process.exit(1);
    } else if (hasWarnings) {
      console.log('⚠️  Some issues detected. System functional but may need attention.');
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
    
    // Check for strategic brief
    const epicDir = join(process.cwd(), '.claude', 'epics', epicName);
    const strategicBriefPath = join(epicDir, 'strategic-brief.md');
    const genesisPath = join(epicDir, 'genesis.xml');
    
    if (!existsSync(strategicBriefPath)) {
      console.error(`❌ Strategic brief not found: ${strategicBriefPath}`);
      console.log(`💡 Tip: Run 'hydra new ${epicName}' first to create the strategic brief`);
      process.exit(1);
    }
    
    if (existsSync(genesisPath)) {
      console.log(`⚠️  Genesis.xml already exists at: ${genesisPath}`);
      console.log(`   This will be regenerated from the strategic brief.`);
    }
    
    console.log(`📖 Strategic Brief: ${strategicBriefPath}`);
    console.log(`🎯 Genesis Output: ${genesisPath}`);
    console.log(`🧠 Invoking plan-generator agent for detailed DAG creation...`);
    console.log(`📂 Epic Directory: ${epicDir}\n`);
    
    // Load and process the plan generation template
    const template = templateProcessor.loadTemplate('plan-generation.md');
    const prompt = templateProcessor.processTemplate(template, {
      epic_name: epicName,
      strategic_brief_path: strategicBriefPath,
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
  .description('Generate detailed execution plan from strategic brief using plan-generator agent')
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
  .command('doctor')
  .description('Run comprehensive health and integrity diagnostics')
  .action(executeDoctor);

program
  .command('recap')
  .description('Generate post-flight summary for completed work')
  .argument('<epic-name>', 'Name of the epic to summarize')
  .action(executeRecap);

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