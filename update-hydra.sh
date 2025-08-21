#!/bin/bash
# Hydra update script
echo "🐲 Updating Hydra..."
cd ~/.claude
curl -sSL https://raw.githubusercontent.com/sibyllinesoft/hydra/main/install.sh | bash -s -- --force
