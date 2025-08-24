/**
 * Mock Factories for Hydra CLI Testing
 * Provides comprehensive mocks for external dependencies and system interactions
 */

import { jest } from '@jest/globals';
import { testDataFactory } from './test-data-factory.js';

export class MockFactories {
  constructor() {
    this.processRegistry = new Map();
    this.fileSystemState = new Map();
    this.commandHistory = [];
    this.networkRequests = [];
  }

  // File System Mocks
  createFileSystemMock(initialState = {}) {
    this.fileSystemState = new Map(Object.entries(initialState));
    
    const fsMock = {
      existsSync: jest.fn((filePath) => {
        // Always allow basic directory structure
        if (filePath.includes('.claude') || filePath.includes('prompts')) {
          return true;
        }
        
        return this.fileSystemState.has(filePath) || 
               filePath.includes('node_modules') || 
               filePath.includes('package.json');
      }),

      readFileSync: jest.fn((filePath, encoding = 'utf8') => {
        if (this.fileSystemState.has(filePath)) {
          const content = this.fileSystemState.get(filePath);
          return typeof content === 'string' ? content : JSON.stringify(content, null, 2);
        }
        
        // Generate realistic content based on file type
        const extension = filePath.split('.').pop();
        return this.generateMockFileContent(extension, filePath);
      }),

      writeFileSync: jest.fn((filePath, content, options) => {
        this.fileSystemState.set(filePath, content);
        
        // Log writes to sensitive locations
        if (this.isSensitivePath(filePath)) {
          console.warn(`⚠️ Write to sensitive path: ${filePath}`);
        }
      }),

      mkdirSync: jest.fn((dirPath, options) => {
        this.fileSystemState.set(dirPath, { __isDirectory: true });
        
        // Validate directory creation permissions
        if (this.isSensitivePath(dirPath)) {
          const error = new Error('Permission denied');
          error.code = 'EACCES';
          throw error;
        }
      }),

      rmSync: jest.fn((filePath, options) => {
        this.fileSystemState.delete(filePath);
      }),

      statSync: jest.fn((filePath) => {
        const isDirectory = this.fileSystemState.has(filePath) && 
                           this.fileSystemState.get(filePath)?.__isDirectory;
        
        return {
          isDirectory: () => isDirectory,
          isFile: () => !isDirectory,
          isSymbolicLink: () => false,
          mode: this.isSensitivePath(filePath) ? 0o000 : 0o644,
          size: this.calculateMockFileSize(filePath),
          mtime: new Date(),
          ctime: new Date()
        };
      }),

      readdirSync: jest.fn((dirPath) => {
        const entries = [];
        for (const [path, content] of this.fileSystemState.entries()) {
          if (path.startsWith(dirPath + '/') && !path.includes('/', dirPath.length + 1)) {
            entries.push(path.substring(dirPath.length + 1));
          }
        }
        return entries;
      }),

      mkdtempSync: jest.fn((template) => {
        const tempDir = template + testDataFactory.randomString(6);
        this.fileSystemState.set(tempDir, { __isDirectory: true });
        return tempDir;
      }),

      lstatSync: jest.fn((filePath) => {
        // Enhanced for symlink detection
        const isSymlink = filePath.includes('symlink') || filePath.includes('link');
        return {
          isSymbolicLink: () => isSymlink,
          isDirectory: () => !isSymlink && this.fileSystemState.get(filePath)?.__isDirectory,
          isFile: () => !isSymlink && !this.fileSystemState.get(filePath)?.__isDirectory,
          mode: 0o644,
          size: this.calculateMockFileSize(filePath)
        };
      })
    };

    return fsMock;
  }

