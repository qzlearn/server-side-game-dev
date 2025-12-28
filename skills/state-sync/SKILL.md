---
name: state-sync
description: Game state synchronization, snapshot systems, and conflict resolution for consistent multiplayer experience
sasmp_version: "1.3.0"
bonded_agent: 04-state-sync-expert
bond_type: PRIMARY_BOND
---

# State Synchronization

Ensure **consistent game state** across all connected players.

## Delta Synchronization

Only send changed state to minimize bandwidth:

```javascript
function calculateDelta(previous, current) {
  const delta = {};
  for (const key in current) {
    if (JSON.stringify(previous[key]) !== JSON.stringify(current[key])) {
      delta[key] = current[key];
    }
  }
  return delta;
}
```

## Snapshot Interpolation

Smooth entity movement between server updates by interpolating between snapshots.

See `assets/` for sync templates and `references/` for best practices.
