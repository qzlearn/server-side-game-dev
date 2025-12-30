---
description: Initialize a new game server project with WebSocket, matchmaking, and database setup
allowed-tools: Read, Write, Bash
version: "2.0.0"

# Input Schema
input:
  required:
    - project_name
  optional:
    - language
    - template
    - database
    - include_docker
  validation:
    project_name:
      type: string
      pattern: "^[a-z][a-z0-9-]*$"
      min_length: 2
      max_length: 50
    language:
      type: string
      enum: [typescript, go, rust, cpp]
      default: typescript
    template:
      type: string
      enum: [minimal, standard, full]
      default: standard
    database:
      type: string
      enum: [postgresql, redis, mongodb, sqlite]
      default: postgresql
    include_docker:
      type: boolean
      default: true

# Output Schema
output:
  success:
    project_path: string
    files_created: integer
    next_steps: array
  error:
    code: string
    message: string

# Template Configurations
templates:
  minimal:
    files: 5
    features: [websocket, basic_game_loop]
  standard:
    files: 15
    features: [websocket, matchmaking, database, game_loop, monitoring]
  full:
    files: 30
    features: [websocket, matchmaking, database, game_loop, monitoring, auth, admin_api, tests, ci_cd]
---

# /server-init

Initialize a new **multiplayer game server project** with production-ready structure.

## Usage

```bash
/server-init <project-name> [--language=typescript] [--template=standard] [--database=postgresql] [--include-docker]
```

## Project Templates

| Template | Files | Features |
|----------|-------|----------|
| `minimal` | 5 | WebSocket, basic game loop |
| `standard` | 15 | + Matchmaking, database, monitoring |
| `full` | 30 | + Auth, admin API, tests, CI/CD |

## Language Support

| Language | Runtime | Best For |
|----------|---------|----------|
| TypeScript | Node.js | Rapid development, web games |
| Go | Native | High concurrency, microservices |
| Rust | Native | Maximum performance, safety |
| C++ | Native | AAA games, ultra-low latency |

## Created Structure

### TypeScript (Standard Template)

```
project-name/
├── src/
│   ├── index.ts              # Entry point
│   ├── server.ts             # WebSocket server
│   ├── config/
│   │   ├── index.ts          # Configuration loader
│   │   └── schema.ts         # Config validation
│   ├── networking/
│   │   ├── connection.ts     # Client connection handler
│   │   ├── protocol.ts       # Message protocol
│   │   └── serialization.ts  # Binary serialization
│   ├── matchmaking/
│   │   ├── queue.ts          # Matchmaking queue
│   │   ├── rating.ts         # Elo/TrueSkill
│   │   └── match.ts          # Match creation
│   ├── game/
│   │   ├── loop.ts           # Fixed timestep game loop
│   │   ├── state.ts          # Game state management
│   │   └── systems/          # ECS systems
│   ├── database/
│   │   ├── client.ts         # Database connection
│   │   ├── migrations/       # Schema migrations
│   │   └── repositories/     # Data access
│   └── monitoring/
│       ├── metrics.ts        # Prometheus metrics
│       └── health.ts         # Health checks
├── config/
│   ├── default.yaml          # Default configuration
│   ├── development.yaml      # Dev overrides
│   └── production.yaml       # Prod overrides
├── tests/
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── load/                 # Load tests
├── Dockerfile                # Multi-stage build
├── docker-compose.yml        # Local development
├── package.json
├── tsconfig.json
└── README.md
```

### Go (Standard Template)

```
project-name/
├── cmd/
│   └── server/
│       └── main.go           # Entry point
├── internal/
│   ├── server/
│   │   └── server.go         # WebSocket server
│   ├── networking/
│   │   ├── connection.go     # Client connection
│   │   └── protocol.go       # Message protocol
│   ├── matchmaking/
│   │   ├── queue.go          # Matchmaking queue
│   │   └── rating.go         # Rating system
│   ├── game/
│   │   ├── loop.go           # Game loop
│   │   └── state.go          # Game state
│   └── database/
│       └── postgres.go       # Database client
├── pkg/
│   └── protocol/
│       └── messages.go       # Shared message types
├── config/
│   └── config.go             # Configuration
├── migrations/               # SQL migrations
├── Dockerfile
├── docker-compose.yml
├── go.mod
├── go.sum
├── Makefile
└── README.md
```

## Generated Files

### Main Server (TypeScript)

```typescript
// src/server.ts
import { WebSocketServer } from 'ws';
import { GameLoop } from './game/loop';
import { MatchmakingQueue } from './matchmaking/queue';
import { createMetricsServer } from './monitoring/metrics';

export class GameServer {
  private wss: WebSocketServer;
  private gameLoop: GameLoop;
  private matchmaking: MatchmakingQueue;

  constructor(config: ServerConfig) {
    this.wss = new WebSocketServer({ port: config.port });
    this.gameLoop = new GameLoop(config.tickRate);
    this.matchmaking = new MatchmakingQueue(config.matchmaking);

    this.setupHandlers();
  }

  private setupHandlers() {
    this.wss.on('connection', (ws, req) => {
      const connection = new Connection(ws, req);
      this.onPlayerConnect(connection);

      ws.on('message', (data) => this.onMessage(connection, data));
      ws.on('close', () => this.onPlayerDisconnect(connection));
    });
  }

  start() {
    this.gameLoop.start();
    createMetricsServer(9090);
    console.log(`Game server running on port ${this.config.port}`);
  }
}
```

### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

USER node
EXPOSE 8080 9090
CMD ["node", "dist/index.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  game-server:
    build: .
    ports:
      - "8080:8080"
      - "9090:9090"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/game
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: game
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9091:9090"
    volumes:
      - ./config/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  postgres_data:
  redis_data:
  grafana_data:
```

## Post-Init Steps

After running `/server-init`, follow these steps:

1. **Install Dependencies**
   ```bash
   cd project-name
   npm install  # or go mod download
   ```

2. **Start Development Environment**
   ```bash
   docker-compose up -d db redis
   npm run dev
   ```

3. **Run Migrations**
   ```bash
   npm run migrate
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

5. **Open Dashboards**
   - Game server: http://localhost:8080
   - Metrics: http://localhost:9090
   - Grafana: http://localhost:3000

## Troubleshooting

### Common Failure Modes

| Error | Root Cause | Solution |
|-------|------------|----------|
| Directory exists | Name conflict | Choose different name |
| Permission denied | No write access | Check permissions |
| npm install fails | Network issues | Check npm registry |
| Docker build fails | Missing deps | Check Dockerfile |

### Debug Checklist

```bash
# Verify project structure
tree project-name -L 2

# Check TypeScript compilation
npm run build

# Test database connection
npm run migrate:status

# Verify Docker build
docker build -t game-server .
```

## Example Output

```
Initializing game server project...

Project: my-awesome-game
Language: TypeScript
Template: standard
Database: PostgreSQL

Creating project structure...
✓ Created src/index.ts
✓ Created src/server.ts
✓ Created src/config/index.ts
✓ Created src/networking/connection.ts
✓ Created src/matchmaking/queue.ts
✓ Created src/game/loop.ts
✓ Created src/database/client.ts
✓ Created src/monitoring/metrics.ts
✓ Created Dockerfile
✓ Created docker-compose.yml
✓ Created package.json
✓ Created tsconfig.json
✓ Created README.md

Project initialized successfully!

Next steps:
1. cd my-awesome-game
2. npm install
3. docker-compose up -d db redis
4. npm run dev

Documentation: ./README.md
```
