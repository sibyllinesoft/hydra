# AUTONOMOUS CONTINUATION HOOK - Configuration Guide

## Overview

The Autonomous Continuation Hook prevents agents from stopping prematurely by detecting incomplete work patterns and injecting continuation instructions. This implements the iterative cycle enforcement from ITERATIVE-CYCLE-ENFORCEMENT.md and ensures agents complete their work cycles autonomously.

## Installation

### 1. Enable Hook in Claude Code Settings

Add to your Claude Code `settings.json`:

```json
{
  "hooks": {
    "autonomous-continuation": {
      "enabled": true,
      "path": "/home/nathan/.claude/hooks/autonomous-continuation.js",
      "applyToMainOrchestrator": true,
      "applyToSubagents": true,
      "priority": "HIGH",
      "debugMode": false
    }
  }
}
```

### 2. Hook Configuration Options

```json
{
  "hooks": {
    "autonomous-continuation": {
      "enabled": true,                    // Enable/disable the hook
      "applyToMainOrchestrator": true,    // Apply to main Claude orchestrator
      "applyToSubagents": true,           // Apply to spawned agents
      "priority": "HIGH",                 // Hook execution priority
      "debugMode": false,                 // Enable debug logging
      "agentSpecificRules": {             // Agent-specific continuation rules
        "test-writer-fixer": {
          "strictMode": true,               // Enforce stricter continuation
          "maxIterations": 10              // Maximum autonomous iterations
        },
        "performance-benchmarker": {
          "strictMode": true,
          "targetThreshold": 0.95           // Performance target threshold
        }
      },
      "excludePatterns": [                 // Patterns to exclude from continuation
        "user requested stop",
        "waiting for approval",
        "external dependency"
      ]
    }
  }
}
```

## How It Works

### Detection Patterns

The hook analyzes agent responses for these continuation triggers:

#### 1. Incomplete TodoWrite Tasks
```javascript
// Detects patterns like:
- "I've created a todo list with 5 pending tasks"
- "3 tasks remaining in the todo list"
- JSON with "status": "pending" or "in_progress"
```

#### 2. Iterative Opportunities
```javascript
// Detects patterns like:
- "Performance could be improved"
- "Further optimization possible"
- "Next iteration should focus on..."
- "Additional testing needed"
```

#### 3. Analysis Without Action
```javascript
// Detects patterns like:
- "I've identified the issue" (without fixing it)
- "The problem is..." (without implementing solution)
- "This needs to be updated" (without updating it)
```

#### 4. Partial Completion
```javascript
// Detects patterns like:
- "Basic implementation complete"
- "Initial version created"
- "Minimum viable solution"
- "First draft ready"
```

### Agent-Specific Rules

Specialized continuation logic for different agent types:

- **test-writer-fixer**: Continues until all tests pass consistently
- **performance-benchmarker**: Continues until performance targets met
- **ui-designer**: Continues until design standards achieved
- **backend-architect**: Continues until production-ready
- **rapid-prototyper**: Continues until MVP is complete

### Continuation Instructions

When triggered, the hook injects context-specific instructions:

```
🔄 AUTONOMOUS CONTINUATION REQUIRED

Your response indicates incomplete work. You must continue working 
autonomously rather than stopping to prompt the user.

Mandatory Actions:
1. Complete any remaining TodoWrite tasks
2. Continue iterative cycles until optimal results achieved
3. Fix identified issues without asking for permission
4. Implement improvements you've identified
5. Only stop when work is truly complete or you hit technical boundaries

User Interruption: Users can interrupt at any time if they want to redirect.

CONTINUE WORKING NOW - DO NOT STOP FOR USER PROMPTS
```

## Usage Examples

### Example 1: TodoWrite Completion
**Before Hook:**
```
Agent: "I've created a todo list with 3 pending tasks. What would you like me to work on first?"
```

**After Hook:**
```
Agent: "I've created a todo list with 3 pending tasks. What would you like me to work on first?

📋 TODO COMPLETION REQUIRED

You have incomplete TodoWrite tasks. You must continue working on them autonomously.

Mandatory Protocol:
1. Mark current task as in_progress
2. Complete the task fully
3. Mark as completed only when truly finished
4. Move to next pending task
5. Continue until all todos are complete

DO NOT STOP with incomplete todos - continue working autonomously."
```

### Example 2: Performance Optimization
**Before Hook:**
```
Performance Agent: "Initial optimization complete. Performance improved by 20%. Could potentially improve further with additional caching strategies."
```

**After Hook:**
```
Performance Agent: "Initial optimization complete. Performance improved by 20%. Could potentially improve further with additional caching strategies.

🔁 ITERATIVE CYCLE CONTINUATION REQUIRED

Your analysis indicates suboptimal results requiring further iteration.

Mandatory Cycle Enforcement:
1. Analyze current state vs. target
2. Identify specific improvements needed
3. Implement improvements
4. Verify results
5. Continue iterating until targets achieved

CONTINUE ITERATING NOW - DO NOT STOP FOR USER PROMPTS"
```

