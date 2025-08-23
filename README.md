<div align="center">

![Hydra Logo](logo.png)

**Stop hitting Claude's context limits every 50 messages. Start building unlimited development sessions.**

Hydra transforms Claude Code into a mythical beast with 50+ specialized agent heads that work independently while preserving your conversation forever. Each agent spawns with fresh context, delivers expert results, and returns only actionable outputs to your main thread.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Claude Compatible](https://img.shields.io/badge/Claude%20Code-Compatible-blue.svg)](https://claude.ai/code)
[![50+ Agents](https://img.shields.io/badge/Agents-50+-brightgreen.svg)](#-quick-start)
[![15+ MCP Servers](https://img.shields.io/badge/MCP%20Servers-15+-orange.svg)](#-quick-start)

</div>

## ⚡ The Problem & Solution

**Before Hydra**: Build a TypeScript API → 50 messages later → "Sorry, I've lost context, can you remind me what we're building?"

**With Hydra**: `typescript-node-developer` agent builds your entire API with modern patterns, tests, and documentation using **0%** of your conversation context. You still have all 300+ messages for your next feature.

**The Numbers That Matter**

| **Before Hydra** | **With Hydra** | **Improvement** |
|------------------|----------------|-----------------|
| 50-100 message limit | 300+ messages | **6x longer sessions** |
| Context bloat kills productivity | Context Firewall isolation | **0% pollution** |
| Restart every 2 hours | All-day marathons | **8+ hour sessions** |
| Repeat explanations constantly | Agent memory retention | **90% reduction** |
| Generic responses | 50+ domain experts | **Specialized expertise** |

---

> **💡 Key Benefits:** Context Firewall Technology preserves 300+ message conversations • 50+ specialized experts deliver production-ready code • Living Blueprint system captures all project knowledge • Zero context pollution through agent isolation

---

## 📋 Prerequisites

Before installing Hydra, ensure you have these dependencies:

- **Node.js** >= 16
- **Git** (for version control)
- **xmlstarlet** (for Living Blueprint system)
  ```bash
  # Ubuntu/Debian
  sudo apt install xmlstarlet
  
  # macOS
  brew install xmlstarlet
  
  # Other systems: see xmlstarlet.sourceforge.net
  ```

## 🛠️ Installation

### 1. Install Hydra
```bash
# Smart installer detects your environment and sets up everything
hydra-installer
```

### 2. Install Context Status Line (Optional)
To get real-time context usage in your status line:
```bash
pip install git+https://github.com/ersinkoc/claude-statusline
```

### 3. Verify Installation
```bash
# Check all dependencies and configuration
hydra doctor
```

## 🚀 Quick Start

```bash
# Smart installer detects your environment
hydra-installer
```
**What happens:**
- Creates backup of existing `.claude/` config  
- Installs 50+ specialized agents with fresh context
- Adds 15+ MCP server integrations
- Smart Git detection for existing repositories
- Sets up master workflow prompt templates

### Living Blueprint Workflow Experience
```bash
# 1. Strategic analysis for ambiguous goals
hydra new "user authentication system"
# → cofounder agent creates strategic-brief.md

# 2. Transform strategy into detailed execution plan
hydra plan auth-epic  
# → plan-generator creates genesis.xml with task DAG

# 3. Autonomous parallel execution
hydra run auth-epic
# → parallel-worker coordinates specialists via genesis.xml

# 4. Real-time project visibility  
hydra pm view auth-epic
# → Human-readable status from genesis.xml

# 5. Comprehensive project recap
hydra recap auth-epic
# → project-shipper generates documentation from genesis.xml
```

**Result:** Seamless handoff to Claude Code with structured planning, then autonomous execution using 0% of your conversation context.

## 🎮 How It Works

**Traditional Workflow:**
```
You: "Build a user authentication system"
Claude: "I'll help..." [45 messages later]
Claude: "I've lost context, can you remind me what we were building?"
You: 😤 [Start over]
```

**Hydra Living Blueprint Workflow:**
```
You: hydra new "authentication system"
Hydra: cofounder agent → strategic-brief.md [Socratic analysis + clear requirements]

You: hydra plan auth-epic
Hydra: plan-generator → genesis.xml [Detailed DAG + agent assignments]

You: hydra run auth-epic  
Hydra: parallel-worker → reads genesis.xml → coordinates specialists in parallel

You: hydra pm view auth-epic
Hydra: xmlstarlet + bash → real-time status from genesis.xml

You: hydra recap auth-epic
Hydra: project-shipper → comprehensive documentation from completed genesis.xml
```

**The Breakthrough:** Master Workflow Prompts™ provide Claude Code with structured planning frameworks, then Context Firewall Technology™ enables unlimited autonomous execution while preserving your conversation forever.

## 📋 CLI Command Reference

### `hydra new <feature-name>`
**Purpose:** Start planning any feature, project, or task  
**What happens:** Hands off to Claude Code with Socratic questioning workflow to break down requirements, create epic plans, and prepare for execution

```bash
hydra new "user authentication"
hydra new "payment integration" 
hydra new "refactor legacy API"
```

### `hydra run <epic-name>`  
**Purpose:** Execute autonomous development based on planning  
**What happens:** Triggers studio-producer orchestration → parallel-worker coordination → specialized agent execution with real-time monitoring

```bash
hydra run "auth-epic"
hydra run "payment-epic"
hydra run "refactor-epic"
```

### `hydra doctor`
**Purpose:** System health check and diagnostics  
**What happens:** Validates agent configurations, MCP server connectivity, Git status, and project dependencies

```bash
hydra doctor                    # Full system check
hydra doctor --agents          # Agent health only
hydra doctor --mcp             # MCP server status
```

### `hydra recap <epic-name>`
**Purpose:** Generate comprehensive project documentation  
**What happens:** Creates detailed recap with implementation summary, architectural decisions, test results, and deployment notes

```bash
hydra recap "auth-epic"        # Generate full recap
hydra recap "payment-epic" --format markdown
```

## 🧠 Your Expert Agents

**🔧 Language Masters**
- `typescript-node-developer` - Modern TypeScript/Node.js with 2024 patterns
- `python-backend-developer` - Async-first Python (FastAPI, SQLAlchemy 2.0+)  
- `rust-backend-developer` - Zero-cost abstractions (Axum, SQLx)
- `security-ninja` - Penetration testing and vulnerability assessment
- `super-hard-problem-developer` - Opus-powered for complex challenges

**🎨 Design & UX**
- `ui-designer` - Interface design and component systems
- `whimsy-injector` - Delightful interactions and animations
- `brand-guardian` - Visual consistency and style guides

**⚡ Essential Utilities**
- `file-creator` - File/directory operations *(replaces Write tool)*
- `git-workflow` - Version control *(replaces git commands)*
- `test-runner` - Test execution *(replaces manual testing)*

**📊 Growth & Marketing**
- `growth-hacker` - User acquisition and retention
- `tiktok-strategist` - Viral content strategy

[**Complete Agent Directory →**](#complete-agent-reference)

## 🛠️ Key Integrations

**🧠 Advanced Analysis** - Serena (code analysis), Sequential Thinking (complex reasoning), IDE Integration

**📚 Knowledge Access** - Context7 (docs), Readwise (knowledge), Web Search (real-time info)  

**🧪 Testing & Quality** - Playwright (browser automation), Performance Benchmarking

## 🚀 Why Choose Hydra?

### vs. Plain Claude Code
| **Plain Claude** | **Hydra** |
|------------------|-----------|
| Context dies at 50-100 messages | **300+ message conversations** |
| Restart every 2 hours | **All-day development sessions** |
| Generic responses | **50+ specialized experts** |
| Manual context management | **Automatic context firewall** |

### vs. AI Coding Tools
| **Feature** | **Copilot/Cursor** | **Hydra** |
|-------------|--------------------|-----------|
| Context persistence | ❌/⚠️ Limited | ✅ **Unlimited** |
| Specialized agents | ❌ | ✅ **50+ experts** |
| Full-stack workflows | ❌/⚠️ Partial | ✅ **Complete** |
| Autonomous iteration | ❌ | ✅ **Multi-hour sessions** |

### Perfect For
**Individual Developers** - No more context anxiety, unlimited sessions  
**Development Teams** - Consistent quality, parallel workflows  
**Complex Projects** - Architectural guidance, production-ready code  
**Legacy Modernization** - AI-assisted refactoring with safety protocols  

## 🏗️ Architecture & Customization

**Context Firewall Technology™** - The breakthrough enabling unlimited conversations:
- Main conversation stays clean forever
- Agents spawn with fresh context → work in isolation → return only results  
- Multiple agents execute in parallel without interference

**Master Workflow Prompts™** - XML state machines that provide Claude Code with structured planning frameworks:
- **Planning Workflows**: Socratic questioning for requirement analysis
- **Execution Workflows**: Orchestrated specialist coordination
- **Quality Workflows**: Validation and delivery management

**E-H-A-E-D-R Methodology** - Every agent follows this cycle:
Examine → Hypothesize → Act → Evaluate → Decide → Repeat

**Customize Your Setup:**
- Edit `CONTEXT.md` with your environment and preferences
- Add custom agents to `AGENTS.md` 
- Configure MCP servers in `MCP.md`

---

## 📚 Documentation & Examples

### System Guides
- **[Agents](agents/README.md)** - 50+ specialized agents and creation guide
- **[Commands](commands/README.md)** - Workflow automation and integration  
- **[Scripts](scripts/README.md)** - Project management automation
- **[Rules](rules/README.md)** - Quality standards and patterns

### Production Examples

**Full-Stack Development** (AI Development Studio in action)
```bash
hydra new "real-time chat application"
# → Claude Code planning with Socratic methodology
# → Epic breakdown: auth, websockets, UI, deployment
hydra run "chat-epic"  
# → Autonomous execution: typescript-node-developer → frontend-developer → test-writer-fixer
```

**Crisis Resolution** (Emergency response workflow)
```bash
hydra new "critical payment processing failure"
# → Immediate triage and parallel investigation plan
hydra run "payment-hotfix"
# → Multiple agents investigate in parallel → Hot fix deployed
```

**Legacy Modernization** (Systematic transformation)
```bash
hydra new "PHP monolith to TypeScript microservices migration"
# → Comprehensive migration strategy with risk assessment  
hydra run "modernization-epic"
# → refactoring-specialist → typescript-node-developer → systematic execution
```

### Project Structure

```
hydra/
├── Core Framework/
│   ├── CONTEXT.md     # Your environment (customize!)
│   ├── AGENTS.md      # 50+ agent definitions  
│   ├── MCP.md         # Tool integrations
│   └── RULES.md       # Safety protocols
├── agents/            # 50+ specialized agents
│   ├── utilities/     # file-creator, git-workflow, test-runner
│   ├── engineering/   # Language & architecture specialists  
│   ├── design/        # UI/UX specialists
│   └── marketing/     # Growth specialists
├── commands/          # Workflow automation
└── scripts/           # Automation hooks
```

---

## 🤝 Community & Contributing

**Support & Discussion**
- 💬 Discord community for users and contributors
- 📚 Documentation with guides and examples  
- 🐛 GitHub Issues for bugs and features

**How to Contribute**
- 🤖 **Agents** - Create new domain specialists
- ⚡ **Integrations** - Connect new MCP tools
- 📖 **Documentation** - Improve guides and examples
- 🛠️ **Features** - Enhance core framework

**Contributors & Credits**
- **[Contains Studio](https://github.com/contains-studio/agents)** - 50+ agent ecosystem
- **[Agent OS](https://github.com/buildermethods/agent-os)** - Workflow patterns
- **Anthropic** - The AI platform powering this
- **Community** - Everyone making AI development better

**MIT License** - Free for personal and commercial use

<div align="center">

## 🐉 Ready to Unleash Unlimited Conversations?

**Transform your AI development from 50-message sprints to 300+ message marathons**

### [🚀 Get Started](#-quick-start) • [🧠 Explore Agents](#-your-expert-agents) • [🤝 Join Community](#-community--contributing)

**Context Firewall Technology™ • 50+ Expert Agents • Parallel Execution • Autonomous Excellence**

*Where context limits are slain, and mythical productivity becomes reality.*

</div>

## 📚 Complete Agent Reference

<details>
<summary><strong>🔧 Engineering Specialists (20+ agents)</strong></summary>

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

</details>

<details>
<summary><strong>🎨 Design & Marketing Specialists (15+ agents)</strong></summary>

**Design Specialists**
- `ui-designer` - Interface design, component systems, design tokens
- `ux-researcher` - User research, usability testing, experience optimization
- `whimsy-injector` - Delightful interactions, micro-animations, personality
- `brand-guardian` - Visual consistency, brand compliance, style guides
- `visual-storyteller` - Compelling visuals, graphics, presentation design

**Marketing Specialists**
- `growth-hacker` - Viral growth loops, user acquisition, retention strategies
- `tiktok-strategist` - Short-form content, viral trends, engagement optimization
- `app-store-optimizer` - ASO, store presence, conversion optimization
- `content-creator` - Cross-platform content strategy and creation
- `instagram-curator` - Visual content strategy, aesthetic consistency

</details>

<details>
<summary><strong>🎯 Coordination & Utility Specialists (10+ agents)</strong></summary>

**Coordination Specialists**
- `cofounder` - Strategic Head for ambiguous goal analysis and Socratic requirement clarification
- `parallel-worker` - Technical execution engine with dependency-aware workflows  
- `project-shipper` - End-to-end delivery management, timeline coordination
- `experiment-tracker` - A/B testing, feature flags, validation workflows

**Utility Specialists (Mandatory)**
- `file-creator` - ALL file/directory creation, templates, batch operations
- `git-workflow` - ALL git operations with safety protocols and commit standards
- `test-runner` - ALL test execution, coverage analysis, and result interpretation
- `context-fetcher` - ALL documentation retrieval and internal knowledge access
- `knowledge-fetcher` - ALL external research, web search, and knowledge synthesis

</details>

---

**Built on proven agent-based AI development methodologies from claude-code-studio and CCPM (Claude Code Project Management).**
