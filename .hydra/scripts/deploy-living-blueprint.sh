#!/bin/bash

#========================================================================
# Living Blueprint Architecture Deployment Orchestrator
#
# Manages incremental rollout with validation gates and rollback capability
# Implements zero-downtime deployment of hybrid context management
#========================================================================

set -euo pipefail

# Script configuration
readonly DEPLOY_VERSION="1.0.0"
readonly DEPLOY_LOG="${HYDRA_LOG_DIR:-${HOME}/.hydra/logs}/deploy.log"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Deployment phases
declare -ra DEPLOYMENT_PHASES=(
    "phase1_foundation"
    "phase2_migration_bridge" 
    "phase3_feature_integration"
    "phase4_validation_monitoring"
)

# Rollback stack
declare -a ROLLBACK_STACK=()

# Logging with deployment context
log() {
    local level="$1"
    local phase="${CURRENT_PHASE:-INIT}"
    shift
    
    local log_entry="[$(date '+%Y-%m-%d %H:%M:%S')] [$level] [$phase] $*"
    echo "$log_entry" >&2
    echo "$log_entry" >> "$DEPLOY_LOG"
}

# Initialize deployment environment
initialize_deployment() {
    log "INFO" "Initializing Living Blueprint deployment v$DEPLOY_VERSION"
    
    # Create necessary directories
    mkdir -p "$(dirname "$DEPLOY_LOG")"
    mkdir -p "${HOME}/.hydra/deployment"
    
    # Initialize feature flags if not present
    if [[ -x "${SCRIPT_DIR}/feature-flags.sh" ]]; then
        "${SCRIPT_DIR}/feature-flags.sh" list >/dev/null 2>&1 || {
            log "INFO" "Initializing feature flags system"
            "${SCRIPT_DIR}/feature-flags.sh" help >/dev/null
        }
    fi
    
    # Check dependencies
    if ! command -v jq >/dev/null 2>&1; then
        log "WARNING" "jq not found, attempting installation"
        if [[ -x "${SCRIPT_DIR}/install-dependencies.sh" ]]; then
            "${SCRIPT_DIR}/install-dependencies.sh" install
        else
            log "ERROR" "Cannot install dependencies - jq is required"
            return 1
        fi
    fi
    
    log "INFO" "Deployment environment initialized"
}

# Add to rollback stack
add_rollback_action() {
    local action="$1"
    local description="$2"
    
    ROLLBACK_STACK+=("$action:$description")
    log "DEBUG" "Added rollback action: $description"
}

# Execute rollback stack
execute_rollback() {
    local reason="${1:-manual rollback}"
    
    log "WARNING" "Executing rollback: $reason"
    
    # Execute rollback actions in reverse order
    for ((i=${#ROLLBACK_STACK[@]}-1; i>=0; i--)); do
        local entry="${ROLLBACK_STACK[i]}"
        local action="${entry%%:*}"
        local description="${entry#*:}"
        
        log "INFO" "Rolling back: $description"
        
        case "$action" in
            "disable_flag")
                local flag_name="${description##* }"
                "${SCRIPT_DIR}/feature-flags.sh" disable "$flag_name" "rollback: $reason" || {
                    log "ERROR" "Rollback failed for flag: $flag_name"
                }
                ;;
            "restore_backup")
                local backup_name="${description##* }"
                "${SCRIPT_DIR}/context-manager.sh" restore "$backup_name" || {
                    log "ERROR" "Rollback failed for backup: $backup_name"
                }
                ;;
            "custom")
                # Custom rollback command stored in description after |
                local command="${description#*|}"
                if [[ -n "$command" ]]; then
                    eval "$command" || {
                        log "ERROR" "Custom rollback failed: $command"
                    }
                fi
                ;;
            *)
                log "WARNING" "Unknown rollback action: $action"
                ;;
        esac
    done
    
    log "INFO" "Rollback execution completed"
}

# Validation gate - checks system health before proceeding  
validation_gate() {
    local phase="$1"
    local description="$2"
    
    log "INFO" "Validation gate: $description"
    
    local errors=0
    
    # Basic health checks
    if [[ -x "${SCRIPT_DIR}/context-manager.sh" ]]; then
        if ! "${SCRIPT_DIR}/context-manager.sh" health; then
            log "ERROR" "ContextManager health check failed"
            ((errors++))
        fi
    else
        log "WARNING" "ContextManager script not found or not executable"
        ((errors++))
    fi
    
    # Feature flags health check
    if [[ -x "${SCRIPT_DIR}/feature-flags.sh" ]]; then
        if ! "${SCRIPT_DIR}/feature-flags.sh" health; then
            log "ERROR" "Feature flags health check failed"
            ((errors++))
        fi
    else
        log "WARNING" "Feature flags script not found or not executable"
        ((errors++))
    fi
    
    # Dependency checks
    if ! command -v jq >/dev/null 2>&1; then
        log "ERROR" "jq dependency not available"
        ((errors++))
    fi
    
    # Phase-specific validations
    case "$phase" in
        "phase1_foundation")
            # Check if context directory can be created
            local test_dir="${HOME}/.hydra/context/validation_test"
            if mkdir -p "$test_dir" 2>/dev/null; then
                rmdir "$test_dir"
                log "DEBUG" "Directory creation test passed"
            else
                log "ERROR" "Cannot create context directories"
                ((errors++))
            fi
            ;;
        "phase2_migration_bridge")
            # Check for legacy status files to migrate
            if [[ -d "./status" ]] && [[ -n "$(find ./status -name "*.json" 2>/dev/null)" ]]; then
                log "INFO" "Legacy status files detected for migration"
            fi
            ;;
        "phase3_feature_integration")
            # Check if foundation components are working
            if [[ -x "${SCRIPT_DIR}/context-manager.sh" ]]; then
                if ! "${SCRIPT_DIR}/context-manager.sh" validate; then
                    log "ERROR" "ContextManager validation failed"
                    ((errors++))
                fi
            fi
            ;;
    esac
    
    if [[ $errors -eq 0 ]]; then
        log "INFO" "Validation gate passed: $description"
        return 0
    else
        log "ERROR" "Validation gate failed with $errors errors: $description"
        return 1
    fi
}

# Phase 1: Foundation - Core infrastructure deployment
phase1_foundation() {
    local CURRENT_PHASE="PHASE1_FOUNDATION"
    
    log "INFO" "Starting Phase 1: Foundation deployment"
    
    # Validation gate
    if ! validation_gate "phase1_foundation" "Foundation readiness check"; then
        log "ERROR" "Phase 1 validation failed"
        return 1
    fi
    
    # Initialize ContextManager
    log "INFO" "Initializing ContextManager service"
    if "${SCRIPT_DIR}/context-manager.sh" init; then
        log "INFO" "ContextManager initialized successfully"
        add_rollback_action "custom" "ContextManager cleanup|rm -rf ${HOME}/.hydra/context"
    else
        log "ERROR" "ContextManager initialization failed"
        return 1
    fi
    
    # Create initial backup
    local foundation_backup
    if foundation_backup=$("${SCRIPT_DIR}/context-manager.sh" backup "foundation_$(date +%Y%m%d_%H%M%S)"); then
        log "INFO" "Foundation backup created: $foundation_backup"
        add_rollback_action "restore_backup" "foundation backup $(basename "$foundation_backup")"
    fi
    
    # Enable foundation feature flags
    log "INFO" "Enabling foundation feature flags"
    
    local foundation_flags=("persistent_context" "enhanced_backup" "health_monitoring" "legacy_fallback")
    for flag in "${foundation_flags[@]}"; do
        if "${SCRIPT_DIR}/feature-flags.sh" enable "$flag" "phase1 foundation deployment"; then
            log "INFO" "Enabled feature flag: $flag"
            add_rollback_action "disable_flag" "foundation flag $flag"
        else
            log "ERROR" "Failed to enable feature flag: $flag"
            return 1
        fi
    done
    
    # Set persistent context to dual-stack mode
    if "${SCRIPT_DIR}/feature-flags.sh" mode "persistent_context" "dual-stack" "phase1 foundation"; then
        log "INFO" "Set persistent_context mode to dual-stack"
    else
        log "ERROR" "Failed to set persistent_context mode"
        return 1
    fi
    
    # Validate foundation deployment
    if validation_gate "phase1_foundation" "Foundation deployment validation"; then
        log "INFO" "Phase 1: Foundation completed successfully"
        return 0
    else
        log "ERROR" "Phase 1: Foundation validation failed"
        return 1
    fi
}

