#!/usr/bin/env node


console.log("[HYDRA-INSTALLER] Starting Enhanced Hydra installation...");
console.log("[HYDRA-INSTALLER] Node version:", process.version);

import blessed from "blessed";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";
import archiver from "archiver";

const execAsync = promisify(exec);

class EnhancedHydraInstaller {
  constructor() {
    this.screen = null;
    this.headerBox = null;
    this.hydraArtBox = null;
    this.progressBox = null;
    this.statusBox = null;
    this.logBox = null;
    this.footerBox = null;
    
    this.logs = [];
    this.progress = 0;
    this.totalSteps = 9;
    this.currentStep = "";
    this.errors = [];
    this.warnings = [];
    this.animationFrame = 0;
    this.pulseState = 0;
    this.gradientOffset = 0;
    
    // Animation state
    this.isAnimating = true;
    this.animationInterval = null;
    this.pulseDirection = 1;

    // Installation paths
    this.homeDir = os.homedir();
    this.claudeDir = path.join(this.homeDir, ".claude");
    this.claudeConfigPath = path.join(this.homeDir, ".claude.json");
    this.backupPath = path.join(
      this.homeDir,
      `claude-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.zip`
    );

    this.initializeUI();
    this.startAnimations();
  }

  initializeUI() {
    // Create screen with enhanced options
    this.screen = blessed.screen({
      smartCSR: true,
      title: "🐲 Hydra Claude Studio - Professional AI Development Environment",
      dockBorders: true,
      fullUnicode: true,
      autoPadding: true,
      cursor: {
        artificial: true,
        shape: "line",
        blink: true,
        color: "green"
      }
    });

    // Header with animated title
    this.headerBox = blessed.box({
      top: 0,
      left: 0,
      width: "100%",
      height: 4,
      content: this.getAnimatedHeader(),
      tags: true,
      border: {
        type: "line",
        fg: "cyan"
      },
      style: {
        fg: "white",
        bg: "black",
        border: { fg: "cyan" }
      }
    });

    // Hydra ASCII Art Box
    this.hydraArtBox = blessed.box({
      top: 4,
      left: 0,
      width: "50%",
      height: 20,
      content: this.getHydraArt(),
      tags: true,
      border: {
        type: "line",
        fg: "green"
      },
      style: {
        fg: "green",
        bg: "black",
        border: { fg: "green" }
      },
      label: " 🐲 Hydra Guardian "
    });

    // Enhanced Progress Box
    this.progressBox = blessed.box({
      label: " ⚡ Installation Progress ",
      top: 4,
      left: "50%",
      width: "50%",
      height: 12,
      content: this.getEnhancedProgressContent(),
      tags: true,
      border: {
        type: "line",
        fg: "yellow"
      },
      style: {
        fg: "white",
        bg: "black",
        border: { fg: "yellow" }
      }
    });

    // Status box with animated spinner
    this.statusBox = blessed.box({
      label: " 🔄 Current Status ",
      top: 16,
      left: "50%",
      width: "50%",
      height: 8,
      content: this.getStatusContent(),
      tags: true,
      border: {
        type: "line",
        fg: "magenta"
      },
      style: {
        fg: "white",
        bg: "black",
        border: { fg: "magenta" }
      }
    });

    // Enhanced Log box
    this.logBox = blessed.log({
      label: " 📋 Installation Log ",
      top: 24,
      left: 0,
      width: "100%",
      height: "100%-27",
      scrollable: true,
      alwaysScroll: true,
      mouse: true,
      keys: true,
      tags: true,
      border: {
        type: "line",
        fg: "blue"
      },
      style: {
        fg: "white",
        bg: "black",
        border: { fg: "blue" }
      }
    });

    // Footer with animated instructions
    this.footerBox = blessed.box({
      bottom: 0,
      left: 0,
      width: "100%",
      height: 3,
      content: this.getAnimatedFooter(),
      tags: true,
      border: {
        type: "line",
        fg: "gray"
      },
      style: {
        fg: "gray",
        bg: "black",
        border: { fg: "gray" }
      }
    });

    // Append all boxes to screen
    this.screen.append(this.headerBox);
    this.screen.append(this.hydraArtBox);
    this.screen.append(this.progressBox);
    this.screen.append(this.statusBox);
    this.screen.append(this.logBox);
    this.screen.append(this.footerBox);

    // Key bindings
    this.screen.key(["escape", "q", "C-c"], () => {
      this.cleanup();
      return process.exit(0);
    });

    // Enable scrolling in log box
    this.logBox.focus();
    this.screen.render();
  }

