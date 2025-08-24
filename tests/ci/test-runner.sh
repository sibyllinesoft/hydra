#!/bin/bash

##############################################################################
# Hydra CLI Test Runner Script
# Production-ready test execution with comprehensive validation and reporting
##############################################################################

set -euo pipefail

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TEST_DIR="${PROJECT_ROOT}/tests"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default configuration
DEFAULT_COVERAGE_THRESHOLD=95
DEFAULT_TIMEOUT=300000
DEFAULT_MAX_WORKERS="50%"
DEFAULT_TEST_TYPES="unit,integration,e2e,security"

# Parse command line arguments
COVERAGE_THRESHOLD=${COVERAGE_THRESHOLD:-$DEFAULT_COVERAGE_THRESHOLD}
TEST_TIMEOUT=${TEST_TIMEOUT:-$DEFAULT_TIMEOUT}
MAX_WORKERS=${MAX_WORKERS:-$DEFAULT_MAX_WORKERS}
TEST_TYPES=${TEST_TYPES:-$DEFAULT_TEST_TYPES}
VERBOSE=${VERBOSE:-false}
CI=${CI:-false}
FAIL_FAST=${FAIL_FAST:-false}
GENERATE_REPORT=${GENERATE_REPORT:-true}

usage() {
    cat << EOF
🧪 Hydra CLI Test Runner

Usage: $0 [OPTIONS] [TEST_PATTERN]

OPTIONS:
    -t, --type TYPE          Test types to run (unit,integration,e2e,security,stress)
    -c, --coverage NUM       Coverage threshold percentage (default: $DEFAULT_COVERAGE_THRESHOLD)
    -w, --workers NUM        Number of Jest workers (default: $DEFAULT_MAX_WORKERS)
    -T, --timeout MS         Test timeout in milliseconds (default: $DEFAULT_TIMEOUT)
    -v, --verbose            Enable verbose output
    -f, --fail-fast          Stop on first test failure
    -r, --no-report          Skip generating detailed reports
    -h, --help               Show this help message

EXAMPLES:
    $0                       # Run all test types with defaults
    $0 -t unit               # Run only unit tests
    $0 -t unit,integration   # Run unit and integration tests
    $0 --coverage 90         # Set coverage threshold to 90%
    $0 --verbose             # Run with verbose output
    $0 --fail-fast           # Stop on first failure
    $0 "commands/*.test.js"  # Run specific test pattern

ENVIRONMENT VARIABLES:
    COVERAGE_THRESHOLD       Coverage percentage threshold
    TEST_TIMEOUT            Test timeout in milliseconds
    MAX_WORKERS             Jest worker configuration
    TEST_TYPES              Comma-separated test types
    VERBOSE                 Enable verbose output (true/false)
    CI                      CI environment flag (true/false)
    FAIL_FAST               Stop on first failure (true/false)
    GENERATE_REPORT         Generate detailed reports (true/false)

EOF
}

log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "info")  echo -e "${BLUE}[INFO]${NC} ${timestamp} - $message" ;;
        "warn")  echo -e "${YELLOW}[WARN]${NC} ${timestamp} - $message" ;;
        "error") echo -e "${RED}[ERROR]${NC} ${timestamp} - $message" >&2 ;;
        "success") echo -e "${GREEN}[SUCCESS]${NC} ${timestamp} - $message" ;;
        "debug") [[ "$VERBOSE" == "true" ]] && echo -e "${PURPLE}[DEBUG]${NC} ${timestamp} - $message" ;;
    esac
}

