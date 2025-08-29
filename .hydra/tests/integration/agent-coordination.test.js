/**
 * Integration tests for agent coordination and orchestration
 * Tests real agent interactions, file system operations, and workflow integration
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import path from 'path';
import fs from 'fs';
import { spawn, execSync } from 'child_process';
import { tmpdir } from 'os';

describe('Agent Coordination Integration Tests', () => {
  let testWorkspace;
  let originalCwd;

  beforeEach(async () => {
    originalCwd = process.cwd();
    testWorkspace = fs.mkdtempSync(path.join(tmpdir(), 'hydra-integration-'));
    process.chdir(testWorkspace);
    
    // Create basic project structure
    fs.mkdirSync('.claude/epics', { recursive: true });
    fs.mkdirSync('src', { recursive: true });
    fs.mkdirSync('tests', { recursive: true });
    
    // Create package.json for realistic project
    fs.writeFileSync('package.json', JSON.stringify({
      name: 'test-project',
      version: '1.0.0',
      scripts: {
        test: 'jest',
        build: 'webpack'
      },
      dependencies: {
        express: '^4.18.0',
        lodash: '^4.17.21'
      }
    }, null, 2));
    
    // Create sample source files
    fs.writeFileSync('src/app.js', `
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

module.exports = app;
    `.trim());
    
    fs.writeFileSync('src/utils.js', `
const _ = require('lodash');

function processData(data) {
  return _.map(data, item => ({
    ...item,
    processed: true
  }));
}

module.exports = { processData };
    `.trim());
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (fs.existsSync(testWorkspace)) {
      fs.rmSync(testWorkspace, { recursive: true, force: true });
    }
  });

  describe('End-to-end workflow integration', () => {
    it('should complete full workflow: enhance -> plan -> run -> doctor', async () => {
      const { 
        executeEnhance, 
        executePlan, 
        executeRun, 
        executeDoctor 
      } = await import('../../bin/hydra.mjs');
      
      // Step 1: Enhance - Analyze existing codebase
      console.log('🔍 Step 1: Running enhance to analyze codebase...');
      
      await executeEnhance('add user authentication system', {});
      
      // Verify epic directory was created
      const epicPath = '.claude/epics/add-user-authentication-system';
      expect(fs.existsSync(epicPath)).toBe(true);
      
      // Step 2: Plan - Create genesis.xml (simulated)
      console.log('📋 Step 2: Running plan to create execution plan...');
      
      // Create mock PRP file for planning
      fs.writeFileSync(path.join(epicPath, 'prp.md'), `
# Product Requirement Prompt (PRP)

## Executive Summary
Add a comprehensive user authentication system to the existing Express.js application.

## Enhancement Requirements
- JWT-based authentication
- User registration and login
- Password hashing with bcrypt
- Protected routes middleware

## Integration Strategy
Integrate with existing Express.js architecture in src/app.js.
      `.trim());
      
      await executePlan('add-user-authentication-system', {});
      
      // Verify genesis.xml was created
      const genesisPath = path.join(epicPath, 'genesis.xml');
      expect(fs.existsSync(genesisPath)).toBe(true);
      
      // Step 3: Run - Execute the plan (simulated)
      console.log('🚀 Step 3: Running execution...');
      
      await executeRun('add-user-authentication-system', {});
      
      // Step 4: Doctor - Validate system health
      console.log('🏥 Step 4: Running health checks...');
      
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      
      await executeDoctor({});
      
      exitSpy.mockRestore();
      
    }, TEST_CONSTANTS.TIMEOUT.INTEGRATION);

    it('should handle workflow failures gracefully with proper cleanup', async () => {
      const { executeEnhance, executePlan } = await import('../../bin/hydra.mjs');
      
      // Simulate enhance failure
      await executeEnhance('invalid feature with special chars !@#$%', {});
      
      // Should still create epic directory with sanitized name
      expect(fs.existsSync('.claude/epics')).toBe(true);
      
      // Attempt to plan with missing PRP
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      try {
        await executePlan('non-existent-epic', {});
      } catch (error) {
        expect(error.message).toContain('Epic not found');
      }
      
      consoleSpy.mockRestore();
      
    }, TEST_CONSTANTS.TIMEOUT.INTEGRATION);
  });

  describe('File system operations and integrity', () => {
    it('should maintain file system integrity across operations', async () => {
      const { executeNew, executeEnhance } = await import('../../bin/hydra.mjs');
      
      // Create multiple epics
      const features = [
        'user-management-system',
        'payment-processing-module',
        'notification-service'
      ];
      
      for (const feature of features) {
        await executeNew(feature, {});
        
        const epicPath = `.claude/epics/${feature}`;
        expect(fs.existsSync(epicPath)).toBe(true);
        
        // Verify directory structure
        const epicContents = fs.readdirSync(epicPath);
        expect(epicContents.length).toBeGreaterThan(0);
      }
      
      // Verify no cross-contamination between epics
      const epicsDir = fs.readdirSync('.claude/epics');
      expect(epicsDir).toHaveLength(features.length);
      expect(epicsDir.sort()).toEqual(features.sort());
      
      // Test enhance on existing project structure
      await executeEnhance('api-optimization-enhancements', {});
      
      // Should not affect existing epics
      const epicsAfterEnhance = fs.readdirSync('.claude/epics');
      expect(epicsAfterEnhance).toHaveLength(features.length + 1);
      
    }, TEST_CONSTANTS.TIMEOUT.INTEGRATION);

    it('should handle concurrent file operations safely', async () => {
      const { executeNew } = await import('../../bin/hydra.mjs');
      
      const concurrentFeatures = [
        'concurrent-feature-1',
        'concurrent-feature-2',
        'concurrent-feature-3',
        'concurrent-feature-4',
        'concurrent-feature-5'
      ];
      
      // Execute multiple operations concurrently
      const promises = concurrentFeatures.map(feature => 
        executeNew(feature, {})
      );
      
      await Promise.all(promises);
      
      // Verify all epics were created correctly
      for (const feature of concurrentFeatures) {
        const epicPath = `.claude/epics/${feature}`;
        expect(fs.existsSync(epicPath)).toBe(true);
        
        // Verify each epic has its own isolated directory
        const epicContents = fs.readdirSync(epicPath);
        expect(epicContents.length).toBeGreaterThan(0);
      }
      
      // Verify no file corruption or race conditions
      const epicsDir = fs.readdirSync('.claude/epics');
      expect(epicsDir).toHaveLength(concurrentFeatures.length);
      
    }, TEST_CONSTANTS.TIMEOUT.INTEGRATION);

    it('should recover from partial file operations', async () => {
      const { executeNew } = await import('../../bin/hydra.mjs');
      
      // Create epic directory manually (simulating partial operation)
      const epicPath = '.claude/epics/partial-operation-test';
      fs.mkdirSync(epicPath, { recursive: true });
      
      // Create incomplete file structure
      fs.writeFileSync(path.join(epicPath, 'partial.txt'), 'incomplete');
      
      // Execute new command on existing epic
      await executeNew('partial-operation-test', {});
      
      // Should handle existing directory gracefully
      expect(fs.existsSync(epicPath)).toBe(true);
      
      // Should complete the operation
      const epicContents = fs.readdirSync(epicPath);
      expect(epicContents.length).toBeGreaterThan(1); // Should have more than just partial.txt
      
    }, TEST_CONSTANTS.TIMEOUT.INTEGRATION);
  });

  describe('Agent communication and coordination', () => {
    it('should successfully coordinate between multiple agents', async () => {
      const { executeEnhance } = await import('../../bin/hydra.mjs');
      
      // Mock external agent responses
      const originalSpawn = spawn;
      let agentCallCount = 0;
      
      jest.doMock('child_process', () => ({
        ...jest.requireActual('child_process'),
        spawn: jest.fn((command, args, options) => {
          agentCallCount++;
          
          if (args[0] && args[0].includes('code-analyzer')) {
            // Simulate successful code analysis
            const mockChild = {
              pid: 12345,
              on: jest.fn((event, callback) => {
                if (event === 'exit') {
                  setTimeout(() => callback(0, null), 100);
                }
              }),
              stdout: { on: jest.fn() },
              stderr: { on: jest.fn() },
              unref: jest.fn()
            };
            return mockChild;
          }
          
          return originalSpawn(command, args, options);
        })
      }));
      
      await executeEnhance('multi-agent coordination test', {});
      
      expect(agentCallCount).toBeGreaterThan(0);
      
    }, TEST_CONSTANTS.TIMEOUT.INTEGRATION);

    it('should handle agent failures with proper fallbacks', async () => {
      const { executeEnhance } = await import('../../bin/hydra.mjs');
      
      // Mock agent failure
      jest.doMock('child_process', () => ({
        ...jest.requireActual('child_process'),
        spawn: jest.fn(() => ({
          pid: 12345,
          on: jest.fn((event, callback) => {
            if (event === 'exit') {
              setTimeout(() => callback(1, null), 100); // Exit with error
            }
          }),
          stdout: { on: jest.fn() },
          stderr: { on: jest.fn() },
          unref: jest.fn()
        }))
      }));\n      \n      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();\n      \n      // Should handle agent failure gracefully\n      await executeEnhance('agent failure test', {});\n      \n      // Should still create epic directory\n      expect(fs.existsSync('.claude/epics/agent-failure-test')).toBe(true);\n      \n      consoleSpy.mockRestore();\n      \n    }, TEST_CONSTANTS.TIMEOUT.INTEGRATION);\n\n    it('should validate agent communication protocols', async () => {\n      const { executeNew } = await import('../../bin/hydra.mjs');\n      \n      let communicationProtocol = null;\n      \n      // Mock spawn to capture communication\n      jest.doMock('child_process', () => ({\n        ...jest.requireActual('child_process'),\n        spawn: jest.fn((command, args, options) => {\n          communicationProtocol = { command, args, options };\n          \n          return {\n            pid: 12345,\n            on: jest.fn((event, callback) => {\n              if (event === 'exit') {\n                setTimeout(() => callback(0, null), 50);\n              }\n            }),\n            stdout: { on: jest.fn() },\n            stderr: { on: jest.fn() },\n            unref: jest.fn()\n          };\n        })\n      }));\n      \n      await executeNew('protocol validation test', {});\n      \n      // Verify communication protocol\n      expect(communicationProtocol).toBeDefined();\n      expect(communicationProtocol.command).toBe('claude');\n      expect(communicationProtocol.args).toBeDefined();\n      expect(communicationProtocol.options).toMatchObject({\n        stdio: expect.any(Array),\n        shell: false\n      });\n      \n    }, TEST_CONSTANTS.TIMEOUT.INTEGRATION);\n  });\n\n  describe('Living Blueprint system integration', () => {\n    it('should create and maintain genesis.xml files correctly', async () => {\n      const { executePlan } = await import('../../bin/hydra.mjs');\n      \n      // Create epic with PRP\n      const epicName = 'genesis-xml-test';\n      const epicPath = `.claude/epics/${epicName}`;\n      fs.mkdirSync(epicPath, { recursive: true });\n      \n      fs.writeFileSync(path.join(epicPath, 'prp.md'), `\n# Test PRP\n\n## Requirements\nTest genesis.xml creation and management.\n      `.trim());\n      \n      await executePlan(epicName, {});\n      \n      // Verify genesis.xml creation\n      const genesisPath = path.join(epicPath, 'genesis.xml');\n      expect(fs.existsSync(genesisPath)).toBe(true);\n      \n      // Verify XML structure\n      const genesisContent = fs.readFileSync(genesisPath, 'utf8');\n      expect(genesisContent).toBeValidXml();\n      expect(genesisContent).toContain('<projectGenesis>');\n      expect(genesisContent).toContain('<metadata>');\n      expect(genesisContent).toContain('<executionPlan>');\n      \n    }, TEST_CONSTANTS.TIMEOUT.INTEGRATION);\n\n    it('should update genesis.xml during workflow progression', async () => {\n      const { executePlan, executeRun } = await import('../../bin/hydra.mjs');\n      \n      const epicName = 'workflow-progression-test';\n      const epicPath = `.claude/epics/${epicName}`;\n      fs.mkdirSync(epicPath, { recursive: true });\n      \n      // Create PRP\n      fs.writeFileSync(path.join(epicPath, 'prp.md'), `\n# Workflow Test\n\n## Tasks\n- Task 1: Setup\n- Task 2: Implementation\n- Task 3: Testing\n      `.trim());\n      \n      // Plan phase\n      await executePlan(epicName, {});\n      \n      const genesisPath = path.join(epicPath, 'genesis.xml');\n      const initialContent = fs.readFileSync(genesisPath, 'utf8');\n      \n      // Run phase (simulated)\n      await executeRun(epicName, {});\n      \n      // Verify genesis.xml was updated\n      const updatedContent = fs.readFileSync(genesisPath, 'utf8');\n      expect(updatedContent).not.toBe(initialContent);\n      \n      // Should contain execution tracking\n      expect(updatedContent).toContain('auditLog');\n      \n    }, TEST_CONSTANTS.TIMEOUT.INTEGRATION);\n  });\n\n  describe('Error handling and recovery', () => {\n    it('should handle system resource limitations gracefully', async () => {\n      const { executeEnhance } = await import('../../bin/hydra.mjs');\n      \n      // Create resource-intensive scenario\n      const largeFeatureSet = Array.from({ length: 100 }, (_, i) => \n        `feature-${i}-with-very-long-name-to-test-resource-limits`\n      );\n      \n      const startTime = Date.now();\n      \n      for (let i = 0; i < 5; i++) { // Test first 5 to avoid timeout\n        await executeEnhance(largeFeatureSet[i], {});\n      }\n      \n      const endTime = Date.now();\n      expect(endTime - startTime).toBeLessThan(30000); // Should complete within 30 seconds\n      \n      // Verify all epics were created\n      for (let i = 0; i < 5; i++) {\n        const expectedEpicDir = `.claude/epics/${largeFeatureSet[i]}`;\n        expect(fs.existsSync(expectedEpicDir)).toBe(true);\n      }\n      \n    }, TEST_CONSTANTS.TIMEOUT.INTEGRATION);\n\n    it('should maintain system stability under stress', async () => {\n      const { executeDoctor } = await import('../../bin/hydra.mjs');\n      \n      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});\n      const startMemory = testUtils.getMemoryUsage();\n      \n      // Run health checks multiple times\n      for (let i = 0; i < 10; i++) {\n        await executeDoctor({});\n      }\n      \n      const endMemory = testUtils.getMemoryUsage();\n      const memoryGrowth = endMemory.heapUsed - startMemory.heapUsed;\n      \n      // Should not have significant memory leaks\n      expect(memoryGrowth).toBeMemoryEfficient(100); // Less than 100MB growth\n      \n      exitSpy.mockRestore();\n      \n    }, TEST_CONSTANTS.TIMEOUT.INTEGRATION);\n\n    it('should recover from corrupt configuration files', async () => {\n      const { executeDoctor } = await import('../../bin/hydra.mjs');\n      \n      // Create corrupt genesis.xml\n      const corruptEpicPath = '.claude/epics/corrupt-epic';\n      fs.mkdirSync(corruptEpicPath, { recursive: true });\n      fs.writeFileSync(path.join(corruptEpicPath, 'genesis.xml'), 'invalid xml content');\n      \n      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});\n      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();\n      \n      await executeDoctor({});\n      \n      // Should detect and report corruption\n      expect(consoleSpy).toHaveBeenCalledWith(\n        expect.stringContaining('XML validation failed')\n      );\n      \n      exitSpy.mockRestore();\n      consoleSpy.mockRestore();\n      \n    }, TEST_CONSTANTS.TIMEOUT.INTEGRATION);\n  });\n\n  describe('Performance benchmarking', () => {\n    it('should complete operations within performance benchmarks', async () => {\n      const { executeNew, executeEnhance, executeDoctor } = await import('../../bin/hydra.mjs');\n      \n      const benchmarks = [];\n      \n      // Benchmark: New command\n      let startTime = testUtils.startTimer();\n      await executeNew('benchmark-test-new', {});\n      benchmarks.push({ command: 'new', time: testUtils.endTimer(startTime) });\n      \n      // Benchmark: Enhance command\n      startTime = testUtils.startTimer();\n      await executeEnhance('benchmark-test-enhance', {});\n      benchmarks.push({ command: 'enhance', time: testUtils.endTimer(startTime) });\n      \n      // Benchmark: Doctor command\n      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});\n      startTime = testUtils.startTimer();\n      await executeDoctor({});\n      benchmarks.push({ command: 'doctor', time: testUtils.endTimer(startTime) });\n      exitSpy.mockRestore();\n      \n      // Verify performance benchmarks\n      benchmarks.forEach(benchmark => {\n        console.log(`${benchmark.command} command: ${benchmark.time}ms`);\n        expect(benchmark.time).toHaveExecutionTime(5000); // All commands under 5 seconds\n      });\n      \n    }, TEST_CONSTANTS.TIMEOUT.INTEGRATION);\n  });\n});