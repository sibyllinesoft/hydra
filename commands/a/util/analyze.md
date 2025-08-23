---
agent: file-analyzer
description: MANDATORY agent for analyzing verbose files to prevent context bloat (CCMP Rule)
---

**CCPM Hard Rule**: MUST use this agent when asked to read or analyze verbose files.

This agent processes large files, logs, command outputs, and data files in isolation, returning only relevant summaries and insights to preserve main conversation context.

**Use for**:
- Large log file analysis
- Command output processing
- Data file examination
- Configuration file analysis
- Any file content that would generate verbose output

**Context Firewall**: Processes verbose content separately and provides focused summaries.