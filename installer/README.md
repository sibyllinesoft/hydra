# Hydra Installer

This directory contains the installation and setup utilities for the Hydra Agent Ecosystem.

## Files

- `install.js` - Basic terminal installer
- `install-enhanced.js` - Enhanced TUI installer with animations
- `hydra-demo.js` - Demo and preview functionality
- `hydra-preview.js` - Basic preview interface  
- `hydra-preview-enhanced.js` - Enhanced preview with features
- `demo-enhanced-features.js` - Feature demonstration utilities
- `ascii-art-library.js` - ASCII art and visual elements

## Usage

The main installer can be run with:
```bash
node installer/install-enhanced.js
```

## Recent Fixes

**Complete File Overwrite**: Fixed installer bug where existing files weren't being completely overwritten during updates. The installer now ensures all files are completely replaced with the latest versions to prevent outdated content (like old "studio-coach" references) from persisting.

## Future Development

This installer is planned to be evolved into a comprehensive `hydra-cli` that can handle both project-level and home directory installations as outlined in the TODO.md improvement plan.