  getAnimatedHeader() {
    const frames = [
      "═══════════════════════════════════════════════════════════════",
      "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓",
      "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░",
      "▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒"
    ];
    
    const frameIndex = Math.floor(this.animationFrame / 8) % frames.length;
    
    return `{center}{bold}{cyan-fg}
╔${frames[frameIndex]}╗
║                    🐲 HYDRA CLAUDE STUDIO 🐲                    ║
║              {magenta-fg}Professional AI Development Environment{/magenta-fg}              ║
╚${frames[frameIndex]}╝
{/cyan-fg}{/bold}{/center}`;
  }

  getHydraArt() {
    // Create animated hydra with pulsing eyes
    const eyeColors = ["red", "bright-red", "yellow"];
    const eyeColor = eyeColors[Math.floor(this.pulseState / 10) % eyeColors.length];
    
    const bodyColors = ["green", "bright-green"];
    const bodyColor = bodyColors[Math.floor(this.animationFrame / 15) % bodyColors.length];
    
    return `{center}{${bodyColor}-fg}
                    ╭─────╮
                ╭───┤  {${eyeColor}-fg}●{/${eyeColor}-fg}  {${eyeColor}-fg}●{/${eyeColor}-fg}  ├───╮
            ╭───┴─┐ ╰─────╯ ┌─┴───╮
        ╭───┤  {${eyeColor}-fg}●{/${eyeColor}-fg}  {${eyeColor}-fg}●{/${eyeColor}-fg}  ├─╮     ╭─┤  {${eyeColor}-fg}●{/${eyeColor}-fg}  {${eyeColor}-fg}●{/${eyeColor}-fg}  ├───╮
    ╭───┴─┐ ╰─────╯ ┌┴─╮ ╭─┴┐ ╰─────╯ ┌─┴───╮
╭───┤  {${eyeColor}-fg}●{/${eyeColor}-fg}  {${eyeColor}-fg}●{/${eyeColor}-fg}  ├─╮     ╭┴───┴─┤  {${eyeColor}-fg}●{/${eyeColor}-fg}  {${eyeColor}-fg}●{/${eyeColor}-fg}  ├─┴───╮
│   ╰─────╯ ┌┴─╮ ╭─┴┐     ╰─────╯ ┌─┴───╮ │
╰─┐         ┌┴───┴─┐                     ┌─┴─╯
  │         │ HYDRA │                     │
  ╰─────────┴───────┴─────────────────────╯
        ╰─┐                         ┌─╯
          ╰─┐                     ┌─╯
            ╰─┐                 ┌─╯
              ╰─┐             ┌─╯
                ╰─┐         ┌─╯
                  ╰─┐     ┌─╯
                    ╰─┐ ┌─╯
                      ╰─╯
{/${bodyColor}-fg}{/center}`;
  }

  getEnhancedProgressContent() {
    const percentage = Math.round((this.progress / this.totalSteps) * 100);
    const filledBars = Math.round((this.progress / this.totalSteps) * 40);
    const emptyBars = 40 - filledBars;

    // Create gradient effect
    const gradientChars = ["█", "▉", "▊", "▋", "▌", "▍", "▎", "▏"];
    const progressBar = "█".repeat(filledBars) + "░".repeat(emptyBars);
    
    // Animated percentage
    const percentageAnimation = this.animationFrame % 20 < 10 ? percentage : `{bold}${percentage}{/bold}`;

    return `
{center}{bold}Step ${this.progress}/${this.totalSteps} ({green-fg}${percentageAnimation}%{/green-fg}){/bold}{/center}

{center}{green-fg}${progressBar}{/green-fg}{/center}

{center}╭─────────────────────────────────────────╮{/center}
{center}│ {yellow-fg}⚡ HYDRA INSTALLATION PROGRESS ⚡{/yellow-fg} │{/center}
{center}╰─────────────────────────────────────────╯{/center}

{bold}Current Phase:{/bold} ${this.currentStep}

{bold}Statistics:{/bold}
• {green-fg}✓ Completed:{/green-fg} ${this.progress}
• {red-fg}✗ Errors:{/red-fg} ${this.errors.length}
• {yellow-fg}⚠ Warnings:{/yellow-fg} ${this.warnings.length}`;
  }

