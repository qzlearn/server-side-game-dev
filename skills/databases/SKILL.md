---
name: databases
description: Game data persistence with player profiles, leaderboards, inventory systems using Redis and PostgreSQL
sasmp_version: "1.3.0"
version: "2.0.0"
bonded_agent: 06-database-specialist
bond_type: PRIMARY_BOND

# Parameters
parameters:
  required:
    - database_type
  optional:
    - connection_pool_size
    - cache_ttl_s
    - replication_mode
  validation:
    database_type:
      type: string
      enum: [postgresql, redis, mongodb, dynamodb, cockroachdb]
    connection_pool_size:
      type: integer
      min: 5
      max: 100
      default: 20
    cache_ttl_s:
      type: integer
      min: 60
      max: 86400
      default: 3600
    replication_mode:
      type: string
      enum: [single, replica, cluster]
      default: single

# Retry Configuration
retry_config:
  max_attempts: 3
  backoff: exponential
  initial_delay_ms: 100
  max_delay_ms: 5000
  retryable_errors:
    - CONNECTION_TIMEOUT
    - DEADLOCK_DETECTED
    - REPLICA_LAG

# Observability
observability:
  logging:
    level: info
    fields: [query_type, table, duration_ms, rows_affected]
  metrics:
    - name: db_query_duration_seconds
      type: histogram
    - name: db_connections_active
      type: gauge
    - name: db_errors_total
      type: counter
    - name: cache_hit_ratio
      type: gauge
---

# Game Databases

Implement **efficient data persistence** for players, matches, and leaderboards.

## Database Selection

| Database | Strength | Use Case |
|----------|----------|----------|
| PostgreSQL | ACID, complex queries | Player data, transactions |
| Redis | Ultra-fast | Leaderboards, cache, sessions |
| MongoDB | Flexible schema | Game logs, analytics |
| DynamoDB | Infinite scale | Global leaderboards |
| CockroachDB | Distributed ACID | Multi-region |

## PostgreSQL Schema

```sql
-- Player profiles
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mmr INTEGER DEFAULT 1000,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    coins BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_players_mmr ON players(mmr DESC);
CREATE INDEX idx_players_level ON players(level DESC);

-- Inventory system
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,
    item_id VARCHAR(100) NOT NULL,
    quantity INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    acquired_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(player_id, item_type, item_id)
);

-- Match history
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_mode VARCHAR(32) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    winner_team INTEGER,
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE match_players (
    match_id UUID REFERENCES matches(id),
    player_id UUID REFERENCES players(id),
    team INTEGER NOT NULL,
    score INTEGER DEFAULT 0,
    kills INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    mmr_change INTEGER DEFAULT 0,
    PRIMARY KEY (match_id, player_id)
);
```

## Redis Leaderboard

```javascript
const Redis = require('ioredis');
const redis = new Redis({ host: 'localhost', port: 6379 });

class Leaderboard {
    constructor(name) {
        this.key = `leaderboard:${name}`;
    }

    async setScore(playerId, score) {
        return redis.zadd(this.key, score, playerId);
    }

    async getScore(playerId) {
        return redis.zscore(this.key, playerId);
    }

    async getRank(playerId) {
        // 0-indexed, null if not found
        const rank = await redis.zrevrank(this.key, playerId);
        return rank !== null ? rank + 1 : null;
    }

    async getTop(count = 100) {
        const results = await redis.zrevrange(
            this.key, 0, count - 1, 'WITHSCORES'
        );

        // Convert to [{playerId, score, rank}]
        const leaderboard = [];
        for (let i = 0; i < results.length; i += 2) {
            leaderboard.push({
                playerId: results[i],
                score: parseInt(results[i + 1]),
                rank: i / 2 + 1
            });
        }
        return leaderboard;
    }

    async getAroundPlayer(playerId, range = 5) {
        const rank = await this.getRank(playerId);
        if (!rank) return [];

        const start = Math.max(0, rank - range - 1);
        const end = rank + range - 1;

        return redis.zrevrange(this.key, start, end, 'WITHSCORES');
    }
}
```

## Connection Pooling

```javascript
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    database: 'game',
    max: 20,                    // Max connections
    idleTimeoutMillis: 30000,   // Close idle connections
    connectionTimeoutMillis: 2000
});

// Transaction wrapper
async function withTransaction(callback) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

// Usage: Atomic currency transfer
await withTransaction(async (client) => {
    await client.query(
        'UPDATE players SET coins = coins - $1 WHERE id = $2',
        [amount, senderId]
    );
    await client.query(
        'UPDATE players SET coins = coins + $1 WHERE id = $2',
        [amount, receiverId]
    );
});
```

## Caching Strategy

```javascript
class CachedPlayerService {
    constructor(db, redis) {
        this.db = db;
        this.redis = redis;
        this.ttl = 3600; // 1 hour
    }

    async getPlayer(playerId) {
        const cacheKey = `player:${playerId}`;

        // Try cache first
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        // Cache miss - load from DB
        const player = await this.db.query(
            'SELECT * FROM players WHERE id = $1',
            [playerId]
        );

        if (player.rows[0]) {
            // Cache for future requests
            await this.redis.setex(
                cacheKey,
                this.ttl,
                JSON.stringify(player.rows[0])
            );
        }

        return player.rows[0];
    }

    async updatePlayer(playerId, updates) {
        // Update DB
        await this.db.query(
            'UPDATE players SET mmr = $1 WHERE id = $2',
            [updates.mmr, playerId]
        );

        // Invalidate cache
        await this.redis.del(`player:${playerId}`);
    }
}
```

## Troubleshooting

### Common Failure Modes

| Error | Root Cause | Solution |
|-------|------------|----------|
| Connection timeout | Pool exhausted | Increase pool size |
| Deadlock | Lock contention | Fix lock ordering |
| Slow queries | Missing index | Add indexes |
| Cache stampede | Mass expiration | Staggered TTL |
| Stale data | Cache inconsistency | Invalidation strategy |

### Debug Checklist

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'game';

-- Find slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC LIMIT 10;

-- Check index usage
SELECT relname, seq_scan, idx_scan
FROM pg_stat_user_tables
WHERE seq_scan > idx_scan;

-- Table sizes
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC;
```

```bash
# Redis diagnostics
redis-cli INFO stats
redis-cli SLOWLOG GET 10
redis-cli MEMORY DOCTOR
```

## Unit Test Template

```javascript
const { Pool } = require('pg');

describe('Database Operations', () => {
    let pool;

    beforeAll(async () => {
        pool = new Pool({ database: 'game_test' });
    });

    afterAll(async () => {
        await pool.end();
    });

    test('creates player with default values', async () => {
        const result = await pool.query(
            `INSERT INTO players (username, email)
             VALUES ($1, $2) RETURNING *`,
            ['testuser', 'test@example.com']
        );

        expect(result.rows[0].mmr).toBe(1000);
        expect(result.rows[0].level).toBe(1);
    });

    test('leaderboard returns correct rank', async () => {
        const lb = new Leaderboard('test');

        await lb.setScore('player1', 1000);
        await lb.setScore('player2', 2000);
        await lb.setScore('player3', 1500);

        expect(await lb.getRank('player2')).toBe(1);
        expect(await lb.getRank('player3')).toBe(2);
        expect(await lb.getRank('player1')).toBe(3);
    });

    test('transaction rollback on error', async () => {
        const initialCoins = 1000;

        try {
            await withTransaction(async (client) => {
                await client.query(
                    'UPDATE players SET coins = coins - 500 WHERE id = $1',
                    [playerId]
                );
                throw new Error('Simulated failure');
            });
        } catch (e) {
            // Expected
        }

        // Verify rollback
        const result = await pool.query(
            'SELECT coins FROM players WHERE id = $1',
            [playerId]
        );
        expect(result.rows[0].coins).toBe(initialCoins);
    });
});
```

## Resources

- `assets/` - Schema templates
- `references/` - Database optimization guides
