# Scripts Directory

The `scripts/` directory contains automation scripts that power the Claude Code (Hydra) system, providing command-line interfaces for project management, testing, and workflow automation.

## Overview

Scripts in this directory are designed to integrate seamlessly with the Hydra agent system, providing both standalone functionality and agent-driven automation. Each script follows consistent patterns for logging, error handling, and user interaction.

## Directory Structure

```
scripts/
├── README.md              # This file
├── test-and-log.sh       # Test execution and logging utility
└── pm/                   # Project Management scripts
    ├── help.sh           # Display PM system help
    ├── init.sh           # Initialize PM system
    ├── status.sh         # Show project status dashboard
    ├── next.sh           # List next available tasks
    ├── search.sh         # Search across all project content
    ├── standup.sh        # Generate daily standup report
    ├── blocked.sh        # Show blocked tasks
    ├── in-progress.sh    # List work in progress
    ├── validate.sh       # System integrity validation
    ├── epic-list.sh      # List all epics
    ├── epic-show.sh      # Display epic details
    ├── epic-status.sh    # Epic progress tracking
    ├── prd-list.sh       # List Product Requirements Documents
    └── prd-status.sh     # PRD implementation status
```

## Project Management (PM) Scripts

The `pm/` subdirectory contains the core project management automation scripts that implement the Claude Code Project Management (CCPM) system.

### Core Workflow Scripts

#### `init.sh` - System Initialization
Bootstraps the entire PM system with dependency checking and configuration:

```bash
bash .claude/scripts/pm/init.sh
```

**What it does:**
- Checks for GitHub CLI (`gh`) and installs if missing
- Authenticates with GitHub
- Installs required GitHub extensions (`gh-sub-issue`)
- Creates directory structure (`.claude/prds`, `.claude/epics`, etc.)
- Copies PM scripts to appropriate locations
- Validates Git configuration
- Creates initial `CLAUDE.md` template

**Dependencies:** Git, GitHub CLI, Bash

#### `help.sh` - Command Reference
Displays comprehensive help for all PM commands:

```bash
bash .claude/scripts/pm/help.sh
```

**Output includes:**
- Quick start workflow guide
- PRD (Product Requirements Document) commands
- Epic management commands
- Issue tracking commands
- Workflow and status commands
- Setup and maintenance commands

### Status and Monitoring Scripts

#### `status.sh` - Project Dashboard
Provides high-level project metrics:

```bash
bash .claude/scripts/pm/status.sh
```

**Displays:**
- Total PRDs count
- Total epics count
- Task breakdown (open/closed)
- Overall project health

#### `next.sh` - Available Work
Identifies tasks ready for execution:

```bash
bash .claude/scripts/pm/next.sh
```

**Logic:**
- Scans all epics for open tasks
- Checks task dependencies
- Reports tasks ready to start
- Identifies parallel execution opportunities

#### `standup.sh` - Daily Report
Generates standup-style progress report:

```bash
bash .claude/scripts/pm/standup.sh
```

#### `blocked.sh` - Dependency Issues
Lists tasks blocked by dependencies:

```bash
bash .claude/scripts/pm/blocked.sh
```

#### `in-progress.sh` - Active Work
Shows currently active tasks:

```bash
bash .claude/scripts/pm/in-progress.sh
```

### Discovery and Search Scripts

#### `search.sh` - Content Search
Searches across all project content:

```bash
bash .claude/scripts/pm/search.sh "search term"
```

**Searches in:**
- PRDs (Product Requirements Documents)
- Epic definitions
- Task descriptions
- Returns match counts and locations

#### List Scripts
- `epic-list.sh` - Lists all epics with basic info
- `epic-show.sh` - Displays detailed epic information
- `epic-status.sh` - Shows epic progress metrics
- `prd-list.sh` - Lists all PRDs
- `prd-status.sh` - Shows PRD implementation status

### System Maintenance

#### `validate.sh` - System Integrity
Checks system health and consistency:

```bash
bash .claude/scripts/pm/validate.sh
```

**Validates:**
- Directory structure
- File formats
- Dependency consistency
- GitHub integration status

## Integration with Hydra Commands

Scripts integrate with the Hydra command system through command files in `/commands/pm/`. Each command file:

1. **Specifies allowed tools** (usually `Bash`)
2. **Delegates to appropriate script** via sub-agent execution
3. **Ensures complete output** display without truncation

### Command → Script Mapping

| Command | Script | Purpose |
|---------|--------|---------|
| `/pm:init` | `pm/init.sh` | System initialization |
| `/pm:help` | `pm/help.sh` | Display help |
| `/pm:status` | `pm/status.sh` | Project dashboard |
| `/pm:next` | `pm/next.sh` | Available tasks |
| `/pm:search` | `pm/search.sh` | Content search |
| `/pm:standup` | `pm/standup.sh` | Daily report |
| `/pm:blocked` | `pm/blocked.sh` | Blocked tasks |
| `/pm:validate` | `pm/validate.sh` | System check |

## Script Patterns and Standards

### Common Structure
All scripts follow this pattern:

