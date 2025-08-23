#!/usr/bin/env node

import blessed from 'blessed';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HydraPreview {
  constructor() {
    this.hydraArt = '';
    this.titleArt = '';
    this.screen = null;
    this.hydraBox = null;
    this.overlayBox = null;
    this.statusBox = null;
    this.shimmerFrame = 0;
    this.eyePulseFrame = 0;
    this.animationInterval = null;
    
    // Color palettes for shimmering effect
    this.titleColors = [
      '{#00ff00-fg}', // Bright green for title
      '{#00ff33-fg}', // Bright green variant
      '{#33ff00-fg}', // Bright green variant 2
      '{#00ff66-fg}', // Bright green variant 3
    ];
    
    this.greenShades = [
      '{#006600-fg}', // Dark green
      '{#005500-fg}', // Darker green
      '{#004400-fg}', // Forest green
      '{#003300-fg}', // Very dark green
      '{#007700-fg}', // Medium dark green
      '{#008800-fg}', // Slightly lighter dark
      '{#009900-fg}', // Dark but visible
      '{#00aa00-fg}', // Balanced dark green
    ];
    
    this.redShades = [
      '{#ff0000-fg}', // Bright red
      '{#ee0000-fg}', // Dim red
      '{#dd0000-fg}', // Dimmer red
      '{#cc0000-fg}', // Dark red
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
    
    // Add custom borders
    const borderTop = this.createCustomBorder('top', terminalWidth - 2);
    const borderBottom = this.createCustomBorder('bottom', terminalWidth - 2);
    
    return [borderTop, ...centeredLines, borderBottom].join('\n');
  }

  createCustomBorder(position, width) {
    // Pattern: ⊱ ──────ஓ๑∗๑ஓ ────── ⊰
    const leftCorner = '⊱';
    const rightCorner = '⊰';
    const centerDecoration = 'ஓ๑∗๑ஓ';
    const dashChar = '─';
    const spaceChar = ' ';
    
    // Calculate available space for the pattern
    const cornerSpace = 2; // ⊱ and ⊰
    const centerDecorationLength = centerDecoration.length; // ஓ๑∗๑ஓ
    const spaceAroundCenter = 2; // spaces around center decoration
    const fixedElements = cornerSpace + centerDecorationLength + spaceAroundCenter;
    
    if (width <= fixedElements) {
      // For very narrow terminals, just show what fits
      return `{#00ff00-fg}${leftCorner}${centerDecoration}${rightCorner}{/}`.substring(0, width);
    }
    
    // Calculate dash sections
    const availableForDashes = width - fixedElements;
    const dashesPerSide = Math.floor(availableForDashes / 2);
    const leftDashes = dashChar.repeat(dashesPerSide);
    const rightDashes = dashChar.repeat(availableForDashes - dashesPerSide); // Handle odd numbers
    
    const borderLine = `${leftCorner}${spaceChar}${leftDashes}${centerDecoration}${rightDashes}${spaceChar}${rightCorner}`;
    
    return `{#00ff00-fg}${borderLine}{/}`;
  }

  setupScreen() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Hydra Interface Preview',
      cursor: {
        artificial: true,
        shape: 'line',
        blink: true,
        color: null
      },
      debug: false,
      warnings: false
    });

    // Main hydra display box - no border (using custom border in content)
    this.hydraBox = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      content: '',
      tags: true,
      style: {
        fg: '#00ff00',
        bg: 'black'
      },
      scrollable: true,
      alwaysScroll: true,
      mouse: true
    });

    // Floating translucent overlay box - centered horizontally with reduced opacity
    this.overlayBox = blessed.box({
      top: '65%',
      left: 'center',
      width: '80%',
      height: '25%',
      style: {
        bg: 'black',
        fg: '#00ff00',
        transparent: true,
        opacity: 0.5  // Reduced opacity for more transparency
      },
      border: {
        type: 'line',
        fg: '#00ff00'
      },
      tags: true
    });

    // Status and interface elements within overlay - fixed positioning
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

    this.screen.append(this.hydraBox);
    this.screen.append(this.overlayBox);
    
    // Ensure proper z-order - overlay should be on top
    this.overlayBox.setIndex(1);
    this.hydraBox.setIndex(0);

    // Key bindings
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

    // Handle terminal resize events for dynamic centering
    this.screen.on('resize', () => {
      // Recalculate and re-render with updated centering
      setTimeout(() => {
        const shimmeredContent = this.applyShimmerEffect(this.hydraArt);
        this.hydraBox.setContent(shimmeredContent);
        this.updateOverlayPosition();
        this.screen.render();
      }, 100); // Small delay to ensure resize is complete
    });
  }

  getInterfaceContent() {
    const terminalWidth = this.screen ? this.screen.width : 80;
    const availableWidth = terminalWidth - 4;
    const isNarrow = availableWidth < this.hydraWidth;
    const centeringStatus = isNarrow ? '{#ff6600-fg}NARROW TERMINAL{/}' : '{#00ff00-fg}CENTERED{/}';
    
    return `
{center}{bold}{#00ff00-fg}╔═══════════════════════════════════════════════════════════════════╗{/}
{center}{bold}{#00ff00-fg}║                    HYDRA CLAUDE CODE STUDIO                       ║{/}
{center}{bold}{#00ff00-fg}╠═══════════════════════════════════════════════════════════════════╣{/}
{center}{#00aa00-fg}║  Status: {#00ff00-fg}PREVIEW MODE ACTIVE{/}  Centering: ${centeringStatus}               {#00aa00-fg}║{/}
{center}{#00aa00-fg}║  Animation: {#00ff00-fg}SLOW SHIMMER ENABLED{/}                                   {#00aa00-fg}║{/}
{center}{#00aa00-fg}║  Effects: {#00ff00-fg}GENTLE GREEN SHIMMER + SOFT RED EYE PULSE{/}              {#00aa00-fg}║{/}
{center}{bold}{#00ff00-fg}╠═══════════════════════════════════════════════════════════════════╣{/}
{center}{#00aa00-fg}║  Controls: {#ffff00-fg}[SPACE]{/} {#00aa00-fg}Toggle Animation  {#ffff00-fg}[R]{/} {#00aa00-fg}Reset  {#ffff00-fg}[Q/ESC]{/} {#00aa00-fg}Quit     ║{/}
{center}{bold}{#00ff00-fg}╚═══════════════════════════════════════════════════════════════════╝{/}`;
  }

  applyShimmerEffect(content) {
    // Process hydra without shimmer effect (static)
    const hydraLines = content.split('\n');
    const processedHydraLines = hydraLines.map(line => {
      const cleanLine = line.replace(/^\s*\d+→/, '');
      return cleanLine; // Keep hydra static - no shimmer
    });

    // Process title with bright green colors for floating effect
    const titleLines = this.titleArt.split('\n');
    const processedTitleLines = titleLines.map(line => {
      const cleanLine = line.replace(/^\s*\d+→/, '');
      return this.shimmerTitleLine(cleanLine);
    });
    
    // Create floating title by overlaying at row 3 (moved up 3 rows from 6)
    const finalLines = [...processedHydraLines];
    const titleStartRow = 3;
    
    // Overlay title lines starting at row 3, making spaces transparent
    processedTitleLines.forEach((titleLine, index) => {
      const targetRow = titleStartRow + index;
      if (targetRow < finalLines.length) {
        // Overlay character by character, keeping spaces transparent
        if (titleLine.trim()) {
          const hydraLine = finalLines[targetRow] || '';
          const overlayedLine = this.overlayLineWithTransparency(hydraLine, titleLine);
          finalLines[targetRow] = overlayedLine;
        }
      } else {
        // If beyond hydra length, just add title lines
        finalLines.push(titleLine);
      }
    });
    
    return this.centerHydraContent(finalLines.join('\n'));
  }

  shimmerTitleLine(line) {
    // Apply bright green colors to title characters with RIGHT-TO-LEFT shimmer
    let shimmerLine = line;
    
    const titleChars = ['░', '▒', '▓', '█'];
    titleChars.forEach((char, charIndex) => {
      // Reverse the shimmer direction by subtracting frame and char position
      const rightToLeftIndex = (this.titleColors.length - 1 - this.shimmerFrame - charIndex) % this.titleColors.length;
      const shimmerIndex = rightToLeftIndex < 0 ? this.titleColors.length + rightToLeftIndex : rightToLeftIndex;
      const color = this.titleColors[shimmerIndex];
      shimmerLine = shimmerLine.replace(new RegExp(`\\${char}`, 'g'), `${color}${char}{/}`);
    });

    return shimmerLine;
  }

  overlayLineWithTransparency(hydraLine, titleLine) {
    // Overlay title line onto hydra line, making spaces transparent
    let result = '';
    const maxLength = Math.max(hydraLine.length, titleLine.length);
    
    for (let i = 0; i < maxLength; i++) {
      const hydraChar = hydraLine[i] || ' ';
      const titleChar = titleLine[i] || ' ';
      
      // If title character is a space or empty, show hydra character (transparency)
      // If title character has content (non-space), show title character
      if (titleChar === ' ' || titleChar === '') {
        result += hydraChar;
      } else {
        result += titleChar;
      }
    }
    
    return result;
  }

  shimmerLine(line) {
    // Replace different characters with darker green shimmering colors
    let shimmerLine = line;
    
    // Shimmer for green/body parts (░ ▒ ▓ █) with darker greens
    const greenChars = ['░', '▒', '▓', '█'];
    greenChars.forEach(char => {
      const shimmerIndex = (this.shimmerFrame + char.charCodeAt(0)) % this.greenShades.length;
      const color = this.greenShades[shimmerIndex];
      shimmerLine = shimmerLine.replace(new RegExp(`\\${char}`, 'g'), `${color}${char}{/}`);
    });

    // Special handling for eye-like patterns (█ characters that should pulse red)
    // Look for patterns that might be eyes
    if (shimmerLine.includes('██') && (shimmerLine.includes('░░░██') || shimmerLine.includes('██░░░'))) {
      const eyeColor = this.redShades[this.eyePulseFrame % this.redShades.length];
      // Apply red pulse to specific eye patterns
      shimmerLine = shimmerLine.replace(/(██▒)/g, `${eyeColor}$1{/}`);
      shimmerLine = shimmerLine.replace(/(▒██)/g, `${eyeColor}$1{/}`);
    }

    return shimmerLine;
  }

  updateOverlayPosition() {
    if (!this.screen || !this.overlayBox) return;
    
    // Keep overlay centered horizontally regardless of hydra position
    // This ensures it's always centered on screen
    this.overlayBox.left = 'center';
    this.overlayBox.width = '80%';
    this.overlayBox.top = '65%';  // Ensure consistent positioning
  }

  startAnimation() {
    this.animationInterval = setInterval(() => {
      this.shimmerFrame = (this.shimmerFrame + 1) % this.greenShades.length;
      this.eyePulseFrame = (this.eyePulseFrame + 1) % this.redShades.length;
      
      const shimmeredContent = this.applyShimmerEffect(this.hydraArt);
      this.hydraBox.setContent(shimmeredContent);
      
      // Update overlay position in case terminal was resized
      this.updateOverlayPosition();
      
      // Update status with animation frame info
      this.statusBox.setContent(this.getInterfaceContent());
      
      this.screen.render();
    }, 1500); // Much slower animation for text only
  }

  stopAnimation() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  }

  toggleAnimation() {
    if (this.animationInterval) {
      this.stopAnimation();
    } else {
      this.startAnimation();
    }
  }

  resetAnimation() {
    this.shimmerFrame = 0;
    this.eyePulseFrame = 0;
    const shimmeredContent = this.applyShimmerEffect(this.hydraArt);
    this.hydraBox.setContent(shimmeredContent);
    this.updateOverlayPosition();
    this.screen.render();
  }

  cleanup() {
    this.stopAnimation();
    if (this.screen) {
      this.screen.destroy();
    }
  }

  async run() {
    console.log('Loading Hydra Preview...');
    
    if (!await this.loadHydraArt()) {
      console.error('Failed to load hydra.txt file');
      process.exit(1);
    }

    this.setupScreen();
    
    // Initial render with shimmer effect and centering
    const shimmeredContent = this.applyShimmerEffect(this.hydraArt);
    this.hydraBox.setContent(shimmeredContent);
    
    // Update overlay position relative to centered hydra
    this.updateOverlayPosition();
    
    this.screen.render();
    
    // Start animation
    this.startAnimation();
    
    // Display welcome message
    setTimeout(() => {
      this.screen.render();
    }, 100);
  }
}

// Handle process signals gracefully
process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

// Run the preview
const preview = new HydraPreview();
preview.run().catch(error => {
  console.error('Error running Hydra Preview:', error);
  process.exit(1);
});