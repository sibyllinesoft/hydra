/**
 * Unit tests for `hydra pm-view` command
 * Tests Genesis.xml parsing, project status display, and xmlstarlet integration
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import path from 'path';
import fs from 'fs';
import { spawn, execSync } from 'child_process';

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');

describe('hydra pm-view command', () => {
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
      return path.includes('genesis.xml');
    });
    
    // Mock successful xmlstarlet commands
    mockExecSync.mockImplementation((cmd) => {
      if (cmd.includes('projectName')) return 'Test Project';
      if (cmd.includes('status')) return 'in-progress';
      if (cmd.includes('lastUpdatedAt')) return '2024-01-15T10:30:00Z';
      if (cmd.includes('problemStatement')) return 'Test problem statement';
      if (cmd.includes('totalTasks')) return '10';
      if (cmd.includes('completedTasks')) return '6';
      if (cmd.includes('inProgressTasks')) return '2';
      if (cmd.includes('percentageComplete')) return '60';
      if (cmd.includes('parallelGroup')) return '1:task1 task2\n2:task3 task4';
      if (cmd.includes('pending/taskRef')) return 'task5 task6';
      if (cmd.includes('inProgress/taskRef')) return 'task3 task4';
      if (cmd.includes('completed/taskRef')) return 'task1 task2';
      if (cmd.includes('failed/taskRef')) return '';
      return '';
    });
  });

  afterEach(() => {
    testUtils.cleanupTempDir(tempDir);
    jest.clearAllMocks();
  });

  describe('Genesis.xml file validation', () => {
    it('should successfully view project with valid Genesis.xml', async () => {
      const epicName = 'test-project';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Viewing project status for: ${epicName}`)
      );
      
      consoleSpy.mockRestore();
    });

    it('should check for Genesis.xml existence', async () => {
      const epicName = 'genesis-check-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      await executePmView(epicName, {});
      
      expect(mockFs.existsSync).toHaveBeenCalledWith(
        expect.stringContaining(path.join('.claude', 'epics', epicName, 'genesis.xml'))
      );
    });

    it('should handle missing Genesis.xml file', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const epicName = 'missing-genesis-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Genesis.xml not found')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Run 'hydra plan ${epicName}' first`)
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
      
      consoleErrorSpy.mockRestore();
      consoleSpy.mockRestore();
      processExitSpy.mockRestore();
    });

    it('should display correct Genesis.xml path', async () => {
      const epicName = 'path-display-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('.claude/epics/path-display-test/genesis.xml')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('XML parsing and metadata extraction', () => {
    it('should extract and display project metadata', async () => {
      const epicName = 'metadata-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('PROJECT: Test Project')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('STATUS: IN-PROGRESS')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('LAST UPDATED:')
      );
      
      consoleSpy.mockRestore();
    });

    it('should extract and display vision summary', async () => {
      const epicName = 'vision-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('VISION SUMMARY:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test problem statement')
      );
      
      consoleSpy.mockRestore();
    });

    it('should extract and display progress metrics', async () => {
      const epicName = 'progress-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('PROGRESS OVERVIEW:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Total Tasks: 10')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Completed: 6')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('In Progress: 2')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Overall Progress: 60%')
      );
      
      consoleSpy.mockRestore();
    });

    it('should execute correct xmlstarlet commands', async () => {
      const epicName = 'xmlstarlet-commands-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      await executePmView(epicName, {});
      
      // Check that xmlstarlet commands were executed
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('xmlstarlet sel -t -v'),
        expect.any(Object)
      );
      
      // Verify specific metadata extractions
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('projectName'),
        expect.any(Object)
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('status'),
        expect.any(Object)
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('lastUpdatedAt'),
        expect.any(Object)
      );
    });
  });

  describe('DAG structure display', () => {
    it('should extract and display DAG structure', async () => {
      const epicName = 'dag-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('EXECUTION DAG:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Level 1: task1 → task2')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Level 2: task3 → task4')
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle empty DAG structure', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('parallelGroup')) return '';
        if (cmd.includes('projectName')) return 'Test Project';
        if (cmd.includes('status')) return 'planning';
        if (cmd.includes('lastUpdatedAt')) return '2024-01-15T10:30:00Z';
        if (cmd.includes('problemStatement')) return 'Test problem statement';
        if (cmd.includes('totalTasks')) return '0';
        if (cmd.includes('completedTasks')) return '0';
        if (cmd.includes('inProgressTasks')) return '0';
        if (cmd.includes('percentageComplete')) return '0';
        return '';
      });

      const epicName = 'empty-dag-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('EXECUTION DAG:')
      );
      
      consoleSpy.mockRestore();
    });

    it('should parse complex DAG levels correctly', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('parallelGroup')) return '1:task1 task2 task3\n2:task4\n3:task5 task6';
        if (cmd.includes('projectName')) return 'Complex DAG Project';
        if (cmd.includes('status')) return 'in-progress';
        if (cmd.includes('lastUpdatedAt')) return '2024-01-15T10:30:00Z';
        if (cmd.includes('problemStatement')) return 'Complex DAG test';
        if (cmd.includes('totalTasks')) return '6';
        if (cmd.includes('completedTasks')) return '2';
        if (cmd.includes('inProgressTasks')) return '2';
        if (cmd.includes('percentageComplete')) return '33';
        return '';
      });

      const epicName = 'complex-dag-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Level 1: task1 → task2 → task3')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Level 2: task4')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Level 3: task5 → task6')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Task status breakdown', () => {
    it('should display task status breakdown', async () => {
      const epicName = 'task-status-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('TASK STATUS:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('⏳ Pending: task5, task6')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔄 In Progress: task3, task4')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ Completed: task1, task2')
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle empty task lists', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('projectName')) return 'Empty Tasks Project';
        if (cmd.includes('status')) return 'planning';
        if (cmd.includes('lastUpdatedAt')) return '2024-01-15T10:30:00Z';
        if (cmd.includes('problemStatement')) return 'Empty tasks test';
        if (cmd.includes('totalTasks')) return '0';
        if (cmd.includes('completedTasks')) return '0';
        if (cmd.includes('inProgressTasks')) return '0';
        if (cmd.includes('percentageComplete')) return '0';
        return '';
      });

      const epicName = 'empty-tasks-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('TASK STATUS:')
      );
      
      consoleSpy.mockRestore();
    });

    it('should display failed tasks when present', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('failed/taskRef')) return 'task7 task8';
        if (cmd.includes('projectName')) return 'Failed Tasks Project';
        if (cmd.includes('status')) return 'in-progress';
        if (cmd.includes('lastUpdatedAt')) return '2024-01-15T10:30:00Z';
        if (cmd.includes('problemStatement')) return 'Failed tasks test';
        if (cmd.includes('totalTasks')) return '10';
        if (cmd.includes('completedTasks')) return '5';
        if (cmd.includes('inProgressTasks')) return '3';
        if (cmd.includes('percentageComplete')) return '50';
        if (cmd.includes('pending/taskRef')) return 'task9 task10';
        if (cmd.includes('inProgress/taskRef')) return 'task3 task4 task5';
        if (cmd.includes('completed/taskRef')) return 'task1 task2 task3 task4 task5';
        return '';
      });

      const epicName = 'failed-tasks-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Failed: task7, task8')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Error handling', () => {
    it('should handle xmlstarlet command failures', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('xmlstarlet command failed');
      });

      const epicName = 'xmlstarlet-error-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error parsing genesis.xml')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('genesis.xml file may be malformed')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
      
      consoleErrorSpy.mockRestore();
      consoleSpy.mockRestore();
      processExitSpy.mockRestore();
    });

    it('should handle malformed XML gracefully', async () => {
      mockExecSync.mockImplementation(() => {
        const error = new Error('XML parsing failed');
        error.stderr = 'Invalid XML structure';
        throw error;
      });

      const epicName = 'malformed-xml-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(processExitSpy).toHaveBeenCalledWith(1);
      
      processExitSpy.mockRestore();
    });

    it('should handle missing XML elements gracefully', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('projectName')) return '';
        if (cmd.includes('status')) return '';
        if (cmd.includes('lastUpdatedAt')) return '';
        if (cmd.includes('problemStatement')) return '';
        return '0';
      });

      const epicName = 'missing-elements-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      // Should handle empty values gracefully
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('PROJECT:')
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle general command errors', async () => {
      const epicName = 'general-error-test';
      
      // Mock join to throw an error
      jest.doMock('path', () => ({
        join: jest.fn(() => {
          throw new Error('Path join failed');
        })
      }));

      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in pm view command')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
      
      consoleErrorSpy.mockRestore();
      processExitSpy.mockRestore();
    });
  });

  describe('Display formatting', () => {
    it('should display formatted headers and separators', async () => {
      const epicName = 'formatting-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith('═'.repeat(60));
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📋 PROJECT:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📊 STATUS:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🕐 LAST UPDATED:')
      );
      
      consoleSpy.mockRestore();
    });

    it('should format dates correctly', async () => {
      const epicName = 'date-formatting-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      // Should convert ISO date to locale string
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('LAST UPDATED:')
      );
      
      consoleSpy.mockRestore();
    });

    it('should use appropriate emojis and formatting', async () => {
      const epicName = 'emoji-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🎯 VISION SUMMARY:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📈 PROGRESS OVERVIEW:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔄 EXECUTION DAG:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📋 TASK STATUS:')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Edge cases and robustness', () => {
    it('should handle empty epic name', async () => {
      const epicName = '';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Viewing project status for:')
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle special characters in epic name', async () => {
      const epicName = 'test-project@v2.1!';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(mockFs.existsSync).toHaveBeenCalledWith(
        expect.stringContaining('test-project@v2.1!')
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle very long epic names', async () => {
      const epicName = 'very-long-epic-name-'.repeat(10);
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      await executePmView(epicName, {});
      
      expect(mockFs.existsSync).toHaveBeenCalledWith(
        expect.stringContaining(epicName)
      );
    });

    it('should handle unicode characters in epic name', async () => {
      const epicName = 'project-📊-status';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('project-📊-status')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance tests', () => {
    it('should complete pm-view within reasonable time', async () => {
      const epicName = 'performance-test';
      const startTime = Date.now();
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      await executePmView(epicName, {});
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle large XML files efficiently', async () => {
      // Mock large amounts of data
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('pending/taskRef')) return Array.from({length: 100}, (_, i) => `task${i}`).join(' ');
        if (cmd.includes('completed/taskRef')) return Array.from({length: 50}, (_, i) => `task${i+100}`).join(' ');
        if (cmd.includes('projectName')) return 'Large Project';
        if (cmd.includes('status')) return 'in-progress';
        if (cmd.includes('lastUpdatedAt')) return '2024-01-15T10:30:00Z';
        if (cmd.includes('problemStatement')) return 'Large project test';
        if (cmd.includes('totalTasks')) return '150';
        if (cmd.includes('completedTasks')) return '50';
        if (cmd.includes('inProgressTasks')) return '25';
        if (cmd.includes('percentageComplete')) return '33';
        return '';
      });

      const epicName = 'large-xml-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Total Tasks: 150')
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle concurrent pm-view commands', async () => {
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const promises = [
        executePmView('project-1', {}),
        executePmView('project-2', {}),
        executePmView('project-3', {})
      ];
      
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });
  });

  describe('Options handling', () => {
    it('should accept empty options object', async () => {
      const epicName = 'empty-options-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Viewing project status for:')
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle additional options gracefully', async () => {
      const epicName = 'additional-options-test';
      const options = {
        verbose: true,
        format: 'detailed'
      };
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      await executePmView(epicName, options);
      
      expect(mockExecSync).toHaveBeenCalled();
    });

    it('should handle null options', async () => {
      const epicName = 'null-options-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      await executePmView(epicName, null);
      
      expect(mockExecSync).toHaveBeenCalled();
    });
  });

  describe('Integration with Living Blueprint', () => {
    it('should work with Living Blueprint Genesis.xml format', async () => {
      const epicName = 'blueprint-integration-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Reading genesis.xml:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Parsing project status and DAG structure')
      );
      
      consoleSpy.mockRestore();
    });

    it('should display Living Blueprint workflow information', async () => {
      const epicName = 'workflow-info-test';
      
      const { executePmView } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executePmView(epicName, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('EXECUTION DAG:')
      );
      
      consoleSpy.mockRestore();
    });
  });
});