```bash
#!/bin/bash

# Initial status/loading message
echo "Processing..."
echo ""
echo ""

# Main functionality with clear section headers
echo "📊 Section Title"
echo "================"
echo ""

# Processing logic with status indicators
# ✅ Success indicators
# ❌ Error indicators  
# ⚠️  Warning indicators
# 📄 Document indicators
# 🔍 Search indicators

# Clean exit
exit 0
```

### Error Handling
- Exit with status code 0 for success
- Exit with status code 1 for errors
- Provide clear error messages with context
- Check for required parameters and dependencies

### Output Formatting
- Use Unicode symbols for visual clarity
- Consistent spacing and alignment
- Progressive disclosure (summary → details)
- Clear section separation

### File System Conventions
- Work within `.claude/` directory structure
- Respect existing directory organization
- Create directories as needed with `mkdir -p`
- Check for file existence before operations

## Usage Examples

### Basic Project Setup
```bash
# Initialize the system
bash .claude/scripts/pm/init.sh

# Check system status
bash .claude/scripts/pm/status.sh

# Get help
bash .claude/scripts/pm/help.sh
```

### Daily Workflow
```bash
# Morning standup
bash .claude/scripts/pm/standup.sh

# Find next work
bash .claude/scripts/pm/next.sh

# Check for blocked items
bash .claude/scripts/pm/blocked.sh

# Search for specific content
bash .claude/scripts/pm/search.sh "authentication"
```

### Project Monitoring
```bash
# Overall status
bash .claude/scripts/pm/status.sh

# Epic progress
bash .claude/scripts/pm/epic-status.sh

# Validate system health
bash .claude/scripts/pm/validate.sh
```

## Creating Custom Scripts

When creating new scripts for the system:

### 1. Follow Naming Convention
- Use descriptive names with hyphens: `feature-action.sh`
- Place PM-related scripts in `pm/` subdirectory
- Make executable: `chmod +x script-name.sh`

### 2. Include Standard Header
```bash
#!/bin/bash

# Brief description of what the script does

echo "Processing..."
echo ""
echo ""
```

### 3. Add to Command System
Create corresponding command file in `/commands/pm/`:

```markdown
---
allowed-tools: Bash
---

Run `bash .claude/scripts/pm/your-script.sh` using a sub-agent and show me the complete output.

- DO NOT truncate.
- DO NOT collapse.  
- DO NOT abbreviate.
- Show ALL lines in full.
- DO NOT print any other comments.
```

### 4. Follow Output Standards
- Use consistent Unicode symbols
- Provide clear section headers
- Include summary information
- Exit cleanly with appropriate status code

### 5. Integration Points
- Work with existing `.claude/` directory structure
- Integrate with GitHub via `gh` CLI when needed
- Support both manual and agent-driven execution
- Maintain compatibility with existing scripts

## Dependencies

### Required Tools
- **Bash** - Shell execution environment
- **Git** - Version control integration
- **GitHub CLI (`gh`)** - GitHub API integration
- **Standard Unix tools** - grep, find, sed, awk, etc.

### Optional Tools
- **GitHub Extensions** - `gh-sub-issue` for enhanced issue management
- **Package managers** - brew (macOS), apt-get (Ubuntu) for dependency installation

## Testing Scripts

The system includes basic testing infrastructure:

### `test-and-log.sh`
Utility for test execution and result logging:

```bash
bash .claude/scripts/test-and-log.sh
```

Integrates with the broader testing framework defined in the Hydra system.

## Troubleshooting

### Common Issues

**Script not found:**
- Ensure you're in the correct directory
- Check file permissions: `ls -la .claude/scripts/pm/`
- Verify installation: `bash .claude/scripts/pm/init.sh`

**GitHub authentication errors:**
- Run: `gh auth status`
- Re-authenticate: `gh auth login`
- Check repository access: `gh repo view`

**Missing dependencies:**
- Re-run initialization: `bash .claude/scripts/pm/init.sh`
- Check system requirements
- Install missing tools manually

**Permission denied:**
- Make scripts executable: `chmod +x .claude/scripts/pm/*.sh`
- Check directory permissions
- Ensure proper ownership

### Debug Mode
Most scripts support verbose output. Add debugging by modifying the script temporarily:

```bash
#!/bin/bash
set -x  # Enable debug mode
# ... rest of script
```

## Integration with Agent System

Scripts are designed to work seamlessly with the Hydra agent architecture:

### Agent Execution
- Scripts run in isolated sub-agent contexts
- Output is captured and formatted for main conversation
- Error handling propagates to agent coordination layer
- Progress tracking integrates with agent state management

### Parallel Execution
- Scripts support parallel task identification
- Agent coordination handles concurrent execution
- State synchronization prevents conflicts
- Results aggregation maintains consistency

### Context Preservation
- Scripts operate with clean state
- Output is structured for context preservation
- Agent handoffs maintain execution continuity
- Long-running operations support checkpointing

## Future Enhancements

The script system is designed for extensibility:

### Planned Features
- Enhanced error recovery and retry logic
- Improved parallel execution coordination
- Advanced search and filtering capabilities
- Integration with additional project management tools
- Performance monitoring and optimization
- Automated testing and validation

### Extension Points
- Plugin architecture for custom workflows
- Hook system for custom integrations
- Template system for script generation
- Configuration management for team customization

---

For more information about the Claude Code (Hydra) system, see the main [README.md](../README.md) and system documentation.