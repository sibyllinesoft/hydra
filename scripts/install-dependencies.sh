#!/bin/bash

#========================================================================
# Dependency Installation Script - Hybrid Living Blueprint Architecture
# 
# Ensures jq is available and replaces xmlstarlet requirement
# Includes validation checks and fallback strategies
#========================================================================

set -euo pipefail

# Script metadata
readonly SCRIPT_VERSION="1.0.0"
readonly SCRIPT_NAME="install-dependencies.sh"

# Logging function
log() {
    local level="$1"
    shift
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*" >&2
}

# Check if running with elevated privileges
check_privileges() {
    if [[ $EUID -eq 0 ]]; then
        log "WARNING" "Running as root - be cautious with system changes"
    fi
}

# Detect system package manager
detect_package_manager() {
    if command -v apt >/dev/null 2>&1; then
        echo "apt"
    elif command -v yum >/dev/null 2>&1; then
        echo "yum"
    elif command -v dnf >/dev/null 2>&1; then
        echo "dnf"
    elif command -v pacman >/dev/null 2>&1; then
        echo "pacman"
    elif command -v brew >/dev/null 2>&1; then
        echo "brew"
    elif command -v zypper >/dev/null 2>&1; then
        echo "zypper"
    else
        echo "unknown"
    fi
}

# Check if jq is available
check_jq_availability() {
    if command -v jq >/dev/null 2>&1; then
        local version
        version=$(jq --version 2>/dev/null || echo "unknown")
        log "INFO" "jq is available: $version"
        return 0
    else
        log "WARNING" "jq is not available - required for context management"
        return 1
    fi
}

# Install jq using system package manager
install_jq_system() {
    local pkg_manager
    pkg_manager=$(detect_package_manager)
    
    log "INFO" "Detected package manager: $pkg_manager"
    
    case "$pkg_manager" in
        "apt")
            log "INFO" "Installing jq via apt..."
            sudo apt update && sudo apt install -y jq
            ;;
        "yum")
            log "INFO" "Installing jq via yum..."
            sudo yum install -y jq
            ;;
        "dnf")
            log "INFO" "Installing jq via dnf..."
            sudo dnf install -y jq
            ;;
        "pacman")
            log "INFO" "Installing jq via pacman..."
            sudo pacman -Sy --noconfirm jq
            ;;
        "brew")
            log "INFO" "Installing jq via brew..."
            brew install jq
            ;;
        "zypper")
            log "INFO" "Installing jq via zypper..."
            sudo zypper install -y jq
            ;;
        *)
            log "ERROR" "Unsupported package manager: $pkg_manager"
            return 1
            ;;
    esac
    
    # Verify installation
    if check_jq_availability; then
        log "INFO" "jq installation successful"
        return 0
    else
        log "ERROR" "jq installation failed"
        return 1
    fi
}

# Install jq from binary (fallback)
install_jq_binary() {
    local arch
    local os
    local download_url
    local binary_path="/usr/local/bin/jq"
    
    log "INFO" "Attempting binary installation of jq..."
    
    # Detect architecture and OS
    arch=$(uname -m)
    os=$(uname -s | tr '[:upper:]' '[:lower:]')
    
    case "$arch" in
        "x86_64")
            arch="64"
            ;;
        "i386"|"i686")
            arch="32"
            ;;
        "aarch64"|"arm64")
            arch="64"
            ;;
        *)
            log "ERROR" "Unsupported architecture: $arch"
            return 1
            ;;
    esac
    
    case "$os" in
        "linux")
            download_url="https://github.com/jqlang/jq/releases/latest/download/jq-linux${arch}"
            ;;
        "darwin")
            download_url="https://github.com/jqlang/jq/releases/latest/download/jq-macos-amd64"
            ;;
        *)
            log "ERROR" "Unsupported operating system: $os"
            return 1
            ;;
    esac
    
    log "INFO" "Downloading jq from: $download_url"
    
    # Download with fallback to wget
    if command -v curl >/dev/null 2>&1; then
        sudo curl -L "$download_url" -o "$binary_path"
    elif command -v wget >/dev/null 2>&1; then
        sudo wget "$download_url" -O "$binary_path"
    else
        log "ERROR" "Neither curl nor wget available for download"
        return 1
    fi
    
    # Make executable
    sudo chmod +x "$binary_path"
    
    # Verify installation
    if check_jq_availability; then
        log "INFO" "jq binary installation successful"
        return 0
    else
        log "ERROR" "jq binary installation failed"
        return 1
    fi
}

