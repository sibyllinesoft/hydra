#!/bin/bash

#========================================================================
# ContextManager Service - Hybrid Living Blueprint Architecture
# 
# JSON/jq-based dual-stack system for persistent context management
# Provides atomic operations with backup/restore and graceful degradation
#========================================================================

set -euo pipefail

# Configuration
readonly CONTEXT_MANAGER_VERSION="1.0.0"
readonly DEFAULT_CONTEXT_DIR="${HYDRA_CONTEXT_DIR:-${HOME}/.hydra/context}"
readonly BACKUP_DIR="${DEFAULT_CONTEXT_DIR}/backups"
readonly TEMP_DIR="${DEFAULT_CONTEXT_DIR}/tmp"
readonly LOG_FILE="${DEFAULT_CONTEXT_DIR}/context-manager.log"

# Feature flags
readonly PERSISTENT_CONTEXT="${HYDRA_PERSISTENT_CONTEXT:-dual-stack}"

# Context files
readonly GENESIS_FILE="${DEFAULT_CONTEXT_DIR}/genesis.json"
readonly MEMORY_CONTEXT="${DEFAULT_CONTEXT_DIR}/memory.json"
readonly STATUS_FILE="${DEFAULT_CONTEXT_DIR}/status.json"

# Logging function
log() {
    local level="$1"
    shift
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*" | tee -a "$LOG_FILE"
}

# Initialize context directory structure
initialize_context_dir() {
    log "INFO" "Initializing ContextManager directory structure"
    
    mkdir -p "$DEFAULT_CONTEXT_DIR" "$BACKUP_DIR" "$TEMP_DIR"
    
    # Initialize genesis file if it doesn't exist
    if [[ ! -f "$GENESIS_FILE" ]]; then
        log "INFO" "Creating genesis context file"
        cat > "$GENESIS_FILE" << 'EOF'
{
  "version": "1.0.0",
  "created": "",
  "context": {
    "project_name": "",
    "current_phase": "initialization",
    "objectives": [],
    "constraints": [],
    "dependencies": {},
    "history": []
  }
}
EOF
        # Set creation timestamp
        local timestamp
        timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
        jq ".created = \"$timestamp\"" "$GENESIS_FILE" > "${TEMP_DIR}/genesis.tmp" && mv "${TEMP_DIR}/genesis.tmp" "$GENESIS_FILE"
    fi
    
    # Initialize memory context
    if [[ ! -f "$MEMORY_CONTEXT" ]]; then
        log "INFO" "Creating memory context file"
        echo '{"session_context": {}, "temp_data": {}}' > "$MEMORY_CONTEXT"
    fi
    
    # Initialize status file  
    if [[ ! -f "$STATUS_FILE" ]]; then
        log "INFO" "Creating status tracking file"
        echo '{"current_status": "initialized", "last_update": "", "active_workflows": []}' > "$STATUS_FILE"
    fi
    
    log "INFO" "ContextManager initialization complete"
}

# Backup context before making changes
backup_context() {
    local backup_name="${1:-$(date +%Y%m%d_%H%M%S)}"
    local backup_path="${BACKUP_DIR}/${backup_name}"
    
    log "INFO" "Creating context backup: $backup_name"
    
    mkdir -p "$backup_path"
    
    # Backup all context files
    for file in "$GENESIS_FILE" "$MEMORY_CONTEXT" "$STATUS_FILE"; do
        if [[ -f "$file" ]]; then
            cp "$file" "$backup_path/"
            log "DEBUG" "Backed up $(basename "$file")"
        fi
    done
    
    # Create backup metadata
    cat > "${backup_path}/metadata.json" << EOF
{
  "backup_name": "$backup_name",
  "created": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "files": $(find "$backup_path" -name "*.json" ! -name "metadata.json" -exec basename {} \; | jq -R . | jq -s .),
  "context_manager_version": "$CONTEXT_MANAGER_VERSION"
}
EOF
    
    log "INFO" "Context backup completed: $backup_path"
    echo "$backup_path"
}

# Restore context from backup
restore_context() {
    local backup_name="$1"
    local backup_path="${BACKUP_DIR}/${backup_name}"
    
    if [[ ! -d "$backup_path" ]]; then
        log "ERROR" "Backup not found: $backup_name"
        return 1
    fi
    
    log "INFO" "Restoring context from backup: $backup_name"
    
    # Create emergency backup before restore
    local emergency_backup
    emergency_backup=$(backup_context "emergency_$(date +%Y%m%d_%H%M%S)")
    log "INFO" "Emergency backup created: $emergency_backup"
    
    # Restore files
    for file in genesis.json memory.json status.json; do
        if [[ -f "${backup_path}/${file}" ]]; then
            cp "${backup_path}/${file}" "${DEFAULT_CONTEXT_DIR}/"
            log "DEBUG" "Restored $file"
        fi
    done
    
    # Validate restored context
    if validate_context_integrity; then
        log "INFO" "Context restoration successful"
        return 0
    else
        log "ERROR" "Context restoration failed validation, rolling back"
        # Restore emergency backup
        for file in genesis.json memory.json status.json; do
            if [[ -f "${emergency_backup}/${file}" ]]; then
                cp "${emergency_backup}/${file}" "${DEFAULT_CONTEXT_DIR}/"
            fi
        done
        return 1
    fi
}

# Validate context file integrity
validate_context_integrity() {
    log "DEBUG" "Validating context integrity"
    
    local errors=0
    
    # Check each JSON file
    for file in "$GENESIS_FILE" "$MEMORY_CONTEXT" "$STATUS_FILE"; do
        if [[ -f "$file" ]]; then
            if ! jq empty "$file" 2>/dev/null; then
                log "ERROR" "Invalid JSON in $(basename "$file")"
                ((errors++))
            else
                log "DEBUG" "$(basename "$file") - JSON valid"
            fi
        else
            log "WARNING" "Missing context file: $(basename "$file")"
            ((errors++))
        fi
    done
    
    if [[ $errors -eq 0 ]]; then
        log "INFO" "Context integrity validation passed"
        return 0
    else
        log "ERROR" "Context integrity validation failed with $errors errors"
        return 1
    fi
}

# Atomic context update
atomic_update() {
    local file="$1"
    local jq_expression="$2"
    local description="${3:-context update}"
    
    log "INFO" "Performing atomic update: $description"
    
    # Validate input file
    if [[ ! -f "$file" ]]; then
        log "ERROR" "Context file not found: $file"
        return 1
    fi
    
    # Create backup before update
    local backup_name="pre_update_$(date +%Y%m%d_%H%M%S)"
    backup_context "$backup_name" >/dev/null
    
    # Perform atomic update using temp file
    local temp_file="${TEMP_DIR}/$(basename "$file").tmp"
    
    if jq "$jq_expression" "$file" > "$temp_file"; then
        # Validate the temporary file
        if jq empty "$temp_file" 2>/dev/null; then
            # Atomic move
            mv "$temp_file" "$file"
            log "INFO" "Atomic update completed successfully"
            
            # Update status
            update_status "context_updated" "$description"
            return 0
        else
            log "ERROR" "Generated JSON is invalid, aborting update"
            rm -f "$temp_file"
            return 1
        fi
    else
        log "ERROR" "jq expression failed, aborting update"
        rm -f "$temp_file"
        return 1
    fi
}

# Update status tracking
update_status() {
    local status="$1"
    local message="${2:-}"
    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    atomic_update "$STATUS_FILE" \
        ".current_status = \"$status\" | .last_update = \"$timestamp\" | .message = \"$message\"" \
        "status update to $status"
}

# Get context value using jq
get_context() {
    local file="$1"
    local query="$2"
    
    if [[ ! -f "$file" ]]; then
        log "ERROR" "Context file not found: $file"
        return 1
    fi
    
    jq -r "$query" "$file" 2>/dev/null || {
        log "ERROR" "Failed to query context: $query"
        return 1
    }
}

