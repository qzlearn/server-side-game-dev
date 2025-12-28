---
name: async-programming
description: Asynchronous programming models including coroutines, async/await, and reactive patterns
sasmp_version: "1.3.0"
bonded_agent: 01-game-server-architect
bond_type: SECONDARY_BOND
---

# Async Programming for Game Servers

Implement **efficient asynchronous patterns** for scalable game server code.

## Async Models Comparison

| Model | Language | Overhead | Complexity |
|-------|----------|----------|------------|
| **async/await** | C#, JS, Rust | Low | Low |
| **Coroutines** | C++20, Kotlin | Very Low | Medium |
| **Goroutines** | Go | Very Low | Low |
| **Futures** | C++, Java | Medium | Medium |
| **Reactive** | All | Low | High |

## C# async/await

```csharp
public class GameServer
{
    public async Task HandlePlayerAsync(Player player)
    {
        while (player.Connected)
        {
            // Non-blocking read
            var message = await player.ReadMessageAsync();

            // Process with async DB call
            var result = await ProcessCommandAsync(message);

            // Non-blocking write
            await player.SendAsync(result);
        }
    }

    private async Task<GameState> ProcessCommandAsync(Message msg)
    {
        // Parallel async operations
        var tasks = new[]
        {
            ValidateAsync(msg),
            LoadPlayerDataAsync(msg.PlayerId),
            CheckPermissionsAsync(msg.PlayerId)
        };

        await Task.WhenAll(tasks);
        return ApplyCommand(msg);
    }
}
```

## Go Goroutines

```go
func (s *Server) handlePlayer(conn net.Conn) {
    player := NewPlayer(conn)
    defer player.Close()

    // Separate goroutines for read/write
    readChan := make(chan Message, 100)
    writeChan := make(chan Message, 100)

    go player.readLoop(readChan)
    go player.writeLoop(writeChan)

    for msg := range readChan {
        result := s.processMessage(msg)
        writeChan <- result
    }
}

// Process many players concurrently
func (s *Server) acceptLoop() {
    for {
        conn, _ := s.listener.Accept()
        go s.handlePlayer(conn)  // Goroutine per player
    }
}
```

## C++20 Coroutines

```cpp
#include <coroutine>

Task<void> handlePlayer(Connection& conn) {
    while (conn.isOpen()) {
        auto msg = co_await conn.readAsync();
        auto result = co_await processAsync(msg);
        co_await conn.writeAsync(result);
    }
}

// Generator for game updates
Generator<GameState> gameLoop() {
    while (running) {
        updatePhysics();
        updateAI();
        co_yield currentState;
    }
}
```

## Rust async/await

```rust
async fn handle_player(stream: TcpStream) -> Result<()> {
    let (reader, writer) = stream.split();
    let mut reader = BufReader::new(reader);
    let mut writer = BufWriter::new(writer);

    loop {
        let msg = read_message(&mut reader).await?;
        let response = process_command(&msg).await;
        write_message(&mut writer, &response).await?;
    }
}

// Spawn many concurrent tasks
#[tokio::main]
async fn main() {
    let listener = TcpListener::bind("0.0.0.0:8080").await?;
    loop {
        let (socket, _) = listener.accept().await?;
        tokio::spawn(async move {
            handle_player(socket).await
        });
    }
}
```

## Best Practices

| Practice | Benefit |
|----------|---------|
| Avoid blocking in async | Prevents thread starvation |
| Use cancellation tokens | Clean shutdown |
| Limit concurrency | Prevent resource exhaustion |
| Structured concurrency | Proper error handling |

See `assets/` for async patterns.
