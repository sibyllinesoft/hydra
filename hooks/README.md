# Claude Code Hooks Directory

This directory contains Claude Code hooks that modify agent behavior and implement advanced workflow patterns.

## Available Hooks

### autonomous-continuation.js
**Purpose**: Prevents agents from stopping prematurely by detecting incomplete work and injecting continuation instructions.

**Key Features**:
- Detects incomplete TodoWrite tasks
- Identifies iterative improvement opportunities
- Prevents analysis without action
- Implements agent-specific continuation rules
- Respects user interruption commands

**Configuration**: See `hook-configuration.md` for complete setup instructions.

## Hook Installation

1. **Add to Claude Code Settings**: Update your `settings.json` with hook configuration
2. **Set File Paths**: Ensure hook file paths are correct
3. **Configure Options**: Customize behavior for your workflow
4. **Test Functionality**: Use debug mode to verify operation

## Hook Development Guidelines

### File Structure
```
hooks/
├── README.md                    # This file
├── hook-configuration.md        # Detailed configuration guide
├── autonomous-continuation.js   # Main hook implementation
└── [future-hooks]/             # Additional hooks
```

### Hook Interface
All hooks should implement the Claude Code hook interface:

```javascript
module.exports = {
  name: 'hook-name',
  description: 'Hook description',
  version: '1.0.0',
  
  // Hook lifecycle functions
  beforeResponse: function(response, context) {
    // Modify response before sending to user
    return modifiedResponse;
  },
  
  afterResponse: function(response, context) {
    // Process response after sending
  },
  
  // Configuration
  config: {
    enabled: true,
    // Additional options
  }
};
```

### Best Practices

1. **Performance**: Keep hook execution fast (<100ms)
2. **Safety**: Never modify core functionality
3. **User Control**: Always respect user interruption
4. **Debugging**: Include comprehensive debug logging
5. **Documentation**: Provide clear configuration examples
6. **Testing**: Include utility functions for testing

## Workflow Integration

These hooks integrate with Claude Code's workflow patterns:

- **ITERATIVE-CYCLE-ENFORCEMENT.md**: Implements mandatory cycle completion
- **ITERATIVE-WORKFLOW-PATTERNS.md**: Enables autonomous iteration patterns
- **AGENTS.md**: Respects agent specialization and coordination
- **MCP-ACCESS-CONTROL.md**: Maintains tool access restrictions

## Future Hook Ideas

- **quality-enforcement.js**: Automatic code quality validation
- **security-scanner.js**: Real-time security pattern detection
- **performance-monitor.js**: Automatic performance regression detection
- **documentation-sync.js**: Auto-update documentation after changes
- **dependency-tracker.js**: Monitor and update project dependencies

## Troubleshooting

### Common Issues

1. **Hook Not Loading**: Check file path in settings.json
2. **No Effect**: Verify hook is enabled and patterns match
3. **Performance Issues**: Enable performance monitoring
4. **Conflicts**: Review hook priority and interaction patterns

### Debug Mode
Enable debug mode in any hook configuration:

```json
{
  "hooks": {
    "hook-name": {
      "debugMode": true
    }
  }
}
```

### Log Files
Hook logs are written to: `/home/nathan/.claude/logs/`

## Contributing

When adding new hooks:

1. Follow the established file structure
2. Include comprehensive documentation
3. Add configuration examples
4. Provide debug and monitoring capabilities
5. Test with various agent types
6. Update this README with hook descriptions

Hooks should enhance Claude Code's capabilities while maintaining its core principles of agent autonomy, user control, and system reliability.