  generateMockFileContent(extension, filePath) {
    if (filePath.includes('strategic-analysis.md')) {
      return `# Strategic Analysis Template\n\nFeature: {{feature_name}}\n\n## Analysis\n\n${testDataFactory.generateProjectDescription('feature', 'web-app')}`;
    }
    
    if (filePath.includes('genesis.xml')) {
      const epicName = this.extractEpicName(filePath);
      return testDataFactory.generateGenesisXml(epicName || 'test-epic');
    }
    
    if (filePath.includes('prp.md')) {
      return `# Project Requirements Profile\n\n## Requirements for {{feature_name}}\n\n${testDataFactory.generateProjectDescription('requirements', 'api-service')}`;
    }
    
    if (filePath.includes('package.json')) {
      return JSON.stringify(testDataFactory.generateProjectMetadata(), null, 2);
    }
    
    // Generate content based on file extension
    switch (extension) {
      case 'js':
        return testDataFactory.generateFileContent('javascript', 'medium');
      case 'ts':
        return testDataFactory.generateFileContent('typescript', 'medium');
      case 'py':
        return testDataFactory.generateFileContent('python', 'medium');
      case 'json':
        return testDataFactory.generateFileContent('json', 'medium');
      case 'yaml':
      case 'yml':
        return testDataFactory.generateFileContent('yaml', 'medium');
      case 'md':
        return testDataFactory.generateFileContent('markdown', 'medium');
      case 'xml':
        return testDataFactory.generateFileContent('xml', 'medium');
      default:
        return 'Mock file content for testing purposes';
    }
  }

  extractEpicName(filePath) {
    const matches = filePath.match(/epics\/([^\/]+)/);
    return matches ? matches[1] : null;
  }

  isSensitivePath(filePath) {
    const sensitivePaths = [
      '/etc/', '/usr/', '/root/', '/sys/', '/proc/',
      'C:\\Windows\\', 'C:\\Program Files\\',
      '../', '..\\', '~/'
    ];
    
    return sensitivePaths.some(sensitive => filePath.includes(sensitive));
  }

  calculateMockFileSize(filePath) {
    // Return realistic file sizes based on file type
    const extension = filePath.split('.').pop();
    const baseSizes = {
      js: 1024 * 5,      // 5KB
      ts: 1024 * 8,      // 8KB
      py: 1024 * 6,      // 6KB
      json: 1024 * 2,    // 2KB
      xml: 1024 * 10,    // 10KB
      md: 1024 * 3,      // 3KB
      txt: 1024          // 1KB
    };
    
    return baseSizes[extension] || 1024;
  }

  // Process/Child Process Mocks
  createProcessMock(mockBehavior = {}) {
    const defaultBehavior = {
      exitCode: 0,
      stdout: 'Mock process output',
      stderr: '',
      delay: 100,
      error: null,
      ...mockBehavior
    };

    const mockProcess = {
      pid: testDataFactory.randomInt(1000, 9999),
      exitCode: null,
      killed: false,
      
      stdout: {
        on: jest.fn((event, callback) => {
          if (event === 'data' && defaultBehavior.stdout) {
            setTimeout(() => callback(defaultBehavior.stdout), defaultBehavior.delay);
          }
        }),
        pipe: jest.fn()
      },
      
      stderr: {
        on: jest.fn((event, callback) => {
          if (event === 'data' && defaultBehavior.stderr) {
            setTimeout(() => callback(defaultBehavior.stderr), defaultBehavior.delay);
          }
        })
      },
      
      on: jest.fn((event, callback) => {
        if (event === 'exit') {
          setTimeout(() => {
            this.exitCode = defaultBehavior.exitCode;
            callback(defaultBehavior.exitCode, null);
          }, defaultBehavior.delay);
        } else if (event === 'error' && defaultBehavior.error) {
          setTimeout(() => callback(defaultBehavior.error), defaultBehavior.delay);
        } else if (event === 'close') {
          setTimeout(() => callback(defaultBehavior.exitCode), defaultBehavior.delay);
        }
      }),
      
      kill: jest.fn((signal = 'SIGTERM') => {
        this.killed = true;
        this.exitCode = signal === 'SIGKILL' ? -9 : -15;
        return true;
      }),
      
      unref: jest.fn(),
      disconnect: jest.fn(),
      send: jest.fn(),
      
      // Additional methods for daemon processes
      detached: mockBehavior.detached || false,
      stdio: mockBehavior.stdio || ['pipe', 'pipe', 'pipe']
    };

    // Register process for tracking
    this.processRegistry.set(mockProcess.pid, {
      process: mockProcess,
      command: mockBehavior.command || 'mock-command',
      args: mockBehavior.args || [],
      startTime: Date.now(),
      behavior: defaultBehavior
    });

    return mockProcess;
  }