# Phase 2: Migration Bridge - Legacy status file migration
phase2_migration_bridge() {
    local CURRENT_PHASE="PHASE2_MIGRATION"
    
    log "INFO" "Starting Phase 2: Migration Bridge deployment"
    
    # Validation gate
    if ! validation_gate "phase2_migration_bridge" "Migration readiness check"; then
        log "ERROR" "Phase 2 validation failed"
        return 1
    fi
    
    # Enable migration feature flag
    log "INFO" "Enabling migration features"
    if "${SCRIPT_DIR}/feature-flags.sh" enable "context_migration" "phase2 migration deployment"; then
        log "INFO" "Migration features enabled"
        add_rollback_action "disable_flag" "migration flag context_migration"
    else
        log "ERROR" "Failed to enable migration features"
        return 1
    fi
    
    # Create pre-migration backup
    local migration_backup
    if migration_backup=$("${SCRIPT_DIR}/context-manager.sh" backup "pre_migration_$(date +%Y%m%d_%H%M%S)"); then
        log "INFO" "Pre-migration backup created: $migration_backup"
        add_rollback_action "restore_backup" "pre-migration backup $(basename "$migration_backup")"
    fi
    
    # Perform legacy migration if status directory exists
    if [[ -d "./status" ]]; then
        log "INFO" "Migrating legacy status files"
        if "${SCRIPT_DIR}/context-manager.sh" migrate "./status"; then
            log "INFO" "Legacy migration completed successfully"
            
            # Create post-migration backup
            local post_migration_backup
            post_migration_backup=$("${SCRIPT_DIR}/context-manager.sh" backup "post_migration_$(date +%Y%m%d_%H%M%S)")
            log "INFO" "Post-migration backup created: $post_migration_backup"
        else
            log "ERROR" "Legacy migration failed"
            return 1
        fi
    else
        log "INFO" "No legacy status directory found, skipping migration"
    fi
    
    # Validate migration
    if "${SCRIPT_DIR}/context-manager.sh" validate; then
        log "INFO" "Phase 2: Migration Bridge completed successfully"
        return 0
    else
        log "ERROR" "Phase 2: Migration validation failed"
        return 1
    fi
}

# Phase 3: Feature Integration - Full feature activation
phase3_feature_integration() {
    local CURRENT_PHASE="PHASE3_INTEGRATION"
    
    log "INFO" "Starting Phase 3: Feature Integration deployment"
    
    # Validation gate
    if ! validation_gate "phase3_feature_integration" "Feature integration readiness check"; then
        log "ERROR" "Phase 3 validation failed"
        return 1
    fi
    
    # Create pre-integration backup
    local integration_backup
    if integration_backup=$("${SCRIPT_DIR}/context-manager.sh" backup "pre_integration_$(date +%Y%m%d_%H%M%S)"); then
        log "INFO" "Pre-integration backup created: $integration_backup"
        add_rollback_action "restore_backup" "pre-integration backup $(basename "$integration_backup")"
    fi
    
    # Update installer for dependency management
    log "INFO" "Validating dependency management integration"
    if [[ -x "${SCRIPT_DIR}/install-dependencies.sh" ]]; then
        if "${SCRIPT_DIR}/install-dependencies.sh" check; then
            log "INFO" "Dependencies validated successfully"
        else
            log "WARNING" "Some dependencies need attention"
        fi
    fi
    
    # Test dual-stack operations
    log "INFO" "Testing dual-stack context operations"
    
    # Test setting and getting context in dual-stack mode
    local test_key="deployment_test_$(date +%s)"
    local test_value="phase3_integration"
    
    if "${SCRIPT_DIR}/context-manager.sh" set dual "$test_key" "$test_value"; then
        log "DEBUG" "Dual-stack set operation successful"
        
        local retrieved_value
        if retrieved_value=$("${SCRIPT_DIR}/context-manager.sh" get dual "$test_key"); then
            if [[ "$retrieved_value" == "$test_value" ]]; then
                log "INFO" "Dual-stack operations validated successfully"
            else
                log "ERROR" "Dual-stack validation failed: expected '$test_value', got '$retrieved_value'"
                return 1
            fi
        else
            log "ERROR" "Failed to retrieve dual-stack test value"
            return 1
        fi
    else
        log "ERROR" "Failed to set dual-stack test value"
        return 1
    fi
    
    # Adjust rollout phase in feature flags
    if "${SCRIPT_DIR}/feature-flags.sh" rollout "integration" "confirm"; then
        log "INFO" "Feature flags updated for integration phase"
    else
        log "ERROR" "Failed to update feature flags for integration phase"
        return 1
    fi
    
    log "INFO" "Phase 3: Feature Integration completed successfully"
    return 0
}

