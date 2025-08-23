// ASCII Art Library for Enhanced Hydra Installer
// Contains various ASCII art patterns and animations

export class ASCIIArtLibrary {
  static getHydraVariations() {
    return [
      // Original animated hydra
      {
        name: "classic",
        art: (eyeColor, bodyColor) => `{center}{${bodyColor}-fg}
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
{/${bodyColor}-fg}{/center}`
      },

      // Compact serpent version
      {
        name: "serpent",
        art: (eyeColor, bodyColor) => `{center}{${bodyColor}-fg}
      ╭─────╮           ╭─────╮
  ╭───┤ {${eyeColor}-fg}● ● {/${eyeColor}-fg}├───╮   ╭───┤ {${eyeColor}-fg}● ● {/${eyeColor}-fg}├───╮
╭─┴─┐ ╰─────╯ ┌─┴─╮ ╭─┴─┐ ╰─────╯ ┌─┴─╮
│{${eyeColor}-fg}● ●{/${eyeColor}-fg}├─╮     ╭─┤{${eyeColor}-fg}● ●{/${eyeColor}-fg}│ │{${eyeColor}-fg}● ●{/${eyeColor}-fg}├─╮     ╭─┤{${eyeColor}-fg}● ●{/${eyeColor}-fg}│
╰───╯ │     │ ╰───╯ ╰───╯ │     │ ╰───╯
      ╰─┐ ┌─╯             ╰─┐ ┌─╯
        ╰─┴───┐ H Y D R A ┌─┴─╯
              ╰───────────╯
{/${bodyColor}-fg}{/center}`
      },

      // Cyberpunk style
      {
        name: "cyber",
        art: (eyeColor, bodyColor) => `{center}{${bodyColor}-fg}
    ▄▄▄▄▄▄▄       ▄▄▄▄▄▄▄       ▄▄▄▄▄▄▄
  ▄█▀ {${eyeColor}-fg}◉{/${eyeColor}-fg} {${eyeColor}-fg}◉{/${eyeColor}-fg} ▀█▄   ▄█▀ {${eyeColor}-fg}◉{/${eyeColor}-fg} {${eyeColor}-fg}◉{/${eyeColor}-fg} ▀█▄   ▄█▀ {${eyeColor}-fg}◉{/${eyeColor}-fg} {${eyeColor}-fg}◉{/${eyeColor}-fg} ▀█▄
▄█▀ ▄▄▄▄▄▄▄ ▀█▄█▀ ▄▄▄▄▄▄▄ ▀█▄█▀ ▄▄▄▄▄▄▄ ▀█▄
█▀ ▄▄▄▄▄▄▄▄▄ ▀█▀ ▄▄▄▄▄▄▄▄▄ ▀█▀ ▄▄▄▄▄▄▄▄▄ ▀█
██ {${eyeColor}-fg}◉{/${eyeColor}-fg} {${eyeColor}-fg}◉{/${eyeColor}-fg} ███████ {${eyeColor}-fg}◉{/${eyeColor}-fg} {${eyeColor}-fg}◉{/${eyeColor}-fg} ███████ {${eyeColor}-fg}◉{/${eyeColor}-fg} {${eyeColor}-fg}◉{/${eyeColor}-fg} ██
▀█▄ ▀▀▀▀▀▀▀ ▄█▀█▄ ▀▀▀▀▀▀▀ ▄█▀█▄ ▀▀▀▀▀▀▀ ▄█▀
  ▀█▄▄▄▄▄▄▄█▀   ▀█▄▄▄▄▄▄▄█▀   ▀█▄▄▄▄▄▄▄█▀
    ▀▀▀█▀▀▀       ▀▀▀█▀▀▀       ▀▀▀█▀▀▀
       █             █             █
    ╔══█═══════════════█═════════════█══╗
    ║  ▼    H Y D R A   ▼             ║
    ╚══════════════════════════════════╝
{/${bodyColor}-fg}{/center}`
      }
    ];
  }

  static getBorderPatterns() {
    return {
      // Double line borders
      double: {
        topLeft: "╔", topRight: "╗", bottomLeft: "╚", bottomRight: "╝",
        horizontal: "═", vertical: "║", 
        cross: "╬", teeUp: "╩", teeDown: "╦", teeLeft: "╣", teeRight: "╠"
      },
      
      // Single line borders
      single: {
        topLeft: "┌", topRight: "┐", bottomLeft: "└", bottomRight: "┘",
        horizontal: "─", vertical: "│",
        cross: "┼", teeUp: "┴", teeDown: "┬", teeLeft: "┤", teeRight: "├"
      },
      
      // Rounded corners
      rounded: {
        topLeft: "╭", topRight: "╮", bottomLeft: "╰", bottomRight: "╯",
        horizontal: "─", vertical: "│",
        cross: "┼", teeUp: "┴", teeDown: "┬", teeLeft: "┤", teeRight: "├"
      },
      
      // Heavy borders
      heavy: {
        topLeft: "┏", topRight: "┓", bottomLeft: "┗", bottomRight: "┛",
        horizontal: "━", vertical: "┃",
        cross: "╋", teeUp: "┻", teeDown: "┳", teeLeft: "┫", teeRight: "┣"
      }
    };
  }

