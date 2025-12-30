---
description: Monitor game server health, performance, and player metrics
allowed-tools: Read, Bash
version: "2.0.0"

# Input Schema
input:
  required: []
  optional:
    - dashboard
    - alerts
    - duration
    - namespace
  validation:
    dashboard:
      type: boolean
      default: false
    alerts:
      type: boolean
      default: false
    duration:
      type: string
      enum: [1h, 6h, 24h, 7d]
      default: 1h
    namespace:
      type: string
      default: production

# Output Schema
output:
  success:
    status: string
    metrics:
      players: integer
      matches: integer
      latency_p99_ms: number
      tick_rate_hz: number
      cpu_percent: number
      memory_percent: number
    alerts_firing: array
  error:
    code: string
    message: string

# Alert Thresholds
alert_thresholds:
  latency_p99_ms: 100
  tick_rate_hz_min: 55
  cpu_percent: 85
  memory_percent: 90
  error_rate_percent: 5
---

# /monitor

Monitor **game server health** and performance in real-time.

## Usage

```bash
/monitor [--dashboard] [--alerts] [--duration=1h] [--namespace=production]
```

## Key Metrics

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| Players | Active connections | - | < 10 (warn) |
| Matches | Running games | - | 0 (warn) |
| Latency P99 | Network RTT | < 50ms | > 100ms |
| Tick Rate | Game loop freq | 60 Hz | < 55 Hz |
| CPU | Resource usage | < 70% | > 85% |
| Memory | Resource usage | < 80% | > 90% |

## Quick Status Check

```bash
# Get current metrics
curl -s http://localhost:9090/api/v1/query?query=game_active_players | jq .

# Check all targets
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets | length'

# List firing alerts
curl -s http://localhost:9090/api/v1/alerts | jq '.data.alerts[] | select(.state=="firing")'
```

## Dashboard Queries

### Player Metrics
```promql
# Active players by region
sum by (region) (game_active_players)

# Player join/leave rate
rate(game_player_joins_total[5m])
rate(game_player_leaves_total[5m])
```

### Performance Metrics
```promql
# Tick rate
rate(game_tick_total[1m])

# Tick duration P99
histogram_quantile(0.99, rate(game_tick_duration_seconds_bucket[5m]))

# Network latency P99
histogram_quantile(0.99, rate(game_network_latency_seconds_bucket[5m]))
```

### Resource Metrics
```promql
# CPU usage
sum(rate(container_cpu_usage_seconds_total{pod=~"game-server.*"}[5m])) by (pod)

# Memory usage
sum(container_memory_working_set_bytes{pod=~"game-server.*"}) by (pod)
```

## Dashboards

| Dashboard | URL | Purpose |
|-----------|-----|---------|
| Game Overview | http://localhost:3000/d/game-overview | High-level metrics |
| Server Performance | http://localhost:3000/d/server-perf | Detailed performance |
| Player Analytics | http://localhost:3000/d/players | Player behavior |
| Alerts | http://localhost:3000/alerting/list | Alert management |

## Alert Rules

```yaml
groups:
- name: game-server-alerts
  rules:
  - alert: GameServerDown
    expr: up{job="game-server"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Game server {{ $labels.instance }} is down"

  - alert: HighLatency
    expr: histogram_quantile(0.99, rate(game_network_latency_seconds_bucket[5m])) > 0.1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High latency detected: {{ $value | humanizeDuration }}"

  - alert: LowTickRate
    expr: rate(game_tick_total[1m]) < 55
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "Game tick rate dropped to {{ $value }} Hz"
```

## Troubleshooting

### Common Failure Modes

| Symptom | Root Cause | Solution |
|---------|------------|----------|
| No metrics | Scrape failure | Check Prometheus targets |
| Stale data | Exporter crash | Restart metrics exporter |
| Alert storm | Flapping threshold | Tune alert for duration |
| Dashboard slow | Too many queries | Add recording rules |

### Debug Checklist

```bash
# Check Prometheus health
curl http://localhost:9090/-/healthy

# Check Grafana health
curl http://localhost:3000/api/health

# List all metrics
curl http://localhost:9090/api/v1/label/__name__/values | jq '.data | length'

# Check service discovery
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets'
```

## Example Output

```
Game Server Status: HEALTHY
========================

Environment: production
Time Range: Last 1 hour

┌─────────────┬────────┬──────────┐
│ Metric      │ Value  │ Status   │
├─────────────┼────────┼──────────┤
│ Players     │ 1,234  │ ✓ Normal │
│ Matches     │ 89     │ ✓ Normal │
│ Latency P99 │ 42ms   │ ✓ Normal │
│ Tick Rate   │ 60 Hz  │ ✓ Normal │
│ CPU         │ 45%    │ ✓ Normal │
│ Memory      │ 62%    │ ✓ Normal │
└─────────────┴────────┴──────────┘

Alerts: 0 firing, 0 pending

Dashboard: http://localhost:3000/d/game-overview
```
