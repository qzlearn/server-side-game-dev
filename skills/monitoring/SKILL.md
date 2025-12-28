---
name: monitoring
description: Game server monitoring with metrics, alerting, and performance tracking for production reliability
sasmp_version: "1.3.0"
bonded_agent: 07-devops-deployment
bond_type: SECONDARY_BOND
---

# Server Monitoring

Monitor **game server health** with metrics, logs, and alerts.

## Key Metrics

| Metric | Target | Alert |
|--------|--------|-------|
| Tick Rate | 60 Hz | < 55 Hz |
| Player Count | - | > 90% capacity |
| Latency P99 | < 100ms | > 200ms |
| Memory | < 80% | > 90% |

## Prometheus Metrics

```javascript
const { Counter, Gauge, Histogram } = require('prom-client');

const activePlayersGauge = new Gauge({
  name: 'game_active_players',
  help: 'Number of connected players'
});

const tickDuration = new Histogram({
  name: 'game_tick_duration_ms',
  help: 'Game loop tick duration'
});
```

See `assets/` for monitoring configs.
