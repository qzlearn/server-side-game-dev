# Game Networking Protocols Reference

## Protocol Comparison

| Protocol | Reliability | Latency | Use Case |
|----------|-------------|---------|----------|
| TCP | Guaranteed | High | Chat, inventory |
| UDP | None | Low | Position updates |
| WebSocket | Guaranteed | Medium | Web games |
| QUIC | Configurable | Low | Modern games |

## Message Format

### Binary Protocol (Efficient)

```
┌────────┬──────────┬───────────┬─────────┐
│  Type  │ Sequence │ Timestamp │ Payload │
│ 1 byte │ 2 bytes  │  4 bytes  │ N bytes │
└────────┴──────────┴───────────┴─────────┘
```

### JSON Protocol (Flexible)

```json
{
  "type": "player_move",
  "seq": 12345,
  "ts": 1704825600000,
  "data": {
    "x": 100.5,
    "y": 200.3,
    "rotation": 45.0
  }
}
```

## Latency Compensation

### Client-Side Prediction

1. Apply input locally immediately
2. Send input to server
3. Server validates and broadcasts
4. Client reconciles with server state

### Server Reconciliation

```javascript
// Server corrects client prediction
if (serverState.x !== clientPrediction.x) {
  // Smooth correction over multiple frames
  client.correction = lerp(
    clientPrediction,
    serverState,
    0.1
  );
}
```

## Best Practices

- [ ] Use binary for high-frequency messages
- [ ] Implement sequence numbers
- [ ] Add timestamps for ordering
- [ ] Compress large payloads
- [ ] Rate limit messages
