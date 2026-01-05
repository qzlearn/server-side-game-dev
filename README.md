<div align="center">

<!-- Animated Typing Banner -->
<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=28&duration=3000&pause=1000&color=2E9EF7&center=true&vCenter=true&multiline=true&repeat=true&width=600&height=100&lines=Server+Side+Game+Dev+Assistant;8+Agents+%7C+17+Skills;Claude+Code+Plugin" alt="Server Side Game Dev Assistant" />

<br/>

<!-- Badge Row 1: Status Badges -->
[![Version](https://img.shields.io/badge/Version-3.1.0-blue?style=for-the-badge)](https://github.com/pluginagentmarketplace/custom-plugin-server-side-game-dev/releases)
[![License](https://img.shields.io/badge/License-Custom-yellow?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production-brightgreen?style=for-the-badge)](#)
[![SASMP](https://img.shields.io/badge/SASMP-v1.3.0-blueviolet?style=for-the-badge)](#)

<!-- Badge Row 2: Content Badges -->
[![Agents](https://img.shields.io/badge/Agents-8-orange?style=flat-square&logo=robot)](#-agents)
[![Skills](https://img.shields.io/badge/Skills-17-purple?style=flat-square&logo=lightning)](#-skills)
[![Commands](https://img.shields.io/badge/Commands-4-green?style=flat-square&logo=terminal)](#-commands)

<br/>

<!-- Quick CTA Row -->
[📦 **Install Now**](#-quick-start) · [🤖 **Explore Agents**](#-agents) · [📖 **Documentation**](#-documentation) · [⭐ **Star this repo**](https://github.com/pluginagentmarketplace/custom-plugin-server-side-game-dev)

---

### What is this?

> **Server Side Game Dev Assistant** is a Claude Code plugin with **8 agents** and **17 skills** for server side game dev development.

</div>

---

## 📑 Table of Contents

<details>
<summary>Click to expand</summary>

- [Quick Start](#-quick-start)
- [Features](#-features)
- [Agents](#-agents)
- [Skills](#-skills)
- [Commands](#-commands)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

</details>

---

## 🚀 Quick Start

### Prerequisites

- Claude Code CLI v2.0.27+
- Active Claude subscription

### Installation (Choose One)

<details open>
<summary><strong>Option 1: From Marketplace (Recommended)</strong></summary>

```bash
# Step 1️⃣ Add the marketplace
/plugin marketplace add pluginagentmarketplace/custom-plugin-server-side-game-dev

# Step 2️⃣ Install the plugin
/plugin install server-side-game-dev-plugin@pluginagentmarketplace-game-server

# Step 3️⃣ Restart Claude Code
# Close and reopen your terminal/IDE
```

</details>

<details>
<summary><strong>Option 2: Local Installation</strong></summary>

```bash
# Clone the repository
git clone https://github.com/pluginagentmarketplace/custom-plugin-server-side-game-dev.git
cd custom-plugin-server-side-game-dev

# Load locally
/plugin load .

# Restart Claude Code
```

</details>

### ✅ Verify Installation

After restart, you should see these agents:

```
server-side-game-dev-plugin:02-networking-specialist
server-side-game-dev-plugin:03-matchmaking-engineer
server-side-game-dev-plugin:05-game-loop-developer
server-side-game-dev-plugin:06-database-specialist
server-side-game-dev-plugin:04-state-sync-expert
... and 2 more
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **8 Agents** | Specialized AI agents for server side game dev tasks |
| 🛠️ **17 Skills** | Reusable capabilities with Golden Format |
| ⌨️ **4 Commands** | Quick slash commands |
| 🔄 **SASMP v1.3.0** | Full protocol compliance |

---

## 🤖 Agents

### 8 Specialized Agents

| # | Agent | Purpose |
|---|-------|---------|
| 1 | **02-networking-specialist** | Expert in game networking protocols, latency optimization, a |
| 2 | **03-matchmaking-engineer** | Design and implement fair, fast matchmaking systems with ski |
| 3 | **05-game-loop-developer** | Implement high-performance server-side game loops with fixed |
| 4 | **06-database-specialist** | Design game data persistence with player profiles, leaderboa |
| 5 | **04-state-sync-expert** | Expert in game state synchronization, snapshot systems, and  |
| 6 | **01-game-server-architect** | Design and architect scalable multiplayer game servers with  |
| 7 | **07-devops-deployment** | Deploy and scale game servers with containerization, orchest |

---

## 🛠️ Skills

### Available Skills

| Skill | Description | Invoke |
|-------|-------------|--------|
| `data-serialization` | Efficient data serialization for game networking including P | `Skill("server-side-game-dev-plugin:data-serialization")` |
| `socket-programming` | Low-level socket programming including BSD sockets, Winsock, | `Skill("server-side-game-dev-plugin:socket-programming")` |
| `async-programming` | Asynchronous programming models including coroutines, async/ | `Skill("server-side-game-dev-plugin:async-programming")` |
| `databases` | Game data persistence with player profiles, leaderboards, in | `Skill("server-side-game-dev-plugin:databases")` |
| `game-loop` | Server-side game loop implementation with fixed timestep, ph | `Skill("server-side-game-dev-plugin:game-loop")` |
| `io-multiplexing` | High-performance I/O multiplexing including epoll, IOCP, kqu | `Skill("server-side-game-dev-plugin:io-multiplexing")` |
| `multithreading` | Multithreading and concurrency patterns for game servers inc | `Skill("server-side-game-dev-plugin:multithreading")` |
| `networking` | Game networking protocols, WebSocket/UDP implementation, lat | `Skill("server-side-game-dev-plugin:networking")` |
| `state-sync` | Game state synchronization, snapshot systems, and conflict r | `Skill("server-side-game-dev-plugin:state-sync")` |
| `design-patterns` | Game server design patterns including ECS, command pattern,  | `Skill("server-side-game-dev-plugin:design-patterns")` |
| ... | +7 more | See skills/ directory |

---

## ⌨️ Commands

| Command | Description |
|---------|-------------|
| `/monitor` | Monitor game server health, performance, and player metrics |
| `/deploy` | Deploy game server to production with Docker and Kubernetes |
| `/network-test` | Run network latency and stress tests on game server |
| `/server-init` | Initialize a new game server project with WebSocket, matchma |

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [LICENSE](LICENSE) | License information |

---

## 📁 Project Structure

<details>
<summary>Click to expand</summary>

```
custom-plugin-server-side-game-dev/
├── 📁 .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── 📁 agents/              # 8 agents
├── 📁 skills/              # 17 skills (Golden Format)
├── 📁 commands/            # 4 commands
├── 📁 hooks/
├── 📄 README.md
├── 📄 CHANGELOG.md
└── 📄 LICENSE
```

</details>

---

## 📅 Metadata

| Field | Value |
|-------|-------|
| **Version** | 3.1.0 |
| **Last Updated** | 2025-12-29 |
| **Status** | Production Ready |
| **SASMP** | v1.3.0 |
| **Agents** | 8 |
| **Skills** | 17 |
| **Commands** | 4 |

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

1. Fork the repository
2. Create your feature branch
3. Follow the Golden Format for new skills
4. Submit a pull request

---

## ⚠️ Security

> **Important:** This repository contains third-party code and dependencies.
>
> - ✅ Always review code before using in production
> - ✅ Check dependencies for known vulnerabilities
> - ✅ Follow security best practices
> - ✅ Report security issues privately via [Issues](../../issues)

---

## 📝 License

Copyright © 2025 **Dr. Umit Kacar** & **Muhsin Elcicek**

Custom License - See [LICENSE](LICENSE) for details.

---

## 👥 Contributors

<table>
<tr>
<td align="center">
<strong>Dr. Umit Kacar</strong><br/>
Senior AI Researcher & Engineer
</td>
<td align="center">
<strong>Muhsin Elcicek</strong><br/>
Senior Software Architect
</td>
</tr>
</table>

---

<div align="center">

**Made with ❤️ for the Claude Code Community**

[![GitHub](https://img.shields.io/badge/GitHub-pluginagentmarketplace-black?style=for-the-badge&logo=github)](https://github.com/pluginagentmarketplace)

</div>
