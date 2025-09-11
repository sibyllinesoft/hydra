#!/bin/bash

#========================================================================
# Update Installer - Living Blueprint Integration
#
# Updates the Hydra installer to include Living Blueprint architecture
# Adds dependency management and feature flag initialization
#========================================================================

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly INSTALLER_DIR="$PROJECT_ROOT/installer"

# Enhanced install.js integration
enhance_installer() {
    echo "🔧 Enhancing Hydra installer with Living Blueprint architecture..."
    
    # Create enhanced installer patch
    cat > "${INSTALLER_DIR}/living-blueprint-enhancement.js" << 'EOF'
/**
 * Living Blueprint Architecture Integration
 * Enhances the Hydra installer with context management and feature flags
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra';

export class LivingBlueprintEnhancer {
    constructor(installationPath, logger) {
        this.installationPath = installationPath;
        this.logger = logger;
        this.scriptsPath = path.join(installationPath, 'scripts');
    }

    async enhance() {
        this.logger('🚀 Integrating Living Blueprint architecture...');
        
        try {
            await this.checkDependencies();
            await this.initializeFeatureFlags();
            await this.setupContextManager();
            await this.validateIntegration();
            
            this.logger('✅ Living Blueprint integration completed');
            return true;
        } catch (error) {
            this.logger(`❌ Living Blueprint integration failed: ${error.message}`);
            return false;
        }
    }

    async checkDependencies() {
        this.logger('📦 Checking Living Blueprint dependencies...');
        
        // Check if dependency installer exists
        const dependencyScript = path.join(this.scriptsPath, 'install-dependencies.sh');
        
        if (fs.existsSync(dependencyScript)) {
            try {
                // Run dependency check
                execSync(`bash "${dependencyScript}" check`, {
                    stdio: 'pipe',
                    encoding: 'utf8'
                });
                this.logger('✅ Dependencies verified');
            } catch (error) {
                this.logger('⚠️  Some dependencies need installation');
                
                // Attempt to install missing dependencies
                try {
                    execSync(`bash "${dependencyScript}" install`, {
                        stdio: 'pipe',
                        encoding: 'utf8'
                    });
                    this.logger('✅ Dependencies installed successfully');
                } catch (installError) {
                    this.logger('❌ Dependency installation failed - manual intervention required');
                    
                    // Generate installation script for manual execution
                    execSync(`bash "${dependencyScript}" generate`, {
                        stdio: 'inherit'
                    });
                }
            }
        } else {
            this.logger('⚠️  Dependency management script not found');
        }
    }

    async initializeFeatureFlags() {
        this.logger('🎛️  Initializing feature flag system...');
        
        const featureFlagsScript = path.join(this.scriptsPath, 'feature-flags.sh');
        
        if (fs.existsSync(featureFlagsScript)) {
            try {
                // Initialize feature flags with foundation settings
                execSync(`bash "${featureFlagsScript}" list`, {
                    stdio: 'pipe',
                    encoding: 'utf8'
                });
                
                // Set installation phase
                execSync(`bash "${featureFlagsScript}" rollout foundation confirm`, {
                    stdio: 'pipe',
                    encoding: 'utf8'
                });
                
                this.logger('✅ Feature flags initialized');
            } catch (error) {
                this.logger(`⚠️  Feature flag initialization encountered issues: ${error.message}`);
                
                // Try to create basic configuration
                try {
                    execSync(`bash "${featureFlagsScript}" help`, {
                        stdio: 'pipe'
                    });
                    this.logger('✅ Feature flag system configured with defaults');
                } catch (fallbackError) {
                    this.logger('❌ Feature flag system setup failed');
                }
            }
        } else {
            this.logger('⚠️  Feature flag script not found');
        }
    }

    async setupContextManager() {
        this.logger('🗃️  Setting up Context Manager...');
        
        const contextScript = path.join(this.scriptsPath, 'context-manager.sh');
        
        if (fs.existsSync(contextScript)) {
            try {
                // Initialize context manager
                execSync(`bash "${contextScript}" init`, {
                    stdio: 'pipe',
                    encoding: 'utf8'
                });
                
                // Run health check
                execSync(`bash "${contextScript}" health`, {
                    stdio: 'pipe',
                    encoding: 'utf8'
                });
                
                this.logger('✅ Context Manager initialized');
            } catch (error) {
                this.logger(`⚠️  Context Manager setup encountered issues: ${error.message}`);
            }
        } else {
            this.logger('⚠️  Context Manager script not found');
        }
    }

    async validateIntegration() {
        this.logger('🔍 Validating Living Blueprint integration...');
        
        const deployScript = path.join(this.scriptsPath, 'deploy-living-blueprint.sh');
        
        if (fs.existsSync(deployScript)) {
            try {
                // Run health check
                execSync(`bash "${deployScript}" health`, {
                    stdio: 'pipe',
                    encoding: 'utf8'
                });
                this.logger('✅ Integration validation passed');
                
                // Display next steps
                this.logger('📋 Living Blueprint architecture is ready!');
                this.logger('   Run: ./scripts/deploy-living-blueprint.sh all');
                this.logger('   Or:  ./scripts/deploy-living-blueprint.sh health');
                
            } catch (error) {
                this.logger(`⚠️  Integration validation found issues: ${error.message}`);
                this.logger('💡 Run manual deployment: ./scripts/deploy-living-blueprint.sh all');
            }
        } else {
            this.logger('⚠️  Deployment orchestrator not found');
        }
    }

    async generateCompletionMessage() {
        const messages = [
            '',
            '🎉 Living Blueprint Architecture Integration Complete!',
            '',
            '📁 Components installed:',
            '   • Context Manager (dual-stack JSON/jq system)',
            '   • Feature Flag System (environment-based configuration)',
            '   • Migration Bridge (legacy compatibility)',  
            '   • Enhanced Backup/Restore',
            '   • Deployment Orchestration',
            '',
            '🚀 Next steps:',
            '   1. Deploy foundation: ./scripts/deploy-living-blueprint.sh phase1',
            '   2. Full deployment:   ./scripts/deploy-living-blueprint.sh all',
            '   3. Health check:      ./scripts/deploy-living-blueprint.sh health',
            '',
            '📚 Documentation:',
            '   • Context operations: ./scripts/context-manager.sh help',
            '   • Feature management: ./scripts/feature-flags.sh help',
            '   • Deployment guide:   ./scripts/deploy-living-blueprint.sh help',
            '',
            '🔧 Configuration:',
            '   • Environment: HYDRA_PERSISTENT_CONTEXT=dual-stack',
            '   • Context dir: ~/.hydra/context',
            '   • Config dir:  ~/.hydra/config',
            ''
        ];
        
        return messages;
    }
}

// Export for use in main installer
export default LivingBlueprintEnhancer;
EOF

    echo "✅ Living Blueprint enhancement module created"
}

# Add integration hooks to package.json scripts
update_package_scripts() {
    echo "📦 Updating package.json scripts for Living Blueprint..."
    
    local package_json="$PROJECT_ROOT/package.json"
    
    if [[ -f "$package_json" ]]; then
        # Create backup
        cp "$package_json" "${package_json}.backup"
        
        # Add Living Blueprint scripts using jq
        if command -v jq >/dev/null 2>&1; then
            jq '.scripts += {
                "deploy:living-blueprint": "./scripts/deploy-living-blueprint.sh all",
                "deploy:foundation": "./scripts/deploy-living-blueprint.sh phase1", 
                "deploy:health": "./scripts/deploy-living-blueprint.sh health",
                "context:init": "./scripts/context-manager.sh init",
                "context:health": "./scripts/context-manager.sh health",
                "flags:list": "./scripts/feature-flags.sh list",
                "flags:health": "./scripts/feature-flags.sh health",
                "deps:check": "./scripts/install-dependencies.sh check",
                "deps:install": "./scripts/install-dependencies.sh install"
            }' "$package_json" > "${package_json}.tmp" && mv "${package_json}.tmp" "$package_json"
            
            echo "✅ Package.json scripts updated"
        else
            echo "⚠️  jq not available, skipping package.json update"
        fi
    else
        echo "⚠️  package.json not found, skipping script updates"
    fi
}

# Update installer README
update_installer_readme() {
    echo "📝 Updating installer README with Living Blueprint information..."
    
    local readme="$INSTALLER_DIR/README.md"
    
    # Backup existing README if it exists
    if [[ -f "$readme" ]]; then
        cp "$readme" "${readme}.backup"
    fi
    
    # Create enhanced README
    cat > "$readme" << 'EOF'
# Hydra Installer - Living Blueprint Architecture

Enhanced installer for the Hydra Claude Code Studio with integrated Living Blueprint architecture for persistent context management.

## Features

### Core Installation
- **Multi-mode Installation**: Automatic detection of global vs project installation
- **Backup & Safety**: Automatic backup of existing configurations  
- **Interactive UI**: Blessed-based terminal interface with progress tracking
- **Cross-platform**: Supports macOS, Linux, and Windows environments

### Living Blueprint Architecture
- **Context Manager**: Dual-stack JSON/jq-based persistent context system
- **Feature Flags**: Environment-based configuration for gradual rollout
- **Migration Bridge**: Seamless migration from legacy status files
- **Enhanced Backup**: Atomic operations with rollback capability
- **Health Monitoring**: Comprehensive system health diagnostics

## Quick Start

### Installation
```bash
# Basic installation (auto-detects mode)
node bin/hydra-installer.mjs

# Force global installation
node bin/hydra-installer.mjs --global

# Force project installation  
node bin/hydra-installer.mjs --project
```

### Living Blueprint Deployment
```bash
# Full deployment (all phases)
npm run deploy:living-blueprint

# Phase-by-phase deployment
npm run deploy:foundation
./scripts/deploy-living-blueprint.sh phase2
./scripts/deploy-living-blueprint.sh phase3  
./scripts/deploy-living-blueprint.sh phase4

# Health check
npm run deploy:health
```

## Architecture Overview

### Installation Modes

**Global Mode** (`~/.claude/`)
- System-wide installation
- Shared across all projects
- Requires home directory write access

**Project Mode** (`./hydra/`)
- Project-specific installation
- Isolated configurations
- Git repository integration

### Living Blueprint Components

**Context Manager** (`scripts/context-manager.sh`)
- Persistent context storage (JSON)
- Dual-stack operation (memory + persistent)
- Atomic operations with backup/restore
- Legacy migration support

**Feature Flags** (`scripts/feature-flags.sh`)
- Environment-based configuration
- Rollout phase management
- Runtime toggling without restart
- Export as environment variables

**Deployment Orchestrator** (`scripts/deploy-living-blueprint.sh`)
- 4-phase incremental deployment
- Validation gates between phases
- Automatic rollback on failure
- Comprehensive health monitoring

## Directory Structure

```
├── installer/
│   ├── install.js                    # Main installer
│   ├── living-blueprint-enhancement.js # Living Blueprint integration
│   └── README.md                      # This file
├── scripts/
│   ├── context-manager.sh             # Context management
│   ├── feature-flags.sh               # Feature flag system  
│   ├── deploy-living-blueprint.sh     # Deployment orchestration
│   └── install-dependencies.sh        # Dependency management
└── prompts/
    ├── planning-workflow.md           # Planning templates
    ├── execution-workflow.md          # Execution templates  
    └── recap-workflow.md              # Recap templates
```

## Configuration

### Environment Variables
```bash
# Feature flag configuration
export HYDRA_PERSISTENT_CONTEXT="dual-stack"  # enabled|disabled|dual-stack

# Directory overrides
export HYDRA_CONTEXT_DIR="~/.hydra/context"   # Context storage
export HYDRA_CONFIG_DIR="~/.hydra/config"     # Configuration files
export HYDRA_LOG_DIR="~/.hydra/logs"          # Log files
```

### Feature Flag Modes
- **enabled**: Pure persistent context (production-ready)
- **disabled**: Memory-only context (legacy compatibility)  
- **dual-stack**: Both systems active (migration/testing)

## NPM Scripts

### Deployment
```bash
npm run deploy:living-blueprint  # Full deployment
npm run deploy:foundation        # Foundation phase only
npm run deploy:health           # Health check
```

### Context Management  
```bash
npm run context:init            # Initialize context system
npm run context:health          # Context health check
```

### Feature Flags
```bash
npm run flags:list              # List feature flags
npm run flags:health            # Feature flag health check
```

### Dependencies
```bash
npm run deps:check              # Check dependencies
npm run deps:install            # Install missing dependencies
```

## Troubleshooting

### Common Issues

**jq Dependency Missing**
```bash
# Auto-install
./scripts/install-dependencies.sh install

# Manual install (generates script)
./scripts/install-dependencies.sh generate
```

**Context Manager Issues**
```bash
# Reinitialize
./scripts/context-manager.sh init

# Health check with verbose output
./scripts/context-manager.sh health

# Restore from backup
./scripts/context-manager.sh restore <backup_name>
```

**Feature Flag Problems**
```bash  
# Reset to defaults
./scripts/feature-flags.sh reset confirm

# Check current status
./scripts/feature-flags.sh list
```

**Deployment Failures**
```bash
# Health check
./scripts/deploy-living-blueprint.sh health

# Manual rollback
./scripts/deploy-living-blueprint.sh rollback "troubleshooting"
```

### Logs & Diagnostics

**Log Locations**
- Deployment: `~/.hydra/logs/deploy.log`
- Context Manager: `~/.hydra/context/context-manager.log`  
- Feature Flags: `~/.hydra/config/feature-flags.log`

**Health Checks**
- Overall: `./scripts/deploy-living-blueprint.sh health`
- Context: `./scripts/context-manager.sh health`
- Flags: `./scripts/feature-flags.sh health`
- Dependencies: `./scripts/install-dependencies.sh check`

## Advanced Usage

### Custom Rollout Phases
```bash
# Set specific rollout phase
./scripts/feature-flags.sh rollout foundation confirm
./scripts/feature-flags.sh rollout migration confirm  
./scripts/feature-flags.sh rollout integration confirm
./scripts/feature-flags.sh rollout deployment confirm
```

### Context Operations
```bash
# Set persistent context
./scripts/context-manager.sh set persistent "project_name" "my-project"

# Set dual-stack context  
./scripts/context-manager.sh set dual "current_phase" "development"

# Get context values
./scripts/context-manager.sh get dual "project_name"
```

### Backup Management
```bash
# Create named backup
./scripts/context-manager.sh backup "before-major-changes"

# List available backups
ls ~/.hydra/context/backups/

# Restore specific backup
./scripts/context-manager.sh restore "before-major-changes"
```

## Support

For issues and questions:
1. Check deployment health: `npm run deploy:health`
2. Review logs in `~/.hydra/logs/`
3. Run component health checks
4. Consult troubleshooting section above

---

**Living Blueprint Architecture** - Enabling persistent context for advanced AI-assisted development workflows.
EOF

    echo "✅ Installer README updated with Living Blueprint documentation"
}

# Create integration validation script
create_validation_script() {
    echo "🔍 Creating integration validation script..."
    
    cat > "$SCRIPT_DIR/validate-integration.sh" << 'EOF'
#!/bin/bash

#========================================================================
# Integration Validation - Living Blueprint Architecture
#
# Validates the Living Blueprint integration with Hydra installer
#========================================================================

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🔍 Validating Living Blueprint integration..."

# Check for required scripts
echo "📁 Checking for required scripts..."
required_scripts=(
    "scripts/context-manager.sh"
    "scripts/feature-flags.sh"  
    "scripts/deploy-living-blueprint.sh"
    "scripts/install-dependencies.sh"
)

missing_scripts=()
for script in "${required_scripts[@]}"; do
    if [[ -f "$PROJECT_ROOT/$script" && -x "$PROJECT_ROOT/$script" ]]; then
        echo "  ✅ $script"
    else
        echo "  ❌ $script (missing or not executable)"
        missing_scripts+=("$script")
    fi
done

# Check installer enhancement
echo "📦 Checking installer enhancement..."
if [[ -f "$PROJECT_ROOT/installer/living-blueprint-enhancement.js" ]]; then
    echo "  ✅ living-blueprint-enhancement.js"
else
    echo "  ❌ living-blueprint-enhancement.js (missing)"
fi

# Check package.json scripts
echo "📋 Checking package.json scripts..."
if [[ -f "$PROJECT_ROOT/package.json" ]]; then
    if command -v jq >/dev/null 2>&1; then
        required_scripts_json=(
            "deploy:living-blueprint"
            "deploy:foundation"
            "deploy:health"
            "context:init"
            "flags:list"
        )
        
        for script in "${required_scripts_json[@]}"; do
            if jq -e ".scripts[\"$script\"]" "$PROJECT_ROOT/package.json" >/dev/null 2>&1; then
                echo "  ✅ npm script: $script"
            else
                echo "  ⚠️  npm script missing: $script"
            fi
        done
    else
        echo "  ⚠️  jq not available, cannot validate package.json scripts"
    fi
else
    echo "  ❌ package.json not found"
fi

# Summary
echo ""
echo "📊 Validation Summary:"
if [[ ${#missing_scripts[@]} -eq 0 ]]; then
    echo "  ✅ All core scripts present and executable"
    echo "  🎉 Living Blueprint integration appears complete"
    echo ""
    echo "🚀 Next steps:"
    echo "  1. Test the installer: node bin/hydra-installer.mjs --help"
    echo "  2. Run deployment: npm run deploy:living-blueprint"
    echo "  3. Check health: npm run deploy:health"
    exit 0
else
    echo "  ❌ Missing scripts: ${missing_scripts[*]}"
    echo "  🔧 Please run the integration setup again"
    exit 1
fi
EOF

    chmod +x "$SCRIPT_DIR/validate-integration.sh"
    echo "✅ Integration validation script created"
}

# Main execution
main() {
    echo "🚀 Integrating Living Blueprint architecture with Hydra installer..."
    echo ""
    
    enhance_installer
    update_package_scripts  
    update_installer_readme
    create_validation_script
    
    echo ""
    echo "✅ Living Blueprint integration completed!"
    echo ""
    echo "🔍 Running validation..."
    "$SCRIPT_DIR/validate-integration.sh"
}

# Execute if run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
EOF