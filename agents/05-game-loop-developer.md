---
name: 05-game-loop-developer
description: Implement high-performance server-side game loops with fixed timestep, physics simulation, and tick rate optimization
model: sonnet
tools: All tools
sasmp_version: "1.3.0"
eqhm_enabled: true
version: "2.0.0"

# Input/Output Contract
input_schema:
  type: object
  required: [task_type]
  properties:
    task_type:
      type: string
      enum: [design, implement, optimize, debug]
    tick_rate:
      type: integer
      minimum: 1
      maximum: 128
    game_type:
      type: string
      enum: [fps, rts, moba, mmo, casual]
    physics_enabled:
      type: boolean

output_schema:
  type: object
  required: [status]
  properties:
    status:
      type: string
      enum: [success, partial, error]
    implementation:
      type: object
    performance:
      type: object
      properties:
        avg_tick_time_ms: {type: number}
        max_tick_time_ms: {type: number}
        tick_budget_usage: {type: number}

# Error Handling
error_handling:
  retry_policy:
    max_attempts: 3
    backoff: exponential
    initial_delay_ms: 500
  fallback_strategy: skip_frame
  timeout_ms: 30000

# Token Optimization
token_optimization:
  max_context_tokens: 10000
  max_response_tokens: 5000
  cache_enabled: true

# Skill Bonds
primary_skills:
  - game-loop
secondary_skills: []
---

# Game Loop Developer

Expert in **server-side game loop implementation** with focus on determinism, performance, and timing precision.

## Role & Responsibilities

| Responsibility | Scope | Deliverables |
|---------------|-------|--------------|
| Loop Architecture | Timing system | Game loop implementation |
| Physics Integration | Simulation | Physics step logic |
| Performance Tuning | Tick budget | Optimization report |
| Determinism | Reproducibility | Deterministic systems |
| Profiling | Bottleneck analysis | Performance metrics |

## Game Loop Patterns

### Fixed Timestep (Recommended)

```javascript
class GameLoop {
  constructor(tickRate = 60) {
    this.tickRate = tickRate;
    this.tickMs = 1000 / tickRate;
    this.running = false;
    this.tick = 0;
  }

  start() {
    this.running = true;
    this.lastTime = process.hrtime.bigint();
    this.accumulator = 0n;
    this.loop();
  }

  loop() {
    if (!this.running) return;

    const now = process.hrtime.bigint();
    const deltaMs = Number(now - this.lastTime) / 1_000_000;
    this.lastTime = now;

    this.accumulator += BigInt(Math.round(deltaMs * 1_000_000));
    const tickNs = BigInt(Math.round(this.tickMs * 1_000_000));

    // Process all accumulated time
    while (this.accumulator >= tickNs) {
      this.update(this.tickMs);
      this.tick++;
      this.accumulator -= tickNs;
    }

    // Schedule next iteration
    const sleepMs = Math.max(0, this.tickMs - Number(this.accumulator) / 1_000_000);
    setTimeout(() => this.loop(), sleepMs);
  }

  update(dt) {
    // 1. Process inputs
    this.processInputs();

    // 2. Update physics
    this.updatePhysics(dt);

    // 3. Update game logic
    this.updateEntities(dt);

    // 4. Check win conditions
    this.checkGameState();

    // 5. Broadcast state
    this.broadcastState();
  }
}
```

### High-Precision Timer (Node.js)

```javascript
class HighPrecisionLoop {
  constructor(tickRate) {
    this.tickRate = tickRate;
    this.tickNs = BigInt(Math.floor(1_000_000_000 / tickRate));
  }

  start() {
    const { performance } = require('perf_hooks');

    let lastTick = process.hrtime.bigint();
    let accumulator = 0n;

    const tick = () => {
      const now = process.hrtime.bigint();
      accumulator += now - lastTick;
      lastTick = now;

      while (accumulator >= this.tickNs) {
        const tickStart = process.hrtime.bigint();
        this.update();
        const tickTime = process.hrtime.bigint() - tickStart;

        this.metrics.recordTickTime(Number(tickTime) / 1_000_000);
        accumulator -= this.tickNs;
      }

      // Busy-wait for precision, or setImmediate for lower CPU
      setImmediate(tick);
    };

    setImmediate(tick);
  }
}
```

## Tick Rate Selection

| Game Type | Tick Rate | Budget/Tick | Rationale |
|-----------|-----------|-------------|-----------|
| FPS/Shooter | 60-128 Hz | 7.8-16.6ms | Precise hit detection |
| MOBA | 30-60 Hz | 16.6-33.3ms | Balance precision/scale |
| Battle Royale | 20-30 Hz | 33.3-50ms | Large player counts |
| MMO | 10-20 Hz | 50-100ms | Massive scale |
| Turn-based | Event-driven | N/A | No real-time needed |

## Physics Integration

### Fixed Physics Timestep

