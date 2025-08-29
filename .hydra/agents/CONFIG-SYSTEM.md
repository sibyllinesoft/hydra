---
name: CONFIG-SYSTEM
role: CONFIG SYSTEM
capabilities:
  - Task execution
  - Context analysis
version: 1.0
created: 2025-08-24T05:44:55.227Z
---

# Agent Configuration System - MCP Access Control

## Overview
The agent configuration system implements precise MCP access control through specialized base configurations. Each agent category has tailored tool access that matches their responsibilities while maintaining security boundaries.

## Configuration Files

### 1. **base-config.yml** (Default - Most Restrictive)
**Used by**: General purpose agents, design agents, marketing agents, content agents
**MCP Access**: 
- ✅ git (version control)
- ✅ sequential-thinking (analysis)
- ✅ context7 (documentation)
- ❌ NO database, monitoring, browser, or code analysis

**Rationale**: Maximum safety for agents that don't need sensitive operations

### 2. **engineering-base-config.yml** (Code Development)
**Used by**: rapid-prototyper, backend-architect, frontend-developer, ai-engineer, devops-automator
**MCP Access**:
- ✅ git (version control)
- ✅ serena (code analysis & LSP)
- ✅ sequential-thinking (complex analysis)
- ✅ context7 (technical docs)
- ❌ NO database, monitoring, or browser

**Rationale**: Engineers need code analysis but not operational data access

### 3. **testing-base-config.yml** (Browser Testing)
**Used by**: test-writer-fixer (UI testing), performance-benchmarker (browser testing)
**MCP Access**:
- ✅ git (version control)
- ✅ serena (code analysis)
- ✅ playwright (browser automation)
- ✅ sequential-thinking (test strategy)
- ✅ context7 (testing docs)
- ❌ NO database or monitoring

**Rationale**: E2E testing requires browser automation but not operational access

### 4. **testing-api-base-config.yml** (API Testing)
**Used by**: api-tester, test-results-analyzer, tool-evaluator
**MCP Access**:
- ✅ git (version control)
- ✅ serena (API code analysis)
- ✅ sequential-thinking (strategy)
- ✅ context7 (API docs)
- ❌ NO browser, database, or monitoring

**Rationale**: API testing needs code analysis without browser overhead

### 5. **operations-base-config.yml** (Data & Monitoring)
**Used by**: analytics-reporter, infrastructure-maintainer, support-responder
**MCP Access**:
- ✅ git (version control)
- ✅ supabase (database operations)
- ✅ sentry (error monitoring)
- ✅ sequential-thinking (troubleshooting)
- ✅ context7 (operational docs)
- ❌ NO browser or code analysis

**Rationale**: Operations need data/monitoring access but not development tools

### 6. **utility-base-config.yml** (Knowledge Management)
**Used by**: context-fetcher, knowledge-fetcher, date-checker
**MCP Access**:
- ✅ git (version control)
- ✅ readwise (knowledge base)
- ✅ context7 (documentation)
- ✅ sequential-thinking (research synthesis)
- ❌ NO browser, database, monitoring, or code analysis

**Rationale**: Knowledge agents focus on research without operational access

## Security Benefits

### Access Isolation
- **Prevents**: General agents from accessing sensitive database operations
- **Prevents**: Design agents from browser automation capabilities
- **Prevents**: Utility agents from production monitoring access
- **Prevents**: Marketing agents from code analysis tools

### Principle of Least Privilege
Each agent receives exactly the MCP access needed for their domain:
- Code development agents get code analysis tools
- Testing agents get browser automation when needed
- Operations agents get database/monitoring access
- Knowledge agents get research tools
- General agents get minimal, safe access

### Attack Surface Reduction
- Reduces potential for unauthorized operations
- Limits blast radius of agent compromises
- Prevents cross-domain capability abuse
- Maintains clear responsibility boundaries

## Usage Instructions

### For Agent Developers
Replace generic `@base-config.yml` references with appropriate specialized configs:

```yaml
# Instead of:
description: |
  Agent description here.
  @base-config.yml

# Use appropriate specialization:
description: |
  Backend development agent.
  @engineering-base-config.yml
```

### Configuration Selection Guide
1. **General purpose** → `@base-config.yml`
2. **Code development** → `@engineering-base-config.yml`
3. **UI/E2E testing** → `@testing-base-config.yml`
4. **API testing** → `@testing-api-base-config.yml`
5. **Data/monitoring** → `@operations-base-config.yml`
6. **Research/knowledge** → `@utility-base-config.yml`

### Migration Path
1. Audit existing agents for their actual MCP needs
2. Replace `@base-config.yml` with appropriate specialized config
3. Test agent functionality with restricted access
4. Document any agents requiring custom configurations

## Performance Benefits

### Reduced Context Overhead
- Agents load only relevant tools
- Smaller configuration footprint
- Faster agent initialization

### Optimized Resource Usage
- Browser automation only for testing agents
- Database connections only for operations agents
- Code analysis only for engineering agents

### Clearer Error Handling
- Tool availability matches agent capabilities
- Predictable failure modes
- Better error messages for access violations

## Maintenance

### Adding New MCPs
1. Evaluate which agent categories need access
2. Add to appropriate specialized configs
3. Update security documentation
4. Test with representative agents

### Modifying Access
1. Consider security implications
2. Update relevant base configs
3. Document rationale for changes
4. Migrate affected agents

### Monitoring Usage
- Track which agents use which MCPs
- Identify unused capabilities
- Optimize configurations based on usage patterns
- Regular security audits of access patterns

This system provides a scalable, secure foundation for agent MCP access while maintaining the flexibility to grant specialized capabilities where needed.