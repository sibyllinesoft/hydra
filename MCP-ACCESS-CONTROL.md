# MCP ACCESS CONTROL - Agent-Specific Tool Restrictions

**Version**: 1.0  
**Date**: 2025-01-19  
**Purpose**: Prevent tool confusion through precise agent-MCP mapping and access restrictions

## 🎯 CORE PRINCIPLE: PRECISION TOOL ACCESS

**"Give agents exactly what they need, nothing more"**

- **Eliminate Tool Confusion**: Agents only see tools relevant to their domain
- **Optimize Performance**: Reduce tool selection overhead and decision paralysis
- **Prevent Misuse**: Block inappropriate tool usage before it happens
- **Maintain Expertise**: Keep agents focused on their specialized functions

---

## 🔍 MCP ACCESS ANALYSIS BY AGENT TYPE

### 🚫 PLAYWRIGHT ACCESS RESTRICTIONS

**PLAYWRIGHT SHOULD ONLY BE AVAILABLE TO:**

| Agent | Justification | Primary Use Cases |
|-------|---------------|-------------------|
| **test-writer-fixer** | E2E testing, visual regression | User journey validation, form testing, interaction flows |
| **frontend-developer** | UI debugging, component testing | Component behavior, responsive design, browser compatibility |
| **api-tester** | Browser-based API testing | Authentication flows, CORS testing, cookie management |
| **workflow-optimizer** | Automation workflow testing | Process validation, user experience optimization |
| **ux-researcher** | User journey analysis | User behavior patterns, usability testing |
| **performance-benchmarker** | Core Web Vitals testing | Page load analysis, interaction performance |

**PLAYWRIGHT SHOULD NOT BE AVAILABLE TO:**
- **Marketing agents** (tiktok-strategist, growth-hacker, content-creator)
- **Design agents** (ui-designer, brand-guardian, visual-storyteller)  
- **Operations agents** (finance-tracker, analytics-reporter)
- **Product agents** (feedback-synthesizer, sprint-prioritizer)
- **Utility agents** (file-creator, git-workflow, context-fetcher)

**Reasoning**: These agents work with content, strategy, and data - not interactive browser automation.

### 🛡️ SUPABASE ACCESS RESTRICTIONS

**SUPABASE SHOULD ONLY BE AVAILABLE TO:**

| Agent | Justification | Primary Use Cases |
|-------|---------------|-------------------|
| **backend-architect** | Database design, schema management | Table creation, relationship design, query optimization |
| **api-tester** | Database integration testing | API-database integration, data validation |
| **analytics-reporter** | Data analysis, reporting | Business metrics, user analytics, performance data |
| **infrastructure-maintainer** | Database operations, scaling | Backup management, performance tuning, scaling |
| **experiment-tracker** | A/B testing data | Feature flag data, experiment results |

**SUPABASE SHOULD NOT BE AVAILABLE TO:**
- **Frontend agents** (focus on UI, not direct database access)
- **Marketing agents** (work with analytics reports, not raw data)
- **Design agents** (visual focus, not data operations)
- **Utility agents** (file/git operations, not database)

### 🚨 SENTRY ACCESS RESTRICTIONS

**SENTRY SHOULD ONLY BE AVAILABLE TO:**

| Agent | Justification | Primary Use Cases |
|-------|---------------|-------------------|
| **backend-architect** | API error analysis | Server error debugging, performance issues |
| **frontend-developer** | UI error analysis | Client-side error tracking, user experience issues |
| **performance-benchmarker** | Performance monitoring | Error impact on performance, optimization opportunities |
| **infrastructure-maintainer** | System monitoring | Infrastructure-related errors, scaling issues |
| **support-responder** | Customer issue investigation | User-reported errors, issue reproduction |

---

## 📊 COMPREHENSIVE MCP ACCESS MATRIX

### 🔧 ENGINEERING AGENTS

| Agent | git | serena | sequential-thinking | context7 | playwright | supabase | sentry | readwise |
|-------|-----|--------|-------------------|----------|------------|----------|--------|----------|
| **rapid-prototyper** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **backend-architect** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| **frontend-developer** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **mobile-app-builder** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **ai-engineer** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **devops-automator** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### 🧪 TESTING AGENTS

| Agent | git | serena | sequential-thinking | context7 | playwright | supabase | sentry | readwise |
|-------|-----|--------|-------------------|----------|------------|----------|--------|----------|
| **test-writer-fixer** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **api-tester** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **performance-benchmarker** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **test-results-analyzer** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **tool-evaluator** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **workflow-optimizer** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

