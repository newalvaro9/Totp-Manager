<h1 align="center">TOTP Manager</h1>
<div align="center">

<img src="./src-tauri/icons/icon.png" width="128" alt="TOTP Manager Logo">

A modern, secure, and user-friendly TOTP (Time-based One-Time Password) manager built with Tauri.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/v/release/newalvaro9/Totp-Manager-Desktop)](https://github.com/newalvaro9/Totp-Manager-Desktop/releases)

</div>

## ✨ Features

- 🔐 **Secure Storage**: Your 2FA secrets are encrypted and stored locally using industry-standard encryption.
- 🌐 **Cross-Platform**: Works seamlessly on Windows, macOS, and Linux.
- 🚀 **Fast & Lightweight**: Built with Rust and React for optimal performance.
- 🎨 **Modern UI**: Clean and intuitive interface with dark mode.
- 💾 **Backup & Restore**: Export and import your secrets.

## 🚀 Quick Start

### Download Release

1. Visit the [Releases Page](https://github.com/newalvaro9/Totp-Manager-Desktop/releases)
2. Download the latest version for your operating system
3. Install and run the application

### Build from Source

#### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/) (v18 or later)
- [Bun](https://bun.sh/)
- Platform-specific build tools:
  - **Windows**: Microsoft Visual Studio C++ Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: `build-essential` package

#### Build Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/newalvaro9/Totp-Manager-Desktop.git
   cd Totp-Manager-Desktop
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Development mode:
   ```bash
   bun run tauri dev
   ```

4. Build for production:
   ```bash
   bun run tauri build
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📝 License

This project is licensed under a custom license. See the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Álvaro Poblador** [@newalvaro9](https://github.com/newalvaro9)

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) for the amazing framework
- [React](https://reactjs.org/) for the frontend framework
- All contributors who have helped this project grow

---

<div align="center">
Made with ❤️ by Álvaro Poblador
</div>