  static getProgressBarStyles() {
    return {
      // Block progress bars
      blocks: ["█", "▉", "▊", "▋", "▌", "▍", "▎", "▏", "░"],
      
      // Shade variations
      shades: ["█", "▓", "▒", "░", " "],
      
      // Dots and circles
      dots: ["●", "◐", "◑", "◒", "◓", "○"],
      
      // Arrows and triangles
      arrows: ["▶", "▷", "►", "▸", "▹", "▻"],
      
      // Cyberpunk style
      cyber: ["▓", "▒", "░", "▫", "▪", "▬", "▭", "▮", "▯"]
    };
  }

  static getSpinnerStyles() {
    return {
      // Classic spinning
      classic: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
      
      // Dots orbiting
      dots: ["⠁", "⠂", "⠄", "⡀", "⢀", "⠠", "⠐", "⠈"],
      
      // Growing bars
      bars: ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█", "▇", "▆", "▅", "▄", "▃", "▂"],
      
      // Pulsing circle
      pulse: ["○", "◔", "◐", "◕", "●", "◕", "◐", "◔"],
      
      // Snake-like
      snake: ["⠋", "⠙", "⠚", "⠞", "⠖", "⠦", "⠴", "⠲", "⠳", "⠓"],
      
      // Cyberpunk
      cyber: ["▰", "▱", "▰▰", "▱▱", "▰▰▰", "▱▱▱", "▰▰▰▰", "▱▱▱▱"],
      
      // Matrix style
      matrix: ["╱", "─", "╲", "│", "╱", "─", "╲", "│"],
      
      // Hydra heads
      hydra: ["🐍", "🐲", "🐉", "🐲", "🐍", "🔥", "💎", "⚡"]
    };
  }

  static getGradientColors() {
    return {
      // Cyberpunk palette
      cyberpunk: [
        "bright-magenta", "magenta", "bright-blue", "blue", 
        "bright-cyan", "cyan", "bright-green", "green"
      ],
      
      // Fire palette
      fire: [
        "bright-red", "red", "bright-yellow", "yellow", 
        "bright-white", "white"
      ],
      
      // Ocean palette
      ocean: [
        "bright-blue", "blue", "bright-cyan", "cyan", 
        "bright-green", "green", "white"
      ],
      
      // Neon palette
      neon: [
        "bright-magenta", "bright-cyan", "bright-green", 
        "bright-yellow", "bright-red", "bright-blue"
      ],
      
      // Matrix palette
      matrix: [
        "bright-green", "green", "bright-white", "white", "gray"
      ]
    };
  }

  static createAnimatedBorder(width, height, frameIndex, style = "double") {
    const patterns = this.getBorderPatterns();
    const border = patterns[style] || patterns.double;
    
    // Create flowing effect
    const flowChar = ["═", "▓", "▒", "░"][frameIndex % 4];
    const lines = [];
    
    // Top border with flow effect
    let topLine = border.topLeft;
    for (let i = 1; i < width - 1; i++) {
      if ((i + frameIndex) % 8 === 0) {
        topLine += flowChar;
      } else {
        topLine += border.horizontal;
      }
    }
    topLine += border.topRight;
    lines.push(topLine);
    
    // Middle lines
    for (let y = 1; y < height - 1; y++) {
      lines.push(border.vertical + " ".repeat(width - 2) + border.vertical);
    }
    
    // Bottom border with flow effect
    let bottomLine = border.bottomLeft;
    for (let i = 1; i < width - 1; i++) {
      if ((i + frameIndex + 4) % 8 === 0) {
        bottomLine += flowChar;
      } else {
        bottomLine += border.horizontal;
      }
    }
    bottomLine += border.bottomRight;
    lines.push(bottomLine);
    
    return lines.join('\n');
  }

  static createGradientText(text, palette = "cyberpunk", frameIndex = 0) {
    const colors = this.getGradientColors()[palette] || this.getGradientColors().cyberpunk;
    let result = "";
    
    for (let i = 0; i < text.length; i++) {
      const colorIndex = (i + frameIndex) % colors.length;
      const color = colors[colorIndex];
      
      if (text[i] === ' ') {
        result += ' ';
      } else {
        result += `{${color}-fg}${text[i]}{/${color}-fg}`;
      }
    }
    
    return result;
  }

  static createPulsingElement(element, intensity, maxIntensity = 30) {
    const opacity = Math.sin((intensity / maxIntensity) * Math.PI * 2);
    const scaledOpacity = Math.max(0.3, (opacity + 1) / 2);
    
    if (scaledOpacity > 0.8) {
      return `{bold}${element}{/bold}`;
    } else if (scaledOpacity > 0.5) {
      return element;
    } else {
      return `{dim}${element}{/dim}`;
    }
  }
}