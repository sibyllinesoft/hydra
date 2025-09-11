/**
 * Jest Setup Configuration for Hydra CLI Tests
 * Provides global test utilities and mocks
 */

import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';

// Extend Jest timeout for integration and stress tests
jest.setTimeout(30000);

// Import test extensions
import 'jest-extended';

// Global test utilities and constants
global.TEST_CONSTANTS = {
  TIMEOUT: {
    UNIT: 5000,
    INTEGRATION: 15000,
    E2E: 30000,
    STRESS: 60000
  },
  FILES: {
    GENESIS_XML: 'genesis.xml',
    PRP_MD: 'prp.md',
    LOG_FILE: 'orchestrator.log'
  },
  COMMANDS: {
    HYDRA_NEW: 'hydra new',
    HYDRA_PLAN: 'hydra plan',
    HYDRA_RUN: 'hydra run',
    HYDRA_DOCTOR: 'hydra doctor',
    HYDRA_ENHANCE: 'hydra enhance',
    HYDRA_RECAP: 'hydra recap',
    HYDRA_ORCHESTRATE: 'hydra orchestrate'
  }
};

// Enhanced global test utilities
global.testUtils = {
  // Create temporary test directory
  createTempDir: () => {
    const tempDir = fs.mkdtempSync(path.join(tmpdir(), 'hydra-test-'));
    return tempDir;
  },

  // Clean up test directories
  cleanupTempDir: (dir) => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  },

  // Create mock genesis.xml file
  createMockGenesis: (dir, epicName, options = {}) => {
    const genesisContent = `<?xml version="1.0" encoding="UTF-8"?>
<projectGenesis>
  <metadata>
    <projectName>${options.projectName || 'Test Project'}</projectName>
    <epicName>${epicName}</epicName>
    <status>${options.status || 'planning'}</status>
    <createdAt>${new Date().toISOString()}</createdAt>
    <lastUpdatedAt>${new Date().toISOString()}</lastUpdatedAt>
  </metadata>
  <vision>
    <problemStatement>${options.problemStatement || 'Test problem statement'}</problemStatement>
  </vision>
  <executionPlan>
    <executionDag>
      <parallelSets>
        <parallelGroup level="1">
          <taskRef id="task1"/>
          <taskRef id="task2"/>
        </parallelGroup>
      </parallelSets>
    </executionDag>
    <statusTracker>
      <pending>
        <taskRef id="task1"/>
        <taskRef id="task2"/>
      </pending>
      <inProgress/>
      <completed/>
      <failed/>
    </statusTracker>
  </executionPlan>
  <metrics>
    <progress>
      <totalTasks>2</totalTasks>
      <completedTasks>0</completedTasks>
      <inProgressTasks>0</inProgressTasks>
      <percentageComplete>0</percentageComplete>
    </progress>
  </metrics>
  <auditLog/>
</projectGenesis>`;

    const epicDir = path.join(dir, '.claude', 'epics', epicName);
    fs.mkdirSync(epicDir, { recursive: true });
    fs.writeFileSync(path.join(epicDir, 'genesis.xml'), genesisContent);
    return path.join(epicDir, 'genesis.xml');
  },

  // Create mock PRP file
  createMockPRP: (dir, epicName, content = 'Test PRP content') => {
    const epicDir = path.join(dir, '.claude', 'epics', epicName);
    fs.mkdirSync(epicDir, { recursive: true });
    fs.writeFileSync(path.join(epicDir, 'prp.md'), content);
    return path.join(epicDir, 'prp.md');
  },

  // Mock child process spawn
  mockSpawn: (mockExecResult = { code: 0, stdout: '', stderr: '' }) => {
    const mockChild = {
      pid: 12345,
      on: jest.fn((event, callback) => {
        if (event === 'exit') {
          setTimeout(() => callback(mockExecResult.code, null), 10);
        }
        if (event === 'error' && mockExecResult.error) {
          setTimeout(() => callback(mockExecResult.error), 10);
        }
      }),
      stdout: {
        on: jest.fn()
      },
      stderr: {
        on: jest.fn()
      },
      unref: jest.fn()
    };
    return mockChild;
  },

  // Assert file exists with content
  assertFileExists: (filePath, expectedContent = null) => {
    expect(fs.existsSync(filePath)).toBe(true);
    if (expectedContent) {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain(expectedContent);
    }
  },

  // Mock xmlstarlet commands
  mockXmlstarlet: (returnValue = '') => {
    return jest.fn().mockReturnValue(returnValue);
  },

  // Create complex genesis.xml with multiple tasks and dependencies
  createComplexGenesis: (dir, epicName, taskCount = 10) => {
    const tasks = Array.from({ length: taskCount }, (_, i) => `task${i + 1}`);
    const parallelGroups = [];
    
    // Create DAG structure with multiple levels
    for (let level = 1; level <= Math.ceil(taskCount / 3); level++) {
      const levelTasks = tasks.slice((level - 1) * 3, level * 3);
      if (levelTasks.length > 0) {
        parallelGroups.push(`        <parallelGroup level="${level}">
${levelTasks.map(task => `          <taskRef id="${task}"/>`).join('\n')}\n        </parallelGroup>`);
      }
    }

    const genesisContent = `<?xml version="1.0" encoding="UTF-8"?>
<projectGenesis>
  <metadata>
    <projectName>Complex Test Project</projectName>
    <epicName>${epicName}</epicName>
    <status>in-progress</status>
    <createdAt>${new Date().toISOString()}</createdAt>
    <lastUpdatedAt>${new Date().toISOString()}</lastUpdatedAt>
  </metadata>
  <vision>
    <problemStatement>Complex multi-task project for testing</problemStatement>
  </vision>
  <executionPlan>
    <executionDag>
      <parallelSets>
${parallelGroups.join('\n')}
      </parallelSets>
    </executionDag>
    <statusTracker>
      <pending>
${tasks.slice(0, Math.floor(taskCount / 2)).map(task => `        <taskRef id="${task}"/>`).join('\n')}
      </pending>
      <inProgress>
${tasks.slice(Math.floor(taskCount / 2), Math.floor(taskCount * 0.8)).map(task => `        <taskRef id="${task}"/>`).join('\n')}
      </inProgress>
      <completed>
${tasks.slice(Math.floor(taskCount * 0.8)).map(task => `        <taskRef id="${task}"/>`).join('\n')}
      </completed>
      <failed/>
    </statusTracker>
  </executionPlan>
  <metrics>
    <progress>
      <totalTasks>${taskCount}</totalTasks>
      <completedTasks>${Math.floor(taskCount * 0.2)}</completedTasks>
      <inProgressTasks>${Math.floor(taskCount * 0.3)}</inProgressTasks>
      <percentageComplete>${Math.floor((Math.floor(taskCount * 0.2) / taskCount) * 100)}</percentageComplete>
    </progress>
  </metrics>
  <auditLog/>
</projectGenesis>`;

    const epicDir = path.join(dir, '.claude', 'epics', epicName);
    fs.mkdirSync(epicDir, { recursive: true });
    fs.writeFileSync(path.join(epicDir, 'genesis.xml'), genesisContent);
    return path.join(epicDir, 'genesis.xml');
  },

  // Mock environment variables
  mockEnv: (variables = {}) => {
    const originalEnv = { ...process.env };
    Object.assign(process.env, variables);
    return () => {
      process.env = originalEnv;
    };
  },

  // Wait for async operations
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate random test data
  generateRandomString: (length = 10) => {
    return Math.random().toString(36).substring(0, length);
  },

  // Create mock agent response
  createMockAgentResponse: (agentName, result = 'success', data = {}) => {
    return {
      agent: agentName,
      timestamp: new Date().toISOString(),
      result,
      data,
      executionTime: Math.floor(Math.random() * 5000) + 100
    };
  },

  // Performance timing utilities
  startTimer: () => process.hrtime.bigint(),
  endTimer: (startTime) => {
    const endTime = process.hrtime.bigint();
    return Number(endTime - startTime) / 1000000; // Convert to milliseconds
  },

  // Memory usage tracking
  getMemoryUsage: () => {
    const used = process.memoryUsage();
    return {
      rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(used.external / 1024 / 1024 * 100) / 100
    };
  },

  // Error simulation utilities
  simulateError: (type = 'generic', message = 'Simulated test error') => {
    const errors = {
      generic: new Error(message),
      spawn: Object.assign(new Error(message), { code: 'SPAWN_ERROR' }),
      timeout: Object.assign(new Error(message), { code: 'TIMEOUT' }),
      permission: Object.assign(new Error(message), { code: 'EACCES' }),
      notFound: Object.assign(new Error(message), { code: 'ENOENT' })
    };
    return errors[type] || errors.generic;
  },

  // Validate XML structure
  validateXmlStructure: (xmlContent, requiredElements = []) => {
    const hasXmlDeclaration = xmlContent.startsWith('<?xml');
    const hasRootElement = xmlContent.includes('<projectGenesis>');
    const hasRequiredElements = requiredElements.every(element => 
      xmlContent.includes(`<${element}>`) || xmlContent.includes(`<${element}/>`)
    );
    
    return {
      valid: hasXmlDeclaration && hasRootElement && hasRequiredElements,
      hasXmlDeclaration,
      hasRootElement,
      hasRequiredElements,
      missingElements: requiredElements.filter(element => 
        !xmlContent.includes(`<${element}>`) && !xmlContent.includes(`<${element}/>`)
      )
    };
  },

  // Create stress test data
  createStressTestData: (size = 'medium') => {
    const sizes = {
      small: { epics: 5, tasksPerEpic: 10, contentSize: 1000 },
      medium: { epics: 20, tasksPerEpic: 50, contentSize: 10000 },
      large: { epics: 100, tasksPerEpic: 100, contentSize: 50000 }
    };
    
    const config = sizes[size] || sizes.medium;
    const testData = [];
    
    for (let i = 0; i < config.epics; i++) {
      const epicData = {
        name: `stress-test-epic-${i}`,
        tasks: Array.from({ length: config.tasksPerEpic }, (_, j) => ({
          id: `task-${i}-${j}`,
          description: 'x'.repeat(config.contentSize),
          status: ['pending', 'in-progress', 'completed'][j % 3]
        }))
      };
      testData.push(epicData);
    }
    
    return testData;
  }
};

