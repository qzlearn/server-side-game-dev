---
name: networking
description: Game networking protocols, WebSocket/UDP implementation, latency optimization for real-time multiplayer
sasmp_version: "1.3.0"
bonded_agent: 02-networking-specialist
bond_type: PRIMARY_BOND
---

# Game Networking

Implement **real-time multiplayer networking** with WebSocket, UDP, and latency optimization techniques.

## WebSocket Game Server

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const players = new Map();

wss.on('connection', (ws) => {
  const playerId = generateId();
  players.set(playerId, { ws, state: {} });

  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    handleGameMessage(playerId, msg);
  });

  ws.on('close', () => {
    players.delete(playerId);
    broadcast({ type: 'player_left', playerId });
  });
});

function broadcast(msg) {
  const data = JSON.stringify(msg);
  players.forEach(p => p.ws.send(data));
}
```

## UDP for Low Latency

Use UDP for time-sensitive data like player positions. Implement reliability layer for important messages.

## Resources

- See `assets/` for server templates
- See `scripts/` for network testing
- See `references/` for protocol guides