# Set context value using jq
set_context() {
    local file="$1"
    local jq_expression="$2"
    local description="${3:-set context value}"
    
    atomic_update "$file" "$jq_expression" "$description"
}

# Memory context operations (session-only)
memory_set() {
    local key="$1"
    local value="$2"
    
    log "DEBUG" "Setting memory context: $key"
    set_context "$MEMORY_CONTEXT" ".session_context[\"$key\"] = \"$value\"" "memory set $key"
}

memory_get() {
    local key="$1"
    get_context "$MEMORY_CONTEXT" ".session_context[\"$key\"] // empty"
}

# Persistent context operations (stored in genesis)
persistent_set() {
    local key="$1"
    local value="$2"
    
    log "DEBUG" "Setting persistent context: $key"
    set_context "$GENESIS_FILE" ".context[\"$key\"] = \"$value\"" "persistent set $key"
}

persistent_get() {
    local key="$1"
    get_context "$GENESIS_FILE" ".context[\"$key\"] // empty"
}

# Dual-stack operation - get from persistent first, fallback to memory
dual_get() {
    local key="$1"
    local value
    
    # Try persistent first
    value=$(persistent_get "$key" 2>/dev/null)
    if [[ -n "$value" && "$value" != "null" ]]; then
        echo "$value"
        return 0
    fi
    
    # Fallback to memory
    value=$(memory_get "$key" 2>/dev/null)
    if [[ -n "$value" && "$value" != "null" ]]; then
        echo "$value"
        return 0
    fi
    
    # Not found in either
    return 1
}

# Dual-stack operation - set in both persistent and memory
dual_set() {
    local key="$1"
    local value="$2"
    
    case "$PERSISTENT_CONTEXT" in
        "enabled")
            persistent_set "$key" "$value"
            ;;
        "disabled") 
            memory_set "$key" "$value"
            ;;
        "dual-stack"|*)
            # Set in both for redundancy
            persistent_set "$key" "$value"
            memory_set "$key" "$value"
            ;;
    esac
}

# Clean up old backups
cleanup_backups() {
    local days_to_keep="${1:-7}"
    
    log "INFO" "Cleaning up backups older than $days_to_keep days"
    
    find "$BACKUP_DIR" -type d -name "*_*" -mtime "+$days_to_keep" -exec rm -rf {} \; 2>/dev/null || true
    
    log "INFO" "Backup cleanup completed"
}

# Health check
health_check() {
    log "INFO" "Running ContextManager health check"
    
    local errors=0
    
    # Check directory structure
    for dir in "$DEFAULT_CONTEXT_DIR" "$BACKUP_DIR" "$TEMP_DIR"; do
        if [[ ! -d "$dir" ]]; then
            log "ERROR" "Missing directory: $dir"
            ((errors++))
        fi
    done
    
    # Check file integrity
    if ! validate_context_integrity; then
        ((errors++))
    fi
    
    # Check jq dependency
    if ! command -v jq >/dev/null 2>&1; then
        log "ERROR" "jq dependency not found"
        ((errors++))
    fi
    
    # Check disk space (warn if less than 100MB available)
    local available_space
    available_space=$(df "$DEFAULT_CONTEXT_DIR" | awk 'NR==2 {print $4}')
    if [[ $available_space -lt 102400 ]]; then
        log "WARNING" "Low disk space: ${available_space}KB available"
    fi
    
    if [[ $errors -eq 0 ]]; then
        log "INFO" "ContextManager health check passed"
        return 0
    else
        log "ERROR" "ContextManager health check failed with $errors errors"
        return 1
    fi
}

