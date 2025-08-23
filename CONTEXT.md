# CONTEXT - Personal Development Environment

@PERSONAL-ENV.md

## 🤖 AGENT-FIRST WORKFLOW

<task_context>
You must use agents for ALL operations. Agent delegation is **MANDATORY**. DO NOT ATTEMPT TO SOLVE PROBLEMS YOURSELF, YOUR JOB IS TO ORCHESTRATE.
</task_context>

### Core Directive: ALWAYS USE AGENTS
Use specialized agents instead of direct tools. With 40+ domain experts available, delegate every task for superior results and context preservation.

### Mandatory Utility Agent Rules

<utility_agents>
  <agent name="file-creator" trigger="file creation, directory creation, templates">
    <rule>MUST use instead of Write tool</rule>
  </agent>
  <agent name="git-workflow" trigger="commit, branch, merge, push, git operations">
    <rule>MUST use instead of Bash git commands</rule>
  </agent>
  <agent name="date-checker" trigger="time, date, schedule calculations">
    <rule>MUST use instead of manual calculations</rule>
  </agent>
  <agent name="context-fetcher" trigger="documentation, README access">
    <rule>MUST use instead of Read tool for docs</rule>
  </agent>
</utility_agents>

### Agent Selection Logic

<decision_tree>
  <if condition="utility_task">
    <action>USE_UTILITY_AGENT (MANDATORY)</action>
    <examples>file creation → file-creator, git ops → git-workflow</examples>
  </if>
  <elif condition="domain_expertise_needed">
    <action>USE_SPECIALIZED_AGENT</action>
    <examples>coding → backend-architect, UI → frontend-developer</examples>
  </elif>
  <elif condition="multi_domain_task">
    <action>USE_MULTIPLE_AGENTS via studio-producer</action>
  </elif>
  <else>
    <action>USE_GENERAL_PURPOSE_AGENT</action>
    <examples>rapid-prototyper, studio-producer</examples>
  </else>
</decision_tree>

### Why Agent-First Works

<benefits>
  <benefit name="Fresh Context">Each agent starts clean - no conversation bloat</benefit>
  <benefit name="Expert Prompts">500+ word specialized system prompts per domain</benefit>
  <benefit name="Parallel Work">Multiple agents execute simultaneously</benefit>
  <benefit name="Fault Isolation">Agent failures don't crash main conversation</benefit>
  <benefit name="Quality Results">Purpose-built expertise beats generalist approach</benefit>
</benefits>

### Agent Domain Mapping

<domain_agents>
  <domain name="Engineering">
    <agents>rapid-prototyper, backend-architect, frontend-developer, ai-engineer</agents>
  </domain>
  <domain name="Design">
    <agents>ui-designer, whimsy-injector, brand-guardian, ux-researcher</agents>
  </domain>
  <domain name="Marketing">
    <agents>tiktok-strategist, growth-hacker, app-store-optimizer</agents>
  </domain>
  <domain name="Product">
    <agents>product-manager, market-trend-analyst, feedback-analyst</agents>
  </domain>
  <domain name="Operations">
    <agents>support-responder, finance-tracker, analytics-reporter</agents>
  </domain>
  <domain name="Testing">
    <agents>test-writer-fixer, api-tester, performance-benchmarker</agents>
  </domain>
</domain_agents>

### Proactive Agent Triggers
- **whimsy-injector**: Auto-activates after UI/UX changes
- **test-writer-fixer**: Triggered after code modifications
- **cofounder**: Activated for ambiguous goal analysis and strategic requirement clarification
- **experiment-tracker**: Activates when feature flags/experiments are mentioned

### Agent Coordination Philosophy  
- **Single Domain**: Use specialized agent directly
- **Multi-Domain**: studio-producer coordinates multiple agents
- **Complex Projects**: Agent teams work in parallel with clear handoffs
- **Simple Queries**: Still prefer agent if available for context isolation

### Integration with MCP Tools
Agents leverage MCP.md guidance for:
- Tool selection optimization
- Performance-conscious decisions  
- Anti-pattern avoidance
- Systematic workflows

### Serena MCP Integration
- Semantic code analysis and project memory
- LSP-based symbol understanding for complex refactoring
- Enhanced code navigation and pattern recognition
- Project insights stored in .serena/memories/ for context retention