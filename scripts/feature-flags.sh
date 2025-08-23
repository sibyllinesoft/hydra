#!/bin/bash

#========================================================================
# Feature Flag System - Hybrid Living Blueprint Architecture  
# 
# Environment-based configuration system for gradual rollout
# Controls dual-stack vs legacy-only operation modes
#========================================================================

set -euo pipefail

# Configuration
readonly FEATURE_FLAGS_VERSION="1.0.0"
readonly CONFIG_DIR="${HYDRA_CONFIG_DIR:-${HOME}/.hydra/config}"
readonly FLAGS_FILE="${CONFIG_DIR}/feature-flags.json"
readonly LOG_FILE="${CONFIG_DIR}/feature-flags.log"

# Default feature flags
readonly DEFAULT_FLAGS='{
  "persistent_context": {
    "enabled": true,
    "mode": "dual-stack",
    "description": "Enable persistent context management with dual-stack operation",
    "rollout_phase": "foundation",
    "last_modified": ""
  },
  "context_migration": {
    "enabled": true,
    "mode": "auto",
    "description": "Automatic migration of legacy status files to new format",
    "rollout_phase": "migration",
    "last_modified": ""
  },
  "enhanced_backup": {
    "enabled": true,
    "mode": "enabled",
    "description": "Enhanced backup and restore capabilities",
    "rollout_phase": "foundation",
    "last_modified": ""
  },
  "health_monitoring": {
    "enabled": true,
    "mode": "enabled", 
    "description": "Comprehensive health monitoring and diagnostics",
    "rollout_phase": "foundation",
    "last_modified": ""
  },
  "legacy_fallback": {
    "enabled": true,
    "mode": "graceful",
    "description": "Graceful fallback to legacy systems when persistent context fails",
    "rollout_phase": "always",
    "last_modified": ""
  }
}'

# Logging function
log() {
    local level="$1"
    shift
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*" | tee -a "$LOG_FILE"
}

# Initialize feature flags directory and file
initialize_flags() {
    log "INFO" "Initializing feature flags system"
    
    mkdir -p "$CONFIG_DIR"
    
    if [[ ! -f "$FLAGS_FILE" ]]; then
        log "INFO" "Creating default feature flags configuration"
        echo "$DEFAULT_FLAGS" | jq '.' > "$FLAGS_FILE"
        
        # Set initial timestamps
        local timestamp
        timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
        jq "to_entries | map(.value.last_modified = \"$timestamp\") | from_entries" "$FLAGS_FILE" > "${FLAGS_FILE}.tmp"
        mv "${FLAGS_FILE}.tmp" "$FLAGS_FILE"
    fi
    
    log "INFO" "Feature flags system initialized"
}

# Get feature flag value
get_flag() {
    local flag_name="$1"
    local property="${2:-enabled}"
    
    if [[ ! -f "$FLAGS_FILE" ]]; then
        log "ERROR" "Feature flags file not found"
        return 1
    fi
    
    local value
    value=$(jq -r ".[\"$flag_name\"][\"$property\"] // empty" "$FLAGS_FILE" 2>/dev/null)
    
    if [[ -n "$value" && "$value" != "null" ]]; then
        echo "$value"
        return 0
    else
        log "WARNING" "Feature flag not found: $flag_name.$property"
        return 1
    fi
}

# Set feature flag value
set_flag() {
    local flag_name="$1"
    local property="$2"
    local value="$3"
    local reason="${4:-manual update}"
    
    log "INFO" "Setting feature flag: $flag_name.$property = $value ($reason)"
    
    if [[ ! -f "$FLAGS_FILE" ]]; then
        initialize_flags
    fi
    
    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Atomic update using temporary file
    local temp_file="${CONFIG_DIR}/flags.tmp"
    
    # Update the flag and timestamp
    jq ".[\"$flag_name\"][\"$property\"] = \"$value\" | .[\"$flag_name\"][\"last_modified\"] = \"$timestamp\"" "$FLAGS_FILE" > "$temp_file"
    
    if jq empty "$temp_file" 2>/dev/null; then
        mv "$temp_file" "$FLAGS_FILE"
        log "INFO" "Feature flag updated successfully"
        return 0
    else
        log "ERROR" "Invalid JSON generated, aborting flag update"
        rm -f "$temp_file"
        return 1
    fi
}

# Check if feature is enabled
is_enabled() {
    local flag_name="$1"
    local enabled
    
    enabled=$(get_flag "$flag_name" "enabled" 2>/dev/null)
    
    if [[ "$enabled" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# Get feature mode
get_mode() {
    local flag_name="$1"
    get_flag "$flag_name" "mode"
}

# Enable feature flag
enable_flag() {
    local flag_name="$1"
    local reason="${2:-manual enable}"
    
    set_flag "$flag_name" "enabled" "true" "$reason"
}

# Disable feature flag  
disable_flag() {
    local flag_name="$1"
    local reason="${2:-manual disable}"
    
    set_flag "$flag_name" "enabled" "false" "$reason"
}

# Set feature mode
set_mode() {
    local flag_name="$1"
    local mode="$2"
    local reason="${3:-mode change}"
    
    set_flag "$flag_name" "mode" "$mode" "$reason"
}

# List all feature flags
list_flags() {
    if [[ ! -f "$FLAGS_FILE" ]]; then
        log "ERROR" "Feature flags file not found"
        return 1
    fi
    
    echo "Feature Flags Status:"
    echo "===================="
    
    jq -r 'to_entries[] | "\(.key): \(.value.enabled) (\(.value.mode)) - \(.value.description)"' "$FLAGS_FILE"
}

# Show detailed flag information
show_flag() {
    local flag_name="$1"
    
    if [[ ! -f "$FLAGS_FILE" ]]; then
        log "ERROR" "Feature flags file not found"
        return 1
    fi
    
    local flag_data
    flag_data=$(jq -r ".[\"$flag_name\"] // empty" "$FLAGS_FILE")
    
    if [[ -n "$flag_data" && "$flag_data" != "null" ]]; then
        echo "Feature Flag: $flag_name"
        echo "========================"
        echo "$flag_data" | jq .
    else
        log "ERROR" "Feature flag not found: $flag_name"
        return 1
    fi
}

# Reset flags to defaults
reset_flags() {
    local confirm="${1:-}"
    
    if [[ "$confirm" != "confirm" ]]; then
        echo "WARNING: This will reset all feature flags to defaults"
        echo "Run with 'confirm' parameter to proceed: $0 reset confirm"
        return 1
    fi
    
    log "INFO" "Resetting feature flags to defaults"
    
    # Backup current flags
    if [[ -f "$FLAGS_FILE" ]]; then
        local backup_file="${CONFIG_DIR}/flags-backup-$(date +%Y%m%d_%H%M%S).json"
        cp "$FLAGS_FILE" "$backup_file"
        log "INFO" "Current flags backed up to: $backup_file"
    fi
    
    # Write defaults
    echo "$DEFAULT_FLAGS" | jq '.' > "$FLAGS_FILE"
    
    # Set timestamps
    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    jq "to_entries | map(.value.last_modified = \"$timestamp\") | from_entries" "$FLAGS_FILE" > "${FLAGS_FILE}.tmp"
    mv "${FLAGS_FILE}.tmp" "$FLAGS_FILE"
    
    log "INFO" "Feature flags reset to defaults"
}

# Export environment variables for current flags
export_env() {
    if [[ ! -f "$FLAGS_FILE" ]]; then
        log "ERROR" "Feature flags file not found"
        return 1
    fi
    
    log "INFO" "Exporting feature flags as environment variables"
    
    # Generate environment variable exports
    echo "# Feature Flags Environment Variables"
    echo "# Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
    echo ""
    
    # Export HYDRA_PERSISTENT_CONTEXT based on persistent_context flag
    if is_enabled "persistent_context"; then
        local mode
        mode=$(get_mode "persistent_context")
        echo "export HYDRA_PERSISTENT_CONTEXT=\"$mode\""
    else
        echo "export HYDRA_PERSISTENT_CONTEXT=\"disabled\""
    fi
    
    # Export other relevant flags
    jq -r 'to_entries[] | "export HYDRA_\(.key | ascii_upcase | gsub("_"; "_"))_\(.value.enabled | if . then "ENABLED" else "DISABLED" end)=\"\(.value.mode)\""' "$FLAGS_FILE"
}

# Rollout phase management
set_rollout_phase() {
    local phase="$1"
    local confirm="${2:-}"
    
    local valid_phases=("foundation" "migration" "integration" "deployment")
    
    # Validate phase
    if [[ ! " ${valid_phases[*]} " =~ " ${phase} " ]]; then
        log "ERROR" "Invalid rollout phase: $phase"
        echo "Valid phases: ${valid_phases[*]}"
        return 1
    fi
    
    if [[ "$confirm" != "confirm" ]]; then
        echo "WARNING: This will update rollout phase for all applicable features"
        echo "Run with 'confirm' parameter to proceed: $0 rollout $phase confirm"
        return 1
    fi
    
    log "INFO" "Setting rollout phase to: $phase"
    
    # Update flags based on phase
    case "$phase" in
        "foundation")
            enable_flag "persistent_context" "rollout phase: foundation"
            set_mode "persistent_context" "dual-stack" "rollout phase: foundation"
            enable_flag "enhanced_backup" "rollout phase: foundation"
            enable_flag "health_monitoring" "rollout phase: foundation"
            ;;
        "migration")
            enable_flag "context_migration" "rollout phase: migration"
            set_mode "context_migration" "auto" "rollout phase: migration"
            ;;
        "integration")
            set_mode "persistent_context" "enabled" "rollout phase: integration"
            disable_flag "context_migration" "rollout phase: integration"
            ;;
        "deployment")
            set_mode "legacy_fallback" "minimal" "rollout phase: deployment"
            ;;
    esac
    
    log "INFO" "Rollout phase updated to: $phase"
}

# Health check for feature flags
health_check() {
    log "INFO" "Running feature flags health check"
    
    local errors=0
    
    # Check if flags file exists and is valid JSON
    if [[ ! -f "$FLAGS_FILE" ]]; then
        log "ERROR" "Feature flags file missing"
        ((errors++))
    elif ! jq empty "$FLAGS_FILE" 2>/dev/null; then
        log "ERROR" "Feature flags file contains invalid JSON"
        ((errors++))
    fi
    
    # Check for required flags
    local required_flags=("persistent_context" "legacy_fallback")
    for flag in "${required_flags[@]}"; do
        if ! get_flag "$flag" "enabled" >/dev/null 2>&1; then
            log "WARNING" "Required feature flag missing: $flag"
            ((errors++))
        fi
    done
    
    # Check config directory permissions
    if [[ ! -w "$CONFIG_DIR" ]]; then
        log "ERROR" "No write permission to config directory: $CONFIG_DIR"
        ((errors++))
    fi
    
    if [[ $errors -eq 0 ]]; then
        log "INFO" "Feature flags health check passed"
        return 0
    else
        log "ERROR" "Feature flags health check failed with $errors issues"
        return 1
    fi
}

# Main command line interface
main() {
    local command="${1:-list}"
    
    # Initialize if needed
    initialize_flags
    
    case "$command" in
        "get")
            if [[ $# -lt 2 ]]; then
                echo "Usage: $0 get <flag_name> [property]"
                exit 1
            fi
            get_flag "$2" "${3:-enabled}"
            ;;
        "set")
            if [[ $# -lt 4 ]]; then
                echo "Usage: $0 set <flag_name> <property> <value> [reason]"
                exit 1
            fi
            set_flag "$2" "$3" "$4" "${5:-manual update}"
            ;;
        "enable")
            if [[ $# -lt 2 ]]; then
                echo "Usage: $0 enable <flag_name> [reason]"
                exit 1
            fi
            enable_flag "$2" "${3:-manual enable}"
            ;;
        "disable")
            if [[ $# -lt 2 ]]; then
                echo "Usage: $0 disable <flag_name> [reason]"
                exit 1
            fi
            disable_flag "$2" "${3:-manual disable}"
            ;;
        "mode")
            if [[ $# -lt 3 ]]; then
                echo "Usage: $0 mode <flag_name> <mode> [reason]"
                exit 1
            fi
            set_mode "$2" "$3" "${4:-mode change}"
            ;;
        "list")
            list_flags
            ;;
        "show")
            if [[ $# -lt 2 ]]; then
                echo "Usage: $0 show <flag_name>"
                exit 1
            fi
            show_flag "$2"
            ;;
        "export")
            export_env
            ;;
        "reset")
            reset_flags "$2"
            ;;
        "rollout")
            if [[ $# -lt 2 ]]; then
                echo "Usage: $0 rollout <phase> [confirm]"
                echo "Phases: foundation, migration, integration, deployment"
                exit 1
            fi
            set_rollout_phase "$2" "$3"
            ;;
        "health")
            health_check
            ;;
        "help"|*)
            cat << 'EOF'
Feature Flag System - Hybrid Living Blueprint Architecture

Usage: feature-flags.sh <command> [arguments]

Commands:
  get <flag> [prop]         Get feature flag value (default: enabled)
  set <flag> <prop> <val>   Set feature flag property
  enable <flag> [reason]    Enable feature flag  
  disable <flag> [reason]   Disable feature flag
  mode <flag> <mode>        Set feature flag mode
  list                      List all feature flags
  show <flag>               Show detailed flag information
  export                    Export as environment variables
  reset [confirm]           Reset all flags to defaults
  rollout <phase> [confirm] Set rollout phase (foundation|migration|integration|deployment)
  health                    Run health check
  help                      Show this help

Feature Flags:
  persistent_context        Enable persistent context management (modes: enabled|disabled|dual-stack)
  context_migration         Automatic legacy migration (modes: auto|manual|disabled)
  enhanced_backup           Enhanced backup capabilities (modes: enabled|disabled)
  health_monitoring         Health monitoring system (modes: enabled|disabled)
  legacy_fallback          Legacy fallback behavior (modes: graceful|minimal|disabled)

Environment Variables:
  HYDRA_CONFIG_DIR         Config directory (default: ~/.hydra/config)
  HYDRA_PERSISTENT_CONTEXT Set by persistent_context flag

Examples:
  ./feature-flags.sh enable persistent_context
  ./feature-flags.sh mode persistent_context dual-stack
  ./feature-flags.sh rollout foundation confirm
  ./feature-flags.sh export > hydra-env.sh && source hydra-env.sh

EOF
            ;;
    esac
}

# Execute if run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi