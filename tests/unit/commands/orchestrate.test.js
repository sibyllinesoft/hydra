/**
 * Unit tests for `hydra orchestrate` command (CRITICAL NEW FEATURE)
 * Tests autonomous orchestration, daemon mode, and status management
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import path from 'path';
import fs from 'fs';
import { spawn, execSync } from 'child_process';
import EventEmitter from 'events';

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');

describe('hydra orchestrate command', () => {
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
    mockFs.readFileSync.mockReturnValue('mock log content');
    mockFs.writeFileSync.mockImplementation(() => {});
    mockFs.mkdirSync.mockImplementation(() => {});
    mockFs.mkdtempSync.mockReturnValue(tempDir);
    
    // Mock xmlstarlet operations for DAG parsing
    mockExecSync.mockImplementation((cmd) => {
      if (cmd.includes('xmlstarlet sel') && cmd.includes('pending')) {
        return 'task1|\ntask2|\n';
      }
      if (cmd.includes('xmlstarlet sel') && cmd.includes('completed')) {
        return '';
      }
      if (cmd.includes('xmlstarlet sel') && cmd.includes('inProgress')) {
        return '';
      }
      if (cmd.includes('xmlstarlet sel') && cmd.includes('dependencies')) {
        return 'task1:|\ntask2:task1|';
      }
      if (cmd.includes('xmlstarlet ed')) {
        return '';
      }
      return '';
    });

    // Mock process spawn with event emitter
    mockSpawn.mockImplementation(() => {
      const mockProcess = new EventEmitter();
      mockProcess.pid = 12345;
      mockProcess.stdout = new EventEmitter();
      mockProcess.stderr = new EventEmitter();
      mockProcess.unref = jest.fn();
      
      // Simulate successful completion after a delay
      setTimeout(() => {
        mockProcess.emit('exit', 0, null);
      }, 100);
      
      return mockProcess;
    });
  });

  afterEach(() => {
    testUtils.cleanupTempDir(tempDir);
    jest.clearAllMocks();
  });

  describe('Basic orchestration functionality', () => {
    it('should require genesis.xml file to exist', async () => {
      mockFs.existsSync.mockReturnValue(false);
      
      const { executeOrchestrate } = await import('../../../bin/hydra.mjs');
      
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await executeOrchestrate('test-epic', {});
      
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Genesis file not found')
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
      
      errorSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should start orchestrator in foreground mode by default', async () => {
      const { executeOrchestrate } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Create a promise that resolves after a short delay to simulate orchestration
      const orchestrationPromise = executeOrchestrate('test-epic', {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Starting Hydra Orchestrator')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('foreground mode')
      );
      
      consoleSpy.mockRestore();
    });

    it('should start orchestrator in daemon mode with --daemon flag', async () => {
      const { executeOrchestrate } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeOrchestrate('test-epic', { daemon: true });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Starting as background daemon')
      );
      expect(mockSpawn).toHaveBeenCalledWith(
        'node',
        expect.arrayContaining(['orchestrator-daemon.mjs', 'start', 'test-epic']),
        expect.objectContaining({ detached: true })
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle custom monitoring interval', async () => {
      const { executeOrchestrate } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeOrchestrate('test-epic', { interval: '10' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Monitoring interval: 10 minutes')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Genesis.xml state parsing', () => {
    it('should parse DAG state correctly', async () => {
      const { HydraOrchestrator } = await import('../../../bin/orchestrator-daemon.mjs');
      const orchestrator = new HydraOrchestrator({ epicName: 'test-epic' });
      
      const genesisPath = '/test/genesis.xml';
      const state = orchestrator.parseGenesisState(genesisPath);
      
      expect(state.pendingTasks).toEqual(['task1', 'task2']);
      expect(state.completedTasks).toEqual([]);
      expect(state.inProgressTasks).toEqual([]);
      expect(state.dependencies).toEqual({
        'task1': [],
        'task2': ['task1']
      });
    });

    it('should handle malformed genesis.xml gracefully', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('XML parsing failed');
      });
      
      const { HydraOrchestrator } = await import('../../../bin/orchestrator-daemon.mjs');
      const orchestrator = new HydraOrchestrator({ epicName: 'test-epic' });
      
      const genesisPath = '/test/genesis.xml';
      
      await expect(() => orchestrator.parseGenesisState(genesisPath)).toThrow(
        expect.stringContaining('XML parsing failed')
      );
    });
  });

  describe('Task dependency resolution', () => {
    it('should identify executable tasks correctly', async () => {
      const { HydraOrchestrator } = await import('../../../bin/orchestrator-daemon.mjs');
      const orchestrator = new HydraOrchestrator({ epicName: 'test-epic' });
      
      const genesisState = {
        pendingTasks: ['task1', 'task2', 'task3'],
        completedTasks: ['task1'],
        inProgressTasks: [],
        dependencies: {
          'task1': [],
          'task2': ['task1'],
          'task3': ['task1', 'task2']
        }
      };
      
      const executableTasks = orchestrator.findExecutableTasks(genesisState);
      
      expect(executableTasks).toHaveLength(1);
      expect(executableTasks[0].id).toBe('task2');
      expect(executableTasks[0].dependencies).toEqual(['task1']);
    });

    it('should skip tasks with unsatisfied dependencies', async () => {
      const { HydraOrchestrator } = await import('../../../bin/orchestrator-daemon.mjs');
      const orchestrator = new HydraOrchestrator({ epicName: 'test-epic' });
      
      const genesisState = {
        pendingTasks: ['task2', 'task3'],
        completedTasks: [],
        inProgressTasks: [],
        dependencies: {
          'task2': ['task1'],
          'task3': ['task1', 'task2']
        }
      };
      
      const executableTasks = orchestrator.findExecutableTasks(genesisState);
      
      expect(executableTasks).toHaveLength(0);
    });

    it('should skip tasks already in progress', async () => {
      const { HydraOrchestrator } = await import('../../../bin/orchestrator-daemon.mjs');
      const orchestrator = new HydraOrchestrator({ epicName: 'test-epic' });
      
      // Add a task to active processes
      orchestrator.activeProcesses.set('task1', { pid: 12345 });
      
      const genesisState = {
        pendingTasks: ['task1', 'task2'],
        completedTasks: [],
        inProgressTasks: [],
        dependencies: {
          'task1': [],
          'task2': []
        }
      };
      
      const executableTasks = orchestrator.findExecutableTasks(genesisState);
      
      expect(executableTasks).toHaveLength(1);
      expect(executableTasks[0].id).toBe('task2');
    });
  });

  describe('Task execution management', () => {
    it('should spawn hydra run process for executable task', async () => {
      const { HydraOrchestrator } = await import('../../../bin/orchestrator-daemon.mjs');
      const orchestrator = new HydraOrchestrator({ epicName: 'test-epic' });
      
      const task = { id: 'task1', dependencies: [] };
      const genesisPath = '/test/genesis.xml';
      
      await orchestrator.executeTask(task, genesisPath);
      
      expect(mockSpawn).toHaveBeenCalledWith(
        'node',
        expect.arrayContaining(['hydra.mjs', 'run', 'test-epic', '--task=task1']),
        expect.any(Object)
      );
      
      expect(orchestrator.activeProcesses.has('task1')).toBe(true);
    });

    it('should track process information', async () => {
      const { HydraOrchestrator } = await import('../../../bin/orchestrator-daemon.mjs');
      const orchestrator = new HydraOrchestrator({ epicName: 'test-epic' });
      
      const task = { id: 'task1', dependencies: [] };
      const genesisPath = '/test/genesis.xml';
      
      await orchestrator.executeTask(task, genesisPath);
      
      const processInfo = orchestrator.activeProcesses.get('task1');
      expect(processInfo).toMatchObject({
        pid: 12345,
        startTime: expect.any(String),
        command: expect.stringContaining('hydra.mjs run test-epic --task=task1')
      });
    });

    it('should handle process spawn failure', async () => {
      mockSpawn.mockImplementation(() => {
        const mockProcess = new EventEmitter();
        mockProcess.pid = 12345;
        mockProcess.stdout = new EventEmitter();
        mockProcess.stderr = new EventEmitter();
        mockProcess.unref = jest.fn();
        
        // Simulate spawn error
        setTimeout(() => {
          mockProcess.emit('error', new Error('Spawn failed'));
        }, 10);
        
        return mockProcess;
      });
      
      const { HydraOrchestrator } = await import('../../../bin/orchestrator-daemon.mjs');
      const orchestrator = new HydraOrchestrator({ epicName: 'test-epic' });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const task = { id: 'task1', dependencies: [] };
      const genesisPath = '/test/genesis.xml';
      
      await orchestrator.executeTask(task, genesisPath);
      
      // Wait for error event
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(orchestrator.activeProcesses.has('task1')).toBe(false);
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('xmlstarlet ed'),
        expect.any(Object)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Genesis.xml state updates', () => {
    it('should move task to in-progress when started', async () => {
      const { HydraOrchestrator } = await import('../../../bin/orchestrator-daemon.mjs');
      const orchestrator = new HydraOrchestrator({ epicName: 'test-epic' });
      
      const genesisPath = '/test/genesis.xml';
      orchestrator.moveTaskToInProgress(genesisPath, 'task1');
      
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('xmlstarlet ed -L -d'),
        expect.any(Object)
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('xmlstarlet ed -L -s'),
        expect.any(Object)
      );
    });

    it('should move task to completed when successful', async () => {
      const { HydraOrchestrator } = await import('../../../bin/orchestrator-daemon.mjs');
      const orchestrator = new HydraOrchestrator({ epicName: 'test-epic' });
      
      const genesisPath = '/test/genesis.xml';
      orchestrator.moveTaskToCompleted(genesisPath, 'task1');
      
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('inProgress/taskRef[@id=\'task1\']'),
        expect.any(Object)
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('completed'),
        expect.any(Object)
      );
    });

    it('should move task to failed when execution fails', async () => {
      const { HydraOrchestrator } = await import('../../../bin/orchestrator-daemon.mjs');
      const orchestrator = new HydraOrchestrator({ epicName: 'test-epic' });
      
      const genesisPath = '/test/genesis.xml';
      const errorMessage = 'Task execution failed';
      
      orchestrator.moveTaskToFailed(genesisPath, 'task1', errorMessage);
      
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('failed'),
        expect.any(Object)
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.any(Object)
      );
    });
  });

  describe('Audit logging', () => {
    it('should add audit entries for task events', async () => {
      const { HydraOrchestrator } = await import('../../../bin/orchestrator-daemon.mjs');
      const orchestrator = new HydraOrchestrator({ epicName: 'test-epic' });
      
      const genesisPath = '/test/genesis.xml';
      orchestrator.addAuditEntry(genesisPath, 'TASK_STARTED', 'Task task1 started');
      
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('auditLog'),
        expect.any(Object)
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('orchestrator-daemon'),
        expect.any(Object)
      );
    });

    it('should handle audit logging failures gracefully', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('auditLog')) {
          throw new Error('Audit logging failed');
        }
        return '';
      });
      
      const { HydraOrchestrator } = await import('../../../bin/orchestrator-daemon.mjs');
      const orchestrator = new HydraOrchestrator({ epicName: 'test-epic' });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const genesisPath = '/test/genesis.xml';
      
      orchestrator.addAuditEntry(genesisPath, 'TASK_STARTED', 'Task task1 started');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to add audit entry')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Status and control commands', () => {
    it('should show orchestrator status with --status flag', async () => {
      const { executeOrchestrate } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeOrchestrate('test-epic', { status: true });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Orchestrator Status')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Recent log entries')
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle missing log file gracefully', async () => {
      mockFs.existsSync.mockImplementation((path) => {
        return !path.includes('orchestrator.log');
      });
      
      const { executeOrchestrate } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeOrchestrate('test-epic', { status: true });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No orchestrator log found')
      );
      
      consoleSpy.mockRestore();
    });

    it('should provide stop instructions with --stop flag', async () => {
      const { executeOrchestrate } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeOrchestrate('test-epic', { stop: true });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Stopping orchestrator daemon')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Ctrl+C')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Process lifecycle management', () => {
    it('should handle successful task completion', async () => {
      const { HydraOrchestrator } = await import('../../../bin/orchestrator-daemon.mjs');
      const orchestrator = new HydraOrchestrator({ epicName: 'test-epic' });
      
      // Add active process
      orchestrator.activeProcesses.set('task1', { pid: 12345 });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const genesisPath = '/test/genesis.xml';
      
      orchestrator.handleProcessExit('task1', 0, null, genesisPath);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Task task1 completed successfully')
      );
      expect(orchestrator.activeProcesses.has('task1')).toBe(false);
      
      consoleSpy.mockRestore();
    });

    it('should handle task failure', async () => {
      const { HydraOrchestrator } = await import('../../../bin/orchestrator-daemon.mjs');
      const orchestrator = new HydraOrchestrator({ epicName: 'test-epic' });
      
      // Add active process
      orchestrator.activeProcesses.set('task1', { pid: 12345 });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const genesisPath = '/test/genesis.xml';
      
      orchestrator.handleProcessExit('task1', 1, 'SIGTERM', genesisPath);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Task task1 failed')
      );
      expect(orchestrator.activeProcesses.has('task1')).toBe(false);
      
      consoleSpy.mockRestore();
    });

    it('should clean up processes on orchestrator stop', async () => {
      const { HydraOrchestrator } = await import('../../../bin/orchestrator-daemon.mjs');
      const orchestrator = new HydraOrchestrator({ epicName: 'test-epic' });
      
      // Add active processes
      orchestrator.activeProcesses.set('task1', { pid: 12345 });
      orchestrator.activeProcesses.set('task2', { pid: 12346 });
      
      const killSpy = jest.spyOn(process, 'kill').mockImplementation();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await orchestrator.stop();
      
      expect(killSpy).toHaveBeenCalledWith(12345, 'SIGTERM');
      expect(killSpy).toHaveBeenCalledWith(12346, 'SIGTERM');
      expect(orchestrator.activeProcesses.size).toBe(0);
      
      killSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('Performance and reliability', () => {
    it('should complete scan cycle within reasonable time', async () => {
      const { HydraOrchestrator } = await import('../../../bin/orchestrator-daemon.mjs');
      const orchestrator = new HydraOrchestrator({ epicName: 'test-epic' });
      
      const startTime = Date.now();
      await orchestrator.scanAndExecute();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle multiple concurrent scans gracefully', async () => {
      const { HydraOrchestrator } = await import('../../../bin/orchestrator-daemon.mjs');
      const orchestrator = new HydraOrchestrator({ epicName: 'test-epic' });
      
      const promises = [
        orchestrator.scanAndExecute(),
        orchestrator.scanAndExecute(),
        orchestrator.scanAndExecute()
      ];
      
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });

    it('should maintain log file integrity under load', async () => {
      const { HydraOrchestrator } = await import('../../../bin/orchestrator-daemon.mjs');
      const orchestrator = new HydraOrchestrator({ epicName: 'test-epic' });
      
      // Log multiple messages concurrently
      const promises = Array.from({ length: 10 }, (_, i) =>
        Promise.resolve(orchestrator.log(`Test message ${i}`))
      );
      
      await Promise.all(promises);
      
      expect(mockFs.writeFileSync).toHaveBeenCalledTimes(10);
    });
  });

  describe('Signal handling and graceful shutdown', () => {
    it('should handle SIGINT gracefully in foreground mode', async () => {
      // This test is complex to implement fully without process manipulation
      // Testing that signal handlers are registered
      const { executeOrchestrate } = await import('../../../bin/hydra.mjs');
      
      const onSpy = jest.spyOn(process, 'on').mockImplementation();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeOrchestrate('test-epic', {});
      
      expect(onSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
      
      onSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });
});