# Migration from old status files
migrate_legacy_status() {
    local legacy_dir="${1:-./status}"
    
    if [[ ! -d "$legacy_dir" ]]; then
        log "INFO" "No legacy status directory found, skipping migration"
        return 0
    fi
    
    log "INFO" "Migrating legacy status files from $legacy_dir"
    
    # Create migration backup
    local migration_backup
    migration_backup=$(backup_context "pre_migration_$(date +%Y%m%d_%H%M%S)")
    log "INFO" "Migration backup created: $migration_backup"
    
    # Find and migrate status files
    local migrated=0
    while IFS= read -r -d '' file; do
        if [[ -f "$file" ]]; then
            local basename
            basename=$(basename "$file" .json)
            log "DEBUG" "Migrating legacy status: $basename"
            
            # Add to history in genesis
            local content
            content=$(cat "$file" | jq -c .)
            atomic_update "$GENESIS_FILE" \
                ".context.history += [{\"legacy_migration\": true, \"original_file\": \"$basename\", \"content\": $content, \"migrated_at\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}]" \
                "migrate legacy status $basename"
            
            ((migrated++))
        fi
    done < <(find "$legacy_dir" -name "*.json" -print0)
    
    log "INFO" "Legacy migration completed: $migrated files migrated"
    return 0
}

# Command line interface
main() {
    local command="${1:-help}"
    
    # Ensure context directory exists
    initialize_context_dir
    
    case "$command" in
        "init"|"initialize")
            initialize_context_dir
            ;;
        "backup")
            backup_context "${2:-}"
            ;;
        "restore")
            if [[ $# -lt 2 ]]; then
                echo "Usage: $0 restore <backup_name>"
                exit 1
            fi
            restore_context "$2"
            ;;
        "validate")
            validate_context_integrity
            ;;
        "get")
            if [[ $# -lt 3 ]]; then
                echo "Usage: $0 get <persistent|memory|dual> <key>"
                exit 1
            fi
            case "$2" in
                "persistent")
                    persistent_get "$3"
                    ;;
                "memory")
                    memory_get "$3"
                    ;;
                "dual")
                    dual_get "$3"
                    ;;
                *)
                    echo "Invalid context type: $2"
                    exit 1
                    ;;
            esac
            ;;
        "set")
            if [[ $# -lt 4 ]]; then
                echo "Usage: $0 set <persistent|memory|dual> <key> <value>"
                exit 1
            fi
            case "$2" in
                "persistent")
                    persistent_set "$3" "$4"
                    ;;
                "memory")
                    memory_set "$3" "$4"
                    ;;
                "dual")
                    dual_set "$3" "$4"
                    ;;
                *)
                    echo "Invalid context type: $2"
                    exit 1
                    ;;
            esac
            ;;
        "status")
            if [[ $# -lt 2 ]]; then
                echo "Current status: $(get_context "$STATUS_FILE" ".current_status")"
                echo "Last update: $(get_context "$STATUS_FILE" ".last_update")"
                echo "Message: $(get_context "$STATUS_FILE" ".message // \"none\"")"
            else
                update_status "$2" "$3"
            fi
            ;;
        "health")
            health_check
            ;;
        "cleanup")
            cleanup_backups "${2:-7}"
            ;;
        "migrate")
            migrate_legacy_status "$2"
            ;;
        "help"|*)
            cat << 'EOF'
ContextManager - Hybrid Living Blueprint Architecture

Usage: context-manager.sh <command> [arguments]

Commands:
  init                    Initialize context directory structure
  backup [name]           Create context backup
  restore <backup_name>   Restore context from backup
  validate               Validate context integrity
  get <type> <key>       Get context value (type: persistent|memory|dual)
  set <type> <key> <val> Set context value (type: persistent|memory|dual)
  status [new_status]    Show or update status
  health                 Run health check
  cleanup [days]         Clean up old backups (default: 7 days)
  migrate [dir]          Migrate legacy status files
  help                   Show this help

Environment Variables:
  HYDRA_CONTEXT_DIR      Context directory (default: ~/.hydra/context)
  HYDRA_PERSISTENT_CONTEXT   Feature flag: enabled|disabled|dual-stack

Context Types:
  persistent             Stored in genesis.json (survives restarts)
  memory                 Stored in memory.json (session only)
  dual                   Dual-stack operation (persistent + memory)

EOF
            ;;
    esac
}

# Execute main function if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi