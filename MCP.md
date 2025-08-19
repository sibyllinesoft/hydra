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

### Specialized Agent Patterns
- **Testing**: test-writer-fixer → playwright/ide → validation
- **Code Analysis**: Engineering agents → serena/sequential-thinking → insights
- **Error Resolution**: backend-architect → sentry/supabase → diagnosis
- **Deployment**: devops-automator → vercel/git → monitoring

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

### Tool Performance Profiles
- **git_operations**: 50-200ms, minimal tokens, parallel_safe
- **supabase_operations**: 200-2000ms, low-medium tokens, NOT parallel_safe
- **sentry_operations**: 300-30000ms, low-very_high tokens, parallel_safe
- **browser_automation**: 800-5000ms, medium tokens, resource_intensive, NOT parallel_safe
- **sequential_thinking**: 1000-10000ms, high-very_high tokens, parallel_safe
- **serena_operations**: 100-2000ms, low-medium tokens, parallel_safe
- **readwise_operations**: 300-10000ms, low-very_high tokens, parallel_safe