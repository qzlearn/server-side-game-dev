---
description: Initialize a new game server project with WebSocket, matchmaking, and database setup
allowed-tools: Read, Write, Bash
---

# /server-init

Initialize a new **multiplayer game server project** with production-ready structure.

## Usage

```
/server-init [project-name]
```

## Created Structure

```
project-name/
├── src/
│   ├── server.js       # Main server
│   ├── networking/     # WebSocket handling
│   ├── matchmaking/    # MMR and queues
│   ├── game/          # Game loop logic
│   └── database/      # Data persistence
├── config/
├── tests/
├── Dockerfile
└── docker-compose.yml
```

## Technologies

- Node.js + WebSocket
- Redis for sessions
- PostgreSQL for persistence
- Docker for deployment