// Global mocks
global.mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

// Enhanced external dependency mocks with realistic behaviors
jest.mock('child_process', () => ({
  execSync: jest.fn(),
  spawn: jest.fn(),
  exec: jest.fn()
}));

jest.mock('os', () => ({
  ...jest.requireActual('os'),
  tmpdir: jest.fn(() => '/tmp/test'),
  homedir: jest.fn(() => '/home/test')
}));

jest.mock('path', () => ({
  ...jest.requireActual('path')
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  rmSync: jest.fn(),
  mkdtempSync: jest.fn(),
  statSync: jest.fn(),
  readdirSync: jest.fn()
}));

// Setup and teardown hooks
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  
  // Reset console mocks
  global.mockConsole.log.mockClear();
  global.mockConsole.error.mockClear();
  global.mockConsole.warn.mockClear();
});

afterEach(() => {
  // Cleanup any temp directories created during tests
  // This is handled by individual tests using testUtils.cleanupTempDir
});

// Enhanced error handling for tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Fail tests on unhandled rejections
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Global test matchers
expect.extend({
  toBeValidXml(received) {
    const validation = global.testUtils.validateXmlStructure(received, ['metadata', 'vision', 'executionPlan']);
    return {
      message: () => `Expected XML to be valid. Missing elements: ${validation.missingElements.join(', ')}`,
      pass: validation.valid
    };
  },
  
  toHaveExecutionTime(received, expected) {
    const actualTime = typeof received === 'number' ? received : received.executionTime;
    return {
      message: () => `Expected execution time to be under ${expected}ms, but got ${actualTime}ms`,
      pass: actualTime < expected
    };
  },
  
  toBeMemoryEfficient(received, maxMB = 100) {
    const memoryMB = received.heapUsed || received.rss || received;
    return {
      message: () => `Expected memory usage to be under ${maxMB}MB, but got ${memoryMB}MB`,
      pass: memoryMB < maxMB
    };
  }
});

console.log('🧪 Enhanced Jest setup completed - Hydra CLI production test suite ready');
console.log(`🎯 Coverage thresholds: 95% lines, 95% functions, 90% branches, 95% statements`);
console.log(`⚡ Test timeouts: Unit(${global.TEST_CONSTANTS.TIMEOUT.UNIT}ms), Integration(${global.TEST_CONSTANTS.TIMEOUT.INTEGRATION}ms), E2E(${global.TEST_CONSTANTS.TIMEOUT.E2E}ms), Stress(${global.TEST_CONSTANTS.TIMEOUT.STRESS}ms)`);