# Phase 4: Validation & Monitoring - Final validation and monitoring setup
phase4_validation_monitoring() {
    local CURRENT_PHASE="PHASE4_VALIDATION"
    
    log "INFO" "Starting Phase 4: Validation & Monitoring deployment"
    
    # Final comprehensive validation
    log "INFO" "Running comprehensive system validation"
    
    local errors=0
    
    # Test all core functionalities
    log "INFO" "Testing core functionalities..."
    
    # Context operations test
    local test_contexts=("persistent" "memory" "dual")
    for context_type in "${test_contexts[@]}"; do
        local test_key="final_test_${context_type}_$(date +%s)"
        local test_value="validation_phase4"
        
        if "${SCRIPT_DIR}/context-manager.sh" set "$context_type" "$test_key" "$test_value"; then
            local retrieved
            if retrieved=$("${SCRIPT_DIR}/context-manager.sh" get "$context_type" "$test_key"); then
                if [[ "$retrieved" == "$test_value" ]]; then
                    log "DEBUG" "$context_type context operations: OK"
                else
                    log "ERROR" "$context_type context validation failed"
                    ((errors++))
                fi
            else
                log "ERROR" "Failed to retrieve $context_type context"
                ((errors++))
            fi
        else
            log "ERROR" "Failed to set $context_type context"
            ((errors++))
        fi
    done
    
    # Feature flags validation
    if "${SCRIPT_DIR}/feature-flags.sh" health; then
        log "DEBUG" "Feature flags system: OK"
    else
        log "ERROR" "Feature flags validation failed"
        ((errors++))
    fi
    
    # Backup/restore validation  
    local test_backup
    if test_backup=$("${SCRIPT_DIR}/context-manager.sh" backup "validation_test_$(date +%Y%m%d_%H%M%S)"); then
        log "DEBUG" "Backup creation: OK"
        
        # Validate backup integrity
        if [[ -d "$test_backup" ]] && [[ -f "$test_backup/genesis.json" ]]; then
            log "DEBUG" "Backup integrity: OK"
        else
            log "ERROR" "Backup integrity check failed"
            ((errors++))
        fi
    else
        log "ERROR" "Backup creation failed"
        ((errors++))
    fi
    
    # Create final deployment backup
    local final_backup
    if final_backup=$("${SCRIPT_DIR}/context-manager.sh" backup "deployment_complete_$(date +%Y%m%d_%H%M%S)"); then
        log "INFO" "Final deployment backup created: $final_backup"
    fi
    
    # Set final rollout phase
    if "${SCRIPT_DIR}/feature-flags.sh" rollout "deployment" "confirm"; then
        log "INFO" "Final rollout phase activated"
    else
        log "WARNING" "Failed to set final rollout phase"
    fi
    
    # Cleanup old backups
    if "${SCRIPT_DIR}/context-manager.sh" cleanup 7; then
        log "INFO" "Backup cleanup completed"
    fi
    
    if [[ $errors -eq 0 ]]; then
        log "INFO" "Phase 4: Validation & Monitoring completed successfully"
        log "INFO" "Living Blueprint Architecture deployment COMPLETE"
        return 0
    else
        log "ERROR" "Phase 4: Validation failed with $errors errors"
        return 1
    fi
}

# Deploy specific phase
deploy_phase() {
    local phase="$1"
    local auto_rollback="${2:-true}"
    
    log "INFO" "Deploying phase: $phase"
    
    case "$phase" in
        "phase1_foundation"|"1")
            if phase1_foundation; then
                log "INFO" "Phase 1 deployment successful"
                return 0
            else
                log "ERROR" "Phase 1 deployment failed"
                if [[ "$auto_rollback" == "true" ]]; then
                    execute_rollback "Phase 1 deployment failure"
                fi
                return 1
            fi
            ;;
        "phase2_migration_bridge"|"2")
            if phase2_migration_bridge; then
                log "INFO" "Phase 2 deployment successful"
                return 0
            else
                log "ERROR" "Phase 2 deployment failed"
                if [[ "$auto_rollback" == "true" ]]; then
                    execute_rollback "Phase 2 deployment failure"
                fi
                return 1
            fi
            ;;
        "phase3_feature_integration"|"3")
            if phase3_feature_integration; then
                log "INFO" "Phase 3 deployment successful"
                return 0
            else
                log "ERROR" "Phase 3 deployment failed"
                if [[ "$auto_rollback" == "true" ]]; then
                    execute_rollback "Phase 3 deployment failure"
                fi
                return 1
            fi
            ;;
        "phase4_validation_monitoring"|"4")
            if phase4_validation_monitoring; then
                log "INFO" "Phase 4 deployment successful"
                return 0
            else
                log "ERROR" "Phase 4 deployment failed"
                if [[ "$auto_rollback" == "true" ]]; then
                    execute_rollback "Phase 4 deployment failure"
                fi
                return 1
            fi
            ;;
        *)
            log "ERROR" "Unknown deployment phase: $phase"
            return 1
            ;;
    esac
}

# Full deployment - all phases
deploy_all_phases() {
    local auto_rollback="${1:-true}"
    
    log "INFO" "Starting full Living Blueprint Architecture deployment"
    
    initialize_deployment || {
        log "ERROR" "Deployment initialization failed"
        return 1
    }
    
    # Execute all phases in sequence
    for phase in "${DEPLOYMENT_PHASES[@]}"; do
        log "INFO" "Executing deployment phase: $phase"
        
        if ! deploy_phase "$phase" "$auto_rollback"; then
            log "ERROR" "Full deployment failed at phase: $phase"
            return 1
        fi
        
        log "INFO" "Phase completed successfully: $phase"
        
        # Brief pause between phases for system stability
        sleep 2
    done
    
    log "INFO" "Full Living Blueprint Architecture deployment completed successfully!"
    
    # Display deployment summary
    echo ""
    echo "=================================="
    echo "DEPLOYMENT SUMMARY"
    echo "=================================="
    echo "Status: SUCCESS"
    echo "Phases completed: ${#DEPLOYMENT_PHASES[@]}"
    echo "Deployed components:"
    echo "  ✅ ContextManager Service (dual-stack)"
    echo "  ✅ Migration Bridge (legacy compatibility)"
    echo "  ✅ Feature Flag System (environment-based)"
    echo "  ✅ Enhanced Backup/Restore"
    echo "  ✅ Health Monitoring"
    echo "  ✅ Dependency Management (jq-based)"
    echo ""
    echo "Feature Flags Status:"
    "${SCRIPT_DIR}/feature-flags.sh" list
    echo ""
    echo "Next steps:"
    echo "  • Run health check: ./scripts/deploy-living-blueprint.sh health"
    echo "  • Test context operations: ./scripts/context-manager.sh help"
    echo "  • Monitor logs: tail -f $DEPLOY_LOG"
    echo "=================================="
    
    return 0
}

