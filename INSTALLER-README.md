# 🐲 Hydra Animated Web Installer

A beautiful, modern web-based installer for Hydra Claude Studio featuring:

## ✨ Features

### Visual Design
- **Stunning ASCII Art**: Multi-headed hydra with glowing red eyes
- **Glassmorphism UI**: Modern floating panels with blur effects
- **Smooth Animations**: Pulsing eyes, floating particles, progress bars
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Professional dark interface with neon accents

### Functionality
- **Smart Detection**: Automatically detects fresh install vs. update
- **Real-time Progress**: Live installation progress with animated indicators
- **Error Handling**: User-friendly error messages and recovery
- **Success Celebration**: Animated success screen with particle effects
- **Cross-platform**: Works on Linux, macOS, and Windows

### Accessibility
- **WCAG 2.1 AA Compliant**: Full keyboard navigation and screen reader support
- **Reduced Motion**: Respects user motion preferences
- **High Contrast**: Excellent color contrast ratios
- **Focus Management**: Clear focus indicators

## 🚀 Quick Start

### Option 1: One-Command Launch
```bash
./start-web-installer.sh
```

### Option 2: Manual Launch
```bash
# Install dependencies
npm install

# Start the server
npm run server

# Open browser to http://localhost:3001
```

### Option 3: Traditional Terminal Installer
```bash
# Use the original terminal-based installer
npm start
```

## 🏗️ Architecture

The animated installer consists of two main components:

### Frontend (`installer.html`)
- **Pure HTML5/CSS3/JavaScript**: No frameworks required
- **Socket.IO Client**: Real-time communication with backend
- **Progressive Enhancement**: Works even if JavaScript is disabled
- **Responsive Grid**: Adapts to any screen size

### Backend (`installer-server.js`)
- **Express.js Server**: Serves the frontend and API endpoints
- **Socket.IO Server**: Real-time progress updates
- **Installation Engine**: Same logic as terminal installer
- **REST API**: Status checking and installation control

## 🎨 Customization

### Color Themes
Modify CSS variables in `installer.html`:
```css
:root {
    --hydra-green: #00ff88;    /* Primary accent color */
    --hydra-red: #ff3366;      /* Eye color */
    --glass-bg: rgba(255, 255, 255, 0.1);  /* Panel background */
}
```

### ASCII Art
The hydra ASCII art can be customized in the `.hydra-art` section. The eyes are marked with the `.hydra-eye` class for special animation effects.

### Animation Speed
Adjust animation durations:
```css
@keyframes hydroFloat {
    /* Change duration from 6s to your preference */
    animation: hydroFloat 6s ease-in-out infinite;
}
```

## 🔧 Development

### Project Structure
```
hydra/
├── installer.html          # Main web interface
├── installer-server.js     # Backend server
├── installer/
│   ├── install.js         # Original terminal installer
├── start-web-installer.sh # Launch script
└── package.json           # Dependencies
```

### API Endpoints
- `GET /` - Serves the web installer
- `GET /api/status` - Installation status and system info
- `POST /api/install` - Start installation process
- `GET /api/health` - Server health check

### Socket Events
- `installation-progress` - Real-time progress updates
- `installation-log` - Log messages with timestamps
- `join-installation` - Client joins installation room

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill any process using the port
kill -9 $(lsof -t -i:3001)
```

### Dependencies Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Browser Connection Failed
1. Ensure the server is running on http://localhost:3001
2. Check firewall settings
3. Try a different browser
4. Clear browser cache and cookies

## 🎯 Performance

The animated installer is optimized for performance:

- **Efficient Animations**: Uses CSS transforms and opacity for smooth 60fps animations
- **Minimal Dependencies**: Only essential libraries (Express, Socket.IO)
- **Progressive Loading**: Interface loads immediately, connects to server asynchronously
- **Memory Management**: Automatic cleanup of particles and event listeners

## 🔒 Security

Security features implemented:

- **Input Validation**: All user inputs are validated server-side
- **CORS Protection**: Configured for localhost development
- **No Eval**: No dynamic code execution
- **Safe Defaults**: Secure default configurations

## 📱 Browser Support

Tested and supported on:

- **Chrome/Chromium** 80+
- **Firefox** 75+
- **Safari** 13+
- **Edge** 80+

## 🎉 What's Next?

The web installer sets the foundation for future enhancements:

- **Theme Switching**: Light/dark mode toggle
- **Language Support**: Multi-language interface
- **Plugin System**: Custom installation steps
- **Remote Installation**: Install to remote servers
- **Analytics**: Installation success metrics

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for the Hydra Claude Studio community**