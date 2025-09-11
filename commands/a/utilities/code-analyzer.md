---
agent: code-analyzer
description: MANDATORY agent for code analysis to prevent context bloat (CCMP Rule)
---

**CCPM Hard Rule**: MUST use this agent instead of direct code analysis tools.

This agent performs verbose code analysis, bug investigation, and logic tracing in isolation, returning only concise summaries to preserve main conversation context.

**Use for**:
- Large codebase analysis
- Initial code searches and investigations  
- Bug diagnosis and root cause analysis
- Logic flow tracing
- Pattern detection and code quality assessment

**Context Firewall**: Prevents verbose output from polluting main conversation thread.