#!/usr/bin/env node

// Demo script showcasing the enhanced Hydra installer features
// This demonstrates all the visual and animation capabilities

import blessed from "blessed";
import { ASCIIArtLibrary } from "./ascii-art-library.js";

class EnhancedInstallerDemo {
  constructor() {
    this.screen = null;
    this.demoBoxes = {};
    this.animationFrame = 0;
    this.currentDemo = 0;
    this.demos = [
      "hydra_variations",
      "animations", 
      "progress_bars",
      "color_gradients",
      "spinners",
      "borders"
    ];
    
    this.initializeUI();
    this.startDemo();
  }

  initializeUI() {
    // Create main screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: "🐲 Enhanced Hydra Installer - Feature Showcase",
      dockBorders: true,
      fullUnicode: true,
      autoPadding: true
    });

    // Main title
    this.demoBoxes.title = blessed.box({
      top: 0,
      left: 0,
      width: "100%",
      height: 4,
      content: this.getTitleContent(),
      tags: true,
      border: { type: "line", fg: "cyan" },
      style: { fg: "white", bg: "black", border: { fg: "cyan" } }
    });

    // Demo content area
    this.demoBoxes.content = blessed.box({
      top: 4,
      left: 0,
      width: "70%",
      height: "100%-8",
      content: "",
      tags: true,
      border: { type: "line", fg: "green" },
      style: { fg: "white", bg: "black", border: { fg: "green" } },
      label: " 🎬 Feature Demo ",
      scrollable: true,
      alwaysScroll: true,
      mouse: true,
      keys: true
    });

    // Controls sidebar
    this.demoBoxes.controls = blessed.box({
      top: 4,
      left: "70%",
      width: "30%",
      height: "100%-8",
      content: this.getControlsContent(),
      tags: true,
      border: { type: "line", fg: "yellow" },
      style: { fg: "white", bg: "black", border: { fg: "yellow" } },
      label: " 🎮 Controls "
    });

    // Footer
    this.demoBoxes.footer = blessed.box({
      bottom: 0,
      left: 0,
      width: "100%",
      height: 4,
      content: this.getFooterContent(),
      tags: true,
      border: { type: "line", fg: "magenta" },
      style: { fg: "white", bg: "black", border: { fg: "magenta" } }
    });

    // Append all to screen
    Object.values(this.demoBoxes).forEach(box => this.screen.append(box));

    // Key bindings
    this.screen.key(["escape", "q", "C-c"], () => {
      this.cleanup();
      process.exit(0);
    });

    this.screen.key(["right", "space"], () => {
      this.nextDemo();
    });

    this.screen.key(["left"], () => {
      this.prevDemo();
    });

    this.screen.key(["r"], () => {
      this.restartDemo();
    });

    this.screen.render();
  }

  getTitleContent() {
    const title = ASCIIArtLibrary.createGradientText("HYDRA ENHANCED INSTALLER", "cyberpunk", this.animationFrame);
    return `{center}{bold}
╔═══════════════════════════════════════════════════════════════╗
║                  🐲 FEATURE SHOWCASE 🐲                      ║
║              ${title}              ║
╚═══════════════════════════════════════════════════════════════╝
{/bold}{/center}`;
  }

  getControlsContent() {
    const currentDemoName = this.demos[this.currentDemo].replace('_', ' ').toUpperCase();
    
    return `
{center}{bold}Current Demo{/bold}{/center}
{center}{yellow-fg}${currentDemoName}{/yellow-fg}{/center}
{center}(${this.currentDemo + 1}/${this.demos.length}){/center}

{bold}Controls:{/bold}
• {green-fg}→ / Space{/green-fg} - Next demo
• {green-fg}← {/green-fg} - Previous demo
• {green-fg}R{/green-fg} - Restart current demo
• {green-fg}Q / Esc{/green-fg} - Exit

{bold}Features:{/bold}
• {cyan-fg}✓{/cyan-fg} Multi-headed Hydra ASCII
• {cyan-fg}✓{/cyan-fg} Pulsing eye animations
• {cyan-fg}✓{/cyan-fg} Color gradients
• {cyan-fg}✓{/cyan-fg} Unicode box-drawing
• {cyan-fg}✓{/cyan-fg} Loading spinners
• {cyan-fg}✓{/cyan-f} Progress bars
• {cyan-fg}✓{/cyan-fg} Cyberpunk styling

{bold}Performance:{/bold}
• {green-fg}Fixed{/green-fg} 11% lag issue
• {green-fg}Optimized{/green-fg} file operations
• {green-fg}Real-time{/green-fg} progress
• {green-fg}Smooth{/green-fg} animations
`;
  }

  getFooterContent() {
    return `{center}
╭─────────────────────────────────────────────────────────────────╮
│ 🎨 Showcasing modern terminal UI with blessed.js and ASCII art │
│ 🚀 Enhanced installer eliminates lag and adds visual appeal    │
╰─────────────────────────────────────────────────────────────────╯
{/center}`;
  }

  getDemoContent() {
    const demoName = this.demos[this.currentDemo];
    
    switch (demoName) {
      case "hydra_variations":
        return this.getHydraVariationsDemo();
      case "animations":
        return this.getAnimationsDemo();
      case "progress_bars":
        return this.getProgressBarsDemo();
      case "color_gradients":
        return this.getColorGradientsDemo();
      case "spinners":
        return this.getSpinnersDemo();
      case "borders":
        return this.getBordersDemo();
      default:
        return "Demo not found";
    }
  }

  getHydraVariationsDemo() {
    const variations = ASCIIArtLibrary.getHydraVariations();
    const currentVariation = variations[Math.floor(this.animationFrame / 20) % variations.length];
    
    const eyeColors = ["red", "bright-red", "yellow"];
    const bodyColors = ["green", "bright-green"];
    
    const eyeColor = eyeColors[Math.floor(this.animationFrame / 10) % eyeColors.length];
    const bodyColor = bodyColors[Math.floor(this.animationFrame / 15) % bodyColors.length];
    
    return `{center}{bold}🐲 HYDRA ASCII ART VARIATIONS 🐲{/bold}{/center}

Current Style: {yellow-fg}${currentVariation.name.toUpperCase()}{/yellow-fg}

${currentVariation.art(eyeColor, bodyColor)}

{center}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/center}

Features demonstrated:
• {green-fg}✓{/green-fg} Multiple ASCII art styles (Classic, Serpent, Cyberpunk)
• {green-fg}✓{/green-fg} Animated pulsing eyes (red → bright-red → yellow)
• {green-fg}✓{/green-fg} Color-changing body (green variations)
• {green-fg}✓{/green-fg} Organic, flowing shapes instead of boxy layouts
• {green-fg}✓{/green-fg} Unicode box-drawing characters for elegance

The enhanced installer cycles through these variations to create
a living, breathing hydra that watches over your installation!`;
  }

  getAnimationsDemo() {
    const pulse = Math.sin((this.animationFrame / 10) * Math.PI * 2);
    const intensity = Math.floor((pulse + 1) * 15);
    
    const spinners = ASCIIArtLibrary.getSpinnerStyles();
    const spinner = spinners.classic[this.animationFrame % spinners.classic.length];
    const cyberSpinner = spinners.cyber[Math.floor(this.animationFrame / 2) % spinners.cyber.length];
    const pulseSpinner = spinners.pulse[Math.floor(this.animationFrame / 3) % spinners.pulse.length];
    
    return `{center}{bold}⚡ ANIMATION SYSTEM ⚡{/bold}{/center}

{bold}Pulsing Effect:{/bold}
${ASCIIArtLibrary.createPulsingElement("●", intensity)} Intensity: ${intensity}/30

{bold}Loading Spinners:{/bold}
Classic: {cyan-fg}${spinner}{/cyan-fg}  Cyber: {magenta-fg}${cyberSpinner}{/magenta-fg}  Pulse: {yellow-fg}${pulseSpinner}{/yellow-fg}

{bold}Gradient Text:{/bold}
${ASCIIArtLibrary.createGradientText("HYDRA INSTALLATION", "cyberpunk", this.animationFrame)}
${ASCIIArtLibrary.createGradientText("CLAUDE CODE STUDIO", "matrix", this.animationFrame + 5)}
${ASCIIArtLibrary.createGradientText("PROFESSIONAL AI DEVELOPMENT", "fire", this.animationFrame + 10)}

{center}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/center}

Animation Features:
• {green-fg}✓{/green-fg} Smooth 6.67 FPS animations (150ms intervals)
• {green-fg}✓{/green-fg} Sine wave pulsing for organic feel
• {green-fg}✓{/green-fg} Multiple spinner styles for different contexts
• {green-fg}✓{/green-fg} Gradient text with flowing color transitions
• {green-fg}✓{/green-fg} Performance optimized to prevent lag`;
  }

  getProgressBarsDemo() {
    const progressStyles = ASCIIArtLibrary.getProgressBarStyles();
    const progress = (this.animationFrame % 40) / 40;
    
    const createProgressBar = (chars, width = 30) => {
      const filled = Math.floor(progress * width);
      const empty = width - filled;
      return chars[0].repeat(filled) + chars[chars.length - 1].repeat(empty);
    };

    return `{center}{bold}📊 PROGRESS INDICATORS 📊{/bold}{/center}

{bold}Current Progress: {green-fg}${Math.round(progress * 100)}%{/green-fg}{/bold}

{bold}Block Style:{/bold}
{green-fg}${createProgressBar(progressStyles.blocks)}{/green-fg}

{bold}Shade Style:{/bold}
{cyan-fg}${createProgressBar(progressStyles.shades)}{/cyan-fg}

{bold}Cyberpunk Style:{/bold}
{magenta-fg}${createProgressBar(progressStyles.cyber)}{/magenta-fg}

{bold}Enhanced Installer Progress:{/bold}
╭─────────────────────────────────────────╮
│ Step 3/9 ({green-fg}${Math.round(progress * 100)}%{/green-fg})                        │
│ {green-fg}${createProgressBar(["█", "░"])}{/green-fg} │
│                                         │
│ {bold}Current:{/bold} Installing Hydra files...    │
│ • {green-fg}✓{/green-fg} Downloaded: 127 files          │
│ • {yellow-fg}⚡{/yellow-fg} Processing: config.json       │
│ • {red-fg}✗{/red-f} Errors: 0                     │
╰─────────────────────────────────────────╯

{center}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/center}

Progress Features:
• {green-fg}✓{/green-fg} File-level progress tracking (fixes 11% lag)
• {green-fg}✓{/green-fg} Multiple visual styles for different contexts
• {green-fg}✓{/green-fg} Real-time percentage updates
• {green-fg}✓{/green-fg} Unicode block characters for smooth appearance
• {green-fg}✓{/green-fg} Color-coded status indicators`;
  }

  getColorGradientsDemo() {
    const palettes = ASCIIArtLibrary.getGradientColors();
    
    return `{center}{bold}🌈 COLOR GRADIENTS 🌈{/bold}{/center}

{bold}Cyberpunk Palette:{/bold}
${ASCIIArtLibrary.createGradientText("▓▒░ NEON DREAMS ░▒▓", "cyberpunk", this.animationFrame)}

{bold}Matrix Palette:{/bold}
${ASCIIArtLibrary.createGradientText("▲▼▲ DIGITAL RAIN ▲▼▲", "matrix", this.animationFrame)}

{bold}Fire Palette:{/bold}
${ASCIIArtLibrary.createGradientText("🔥 BLAZING FAST 🔥", "fire", this.animationFrame)}

{bold}Ocean Palette:{/bold}
${ASCIIArtLibrary.createGradientText("〜 FLOWING WAVES 〜", "ocean", this.animationFrame)}

{bold}Neon Palette:{/bold}
${ASCIIArtLibrary.createGradientText("✧ ELECTRIC VIBES ✧", "neon", this.animationFrame)}

{center}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/center}

{bold}Available Colors:{/bold}
• {red-fg}red{/red-fg} / {bright-red-fg}bright-red{/bright-red-fg}
• {green-fg}green{/green-fg} / {bright-green-fg}bright-green{/bright-green-fg}
• {blue-fg}blue{/blue-fg} / {bright-blue-fg}bright-blue{/bright-blue-fg}
• {yellow-fg}yellow{/yellow-fg} / {bright-yellow-fg}bright-yellow{/bright-yellow-fg}
• {magenta-fg}magenta{/magenta-fg} / {bright-magenta-fg}bright-magenta{/bright-magenta-fg}
• {cyan-fg}cyan{/cyan-fg} / {bright-cyan-fg}bright-cyan{/bright-cyan-fg}
• {white-fg}white{/white-fg} / {gray-fg}gray{/gray-fg}

Gradient Features:
• {green-fg}✓{/green-fg} Flowing color transitions
• {green-fg}✓{/green-fg} Multiple themed palettes
• {green-fg}✓{/green-fg} Frame-based animation offset
• {green-fg}✓{/green-fg} Terminal color fallbacks`;
  }

  getSpinnersDemo() {
    const spinners = ASCIIArtLibrary.getSpinnerStyles();
    
    const getSpinner = (style) => {
      const chars = spinners[style];
      return chars[this.animationFrame % chars.length];
    };

    return `{center}{bold}🔄 LOADING SPINNERS 🔄{/bold}{/center}

{bold}Spinner Styles:{/bold}

Classic: {cyan-fg}${getSpinner('classic')}{/cyan-fg}  Snake: {green-fg}${getSpinner('snake')}{/green-fg}  Pulse: {yellow-fg}${getSpinner('pulse')}{/yellow-fg}

Cyber: {magenta-fg}${getSpinner('cyber')}{/magenta-fg}  Matrix: {bright-green-fg}${getSpinner('matrix')}{/bright-green-fg}  Hydra: {red-fg}${getSpinner('hydra')}{/red-fg}

{bold}In Action:{/bold}
{cyan-fg}${getSpinner('classic')}{/cyan-fg} Checking prerequisites...
{green-fg}${getSpinner('snake')}{/green-fg} Downloading repository...
{yellow-fg}${getSpinner('pulse')}{/yellow-fg} Installing files...
{magenta-fg}${getSpinner('cyber')}{/magenta-fg} Configuring MCP servers...
{bright-green-fg}${getSpinner('matrix')}{/bright-green-fg} Validating installation...
{red-fg}${getSpinner('hydra')}{/red-fg} Finalizing setup...

{center}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/center}

{bold}Spinner Sequences:{/bold}
Classic: ⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏
Dots: ⠁ ⠂ ⠄ ⡀ ⢀ ⠠ ⠐ ⠈
Pulse: ○ ◔ ◐ ◕ ● ◕ ◐ ◔

Spinner Features:
• {green-fg}✓{/green-fg} Context-appropriate styles
• {green-fg}✓{/green-fg} Smooth animation loops
• {green-fg}✓{/green-fg} Unicode and ASCII fallbacks
• {green-fg}✓{/green-fg} Themed to match installation phases`;
  }

  getBordersDemo() {
    const border = ASCIIArtLibrary.createAnimatedBorder(50, 8, this.animationFrame);
    
    return `{center}{bold}🎨 BORDER PATTERNS 🎨{/bold}{/center}

{bold}Animated Border:{/bold}
${border}

{bold}Border Styles:{/bold}

{bold}Double Line:{/bold}  ╔═════════╗  {bold}Single Line:{/bold}  ┌─────────┐
             ║  Content ║              │ Content │
             ╚═════════╝              └─────────┘

{bold}Rounded:{/bold}      ╭─────────╮  {bold}Heavy Line:{/bold}   ┏━━━━━━━━━┓
             │ Content │              ┃ Content ┃
             ╰─────────╯              ┗━━━━━━━━━┛

{center}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/center}

{bold}Unicode Box-Drawing Characters:{/bold}
• Corners: ╔ ╗ ╚ ╝ ┌ ┐ └ ┘ ╭ ╮ ╰ ╯
• Lines: ═ ║ ─ │ ━ ┃
• Junctions: ╬ ┼ ╩ ┴ ╦ ┬ ╣ ┤ ╠ ├

Border Features:
• {green-fg}✓{/green-fg} Organic flowing effects
• {green-fg}✓{/green-fg} Multiple geometric styles
• {green-fg}✓{/green-fg} Animated flowing characters
• {green-fg}✓{/green-fg} Unicode fallback support`;
  }

  nextDemo() {
    this.currentDemo = (this.currentDemo + 1) % this.demos.length;
    this.updateDisplay();
  }

  prevDemo() {
    this.currentDemo = (this.currentDemo - 1 + this.demos.length) % this.demos.length;
    this.updateDisplay();
  }

  restartDemo() {
    this.animationFrame = 0;
    this.updateDisplay();
  }

  updateDisplay() {
    this.demoBoxes.title.setContent(this.getTitleContent());
    this.demoBoxes.content.setContent(this.getDemoContent());
    this.demoBoxes.controls.setContent(this.getControlsContent());
    this.screen.render();
  }

  startDemo() {
    setInterval(() => {
      this.animationFrame++;
      this.updateDisplay();
    }, 150);
  }

  cleanup() {
    if (this.screen) {
      this.screen.destroy();
    }
  }
}

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("🎬 Starting Enhanced Hydra Installer Feature Demo...");
  console.log("Use arrow keys to navigate, Q to quit.\n");
  
  const demo = new EnhancedInstallerDemo();
  
  // Handle cleanup on exit
  process.on('SIGINT', () => {
    demo.cleanup();
    process.exit(0);
  });
}

export default EnhancedInstallerDemo;