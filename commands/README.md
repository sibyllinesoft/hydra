# Claude Code Commands Directory

**Purpose**: Slash commands provide rapid access to specialized agents and workflows through a simple, discoverable interface. Commands act as entry points to our 50+ agent ecosystem, enabling context-specific task execution without memorizing complex agent names or configurations.

---

## 🚀 Quick Start

### Basic Command Usage
```bash
# Agent shortcuts - Quick access to specialists
/api                    # → backend-architect
/frontend               # → frontend-developer 
/test                   # → test-writer-fixer
/ui                     # → ui-designer

# Workflow commands - Complex multi-step processes
/tdd                    # → Test-driven development workflow
/deploy                 # → Deployment automation workflow
/refactor               # → Code refactoring workflow

# Project management - CCPM-inherited task management
/pm:status              # → Project status overview
/pm:standup             # → Daily standup report
/pm:epic-start          # → Begin new epic

# Context management - Dynamic project context
/context:create         # → Initialize project context
/context:prime          # → Load context in new sessions
/context:update         # → Refresh existing context
```

### Command Discovery
```bash
# List all available commands
ls -la /home/nathan/.claude/commands/

# Find commands by pattern
grep -r "agent:" /home/nathan/.claude/commands/a/
```

---

## 📁 Directory Structure

```
commands/
├── a/                  # Agent shortcuts (legacy agt/)
│   ├── api.md          # → backend-architect
│   ├── frontend.md     # → frontend-developer
│   ├── test.md         # → test-writer-fixer
│   └── ...
├── pm/                 # Project Management (CCPM-inherited)
│   ├── init.md         # Initialize project
│   ├── status.md       # Project status
│   ├── epic-*.md       # Epic management
│   └── issue-*.md      # Issue management
├── context/            # Dynamic Context Management
│   ├── create.md       # Initialize project context
│   ├── prime.md        # Load context
│   └── update.md       # Refresh context
├── testing/            # Testing Workflows
│   ├── prime.md        # Test environment setup
│   └── run.md          # Test execution
└── README.md           # This file
```

---

## 🎯 Command Categories

### Agent Shortcuts (`a/`)
Direct access to specialized agents with minimal configuration.

**Engineering Agents:**
- `/api` → backend-architect
- `/frontend` → frontend-developer  
- `/refactor` → refactoring-specialist
- `/test` → test-writer-fixer
- `/debug` → debugging workflows
- `/deploy` → devops-automator

**Design Agents:**
- `/ui` → ui-designer
- `/shadcn` → UI component workflows

**Development Workflows:**
- `/tdd` → Test-driven development
- `/test-first` → Test-first development
- `/requirements` → Requirements analysis

**Content & Documentation:**
- `/document` → technical-writer
- `/content` → content-creator
- `/api-docs` → API documentation workflows

**Analysis & Planning:**
- `/plan` → product-manager
- `/review` → Code review workflows
- `/security-scan` → security-ninja

### Project Management (`pm/`)
CCPM-inherited task and project management commands.

**Project Initialization:**
- `/pm:init` → Initialize new project
- `/pm:import` → Import existing project data

**Status & Reporting:**
- `/pm:status` → Current project status
- `/pm:standup` → Daily standup report
- `/pm:sync` → Sync with external systems

**Epic Management:**
- `/pm:epic-start` → Begin new epic
- `/pm:epic-status` → Epic progress
- `/pm:epic-decompose` → Break down epic
- `/pm:epic-close` → Complete epic

**Issue Management:**
- `/pm:issue-start` → Start working on issue
- `/pm:issue-status` → Issue progress
- `/pm:issue-close` → Complete issue

**PRD Management:**
- `/pm:prd-new` → Create new PRD
- `/pm:prd-edit` → Edit existing PRD
- `/pm:prd-status` → PRD status

### Context Management (`context/`)
Dynamic project context for improved agent coordination.

- `/context:create` → Analyze project and create comprehensive context documentation
- `/context:prime` → Load existing context for new sessions
- `/context:update` → Refresh context with recent changes

### Testing Workflows (`testing/`)
Specialized testing automation and coordination.

- `/testing:prime` → Setup comprehensive testing environment
- `/testing:run` → Execute test suites with analysis

---

## 🔄 Command-to-Agent Mapping

### Current Agent Coverage

**✅ Covered Agents:**
- backend-architect (`/api`)
- frontend-developer (`/frontend`)
- test-writer-fixer (`/test`)
- ui-designer (`/ui`)  
- devops-automator (`/deploy`, `/devops`)
- technical-writer (`/document`)
- refactoring-specialist (`/refactor`)
- content-creator (`/content`)
- security-ninja (`/security-scan`)
- product-manager (`/plan`)

**❌ Missing Agent Commands:**
```bash
# Engineering (New 2024-2025 Agents)
/typescript-node      # → typescript-node-developer
/python-backend       # → python-backend-developer
/go-backend           # → go-backend-developer
/rust-backend         # → rust-backend-developer
/database             # → database-wizard
/super-hard           # → super-hard-problem-developer

# Design System
/brand                # → brand-guardian
/ux-research          # → ux-researcher
/visual-story         # → visual-storyteller
/whimsy               # → whimsy-injector

# Testing & Quality
/api-test             # → api-tester
/performance          # → performance-benchmarker
/test-results         # → test-results-analyzer

# Utilities (Context Firewall Agents)
/code-analyzer        # → code-analyzer (CCPM mandatory)
/file-analyzer        # → file-analyzer (CCPM mandatory)
/test-runner          # → test-runner (CCPM mandatory)

# Marketing & Growth  
/growth               # → growth-hacker
/tiktok               # → tiktok-strategist
/instagram            # → instagram-curator

# Operations
/finance              # → finance-tracker
/support              # → support-responder
/analytics            # → analytics-reporter

# Project Management
/cofounder         # → cofounder (orchestrator)
/parallel-work        # → parallel-worker
/experiment           # → experiment-tracker
```

---

## 🛠 Creating Custom Commands

### Basic Agent Command Template

```yaml
---
agent: [agent-name]
description: [Brief description of what this agent does]
---

[Optional expanded description and usage examples]
```

**Example - New TypeScript Developer Command:**
```yaml
---
agent: typescript-node-developer  
description: Modern TypeScript/Node.js development with Bun, Hono, and 2024-2025 patterns
---

Specializes in:
- Modern TypeScript patterns (satisfies, branded types)
- High-performance runtime (Bun)
- Modern frameworks (Hono, Fastify)
- Type-safe database operations
- Advanced async patterns
```

### Workflow Command Template

```yaml
---
allowed-tools: [tool1, tool2, ...]
description: [Workflow description]
---

# [Workflow Name]

[Detailed workflow instructions with specific steps]

## Prerequisites
- [Requirement 1]
- [Requirement 2]

## Execution Steps
1. [Step 1]
2. [Step 2]

## Success Criteria
- [Criteria 1]
- [Criteria 2]
```

### Context-Aware Command Template

```yaml
---
agent: [primary-agent]
context-dependencies: [context-file1, context-file2]
coordination: [secondary-agents]
---

# [Command Name]

This command requires project context and coordinates multiple agents.

## Context Requirements
- Must have project context loaded via `/context:prime`
- Requires: [specific context files]

## Agent Coordination
1. Primary: [primary-agent] 
2. Secondary: [secondary-agents]
3. Auto-triggers: [auto-trigger-agents]
```

---

## 📋 Command Audit Results

### Coverage Analysis
- **Total Agents**: 50+ across 8 departments
- **Commands Available**: ~30 commands
- **Coverage Rate**: ~60% (need 20+ new commands)

### Priority Missing Commands

**High Priority (Core Development):**
1. `/typescript-node` → typescript-node-developer
2. `/python-backend` → python-backend-developer
3. `/database` → database-wizard
4. `/code-analyzer` → code-analyzer (CCPM mandatory)
5. `/file-analyzer` → file-analyzer (CCPM mandatory)

**Medium Priority (Specialized):**
6. `/rust-backend` → rust-backend-developer
7. `/go-backend` → go-backend-developer
8. `/performance` → performance-benchmarker
9. `/ux-research` → ux-researcher
10. `/cofounder` → cofounder (orchestrator)

**Lower Priority (Marketing/Operations):**
11. `/growth` → growth-hacker
12. `/finance` → finance-tracker
13. `/support` → support-responder

### Command Optimization Suggestions

**Naming Improvements:**
- Consider shorter aliases: `/ts` for `/typescript-node`
- Consistent naming: `/backend-py` vs `/python-backend`
- Category prefixes: `/test:performance` vs `/performance`

**Organization Improvements:**
- Move all agent shortcuts to consistent directory
- Create category subdirectories: `commands/agents/`, `commands/workflows/`
- Add command discovery tools

---

## 🔗 Integration with Agent System

### Agent-First Workflow
Commands enforce the Agent-First mandate from RULES.md:
1. Commands always spawn agents (never direct tools)
2. Agents receive fresh context (context firewall)
3. Specialized agents handle domain-specific tasks
4. Complex tasks route through cofounder

### Context Preservation
Commands support context preservation through:
- Pre-loaded project context via `/context:prime`
- Agent coordination metadata
- Task handoff protocols
- Session state management

### Auto-triggering
Commands can trigger automatic agent coordination:
- Code changes → test-writer-fixer
- UI changes → whimsy-injector  
- Feature flags → experiment-tracker
- Complex workflows → cofounder

---

## 🚀 Usage Patterns

### Development Workflow
```bash
# Initialize project context
/context:create

# Start feature development
/typescript-node "Implement user authentication API"

# Add tests (auto-triggered)
/test "Create comprehensive auth tests"

# Deploy when ready
/deploy "Deploy auth API to staging"
```

### Design Workflow
```bash
# Load context
/context:prime

# Design interface
/ui "Create user dashboard mockups"

# Add delightful interactions (auto-triggered)
/whimsy "Add micro-interactions to dashboard"

# Validate with research
/ux-research "Test dashboard usability"
```

### Project Management Workflow
```bash
# Daily standup
/pm:standup

# Work on current epic
/pm:epic-status

# Start new issue
/pm:issue-start "Fix authentication bug"

# Close completed work
/pm:issue-close "Authentication bug resolved"
```

---

## 📈 Future Enhancements

### Planned Improvements
1. **Auto-completion**: Shell auto-complete for all commands
2. **Command Chaining**: `/frontend → /test → /deploy` workflows
3. **Context Intelligence**: Commands that auto-load relevant context
4. **Agent Orchestration**: Multi-agent workflows via single commands
5. **Command Analytics**: Track usage patterns and optimize

### Integration Opportunities
1. **VS Code Extension**: Commands accessible from editor
2. **GitHub Integration**: Commands triggered by PR events
3. **CI/CD Integration**: Commands in pipeline stages
4. **Slack Bot**: Commands accessible from team chat

---

**Remember**: Commands are entry points to our expert agent ecosystem. They should be discoverable, concise, and route to the most appropriate specialist for optimal results and context preservation.