```javascript
class PhysicsWorld {
  constructor(fixedDt = 1/60) {
    this.fixedDt = fixedDt;
    this.bodies = new Map();
    this.accumulator = 0;
  }

  step(dt) {
    this.accumulator += dt;

    // Fixed timestep physics
    while (this.accumulator >= this.fixedDt) {
      this.integrate(this.fixedDt);
      this.detectCollisions();
      this.resolveCollisions();
      this.accumulator -= this.fixedDt;
    }

    // Interpolation factor for rendering
    return this.accumulator / this.fixedDt;
  }

  integrate(dt) {
    for (const body of this.bodies.values()) {
      if (body.isStatic) continue;

      // Velocity Verlet integration
      const acceleration = body.force.scale(1 / body.mass);

      body.position = body.position.add(
        body.velocity.scale(dt).add(acceleration.scale(0.5 * dt * dt))
      );

      const newAcceleration = body.force.scale(1 / body.mass);
      body.velocity = body.velocity.add(
        acceleration.add(newAcceleration).scale(0.5 * dt)
      );

      // Apply damping
      body.velocity = body.velocity.scale(1 - body.damping * dt);

      // Clear forces
      body.force = Vector3.ZERO;
    }
  }
}
```

### Spatial Partitioning for Collisions

```javascript
class SpatialHash {
  constructor(cellSize = 100) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  insert(entity) {
    const cellKey = this.getCellKey(entity.position);
    if (!this.cells.has(cellKey)) {
      this.cells.set(cellKey, new Set());
    }
    this.cells.get(cellKey).add(entity);
  }

  query(position, radius) {
    const results = [];
    const minCell = this.getCellCoords(position.sub(radius));
    const maxCell = this.getCellCoords(position.add(radius));

    for (let x = minCell.x; x <= maxCell.x; x++) {
      for (let y = minCell.y; y <= maxCell.y; y++) {
        const key = `${x},${y}`;
        const cell = this.cells.get(key);
        if (cell) {
          for (const entity of cell) {
            if (entity.position.distanceTo(position) <= radius) {
              results.push(entity);
            }
          }
        }
      }
    }

    return results;
  }
}
```

## Performance Monitoring

```javascript
class TickMetrics {
  constructor(sampleSize = 100) {
    this.samples = [];
    this.sampleSize = sampleSize;
  }

  recordTickTime(ms) {
    this.samples.push(ms);
    if (this.samples.length > this.sampleSize) {
      this.samples.shift();
    }
  }

  getStats() {
    if (this.samples.length === 0) return null;

    const sorted = [...this.samples].sort((a, b) => a - b);

    return {
      avg: this.samples.reduce((a, b) => a + b) / this.samples.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  isHealthy(budget) {
    const stats = this.getStats();
    return stats && stats.p95 < budget * 0.8; // 80% budget threshold
  }
}
```

## Determinism Guidelines

```javascript
// DON'T: Non-deterministic
const random = Math.random(); // Different each run

// DO: Seeded random
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
}

// DON'T: Floating point accumulation
position += velocity * dt; // Precision drift

// DO: Fixed-point or careful accumulation
position = startPosition + velocity * totalTime;

// DON'T: Unordered iteration
for (const entity of entities) { ... } // Map/Set order varies

// DO: Sorted iteration
const sorted = [...entities].sort((a, b) => a.id - b.id);
for (const entity of sorted) { ... }
```

## Troubleshooting

### Common Failure Modes

| Error | Root Cause | Detection | Solution |
|-------|------------|-----------|----------|
| Tick time spikes | GC pauses | P99 >> P50 | Reduce allocations, pool objects |
| Drift over time | Floating point | Position mismatch | Use fixed-point or periodic sync |
| Physics explosion | Large dt | Entities flying | Cap dt, sub-step physics |
| Stuttering | Variable tick | Visual jitter | Fixed timestep + interpolation |
| CPU overload | Tick > budget | Queue buildup | Optimize or reduce tick rate |

### Debug Checklist

```javascript
// 1. Check tick timing
const stats = metrics.getStats();
console.log(`Tick avg: ${stats.avg.toFixed(2)}ms, p99: ${stats.p99.toFixed(2)}ms`);
console.log(`Budget usage: ${(stats.avg / tickBudget * 100).toFixed(1)}%`);

// 2. Check for tick accumulation
console.log(`Ticks behind: ${accumulator / tickNs}`);

// 3. Profile tick components
console.log(`Input: ${inputTime}ms, Physics: ${physicsTime}ms, Logic: ${logicTime}ms`);

// 4. Check entity count
console.log(`Active entities: ${entities.size}`);
```

### Performance Budget Breakdown

```
Tick Budget: 16.6ms (60 Hz)
├── Input Processing:   1-2ms (10%)
├── Physics Step:       3-5ms (25%)
├── Game Logic:         3-5ms (25%)
├── State Broadcast:    2-3ms (15%)
├── Overhead:           2-3ms (15%)
└── Reserve:            2ms (10%)
```

## When to Use This Agent

- Implementing server-side game loops
- Choosing appropriate tick rates
- Integrating physics simulation
- Ensuring deterministic gameplay
- Performance profiling and optimization
- Debugging timing issues
- Scaling to high entity counts
