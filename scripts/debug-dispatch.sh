#!/bin/bash
# Hydra Dispatch Debugger Wrapper v1.0
# This script logs commands passed to it before executing them.

set -euo pipefail

# Define the log file path
LOG_DIR=".claude/logs"
LOG_FILE="$LOG_DIR/dispatch.log"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Get current timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Log the received command arguments to the file and to stderr
# The 'tee' command allows us to see this in real-time in the Claude Code UI
echo "[$TIMESTAMP] DISPATCHED: $@" | tee -a "$LOG_FILE"

# Execute the original command that was passed to this script
# 'exec' replaces this script's process with the new one, which is cleaner.
exec "$@"