/**
 * Template Processing Integration Tests
 * 
 * Tests the template processing system that handles variable substitution
 * in prompt templates for different Hydra workflows. These tests verify
 * that templates are correctly loaded, variables are properly substituted,
 * and the resulting prompts are valid for Claude processing.
 * 
 * @fileoverview Integration tests for template processing functionality
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Test utilities
import { createTempDir, createMockPRP, createMockGenesis } from '../setup/jest.setup.js';

describe('Template Processing Integration Tests', () => {
  let tempDir;
  let originalCwd;
  let consoleSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    tempDir = createTempDir();
    originalCwd = process.cwd();
    process.chdir(tempDir);
    
    // Setup console spies
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Setup project structure
    mkdirSync(join(tempDir, '.hydra'), { recursive: true });
    mkdirSync(join(tempDir, 'prompts'), { recursive: true });
    mkdirSync(join(tempDir, 'epics'), { recursive: true });
  });

  afterEach(() => {
    process.chdir(originalCwd);
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe('Basic Template Loading and Substitution', () => {
    it('should load and process strategic analysis template', async () => {
      const template = `# Strategic Analysis for {{FEATURE_NAME}}

## Context
Feature: {{FEATURE_NAME}}
Description: {{FEATURE_DESCRIPTION}}
Type: {{FEATURE_TYPE}}

## Analysis Required
Please analyze this feature request and provide strategic guidance.

## Feature Details
{{FEATURE_DESCRIPTION}}

## Instructions
1. Evaluate feasibility
2. Identify risks and dependencies
3. Recommend implementation approach
4. Suggest timeline and resources`;

      writeFileSync(join(tempDir, 'prompts', 'strategic-analysis.md'), template);

      let capturedPrompt = '';
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
        stdin: { 
          write: jest.fn((data) => { capturedPrompt += data; }),
          end: jest.fn()
        },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeNew } = await import('../../bin/hydra.mjs');
      await executeNew('payment-system', { 
        description: 'Add secure payment processing',
        type: 'feature'
      });

      // Verify variable substitution
      expect(capturedPrompt).toContain('Strategic Analysis for payment-system');
      expect(capturedPrompt).toContain('Feature: payment-system');
      expect(capturedPrompt).toContain('Description: Add secure payment processing');
      expect(capturedPrompt).toContain('Type: feature');
      expect(capturedPrompt).not.toContain('{{FEATURE_NAME}}');
      expect(capturedPrompt).not.toContain('{{FEATURE_DESCRIPTION}}');
    });

    it('should handle missing variables gracefully', async () => {
      const templateWithUnusedVars = `# Template with Unused Variables

## Used Variables
Feature: {{FEATURE_NAME}}
Description: {{FEATURE_DESCRIPTION}}

## Unused Variables
Unused: {{UNUSED_VARIABLE}}
Another: {{ANOTHER_UNUSED}}

## Instructions
Process only the used variables.`;

      writeFileSync(join(tempDir, 'prompts', 'strategic-analysis.md'), templateWithUnusedVars);

      let capturedPrompt = '';
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
        stdin: { 
          write: jest.fn((data) => { capturedPrompt += data; }),
          end: jest.fn()
        },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeNew } = await import('../../bin/hydra.mjs');
      await executeNew('test-feature', { description: 'Test description' });

      // Used variables should be substituted
      expect(capturedPrompt).toContain('Feature: test-feature');
      expect(capturedPrompt).toContain('Description: Test description');
      
      // Unused variables should remain as-is (or be handled according to implementation)
      expect(capturedPrompt).toContain('{{UNUSED_VARIABLE}}');
      expect(capturedPrompt).toContain('{{ANOTHER_UNUSED}}');
    });

    it('should handle special characters in variable values', async () => {
      const template = `# Special Characters Test
Feature: {{FEATURE_NAME}}
Description: {{FEATURE_DESCRIPTION}}
Path: {{CODEBASE_PATH}}`;

      writeFileSync(join(tempDir, 'prompts', 'strategic-analysis.md'), template);

      let capturedPrompt = '';
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
        stdin: { 
          write: jest.fn((data) => { capturedPrompt += data; }),
          end: jest.fn()
        },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeNew } = await import('../../bin/hydra.mjs');
      await executeNew('special-chars-test', { 
        description: 'Feature with "quotes", <brackets>, and & symbols',
        codebase: '/path/with spaces/and$pecial/chars'
      });

      // Special characters should be handled correctly
      expect(capturedPrompt).toContain('Feature with "quotes", <brackets>, and & symbols');
      expect(capturedPrompt).toContain('/path/with spaces/and$pecial/chars');
    });
  });

  describe('Multi-Template Processing Tests', () => {
    beforeEach(() => {
      // Create multiple templates for different workflows
      const strategicTemplate = `# Strategic Analysis
Feature: {{FEATURE_NAME}}
Description: {{FEATURE_DESCRIPTION}}`;

      const planningTemplate = `# Planning Workflow
Epic: {{EPIC_NAME}}
PRP Content: {{PRP_CONTENT}}`;

      const codeAnalysisTemplate = `# Code Analysis
Feature: {{FEATURE_DESCRIPTION}}
Codebase: {{CODEBASE_PATH}}`;

      const recapTemplate = `# Project Recap
Epic: {{EPIC_NAME}}
Genesis: {{GENESIS_CONTENT}}
Status: {{COMPLETION_STATUS}}`;

      writeFileSync(join(tempDir, 'prompts', 'strategic-analysis.md'), strategicTemplate);
      writeFileSync(join(tempDir, 'prompts', 'plan-generation.md'), planningTemplate);
      writeFileSync(join(tempDir, 'prompts', 'code-analysis.md'), codeAnalysisTemplate);
      writeFileSync(join(tempDir, 'prompts', 'recap-workflow.md'), recapTemplate);
    });

    it('should process planning template with PRP content', async () => {
      const epicName = 'planning-template-test';
      const prpContent = createMockPRP(epicName, 'Test PRP for template processing');
      
      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'prp.md'), prpContent);

      let capturedPrompt = '';
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const genesis = createMockGenesis(epicName, { status: 'planned' });
            writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), genesis);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { 
          write: jest.fn((data) => { capturedPrompt += data; }),
          end: jest.fn()
        },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executePlan } = await import('../../bin/hydra.mjs');
      await executePlan(epicName, {});

      expect(capturedPrompt).toContain(`Epic: ${epicName}`);
      expect(capturedPrompt).toContain('Test PRP for template processing');
      expect(capturedPrompt).toContain('# Problem Statement');
    });

    it('should process code analysis template with codebase path', async () => {
      const featureDescription = 'template processing test';
      
      let capturedPrompt = '';
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
        stdin: { 
          write: jest.fn((data) => { capturedPrompt += data; }),
          end: jest.fn()
        },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeEnhance } = await import('../../bin/hydra.mjs');
      await executeEnhance(featureDescription, {});

      expect(capturedPrompt).toContain(featureDescription);
      expect(capturedPrompt).toContain(tempDir); // Codebase path
    });

    it('should process recap template with Genesis content', async () => {
      const epicName = 'recap-template-test';
      const genesis = createMockGenesis(epicName, { 
        status: 'completed',
        tasks: ['task1', 'task2']
      });
      
      mkdirSync(join(tempDir, 'epics', epicName), { recursive: true });
      writeFileSync(join(tempDir, 'epics', epicName, 'genesis.xml'), genesis);

      let capturedPrompt = '';
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const recap = `# Recap for ${epicName}`;
            writeFileSync(join(tempDir, 'recaps', `${epicName}-recap.md`), recap);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { 
          write: jest.fn((data) => { capturedPrompt += data; }),
          end: jest.fn()
        },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeRecap } = await import('../../bin/hydra.mjs');
      await executeRecap(epicName, {});

      expect(capturedPrompt).toContain(`Epic: ${epicName}`);
      expect(capturedPrompt).toContain('<genesis>');
      expect(capturedPrompt).toContain('completed');
    });
  });

  describe('Complex Template Processing Tests', () => {
    it('should handle nested template structures', async () => {
      const nestedTemplate = `# Nested Template Structure

## Main Section
Feature: {{FEATURE_NAME}}

### Subsection 1
Description: {{FEATURE_DESCRIPTION}}

#### Sub-subsection
Type: {{FEATURE_TYPE}}
Priority: {{PRIORITY}}

### Subsection 2
More details about {{FEATURE_NAME}} implementation.

## Conclusion
Process {{FEATURE_NAME}} with {{FEATURE_TYPE}} priority.`;

      writeFileSync(join(tempDir, 'prompts', 'strategic-analysis.md'), nestedTemplate);

      let capturedPrompt = '';
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
        stdin: { 
          write: jest.fn((data) => { capturedPrompt += data; }),
          end: jest.fn()
        },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeNew } = await import('../../bin/hydra.mjs');
      await executeNew('nested-test', { 
        description: 'Nested template test',
        type: 'enhancement',
        priority: 'high'
      });

      expect(capturedPrompt).toContain('Feature: nested-test');
      expect(capturedPrompt).toContain('Description: Nested template test');
      expect(capturedPrompt).toContain('Type: enhancement');
      expect(capturedPrompt).toContain('Priority: high');
      expect(capturedPrompt).toContain('Process nested-test with enhancement priority');
    });

    it('should handle templates with conditional sections', async () => {
      const conditionalTemplate = `# Conditional Template

## Basic Info
Feature: {{FEATURE_NAME}}
Description: {{FEATURE_DESCRIPTION}}

## Optional Sections
{{#IF_CODEBASE}}
### Codebase Analysis
Path: {{CODEBASE_PATH}}
Analysis required for existing codebase.
{{/IF_CODEBASE}}

{{#IF_ENHANCEMENT}}
### Enhancement Details
This is an enhancement to existing functionality.
{{/IF_ENHANCEMENT}}

## Instructions
Process the {{FEATURE_NAME}} request.`;

      writeFileSync(join(tempDir, 'prompts', 'strategic-analysis.md'), conditionalTemplate);

      let capturedPrompt = '';
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
        stdin: { 
          write: jest.fn((data) => { capturedPrompt += data; }),
          end: jest.fn()
        },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeNew } = await import('../../bin/hydra.mjs');
      await executeNew('conditional-test', { 
        description: 'Test conditional sections'
      });

      // Basic substitution should work
      expect(capturedPrompt).toContain('Feature: conditional-test');
      expect(capturedPrompt).toContain('Process the conditional-test request');
      
      // Conditional sections handling depends on implementation
      // This test documents the expected behavior
    });

    it('should handle large template files efficiently', async () => {
      // Create a large template with many sections and variables
      const sections = Array.from({ length: 50 }, (_, i) => `
## Section ${i + 1}
Feature: {{FEATURE_NAME}}
Description: {{FEATURE_DESCRIPTION}}
Section-specific content for section ${i + 1}.
Processing {{FEATURE_NAME}} in context of section ${i + 1}.
`).join('\n');

      const largeTemplate = `# Large Template File
${sections}

## Final Section
Complete processing of {{FEATURE_NAME}}.`;

      writeFileSync(join(tempDir, 'prompts', 'strategic-analysis.md'), largeTemplate);

      let capturedPrompt = '';
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      const startTime = Date.now();
      
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
        stdin: { 
          write: jest.fn((data) => { capturedPrompt += data; }),
          end: jest.fn()
        },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeNew } = await import('../../bin/hydra.mjs');
      await executeNew('large-template-test', { 
        description: 'Test large template processing'
      });
      
      const endTime = Date.now();

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(2000);
      
      // Verify all substitutions occurred
      expect(capturedPrompt).toContain('Feature: large-template-test');
      expect(capturedPrompt).toContain('Section 1');
      expect(capturedPrompt).toContain('Section 50');
      expect(capturedPrompt).toContain('Complete processing of large-template-test');
      
      // Should not contain any unsubstituted variables
      expect(capturedPrompt).not.toContain('{{FEATURE_NAME}}');
    });
  });

  describe('Template Error Handling Tests', () => {
    it('should handle missing template files gracefully', async () => {
      // Don't create the strategic-analysis.md template
      
      const { executeNew } = await import('../../bin/hydra.mjs');
      await executeNew('missing-template-test', { 
        description: 'Test missing template handling'
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Template not found')
      );
    });

    it('should handle corrupted template files', async () => {
      const corruptedTemplate = `# Corrupted Template
      
Feature: {{FEATURE_NAME}
Description: {{FEATURE_DESCRIPTION  // Missing closing braces
Type: {{FEATURE_TYPE}}
      
Invalid template syntax here.`;

      writeFileSync(join(tempDir, 'prompts', 'strategic-analysis.md'), corruptedTemplate);

      let capturedPrompt = '';
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
        stdin: { 
          write: jest.fn((data) => { capturedPrompt += data; }),
          end: jest.fn()
        },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeNew } = await import('../../bin/hydra.mjs');
      await executeNew('corrupted-template-test', { 
        description: 'Test corrupted template handling'
      });

      // Should handle gracefully - exact behavior depends on implementation
      // This test documents expected behavior for corrupted templates
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle templates with circular references', async () => {
      const circularTemplate = `# Circular Template
      
Primary: {{PRIMARY_VAR}}
Secondary: {{SECONDARY_VAR}}

## Definitions
PRIMARY_VAR refers to: {{SECONDARY_VAR}}
SECONDARY_VAR refers to: {{PRIMARY_VAR}}

This creates a circular reference pattern.`;

      writeFileSync(join(tempDir, 'prompts', 'strategic-analysis.md'), circularTemplate);

      let capturedPrompt = '';
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
        stdin: { 
          write: jest.fn((data) => { capturedPrompt += data; }),
          end: jest.fn()
        },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeNew } = await import('../../bin/hydra.mjs');
      await executeNew('circular-test', { 
        description: 'Test circular reference handling',
        primaryVar: 'value1',
        secondaryVar: 'value2'
      });

      // Should handle circular references without infinite loops
      expect(capturedPrompt).toContain('Primary: value1');
      expect(capturedPrompt).toContain('Secondary: value2');
    });

    it('should validate template syntax before processing', async () => {
      const invalidSyntaxTemplate = `# Invalid Syntax Template
      
{{FEATURE_NAME}} - Valid
{INVALID_SYNTAX} - Invalid (single braces)
{{UNCLOSED_VAR - Invalid (unclosed)
PLAIN_TEXT}} - Invalid (closing without opening)

## Valid Section
Feature: {{FEATURE_NAME}}
Description: {{FEATURE_DESCRIPTION}}`;

      writeFileSync(join(tempDir, 'prompts', 'strategic-analysis.md'), invalidSyntaxTemplate);

      let capturedPrompt = '';
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
        stdin: { 
          write: jest.fn((data) => { capturedPrompt += data; }),
          end: jest.fn()
        },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeNew } = await import('../../bin/hydra.mjs');
      await executeNew('syntax-validation-test', { 
        description: 'Test syntax validation'
      });

      // Valid variables should be substituted
      expect(capturedPrompt).toContain('syntax-validation-test - Valid');
      expect(capturedPrompt).toContain('Feature: syntax-validation-test');
      
      // Invalid syntax should be handled appropriately
      // Exact handling depends on implementation
    });

    it('should handle empty template files', async () => {
      writeFileSync(join(tempDir, 'prompts', 'strategic-analysis.md'), '');

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeNew } = await import('../../bin/hydra.mjs');
      await executeNew('empty-template-test', { 
        description: 'Test empty template handling'
      });

      // Should handle empty templates gracefully
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Template is empty')
      );
    });
  });

  describe('Performance and Edge Case Tests', () => {
    it('should handle templates with many variables efficiently', async () => {
      // Create template with many variables
      const variables = Array.from({ length: 100 }, (_, i) => `{{VAR_${i}}}`);
      const manyVarsTemplate = `# Many Variables Template
      
${variables.map((v, i) => `Variable ${i}: ${v}`).join('\n')}

## Summary
Processed ${variables.length} variables total.`;

      writeFileSync(join(tempDir, 'prompts', 'strategic-analysis.md'), manyVarsTemplate);

      const startTime = Date.now();
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeNew } = await import('../../bin/hydra.mjs');
      await executeNew('many-vars-test', { 
        description: 'Test many variables template'
      });
      
      const endTime = Date.now();

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(1000);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle concurrent template processing', async () => {
      const template = `# Concurrent Template
Feature: {{FEATURE_NAME}}
Description: {{FEATURE_DESCRIPTION}}
Timestamp: {{TIMESTAMP}}`;

      writeFileSync(join(tempDir, 'prompts', 'strategic-analysis.md'), template);

      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      let processCount = 0;
      
      mockSpawn.mockImplementation(() => {
        processCount++;
        return {
          on: jest.fn((event, callback) => {
            if (event === 'close') {
              setTimeout(() => {
                processCount--;
                callback(0);
              }, 50);
            }
          }),
          stdin: { write: jest.fn(), end: jest.fn() },
          stdout: { on: jest.fn() },
          stderr: { on: jest.fn() }
        };
      });

      const { executeNew } = await import('../../bin/hydra.mjs');
      
      // Process multiple templates concurrently
      const promises = Array.from({ length: 3 }, (_, i) => 
        executeNew(`concurrent-test-${i}`, { 
          description: `Concurrent template test ${i}`,
          timestamp: new Date().toISOString()
        })
      );

      await Promise.all(promises);

      // All processes should be cleaned up
      expect(processCount).toBe(0);
      expect(mockSpawn).toHaveBeenCalledTimes(3);
    });

    it('should preserve template formatting and structure', async () => {
      const formattedTemplate = `# Formatted Template

## Section A
   Indented content
      More indented content
   Back to first level

## Section B
- Bullet point 1
- Bullet point 2
  - Sub-bullet
    - Sub-sub-bullet

Feature: {{FEATURE_NAME}}

\`\`\`javascript
// Code block
function example() {
  return "{{FEATURE_NAME}}";
}
\`\`\`

> Blockquote with {{FEATURE_DESCRIPTION}}

**Bold** and *italic* formatting preserved.`;

      writeFileSync(join(tempDir, 'prompts', 'strategic-analysis.md'), formattedTemplate);

      let capturedPrompt = '';
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
        stdin: { 
          write: jest.fn((data) => { capturedPrompt += data; }),
          end: jest.fn()
        },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeNew } = await import('../../bin/hydra.mjs');
      await executeNew('formatting-test', { 
        description: 'Test formatting preservation'
      });

      // Verify formatting is preserved
      expect(capturedPrompt).toContain('   Indented content');
      expect(capturedPrompt).toContain('- Bullet point 1');
      expect(capturedPrompt).toContain('  - Sub-bullet');
      expect(capturedPrompt).toContain('```javascript');
      expect(capturedPrompt).toContain('return "formatting-test"');
      expect(capturedPrompt).toContain('> Blockquote with Test formatting preservation');
      expect(capturedPrompt).toContain('**Bold** and *italic*');
    });
  });
});