### Example 3: Analysis to Action
**Before Hook:**
```
Backend Agent: "I've identified 3 API performance issues that need to be addressed. The database queries are inefficient and there's no caching layer."
```

**After Hook:**
```
Backend Agent: "I've identified 3 API performance issues that need to be addressed. The database queries are inefficient and there's no caching layer.

⚡ ACTION PHASE REQUIRED

You have completed analysis but have not taken action on identified issues.

Mandatory Action Protocol:
1. Implement fixes for identified problems
2. Apply suggested improvements
3. Test and verify changes
4. Document results
5. Continue until all identified issues are resolved

IMPLEMENT YOUR FINDINGS NOW."
```

## User Interruption Handling

Users can interrupt autonomous continuation at any time:

```
User: "Stop"
User: "Wait, let me review this first"
User: "Pause and show me what you have"
User: "That's enough for now"
```

The hook detects these patterns and allows normal stopping.

## Debugging and Monitoring

### Enable Debug Mode
```json
{
  "hooks": {
    "autonomous-continuation": {
      "debugMode": true
    }
  }
}
```

### Debug Output Examples
```
[AUTONOMOUS-CONTINUATION] Detected TODO_CONTINUATION - injecting continuation instruction
[AUTONOMOUS-CONTINUATION] Detected ITERATIVE_CONTINUATION - injecting continuation instruction
[AUTONOMOUS-CONTINUATION] User stop pattern detected - skipping continuation
[AUTONOMOUS-CONTINUATION] No continuation triggers found - normal response
```

### Log File Location
Debug logs are written to: `/home/nathan/.claude/logs/autonomous-continuation.log`

## Advanced Configuration

### Custom Agent Rules
```json
{
  "hooks": {
    "autonomous-continuation": {
      "customAgentRules": {
        "my-custom-agent": {
          "triggers": [
            "custom pattern 1",
            "custom pattern 2"
          ],
          "instruction": "Custom continuation message for this agent",
          "maxIterations": 5
        }
      }
    }
  }
}
```

### Exclude Specific Scenarios
```json
{
  "hooks": {
    "autonomous-continuation": {
      "skipPatterns": [
        "waiting for external approval",
        "requires human decision",
        "security review needed"
      ]
    }
  }
}
```

### Performance Tuning
```json
{
  "hooks": {
    "autonomous-continuation": {
      "performance": {
        "cacheAnalysis": true,          // Cache pattern analysis results
        "maxResponseLength": 50000,    // Skip analysis for very long responses
        "throttleMs": 100              // Throttle hook execution
      }
    }
  }
}
```

## Troubleshooting

### Hook Not Triggering
1. Check `settings.json` configuration
2. Verify hook file path is correct
3. Enable debug mode to see detection logs
4. Check that agent responses match trigger patterns

### False Positives
1. Add exclude patterns for specific scenarios
2. Adjust agent-specific rules
3. Lower hook priority or disable for specific agents

### Performance Issues
1. Enable caching in performance configuration
2. Increase throttle timing
3. Set maximum response length limit

### Agent Conflicts
1. Review agent-specific rules for conflicts
2. Adjust priority settings
3. Use exclude patterns for problematic scenarios

## Integration with Existing Systems

### ITERATIVE-CYCLE-ENFORCEMENT.md Compliance
This hook implements the mandatory cycle completion patterns defined in ITERATIVE-CYCLE-ENFORCEMENT.md:

- Prevents partial cycles
- Enforces external verification
- Requires evidence-based completion
- Implements agent-specific cycle patterns

### Agent Coordination
Works with existing agent orchestration:

- Respects cofounder coordination
- Maintains agent specialization boundaries
- Supports handoff protocols
- Preserves context across iterations

### Tool Integration
Compatible with all Claude Code tools:

- TodoWrite task management
- Git workflow automation
- Testing and validation cycles
- Performance optimization loops
- Content creation iterations

## Best Practices

1. **Start with Default Configuration**: Use the standard configuration first
2. **Monitor Agent Behavior**: Watch for over-continuation or under-continuation
3. **Customize Gradually**: Add agent-specific rules as needed
4. **Enable Debug Mode**: Use during initial setup and troubleshooting
5. **Regular Review**: Periodically review and adjust trigger patterns
6. **User Education**: Train users on interruption commands
7. **Performance Monitoring**: Watch for hook performance impact

## Security Considerations

- Hook runs in sandboxed environment
- No access to sensitive user data
- Cannot modify core Claude Code functionality
- Respects all existing access controls
- Maintains audit trail of all continuation decisions

This hook enhances Claude Code's autonomous capabilities while maintaining user control and system security.