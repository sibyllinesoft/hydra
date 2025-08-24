/**
 * Unit tests for `hydra enhance` command (NEW FUNCTIONALITY)
 * Tests codebase analysis and synthetic PRP generation
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import path from 'path';
import fs from 'fs';
import { spawn, execSync } from 'child_process';

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');

describe('hydra enhance command', () => {
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
    mockFs.existsSync.mockImplementation((path) => {
      return path.includes('prompts') || path.includes('.claude');
    });
    
    mockFs.mkdirSync.mockImplementation(() => {});
    mockFs.readFileSync.mockImplementation(() => 'Mock template content');
    
    // Mock successful Claude execution
    mockSpawn.mockImplementation(() => testUtils.mockSpawn({ code: 0 }));
  });

  afterEach(() => {
    testUtils.cleanupTempDir(tempDir);
    jest.clearAllMocks();
  });

  describe('Feature description processing', () => {
    it('should accept detailed feature descriptions', async () => {
      const featureDescription = 'Add user authentication with OAuth2 and JWT tokens';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeEnhance(featureDescription, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Analyzing codebase for enhancement')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(featureDescription)
      );
      
      consoleSpy.mockRestore();
    });

    it('should generate epic name from feature description', async () => {
      const featureDescription = 'Add Real-Time Chat Feature';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('add-real-time-chat-feature'),
        { recursive: true }
      );
    });

    it('should handle special characters in feature description', async () => {
      const featureDescription = 'OAuth 2.0 & JWT Authentication (v3.1)';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('oauth-2-0-jwt-authentication-v3-1'),
        { recursive: true }
      );
    });

    it('should handle empty or minimal descriptions', async () => {
      const featureDescription = 'fix';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('fix'),
        { recursive: true }
      );
    });
  });

  describe('Epic directory creation', () => {
    it('should create epic directory structure', async () => {
      const featureDescription = 'user dashboard improvements';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('.claude/epics/user-dashboard-improvements'),
        { recursive: true }
      );
    });

    it('should handle existing epic directory gracefully', async () => {
      const featureDescription = 'existing feature';
      
      mockFs.existsSync.mockImplementation((path) => {
        return true; // Directory already exists
      });
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeEnhance(featureDescription, {});
      
      // Should still proceed with code analysis
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invoking code-analyzer')
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle directory creation failure', async () => {
      const featureDescription = 'test feature';
      
      mockFs.mkdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await expect(executeEnhance(featureDescription, {})).rejects.toThrow(
        expect.stringContaining('Permission denied')
      );
    });
  });

  describe('Code analysis integration', () => {
    it('should invoke code-analyzer agent with correct parameters', async () => {
      const featureDescription = 'add payment processing';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeEnhance(featureDescription, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invoking code-analyzer')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('brownfield analysis')
      );
      
      consoleSpy.mockRestore();
    });

    it('should pass current working directory to analyzer', async () => {
      const featureDescription = 'api improvements';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [expect.stringContaining(process.cwd())],
        expect.any(Object)
      );
    });

    it('should generate comprehensive analysis prompt', async () => {
      const featureDescription = 'microservices migration';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      // Verify prompt contains expected sections
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('code-analyzer agent');
      expect(prompt).toContain('Codebase Analysis');
      expect(prompt).toContain('Synthetic PRP Generation');
      expect(prompt).toContain('microservices migration');
      expect(prompt).toContain('Success Criteria');
    });

    it('should specify output PRP path in prompt', async () => {
      const featureDescription = 'database optimization';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('Must create synthetic PRP at');
      expect(prompt).toContain('database-optimization');
      expect(prompt).toContain('/prp.md');
    });
  });

  describe('Synthetic PRP generation', () => {
    it('should include structured PRP format in prompt', async () => {
      const featureDescription = 'real-time notifications';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      // Check for PRP template structure
      expect(prompt).toContain('# Product Requirement Prompt (PRP)');
      expect(prompt).toContain('## Executive Summary');
      expect(prompt).toContain('## Codebase Context');
      expect(prompt).toContain('## Enhancement Requirements');
      expect(prompt).toContain('### Integration Strategy');
      expect(prompt).toContain('### Success Criteria');
      expect(prompt).toContain('## Next Steps & Handoff');
    });

    it('should include handoff instructions', async () => {
      const featureDescription = 'search functionality';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('hydra plan search-functionality');
      expect(prompt).toContain('Recommended Next Action');
    });

    it('should mark PRP as synthetic and brownfield', async () => {
      const featureDescription = 'performance improvements';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('Synthetic PRP for Brownfield Enhancement');
      expect(prompt).toContain('Hydra enhance command analysis');
    });
  });

  describe('Codebase analysis requirements', () => {
    it('should specify comprehensive analysis tasks', async () => {
      const featureDescription = 'mobile app integration';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      // Check for analysis requirements
      expect(prompt).toContain('programming languages, frameworks, and tech stack');
      expect(prompt).toContain('architectural patterns and project structure');
      expect(prompt).toContain('code quality, technical debt');
      expect(prompt).toContain('integration points');
      expect(prompt).toContain('enhancement opportunities and constraints');
    });

    it('should require context-aware enhancement recommendations', async () => {
      const featureDescription = 'API versioning';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('Integration strategy based on existing patterns');
      expect(prompt).toContain('Context-aware enhancement recommendations');
      expect(prompt).toContain('How to integrate with existing architecture');
    });
  });

  describe('Output and logging', () => {
    it('should log expected messages during execution', async () => {
      const featureDescription = 'logging test feature';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeEnhance(featureDescription, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Analyzing codebase for enhancement')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invoking code-analyzer')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Synthetic PRP will be saved to')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Goal: Analyze existing codebase')
      );
      
      consoleSpy.mockRestore();
    });

    it('should display correct file paths', async () => {
      const featureDescription = 'file path test';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeEnhance(featureDescription, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('.claude/epics/file-path-test')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('prp.md')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Error handling', () => {
    it('should handle Claude execution failure', async () => {
      mockSpawn.mockImplementation(() => {
        const mockChild = testUtils.mockSpawn({ 
          error: new Error('Claude failed') 
        });
        return mockChild;
      });
      
      const featureDescription = 'test feature';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      // Should not throw but may log error
      await executeEnhance(featureDescription, {});
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should handle template processing errors', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Template error');
      });
      
      const featureDescription = 'template test';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await expect(executeEnhance(featureDescription, {})).rejects.toThrow();
    });

    it('should handle invalid feature descriptions gracefully', async () => {
      const featureDescription = ''; // Empty description
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      // Should generate epic name and continue
      await executeEnhance(featureDescription, {});
      expect(mockSpawn).toHaveBeenCalled();
    });
  });

  describe('Integration with existing workflow', () => {
    it('should prepare for hydra plan handoff', async () => {
      const featureDescription = 'workflow integration';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeEnhance(featureDescription, {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Ready for `hydra plan workflow-integration`')
      );
      
      consoleSpy.mockRestore();
    });

    it('should create PRP in expected location for plan command', async () => {
      const featureDescription = 'plan integration test';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('.claude/epics/plan-integration-test/prp.md');
    });

    it('should indicate brownfield enhancement in PRP', async () => {
      const featureDescription = 'brownfield test';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('Brownfield Enhancement');
      expect(prompt).toContain('existing codebase');
      expect(prompt).toContain('Integration strategy based on existing patterns');
    });
  });

  describe('Performance and reliability', () => {
    it('should complete analysis within reasonable time', async () => {
      const featureDescription = 'performance test';
      const startTime = Date.now();
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle concurrent enhance commands', async () => {
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      const promises = [
        executeEnhance('feature-1', {}),
        executeEnhance('feature-2', {}),
        executeEnhance('feature-3', {})
      ];
      
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });

    it('should handle large codebase analysis', async () => {
      const featureDescription = 'large codebase test';
      
      // Mock large directory structure
      mockFs.existsSync.mockReturnValue(true);
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        [expect.any(String)],
        expect.any(Object)
      );
    });
  });

  describe('Success criteria validation', () => {
    it('should define success criteria in prompt', async () => {
      const featureDescription = 'success criteria test';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('Success Criteria');
      expect(prompt).toContain('Complete codebase analysis report');
      expect(prompt).toContain('Synthetic PRP saved to');
      expect(prompt).toContain('Ready for `hydra plan');
    });

    it('should focus on understanding existing codebase', async () => {
      const featureDescription = 'understanding test';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('understanding the existing codebase');
      expect(prompt).toContain('intelligent, context-aware enhancements');
    });
  });

  describe('Security and edge cases', () => {
    it('should sanitize feature description to prevent injection attacks', async () => {
      const maliciousDescription = 'feature; rm -rf /; echo hack';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(maliciousDescription, {});
      
      // Verify the epic name is properly sanitized
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('feature-rm-rf-echo-hack'),
        expect.any(Object)
      );
      
      // Ensure no shell injection in spawn calls
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      expect(prompt).not.toContain('rm -rf');
    });

    it('should handle extremely long feature descriptions', async () => {
      const longDescription = 'a'.repeat(10000);
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeEnhance(longDescription, {});
      
      // Should truncate or handle gracefully
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Analyzing codebase for enhancement')
      );
      
      consoleSpy.mockRestore();
    });

    it('should validate against directory traversal in epic names', async () => {
      const traversalDescription = '../../../etc/passwd';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(traversalDescription, {});
      
      // Should sanitize path traversal attempts
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('etc-passwd'),
        expect.any(Object)
      );
      expect(mockFs.mkdirSync).not.toHaveBeenCalledWith(
        expect.stringContaining('../'),
        expect.any(Object)
      );
    });

    it('should handle unicode and special characters safely', async () => {
      const unicodeDescription = '添加用户认证功能 🔐 with émojis & spéciâl chars';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(unicodeDescription, {});
      
      // Should create valid directory name
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringMatching(/[\/\\].claude[\/\\]epics[\/\\][a-z0-9-]+$/),
        expect.any(Object)
      );
    });
  });

  describe('Memory and performance optimization', () => {
    it('should be memory efficient during large codebase analysis', async () => {
      const stressData = testUtils.createStressTestData('large');
      const startMemory = testUtils.getMemoryUsage();
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance('performance test', {});
      
      const endMemory = testUtils.getMemoryUsage();
      const memoryGrowth = endMemory.heapUsed - startMemory.heapUsed;
      
      expect(memoryGrowth).toBeMemoryEfficient(50); // Should use less than 50MB
    });

    it('should complete within performance thresholds', async () => {
      const startTime = testUtils.startTimer();
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance('timing test', {});
      
      const executionTime = testUtils.endTimer(startTime);
      expect(executionTime).toHaveExecutionTime(3000); // Should complete within 3 seconds
    });

    it('should handle stress test with multiple concurrent enhancements', async () => {
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      const features = [
        'user authentication system',
        'payment processing module',
        'notification service',
        'real-time chat feature',
        'analytics dashboard'
      ];
      
      const startTime = testUtils.startTimer();
      
      const promises = features.map(feature => executeEnhance(feature, {}));
      await expect(Promise.all(promises)).resolves.toBeDefined();
      
      const executionTime = testUtils.endTimer(startTime);
      expect(executionTime).toHaveExecutionTime(15000); // All should complete within 15 seconds
    });
  });

  describe('Advanced codebase analysis features', () => {
    it('should detect and analyze programming languages in codebase', async () => {
      const featureDescription = 'language detection test';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      // Should include comprehensive language analysis requirements
      expect(prompt).toContain('programming languages, frameworks, and tech stack');
      expect(prompt).toContain('architectural patterns and project structure');
      expect(prompt).toContain('dependencies and external integrations');
    });

    it('should analyze existing test coverage and quality metrics', async () => {
      const featureDescription = 'test coverage analysis';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('code quality, technical debt');
      expect(prompt).toContain('testing strategy and coverage');
      expect(prompt).toContain('integration points');
    });

    it('should identify security vulnerabilities and compliance requirements', async () => {
      const featureDescription = 'security audit enhancement';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('security considerations');
      expect(prompt).toContain('authentication and authorization patterns');
      expect(prompt).toContain('data protection and privacy');
    });

    it('should provide detailed integration recommendations', async () => {
      const featureDescription = 'integration strategy enhancement';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      expect(prompt).toContain('Integration strategy based on existing patterns');
      expect(prompt).toContain('How to integrate with existing architecture');
      expect(prompt).toContain('Context-aware enhancement recommendations');
    });
  });

  describe('Error recovery and resilience', () => {
    it('should handle corrupted or unreadable files gracefully', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('EISDIR: illegal operation on a directory');
      });
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Should handle file system errors without crashing
      await expect(executeEnhance('resilience test', {})).rejects.toThrow('EISDIR');
      
      consoleSpy.mockRestore();
    });

    it('should retry failed operations with exponential backoff', async () => {
      let attemptCount = 0;
      
      mockSpawn.mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          const mockChild = testUtils.mockSpawn({ error: new Error('Network timeout') });
          return mockChild;
        }
        return testUtils.mockSpawn({ code: 0 });
      });
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance('retry test', {});
      
      expect(attemptCount).toBe(3); // Should have retried on failure
    });

    it('should provide detailed error reporting and debugging information', async () => {
      mockSpawn.mockImplementation(() => {
        const mockChild = testUtils.mockSpawn({ 
          error: new Error('Agent communication failed'),
          stderr: 'Detailed error information'
        });
        return mockChild;
      });
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeEnhance('error reporting test', {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error Details:')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Integration with Living Blueprint system', () => {
    it('should prepare epic directory for Living Blueprint workflow', async () => {
      const featureDescription = 'living blueprint integration';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      await executeEnhance(featureDescription, {});
      
      // Should create proper epic directory structure
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('.claude/epics/living-blueprint-integration'),
        { recursive: true }
      );
      
      // Should prepare for genesis.xml creation by plan command
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      expect(prompt).toContain('hydra plan living-blueprint-integration');
    });

    it('should include metadata for epic tracking', async () => {
      const featureDescription = 'metadata tracking test';
      
      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await executeEnhance(featureDescription, {});
      
      const promptCall = mockSpawn.mock.calls[0];
      const prompt = promptCall[1][0];
      
      // Should include epic metadata for tracking
      expect(prompt).toContain('Epic Name:');
      expect(prompt).toContain('metadata-tracking-test');
      expect(prompt).toContain('Analysis Type: Brownfield Enhancement');
      
      consoleSpy.mockRestore();
    });
  });
});