### 🎨 DESIGN AGENTS

| Agent | git | serena | sequential-thinking | context7 | playwright | supabase | sentry | readwise |
|-------|-----|--------|-------------------|----------|------------|----------|--------|----------|
| **ui-designer** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **ux-researcher** | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **whimsy-injector** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **brand-guardian** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **visual-storyteller** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |

### 📈 MARKETING AGENTS

| Agent | git | serena | sequential-thinking | context7 | playwright | supabase | sentry | readwise |
|-------|-----|--------|-------------------|----------|------------|----------|--------|----------|
| **growth-hacker** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **tiktok-strategist** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **app-store-optimizer** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **content-creator** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **instagram-curator** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **reddit-community-builder** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **twitter-engager** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |

### 🎯 PRODUCT AGENTS

| Agent | git | serena | sequential-thinking | context7 | playwright | supabase | sentry | readwise |
|-------|-----|--------|-------------------|----------|------------|----------|--------|----------|
| **feedback-synthesizer** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **sprint-prioritizer** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **trend-researcher** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |

### 📋 PROJECT MANAGEMENT AGENTS

| Agent | git | serena | sequential-thinking | context7 | playwright | supabase | sentry | readwise |
|-------|-----|--------|-------------------|----------|------------|----------|--------|----------|
| **experiment-tracker** | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **project-shipper** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **studio-producer** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### 🏢 OPERATIONS AGENTS

| Agent | git | serena | sequential-thinking | context7 | playwright | supabase | sentry | readwise |
|-------|-----|--------|-------------------|----------|------------|----------|--------|----------|
| **analytics-reporter** | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **finance-tracker** | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **infrastructure-maintainer** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| **legal-compliance-checker** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **support-responder** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |

### 🛠️ UTILITY AGENTS (MANDATORY UNIVERSAL ACCESS)

| Agent | git | serena | sequential-thinking | context7 | playwright | supabase | sentry | readwise |
|-------|-----|--------|-------------------|----------|------------|----------|--------|----------|
| **file-creator** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **git-workflow** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **context-fetcher** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **knowledge-fetcher** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **date-checker** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 🎭 SPECIAL AGENTS

| Agent | git | serena | sequential-thinking | context7 | playwright | supabase | sentry | readwise |
|-------|-----|--------|-------------------|----------|------------|----------|--------|----------|
| **studio-coach** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **joker** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 IMPLEMENTATION STRATEGY

### 🔧 Configuration Architecture

```yaml
agent_mcp_access:
  base_configuration:
    universal_access: [git, sequential-thinking]
    utility_mandatory: [context7] # All agents need docs access
    
  specialized_configurations:
    engineering_tier:
      extends: base_configuration
      adds: [serena] # Code analysis for all engineering
      
    testing_tier:
      extends: engineering_tier
      selective: [playwright] # Only specific testing agents
      
    data_tier:
      extends: base_configuration  
      adds: [supabase] # Only data-focused agents
      
    monitoring_tier:
      extends: base_configuration
      adds: [sentry] # Only error-tracking agents
      
    research_tier:
      extends: base_configuration
      adds: [readwise] # Only knowledge-focused agents
```

### 🎯 Agent Configuration Examples

```yaml
test-writer-fixer:
  mcp_access: [git, serena, sequential-thinking, context7, playwright]
  restrictions: [supabase, sentry, readwise]
  fallbacks:
    playwright_unavailable: "Use manual test descriptions and instructions"
    
backend-architect:
  mcp_access: [git, serena, sequential-thinking, context7, supabase, sentry]
  restrictions: [playwright, readwise]
  fallbacks:
    supabase_unavailable: "Use manual SQL and schema descriptions"
    sentry_unavailable: "Use manual error analysis and logging strategies"
    
marketing-agents:
  mcp_access: [git, sequential-thinking, context7, readwise]
  restrictions: [serena, playwright, supabase, sentry]
  fallbacks:
    readwise_unavailable: "Use web search and manual research"
```

### 🔄 Fallback Strategies

**When Restricted Tools Aren't Available:**

1. **Playwright Restrictions**:
   - **Alternative**: Provide detailed manual testing instructions
   - **Approach**: Generate test cases, user flow descriptions, and validation checklists
   - **Example**: "Instead of automated browser testing, create comprehensive manual test script with step-by-step instructions"

2. **Supabase Restrictions**:
   - **Alternative**: Generate SQL queries and schema descriptions
   - **Approach**: Provide database design documentation and query examples
   - **Example**: "Instead of direct database operations, create SQL migration files and setup instructions"

