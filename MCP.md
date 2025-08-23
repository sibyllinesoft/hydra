# MCP - Server Configuration & Integration

## SERVER CATEGORIES
**Core Development**: git, serena, ide | **Documentation**: context7, readwise, sequential-thinking | **Database**: supabase | **Testing**: playwright, puppeteer | **Monitoring**: sentry, gmail | **Deployment**: vercel

## AGENT-MCP COORDINATION

### Utility Agent Delegations (MANDATORY)
- **file-creator**: File operations (Write, MultiEdit, Edit)
- **git-workflow**: Version control (git.git_commit, git.git_add, git.git_status)
- **knowledge-fetcher**: Research (readwise, context7, WebSearch)
- **date-checker**: Temporal calculations (date commands, filtering)
- **context-fetcher**: Documentation (Read, Glob, WebFetch)

### Engineering Agent Patterns (2024-2025)

**Master Template Architecture**:
- **All Language-Specific Developers**: serena (code analysis) + sequential-thinking (complex reasoning) + git (version control)
- **Backend Architects**: serena + sequential-thinking + git + context7 (architectural patterns)
- **Frontend Developers**: serena + sequential-thinking + git + playwright (UI testing)

**Language-Specific MCP Coordination**:
- **typescript-node-developer**: serena + git + sequential-thinking + context7 (TypeScript/Node.js docs)
- **python-backend-developer**: serena + git + sequential-thinking + context7 (Python/FastAPI docs)
- **nodejs-backend-developer**: serena + git + sequential-thinking (JavaScript-specific optimization)
- **rust-backend-developer**: serena + git + sequential-thinking + context7 (Rust ecosystem docs)
- **go-backend-developer**: serena + git + sequential-thinking + context7 (Go patterns)

**Specialized Problem Solving**:
- **super-hard-problem-developer**: ALL available MCPs (comprehensive toolset for complex debugging)
- **refactoring-specialist**: serena + git + sequential-thinking (code transformation focus)

**Traditional Agent Patterns**:
- **Testing**: test-writer-fixer → playwright/ide → validation
- **Code Analysis**: Engineering agents → serena/sequential-thinking → insights
- **Error Resolution**: backend-architect → sentry/supabase → diagnosis
- **Deployment**: devops-automator → vercel/git → monitoring

## AGENT-SPECIFIC MCP ACCESS PATTERNS

### Engineering Department MCP Requirements
```yaml
general_engineering_agents:
  base_requirements: [git, serena, sequential-thinking]
  optional_additions: [context7, playwright]
  
language_specific_developers:
  base_requirements: [git, serena, sequential-thinking]
  documentation_access: [context7]
  restrictions: [NO supabase, NO sentry, NO playwright]
  reasoning: "Focus on code implementation, not infrastructure"
  
specialized_problem_solving:
  super_hard_problem_developer:
    access: "ALL available MCPs"
    reasoning: "Complex problems may require any tool combination"
  refactoring_specialist:
    requirements: [git, serena, sequential-thinking]
    focus: "Code transformation and technical debt reduction"
```

### Design & Marketing Agent Restrictions
```yaml
design_agents:
  allowed: [git, sequential-thinking, context7, readwise]
  restricted: [serena, supabase, sentry, playwright]
  reasoning: "Visual focus, not code analysis"
  
marketing_agents:
  allowed: [git, sequential-thinking, context7, readwise]
  restricted: [serena, supabase, sentry, playwright]
  reasoning: "Content strategy, not technical implementation"
```

## QUERY CLASSIFICATION RULES

### Task Type Detection
```yaml
simple_lookup:
  indicators: ["find", "get", "show", "list", "what is", "when did"]
  rule: "Use most direct tool, STOP after definitive answer"
  max_tools: 1-2
  
complex_analysis:
  indicators: ["analyze", "compare", "synthesize", "recommend", "explain why", "how should"]
  rule: "Multi-tool coordination acceptable, sequential-thinking encouraged"
  max_tools: 3-5
  
language_specific_development:
  indicators: ["TypeScript backend", "Python API", "Rust service", "Go microservice", "Node.js optimization"]
  agent_routing: "Language-specific developer + base MCP requirements"
  pattern: "serena + git + sequential-thinking + context7"
```

