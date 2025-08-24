#!/usr/bin/env node

/**
 * Hydra Orchestrator Daemon - Autonomous Project Management
 * 
 * This daemon continuously monitors genesis.xml files and autonomously executes
 * project tasks based on their DAG structure and dependency completion status.
 * 
 * Architecture:
 * - Interval-based scanning (every 5 minutes by default)
 * - State machine for DAG traversal and task identification
 * - Child process management for `hydra run` execution
 * - Comprehensive audit logging to genesis.xml files
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class HydraOrchestrator {
  constructor(options = {}) {
    this.epicName = options.epicName;
    this.interval = options.interval || 5 * 60 * 1000; // 5 minutes default
    this.isRunning = false;
    this.activeProcesses = new Map(); // taskId -> process info
    this.processTimer = null;
    this.logFile = join(process.cwd(), '.claude', 'orchestrator.log');
    
    // Ensure log directory exists
    const logDir = dirname(this.logFile);
    if (!existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Start the orchestrator daemon
   */
  async start() {
    if (this.isRunning) {
      this.log('⚠️  Orchestrator already running');
      return;
    }

    this.log(`🚀 Starting Hydra Orchestrator for epic: ${this.epicName}`);
    this.log(`📋 Monitoring interval: ${this.interval / 1000}s`);
    
    this.isRunning = true;
    
    // Initial scan
    await this.scanAndExecute();
    
    // Set up interval scanning
    this.processTimer = setInterval(async () => {
      try {
        await this.scanAndExecute();
      } catch (error) {
        this.log(`❌ Error during scheduled scan: ${error.message}`);
      }
    }, this.interval);

    this.log('✅ Orchestrator daemon started');
  }

  /**
   * Stop the orchestrator daemon
   */
  async stop() {
    if (!this.isRunning) {
      this.log('⚠️  Orchestrator not running');
      return;
    }

    this.log('🛑 Stopping Hydra Orchestrator...');
    this.isRunning = false;
    
    if (this.processTimer) {
      clearInterval(this.processTimer);
      this.processTimer = null;
    }

    // Clean up any running processes
    for (const [taskId, processInfo] of this.activeProcesses) {
      this.log(`🔄 Terminating process for task: ${taskId}`);
      try {
        process.kill(processInfo.pid, 'SIGTERM');
      } catch (error) {
        this.log(`⚠️  Failed to terminate process ${processInfo.pid}: ${error.message}`);
      }
    }
    
    this.activeProcesses.clear();
    this.log('✅ Orchestrator daemon stopped');
  }

  /**
   * Get status of the orchestrator and active processes
   */
  getStatus() {
    const status = {
      running: this.isRunning,
      epicName: this.epicName,
      interval: this.interval,
      activeProcesses: this.activeProcesses.size,
      processes: Array.from(this.activeProcesses.entries()).map(([taskId, info]) => ({
        taskId,
        pid: info.pid,
        startTime: info.startTime,
        command: info.command
      }))
    };

    return status;
  }

  /**
   * Core orchestration logic - scan genesis.xml and execute available tasks
   */
  async scanAndExecute() {
    const genesisPath = this.getGenesisPath();
    
    if (!existsSync(genesisPath)) {
      this.log(`⚠️  Genesis file not found: ${genesisPath}`);
      return;
    }

    try {
      // Parse genesis.xml to understand current state
      const genesisState = this.parseGenesisState(genesisPath);
      
      // Find executable tasks (pending tasks with satisfied dependencies)
      const executableTasks = this.findExecutableTasks(genesisState);
      
      if (executableTasks.length === 0) {
        this.log('📋 No executable tasks found in current DAG state');
        return;
      }

      this.log(`🎯 Found ${executableTasks.length} executable task(s): ${executableTasks.map(t => t.id).join(', ')}`);

      // Execute each available task
      for (const task of executableTasks) {
        await this.executeTask(task, genesisPath);
      }

    } catch (error) {
      this.log(`❌ Error during scan and execute: ${error.message}`);
      this.addAuditEntry(genesisPath, 'ERROR', `Orchestrator scan failed: ${error.message}`);
    }
  }

  /**
   * Parse genesis.xml to extract current project state
   */
  parseGenesisState(genesisPath) {
    try {
      // Get all pending tasks
      const pendingTasksXml = execSync(
        `xmlstarlet sel -t -m '//executionPlan/dag/pending/taskRef' -v '@id' -o '|' -n "${genesisPath}"`,
        { encoding: 'utf8', stdio: 'pipe' }
      ).trim();

      // Get all completed tasks  
      const completedTasksXml = execSync(
        `xmlstarlet sel -t -m '//executionPlan/dag/completed/taskRef' -v '@id' -o '|' -n "${genesisPath}"`,
        { encoding: 'utf8', stdio: 'pipe' }
      ).trim();

      // Get all in-progress tasks
      const inProgressTasksXml = execSync(
        `xmlstarlet sel -t -m '//executionPlan/dag/inProgress/taskRef' -v '@id' -o '|' -n "${genesisPath}"`,
        { encoding: 'utf8', stdio: 'pipe' }
      ).trim();

      // Get task dependencies
      const taskDepsXml = execSync(
        `xmlstarlet sel -t -m '//executionPlan/tasks/task' -v '@id' -o ':' -v 'dependencies' -o '|' -n "${genesisPath}"`,
        { encoding: 'utf8', stdio: 'pipe' }
      ).trim();

      // Parse the results
      const pendingTasks = pendingTasksXml ? pendingTasksXml.split('\n').map(line => line.replace('|', '')).filter(Boolean) : [];
      const completedTasks = completedTasksXml ? completedTasksXml.split('\n').map(line => line.replace('|', '')).filter(Boolean) : [];
      const inProgressTasks = inProgressTasksXml ? inProgressTasksXml.split('\n').map(line => line.replace('|', '')).filter(Boolean) : [];
      
      const dependencies = {};
      if (taskDepsXml) {
        taskDepsXml.split('\n').forEach(line => {
          if (line.includes(':')) {
            const [taskId, deps] = line.split(':');
            dependencies[taskId] = deps.replace('|', '').split(',').map(d => d.trim()).filter(Boolean);
          }
        });
      }

      return {
        pendingTasks,
        completedTasks,
        inProgressTasks,
        dependencies
      };

    } catch (error) {
      this.log(`❌ Failed to parse genesis state: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find tasks that are pending and have all dependencies satisfied
   */
  findExecutableTasks(genesisState) {
    const { pendingTasks, completedTasks, dependencies } = genesisState;
    const executableTasks = [];

    for (const taskId of pendingTasks) {
      // Skip if already being processed
      if (this.activeProcesses.has(taskId)) {
        continue;
      }

      const taskDeps = dependencies[taskId] || [];
      
      // Check if all dependencies are completed
      const allDepsCompleted = taskDeps.every(dep => completedTasks.includes(dep));
      
      if (allDepsCompleted) {
        executableTasks.push({ id: taskId, dependencies: taskDeps });
      } else {
        const missingDeps = taskDeps.filter(dep => !completedTasks.includes(dep));
        this.log(`⏳ Task ${taskId} waiting for dependencies: ${missingDeps.join(', ')}`);
      }
    }

    return executableTasks;
  }

  /**
   * Execute a task by spawning a hydra run process
   */
  async executeTask(task, genesisPath) {
    const taskId = task.id;
    
    this.log(`🚀 Executing task: ${taskId}`);
    
    // Update genesis.xml to move task to in-progress
    this.moveTaskToInProgress(genesisPath, taskId);
    
    // Spawn hydra run process
    const command = `node ${join(__dirname, 'hydra.mjs')} run ${this.epicName} --task=${taskId}`;
    
    try {
      const childProcess = spawn('node', [
        join(__dirname, 'hydra.mjs'), 
        'run', 
        this.epicName, 
        `--task=${taskId}`
      ], {
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      // Track the process
      this.activeProcesses.set(taskId, {
        pid: childProcess.pid,
        startTime: new Date().toISOString(),
        command: command,
        process: childProcess
      });

      this.log(`📍 Started process ${childProcess.pid} for task ${taskId}`);

      // Set up process monitoring
      childProcess.on('exit', (code, signal) => {
        this.handleProcessExit(taskId, code, signal, genesisPath);
      });

      childProcess.on('error', (error) => {
        this.log(`❌ Process error for task ${taskId}: ${error.message}`);
        this.moveTaskToFailed(genesisPath, taskId, error.message);
        this.activeProcesses.delete(taskId);
      });

      // Add audit entry
      this.addAuditEntry(genesisPath, 'TASK_STARTED', `Orchestrator started task ${taskId} (PID: ${childProcess.pid})`);

    } catch (error) {
      this.log(`❌ Failed to start process for task ${taskId}: ${error.message}`);
      this.moveTaskToFailed(genesisPath, taskId, error.message);
    }
  }

  /**
   * Handle process exit and update genesis.xml accordingly
   */
  handleProcessExit(taskId, code, signal, genesisPath) {
    const processInfo = this.activeProcesses.get(taskId);
    this.activeProcesses.delete(taskId);

    if (code === 0) {
      this.log(`✅ Task ${taskId} completed successfully`);
      this.moveTaskToCompleted(genesisPath, taskId);
      this.addAuditEntry(genesisPath, 'TASK_COMPLETED', `Orchestrator completed task ${taskId} successfully`);
    } else {
      this.log(`❌ Task ${taskId} failed with code ${code}, signal ${signal}`);
      this.moveTaskToFailed(genesisPath, taskId, `Exit code: ${code}, Signal: ${signal}`);
      this.addAuditEntry(genesisPath, 'TASK_FAILED', `Orchestrator task ${taskId} failed (code: ${code}, signal: ${signal})`);
    }
  }

  /**
   * Move task from pending to in-progress in genesis.xml
   */
  moveTaskToInProgress(genesisPath, taskId) {
    try {
      // Remove from pending
      execSync(`xmlstarlet ed -L -d "//executionPlan/dag/pending/taskRef[@id='${taskId}']" "${genesisPath}"`);
      
      // Add to in-progress
      execSync(`xmlstarlet ed -L -s "//executionPlan/dag/inProgress" -t elem -n taskRef -v "" "${genesisPath}"`);
      execSync(`xmlstarlet ed -L -i "//executionPlan/dag/inProgress/taskRef[last()]" -t attr -n id -v "${taskId}" "${genesisPath}"`);
      
      this.log(`📝 Moved task ${taskId} to in-progress`);
    } catch (error) {
      this.log(`❌ Failed to move task ${taskId} to in-progress: ${error.message}`);
    }
  }

  /**
   * Move task from in-progress to completed in genesis.xml
   */
  moveTaskToCompleted(genesisPath, taskId) {
    try {
      // Remove from in-progress
      execSync(`xmlstarlet ed -L -d "//executionPlan/dag/inProgress/taskRef[@id='${taskId}']" "${genesisPath}"`);
      
      // Add to completed
      execSync(`xmlstarlet ed -L -s "//executionPlan/dag/completed" -t elem -n taskRef -v "" "${genesisPath}"`);
      execSync(`xmlstarlet ed -L -i "//executionPlan/dag/completed/taskRef[last()]" -t attr -n id -v "${taskId}" "${genesisPath}"`);
      
      this.log(`✅ Moved task ${taskId} to completed`);
    } catch (error) {
      this.log(`❌ Failed to move task ${taskId} to completed: ${error.message}`);
    }
  }

  /**
   * Move task to failed state in genesis.xml
   */
  moveTaskToFailed(genesisPath, taskId, errorMessage) {
    try {
      // Remove from pending or in-progress
      execSync(`xmlstarlet ed -L -d "//executionPlan/dag/pending/taskRef[@id='${taskId}']" "${genesisPath}" 2>/dev/null || true`);
      execSync(`xmlstarlet ed -L -d "//executionPlan/dag/inProgress/taskRef[@id='${taskId}']" "${genesisPath}" 2>/dev/null || true`);
      
      // Add to failed
      if (!this.sectionExists(genesisPath, '//executionPlan/dag/failed')) {
        execSync(`xmlstarlet ed -L -s "//executionPlan/dag" -t elem -n failed -v "" "${genesisPath}"`);
      }
      
      execSync(`xmlstarlet ed -L -s "//executionPlan/dag/failed" -t elem -n taskRef -v "" "${genesisPath}"`);
      execSync(`xmlstarlet ed -L -i "//executionPlan/dag/failed/taskRef[last()]" -t attr -n id -v "${taskId}" "${genesisPath}"`);
      execSync(`xmlstarlet ed -L -i "//executionPlan/dag/failed/taskRef[last()]" -t attr -n error -v "${errorMessage}" "${genesisPath}"`);
      
      this.log(`💥 Moved task ${taskId} to failed: ${errorMessage}`);
    } catch (error) {
      this.log(`❌ Failed to move task ${taskId} to failed: ${error.message}`);
    }
  }

  /**
   * Check if an XML section exists
   */
  sectionExists(genesisPath, xpath) {
    try {
      const result = execSync(`xmlstarlet sel -t -c "${xpath}" "${genesisPath}"`, { encoding: 'utf8', stdio: 'pipe' });
      return result.trim().length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Add audit entry to genesis.xml
   */
  addAuditEntry(genesisPath, action, description) {
    try {
      const timestamp = new Date().toISOString();
      
      // Create audit entry
      execSync(`xmlstarlet ed -L -s "//auditLog" -t elem -n logEntry -v "" "${genesisPath}"`);
      execSync(`xmlstarlet ed -L -s "//auditLog/logEntry[last()]" -t elem -n timestamp -v "${timestamp}" "${genesisPath}"`);
      execSync(`xmlstarlet ed -L -s "//auditLog/logEntry[last()]" -t elem -n actor -v "orchestrator-daemon" "${genesisPath}"`);
      execSync(`xmlstarlet ed -L -s "//auditLog/logEntry[last()]" -t elem -n action -v "${action}" "${genesisPath}"`);
      execSync(`xmlstarlet ed -L -s "//auditLog/logEntry[last()]" -t elem -n description -v "${description}" "${genesisPath}"`);
      
    } catch (error) {
      this.log(`❌ Failed to add audit entry: ${error.message}`);
    }
  }

  /**
   * Get path to genesis.xml for the monitored epic
   */
  getGenesisPath() {
    return join(process.cwd(), '.claude', 'epics', this.epicName, 'genesis.xml');
  }

  /**
   * Log message with timestamp
   */
  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    
    console.log(logEntry);
    
    // Also write to log file
    try {
      writeFileSync(this.logFile, logEntry + '\n', { flag: 'a' });
    } catch (error) {
      console.error(`Failed to write to log file: ${error.message}`);
    }
  }

  /**
   * Check if project is complete (no pending or in-progress tasks)
   */
  isProjectComplete(genesisState) {
    return genesisState.pendingTasks.length === 0 && genesisState.inProgressTasks.length === 0;
  }
}

/**
 * CLI interface for the daemon
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const epicName = args[1];

  if (!epicName && !['status', 'stop'].includes(command)) {
    console.error('❌ Usage: orchestrator-daemon.mjs <start|stop|status> [epic-name]');
    process.exit(1);
  }

  switch (command) {
    case 'start':
      if (!epicName) {
        console.error('❌ Epic name required for start command');
        process.exit(1);
      }
      
      const orchestrator = new HydraOrchestrator({ epicName });
      
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
      break;

    case 'stop':
      // For now, we'll implement a simple stop mechanism
      // In a production system, you'd want proper PID tracking
      console.log('🛑 Stopping orchestrator daemon...');
      console.log('ℹ️  Use Ctrl+C on the running daemon process');
      break;

    case 'status':
      console.log('📊 Orchestrator Status:');
      console.log('ℹ️  Check orchestrator.log for detailed status');
      
      // Try to read the log file
      const logPath = join(process.cwd(), '.claude', 'orchestrator.log');
      if (existsSync(logPath)) {
        console.log('📝 Recent log entries:');
        const logs = readFileSync(logPath, 'utf8').split('\n').slice(-10);
        logs.forEach(log => console.log(log));
      }
      break;

    default:
      console.error('❌ Unknown command. Use: start, stop, or status');
      process.exit(1);
  }
}

// Run CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(`❌ Orchestrator error: ${error.message}`);
    process.exit(1);
  });
}

export { HydraOrchestrator };