  createSpawnMock() {
    return jest.fn((command, args = [], options = {}) => {
      this.commandHistory.push({ command, args, options, timestamp: Date.now() });
      
      // Special handling for different command types
      let mockBehavior = { command, args, ...options };
      
      if (command === 'node' && args.includes('orchestrator-daemon.mjs')) {
        mockBehavior = {
          ...mockBehavior,
          detached: true,
          exitCode: 0,
          stdout: 'Daemon started successfully',
          delay: 50
        };
      } else if (command === 'claude') {
        mockBehavior = {
          ...mockBehavior,
          exitCode: 0,
          stdout: 'Claude processing completed',
          delay: 200
        };
      } else if (command === 'xmlstarlet') {
        mockBehavior = {
          ...mockBehavior,
          exitCode: 0,
          stdout: '<result>processed</result>',
          delay: 100
        };
      }
      
      // Simulate command failures based on command content
      if (this.shouldSimulateFailure(command, args)) {
        mockBehavior.exitCode = 1;
        mockBehavior.error = new Error('Command failed');
        mockBehavior.stderr = 'Mock command error';
      }
      
      return this.createProcessMock(mockBehavior);
    });
  }

  createExecMock() {
    return jest.fn((command, options, callback) => {
      // Handle both callback and options parameter variations
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      
      this.commandHistory.push({ command, options, timestamp: Date.now(), type: 'exec' });
      
      // Simulate command execution delay
      const delay = this.getCommandDelay(command);
      
      setTimeout(() => {
        let result = { stdout: '', stderr: '' };
        let error = null;
        
        // Handle different command types
        if (command.includes('xmlstarlet')) {
          result.stdout = '<result>XML processed successfully</result>';
        } else if (command.includes('gh auth status')) {
          result.stdout = this.generateGitHubAuthStatus();
        } else if (command.includes('git')) {
          result.stdout = this.generateGitOutput(command);
        } else if (command.includes('npm') || command.includes('yarn')) {
          result.stdout = this.generatePackageManagerOutput(command);
        } else {
          result.stdout = 'Command executed successfully';
        }
        
        // Simulate failures for dangerous commands
        if (this.shouldSimulateFailure(command)) {
          error = new Error('Command execution failed');
          error.code = 1;
          result.stderr = 'Command not found or access denied';
        }
        
        callback(error, result);
      }, delay);
    });
  }