# Health check for deployment
deployment_health_check() {
    log "INFO" "Running deployment health check"
    
    local errors=0
    local components=()
    
    echo "Living Blueprint Architecture Health Check"
    echo "========================================"
    
    # Check ContextManager
    if [[ -x "${SCRIPT_DIR}/context-manager.sh" ]] && "${SCRIPT_DIR}/context-manager.sh" health >/dev/null 2>&1; then
        echo "✅ ContextManager Service: HEALTHY"
        components+=("ContextManager:OK")
    else
        echo "❌ ContextManager Service: UNHEALTHY"
        components+=("ContextManager:ERROR")
        ((errors++))
    fi
    
    # Check Feature Flags
    if [[ -x "${SCRIPT_DIR}/feature-flags.sh" ]] && "${SCRIPT_DIR}/feature-flags.sh" health >/dev/null 2>&1; then
        echo "✅ Feature Flag System: HEALTHY"
        components+=("FeatureFlags:OK")
    else
        echo "❌ Feature Flag System: UNHEALTHY"
        components+=("FeatureFlags:ERROR")
        ((errors++))
    fi
    
    # Check Dependencies
    if command -v jq >/dev/null 2>&1; then
        echo "✅ Dependencies (jq): AVAILABLE"
        components+=("Dependencies:OK")
    else
        echo "❌ Dependencies (jq): MISSING"
        components+=("Dependencies:ERROR")
        ((errors++))
    fi
    
    # Check Context Directory Structure
    if [[ -d "${HOME}/.hydra/context" ]] && [[ -f "${HOME}/.hydra/context/genesis.json" ]]; then
        echo "✅ Context Structure: PRESENT"
        components+=("ContextStructure:OK")
    else
        echo "❌ Context Structure: MISSING"
        components+=("ContextStructure:ERROR")
        ((errors++))
    fi
    
    echo ""
    echo "Health Summary: ${#components[@]} components checked, $errors errors"
    
    if [[ $errors -eq 0 ]]; then
        echo "🎉 Overall Status: HEALTHY"
        return 0
    else
        echo "🚨 Overall Status: NEEDS ATTENTION ($errors issues)"
        return 1
    fi
}

# Main command line interface
main() {
    local command="${1:-help}"
    
    case "$command" in
        "all"|"deploy")
            deploy_all_phases "${2:-true}"
            ;;
        "phase1"|"foundation")
            deploy_phase "phase1_foundation" "${2:-true}"
            ;;
        "phase2"|"migration")
            deploy_phase "phase2_migration_bridge" "${2:-true}"
            ;;
        "phase3"|"integration")
            deploy_phase "phase3_feature_integration" "${2:-true}"
            ;;
        "phase4"|"validation")
            deploy_phase "phase4_validation_monitoring" "${2:-true}"
            ;;
        "rollback")
            execute_rollback "${2:-manual rollback request}"
            ;;
        "health"|"status")
            deployment_health_check
            ;;
        "init")
            initialize_deployment
            ;;
        "help"|*)
            cat << 'EOF'
Living Blueprint Architecture Deployment Orchestrator

Usage: deploy-living-blueprint.sh <command> [options]

Commands:
  all                     Deploy all phases (full deployment)
  deploy                  Alias for 'all'
  phase1, foundation      Deploy Phase 1: Foundation infrastructure  
  phase2, migration       Deploy Phase 2: Migration bridge
  phase3, integration     Deploy Phase 3: Feature integration
  phase4, validation      Deploy Phase 4: Validation & monitoring
  rollback [reason]       Execute rollback of deployment actions
  health, status          Run deployment health check
  init                    Initialize deployment environment
  help                    Show this help

Deployment Phases:
  Phase 1: Foundation
    - ContextManager service initialization
    - Basic feature flag activation
    - Dual-stack context support
    - Enhanced backup capabilities

  Phase 2: Migration Bridge  
    - Legacy status file migration
    - Data preservation and validation
    - Migration feature activation

  Phase 3: Feature Integration
    - Full feature activation
    - Dependency management integration  
    - Dual-stack operation validation

  Phase 4: Validation & Monitoring
    - Comprehensive system validation
    - Final monitoring setup
    - Deployment completion verification

Options:
  [auto_rollback]         Enable/disable automatic rollback on failure (default: true)

Examples:
  ./deploy-living-blueprint.sh all
  ./deploy-living-blueprint.sh phase1
  ./deploy-living-blueprint.sh health
  ./deploy-living-blueprint.sh rollback "deployment test"

Logs: Check deployment progress at $DEPLOY_LOG

EOF
            ;;
    esac
}

# Execute if run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi