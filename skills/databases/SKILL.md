---
name: databases
description: Game data persistence with player profiles, leaderboards, inventory systems using Redis and PostgreSQL
sasmp_version: "1.3.0"
bonded_agent: 06-database-specialist
bond_type: PRIMARY_BOND
---

# Game Databases

Implement **efficient data persistence** for players, matches, and leaderboards.

## Player Profile (PostgreSQL)

```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(32) UNIQUE NOT NULL,
  mmr INTEGER DEFAULT 1000,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Leaderboard (Redis)

```javascript
// Add score
await redis.zadd('leaderboard:global', player.mmr, player.id);

// Get rank
const rank = await redis.zrevrank('leaderboard:global', player.id);

// Get top 100
const top = await redis.zrevrange('leaderboard:global', 0, 99, 'WITHSCORES');
```

See `assets/` for schema templates and `references/` for database guides.
