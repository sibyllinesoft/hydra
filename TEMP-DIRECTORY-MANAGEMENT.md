# TEMP-DIRECTORY-MANAGEMENT.md
# Temporary Directory Management for Claude Code Projects

## Overview
This document defines the standard temporary directory structure and management policies for Claude Code projects. The goal is to maintain clean repositories while providing structured storage for ephemeral development artifacts.

## Standard Temp Directory Structure

### Root Temp Directory: `.claude-temp/`
All temporary Claude-generated files should be stored under `.claude-temp/` in the project root.

```
.claude-temp/
├── testing/           # Test outputs, verification files, debugging logs
├── documentation/     # Temporary docs, explanations, analysis
├── todos/            # Task tracking files, planning documents
├── verification/     # Validation outputs, linting reports, test results
├── experiments/      # Prototype code, spike solutions, proof-of-concepts
├── artifacts/        # Generated files, screenshots, debug outputs
└── sessions/         # Session-specific temporary files
```

### Subdirectory Definitions

#### `testing/`
- Test execution logs and outputs
- Debug trace files
- Performance benchmarking results
- Test coverage reports
- Mock data and fixtures for testing

#### `documentation/`
- Temporary explanation files
- Analysis documents
- Code review notes
- Architecture exploration docs
- Research findings and notes

#### `todos/`
- Task list files (TODO.md, BACKLOG.md)
- Sprint planning documents
- Progress tracking files
- Agent coordination plans
- Workflow state files

#### `verification/`
- Lint output files
- Type check results
- Security scan reports
- Code quality metrics
- Validation test results
- Build verification logs

#### `experiments/`
- Prototype implementations
- Spike solution code
- Proof-of-concept files
- Alternative approach explorations
- Feature flag experiments

#### `artifacts/`
- Generated screenshots
- Debug output images
- Log files and dumps
- Temporary exports
- Build artifacts for testing

#### `sessions/`
- Session-specific working files
- Agent communication logs
- Temporary state files
- Session cleanup targets

## File Naming Conventions

### Timestamp-Based Naming
Format: `YYYY-MM-DD-HH-MM-SS-description.ext`

Examples:
```
2025-01-15-14-30-22-auth-test-results.log
2025-01-15-14-31-05-frontend-verification.md
2025-01-15-14-32-18-performance-benchmark.json
```

### Purpose-Based Naming
Format: `[type]-[component]-[description].ext`

Examples:
```
test-results-auth-module.json
verification-frontend-components.md
experiment-new-state-management.js
analysis-performance-bottlenecks.md
```

### Session-Based Naming
Format: `session-[session-id]-[purpose].ext`

Examples:
```
session-abc123-agent-coordination.md
session-abc123-test-outputs.log
session-abc123-verification-results.json
```

## Lifecycle Management

### Auto-Cleanup Policies

#### Daily Cleanup (Recommended)
```bash
# Remove files older than 7 days
find .claude-temp/ -type f -mtime +7 -delete

# Remove empty directories
find .claude-temp/ -type d -empty -delete
```

#### Session-Based Cleanup
```bash
# Clean session files older than 1 day
find .claude-temp/sessions/ -type f -mtime +1 -delete

# Clean verification files older than 3 days
find .claude-temp/verification/ -type f -mtime +3 -delete
```

#### Selective Cleanup by Type
```bash
# Keep experiments longer (14 days)
find .claude-temp/experiments/ -type f -mtime +14 -delete

# Clean test outputs frequently (2 days)
find .claude-temp/testing/ -type f -mtime +2 -delete

# Clean artifacts frequently (1 day)
find .claude-temp/artifacts/ -type f -mtime +1 -delete
```

### Manual Cleanup Commands

#### Complete Reset
```bash
rm -rf .claude-temp/
mkdir -p .claude-temp/{testing,documentation,todos,verification,experiments,artifacts,sessions}
```

#### Preserve Important Files
```bash
# Backup important files before cleanup
cp .claude-temp/todos/*.md .claude-temp-backup/
cp .claude-temp/experiments/important-*.* .claude-temp-backup/

# Clean everything else
find .claude-temp/ -type f ! -path "*.claude-temp-backup/*" -delete
```

### Session Management

#### Session Start Procedure
1. Create session-specific directory: `.claude-temp/sessions/[session-id]/`
2. Initialize session log file
3. Set session environment variables if needed

#### Session End Procedure
1. Archive important session files to appropriate permanent locations
2. Clean session-specific temporary files
3. Update session logs with completion status

## Integration with Agents

### Agent File Usage Guidelines

#### Utility Agents
- **file-creator**: Use `.claude-temp/experiments/` for template testing
- **git-workflow**: Use `.claude-temp/verification/` for pre-commit checks
- **context-fetcher**: Use `.claude-temp/documentation/` for cached docs
- **knowledge-fetcher**: Use `.claude-temp/documentation/` for research outputs
- **date-checker**: Use `.claude-temp/verification/` for timestamp validation

#### Development Agents
- **rapid-prototyper**: Use `.claude-temp/experiments/` for prototypes
- **backend-architect**: Use `.claude-temp/verification/` for API validation
- **frontend-developer**: Use `.claude-temp/testing/` for component tests
- **test-writer-fixer**: Use `.claude-temp/testing/` for all test artifacts

#### Analysis Agents
- **ux-researcher**: Use `.claude-temp/documentation/` for analysis reports
- **feedback-synthesizer**: Use `.claude-temp/documentation/` for summaries
- **analytics-reporter**: Use `.claude-temp/artifacts/` for generated reports

### Agent Coordination Rules

#### File Ownership
- Each agent should prefix files with their domain: `[agent-type]-[filename]`
- Examples: `test-writer-coverage-report.html`, `backend-api-validation.json`