  shouldSimulateFailure(command, args = []) {
    const dangerousPatterns = [
      /rm\s+-rf/,
      /wget.*malicious/,
      /curl.*evil/,
      /nc\s+.*\d+/,
      /eval\s*\(/,
      /system\s*\(/,
      /exec\s*\(/
    ];
    
    const fullCommand = `${command} ${Array.isArray(args) ? args.join(' ') : ''}`;
    return dangerousPatterns.some(pattern => pattern.test(fullCommand));
  }

  getCommandDelay(command) {
    // Realistic delays for different command types
    if (command.includes('xmlstarlet')) return 150;
    if (command.includes('gh ')) return 300;
    if (command.includes('git ')) return 100;
    if (command.includes('npm ') || command.includes('yarn ')) return 500;
    if (command.includes('docker ')) return 1000;
    return 50;
  }

  generateGitHubAuthStatus() {
    const statuses = [
      'Logged in to github.com as testuser (keyring)',
      'Logged in to github.com as devuser (oauth_token)',
      'Not logged in to github.com',
      'Token expired. Please re-authenticate.'
    ];
    
    return testDataFactory.randomChoice(statuses);
  }

  generateGitOutput(command) {
    if (command.includes('status')) {
      return `On branch main
Your branch is up to date with 'origin/main'.

Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        modified:   src/main.js
        new file:   tests/new-test.js

Untracked files:
  (use "git add <file>..." to include in what will be committed)

        temp-file.txt`;
    }
    
    if (command.includes('log')) {
      return `commit ${testDataFactory.randomString(40, '0123456789abcdef')}
Author: Test User <test@example.com>
Date:   ${new Date().toISOString()}

    Add new feature implementation

commit ${testDataFactory.randomString(40, '0123456789abcdef')}
Author: Test User <test@example.com>
Date:   ${new Date(Date.now() - 86400000).toISOString()}

    Update documentation`;
    }
    
    return 'Git command executed successfully';
  }

  generatePackageManagerOutput(command) {
    if (command.includes('install')) {
      const packageCount = testDataFactory.randomInt(5, 20);
      return `
added ${packageCount} packages, and audited ${packageCount + testDataFactory.randomInt(50, 200)} packages in ${testDataFactory.randomInt(5, 30)}s

${testDataFactory.randomInt(0, 5)} vulnerabilities (${testDataFactory.randomInt(0, 3)} low, ${testDataFactory.randomInt(0, 2)} moderate)

To address all issues, run:
  npm audit fix`;
    }
    
    if (command.includes('audit')) {
      const vulnerabilities = testDataFactory.randomInt(0, 10);
      return vulnerabilities > 0 
        ? `found ${vulnerabilities} vulnerabilities (${Math.floor(vulnerabilities/2)} low, ${Math.ceil(vulnerabilities/2)} moderate)`
        : 'found 0 vulnerabilities';
    }
    
    return 'Package manager command completed';
  }

  // Network/HTTP Mocks
  createNetworkMock() {
    const networkMock = {
      requests: [],
      
      fetch: jest.fn(async (url, options = {}) => {
        const request = {
          url,
          method: options.method || 'GET',
          headers: options.headers || {},
          body: options.body,
          timestamp: Date.now()
        };
        
        this.networkRequests.push(request);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, testDataFactory.randomInt(50, 300)));
        
        // Generate realistic responses
        if (url.includes('api.github.com')) {
          return this.createGitHubApiResponse(url, options);
        } else if (url.includes('malicious') || url.includes('evil')) {
          throw new Error('Network request blocked');
        }
        
        return this.createGenericResponse(url, options);
      }),
      
      XMLHttpRequest: jest.fn().mockImplementation(() => ({
        open: jest.fn(),
        send: jest.fn(),
        setRequestHeader: jest.fn(),
        readyState: 4,
        status: 200,
        responseText: '{"success": true}',
        onreadystatechange: null
      }))
    };
    
    return networkMock;
  }

  createGitHubApiResponse(url, options) {
    const mockData = {
      user: {
        login: 'testuser',
        id: testDataFactory.randomInt(1000, 9999),
        avatar_url: 'https://github.com/images/error/octocat_happy.gif',
        type: 'User'
      },
      repo: {
        id: testDataFactory.randomInt(1000000, 9999999),
        name: testDataFactory.generateProjectName(),
        full_name: `testuser/${testDataFactory.generateProjectName()}`,
        private: false,
        html_url: url,
        description: testDataFactory.generateProjectDescription('repo', 'library')
      }
    };
    
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Map([
        ['content-type', 'application/json'],
        ['x-ratelimit-remaining', '4999']
      ]),
      json: async () => mockData,
      text: async () => JSON.stringify(mockData)
    };
  }

