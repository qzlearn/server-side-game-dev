---
name: design-patterns
description: Game server design patterns including ECS, command pattern, and event sourcing
sasmp_version: "1.3.0"
bonded_agent: 01-game-server-architect
bond_type: SECONDARY_BOND
---

# Design Patterns for Game Servers

Apply **proven design patterns** for scalable, maintainable game server architecture.

## Essential Patterns

| Pattern | Purpose | Use Case |
|---------|---------|----------|
| ECS | Data-oriented design | Entity management |
| Command | Action encapsulation | Input replay, undo |
| Observer | Event notification | State changes |
| State Machine | State transitions | Player states |
| Object Pool | Memory efficiency | Bullets, particles |

## Entity Component System (ECS)

```cpp
// Components - pure data
struct Position { float x, y, z; };
struct Velocity { float dx, dy, dz; };
struct Health { int current, max; };

// System - logic
class MovementSystem {
    void update(float dt) {
        for (auto [pos, vel] : query<Position, Velocity>()) {
            pos.x += vel.dx * dt;
            pos.y += vel.dy * dt;
            pos.z += vel.dz * dt;
        }
    }
};
```

## Command Pattern

```cpp
struct GameCommand {
    uint64_t tick;
    uint32_t playerId;
    virtual void execute(GameState& state) = 0;
};

struct MoveCommand : GameCommand {
    Vector3 direction;

    void execute(GameState& state) override {
        state.players[playerId].velocity = direction * speed;
    }
};

// Replay system
std::vector<GameCommand*> commandHistory;
void replay() {
    for (auto& cmd : commandHistory) {
        cmd->execute(gameState);
    }
}
```

## Event Sourcing

```cpp
// Events are the source of truth
struct GameEvent {
    uint64_t timestamp;
    virtual void apply(GameState& state) = 0;
};

struct PlayerDamaged : GameEvent {
    uint32_t playerId;
    int damage;
    uint32_t sourceId;

    void apply(GameState& state) override {
        state.players[playerId].health -= damage;
    }
};

// Rebuild state from events
GameState rebuildFromEvents(vector<GameEvent>& events) {
    GameState state;
    for (auto& e : events) e.apply(state);
    return state;
}
```

## Object Pool

```cpp
template<typename T, size_t N>
class ObjectPool {
    std::array<T, N> objects;
    std::stack<T*> available;

public:
    T* acquire() {
        if (available.empty()) return nullptr;
        T* obj = available.top();
        available.pop();
        return obj;
    }

    void release(T* obj) {
        obj->reset();
        available.push(obj);
    }
};
```

## State Machine

```cpp
enum class PlayerState {
    Idle, Running, Jumping, Attacking, Dead
};

class PlayerStateMachine {
    PlayerState current = PlayerState::Idle;

    void transition(PlayerState newState) {
        if (isValidTransition(current, newState)) {
            onExit(current);
            current = newState;
            onEnter(current);
        }
    }
};
```

See `assets/` for pattern implementations.
