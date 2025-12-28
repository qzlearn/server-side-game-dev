---
description: Monitor game server health, performance, and player metrics
allowed-tools: Read, Bash
---

# /monitor

Monitor **game server health** and performance.

## Usage

```
/monitor [--dashboard] [--alerts]
```

## Metrics Tracked

| Metric | Description |
|--------|-------------|
| Players | Active connections |
| Matches | Running games |
| Latency | Network RTT |
| CPU/Memory | Resource usage |
| Tick Rate | Game loop frequency |

## Dashboards

- Grafana: http://localhost:3000
- Prometheus: http://localhost:9090