## ERROR RECOVERY & FALLBACKS
- **git** → Manual git commands → Note version control limitations  
- **context7** → WebSearch → Manual documentation lookup
- **sequential-thinking** → Native analysis → Note complexity limitations
- **puppeteer/playwright** → Manual testing → Provide test cases and fallback instructions
- **serena** → Text-based code analysis → Note semantic analysis limitations
- **sentry** → Manual error tracking → Log analysis and issue documentation
- **supabase** → Manual SQL operations → Database connection alternatives
- **vercel** → Manual deployment → CI/CD pipeline alternatives
- **readwise** → Manual search → Note knowledge management gaps
- **gmail** → Manual email operations → Note communication workflow disruption
- **ide** → Text-based diagnostics → Note development environment limitations

## ANTI-PATTERNS & USAGE WARNINGS

### Critical Avoid Conditions
- **supabase_operations**: read_only_environment, production_lockdown
- **browser_automation**: headless_server_environment, rate_limited_apis
- **sentry_operations**: insufficient_permissions, service_outage
- **git_operations**: detached_head_state
- **sequential_thinking**: simple_single_step_tasks

### Performance Anti-Patterns
- **excessive_sequential_thinking_calls**: >3 calls per task
- **browser_automation_for_api_tasks**: Use direct API calls when available
- **readwise_export_overuse**: STOP after list_highlights unless full content specifically needed
- **unnecessary_tool_escalation**: Apply STOP rule from query classification

## PERFORMANCE OPTIMIZATION

### Stop Conditions
```yaml
stop_execution_when:
  query_answered: "Got definitive answer to user's specific question"
  token_threshold_reached: "simple_lookup: >1000 tokens, medium_analysis: >5000 tokens, complex_analysis: >15000 tokens"
  completion_criteria_met: "Task objectives fully satisfied"
  error_resolution_complete: "Problem identified and solution provided"
```

### Agent-Optimized MCP Performance

**Engineering Agent Performance Profiles**:
```yaml
language_specific_developers:
  serena_operations: "100-500ms (code analysis), essential for all implementations"
  git_operations: "50-200ms (version control), required for all code changes"
  sequential_thinking: "1000-5000ms (architectural decisions), for complex problems"
  context7_operations: "300-1000ms (documentation), for framework guidance"
  
specialized_agents:
  super_hard_problem_developer: "All MCPs available, 10-60 second complex analysis cycles"
  refactoring_specialist: "serena + git focus, 2-10 second rapid iteration cycles"
```

**Traditional Tool Performance Profiles**:
- **git_operations**: 50-200ms, minimal tokens, parallel_safe
- **supabase_operations**: 200-2000ms, low-medium tokens, NOT parallel_safe
- **sentry_operations**: 300-30000ms, low-very_high tokens, parallel_safe
- **browser_automation**: 800-5000ms, medium tokens, resource_intensive, NOT parallel_safe
- **sequential_thinking**: 1000-10000ms, high-very_high tokens, parallel_safe
- **serena_operations**: 100-2000ms, low-medium tokens, parallel_safe
- **readwise_operations**: 300-10000ms, low-very_high tokens, parallel_safe

### Master Template Efficiency Benefits
```yaml
consistency_gains:
  all_language_developers: "Same base MCP pattern reduces decision overhead"
  standardized_workflows: "E-H-A-E-D-R cycles optimize MCP usage sequences"
  
performance_optimization:
  focused_tool_sets: "Language developers avoid irrelevant MCPs"
  specialized_expertise: "Deep knowledge reduces trial-and-error MCP usage"
  context_preservation: "Agent spawning eliminates MCP context pollution"
```