  createGenericResponse(url, options) {
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Map([['content-type', 'application/json']]),
      json: async () => ({ success: true, url, timestamp: Date.now() }),
      text: async () => 'Generic response'
    };
  }

  // Environment and System Mocks
  createEnvironmentMock(customEnv = {}) {
    const mockEnv = {
      NODE_ENV: 'test',
      HOME: '/home/testuser',
      PATH: '/usr/local/bin:/usr/bin:/bin',
      TMPDIR: '/tmp',
      USER: 'testuser',
      SHELL: '/bin/bash',
      TERM: 'xterm-256color',
      LANG: 'en_US.UTF-8',
      ...customEnv
    };
    
    return {
      env: mockEnv,
      platform: 'linux',
      arch: 'x64',
      version: 'v18.0.0',
      versions: {
        node: '18.0.0',
        v8: '10.0.0',
        npm: '8.6.0'
      },
      
      // Mock process methods
      cwd: jest.fn(() => '/home/testuser/project'),
      chdir: jest.fn(),
      exit: jest.fn(),
      kill: jest.fn(),
      
      // Memory and CPU mocking
      memoryUsage: jest.fn(() => ({
        rss: testDataFactory.randomInt(50, 200) * 1024 * 1024,
        heapTotal: testDataFactory.randomInt(20, 100) * 1024 * 1024,
        heapUsed: testDataFactory.randomInt(10, 80) * 1024 * 1024,
        external: testDataFactory.randomInt(1, 10) * 1024 * 1024
      })),
      
      cpuUsage: jest.fn(() => ({
        user: testDataFactory.randomInt(1000, 50000),
        system: testDataFactory.randomInt(500, 20000)
      })),
      
      // High resolution time
      hrtime: {
        bigint: jest.fn(() => BigInt(Date.now() * 1000000))
      }
    };
  }

  // Console and Logging Mocks
  createConsoleMock() {
    return {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      
      // Enhanced methods
      group: jest.fn(),
      groupEnd: jest.fn(),
      time: jest.fn(),
      timeEnd: jest.fn(),
      assert: jest.fn(),
      
      // Capture all output for analysis
      getCapturedOutput: function() {
        return {
          logs: this.log.mock.calls,
          errors: this.error.mock.calls,
          warnings: this.warn.mock.calls,
          info: this.info.mock.calls
        };
      },
      
      // Clear all captured output
      clearCaptured: function() {
        this.log.mockClear();
        this.error.mockClear();
        this.warn.mockClear();
        this.info.mockClear();
        this.debug.mockClear();
        this.trace.mockClear();
      }
    };
  }

  // Utility Methods
  reset() {
    this.processRegistry.clear();
    this.fileSystemState.clear();
    this.commandHistory = [];
    this.networkRequests = [];
  }

  getState() {
    return {
      processes: Array.from(this.processRegistry.entries()),
      fileSystem: Array.from(this.fileSystemState.entries()),
      commandHistory: this.commandHistory,
      networkRequests: this.networkRequests
    };
  }

  // Analysis Methods
  getSecurityViolations() {
    const violations = [];
    
    // Check for dangerous commands
    this.commandHistory.forEach(cmd => {
      if (this.shouldSimulateFailure(cmd.command, cmd.args)) {
        violations.push({
          type: 'dangerous_command',
          command: cmd.command,
          args: cmd.args,
          timestamp: cmd.timestamp
        });
      }
    });
    
    // Check for suspicious file operations
    this.fileSystemState.forEach((content, path) => {
      if (this.isSensitivePath(path)) {
        violations.push({
          type: 'sensitive_path_access',
          path,
          timestamp: Date.now()
        });
      }
    });
    
    // Check for malicious network requests
    this.networkRequests.forEach(req => {
      if (req.url.includes('malicious') || req.url.includes('evil')) {
        violations.push({
          type: 'malicious_network_request',
          url: req.url,
          timestamp: req.timestamp
        });
      }
    });
    
    return violations;
  }

  getPerformanceMetrics() {
    const now = Date.now();
    const runningProcesses = Array.from(this.processRegistry.values())
      .filter(p => !p.process.killed);
    
    const commandsByType = this.commandHistory.reduce((acc, cmd) => {
      const type = cmd.command;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalProcesses: this.processRegistry.size,
      runningProcesses: runningProcesses.length,
      fileSystemOperations: this.fileSystemState.size,
      networkRequests: this.networkRequests.length,
      commandsByType,
      avgCommandDelay: this.calculateAverageCommandDelay()
    };
  }

  calculateAverageCommandDelay() {
    if (this.commandHistory.length === 0) return 0;
    
    const delays = this.commandHistory.map(cmd => this.getCommandDelay(cmd.command));
    return delays.reduce((sum, delay) => sum + delay, 0) / delays.length;
  }
}

// Export singleton instance and class
export const mockFactories = new MockFactories();
export { MockFactories };