3. **Sentry Restrictions**:
   - **Alternative**: Manual error handling and logging strategies
   - **Approach**: Design error tracking patterns and logging implementations
   - **Example**: "Instead of direct error monitoring, create error handling middleware and logging configuration"

4. **Serena Restrictions**:
   - **Alternative**: Text-based code analysis and pattern recognition
   - **Approach**: Manual code review processes and architectural guidance
   - **Example**: "Instead of semantic code analysis, provide architectural principles and code review checklists"

---

## 🚫 TOOL CONFUSION PREVENTION

### ❌ CLEAR "DO NOT USE" GUIDELINES

**For Marketing Agents:**
```yaml
DO_NOT_USE:
  - playwright: "You work with content strategy, not browser automation"
  - supabase: "You work with analytics insights, not raw database operations"
  - serena: "You focus on market strategy, not code analysis"
  - sentry: "You handle growth metrics, not technical error tracking"
  
USE_INSTEAD:
  - sequential-thinking: "For strategic analysis and planning"
  - readwise: "For market research and trend analysis"
  - context7: "For documentation and best practices research"
```

**For Design Agents:**
```yaml
DO_NOT_USE:
  - playwright: "Focus on design, not browser automation (except ux-researcher)"
  - supabase: "You work with design systems, not databases"
  - serena: "You focus on visual design, not code structure"
  - sentry: "You handle user experience, not technical errors"
  
USE_INSTEAD:
  - sequential-thinking: "For design process analysis and decision-making"
  - context7: "For design system documentation and UI library research"
  - readwise: "For design inspiration and best practices research"
```

**For Operations Agents:**
```yaml
SELECTIVE_ACCESS:
  - supabase: "Only for analytics-reporter, finance-tracker, infrastructure-maintainer"
  - sentry: "Only for infrastructure-maintainer, support-responder"
  - playwright: "Operations focus on data and processes, not UI automation"
  - serena: "Only for infrastructure-maintainer (system code analysis)"
```

### 🔍 Error Handling for Restricted Access

```yaml
restriction_errors:
  agent_tries_restricted_tool:
    response: "This tool is not available to your agent type. Your specialized tools are: [list available tools]"
    guidance: "Use [suggested alternative] instead for this type of task"
    escalation: "If this limitation prevents your core function, escalate to studio-coach for agent coordination"
    
  tool_not_working:
    response: "Tool temporarily unavailable. Using fallback approach: [describe alternative method]"
    guidance: "This approach provides [specific benefits] while maintaining your specialized expertise"
    documentation: "Generated solution is designed for [specific use case] and can be implemented as [specific steps]"
```

### 🎯 Agent Coaching for Tool Selection

```yaml
selection_guidance:
  before_tool_use:
    question: "Is this tool essential for my specialized function?"
    check: "Do I have this tool in my access list?"
    alternative: "What fallback approach serves the user's needs?"
    
  when_tool_unavailable:
    approach: "Leverage my specialized expertise to provide alternative solution"
    focus: "Maintain quality output using available tools and domain knowledge"
    documentation: "Clearly explain approach and any limitations"
    
  escalation_criteria:
    core_function_blocked: "Tool restriction prevents primary agent function"
    coordination_needed: "Multiple agents needed for comprehensive solution"
    fallback_insufficient: "Alternative approaches don't meet user requirements"
```

---

## 📈 BENEFITS OF PRECISE ACCESS CONTROL

### 🎯 Performance Improvements
- **Reduced Decision Overhead**: Agents see only relevant tools
- **Faster Tool Selection**: No analysis of inappropriate options
- **Clearer Error Messages**: Immediate feedback on access restrictions
- **Optimized Resource Usage**: No unused tool overhead

### 🛡️ Quality Assurance
- **Prevented Misuse**: Agents can't select inappropriate tools
- **Domain Expertise Preserved**: Agents stay focused on their specialization
- **Consistent Outputs**: Standardized tool usage patterns per agent type
- **Fallback Quality**: Alternative approaches maintain professional standards

### 🔧 Operational Benefits
- **Clear Boundaries**: Agents understand their tool scope
- **Predictable Behavior**: Consistent tool usage across agent instances
- **Easier Debugging**: Tool selection issues immediately identifiable
- **Scalable Architecture**: Easy to add new agents with appropriate tool access

**This access control system ensures agents operate at peak efficiency within their domains while preventing tool confusion and maintaining the highest quality outputs.**