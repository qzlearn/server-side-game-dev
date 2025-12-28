---
description: Run network latency and stress tests on game server
allowed-tools: Read, Bash
---

# /network-test

Test **game server networking** with latency and load testing.

## Usage

```
/network-test [server-url] [--clients=100] [--duration=60]
```

## Tests Performed

1. **Connection Test** - Verify WebSocket connection
2. **Latency Test** - Measure round-trip time
3. **Load Test** - Simulate concurrent players
4. **Stress Test** - Find breaking point

## Example Output

```
Server: ws://localhost:8080
Clients: 100
Duration: 60s

Results:
- Connections: 100/100 successful
- Latency P50: 12ms
- Latency P99: 45ms
- Messages/sec: 10,000
```