check_prerequisites() {
    log "info" "🔍 Checking prerequisites..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log "error" "Node.js is not installed"
        exit 1
    fi
    
    local node_version=$(node -v | sed 's/v//')
    local min_version="18.0.0"
    if ! npx semver -r ">=$min_version" "$node_version" &> /dev/null; then
        log "error" "Node.js version $node_version is below minimum required version $min_version"
        exit 1
    fi
    
    # Check npm dependencies
    if [[ ! -d "${PROJECT_ROOT}/node_modules" ]]; then
        log "warn" "Node modules not found. Installing dependencies..."
        cd "$PROJECT_ROOT"
        npm ci
    fi
    
    # Check Jest installation
    if ! npx jest --version &> /dev/null; then
        log "error" "Jest is not properly installed"
        exit 1
    fi
    
    # Check system dependencies for E2E tests
    if [[ "$TEST_TYPES" =~ "e2e" ]]; then
        for cmd in xmlstarlet jq; do
            if ! command -v $cmd &> /dev/null; then
                log "warn" "System dependency '$cmd' not found. E2E tests may fail."
            fi
        done
    fi
    
    log "success" "Prerequisites check passed"
}

setup_test_environment() {
    log "info" "🔧 Setting up test environment..."
    
    # Create test directories
    mkdir -p "${TEST_DIR}/coverage/reports"
    mkdir -p "${TEST_DIR}/temp"
    mkdir -p "${TEST_DIR}/artifacts"
    
    # Set up test workspace
    local workspace="${TEST_DIR}/temp/workspace-$(date +%s)"
    mkdir -p "$workspace"
    export TEST_WORKSPACE="$workspace"
    
    # Configure Jest environment
    export NODE_ENV="test"
    export HYDRA_TEST_MODE="true"
    export JEST_WORKER_ID="${JEST_WORKER_ID:-1}"
    
    # Memory and performance settings
    if [[ "$TEST_TYPES" =~ "stress" ]]; then
        export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096}"
        ulimit -n 4096 2>/dev/null || log "warn" "Could not set file descriptor limit"
    fi
    
    log "debug" "Test workspace: $workspace"
    log "debug" "Node options: ${NODE_OPTIONS:-none}"
    log "success" "Test environment setup complete"
}

get_jest_config() {
    local test_type=$1
    local config_file="${TEST_DIR}/setup/jest.config.js"
    
    case $test_type in
        "unit")
            echo "--config=${config_file} --testPathPattern=tests/unit"
            ;;
        "integration")
            echo "--config=${config_file} --testPathPattern=tests/integration --runInBand"
            ;;
        "e2e")
            echo "--config=${config_file} --testPathPattern=tests/e2e --runInBand --testTimeout=60000"
            ;;
        "security")
            echo "--config=${config_file} --testPathPattern=tests/security --runInBand"
            ;;
        "stress")
            echo "--config=${config_file} --testPathPattern=tests/stress --runInBand --testTimeout=120000 --forceExit"
            ;;
        *)
            echo "--config=${config_file}"
            ;;
    esac
}

run_test_suite() {
    local test_type=$1
    local pattern=${2:-""}
    
    log "info" "🧪 Running $test_type tests..."
    
    local jest_config=$(get_jest_config "$test_type")
    local coverage_dir="${TEST_DIR}/coverage/reports/${test_type}"
    
    # Build Jest command
    local jest_cmd="npx jest"
    jest_cmd="$jest_cmd $jest_config"
    jest_cmd="$jest_cmd --coverage"
    jest_cmd="$jest_cmd --coverageDirectory=$coverage_dir"
    jest_cmd="$jest_cmd --maxWorkers=$MAX_WORKERS"
    jest_cmd="$jest_cmd --testTimeout=$TEST_TIMEOUT"
    jest_cmd="$jest_cmd --passWithNoTests"
    
    # Add CI-specific options
    if [[ "$CI" == "true" ]]; then
        jest_cmd="$jest_cmd --ci --watchman=false --detectOpenHandles"
    fi
    
    # Add verbose output if requested
    if [[ "$VERBOSE" == "true" ]]; then
        jest_cmd="$jest_cmd --verbose"
    fi
    
    # Add fail-fast if requested
    if [[ "$FAIL_FAST" == "true" ]]; then
        jest_cmd="$jest_cmd --bail"
    fi
    
    # Add test pattern if provided
    if [[ -n "$pattern" ]]; then
        jest_cmd="$jest_cmd $pattern"
    fi
    
    log "debug" "Jest command: $jest_cmd"
    
    # Execute tests with proper error handling
    local start_time=$(date +%s)
    local exit_code=0
    
    eval "$jest_cmd" || exit_code=$?
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [[ $exit_code -eq 0 ]]; then
        log "success" "$test_type tests completed successfully in ${duration}s"
    else
        log "error" "$test_type tests failed with exit code $exit_code after ${duration}s"
        
        # Archive test artifacts on failure
        if [[ "$GENERATE_REPORT" == "true" ]]; then
            local artifacts_dir="${TEST_DIR}/artifacts/${test_type}-failure-$(date +%s)"
            mkdir -p "$artifacts_dir"
            
            # Copy relevant logs and outputs
            [[ -d "$coverage_dir" ]] && cp -r "$coverage_dir" "$artifacts_dir/"
            [[ -d "$TEST_WORKSPACE" ]] && cp -r "$TEST_WORKSPACE" "$artifacts_dir/"
            
            log "info" "Test artifacts archived to: $artifacts_dir"
        fi
        
        return $exit_code
    fi
    
    return 0
}

