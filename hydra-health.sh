#!/bin/bash
# Hydra health check script
echo "🐲 Hydra Health Check"
echo "==================="

CLAUDE_DIR="$HOME/.claude"

# Check core files
echo "Core files:"
for file in CONTEXT.md MCP.md PRINCIPLES.md RULES.md AGENTS.md; do
    if [[ -f "$CLAUDE_DIR/$file" ]]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (missing)"
    fi
done

# Check version
if [[ -f "$CLAUDE_DIR/HYDRA-VERSION" ]]; then
    echo "Version: $(cat "$CLAUDE_DIR/HYDRA-VERSION")"
else
    echo "Version: unknown"
fi

# Check install date
if [[ -f "$CLAUDE_DIR/HYDRA-INSTALL-DATE" ]]; then
    echo "Installed: $(cat "$CLAUDE_DIR/HYDRA-INSTALL-DATE")"
fi

# Check MCP config
if [[ -f "$HOME/.claude.json" ]]; then
    echo "MCP config: ✓"
else
    echo "MCP config: ✗ (missing)"
fi
