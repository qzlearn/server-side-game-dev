---
name: multithreading
description: Multithreading and concurrency patterns for game servers including synchronization primitives
sasmp_version: "1.3.0"
bonded_agent: 01-game-server-architect
bond_type: SECONDARY_BOND
---

# Multithreading for Game Servers

Implement **thread-safe game server architectures** with proper synchronization.

## Threading Models

| Model | Pros | Cons | Use Case |
|-------|------|------|----------|
| Single-threaded | Simple, predictable | Limited scale | Casual games |
| Thread-per-connection | Simple | High overhead | Small servers |
| Thread pool | Efficient | Complex | Most games |
| Actor model | No locks | Learning curve | Distributed |

## Synchronization Primitives

### Mutex (Mutual Exclusion)
```cpp
std::mutex game_state_mutex;

void updatePlayerPosition(int playerId, Vector3 pos) {
    std::lock_guard<std::mutex> lock(game_state_mutex);
    players[playerId].position = pos;
}
```

### Read-Write Lock
```cpp
std::shared_mutex players_rwlock;

// Multiple readers
Vector3 getPlayerPosition(int playerId) {
    std::shared_lock<std::shared_mutex> lock(players_rwlock);
    return players[playerId].position;
}

// Single writer
void setPlayerPosition(int playerId, Vector3 pos) {
    std::unique_lock<std::shared_mutex> lock(players_rwlock);
    players[playerId].position = pos;
}
```

### Spinlock (Low Latency)
```cpp
std::atomic_flag spinlock = ATOMIC_FLAG_INIT;

void criticalSection() {
    while (spinlock.test_and_set(std::memory_order_acquire)) {
        // Spin
    }
    // Critical section
    spinlock.clear(std::memory_order_release);
}
```

## Lock-Free Patterns

```cpp
// Lock-free player state updates
struct PlayerState {
    std::atomic<Vector3> position;
    std::atomic<int> health;
};

// Compare-and-swap for safe updates
bool tryDamagePlayer(int damage) {
    int current = health.load();
    int newHealth = current - damage;
    return health.compare_exchange_strong(current, newHealth);
}
```

## Thread Pool Pattern

```cpp
class GameThreadPool {
    std::vector<std::thread> workers;
    std::queue<std::function<void()>> tasks;
    std::mutex queue_mutex;
    std::condition_variable condition;
    bool stop = false;

public:
    void enqueue(std::function<void()> task) {
        {
            std::unique_lock<std::mutex> lock(queue_mutex);
            tasks.push(std::move(task));
        }
        condition.notify_one();
    }
};
```

## Common Pitfalls

| Problem | Solution |
|---------|----------|
| Deadlock | Lock ordering, timeout |
| Priority inversion | Priority inheritance |
| False sharing | Cache line padding |
| Race conditions | Atomic operations |

See `assets/` for threading patterns.
