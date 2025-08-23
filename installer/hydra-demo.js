#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HydraDemo {
  constructor() {
    this.hydraArt = '';
    this.greenColors = [
      '\x1b[32m',  // Green
      '\x1b[92m',  // Bright Green
      '\x1b[36m',  // Cyan
      '\x1b[96m',  // Bright Cyan
    ];
    this.redColors = [
      '\x1b[31m',  // Red
      '\x1b[91m',  // Bright Red
      '\x1b[35m',  // Magenta
      '\x1b[95m',  // Bright Magenta
    ];
    this.reset = '\x1b[0m';
  }

  async loadHydraArt() {
    try {
      const hydraPath = path.join(__dirname, 'hydra.txt');
      this.hydraArt = fs.readFileSync(hydraPath, 'utf8');
      return true;
    } catch (error) {
      console.error('Error loading hydra.txt:', error.message);
      return false;
    }
  }

  applyColors(content, frame = 0) {
    const lines = content.split('\n');
    return lines.map((line, lineIndex) => {
      // Remove line numbers
      const cleanLine = line.replace(/^\s*\d+→/, '');
      
      // Apply green shimmer to body characters
      let coloredLine = cleanLine;
      const greenIndex = (frame + lineIndex) % this.greenColors.length;
      const redIndex = frame % this.redColors.length;
      
      // Color body characters
      coloredLine = coloredLine.replace(/[█▓▒░]/g, 
        `${this.greenColors[greenIndex]}$&${this.reset}`);
      
      // Special handling for potential eye areas
      if (coloredLine.includes('██') && (coloredLine.includes('░░░') || lineIndex > 5 && lineIndex < 15)) {
        coloredLine = coloredLine.replace(/██/g, 
          `${this.redColors[redIndex]}██${this.reset}`);
      }
      
      return coloredLine;
    }).join('\n');
  }

  clearScreen() {
    process.stdout.write('\x1b[2J\x1b[H');
  }

  async demo() {
    console.log('🐉 Loading Hydra Demo...\n');
    
    if (!await this.loadHydraArt()) {
      console.error('❌ Failed to load hydra.txt');
      return;
    }

    console.log('✅ Hydra loaded successfully!');
    console.log('🎨 Applying shimmering effects...\n');
    
    // Show static version first
    console.log('📸 Static Hydra:');
    console.log(this.applyColors(this.hydraArt, 0));
    
    console.log('\n⏳ Starting animation preview (5 seconds)...');
    
    let frame = 0;
    const animationInterval = setInterval(() => {
      this.clearScreen();
      
      console.log(`🐉 HYDRA CLAUDE CODE STUDIO - ANIMATED PREVIEW`);
      console.log(`🎬 Frame: ${frame} | 🎨 Shimmer Active | 👁️ Eyes Pulsing\n`);
      
      const animatedHydra = this.applyColors(this.hydraArt, frame);
      console.log(animatedHydra);
      
      console.log(`\n📦 Ready to install with: npm start`);
      console.log(`🎮 Interactive preview: npm run preview`);
      console.log(`✨ Enhanced preview: npm run preview-enhanced`);
      
      frame++;
    }, 300);
    
    // Stop after 5 seconds
    setTimeout(() => {
      clearInterval(animationInterval);
      this.clearScreen();
      
      console.log('🎯 HYDRA DEMO COMPLETE\n');
      console.log('🚀 Next Steps:');
      console.log('   • npm start                 - Install Hydra');
      console.log('   • npm run preview           - Interactive preview');
      console.log('   • npm run preview-enhanced  - Full effects preview');
      console.log('   • npm run demo              - This demo again\n');
      
      console.log('🐉 Thank you for previewing Hydra Claude Code Studio!');
      process.exit(0);
    }, 5000);
  }
}

// Run demo
const demo = new HydraDemo();
demo.demo().catch(error => {
  console.error('Demo error:', error);
  process.exit(1);
});