merge_coverage_reports() {
    log "info" "📊 Merging coverage reports..."
    
    local coverage_base="${TEST_DIR}/coverage/reports"
    local merged_dir="${coverage_base}/merged"
    local temp_dir="${TEST_DIR}/temp/coverage-merge"
    
    mkdir -p "$merged_dir" "$temp_dir"
    
    # Find all coverage-final.json files
    local coverage_files=()
    while IFS= read -r -d '' file; do
        coverage_files+=("$file")
    done < <(find "$coverage_base" -name "coverage-final.json" -print0)
    
    if [[ ${#coverage_files[@]} -eq 0 ]]; then
        log "warn" "No coverage files found to merge"
        return 0
    fi
    
    log "debug" "Found ${#coverage_files[@]} coverage files to merge"
    
    # Copy coverage files to temp directory with unique names
    for i in "${!coverage_files[@]}"; do
        cp "${coverage_files[$i]}" "$temp_dir/coverage-$i.json"
    done
    
    # Merge coverage reports using nyc
    cd "$PROJECT_ROOT"
    npx nyc merge "$temp_dir" "$merged_dir/coverage-final.json"
    
    # Generate merged reports in multiple formats
    npx nyc report \
        --temp-dir="$temp_dir" \
        --reporter=lcov \
        --reporter=text \
        --reporter=html \
        --reporter=json-summary \
        --report-dir="$merged_dir"
    
    log "success" "Coverage reports merged successfully"
    
    # Extract coverage percentages for quality gates
    if [[ -f "$merged_dir/coverage-summary.json" ]]; then
        local lines_pct=$(jq -r '.total.lines.pct' "$merged_dir/coverage-summary.json")
        local functions_pct=$(jq -r '.total.functions.pct' "$merged_dir/coverage-summary.json")
        local branches_pct=$(jq -r '.total.branches.pct' "$merged_dir/coverage-summary.json")
        local statements_pct=$(jq -r '.total.statements.pct' "$merged_dir/coverage-summary.json")
        
        echo "COVERAGE_LINES=$lines_pct" > "${TEST_DIR}/coverage/reports/coverage-env.txt"
        echo "COVERAGE_FUNCTIONS=$functions_pct" >> "${TEST_DIR}/coverage/reports/coverage-env.txt"
        echo "COVERAGE_BRANCHES=$branches_pct" >> "${TEST_DIR}/coverage/reports/coverage-env.txt"
        echo "COVERAGE_STATEMENTS=$statements_pct" >> "${TEST_DIR}/coverage/reports/coverage-env.txt"
        
        log "info" "Coverage: Lines ${lines_pct}%, Functions ${functions_pct}%, Branches ${branches_pct}%, Statements ${statements_pct}%"
    fi
}

check_quality_gates() {
    log "info" "🚪 Checking quality gates..."
    
    local coverage_env="${TEST_DIR}/coverage/reports/coverage-env.txt"
    if [[ ! -f "$coverage_env" ]]; then
        log "error" "Coverage data not found. Cannot check quality gates."
        return 1
    fi
    
    # Source coverage data
    source "$coverage_env"
    
    local gates_passed=true
    local issues=()
    
    # Check coverage thresholds
    if (( $(echo "$COVERAGE_LINES < $COVERAGE_THRESHOLD" | bc -l) )); then
        gates_passed=false
        issues+=("Line coverage ${COVERAGE_LINES}% is below threshold ${COVERAGE_THRESHOLD}%")
    fi
    
    if (( $(echo "$COVERAGE_FUNCTIONS < $COVERAGE_THRESHOLD" | bc -l) )); then
        gates_passed=false
        issues+=("Function coverage ${COVERAGE_FUNCTIONS}% is below threshold ${COVERAGE_THRESHOLD}%")
    fi
    
    if (( $(echo "$COVERAGE_BRANCHES < 90" | bc -l) )); then
        gates_passed=false
        issues+=("Branch coverage ${COVERAGE_BRANCHES}% is below threshold 90%")
    fi
    
    if (( $(echo "$COVERAGE_STATEMENTS < $COVERAGE_THRESHOLD" | bc -l) )); then
        gates_passed=false
        issues+=("Statement coverage ${COVERAGE_STATEMENTS}% is below threshold ${COVERAGE_THRESHOLD}%")
    fi
    
    if [[ "$gates_passed" == "true" ]]; then
        log "success" "✅ All quality gates passed!"
        echo "QUALITY_GATES_PASSED=true" > "${TEST_DIR}/coverage/reports/quality-gates.txt"
        return 0
    else
        log "error" "❌ Quality gates failed:"
        for issue in "${issues[@]}"; do
            log "error" "   • $issue"
        done
        echo "QUALITY_GATES_PASSED=false" > "${TEST_DIR}/coverage/reports/quality-gates.txt"
        return 1
    fi
}

generate_summary_report() {
    if [[ "$GENERATE_REPORT" != "true" ]]; then
        return 0
    fi
    
    log "info" "📋 Generating summary report..."
    
    local report_file="${TEST_DIR}/coverage/reports/test-summary.md"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S UTC')
    
    cat > "$report_file" << EOF
# 🧪 Hydra CLI Test Suite Summary

**Generated:** $timestamp  
**Test Types:** $TEST_TYPES  
**Coverage Threshold:** ${COVERAGE_THRESHOLD}%  

## Test Results

EOF
    
    # Add individual test type results
    local types=(${TEST_TYPES//,/ })
    for test_type in "${types[@]}"; do
        local result_file="${TEST_DIR}/coverage/reports/${test_type}/test-results.txt"
        if [[ -f "$result_file" ]]; then
            echo "### $test_type Tests" >> "$report_file"
            cat "$result_file" >> "$report_file"
            echo "" >> "$report_file"
        fi
    done
    
    # Add coverage summary if available
    local coverage_env="${TEST_DIR}/coverage/reports/coverage-env.txt"
    if [[ -f "$coverage_env" ]]; then
        source "$coverage_env"
        cat >> "$report_file" << EOF
## Coverage Summary

| Metric | Coverage | Threshold | Status |
|--------|----------|-----------|--------|
| Lines | ${COVERAGE_LINES}% | ${COVERAGE_THRESHOLD}% | $(( $(echo "$COVERAGE_LINES >= $COVERAGE_THRESHOLD" | bc -l) )) && echo "✅" || echo "❌" ) |
| Functions | ${COVERAGE_FUNCTIONS}% | ${COVERAGE_THRESHOLD}% | $(( $(echo "$COVERAGE_FUNCTIONS >= $COVERAGE_THRESHOLD" | bc -l) )) && echo "✅" || echo "❌" ) |
| Branches | ${COVERAGE_BRANCHES}% | 90% | $(( $(echo "$COVERAGE_BRANCHES >= 90" | bc -l) )) && echo "✅" || echo "❌" ) |
| Statements | ${COVERAGE_STATEMENTS}% | ${COVERAGE_THRESHOLD}% | $(( $(echo "$COVERAGE_STATEMENTS >= $COVERAGE_THRESHOLD" | bc -l) )) && echo "✅" || echo "❌" ) |

EOF
    fi
    
    # Add quality gates status
    local quality_gates="${TEST_DIR}/coverage/reports/quality-gates.txt"
    if [[ -f "$quality_gates" ]]; then
        source "$quality_gates"
        echo "**Quality Gates:** $([ "$QUALITY_GATES_PASSED" = "true" ] && echo "✅ PASSED" || echo "❌ FAILED")" >> "$report_file"
    fi
    
    log "success" "Summary report generated: $report_file"
}

cleanup() {
    log "info" "🧹 Cleaning up test environment..."
    
    # Clean up temporary directories
    if [[ -n "${TEST_WORKSPACE:-}" && -d "$TEST_WORKSPACE" ]]; then
        rm -rf "$TEST_WORKSPACE"
    fi
    
    # Clean up old artifacts (keep last 5)
    local artifacts_dir="${TEST_DIR}/artifacts"
    if [[ -d "$artifacts_dir" ]]; then
        find "$artifacts_dir" -maxdepth 1 -type d -name "*-failure-*" | sort | head -n -5 | xargs rm -rf 2>/dev/null || true
    fi
    
    log "success" "Cleanup completed"
}

main() {
    local pattern=""
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -t|--type)
                TEST_TYPES="$2"
                shift 2
                ;;
            -c|--coverage)
                COVERAGE_THRESHOLD="$2"
                shift 2
                ;;
            -w|--workers)
                MAX_WORKERS="$2"
                shift 2
                ;;
            -T|--timeout)
                TEST_TIMEOUT="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -f|--fail-fast)
                FAIL_FAST=true
                shift
                ;;
            -r|--no-report)
                GENERATE_REPORT=false
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            -*)
                log "error" "Unknown option: $1"
                usage
                exit 1
                ;;
            *)
                pattern="$1"
                shift
                ;;
        esac
    done
    
    # Trap for cleanup
    trap cleanup EXIT
    
    log "info" "🚀 Starting Hydra CLI Test Suite"
    log "info" "Test types: $TEST_TYPES"
    log "info" "Coverage threshold: ${COVERAGE_THRESHOLD}%"
    log "info" "Max workers: $MAX_WORKERS"
    log "info" "Test timeout: ${TEST_TIMEOUT}ms"
    
    # Execute test pipeline
    check_prerequisites
    setup_test_environment
    
    local overall_exit_code=0
    local types=(${TEST_TYPES//,/ })
    
    # Run each test type
    for test_type in "${types[@]}"; do
        if ! run_test_suite "$test_type" "$pattern"; then
            overall_exit_code=1
            if [[ "$FAIL_FAST" == "true" ]]; then
                log "error" "Failing fast due to --fail-fast option"
                break
            fi
        fi
    done
    
    # Process results if any tests ran
    if [[ ${#types[@]} -gt 1 ]]; then
        merge_coverage_reports
        
        if ! check_quality_gates; then
            overall_exit_code=1
        fi
    fi
    
    generate_summary_report
    
    # Final result
    if [[ $overall_exit_code -eq 0 ]]; then
        log "success" "🎉 All tests completed successfully!"
    else
        log "error" "💥 Test suite completed with failures"
    fi
    
    exit $overall_exit_code
}

# Execute main function if script is called directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi