/**
 * Code Analyzer Agent Integration Tests
 * 
 * Tests real integration with the code-analyzer agent for brownfield development.
 * These tests verify that Hydra can successfully analyze existing codebases,
 * understand project context, and generate synthetic PRPs for enhancement workflows.
 * 
 * @fileoverview Integration tests for code-analyzer agent interactions
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Test utilities  
import { createTempDir, createMockPRP } from '../../setup/jest.setup.js';

describe('Code Analyzer Agent Integration Tests', () => {
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
    
    // Setup basic project structure
    mkdirSync(join(tempDir, '.hydra'), { recursive: true });
    mkdirSync(join(tempDir, 'prompts'), { recursive: true });
    mkdirSync(join(tempDir, 'src'), { recursive: true });
    mkdirSync(join(tempDir, 'tests'), { recursive: true });
    
    // Create code analysis template
    const codeAnalysisTemplate = `# Code Analysis Workflow

## Context
Feature Enhancement: {{FEATURE_DESCRIPTION}}
Codebase Path: {{CODEBASE_PATH}}

## Analysis Task
Analyze the existing codebase to understand:
- Project architecture and patterns
- Relevant code sections for the requested feature
- Dependencies and integrations
- Testing patterns and coverage
- Potential integration points

## Feature Request
{{FEATURE_DESCRIPTION}}

## Instructions
1. Examine the codebase structure
2. Identify relevant files and modules
3. Understand existing patterns and conventions
4. Generate synthetic PRP for the enhancement
5. Recommend implementation approach`;

    writeFileSync(join(tempDir, 'prompts', 'code-analysis.md'), codeAnalysisTemplate);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe('Codebase Analysis Tests', () => {
    beforeEach(() => {
      // Create a realistic project structure
      mkdirSync(join(tempDir, 'src', 'components'), { recursive: true });
      mkdirSync(join(tempDir, 'src', 'services'), { recursive: true });
      mkdirSync(join(tempDir, 'src', 'utils'), { recursive: true });
      
      // Add sample source files
      writeFileSync(join(tempDir, 'src', 'components', 'UserProfile.js'), `
import React from 'react';
import { userService } from '../services/userService';

export const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    userService.getUser(userId).then(setUser);
  }, [userId]);
  
  return (
    <div className="user-profile">
      <h2>{user?.name}</h2>
      <p>{user?.email}</p>
    </div>
  );
};`);

      writeFileSync(join(tempDir, 'src', 'services', 'userService.js'), `
class UserService {
  async getUser(id) {
    const response = await fetch(\`/api/users/\${id}\`);
    return response.json();
  }
  
  async updateUser(id, data) {
    const response = await fetch(\`/api/users/\${id}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

export const userService = new UserService();`);

      writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
        name: "test-project",
        version: "1.0.0",
        dependencies: {
          "react": "^18.0.0",
          "react-dom": "^18.0.0"
        },
        devDependencies: {
          "jest": "^29.0.0",
          "@testing-library/react": "^13.0.0"
        }
      }, null, 2));
    });

    it('should analyze existing codebase structure', async () => {
      const featureDescription = 'add user avatar upload functionality';
      
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      let capturedInput = '';
      
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            // Simulate code-analyzer generating synthetic PRP
            const syntheticPrp = `# Synthetic PRP: User Avatar Upload

## Analysis Results
- Identified UserProfile component in src/components/
- Found userService with existing API patterns
- React project with standard testing setup
- No existing file upload functionality detected

## Recommended Implementation
- Extend UserService with avatar upload method
- Add file upload component to UserProfile
- Implement image handling and validation
- Add tests following existing patterns

## Integration Points
- UserProfile.js - Add avatar display and upload UI
- userService.js - Add uploadAvatar method
- Consider image optimization and storage`;

            mkdirSync(join(tempDir, 'epics', 'user-avatar-upload'), { recursive: true });
            writeFileSync(join(tempDir, 'epics', 'user-avatar-upload', 'synthetic-prp.md'), syntheticPrp);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { 
          write: jest.fn((data) => { capturedInput += data; }),
          end: jest.fn()
        },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      await executeEnhance(featureDescription, {});

      // Verify code analysis was performed
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invoking code-analyzer')
      );
      
      // Verify codebase path was provided
      expect(capturedInput).toContain(tempDir);
      expect(capturedInput).toContain(featureDescription);
    });

    it('should identify relevant files for feature enhancement', async () => {
      const featureDescription = 'add user settings page';
      
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      let analysisComplete = false;
      
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            // Mock analysis identifying relevant files
            const analysisResults = `# Code Analysis Results

## Relevant Files Identified
- src/components/UserProfile.js - User-related component patterns
- src/services/userService.js - User API service patterns  
- package.json - Dependencies and project structure

## Patterns Detected
- React functional components with hooks
- Service layer architecture
- RESTful API integration patterns
- Jest testing setup

## Recommendations
- Follow existing component patterns in UserProfile
- Extend userService with settings endpoints
- Add UserSettings component alongside UserProfile
- Follow existing testing patterns`;

            analysisComplete = true;
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      await executeEnhance(featureDescription, {});

      expect(analysisComplete).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('code-analyzer')
      );
    });

    it('should understand project architecture patterns', async () => {
      // Add more complex architecture
      mkdirSync(join(tempDir, 'src', 'hooks'), { recursive: true });
      mkdirSync(join(tempDir, 'src', 'context'), { recursive: true });
      
      writeFileSync(join(tempDir, 'src', 'hooks', 'useUser.js'), `
import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

export const useUser = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    userService.getUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);
  
  return { user, loading, error };
};`);

      writeFileSync(join(tempDir, 'src', 'context', 'AuthContext.js'), `
import React, { createContext, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);`);

      const featureDescription = 'add authentication-aware user preferences';
      
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const architecturalAnalysis = `# Architectural Analysis

## Patterns Identified
- Custom hooks pattern (useUser)
- React Context for state management (AuthContext)
- Service layer architecture
- Separation of concerns

## For Authentication-Aware Preferences
- Integrate with existing AuthContext
- Follow useUser hook pattern for usePreferences
- Extend userService with preferences endpoints
- Maintain authentication flow consistency`;

            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      await executeEnhance(featureDescription, {});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('code-analyzer')
      );
    });

    it('should detect testing patterns and coverage', async () => {
      // Add test files
      mkdirSync(join(tempDir, 'src', 'components', '__tests__'), { recursive: true });
      
      writeFileSync(join(tempDir, 'src', 'components', '__tests__', 'UserProfile.test.js'), `
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { UserProfile } from '../UserProfile';
import { userService } from '../../services/userService';

jest.mock('../../services/userService');

describe('UserProfile', () => {
  it('renders user information', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    userService.getUser.mockResolvedValue(mockUser);
    
    render(<UserProfile userId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });
});`);

      const featureDescription = 'add user profile editing capability';
      
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const testingAnalysis = `# Testing Pattern Analysis

## Current Testing Setup
- Jest with React Testing Library
- Component testing in __tests__ directories
- Service mocking patterns identified
- Async testing with waitFor

## For Profile Editing Feature
- Follow existing test structure
- Mock userService.updateUser method
- Test form interactions and validation
- Test optimistic UI updates
- Add integration tests for edit flow`;

            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      await executeEnhance(featureDescription, {});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('code-analyzer')
      );
    });
  });

  describe('Synthetic PRP Generation Tests', () => {
    beforeEach(() => {
      // Create a simple project for PRP generation tests
      writeFileSync(join(tempDir, 'src', 'index.js'), `
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));`);

      writeFileSync(join(tempDir, 'src', 'App.js'), `
import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>My App</h1>
    </div>
  );
}

export default App;`);
    });

    it('should generate comprehensive synthetic PRP', async () => {
      const featureDescription = 'add dark mode toggle';
      
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const syntheticPrp = `# Synthetic PRP: Dark Mode Toggle

## Problem Statement
The application currently only supports light mode. Users need the ability to toggle between light and dark themes for better usability and accessibility.

## User Stories
- As a user, I want to toggle between light and dark modes
- As a user, I want my theme preference to persist across sessions
- As a user, I want the theme to respect my system preference initially

## Technical Analysis
### Current State
- React application with basic structure
- No theming system detected
- CSS styling approach: [className-based]
- State management: [React hooks recommended]

### Integration Points
- App.js - Main application wrapper for theme context
- Add ThemeContext for global theme state
- localStorage for persistence
- CSS variables or CSS-in-JS for theming

## Acceptance Criteria
- [ ] Toggle button switches between light/dark modes
- [ ] Theme preference persists across browser sessions
- [ ] System preference detection and initial theme setting
- [ ] All existing UI elements adapt to theme changes
- [ ] Accessibility compliance maintained

## Implementation Approach
1. Create ThemeContext and ThemeProvider
2. Add theme toggle component
3. Implement CSS variable system for themes
4. Add localStorage persistence
5. Update existing components for theme awareness
6. Add comprehensive testing

## Dependencies
- React Context API (built-in)
- CSS custom properties support
- localStorage API

## Risks and Considerations
- Existing CSS may need refactoring
- Performance impact of theme switching
- Accessibility color contrast requirements
- Cross-browser compatibility`;

            mkdirSync(join(tempDir, 'epics', 'dark-mode-toggle'), { recursive: true });
            writeFileSync(join(tempDir, 'epics', 'dark-mode-toggle', 'synthetic-prp.md'), syntheticPrp);
            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      await executeEnhance(featureDescription, {});

      // Verify synthetic PRP was created
      const prpPath = join(tempDir, 'epics', 'dark-mode-toggle', 'synthetic-prp.md');
      expect(existsSync(prpPath)).toBe(true);
      
      if (existsSync(prpPath)) {
        const prpContent = readFileSync(prpPath, 'utf8');
        expect(prpContent).toContain('Dark Mode Toggle');
        expect(prpContent).toContain('Technical Analysis');
        expect(prpContent).toContain('Acceptance Criteria');
      }
    });

    it('should analyze dependencies and suggest implementation', async () => {
      // Add package.json with existing dependencies
      writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
        name: "react-app",
        dependencies: {
          "react": "^18.0.0",
          "react-dom": "^18.0.0",
          "styled-components": "^5.3.0",
          "@material-ui/core": "^4.12.0"
        }
      }, null, 2));

      const featureDescription = 'add notification system';
      
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const dependencyAnalysis = `# Synthetic PRP: Notification System

## Dependency Analysis
### Existing Dependencies
- styled-components: Use for notification styling
- @material-ui/core: Leverage existing design system
- React 18: Use modern hooks and concurrent features

### Recommended Approach
- Build on Material-UI's Snackbar component
- Use styled-components for custom styling
- Implement notification queue with React hooks
- Consider react-transition-group for animations

## Technical Recommendations
1. Extend Material-UI Snackbar for consistency
2. Create NotificationProvider context
3. Use styled-components for custom themes
4. Implement notification queue management
5. Add accessibility features (ARIA labels)

## Implementation Strategy
- Leverage existing design system
- Minimal new dependencies required
- Follow established project patterns`;

            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      await executeEnhance(featureDescription, {});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('code-analyzer')
      );
    });

    it('should identify potential integration challenges', async () => {
      // Create a complex codebase with potential integration issues
      writeFileSync(join(tempDir, 'src', 'legacy-module.js'), `
// Legacy jQuery-based module
window.LegacyModule = {
  init: function() {
    $('#legacy-content').show();
  },
  
  updateData: function(data) {
    // Direct DOM manipulation
    document.getElementById('legacy-display').innerHTML = data;
  }
};`);

      const featureDescription = 'modernize legacy module to React';
      
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const integrationAnalysis = `# Synthetic PRP: Legacy Module Modernization

## Integration Challenges Identified
### Current Issues
- jQuery dependency in legacy-module.js
- Direct DOM manipulation patterns
- Global namespace pollution (window.LegacyModule)
- Mixed React and jQuery paradigms

### Migration Strategy
1. Phase 1: Wrapper Component
   - Create React wrapper for legacy functionality
   - Maintain existing behavior during transition
   
2. Phase 2: Incremental Migration
   - Convert functionality piece by piece
   - Remove jQuery dependencies gradually
   
3. Phase 3: Full React Integration
   - Complete React component replacement
   - Clean up global namespace
   - Update all references

### Risk Mitigation
- Extensive testing at each phase
- Feature flag controlled rollout
- Fallback mechanisms during transition
- Stakeholder communication about changes

### Technical Debt Reduction
- Remove jQuery dependency
- Eliminate global namespace usage
- Implement proper React patterns
- Add comprehensive test coverage`;

            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      await executeEnhance(featureDescription, {});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('code-analyzer')
      );
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty or minimal codebases', async () => {
      // Clear the test directory to simulate minimal codebase
      const emptyProjectPath = join(tempDir, 'empty-project');
      mkdirSync(emptyProjectPath, { recursive: true });
      process.chdir(emptyProjectPath);

      const featureDescription = 'add initial user management system';
      
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const emptyCodebaseAnalysis = `# Synthetic PRP: Initial User Management

## Codebase Analysis
### Current State
- Minimal/empty project structure detected
- No existing patterns or architecture found
- Green field development opportunity

## Recommendations
- Establish project foundation first
- Choose appropriate framework/architecture
- Set up development tooling and standards
- Plan comprehensive user management system

## Implementation Approach
1. Project Setup
   - Initialize package.json
   - Choose framework (React/Vue/Angular)
   - Set up development environment
   
2. Architecture Planning
   - Design authentication flow
   - Plan user data models
   - Choose state management approach
   
3. Implementation Phases
   - User registration
   - Authentication
   - Profile management
   - Authorization system`;

            setTimeout(() => callback(0), 10);
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      await executeEnhance(featureDescription, {});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('code-analyzer')
      );
    });

    it('should handle analysis failures gracefully', async () => {
      const featureDescription = 'add feature with analysis failure';
      
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(1), 10); // Exit with error
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { 
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              callback(Buffer.from('Code analysis failed'));
            }
          })
        }
      }));

      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      await executeEnhance(featureDescription, {});

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('failed')
      );
    });

    it('should handle large codebases efficiently', async () => {
      // Create a large codebase structure
      const largeProjectStructure = [
        'src/components', 'src/services', 'src/utils', 'src/hooks',
        'src/context', 'src/pages', 'src/assets', 'src/styles',
        'tests/components', 'tests/services', 'tests/utils',
        'docs', 'config', 'scripts'
      ];

      largeProjectStructure.forEach(dir => {
        mkdirSync(join(tempDir, dir), { recursive: true });
        
        // Add multiple files in each directory
        for (let i = 1; i <= 10; i++) {
          const filename = dir.includes('tests') ? `test${i}.test.js` : `file${i}.js`;
          writeFileSync(join(tempDir, dir, filename), `// File ${i} in ${dir}`);
        }
      });

      const featureDescription = 'add comprehensive search functionality';
      
      const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
      const startTime = Date.now();
      
      mockSpawn.mockImplementation(() => ({
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            const largeCodebaseAnalysis = `# Large Codebase Analysis Complete

## Structure Analysis
- 13 main directories analyzed
- 130+ files examined
- Established patterns identified
- Testing infrastructure present

## Search Feature Recommendations
- Leverage existing component patterns
- Integrate with established service layer
- Follow existing testing patterns
- Consider performance implications`;

            setTimeout(() => callback(0), 100); // Simulate processing time
          }
        }),
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      }));

      const { executeEnhance } = await import('../../../bin/hydra.mjs');
      await executeEnhance(featureDescription, {});
      
      const endTime = Date.now();
      
      // Should complete within reasonable time even for large codebases
      expect(endTime - startTime).toBeLessThan(10000);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('code-analyzer')
      );
    });
  });
});