# Check and install missing dependencies
install_dependencies() {
    log "INFO" "Checking and installing required dependencies..."
    
    local failed_deps=()
    
    # Check jq
    if ! check_jq_availability; then
        log "INFO" "Attempting to install jq..."
        
        if install_jq_system; then
            log "INFO" "jq installed successfully via system package manager"
        elif install_jq_binary; then
            log "INFO" "jq installed successfully via binary download"
        else
            log "ERROR" "Failed to install jq"
            failed_deps+=("jq")
        fi
    fi
    
    # Check other common dependencies
    local deps=("git" "bash" "mkdir" "cp" "mv" "rm")
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" >/dev/null 2>&1; then
            log "WARNING" "Missing dependency: $dep"
            failed_deps+=("$dep")
        else
            log "DEBUG" "Dependency available: $dep"
        fi
    done
    
    if [[ ${#failed_deps[@]} -eq 0 ]]; then
        log "INFO" "All dependencies are satisfied"
        return 0
    else
        log "ERROR" "Failed dependencies: ${failed_deps[*]}"
        return 1
    fi
}

# Test jq functionality
test_jq_functionality() {
    log "INFO" "Testing jq functionality..."
    
    local test_json='{"test": "value", "number": 42, "array": [1,2,3]}'
    
    # Test basic parsing
    if echo "$test_json" | jq empty >/dev/null 2>&1; then
        log "DEBUG" "jq basic parsing: OK"
    else
        log "ERROR" "jq basic parsing failed"
        return 1
    fi
    
    # Test query operations
    local result
    result=$(echo "$test_json" | jq -r '.test')
    if [[ "$result" == "value" ]]; then
        log "DEBUG" "jq query operations: OK"
    else
        log "ERROR" "jq query operations failed"
        return 1
    fi
    
    # Test modification operations
    result=$(echo "$test_json" | jq '.test = "modified"' | jq -r '.test')
    if [[ "$result" == "modified" ]]; then
        log "DEBUG" "jq modification operations: OK"
    else
        log "ERROR" "jq modification operations failed"
        return 1
    fi
    
    log "INFO" "jq functionality test passed"
    return 0
}

# Validate system compatibility
validate_system() {
    log "INFO" "Validating system compatibility..."
    
    # Check bash version
    if [[ ${BASH_VERSION%%.*} -lt 4 ]]; then
        log "WARNING" "Bash version ${BASH_VERSION} may not support all features"
    else
        log "DEBUG" "Bash version: ${BASH_VERSION} - OK"
    fi
    
    # Check available disk space (need at least 10MB)
    local available_space
    available_space=$(df . | awk 'NR==2 {print $4}')
    if [[ $available_space -lt 10240 ]]; then
        log "WARNING" "Low disk space: ${available_space}KB available"
    else
        log "DEBUG" "Disk space: ${available_space}KB - OK"
    fi
    
    # Check write permissions
    if [[ -w . ]]; then
        log "DEBUG" "Write permissions: OK"
    else
        log "WARNING" "No write permissions in current directory"
    fi
    
    log "INFO" "System compatibility validation completed"
    return 0
}

# Generate dependency installation script for manual execution
generate_install_script() {
    local script_path="./install-hydra-dependencies.sh"
    
    log "INFO" "Generating dependency installation script: $script_path"
    
    cat > "$script_path" << 'EOF'
#!/bin/bash
# Hydra Dependencies Installation Script
# Generated on: GENERATION_DATE
# Review this script before execution

set -euo pipefail

echo "🔍 Checking system requirements..."

# Detect package manager
if command -v apt >/dev/null 2>&1; then
    echo "📦 Installing dependencies via apt..."
    sudo apt update
    sudo apt install -y jq curl wget git
elif command -v yum >/dev/null 2>&1; then
    echo "📦 Installing dependencies via yum..."
    sudo yum install -y jq curl wget git
elif command -v dnf >/dev/null 2>&1; then
    echo "📦 Installing dependencies via dnf..."
    sudo dnf install -y jq curl wget git
elif command -v brew >/dev/null 2>&1; then
    echo "📦 Installing dependencies via brew..."
    brew install jq curl wget git
elif command -v pacman >/dev/null 2>&1; then
    echo "📦 Installing dependencies via pacman..."
    sudo pacman -Sy --noconfirm jq curl wget git
else
    echo "❌ Unsupported package manager"
    echo "Please install jq manually from: https://jqlang.github.io/jq/download/"
    exit 1
fi

echo "✅ Verifying installation..."
if command -v jq >/dev/null 2>&1; then
    echo "✅ jq version: $(jq --version)"
else
    echo "❌ jq installation failed"
    exit 1
fi

echo "🎉 Installation complete!"
EOF
    
    # Replace generation date
    sed -i "s/GENERATION_DATE/$(date -u +"%Y-%m-%d %H:%M:%S UTC")/g" "$script_path"
    
    chmod +x "$script_path"
    
    log "INFO" "Installation script generated: $script_path"
    echo ""
    echo "To execute the installation script manually:"
    echo "1. Review the script: cat $script_path"
    echo "2. Make it executable: chmod +x $script_path"
    echo "3. Run with: ./$script_path"
    echo ""
}

# Main execution function
main() {
    local command="${1:-install}"
    
    log "INFO" "Hydra Dependencies Manager v$SCRIPT_VERSION"
    
    check_privileges
    
    case "$command" in
        "install")
            validate_system
            install_dependencies
            test_jq_functionality
            ;;
        "check")
            validate_system
            check_jq_availability
            ;;
        "test")
            test_jq_functionality
            ;;
        "generate")
            generate_install_script
            ;;
        "help"|*)
            cat << 'EOF'
Hydra Dependencies Manager

Usage: install-dependencies.sh <command>

Commands:
  install     Check and install required dependencies (default)
  check       Check dependency availability without installing
  test        Test jq functionality
  generate    Generate installation script for manual execution
  help        Show this help

Dependencies:
  jq          JSON processor (required for context management)
  git         Version control (usually pre-installed)
  bash        Shell interpreter (usually pre-installed)
  curl/wget   Download utilities (for binary installation fallback)

EOF
            ;;
    esac
}

# Execute if run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi