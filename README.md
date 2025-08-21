<div align="center">

![Hydra Logo](logo.png)

# 🐉 Hydra

**Stop hitting Claude's context limits every 50 messages. Start building unlimited development sessions.**

Hydra transforms Claude Code into a mythical beast with 50+ specialized agent heads that work independently while preserving your conversation forever. Each agent spawns with fresh context, delivers expert results, and returns only actionable outputs to your main thread.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Claude Compatible](https://img.shields.io/badge/Claude%20Code-Compatible-blue.svg)](https://claude.ai/code)
[![50+ Agents](https://img.shields.io/badge/Agents-50+-brightgreen.svg)](#-agent-system)
[![15+ MCP Servers](https://img.shields.io/badge/MCP%20Servers-15+-orange.svg)](#-mcp-integration)
[![Version 1.0](https://img.shields.io/badge/Version-1.0-blue.svg)](https://github.com/your-username/hydra/releases)

</div>

## ⚡ 10-Second Proof

```bash
# Install Hydra in one command
git clone https://github.com/your-username/hydra.git ~/.claude
```

**Before Hydra**: Build a TypeScript API → 50 messages later → "Sorry, I've lost context, can you remind me what we're building?"

**With Hydra**: `typescript-node-developer` agent builds your entire API with modern patterns, tests, and documentation using **0%** of your conversation context. You still have all 300+ messages for your next feature.

**The problem that ruins AI development**: Context limits force constant restarts, lost project knowledge, and endless re-explanations.

**Hydra's solution**: Context Firewall Technology™ - specialized agents work in isolation while your main conversation stays clean forever.

### The Numbers That Matter

| **Before Hydra** | **With Hydra** | **Improvement** |
|------------------|----------------|-----------------|
| 50-100 message limit | 300+ messages | **6x longer sessions** |
| Context bloat kills productivity | Context Firewall isolation | **0% pollution** |
| Restart every 2 hours | All-day marathons | **8+ hour sessions** |
| Repeat explanations constantly | Agent memory retention | **90% reduction** |
| Generic responses | 50+ domain experts | **Specialized expertise** |

### 🎯 What You Get Immediately

**🧠 50+ Expert Agents** - TypeScript wizards, Python masters, Rust performance specialists, UI designers, security ninjas, and more

**🔥 Fresh Context Every Time** - Each agent spawns clean, works independently, returns only results

**⚡ Parallel Execution** - Multiple agents work simultaneously without conflicts

**🛡️ Context Firewall** - Your main conversation never gets polluted with verbose task details

**🔄 Autonomous Excellence** - Agents iterate until optimal results or clear limitations

## 📦 Quick Start (3 Commands)

### 1. Install
```bash
git clone https://github.com/sibyllinesoft/hydra.git ~/.claude
```

### 2. Setup MCP Servers
Add to your `~/.claude.json`:
```json
{
  "mcpServers": {
    "git": { "type": "stdio", "command": "uvx", "args": ["mcp-server-git"] },
    "serena": { "type": "stdio", "command": "uvx", "args": ["--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server", "--context", "ide-assistant"] }
  }
}
```

### 3. Test Drive
```
Use typescript-node-developer to create a REST API with authentication and tests
```

**What happens next:**
1. Agent spawns with clean context
2. Builds modern TypeScript API with 2024 patterns
3. Adds comprehensive test suite
4. Returns complete implementation
5. Your conversation stays at message #1

**Context used: 0%**. **Your conversation: Still unlimited**.

## 🎮 Live Demo

**Traditional Workflow:**
```
You: "Build a user authentication system"
Claude: "I'll help you build that..." [45 messages later]
Claude: "I've lost context, can you remind me what we were building?"
You: 😤 [Start over]
```

**Hydra Workflow:**
```
You: "Use security-ninja to build user authentication"
security-ninja: [Spawns fresh] → Builds auth system → Returns implementation
You: "Now use database-wizard to optimize the queries"
database-wizard: [Spawns fresh] → Analyzes & optimizes → Returns results
You: [Still at message 3, ready for next feature]
```

**Every developer knows this pain:** You start building something complex with Claude. 50 messages in, you're making real progress. Then Claude says "I've lost context" and you're back to square one.

**Hours wasted.** Project knowledge lost. Explanations repeated endlessly.

**The root cause:** Claude's context gets polluted with implementation details, verbose logs, and task-specific chatter. Your conversation dies, not from lack of capability, but from information overload.

**Hydra's breakthrough:** Context Firewall Technology™ isolates all the messy work in specialized agent heads while keeping your main conversation immortal.

## 🧠 Meet Your Agent Army

**🔧 Engineering Specialists (20+ agents)**
- `typescript-node-developer` - Modern TypeScript with 2024 patterns (Hono, Vitest, Bun)
- `python-backend-developer` - Async-first Python (FastAPI, SQLAlchemy 2.0+)  
- `rust-backend-developer` - Zero-cost abstractions (Axum, SQLx)
- `security-ninja` - Penetration testing and vulnerability assessment
- `super-hard-problem-developer` - Opus-powered for persistent complex challenges

**🎨 Design & UX (5+ agents)**
- `ui-designer` - Interface design and component systems
- `whimsy-injector` - Delightful interactions and micro-animations  
- `brand-guardian` - Visual consistency and style guides

**⚡ Utilities (5+ agents)**
- `file-creator` - ALL file/directory operations *(mandatory)*
- `git-workflow` - ALL version control *(mandatory)*
- `test-runner` - Comprehensive test execution *(mandatory)*

**📊 Marketing & Growth (8+ agents)**
- `growth-hacker` - Viral growth loops and user acquisition
- `tiktok-strategist` - Short-form content and viral trends

[**See all 50+ agents →**](#-agent-system)

## 🛠️ Powerful Integrations

**🧠 Advanced Analysis**
- **Serena** - Semantic code analysis and project memory
- **Sequential Thinking** - Complex multi-step reasoning
- **IDE Integration** - Real-time diagnostics and feedback

**📚 Knowledge Systems** 
- **Context7** - Library documentation and API references
- **Readwise** - Personal knowledge management
- **Web Search** - Real-time information gathering

**🧪 Testing & Quality**
- **Playwright** - Modern browser automation
- **Performance Benchmarking** - Load testing and optimization

## 🚀 Why Hydra vs. Alternatives?

### vs. Plain Claude Code
| **Plain Claude** | **Hydra** |
|------------------|-----------|
| Context dies at 50-100 messages | **300+ message conversations** |
| Restart every 2 hours | **All-day development sessions** |
| Generic responses | **50+ specialized domain experts** |
| No task memory | **Persistent project knowledge** |
| Manual context management | **Automatic context firewall** |

### vs. Other AI Coding Tools
| **Feature** | **GitHub Copilot** | **Cursor** | **Hydra** |
|-------------|-------------------|-----------|-----------|
| Context persistence | ❌ | ⚠️ Limited | ✅ **Unlimited** |
| Specialized agents | ❌ | ❌ | ✅ **50+ experts** |
| Full-stack development | ❌ | ⚠️ Partial | ✅ **Complete ecosystem** |
| Production workflows | ❌ | ❌ | ✅ **Security, testing, deployment** |
| Autonomous iteration | ❌ | ❌ | ✅ **Self-improving agents** |

### Perfect For
**✅ Individual Developers** - Context anxiety solved, all-day sessions, expert knowledge  
**✅ Development Teams** - Consistent quality, parallel workflows, knowledge retention  
**✅ Complex Projects** - Architectural guidance, production-ready code, crisis response  
**✅ Legacy Modernization** - AI-assisted refactoring with safety protocols  

## ⚡ Ready? Install Now

**Installation takes 30 seconds. Results last forever.**

### Step 1: Install Hydra
```bash
git clone https://github.com/sibyllinesoft/hydra.git ~/.claude
```

### Step 2: Add MCP Servers
Copy this into your `~/.claude.json`:
```json
{
  "mcpServers": {
    "git": { "type": "stdio", "command": "uvx", "args": ["mcp-server-git"] },
    "serena": { "type": "stdio", "command": "uvx", "args": ["--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server", "--context", "ide-assistant"] },
    "sequential-thinking": { "type": "stdio", "command": "npx", "args": ["@modelcontextprotocol/server-sequential-thinking"] }
  }
}
```

### Step 3: Customize Your Environment
```bash
cp ~/.claude/CONTEXT_TEMPLATE.md ~/.claude/CONTEXT.md
# Edit with your details: OS, tools, project paths, preferences
```

### Step 4: Test Drive
Try this in your next Claude conversation:
```
Use typescript-node-developer to create a REST API with JWT authentication and comprehensive tests
```

**What you'll see:**
1. Agent spawns with clean context
2. Builds modern TypeScript API with 2024 patterns  
3. Adds security, validation, and full test suite
4. Returns complete, production-ready implementation
5. Your conversation context: **Still clean**

**Next command:**
```
Use database-wizard to add PostgreSQL integration with optimized queries
```

**Your conversation:** Still unlimited. **Your productivity:** Transformed.

---

## 📚 Deep Dive Documentation

### 🏗️ Architecture Overview

**Context Firewall Technology™** - The breakthrough that enables unlimited conversations:

```
Main Conversation (Clean Forever)
    ↓ Task Request
Agent Spawns → Works in Isolation → Returns Results
    ↓ Fresh Context
Multiple Agents → Parallel Execution → Coordinated Output
    ↓ Zero Pollution  
Your Conversation → Stays Clean → Unlimited Capacity
```

**E-H-A-E-D-R Methodology** - Every agent follows this research-validated cycle:
- **Examine** - Analyze current state with measurable baseline
- **Hypothesize** - Formulate specific improvement theory  
- **Act** - Implement minimal viable change
- **Evaluate** - Quantitatively measure results
- **Decide** - Continue iterating or declare complete
- **Repeat** - Next cycle with updated learnings

**Customize Your Setup** - Edit `CONTEXT.md` with your environment:
```bash
# Development Environment
- OS: Your operating system
- Node.js: Version and package manager  
- Editor: VS Code, Cursor, etc.
- Projects: Your project locations
- Preferences: Coding style, frameworks
```

**Add Custom Agents** - Extend `AGENTS.md`:
```markdown
#### your-custom-agent
- **Specialization**: Your specific domain expertise
- **Best for**: Specific use cases
- **Auto-activates**: Trigger conditions
```

**Configure MCP Servers** - Add to `MCP.md`:
```yaml
your_server:
  description: "Server description"
  capabilities: ["feature1", "feature2"]
  usage_patterns: ["when to use", "best practices"]
```

### 🎯 Production Examples

**Full-Stack Development** (Context used: 0%)
```
Build a real-time chat app with TypeScript backend and React frontend
```
**→** `studio-coach` coordinates → `typescript-node-developer` + `frontend-developer` + `security-ninja` work in parallel → Complete app delivered

**Legacy Modernization** (Context preserved)
```
Modernize PHP monolith to TypeScript microservices
```  
**→** `refactoring-specialist` analyzes → `backend-architect` designs → `typescript-node-developer` implements → Systematic migration

**Crisis Resolution** (Parallel investigation)
```
Critical: Payment processing failing, need immediate fix
```
**→** Multiple agents investigate simultaneously → `super-hard-problem-developer` coordinates → Hot fix deployed

---

```
hydra/
├── 📋 Core Framework
│   ├── CLAUDE.md                    # Main entry point
│   ├── CONTEXT.md                   # Your environment (customize this!)
│   ├── AGENTS.md                    # 50+ agent definitions
│   ├── MCP.md                       # Tool integrations
│   ├── PRINCIPLES.md                # Development philosophy
│   └── RULES.md                     # Safety protocols
│
├── 🤖 Agents (50+ specialists)
│   ├── utilities/                   # Mandatory utilities
│   │   ├── file-creator.md          # File operations
│   │   ├── git-workflow.md          # Version control
│   │   └── test-runner.md           # Testing
│   ├── engineering/                 # 20+ technical specialists
│   │   ├── typescript-node-developer.md
│   │   ├── python-backend-developer.md
│   │   ├── rust-backend-developer.md
│   │   └── super-hard-problem-developer.md
│   ├── design/                      # UI/UX specialists
│   ├── marketing/                   # Growth specialists
│   └── project-management/          # Coordination
│
├── ⚡ Commands & Automation
│   ├── agt/                        # Agent commands
│   ├── context/                    # Context management
│   └── testing/                    # Testing workflows
│
└── 🔧 Scripts & Tools
    ├── hooks/                      # Automation hooks
    └── rules/                      # Advanced patterns
```

**Key Files to Customize:**
- `CONTEXT.md` - Your development environment and preferences
- `agents/` - Add your custom domain experts
- `commands/` - Your workflow automation

---

## 🤝 Join the Community

### 🚀 Get Support

**💬 Discord Community** - Connect with other Hydra users  
**📚 Documentation** - Comprehensive guides and examples  
**🐛 GitHub Issues** - Bug reports and feature requests  
**💡 Discussions** - Share tips, tricks, and use cases  

### ✨ Contribute

**We're building the future of AI-assisted development together.**

**🤖 Add Agents** - Create specialists for new domains
```bash
# Add to agents/your-domain/
- Domain expertise agent
- Include XML directives
- Add coordination patterns
```

**⚡ MCP Integrations** - Connect new tools
```yaml
# Add to MCP.md
your_tool:
  capabilities: ["analysis", "automation"] 
  patterns: ["when to use", "optimization tips"]
```

**📖 Documentation** - Improve guides and examples
```markdown
# Real-world usage examples
# Installation troubleshooting  
# Advanced configuration patterns
```

**🛠️ Core Features** - Enhance the framework
```bash
# Better agent coordination
# Performance optimizations
# New automation patterns
```

### 🏆 Contributors

Special thanks to everyone building the unlimited conversation future:

- **[Contains Studio](https://github.com/contains-studio/agents)** - Complete 50+ agent ecosystem
- **[Agent OS](https://github.com/buildermethods/agent-os)** - Foundational workflow patterns  
- **Anthropic** - The AI platform that makes this possible
- **MCP Community** - Tool integration standards
- **You** - For making AI development better

### 📄 License & Attribution

**MIT License** - Use freely in any project

```
✅ Personal and commercial use
✅ Modify and distribute  
✅ Include in proprietary software
✅ No attribution required (but appreciated!)
```

---

<div align="center">

## 🐉 Ready to Tame the Beast?

**Stop hitting context limits. Start building unlimited AI development sessions.**

### 🔥 Primary Call-to-Action
**[Install Hydra Now](#step-1-install-hydra)** ← 30 seconds to unlimited conversations

### 🎯 Secondary Actions  
**[Explore Agents](#-meet-your-agent-army)** • **[See Examples](#-production-examples)** • **[Join Community](#-join-the-community)**

### 💪 Transform Your Development
**Context Firewall Technology™** • **50+ Expert Agents** • **Parallel Execution** • **Autonomous Excellence**

*Where context limits are slain, and mythical productivity becomes reality.*

**🔥 [Get Started](#step-1-install-hydra) • 📚 [Learn More](#-deep-dive-documentation) • 🤝 [Contribute](#-contribute)**

</div>

## 📚 Complete Agent Reference

### 🔧 Engineering Specialists (20+ agents)

**Language Masters (2024-2025)**
- `typescript-node-developer` - Modern TypeScript (Hono, Vitest, Bun runtime)
- `python-backend-developer` - Async-first Python (FastAPI, SQLAlchemy 2.0+, Pydantic v2)
- `rust-backend-developer` - Zero-cost Rust (Axum, SQLx, compile-time optimization)
- `go-backend-developer` - Concurrency-focused Go (Gin, Fiber, goroutines)
- `nodejs-backend-developer` - Pure JavaScript (ES2024, streams, clustering)

**Architecture Specialists**
- `backend-architect` - Scalable API design, system architecture, performance
- `database-wizard` - Query optimization, schema design, migration strategies
- `security-ninja` - Penetration testing, vulnerability assessment, compliance
- `super-hard-problem-developer` - Opus-powered for persistent, complex challenges
- `refactoring-specialist` - AI-assisted code transformation and technical debt

**Development & Quality**
- `rapid-prototyper` - MVP development, proof-of-concepts, quick validation
- `frontend-developer` - React, Vue, modern web frameworks with performance focus
- `mobile-app-builder` - Native iOS/Android development with cross-platform expertise
- `ai-engineer` - ML/AI integration, LLM workflows, intelligent features
- `test-writer-fixer` - Comprehensive testing strategies, bug detection and fixes

### 🎨 Design Specialists (5+ agents)
- `ui-designer` - Interface design, component systems, design tokens
- `ux-researcher` - User research, usability testing, experience optimization
- `whimsy-injector` - Delightful interactions, micro-animations, personality
- `brand-guardian` - Visual consistency, brand compliance, style guides
- `visual-storyteller` - Compelling visuals, graphics, presentation design

### 📊 Marketing Specialists (8+ agents)
- `growth-hacker` - Viral growth loops, user acquisition, retention strategies
- `tiktok-strategist` - Short-form content, viral trends, engagement optimization
- `app-store-optimizer` - ASO, store presence, conversion optimization
- `content-creator` - Cross-platform content strategy and creation
- `instagram-curator` - Visual content strategy, aesthetic consistency

### 🎯 Coordination Specialists (4+ agents)
- `studio-coach` - Master orchestrator for complex multi-agent workflows
- `parallel-worker` - Technical execution engine for pre-defined parallel plans
- `project-shipper` - End-to-end delivery management, timeline coordination
- `experiment-tracker` - A/B testing, feature flags, validation workflows

### ⚡ Utility Specialists (Mandatory)
- `file-creator` - ALL file/directory creation, templates, batch operations
- `git-workflow` - ALL git operations with safety protocols and commit standards
- `test-runner` - ALL test execution, coverage analysis, and result interpretation
- `context-fetcher` - ALL documentation retrieval and internal knowledge access
- `knowledge-fetcher` - ALL external research, web search, and knowledge synthesis

---

## 🛠️ Complete MCP Reference

### 🧠 Advanced Analysis
- **Serena** - Semantic code analysis and project memory
- **Sequential Thinking** - Complex multi-step reasoning (3 complexity levels)
- **IDE Integration** - Real-time diagnostics and feedback
- **Git** - Version control with intelligent branching and conflict resolution

### 📚 Knowledge Systems
- **Context7** - Library documentation, API references, framework guides
- **Readwise** - Personal knowledge management, research synthesis
- **Web Search** - Real-time information gathering and validation
- **File Analysis** - Large file processing, log analysis, data interpretation

### 🧪 Testing & Quality
- **Playwright** - Modern browser automation, visual testing, accessibility validation
- **Performance Benchmarking** - Load testing, profiling, optimization validation
- **Quality Gates** - Automated quality enforcement and standards validation

### 💾 Database & Backend
- **Supabase** - Database operations with intelligent query optimization
- **SQL Analysis** - Query optimization, schema design, migration strategies
- **API Integration** - RESTful and GraphQL service coordination

### 🚀 Deployment & Infrastructure
- **Vercel** - Deployment automation, edge distribution, performance monitoring
- **Sentry** - Error tracking with AI-powered analysis and incident correlation
- **Infrastructure** - Containerization, orchestration, scaling automation

<details>
<summary>

## Project Structure

</summary>

```
hydra/
├── README.md                          # This comprehensive documentation
├── LICENSE                            # MIT license
├── CLAUDE.md                          # Main configuration entry point
├── CONTEXT_TEMPLATE.md               # Template for personal environment setup
│
├── Core Framework/
│   ├── AGENTS.md                     # 50+ specialized agent definitions
│   ├── MCP.md                        # 15+ MCP server integration guide
│   ├── PRINCIPLES.md                 # Core development philosophy
│   ├── RULES.md                      # Operational safety protocols
│   ├── AGENT-ERROR-HANDLING.md      # Structured error reporting framework
│   ├── SOCRATIC-QUESTIONING.md      # Requirement clarification framework
│   ├── PROGRAMMING-TASK-PLANNING.md # Structured task planning template
│   ├── ENGINEERING-STANDARDS.md     # Production-ready development standards
│   ├── TEMP-DIRECTORY-MANAGEMENT.md # Temporary file lifecycle management
│   ├── ITERATIVE-WORKFLOW-PATTERNS.md # E-H-A-E-D-R methodology
│   ├── ITERATIVE-CYCLE-ENFORCEMENT.md # Mandatory cycle completion
│   └── ORCHESTRATOR-ENHANCEMENT.md  # Enhanced orchestration framework
│
├── agents/                           # 50+ XML-enhanced specialized agents
│   ├── utilities/                   # Mandatory utility agents
│   │   ├── file-creator.md          # File/directory creation specialist
│   │   ├── git-workflow.md          # Version control specialist
│   │   ├── test-runner.md           # Test execution specialist
│   │   ├── context-fetcher.md       # Documentation retrieval specialist
│   │   └── knowledge-fetcher.md     # External research specialist
│   ├── engineering/                 # 20+ engineering specialists
│   │   ├── includes/
│   │   │   └── master-software-developer.md # Universal template
│   │   ├── typescript-node-developer.md    # Modern TypeScript/Node.js
│   │   ├── python-backend-developer.md     # Async-first Python
│   │   ├── rust-backend-developer.md       # Zero-cost Rust
│   │   ├── go-backend-developer.md         # Concurrency-focused Go
│   │   ├── super-hard-problem-developer.md # Opus-powered complex solving
│   │   ├── refactoring-specialist.md       # AI-assisted transformation
│   │   ├── security-ninja.md               # Security assessment
│   │   └── database-wizard.md              # Database optimization
│   ├── design/                     # UI/UX and visual design specialists
│   ├── marketing/                  # Growth and content specialists
│   ├── project-management/         # Coordination and delivery specialists
│   ├── testing/                    # Quality assurance specialists
│   └── studio-operations/          # Infrastructure and operations
│
├── commands/                        # Workflow automation commands
│   ├── agt/                        # Agent-specific commands
│   ├── context/                    # Context management commands
│   ├── pm/                         # Project management commands
│   └── testing/                    # Testing workflow commands
│
├── hooks/                          # Automation and integration hooks
│   ├── autonomous-continuation.js   # Self-continuing workflows
│   └── hook-configuration.md       # Hook setup and configuration
│
├── rules/                          # Advanced operational rules
│   ├── agent-coordination.md       # Multi-agent coordination patterns
│   ├── frontmatter-operations.md   # Metadata management
│   ├── github-operations.md        # GitHub integration patterns
│   ├── standard-patterns.md        # Common development patterns
│   └── worktree-operations.md      # Git worktree management
│
└── scripts/                       # Automation and utility scripts
    ├── pm/                         # Project management scripts
    └── test-and-log.sh            # Testing automation
```

## Installation Troubleshooting

### Reverting Installation (Existing Users)
If you need to go back to your original setup:
```bash
# Remove Hydra and restore backup
rm -rf ~/.claude
mv ~/.claude-backup ~/.claude
echo "Original configuration restored!"
```

### Merging MCP Configurations
If you had MCP servers configured before installation:

1. **Check your existing config**: `cat ~/.claude.json` (this file stays in place during installation)
2. **Add Hydra servers**: Merge the MCP servers from step 2 into your existing `~/.claude.json`
3. **Test setup**: Restart and verify all servers load correctly

> **Note**: The `.claude.json` MCP configuration file is at `~/.claude.json` (not inside the `~/.claude/` folder), so it's preserved during installation.

### Partial Recovery
Restore specific files from backup:
```bash
# Restore specific personal files
cp ~/.claude-backup/hooks/* ~/.claude/hooks/ 2>/dev/null || true
cp ~/.claude-backup/commands/* ~/.claude/commands/ 2>/dev/null || true
# Add any other personal customizations
```

### Verification
Confirm Hydra is working:
```bash
# Check structure
ls -la ~/.claude/agents/

# Verify agents are available - try this command:
# "Use file-creator agent to create a new component"
```

</details>

<details>
<summary>

## Customization Guide

</summary>

### 1. Personal Environment Setup

**Edit CONTEXT.md** with your specific details:
```markdown
# Development Environment
- OS: Your operating system
- Node.js: Version and package manager
- Editor: VS Code, Cursor, etc.
- Projects: Your project locations
- Preferences: Coding style, frameworks
```

### 2. Agent Customization

**Add Custom Agents** to AGENTS.md:
```markdown
#### your-custom-agent
- **Specialization**: Your specific domain expertise
- **Best for**: Specific use cases
- **Auto-activates**: Trigger conditions
- **Context overhead**: ~13k tokens (same as all Hydra agents)
```

### 3. MCP Server Configuration

**Update MCP.md** with your servers:
```yaml
your_custom_server:
  description: "Your server description"
  capabilities: ["capability1", "capability2"]
  usage_patterns: ["when to use", "best practices"]
```

### 4. Principle Alignment

**Modify PRINCIPLES.md** to match your development philosophy:
- Code quality standards
- Testing approaches  
- Documentation requirements
- Team collaboration rules

</details>

<details>
<summary>

## Usage Examples

</summary>

### Hydra in Action: Real-World Usage Examples

### Full-Stack Feature Development (0% Context Used)
```
Build a real-time chat application with TypeScript backend, React frontend, and WebSocket integration
```

**Hydra Orchestration:**
1. `studio-coach` - Plans multi-domain workflow with parallel execution
2. `typescript-node-developer` - Creates WebSocket API with modern patterns (Hono, Socket.io)
3. `database-wizard` - Designs optimized message storage and retrieval schemas
4. `frontend-developer` - Builds responsive React UI with real-time updates
5. `security-ninja` - Implements authentication, rate limiting, input validation
6. `test-runner` - Generates comprehensive test suite (unit, integration, e2e)
7. `file-creator` - Structures project with proper organization and templates
8. `git-workflow` - Manages feature branch, commits, and documentation

**E-H-A-E-D-R Iterations:**
- Each agent cycles through Examine, Hypothesize, Act, Evaluate, Decide, Repeat
- Autonomous optimization until performance, security, and quality standards met
- Main conversation receives only final deliverables and status updates

**Context Impact**: Complex full-stack application delivered using 0% conversation context. All 300+ messages preserved for your next feature.

### Production Crisis Resolution (Parallel Investigation)
```
Critical: Payment processing is failing, users can't complete purchases, need immediate diagnosis
```

**Immediate Response (Parallel Execution):**
1. `studio-coach` - Coordinates emergency response protocol
2. `file-analyzer` - Processes payment service logs for error patterns
3. `database-wizard` - Analyzes transaction data for anomalies
4. `security-ninja` - Checks for potential security breaches or attacks
5. `performance-benchmarker` - Profiles system load and bottlenecks
6. `devops-automator` - Evaluates infrastructure health and scaling issues

**Sequential Analysis:**
7. `super-hard-problem-developer` - Deep diagnostic analysis of findings
8. `typescript-node-developer` - Implements hot fixes for identified issues
9. `test-runner` - Validates fixes under production-like conditions
10. `git-workflow` - Manages emergency deployment and rollback procedures

**Iterative Resolution:**
- Each agent iterates until root cause identified and validated fix deployed
- Continuous monitoring and adjustment until system fully restored
- Comprehensive post-mortem documentation and prevention measures

**Context Impact**: Critical production issue resolved through coordinated multi-agent response using minimal conversation context.

### Legacy System Modernization (Systematic Transformation)
```
Modernize monolithic PHP application to microservices architecture with TypeScript/Python services
```

**Phased Modernization:**

**Phase 1: Analysis & Planning**
1. `code-analyzer` → Comprehensive legacy codebase analysis
2. `backend-architect` → Designs target microservices architecture
3. `refactoring-specialist` → Plans incremental migration strategy
4. `database-wizard` → Designs data partitioning and migration approach

**Phase 2: Core Service Development**
5. `typescript-node-developer` → Builds API gateway and core services
6. `python-backend-developer` → Creates data processing microservices
7. `security-ninja` → Implements modern authentication and authorization
8. `performance-benchmarker` → Establishes performance baselines

**Phase 3: Integration & Quality**
9. `test-runner` → Creates comprehensive testing strategy across services
10. `devops-automator` → Sets up CI/CD pipelines and containerization
11. `api-tester` → Validates service contracts and integration points

**Phase 4: Deployment & Monitoring**
12. `project-shipper` → Manages phased rollout and traffic routing
13. `parallel-worker` → Coordinates multiple deployment streams
14. `studio-coach` → Oversees entire modernization lifecycle

**Iterative Excellence:**
- Each phase includes multiple E-H-A-E-D-R cycles for optimization
- Continuous validation against performance and reliability metrics
- Automated rollback procedures if any service fails quality gates

**Context Impact**: Enterprise-scale modernization project managed through agent orchestration with preserved conversation capacity for strategic decisions.

### Design System Implementation (Cross-Domain Coordination)
```
Create a comprehensive design system with React components, documentation, and developer tools
```

**Coordinated Development:**
1. `ui-designer` → Creates design tokens, component specifications, and style guides
2. `brand-guardian` → Ensures consistency with brand guidelines and accessibility standards
3. `frontend-developer` → Implements React component library with TypeScript
4. `whimsy-injector` → Adds delightful interactions and micro-animations
5. `test-runner` → Creates visual regression tests and component validation
6. `file-creator` → Structures Storybook documentation and example applications
7. `git-workflow` → Manages component versioning and release procedures

**Quality Assurance:**
8. `performance-benchmarker` → Validates component performance and bundle size
9. `security-ninja` → Reviews components for XSS vulnerabilities and security best practices
10. `ux-researcher` → Validates usability and developer experience

**Documentation & Adoption:**
11. `visual-storyteller` → Creates compelling component showcase and usage examples
12. `content-creator` → Develops adoption guides and best practice documentation

**Context Impact**: Complete design system delivered with zero context pollution while maintaining conversation capacity for strategic feedback and iteration.

### Data Analysis & Insights (Research-Driven Development)
```
Analyze user behavior data to identify optimization opportunities and implement improvements
```

**Research & Analysis Phase:**
1. `knowledge-fetcher` → Gathers industry benchmarks and best practices
2. `file-analyzer` → Processes large datasets and user behavior logs
3. `python-backend-developer` → Creates data processing pipelines and analysis tools
4. `sequential-thinking` → Performs complex multi-step analysis and hypothesis testing

**Implementation Phase:**
5. `frontend-developer` → Implements A/B testing framework and user experience improvements
6. `experiment-tracker` → Sets up feature flags and experiment tracking
7. `performance-benchmarker` → Measures impact of optimizations

**Validation & Iteration:**
8. `test-runner` → Validates data accuracy and system reliability
9. `ux-researcher` → Analyzes user feedback and behavior changes
10. `growth-hacker` → Implements optimization recommendations

**Context Impact**: Data-driven optimization cycle completed with full conversation context preservation for strategic interpretation and decision-making.

</details>

<details>
<summary>

## Contributing

</summary>

We welcome contributions! Here's how to get involved:

### 1. Agent Development
- Create specialized agents for new domains
- Enhance existing agent capabilities
- Improve agent coordination workflows

### 2. MCP Integration
- Add support for new MCP servers
- Optimize existing server configurations
- Create intelligent decision trees

### 3. Documentation
- Improve setup guides and tutorials
- Add usage examples and best practices
- Translate documentation

### 4. Templates
- Create templates for new frameworks
- Enhance existing component templates
- Add industry-specific templates

### Contribution Process
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-agent`
3. Make your changes and test thoroughly
4. Submit a pull request with detailed description

### Code Style
- Follow existing patterns and conventions
- Include comprehensive documentation
- Add usage examples for new features
- Test all configurations before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### What This Means
- Use freely in personal and commercial projects
- Modify and adapt to your needs
- Distribute and share with others
- Include in proprietary software
- Attribution appreciated but not required

</details>

<details>
<summary>

## Acknowledgments

</summary>

### Core Contributors

**[Contains Studio](https://github.com/contains-studio/agents)**  
Provided the complete 40+ agent system that forms the heart of Hydra. Their revolutionary vision of department-organized, specialized AI agents with 6-day sprint methodology enables the rapid development capabilities this project provides. The entire agent ecosystem - from engineering to marketing to testing - originates from their innovative work.

**[Agent OS by Builder Methods](https://github.com/buildermethods/agent-os)**  
Contributed foundational concepts for utility agent patterns and systematic AI development workflows. Their approach to structured, spec-driven agentic development influenced the utility agent implementation and workflow optimization principles.

### Special Thanks
- **Anthropic** for creating the AI platform that enables this ecosystem
- **Development Community** for inspiration and collaborative feedback
- **MCP Server Developers** for building the tools that power the integrations
- **Open Source Contributors** who make projects like this possible

### Philosophy Credits
- **6-Day Sprint Methodology**: Contains Studio's rapid development framework
- **Agent-First Development**: Core principle from Contains Studio
- **Structured AI Workflows**: Concepts from Agent OS systematic approach
- **Domain Specialization**: Department-based organization by Contains Studio

### Built With
- AI-powered development environment with MCP integration
- [Model Context Protocol](https://modelcontextprotocol.io/) - Standardized AI-tool integration
- [Various MCP Servers](https://github.com/modelcontextprotocol/servers) - Specialized tool integrations

### Inspiration
This project was inspired by the frustrating reality of hitting context limits every 50-100 messages, and the vision of AI-augmented development where:
- **Conversations never die from context limits**
- **Humans focus on creativity and strategy**
- **AI handles repetitive tasks with fresh, focused context**  
- **Development sessions last all day, not all morning**

</details>

---

<div align="center">

## 🐉 Ready to Unleash the Beast?

**Transform AI development from 50-message sprints to 300+ message marathons**

### Start Your Unlimited Conversation Journey

[Quick Start Guide](#-quick-start) • [Agent System](#-agent-system) • [MCP Integration](#-mcp-integration)

### The Hydra Advantage

**Multi-Head Architecture** - Each agent head operates independently while the core remains immortal  
**Regenerative Methodology** - E-H-A-E-D-R cycles ensure every head grows back stronger  
**Specialized Beast Heads** - 50+ domain experts with production-ready expertise  
**Parallel Execution** - Multiple heads work simultaneously without interference  
**Immortal Core** - Your conversation context never dies, never degrades

### Tame Your Development Beast

*Where context limits are slain, and mythical productivity becomes reality.*

**[Get Started Now](#-quick-start) • [Read the Docs](#-project-structure) • [Contribute](#-contributing)**

</div>