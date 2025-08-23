#!/usr/bin/env node

import blessed from 'blessed';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnhancedHydraPreview {
  constructor() {
    this.hydraArt = '';
    this.titleArt = '';
    this.screen = null;
    this.hydraBox = null;
    this.overlayBox = null;
    this.statusBox = null;
    this.headerBox = null;
    this.shimmerFrame = 0;
    this.eyePulseFrame = 0;
    this.waveFrame = 0;
    this.animationInterval = null;
    this.isAnimating = true;
    
    // Enhanced color palettes
    this.greenShimmers = [
      '#00ff00', '#00ff33', '#00ff66', '#00ff99', 
      '#00ffcc', '#00ffff', '#00ccff', '#0099ff',
      '#0066ff', '#0033ff', '#0000ff', '#3300ff',
      '#6600ff', '#9900ff', '#cc00ff', '#ff00ff',
      '#ff00cc', '#ff0099', '#ff0066', '#ff0033',
      '#ff0000', '#ff3300', '#ff6600', '#ff9900',
      '#ffcc00', '#ffff00', '#ccff00', '#99ff00',
      '#66ff00', '#33ff00'
    ];
    
    this.redPulses = [
      '#ff0000', '#ff3333', '#ff6666', '#ff9999',
      '#ffcccc', '#ffffff', '#ffcccc', '#ff9999',
      '#ff6666', '#ff3333', '#ff0000', '#cc0000',
      '#990000', '#660000', '#330000', '#000000'
    ];

    // Title colors - bright greens
    this.titleColors = [
      '#00ff00', '#00ff33', '#33ff00', '#00ff66',
      '#66ff00', '#00ff99', '#99ff00', '#00ffcc'
    ];
    
    // Body colors - darker greens
    this.bodyColors = [
      '#003300', '#004400', '#005500', '#006600',
      '#007700', '#008800', '#009900', '#00aa00'
    ];
  }

  async loadHydraArt() {
    try {
      const hydraPath = path.join(__dirname, 'hydra.txt');
      this.hydraArt = fs.readFileSync(hydraPath, 'utf8');
      
      const titlePath = path.join(__dirname, 'hydra.txt');
      this.titleArt = fs.readFileSync(titlePath, 'utf8');
      
      // Calculate hydra dimensions for centering
      this.calculateHydraDimensions();
      
      return true;
    } catch (error) {
      console.error('Error loading hydra files:', error.message);
      return false;
    }
  }

  calculateHydraDimensions() {
    const hydraLines = this.hydraArt.split('\n');
    const titleLines = this.titleArt.split('\n');
    
    // Find the maximum width of both title and hydra art
    const hydraWidth = Math.max(...hydraLines.map(line => {
      const cleanLine = line.replace(/^\s*\d+→/, '');
      return cleanLine.length;
    }));
    
    const titleWidth = Math.max(...titleLines.map(line => {
      const cleanLine = line.replace(/^\s*\d+→/, '');
      return cleanLine.length;
    }));
    
    this.hydraWidth = Math.max(hydraWidth, titleWidth);
    this.hydraHeight = hydraLines.length;
    this.titleHeight = titleLines.length;
  }

  centerHydraContent(content) {
    if (!this.screen) return content;
    
    const terminalWidth = this.screen.width;
    const availableWidth = terminalWidth - 4; // Account for borders and padding
    
    // Handle narrow terminals gracefully
    if (availableWidth < this.hydraWidth) {
      // For very narrow terminals, don't add padding
      return content;
    }
    
    // Calculate horizontal padding for centering
    const leftPadding = Math.max(0, Math.floor((availableWidth - this.hydraWidth) / 2));
    
    const lines = content.split('\n');
    const centeredLines = lines.map(line => {
      // Don't add padding to empty lines
      if (line.trim() === '') return line;
      
      // Create padding string
      const padding = ' '.repeat(leftPadding);
      return padding + line;
    });
    
    return centeredLines.join('\n');
  }

  setupScreen() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Hydra Interface Preview - Enhanced',
      cursor: {
        artificial: true,
        shape: 'block',
        blink: true,
        color: '#00ff00'
      },
      debug: false,
      warnings: false,
      fullUnicode: true
    });

    // Header box
    this.headerBox = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: 3,
      content: this.getHeaderContent(),
      tags: true,
      style: {
        fg: '#00ff00',
        bg: 'black'
      },
      border: {
        type: 'line',
        fg: '#00ff00'
      }
    });

    // Main hydra display box
    this.hydraBox = blessed.box({
      top: 3,
      left: 0,
      width: '100%',
      height: '95%',
      content: '',
      tags: true,
      border: {
        type: 'line',
        fg: '#00ff00'
      },
      style: {
        fg: '#00ff00',
        bg: 'black',
        border: {
          fg: '#00ff00'
        }
      },
      scrollable: true,
      alwaysScroll: true,
      mouse: true
    });

    // Floating translucent overlay box - centered horizontally with reduced opacity
    this.overlayBox = blessed.box({
      top: '70%',
      left: 'center',
      width: '84%',
      height: '28%',
      style: {
        bg: 'black',
        fg: '#00ff00',
        transparent: true,
        opacity: 0.6  // Reduced opacity for more transparency
      },
      border: {
        type: 'double',
        fg: '#00ff00'
      },
      tags: true,
      shadow: true
    });

    // Status and interface elements - fixed positioning
    this.statusBox = blessed.box({
      parent: this.overlayBox,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      content: this.getInterfaceContent(),
      tags: true,
      style: {
        fg: '#00ff00',
        bg: 'transparent'
      }
    });

    this.screen.append(this.headerBox);
    this.screen.append(this.hydraBox);
    this.screen.append(this.overlayBox);

    // Enhanced key bindings
    this.screen.key(['escape', 'q', 'C-c'], () => {
      this.cleanup();
      process.exit(0);
    });

    this.screen.key(['r'], () => {
      this.resetAnimation();
    });

    this.screen.key(['space'], () => {
      this.toggleAnimation();
    });

    this.screen.key(['1', '2', '3', '4', '5'], (ch) => {
      this.changeEffect(parseInt(ch));
    });

    this.screen.key(['f'], () => {
      this.toggleFullscreen();
    });

    // Handle terminal resize events for dynamic centering
    this.screen.on('resize', () => {
      // Recalculate and re-render with updated centering
      setTimeout(() => {
        const shimmeredContent = this.applyEnhancedShimmerEffect(this.hydraArt);
        this.hydraBox.setContent(shimmeredContent);
        this.updateOverlayPosition();
        this.headerBox.setContent(this.getHeaderContent());
        this.statusBox.setContent(this.getInterfaceContent());
        this.screen.render();
      }, 100); // Small delay to ensure resize is complete
    });
  }

  getHeaderContent() {
    const timestamp = new Date().toLocaleTimeString();
    return `{center}{bold}{#00ff00-fg}HYDRA CLAUDE CODE STUDIO - ENHANCED PREVIEW{/} {right}{#666666-fg}${timestamp}{/}`;
  }

  getInterfaceContent() {
    const animationStatus = this.isAnimating ? '{#00ff00-fg}ACTIVE{/}' : '{#ff0000-fg}PAUSED{/}';
    const terminalWidth = this.screen ? this.screen.width : 80;
    const availableWidth = terminalWidth - 4;
    const isNarrow = availableWidth < this.hydraWidth;
    const centeringStatus = isNarrow ? '{#ff6600-fg}NARROW{/}' : '{#00ff00-fg}CENTERED{/}';
    
    return `
{center}{bold}{#00ff00-fg}╔══════════════════════════════════════════════════════════════════════════════╗{/}
{center}{bold}{#00ff00-fg}║                            HYDRA CONTROL INTERFACE                           ║{/}
{center}{bold}{#00ff00-fg}╠══════════════════════════════════════════════════════════════════════════════╣{/}
{center}{#00aa00-fg}║  Animation: ${animationStatus}  Centering: ${centeringStatus}  Terminal: {#666666-fg}${terminalWidth}x{#666666-fg}                    {#00aa00-fg}║{/}
{center}{#00aa00-fg}║  Shimmer: {#00ff00-fg}${this.shimmerFrame.toString().padStart(3, '0')}{/}     Eye Pulse: {#ff0000-fg}${this.eyePulseFrame.toString().padStart(3, '0')}{/}     Wave: {#00ffff-fg}${this.waveFrame.toString().padStart(3, '0')}{/}                 {#00aa00-fg}║{/}
{center}{#00aa00-fg}║  Effects: {#00ff00-fg}MULTI-LAYER SHIMMER + PULSING EYES + WAVE{/}                      {#00aa00-fg}║{/}
{center}{bold}{#00ff00-fg}╠══════════════════════════════════════════════════════════════════════════════╣{/}
{center}{#00aa00-fg}║  {#ffff00-fg}[SPACE]{/} {#00aa00-fg}Play/Pause  {#ffff00-fg}[R]{/} {#00aa00-fg}Reset  {#ffff00-fg}[1-5]{/} {#00aa00-fg}Speed Mode  {#ffff00-fg}[F]{/} {#00aa00-fg}Fullscreen  {#ffff00-fg}[Q/ESC]{/} {#00aa00-fg}Quit  ║{/}
{center}{#00aa00-fg}║  Speed Modes: {#666666-fg}1=Very Slow  2=Medium  3=Wave Only  4=Eyes Only  5=Full{/}     {#00aa00-fg}║{/}
{center}{#00aa00-fg}║  {#666666-fg}Ready to install Hydra Claude Code Studio with enhanced features{/}            {#00aa00-fg}║{/}
{center}{bold}{#00ff00-fg}╚══════════════════════════════════════════════════════════════════════════════╝{/}`;
  }

  applyEnhancedShimmerEffect(content) {
    // Process hydra with darker green colors first
    const hydraLines = content.split('\n');
    const processedHydraLines = hydraLines.map((line, lineIndex) => {
      const cleanLine = line.replace(/^\s*\d+→/, '');
      return this.enhancedShimmerLine(cleanLine, lineIndex + this.titleHeight + 1);
    });

    // Process title with bright green colors and position above hydra head
    const titleLines = this.titleArt.split('\n');
    const processedTitleLines = titleLines.map((line, lineIndex) => {
      const cleanLine = line.replace(/^\s*\d+→/, '');
      return this.enhancedShimmerTitleLine(cleanLine, lineIndex);
    });
    
    // Position title to float above hydra head (insert at top of hydra)
    const combinedContent = [
      ...processedTitleLines,
      '', // Single line separator for visual overlap
      ...processedHydraLines
    ].join('\n');
    
    return this.centerHydraContent(combinedContent);
  }

  enhancedShimmerTitleLine(line, lineIndex) {
    let shimmerLine = line;
    
    // Calculate wave offset for this line
    const waveOffset = Math.sin((lineIndex + this.waveFrame) * 0.15) * 2;
    // Reverse the shimmer direction for RIGHT-TO-LEFT effect
    const lineShimmerOffset = Math.floor(waveOffset - this.shimmerFrame); // Subtract instead of add
    
    // Enhanced shimmer for title characters with bright greens - right to left
    const titleChars = ['█', '▓', '▒', '░'];
    titleChars.forEach((char, charIndex) => {
      // Calculate right-to-left shimmer index
      const rightToLeftIndex = (this.titleColors.length - 1 - lineShimmerOffset - charIndex * 5) % this.titleColors.length;
      const shimmerIndex = rightToLeftIndex < 0 ? this.titleColors.length + rightToLeftIndex : rightToLeftIndex;
      const color = this.titleColors[shimmerIndex];
      shimmerLine = shimmerLine.replace(new RegExp(`\\${char}`, 'g'), `{${color}-fg}${char}{/}`);
    });

    return shimmerLine;
  }
  
  enhancedShimmerLine(line, lineIndex) {
    let shimmerLine = line;
    
    // Calculate wave offset for this line
    const waveOffset = Math.sin((lineIndex + this.waveFrame) * 0.2) * 3;
    const lineShimmerOffset = Math.floor(waveOffset + this.shimmerFrame);
    
    // Enhanced shimmer for body characters with darker greens
    const bodyChars = ['█', '▓', '▒', '░'];
    bodyChars.forEach((char, charIndex) => {
      const shimmerIndex = (lineShimmerOffset + charIndex * 7) % this.bodyColors.length;
      const color = this.bodyColors[shimmerIndex];
      shimmerLine = shimmerLine.replace(new RegExp(`\\${char}`, 'g'), `{${color}-fg}${char}{/}`);
    });

    // Special eye detection and pulsing - look for specific patterns
    if (line.includes('██▒') || line.includes('▒██') || 
        (line.includes('██') && (line.includes('░░░██') || line.includes('██░░░')))) {
      
      const eyeColorIndex = this.eyePulseFrame % this.redPulses.length;
      const eyeColor = this.redPulses[eyeColorIndex];
      
      // Apply red pulsing to potential eye areas
      shimmerLine = shimmerLine.replace(/(██▒)/g, `{${eyeColor}-fg}$1{/}`);
      shimmerLine = shimmerLine.replace(/(▒██)/g, `{${eyeColor}-fg}$1{/}`);
      shimmerLine = shimmerLine.replace(/(███)/g, `{${eyeColor}-fg}$1{/}`);
    }

    // Add special effects for certain patterns
    if (line.includes('████████████') && lineIndex > 10 && lineIndex < 40) {
      // Main body area - add extra shimmer intensity
      const intensity = Math.sin(this.shimmerFrame * 0.3) * 2 + 3;
      const intensityColor = this.bodyColors[Math.floor(intensity) % this.bodyColors.length];
      shimmerLine = shimmerLine.replace(/████████████/g, `{${intensityColor}-fg}████████████{/}`);
    }

    return shimmerLine;
  }

  updateOverlayPosition() {
    if (!this.screen || !this.overlayBox) return;
    
    // Keep overlay centered horizontally regardless of hydra position
    // This ensures it's always centered on screen
    this.overlayBox.left = 'center';
    this.overlayBox.width = '84%';
    this.overlayBox.top = '70%';  // Ensure consistent positioning
  }

  startAnimation() {
    this.animationInterval = setInterval(() => {
      this.shimmerFrame = (this.shimmerFrame + 1) % this.bodyColors.length;
      this.eyePulseFrame = (this.eyePulseFrame + 1) % this.redPulses.length;
      this.waveFrame = (this.waveFrame + 1) % 360;
      
      const shimmeredContent = this.applyEnhancedShimmerEffect(this.hydraArt);
      this.hydraBox.setContent(shimmeredContent);
      
      // Update overlay position in case terminal was resized
      this.updateOverlayPosition();
      
      // Update all interface elements
      this.headerBox.setContent(this.getHeaderContent());
      this.statusBox.setContent(this.getInterfaceContent());
      
      this.screen.render();
    }, 600); // Slower, more pleasant animation speed
  }

  stopAnimation() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  }

  toggleAnimation() {
    this.isAnimating = !this.isAnimating;
    if (this.isAnimating) {
      this.startAnimation();
    } else {
      this.stopAnimation();
    }
  }

  resetAnimation() {
    this.shimmerFrame = 0;
    this.eyePulseFrame = 0;
    this.waveFrame = 0;
    this.updateOverlayPosition();
    this.updateDisplay();
  }

  changeEffect(effectNumber) {
    // Different effect modes
    switch(effectNumber) {
      case 1: // Very slow shimmer
        this.stopAnimation();
        this.animationInterval = setInterval(() => this.animationStep(), 1000);
        break;
      case 2: // Medium shimmer
        this.stopAnimation();
        this.animationInterval = setInterval(() => this.animationStep(), 500);
        break;
      case 3: // Wave effect only
        this.stopAnimation();
        this.animationInterval = setInterval(() => {
          this.waveFrame = (this.waveFrame + 2) % 360;
          this.updateDisplay();
        }, 400);
        break;
      case 4: // Eyes only
        this.stopAnimation();
        this.animationInterval = setInterval(() => {
          this.eyePulseFrame = (this.eyePulseFrame + 1) % this.redPulses.length;
          this.updateDisplay();
        }, 800);
        break;
      case 5: // Full effect
        this.stopAnimation();
        this.startAnimation();
        break;
    }
  }

  animationStep() {
    this.shimmerFrame = (this.shimmerFrame + 1) % this.bodyColors.length;
    this.eyePulseFrame = (this.eyePulseFrame + 1) % this.redPulses.length;
    this.waveFrame = (this.waveFrame + 1) % 360;
    this.updateDisplay();
  }

  updateDisplay() {
    const shimmeredContent = this.applyEnhancedShimmerEffect(this.hydraArt);
    this.hydraBox.setContent(shimmeredContent);
    this.updateOverlayPosition();
    this.headerBox.setContent(this.getHeaderContent());
    this.statusBox.setContent(this.getInterfaceContent());
    this.screen.render();
  }

  toggleFullscreen() {
    // Toggle overlay visibility
    this.overlayBox.hidden = !this.overlayBox.hidden;
    this.headerBox.hidden = !this.headerBox.hidden;
    
    if (this.overlayBox.hidden) {
      this.hydraBox.top = 0;
      this.hydraBox.height = '100%';
    } else {
      this.hydraBox.top = 3;
      this.hydraBox.height = '95%';
    }
    
    this.screen.render();
  }

  cleanup() {
    this.stopAnimation();
    if (this.screen) {
      this.screen.destroy();
    }
  }

  async run() {
    console.log('Loading Enhanced Hydra Preview...');
    
    if (!await this.loadHydraArt()) {
      console.error('Failed to load hydra.txt file');
      process.exit(1);
    }

    this.setupScreen();
    
    // Update overlay position relative to centered hydra
    this.updateOverlayPosition();
    
    this.updateDisplay();
    this.startAnimation();
    
    // Show welcome message briefly
    setTimeout(() => {
      this.screen.render();
    }, 100);
  }
}

// Handle signals gracefully
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

// Run enhanced preview
const preview = new EnhancedHydraPreview();
preview.run().catch(error => {
  console.error('Error running Enhanced Hydra Preview:', error);
  process.exit(1);
});