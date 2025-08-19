# AGENTS - Rapid Selection Guide & Intelligent Orchestrator

**Primary Directive**: "Agents First, Tools Second - Expert Context Over General Purpose"

## ⚡ RAPID AGENT SELECTION

### 🚨 MANDATORY UTILITY AGENTS (5)
**NEVER use direct tools for these domains**

| Agent | Domain | Trigger Keywords |
|-------|--------|------------------|
| **file-creator** | File/directory creation | "create", "generate", "new file", "setup structure" |
| **git-workflow** | All git operations | "commit", "branch", "merge", "git", "push", "pull" |
| **context-fetcher** | Internal documentation | "docs", "README", "internal guide", "project docs" |
| **knowledge-fetcher** | External research | "search", "Readwise", "Context7", "web search", "find articles" |
| **date-checker** | Date/time calculations | "when", "schedule", "time since", "date", "timestamp" |

### 🎯 INSTANT AGENT MATCHING

| User Intent | Primary Agent | Secondary Options |
|-------------|---------------|-------------------|
| **"Build new feature"** | rapid-prototyper | → ui-designer → frontend-developer |
| **"Fix this bug"** | backend-architect / frontend-developer | + test-writer-fixer (auto-triggers) |
| **"Test this code"** | test-writer-fixer | + api-tester, performance-benchmarker |
| **"Deploy this"** | devops-automator | + project-shipper |
| **"Design this UI"** | ui-designer | → frontend-developer → whimsy-injector |
| **"Analyze feedback"** | feedback-synthesizer | + ux-researcher |
| **"Complex multi-step"** | **studio-coach** | (orchestrates others) |

### 🔀 COMPLEXITY ROUTING

```yaml
Simple (1 agent):     Direct task → Specialized agent
Medium (2-3 agents):  Sequential workflow → Auto-handoffs  
Complex (4+ agents):  studio-coach → Orchestrated workflow
```

## 🎼 ORCHESTRATION WORKFLOWS

### 🏆 MASTER ORCHESTRATOR: studio-coach

**Auto-activates when:**
- 4+ agents needed
- Cross-domain complexity
- Multi-phase projects
- Agent coordination required

### 🎯 AUTO-TRIGGERING AGENTS

| Trigger Event | Agent | Purpose |
|---------------|-------|---------|
| Code changes | **test-writer-fixer** | Immediate test coverage |
| UI/UX changes | **whimsy-injector** | Add delightful interactions |
| Feature flags mentioned | **experiment-tracker** | A/B testing setup |
| Complex workflows start | **studio-coach** | Orchestration management |

## 🎯 SPECIALIZED AGENT DIRECTORY

### 🛠️ Engineering (7 agents)
- **rapid-prototyper**: MVP builder → ui-designer, test-writer-fixer
- **backend-architect**: API design → devops-automator, api-tester
- **frontend-developer**: UI implementation → ui-designer, whimsy-injector
- **mobile-app-builder**: Native apps → app-store-optimizer
- **ai-engineer**: AI/ML integration → performance-benchmarker
- **devops-automator**: Deployment → project-shipper, infrastructure-maintainer
- **test-writer-fixer**: Testing strategy → api-tester, test-results-analyzer

### 🎨 Design (5 agents)
- **ui-designer**: Interface design → frontend-developer, brand-guardian
- **ux-researcher**: User insights → feedback-synthesizer, analytics-reporter
- **whimsy-injector**: Interaction delight (auto-triggers after UI changes)
- **brand-guardian**: Visual consistency → visual-storyteller
- **visual-storyteller**: Marketing visuals → content-creator

### 📈 Marketing (7 agents)
- **growth-hacker**: Viral loops → analytics-reporter, experiment-tracker
- **tiktok-strategist**: TikTok content → content-creator
- **app-store-optimizer**: ASO → mobile-app-builder
- **content-creator**: Multi-platform content → instagram-curator, twitter-engager
- **instagram-curator**: Visual content → visual-storyteller
- **reddit-community-builder**: Community engagement → support-responder
- **twitter-engager**: Trend engagement → trend-researcher

### 🎯 Product (3 agents)
- **feedback-synthesizer**: User feedback → ux-researcher, sprint-prioritizer
- **sprint-prioritizer**: Planning → rapid-prototyper, studio-producer
- **trend-researcher**: Market analysis → growth-hacker

### 📋 Project Management (3 agents)
- **experiment-tracker**: A/B testing (auto-triggers on feature flags)
- **project-shipper**: Launch management → devops-automator
- **studio-producer**: Team coordination → studio-coach

### 🏢 Operations (5 agents)
- **analytics-reporter**: Data insights → experiment-tracker
- **finance-tracker**: Profitability → infrastructure-maintainer
- **infrastructure-maintainer**: Scaling → devops-automator
- **legal-compliance-checker**: Legal review → project-shipper
- **support-responder**: Customer support → feedback-synthesizer

### 🧪 Testing (5 agents)
- **api-tester**: API validation → backend-architect, performance-benchmarker
- **performance-benchmarker**: Speed optimization → test-results-analyzer
- **test-results-analyzer**: Failure patterns → test-writer-fixer
- **tool-evaluator**: Tech decisions → workflow-optimizer
- **workflow-optimizer**: Process improvement → studio-producer

### 🎭 Bonus Agents
- **joker**: Morale boost → whimsy-injector

## 🎯 AGENT SELECTION MATRIX

### Decision Tree
```yaml
task_analysis:
  utility_domain: USE_MANDATORY_AGENT (no alternatives)
  single_domain: USE_SPECIALIZED_AGENT
  cross_domain: SEQUENTIAL_WORKFLOW (2-3 agents)
  complex_project: STUDIO_COACH_ORCHESTRATION (4+ agents)
  
coordination_level:
  simple: Direct agent selection
  medium: Auto-handoffs between 2-3 agents
  complex: studio-coach orchestrated workflows
  
urgency:
  immediate: Single specialized agent
  planned: Sequential workflow
  strategic: Full orchestration with parallel teams
```

### Agent Relationship Map
```yaml
core_relationships:
  development_trio: [rapid-prototyper, frontend-developer, test-writer-fixer]
  design_duo: [ui-designer, whimsy-injector] 
  backend_stack: [backend-architect, devops-automator, api-tester]
  marketing_squad: [growth-hacker, content-creator, tiktok-strategist]
  testing_team: [test-writer-fixer, api-tester, performance-benchmarker, test-results-analyzer]
  
auto_triggers:
  code_change: test-writer-fixer
  ui_change: whimsy-injector  
  feature_flags: experiment-tracker
  complex_workflow: studio-coach
```

**Agent orchestration is as important as agent selection** - Use studio-coach for complex coordination, leverage auto-triggering for workflow continuity, and prefer agent teams over solo agent work for comprehensive solutions.