  getStatusContent() {
    const spinners = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    const spinner = spinners[this.animationFrame % spinners.length];
    
    const gradientColors = ["cyan", "blue", "magenta", "red", "yellow", "green"];
    const colorIndex = Math.floor(this.animationFrame / 5) % gradientColors.length;
    const currentColor = gradientColors[colorIndex];

    return `
{center}{${currentColor}-fg}${spinner}{/${currentColor}-fg} {bold}${this.currentStep || "Initializing..."}{/bold}{/center}

{center}╭─────────────────────────────────╮{/center}
{center}│ {white-fg}Status: {bold}ACTIVE{/bold}{/white-fg}          │{/center}
{center}│ {green-fg}Health: {bold}OPERATIONAL{/bold}{/green-fg}     │{/center}
{center}│ {yellow-fg}Mode: {bold}INSTALLATION{/bold}{/yellow-fg}      │{/center}
{center}╰─────────────────────────────────╯{/center}`;
  }

  getAnimatedFooter() {
    const pulseChar = this.pulseState < 15 ? "●" : "○";
    
    return `{center}
╭─────────────────────────────────────────────────────────────────╮
│ {red-fg}${pulseChar}{/red-fg} Press {bold}Ctrl+C{/bold} to exit │ {green-fg}${pulseChar}{/green-f} Use mouse or arrow keys to scroll logs │
╰─────────────────────────────────────────────────────────────────╯
{/center}`;
  }

  startAnimations() {
    this.animationInterval = setInterval(() => {
      this.animationFrame++;
      this.pulseState += this.pulseDirection;
      
      if (this.pulseState >= 30) {
        this.pulseDirection = -1;
      } else if (this.pulseState <= 0) {
        this.pulseDirection = 1;
      }
      
      this.gradientOffset = (this.gradientOffset + 1) % 360;
      
      if (this.isAnimating) {
        this.updateAnimatedElements();
      }
    }, 150);
  }

  updateAnimatedElements() {
    if (this.headerBox) {
      this.headerBox.setContent(this.getAnimatedHeader());
    }
    if (this.hydraArtBox) {
      this.hydraArtBox.setContent(this.getHydraArt());
    }
    if (this.statusBox) {
      this.statusBox.setContent(this.getStatusContent());
    }
    if (this.footerBox) {
      this.footerBox.setContent(this.getAnimatedFooter());
    }
    if (this.screen) {
      this.screen.render();
    }
  }

  log(message, type = "info") {
    const timestamp = new Date().toLocaleTimeString();
    let styledMessage = "";
    
    const typeIcons = {
      info: "ℹ",
      success: "✓",
      warning: "⚠",
      error: "✗",
      step: "➤",
      debug: "🔧"
    };

    const typeColors = {
      info: "cyan",
      success: "green",
      warning: "yellow",
      error: "red",
      step: "magenta",
      debug: "blue"
    };

    const icon = typeIcons[type] || "•";
    const color = typeColors[type] || "white";

    switch (type) {
      case "info":
        styledMessage = `{${color}-fg}[${timestamp}] ${icon}{/${color}-fg} ${message}`;
        break;
      case "success":
        styledMessage = `{${color}-fg}[${timestamp}] ${icon}{/${color}-fg} {bold}${message}{/bold}`;
        break;
      case "warning":
        styledMessage = `{${color}-fg}[${timestamp}] ${icon}{/${color}-fg} ${message}`;
        this.warnings.push(message);
        break;
      case "error":
        styledMessage = `{${color}-fg}[${timestamp}] ${icon}{/${color}-fg} {bold}${message}{/bold}`;
        this.errors.push(message);
        break;
      case "step":
        styledMessage = `{bold}{${color}-fg}[${timestamp}] ${icon}{/${color}-fg}{/bold} {bold}${message}{/bold}`;
        break;
      case "debug":
        styledMessage = `{${color}-fg}[${timestamp}] ${icon}{/${color}-fg} {dim}${message}{/dim}`;
        break;
    }

    this.logs.push(styledMessage);
    this.logBox.add(styledMessage);
    this.screen.render();
  }

  updateStatus(status) {
    this.currentStep = status;
    this.statusBox.setContent(this.getStatusContent());
    this.screen.render();
  }

  updateProgress() {
    this.progress++;
    this.progressBox.setContent(this.getEnhancedProgressContent());
    this.screen.render();
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Add progress feedback for file operations
  async copyFileWithProgress(src, dest, fileName) {
    try {
      await fs.copy(src, dest, { overwrite: true });
      this.log(`📁 ${fileName}`, "debug");
      return true;
    } catch (error) {
      this.log(`Failed to copy ${fileName}: ${error.message}`, "error");
      return false;
    }
  }

  async checkPrerequisites() {
    this.log("🔍 Checking system prerequisites...", "step");
    this.updateStatus("Checking prerequisites");

    try {
      // Check Node.js version
      const nodeVersion = process.version;
      this.log(`Node.js version: ${nodeVersion}`, "info");

      if (!this.isNodeVersionSupported(nodeVersion)) {
        throw new Error(
          `Node.js ${nodeVersion} is not supported. Please upgrade to Node.js 16+`
        );
      }

      // Check system info
      this.log(`Platform: ${os.platform()} ${os.arch()}`, "info");
      this.log(`Home directory: ${this.homeDir}`, "info");

      // Check xmlstarlet dependency
      await this.checkXmlstarlet();

      // Check if Claude config directory exists
      const claudeDir = path.dirname(this.claudeConfigPath);
      if (!(await fs.pathExists(claudeDir))) {
        this.log(`Creating Claude config directory: ${claudeDir}`, "info");
        await fs.ensureDir(claudeDir);
      }

      this.log("Prerequisites check completed successfully", "success");
      await this.sleep(800);
      this.updateProgress();
    } catch (error) {
      this.log(`Prerequisites check failed: ${error.message}`, "error");
      throw error;
    }
  }

  isNodeVersionSupported(version) {
    const major = parseInt(version.slice(1).split(".")[0]);
    return major >= 16;
  }

  async checkXmlstarlet() {
    this.log("Checking xmlstarlet dependency...", "info");

    try {
      // Check if xmlstarlet is installed
      await execAsync('which xmlstarlet', { encoding: 'utf8' });
      this.log("✓ xmlstarlet is installed and available", "success");
    } catch (error) {
      this.log("xmlstarlet not found - required for Living Blueprint system", "warning");
      
      const platform = os.platform();
      const instructions = this.getXmlstarletInstallInstructions(platform);
      
      this.log("", "info");
      this.log("📦 xmlstarlet Installation Instructions:", "info");
      this.log("", "info");
      instructions.forEach(instruction => {
        this.log(`  ${instruction}`, "info");
      });
      this.log("", "info");
      this.log("⚠️  Please install xmlstarlet and run the installer again", "warning");
      this.log("", "info");
      
      throw new Error("xmlstarlet dependency missing - installation required");
    }
  }

  getXmlstarletInstallInstructions(platform) {
    switch (platform) {
      case 'darwin': // macOS
        return [
          "🍺 macOS (Homebrew):",
          "   brew install xmlstarlet",
          "",
          "🔄 Alternative (MacPorts):",
          "   sudo port install xmlstarlet"
        ];
      
      case 'linux':
        const distroInstructions = [
          "🐧 Ubuntu/Debian:",
          "   sudo apt-get update",
          "   sudo apt-get install xmlstarlet",
          "",
          "🎩 RHEL/CentOS/Fedora:",
          "   sudo yum install xmlstarlet",
          "   # or on newer systems:",
          "   sudo dnf install xmlstarlet",
          "",
          "📦 Arch Linux:",
          "   sudo pacman -S xmlstarlet",
          "",
          "🗂️ Alpine Linux:",
          "   sudo apk add xmlstarlet"
        ];
        return distroInstructions;
      
      case 'win32': // Windows
        return [
          "🪟 Windows:",
          "   # Via Chocolatey:",
          "   choco install xmlstarlet",
          "",
          "   # Via Scoop:",
          "   scoop install xmlstarlet",
          "",
          "   # Manual installation:",
          "   Download from: http://xmlstar.sourceforge.net/download.php",
          "   Extract and add to PATH"
        ];
      
      default:
        return [
          `🔧 ${platform}:`,
          "   Please install xmlstarlet using your system's package manager",
          "   or download from: http://xmlstar.sourceforge.net/download.php",
          "",
          "   Verify installation with: xmlstarlet --version"
        ];
    }
  }

  async backupExistingConfig() {
    this.log("📦 Creating zipped backup of existing configuration...", "step");
    this.updateStatus("Creating backup archive");

    try {
      const hasConfig = await fs.pathExists(this.claudeConfigPath);
      const hasClaudeDir = await fs.pathExists(this.claudeDir);

      if (!hasConfig && !hasClaudeDir) {
        this.log("No existing configuration found to backup", "info");
        await this.sleep(500);
        this.updateProgress();
        return;
      }

      // Create zip archive with progress indication
      this.log("Archiving existing configuration...", "info");
      const archive = archiver("zip", { zlib: { level: 9 } });
      const output = fs.createWriteStream(this.backupPath);

      await new Promise((resolve, reject) => {
        output.on("close", resolve);
        archive.on("error", reject);
        
        // Add progress tracking
        archive.on("progress", (progress) => {
          this.log(`Backup progress: ${Math.round((progress.entries.processed / progress.entries.total) * 100)}%`, "debug");
        });

        archive.pipe(output);

        // Add .claude.json if it exists
        if (hasConfig) {
          archive.file(this.claudeConfigPath, { name: ".claude.json" });
          this.log("Added .claude.json to backup", "info");
        }

        // Add .claude directory if it exists
        if (hasClaudeDir) {
          archive.directory(this.claudeDir, ".claude");
          this.log("Added .claude directory to backup", "info");
        }

        archive.finalize();
      });

      const stats = await fs.stat(this.backupPath);
      const sizeKB = Math.round(stats.size / 1024);
      this.log(
        `Backup created: ${path.basename(this.backupPath)} (${sizeKB}KB)`,
        "success"
      );

      await this.sleep(500);
      this.updateProgress();
    } catch (error) {
      this.log(`Backup failed: ${error.message}`, "warning");
      // Don't throw - backup failure shouldn't stop installation
      await this.sleep(500);
      this.updateProgress();
    }
  }

  async downloadAndInstallHydraFiles() {
    this.log("🌐 Downloading and installing Hydra files...", "step");
    this.updateStatus("Cloning Hydra repository");

    try {
      const tempDir = path.join(os.tmpdir(), "hydra-install-" + Date.now());
      const claudeDir = path.join(this.homeDir, ".claude");

      // Clone the repository with progress feedback
      this.log("Cloning Hydra repository from GitHub...", "info");
      this.updateStatus("Downloading from GitHub...");
      
      await execAsync(
        `git clone --progress --depth 1 https://github.com/sibyllinesoft/hydra.git "${tempDir}"`
      );
      this.log("Repository clone completed", "success");

      // Ensure .claude directory exists
      await fs.ensureDir(claudeDir);

      // Copy all files except .git, node_modules, and package files with progress
      this.log("Installing Hydra files to ~/.claude/...", "info");
      this.updateStatus("Installing files...");

      const filesToSkip = [
        ".git",
        "node_modules", 
        "package.json",
        "package-lock.json",
        "install.js",
        "install-enhanced.js"
      ];
      
      let totalFiles = 0;
      let processedFiles = 0;

      // First pass: count total files
      const countFiles = async (dir) => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (filesToSkip.includes(entry.name)) continue;
          
          if (entry.isDirectory()) {
            await countFiles(path.join(dir, entry.name));
          } else {
            totalFiles++;
          }
        }
      };
      
      await countFiles(tempDir);
      this.log(`Found ${totalFiles} files to install`, "info");

      // Second pass: copy files with progress
      const copyFileRecursively = async (src, dest) => {
        const entries = await fs.readdir(src, { withFileTypes: true });

        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);

          if (filesToSkip.includes(entry.name)) {
            this.log(`Skipping ${entry.name}`, "debug");
            continue;
          }

          if (entry.isDirectory()) {
            await fs.ensureDir(destPath);
            await copyFileRecursively(srcPath, destPath);
          } else {
            // Always overwrite existing files to ensure complete updates
            await this.copyFileWithProgress(srcPath, destPath, entry.name);
            processedFiles++;
            
            // Update progress every 10 files
            if (processedFiles % 10 === 0) {
              const progress = Math.round((processedFiles / totalFiles) * 100);
              this.updateStatus(`Installing files... ${progress}%`);
            }
          }
        }
      };

      await copyFileRecursively(tempDir, claudeDir);

      // Clean up temp directory
      this.log("Cleaning up temporary files...", "info");
      await fs.remove(tempDir);

      this.log(`All ${processedFiles} Hydra files installed successfully`, "success");
      await this.sleep(800);
      this.updateProgress();
    } catch (error) {
      this.log(`Failed to install Hydra files: ${error.message}`, "error");
      throw new Error(`Installation failed: ${error.message}`);
    }
  }

  async parseExistingConfig() {
    this.log("⚙️ Parsing existing Claude configuration...", "step");
    this.updateStatus("Analyzing current config");

    try {
      let existingConfig = {};

      if (await fs.pathExists(this.claudeConfigPath)) {
        this.log("Found existing configuration file", "info");
        const configContent = await fs.readFile(this.claudeConfigPath, "utf8");
        try {
          existingConfig = JSON.parse(configContent);
          this.log("Existing configuration parsed successfully", "success");
        } catch (parseError) {
          this.log(
            `Invalid JSON in existing config, starting fresh: ${parseError.message}`,
            "warning"
          );
          existingConfig = {};
        }
      } else {
        this.log("No existing configuration found, creating new", "info");
      }

      await this.sleep(500);
      this.updateProgress();
      return existingConfig;
    } catch (error) {
      this.log(`Configuration parsing failed: ${error.message}`, "error");
      throw error;
    }
  }

  getHydraMCPServers() {
    return {
      git: {
        command: "uvx",
        args: ["mcp-git"],
        disabled: false,
      },
      serena: {
        command: "uvx",
        args: ["mcp-serena"],
        disabled: false,
      },
      "sequential-thinking": {
        command: "uvx",
        args: ["mcp-sequential-thinking"],
        disabled: false,
      },
      context7: {
        command: "uvx",
        args: ["mcp-context7"],
        disabled: false,
      },
      playwright: {
        command: "uvx",
        args: ["mcp-playwright"],
        disabled: false,
      },
      "vibe-kanban": {
        command: "uvx",
        args: ["mcp-vibe-kanban"],
        disabled: false,
      },
      ide: {
        command: "uvx",
        args: ["mcp-ide"],
        disabled: false,
      },
    };
  }

  async updateMCPConfiguration(existingConfig) {
    this.log("🔗 Updating MCP server configuration...", "step");
    this.updateStatus("Configuring MCP servers");

    try {
      // Ensure mcpServers exists
      if (!existingConfig.mcpServers) {
        existingConfig.mcpServers = {};
        this.log("Created new mcpServers configuration section", "info");
      }

      const hydraMCPs = this.getHydraMCPServers();
      let addedCount = 0;
      let skippedCount = 0;

      // Add each Hydra MCP server if not already present
      for (const [name, config] of Object.entries(hydraMCPs)) {
        if (existingConfig.mcpServers[name]) {
          this.log(`MCP server '${name}' already configured, skipping`, "info");
          skippedCount++;
        } else {
          existingConfig.mcpServers[name] = config;
          this.log(`Added MCP server: ${name}`, "success");
          addedCount++;
        }
        await this.sleep(100); // Small delay for visual effect
      }

      this.log(
        `MCP configuration complete: ${addedCount} added, ${skippedCount} skipped`,
        "success"
      );
      await this.sleep(500);
      this.updateProgress();

      return existingConfig;
    } catch (error) {
      this.log(`MCP configuration failed: ${error.message}`, "error");
      throw error;
    }
  }

  async validateConfiguration(config) {
    this.log("✅ Validating final configuration...", "step");
    this.updateStatus("Validating configuration");

    try {
      // Validate JSON structure
      if (!config || typeof config !== "object") {
        throw new Error("Configuration must be a valid object");
      }

      // Validate MCP servers
      if (config.mcpServers) {
        const serverNames = Object.keys(config.mcpServers);
        this.log(`Validating ${serverNames.length} MCP servers...`, "info");
        
        for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
          if (!serverConfig.command) {
            throw new Error(
              `MCP server '${name}' missing required 'command' field`
            );
          }
          if (!Array.isArray(serverConfig.args)) {
            throw new Error(
              `MCP server '${name}' must have 'args' as an array`
            );
          }
          this.log(`✓ MCP server '${name}' validation passed`, "debug");
        }
      }

      // Test JSON serialization
      JSON.stringify(config);

      this.log("Configuration validation passed", "success");
      await this.sleep(500);
      this.updateProgress();

      return true;
    } catch (error) {
      this.log(`Configuration validation failed: ${error.message}`, "error");
      throw error;
    }
  }

  async writeConfiguration(config) {
    this.log("💾 Writing configuration to disk...", "step");
    this.updateStatus("Writing configuration");

    try {
      const configJSON = JSON.stringify(config, null, 2);
      await fs.writeFile(this.claudeConfigPath, configJSON, "utf8");

      this.log(
        `Configuration written successfully to: ${this.claudeConfigPath}`,
        "success"
      );
      await this.sleep(500);
      this.updateProgress();
    } catch (error) {
      this.log(`Failed to write configuration: ${error.message}`, "error");
      throw error;
    }
  }

  async installExtras() {
    this.log("🔧 Installing extra tools...", "step");
    this.updateStatus("Installing extras");

    try {
      const extrasDir = path.join(this.homeDir, ".claude", "extras");
      await fs.ensureDir(extrasDir);

      const extras = [
        {
          name: "claude-statusline",
          repo: "https://github.com/ersinkoc/claude-statusline.git",
          dir: "statusline",
        },
        {
          name: "claude-code-docs", 
          repo: "https://github.com/ericbuess/claude-code-docs.git",
          dir: "docs",
        },
        {
          name: "claude-code-project-index",
          repo: "https://github.com/ericbuess/claude-code-project-index.git",
          dir: "project-index",
        },
      ];

      for (const [index, extra] of extras.entries()) {
        try {
          const targetDir = path.join(extrasDir, extra.dir);
          this.updateStatus(`Installing ${extra.name}... (${index + 1}/${extras.length})`);

          if (await fs.pathExists(targetDir)) {
            this.log(`${extra.name} already installed, skipping`, "info");
            continue;
          }

          this.log(`Installing ${extra.name}...`, "info");
          await execAsync(`git clone --depth 1 "${extra.repo}" "${targetDir}"`);
          this.log(`✓ ${extra.name} installed`, "success");
        } catch (error) {
          this.log(
            `Warning: Failed to install ${extra.name}: ${error.message}`,
            "warning"
          );
          this.warnings.push(`${extra.name} installation failed`);
        }
        await this.sleep(200);
      }

      this.log("Extra tools installation completed", "success");
      await this.sleep(500);
      this.updateProgress();
    } catch (error) {
      this.log(`Extras installation failed: ${error.message}`, "warning");
      this.warnings.push("Some extra tools may not have installed correctly");
      await this.sleep(500);
      this.updateProgress();
    }
  }

  async verifyInstallation() {
    this.log("🔍 Verifying installation...", "step");
    this.updateStatus("Verifying installation");

    try {
      // Check if config file exists and is readable
      if (!(await fs.pathExists(this.claudeConfigPath))) {
        throw new Error("Configuration file was not created");
      }

      // Verify file is valid JSON
      const configContent = await fs.readFile(this.claudeConfigPath, "utf8");
      const parsedConfig = JSON.parse(configContent);

      // Check Hydra MCP servers are present
      const hydraMCPs = Object.keys(this.getHydraMCPServers());
      const installedMCPs = Object.keys(parsedConfig.mcpServers || {});

      let verifiedCount = 0;
      for (const mcpName of hydraMCPs) {
        if (installedMCPs.includes(mcpName)) {
          verifiedCount++;
          this.log(`✓ Verified MCP server: ${mcpName}`, "debug");
        }
      }

      this.log(
        `Verification complete: ${verifiedCount}/${hydraMCPs.length} Hydra MCP servers found`,
        "success"
      );
      await this.sleep(800);
      this.updateProgress();

      return verifiedCount === hydraMCPs.length;
    } catch (error) {
      this.log(`Installation verification failed: ${error.message}`, "error");
      throw error;
    }
  }

  showCompletionSummary(startTime) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    this.updateStatus("Installation Complete! 🎉");

    this.log("", "info");
    this.log("╔═══════════════════════════════════════════════════════════╗", "success");
    this.log("║                 🎉 INSTALLATION COMPLETE! 🎉               ║", "success");
    this.log("║                                                           ║", "success");
    this.log("║              🐲 HYDRA CLAUDE STUDIO 🐲                    ║", "success");
    this.log("║           Professional AI Development Environment          ║", "success");
    this.log("╚═══════════════════════════════════════════════════════════╝", "success");
    this.log("", "info");
    this.log(`⚡ Installation completed in ${duration} seconds`, "success");
    this.log(`📁 Configuration saved to: ${this.claudeConfigPath}`, "success");

    if (this.errors.length === 0) {
      this.log("✅ No errors encountered during installation", "success");
    } else {
      this.log(
        `⚠️  ${this.errors.length} errors encountered (see log above)`,
        "warning"
      );
    }

    if (this.warnings.length > 0) {
      this.log(
        `⚠️  ${this.warnings.length} warnings (see log above)`,
        "warning"
      );
    }

    this.log("", "info");
    this.log("🚀 Next Steps:", "info");
    this.log("  1. Restart Claude Code to load new MCP servers", "info");
    this.log("  2. Verify MCP servers are working in Claude", "info");
    this.log("  3. Check the Hydra documentation for usage guides", "info");
    this.log("  4. Explore the agent ecosystem in ~/.claude/agents/", "info");
    this.log("", "info");
    this.log("💡 Tips:", "info");
    this.log("  • Use 'claude --help' to see all available commands", "info");
    this.log("  • Check ~/.claude/CLAUDE.md for configuration details", "info");
    this.log("", "info");
    this.log("Press Ctrl+C to exit", "info");
  }

  async cleanup() {
    this.isAnimating = false;
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    if (this.screen) {
      this.screen.destroy();
    }
  }

  async run() {
    const startTime = Date.now();

    try {
      this.log("🚀 Starting Hydra Claude Code Studio installation...", "info");
      this.log("", "info");

      await this.checkPrerequisites();
      await this.backupExistingConfig();
      await this.downloadAndInstallHydraFiles();
      
      const existingConfig = await this.parseExistingConfig();
      const updatedConfig = await this.updateMCPConfiguration(existingConfig);
      
      await this.validateConfiguration(updatedConfig);
      await this.writeConfiguration(updatedConfig);
      await this.installExtras();
      await this.verifyInstallation();

      this.showCompletionSummary(startTime);
    } catch (error) {
      this.log("", "error");
      this.log("╔═══════════════════════════════════════════════════════════╗", "error");
      this.log("║                  ❌ INSTALLATION FAILED ❌                  ║", "error");
      this.log("╚═══════════════════════════════════════════════════════════╝", "error");
      this.log("", "error");
      this.log(`💥 Fatal error: ${error.message}`, "error");
      this.log("", "error");
      this.log("🔧 Troubleshooting:", "error");
      this.log("  • Check your internet connection", "error");
      this.log("  • Ensure Git is installed and accessible", "error");
      this.log("  • Verify you have write permissions to ~/.claude/", "error");
      this.log("  • Try running with elevated permissions if needed", "error");
      this.log("", "error");
      this.log("📞 Need help? Report this issue at:", "error");
      this.log("  https://github.com/sibyllinesoft/hydra/issues", "error");
      this.log("", "error");
      this.log("Press Ctrl+C to exit", "error");
      this.updateStatus("Installation Failed ❌");
    }
  }
}

export async function main() {
  console.log("[HYDRA-INSTALLER] Running enhanced main function...");
  const installer = new EnhancedHydraInstaller();
  await installer.run().catch((error) => {
    // Ensure UI is cleaned up on error
    installer.cleanup();
    console.error("[HYDRA-INSTALLER] Fatal error during run:", error);
    process.exit(1);
  });
}

// Handle unhandled promise rejections gracefully
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

export default EnhancedHydraInstaller;