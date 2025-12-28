---
name: game-loop
description: Server-side game loop implementation with fixed timestep, physics simulation, and tick rate optimization
sasmp_version: "1.3.0"
bonded_agent: 05-game-loop-developer
bond_type: PRIMARY_BOND
---

# Server Game Loop

Implement **deterministic game loops** with fixed timestep for consistent gameplay.

## Fixed Timestep Loop

```javascript
const TICK_RATE = 60;
const TICK_MS = 1000 / TICK_RATE;

let lastTick = Date.now();
let accumulator = 0;

function gameLoop() {
  const now = Date.now();
  accumulator += now - lastTick;
  lastTick = now;

  while (accumulator >= TICK_MS) {
    update(TICK_MS);
    accumulator -= TICK_MS;
  }

  setImmediate(gameLoop);
}
```

See `assets/` for loop templates and `references/` for optimization guides.
