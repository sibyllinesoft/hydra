/**
 * Stress Tests for Performance and Scalability
 * Tests system behavior under extreme conditions and heavy loads
 */

import { jest, describe, it, expect, beforeEach, afterEach, beforeAll } from '@jest/globals';
import { spawn, exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import cluster from 'cluster';

// Mock implementations
jest.mock('child_process');
jest.mock('fs');
jest.mock('cluster');

describe('Performance and Stress Tests', () => {
  let testProjectDir;
  let mockFs;
  let mockSpawn;
  let mockExec;
  let performanceMetrics;

  beforeAll(() => {
    // Extended timeout for stress tests
    jest.setTimeout(180000); // 3 minutes
  });

  beforeEach(() => {
    testProjectDir = testUtils.createTempDir();
    mockFs = fs;
    mockSpawn = spawn;
    mockExec = exec;
    performanceMetrics = {
      memoryUsage: [],
      executionTimes: [],
      fileOperations: 0,
      processSpawns: 0
    };

    setupStressMocks();
  });

  afterEach(() => {
    testUtils.cleanupTempDir(testProjectDir);
    jest.clearAllMocks();
  });

  function setupStressMocks() {
    // Track file operations
    mockFs.writeFileSync.mockImplementation((filePath, content) => {
      performanceMetrics.fileOperations++;
      // Simulate varying write times
      const delay = Math.random() * 10;
      return new Promise(resolve => setTimeout(resolve, delay));
    });

    mockFs.readFileSync.mockImplementation((filePath) => {
      performanceMetrics.fileOperations++;
      if (filePath.includes('genesis.xml')) {
        // Generate large XML content for stress testing
        return generateLargeGenesisXml(1000); // 1000 tasks
      }
      return 'mock content';
    });

    mockFs.existsSync.mockReturnValue(true);
    mockFs.mkdirSync.mockImplementation(() => {
      performanceMetrics.fileOperations++;
    });

    // Track process spawning
    mockSpawn.mockImplementation(() => {
      performanceMetrics.processSpawns++;
      return testUtils.mockSpawn({ code: 0, stdout: 'Success' });
    });

    mockExec.mockImplementation((command, callback) => {
      performanceMetrics.processSpawns++;
      // Simulate varying execution times
      const delay = Math.random() * 100;
      setTimeout(() => {
        callback(null, { stdout: 'Command executed', stderr: '' });
      }, delay);
    });
  }

  function generateLargeGenesisXml(taskCount) {
    const tasks = Array.from({ length: taskCount }, (_, i) => 
      `<task id="task-${i}" status="pending" complexity="${Math.floor(Math.random() * 5) + 1}">
        <description>Task ${i} description with some content</description>
        <dependencies>${Array.from({ length: Math.floor(Math.random() * 3) }, (_, j) => `task-${Math.max(0, i-j-1)}`).join(',')}</dependencies>
      </task>`
    ).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<projectGenesis>
  <metadata>
    <projectName>Stress Test Project</projectName>
    <epicName>large-scale-epic</epicName>
    <status>in-progress</status>
    <taskCount>${taskCount}</taskCount>
  </metadata>
  <executionPlan>
    <tasks>
      ${tasks}
    </tasks>
  </executionPlan>
</projectGenesis>`;
  }

  function trackMemoryUsage() {
    const usage = testUtils.getMemoryUsage();
    performanceMetrics.memoryUsage.push({
      timestamp: Date.now(),
      ...usage
    });
    return usage;
  }

  describe('Large Scale Epic Processing', () => {
    it('should handle epics with 1000+ tasks efficiently', async () => {
      const startTime = testUtils.startTimer();
      const initialMemory = trackMemoryUsage();
      
      const epicName = 'massive-epic';
      const { executeRun } = await import('../../bin/hydra.mjs');
      
      // Generate large genesis.xml
      const largeGenesis = generateLargeGenesisXml(1000);
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('genesis.xml')) {
          return largeGenesis;
        }
        return 'default content';
      });

      await executeRun(epicName, {});
      
      const executionTime = testUtils.endTimer(startTime);
      const finalMemory = trackMemoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      performanceMetrics.executionTimes.push(executionTime);
      
      // Performance expectations
      expect(executionTime).toBeLessThan(30000); // Under 30 seconds
      expect(memoryIncrease).toBeLessThan(200); // Less than 200MB increase
      expect(performanceMetrics.fileOperations).toBeGreaterThan(0);
      
      console.log(`📊 Large epic processed in ${executionTime}ms with ${memoryIncrease}MB memory increase`);
    });

    it('should handle deeply nested task dependencies', async () => {
      const startTime = testUtils.startTimer();
      
      // Generate tasks with complex dependency chains
      const complexGenesis = `<?xml version="1.0" encoding="UTF-8"?>
<projectGenesis>
  <metadata>
    <projectName>Complex Dependencies Test</projectName>
    <epicName>dependency-stress</epicName>
  </metadata>
  <executionPlan>
    <executionDag>
      <parallelSets>
        ${Array.from({ length: 20 }, (_, level) => 
          `<parallelGroup level="${level + 1}">
            ${Array.from({ length: 10 }, (_, task) => 
              `<taskRef id="level${level}-task${task}" depends="${level > 0 ? `level${level-1}-task${task}` : ''}"/>`
            ).join('\n')}
          </parallelGroup>`
        ).join('\n')}
      </parallelSets>
    </executionDag>
  </executionPlan>
</projectGenesis>`;

      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('genesis.xml')) {
          return complexGenesis;
        }
        return 'default content';
      });

      const { executeRun } = await import('../../bin/hydra.mjs');
      await executeRun('dependency-stress', {});
      
      const executionTime = testUtils.endTimer(startTime);
      
      expect(executionTime).toBeLessThan(45000); // Under 45 seconds for complex dependencies
      console.log(`🔗 Complex dependencies processed in ${executionTime}ms`);
    });
  });

  describe('Concurrent Operations Stress', () => {
    it('should handle multiple simultaneous epic operations', async () => {
      const startTime = testUtils.startTimer();
      const concurrentEpics = 50;
      
      const { executeNew } = await import('../../bin/hydra.mjs');
      
      // Create many epics concurrently
      const promises = Array.from({ length: concurrentEpics }, (_, i) =>
        executeNew(`concurrent-epic-${i}`, {})
      );
      
      await Promise.all(promises);
      
      const executionTime = testUtils.endTimer(startTime);
      
      expect(executionTime).toBeLessThan(60000); // Under 1 minute for 50 concurrent ops
      expect(performanceMetrics.fileOperations).toBe(concurrentEpics * 2); // mkdir + template write
      
      console.log(`🔄 ${concurrentEpics} concurrent operations completed in ${executionTime}ms`);
    });

    it('should maintain performance under rapid sequential operations', async () => {
      const operations = 100;
      const executionTimes = [];
      
      const { executeNew } = await import('../../bin/hydra.mjs');
      
      for (let i = 0; i < operations; i++) {
        const operationStart = testUtils.startTimer();
        await executeNew(`rapid-epic-${i}`, {});
        const operationTime = testUtils.endTimer(operationStart);
        executionTimes.push(operationTime);
        
        // Track memory every 10 operations
        if (i % 10 === 0) {
          trackMemoryUsage();
        }
      }
      
      // Performance should remain consistent
      const avgTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
      const maxTime = Math.max(...executionTimes);
      const minTime = Math.min(...executionTimes);
      const variance = maxTime - minTime;
      
      expect(avgTime).toBeLessThan(500); // Average under 500ms per operation
      expect(variance).toBeLessThan(2000); // Variance under 2 seconds
      
      console.log(`⚡ ${operations} operations: avg=${avgTime}ms, variance=${variance}ms`);
    });
  });

  describe('Memory Efficiency Under Load', () => {
    it('should not leak memory during extended operations', async () => {
      const iterations = 200;
      const memoryCheckpoints = [];
      
      const { executeNew, executeDoctor } = await import('../../bin/hydra.mjs');
      
      // Perform many operations while tracking memory
      for (let i = 0; i < iterations; i++) {
        await executeNew(`memory-test-${i}`, {});
        await executeDoctor({});
        
        if (i % 20 === 0) {
          // Force garbage collection if available
          if (global.gc) {
            global.gc();
          }
          
          const checkpoint = {
            iteration: i,
            memory: testUtils.getMemoryUsage()
          };
          memoryCheckpoints.push(checkpoint);
        }
      }
      
      // Analyze memory growth
      const firstCheckpoint = memoryCheckpoints[0];
      const lastCheckpoint = memoryCheckpoints[memoryCheckpoints.length - 1];
      const memoryGrowth = lastCheckpoint.memory.heapUsed - firstCheckpoint.memory.heapUsed;
      const growthRate = memoryGrowth / iterations;
      
      expect(growthRate).toBeLessThan(1); // Less than 1MB growth per operation
      expect(memoryGrowth).toBeLessThan(100); // Total growth under 100MB
      
      console.log(`🧠 Memory growth: ${memoryGrowth}MB total, ${growthRate}MB per operation`);
    });

    it('should handle large file processing without memory spikes', async () => {
      const largeFileSize = 10 * 1024 * 1024; // 10MB
      const largeContent = 'x'.repeat(largeFileSize);
      
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('large-file')) {
          return largeContent;
        }
        return 'default content';
      });

      const initialMemory = trackMemoryUsage();
      
      // Process large files
      const { executeEnhance } = await import('../../bin/hydra.mjs');
      await executeEnhance('process large files', {});
      
      const peakMemory = trackMemoryUsage();
      const memorySpike = peakMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory spike should be reasonable (not more than 3x file size)
      expect(memorySpike).toBeLessThan(largeFileSize * 3 / (1024 * 1024));
      
      console.log(`📁 Large file processing: ${memorySpike}MB memory spike`);
    });
  });

  describe('File System Stress', () => {
    it('should handle thousands of file operations efficiently', async () => {
      const fileCount = 5000;
      const startTime = testUtils.startTimer();
      
      // Mock intensive file operations
      let filesCreated = 0;
      mockFs.writeFileSync.mockImplementation(() => {
        filesCreated++;
      });

      // Generate many file operations
      const { executeNew } = await import('../../bin/hydra.mjs');
      
      for (let i = 0; i < fileCount / 100; i++) { // 50 epics with ~100 files each
        await executeNew(`file-stress-${i}`, {});
      }
      
      const executionTime = testUtils.endTimer(startTime);
      
      expect(executionTime).toBeLessThan(120000); // Under 2 minutes
      expect(filesCreated).toBeGreaterThan(0);
      
      console.log(`💾 File operations: ${filesCreated} files in ${executionTime}ms`);
    });

    it('should handle directory structure with deep nesting', async () => {
      const maxDepth = 20;
      const startTime = testUtils.startTimer();
      
      // Mock deep directory creation
      let directoriesCreated = 0;
      mockFs.mkdirSync.mockImplementation(() => {
        directoriesCreated++;
      });

      // Create deeply nested structures
      const { executeNew } = await import('../../bin/hydra.mjs');
      
      for (let depth = 0; depth < maxDepth; depth++) {
        const nestedPath = Array.from({ length: depth }, (_, i) => `level-${i}`).join('/');
        await executeNew(`nested/${nestedPath}/epic`, {});
      }
      
      const executionTime = testUtils.endTimer(startTime);
      
      expect(executionTime).toBeLessThan(30000); // Under 30 seconds
      expect(directoriesCreated).toBe(maxDepth);
      
      console.log(`📁 Deep nesting: ${maxDepth} levels in ${executionTime}ms`);
    });
  });

  describe('XML Processing Stress', () => {
    it('should handle extremely large XML documents', async () => {
      const largeTaskCount = 10000;
      const startTime = testUtils.startTimer();
      
      const massiveXml = generateLargeGenesisXml(largeTaskCount);
      expect(massiveXml.length).toBeGreaterThan(1000000); // Over 1MB
      
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('genesis.xml')) {
          return massiveXml;
        }
        return 'default';
      });

      // Mock xmlstarlet processing
      mockExec.mockImplementation((command, callback) => {
        if (command.includes('xmlstarlet')) {
          // Simulate processing time proportional to document size
          const processingTime = Math.min(massiveXml.length / 10000, 5000);
          setTimeout(() => {
            callback(null, { stdout: 'XML processed', stderr: '' });
          }, processingTime);
        } else {
          callback(null, { stdout: 'success', stderr: '' });
        }
      });

      const { executeRun } = await import('../../bin/hydra.mjs');
      await executeRun('massive-xml-epic', {});
      
      const executionTime = testUtils.endTimer(startTime);
      
      expect(executionTime).toBeLessThan(60000); // Under 1 minute even for massive XML
      
      console.log(`🗂️ Massive XML (${largeTaskCount} tasks) processed in ${executionTime}ms`);
    });

    it('should handle XML documents with complex structures', async () => {
      const complexXml = `<?xml version="1.0" encoding="UTF-8"?>
<projectGenesis>
  ${Array.from({ length: 1000 }, (_, i) => `
  <section-${i}>
    <subsections>
      ${Array.from({ length: 10 }, (_, j) => `
      <subsection-${j}>
        <items>
          ${Array.from({ length: 5 }, (_, k) => `
          <item id="${i}-${j}-${k}" attr1="value" attr2="value2">
            <data>${Math.random().toString(36).substring(7)}</data>
            <nested>
              <deep>
                <deeper>Content ${i}-${j}-${k}</deeper>
              </deep>
            </nested>
          </item>`).join('')}
        </items>
      </subsection-${j}>`).join('')}
    </subsections>
  </section-${i}>`).join('')}
</projectGenesis>`;

      const startTime = testUtils.startTimer();
      
      mockFs.readFileSync.mockImplementation(() => complexXml);
      
      const { executeRun } = await import('../../bin/hydra.mjs');
      await executeRun('complex-xml-epic', {});
      
      const executionTime = testUtils.endTimer(startTime);
      
      expect(executionTime).toBeLessThan(45000); // Under 45 seconds
      
      console.log(`🏗️ Complex XML structure processed in ${executionTime}ms`);
    });
  });

  describe('Process Management Stress', () => {
    it('should handle many simultaneous daemon processes', async () => {
      const daemonCount = 20;
      const startTime = testUtils.startTimer();
      let processesSpawned = 0;
      
      mockSpawn.mockImplementation((command, args) => {
        if (args && args.includes('orchestrator-daemon.mjs')) {
          processesSpawned++;
          return testUtils.mockSpawn({ code: 0 });
        }
        return testUtils.mockSpawn({ code: 0 });
      });

      const { executeRun } = await import('../../bin/hydra.mjs');
      
      // Start many daemons concurrently
      const promises = Array.from({ length: daemonCount }, (_, i) =>
        executeRun(`daemon-epic-${i}`, {})
      );
      
      await Promise.all(promises);
      
      const executionTime = testUtils.endTimer(startTime);
      
      expect(processesSpawned).toBe(daemonCount);
      expect(executionTime).toBeLessThan(30000); // Under 30 seconds
      
      console.log(`⚙️ ${daemonCount} daemon processes started in ${executionTime}ms`);
    });

    it('should recover from process spawn failures', async () => {
      let spawnAttempts = 0;
      const maxAttempts = 5;
      
      mockSpawn.mockImplementation(() => {
        spawnAttempts++;
        if (spawnAttempts <= 3) {
          // Simulate failures for first 3 attempts
          throw new Error('Process spawn failed');
        }
        return testUtils.mockSpawn({ code: 0 });
      });

      const { executeRun } = await import('../../bin/hydra.mjs');
      
      // Should eventually succeed after retries
      await executeRun('resilient-epic', {});
      
      expect(spawnAttempts).toBeGreaterThan(3);
      expect(spawnAttempts).toBeLessThanOrEqual(maxAttempts);
    });
  });

  describe('Performance Regression Detection', () => {
    it('should maintain consistent performance across test runs', async () => {
      const testRuns = 10;
      const executionTimes = [];
      
      const { executeNew } = await import('../../bin/hydra.mjs');
      
      for (let run = 0; run < testRuns; run++) {
        const runStart = testUtils.startTimer();
        await executeNew(`regression-test-${run}`, {});
        const runTime = testUtils.endTimer(runStart);
        executionTimes.push(runTime);
      }
      
      // Calculate performance statistics
      const avgTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
      const minTime = Math.min(...executionTimes);
      const maxTime = Math.max(...executionTimes);
      const stdDev = Math.sqrt(
        executionTimes.reduce((acc, time) => acc + Math.pow(time - avgTime, 2), 0) / executionTimes.length
      );
      
      // Performance should be consistent
      expect(stdDev / avgTime).toBeLessThan(0.3); // Coefficient of variation < 30%
      expect(maxTime / minTime).toBeLessThan(3); // Max shouldn't be more than 3x min
      
      console.log(`📈 Performance stats: avg=${avgTime}ms, min=${minTime}ms, max=${maxTime}ms, stddev=${stdDev}ms`);
      
      // Store baseline for future comparison
      performanceMetrics.baselineAverage = avgTime;
      performanceMetrics.baselineStdDev = stdDev;
    });
  });

  afterEach(() => {
    // Report performance metrics
    if (performanceMetrics.executionTimes.length > 0) {
      const totalOperations = performanceMetrics.executionTimes.length;
      const avgExecutionTime = performanceMetrics.executionTimes.reduce((a, b) => a + b, 0) / totalOperations;
      
      console.log(`\n📊 Test Performance Summary:`);
      console.log(`   Total Operations: ${totalOperations}`);
      console.log(`   Average Execution Time: ${avgExecutionTime}ms`);
      console.log(`   File Operations: ${performanceMetrics.fileOperations}`);
      console.log(`   Process Spawns: ${performanceMetrics.processSpawns}`);
      
      if (performanceMetrics.memoryUsage.length > 0) {
        const maxMemory = Math.max(...performanceMetrics.memoryUsage.map(m => m.heapUsed));
        const avgMemory = performanceMetrics.memoryUsage.reduce((a, b) => a + b.heapUsed, 0) / performanceMetrics.memoryUsage.length;
        console.log(`   Peak Memory Usage: ${maxMemory}MB`);
        console.log(`   Average Memory Usage: ${avgMemory}MB`);
      }
    }
  });
});