#### Conflict Prevention
- Use agent-specific subdirectories when multiple agents work simultaneously
- Example: `.claude-temp/testing/test-writer-fixer/`, `.claude-temp/testing/api-tester/`

#### Handoff Protocols
- Agent A completes work and saves to appropriate temp directory
- Agent B reads from temp directory and continues workflow
- Clean handoff files after successful processing

### Permanent vs Temporary File Guidelines

#### Always Temporary
- Test execution logs and outputs
- Lint and validation reports
- Debug screenshots and artifacts
- Performance benchmark results
- Experimental code and prototypes
- Analysis and explanation documents

#### Sometimes Temporary
- TODO lists (temporary during active development, permanent for project planning)
- Documentation drafts (temporary until reviewed and finalized)
- Configuration experiments (temporary until proven and integrated)

#### Never Temporary
- Source code (except pure experiments)
- Production configuration
- Database migrations
- Package dependencies
- Build scripts and CI configuration

## Gitignore Patterns

### Required .gitignore Entries
```gitignore
# Claude Code temporary files
.claude-temp/
.claude-temp-backup/

# Session files
session-*.tmp
session-*.log

# Agent artifacts
*-verification.log
*-test-results.json
*-analysis.md
*-experiment.js
*-experiment.py
*-experiment.ts

# Timestamp-based temporary files
????-??-??-??-??-??-*.tmp
????-??-??-??-??-??-*.log
????-??-??-??-??-??-*-temp.*
```

### Project-Specific Patterns
```gitignore
# Testing artifacts
test-outputs/
coverage-reports/
benchmark-results/

# Documentation drafts
*-draft.md
*-notes.md
*-analysis.md

# Experimental files
*-experiment.*
*-prototype.*
*-spike.*
```

## Agent Instructions for Systematic Usage

### Pre-Task Setup
1. Check if `.claude-temp/` exists, create if missing
2. Create appropriate subdirectory for task type
3. Generate unique filename using naming conventions
4. Set up logging to temp directory

### During Task Execution
1. Save all intermediate outputs to temp directory
2. Use structured filenames for easy identification
3. Log progress and decisions to session files
4. Coordinate with other agents through shared temp files

### Post-Task Cleanup
1. Archive important results to permanent locations
2. Clean up intermediate files
3. Update session logs with completion status
4. Hand off relevant temp files to next agent if needed

### Error Handling
1. Save error logs and debug info to `.claude-temp/verification/`
2. Preserve failing test outputs for analysis
3. Keep problematic code in `.claude-temp/experiments/` for review
4. Document issues in `.claude-temp/documentation/` for future reference

## Implementation Commands

### Initial Setup
```bash
# Create temp directory structure
mkdir -p .claude-temp/{testing,documentation,todos,verification,experiments,artifacts,sessions}

# Add to gitignore
echo ".claude-temp/" >> .gitignore

# Set up cleanup cron job (optional)
echo "0 2 * * * find .claude-temp/ -type f -mtime +7 -delete" | crontab -
```

### Verification Script
```bash
#!/bin/bash
# verify-temp-structure.sh

TEMP_DIR=".claude-temp"
REQUIRED_DIRS=("testing" "documentation" "todos" "verification" "experiments" "artifacts" "sessions")

if [ ! -d "$TEMP_DIR" ]; then
    echo "Creating $TEMP_DIR structure..."
    mkdir -p "$TEMP_DIR"
fi

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$TEMP_DIR/$dir" ]; then
        echo "Creating $TEMP_DIR/$dir"
        mkdir -p "$TEMP_DIR/$dir"
    fi
done

echo "Temp directory structure verified."
```

## Best Practices

### For Agents
1. **Always use temp directories** for non-permanent outputs
2. **Follow naming conventions** for easy identification and cleanup
3. **Clean up after yourself** - remove unnecessary files
4. **Coordinate through temp files** when working with other agents
5. **Log important decisions** to session files for context preservation

### For Developers
1. **Review temp directories regularly** for insights into Claude's work
2. **Promote important temp files** to permanent locations when valuable
3. **Configure auto-cleanup** based on project needs and storage constraints
4. **Monitor temp directory growth** to prevent storage issues
5. **Use temp files for debugging** Claude's decision-making process

### For Project Management
1. **Include temp directory setup** in project initialization
2. **Document temp file policies** in project README if team uses Claude
3. **Configure CI/CD** to ignore temp directories
4. **Set up monitoring** for temp directory storage usage
5. **Review cleanup policies** periodically to ensure effectiveness

## Troubleshooting

### Common Issues

#### Temp Directory Not Found
```bash
# Quick fix
mkdir -p .claude-temp/{testing,documentation,todos,verification,experiments,artifacts,sessions}
```

#### Permission Issues
```bash
# Fix permissions
chmod -R 755 .claude-temp/
```

#### Storage Overflow
```bash
# Emergency cleanup
find .claude-temp/ -type f -mtime +1 -delete
find .claude-temp/ -type d -empty -delete
```

#### Agent Conflicts
- Use agent-specific subdirectories
- Implement file locking if necessary
- Use atomic file operations

### Monitoring Commands
```bash
# Check temp directory size
du -sh .claude-temp/

# Count files by type
find .claude-temp/ -type f | wc -l

# Show recent activity
find .claude-temp/ -type f -mtime -1 -ls

# Show largest files
find .claude-temp/ -type f -exec du -h {} + | sort -rh | head -10
```

This temporary directory management system provides structure while maintaining flexibility for Claude Code's diverse development needs. Regular review and adjustment of policies ensures optimal balance between utility and cleanliness.