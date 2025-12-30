---
name: async-programming
description: Asynchronous programming models including coroutines, async/await, and reactive patterns
sasmp_version: "1.3.0"
version: "2.0.0"
bonded_agent: 01-game-server-architect
bond_type: SECONDARY_BOND

# Parameters
parameters:
  required:
    - async_model
  optional:
    - concurrency_limit
    - timeout_ms
  validation:
    async_model:
      type: string
      enum: [async_await, coroutines, goroutines, futures, reactive]
    concurrency_limit:
      type: integer
      min: 1
      max: 10000
      default: 1000
    timeout_ms:
      type: integer
      min: 100
      max: 60000
      default: 30000

# Retry Configuration
retry_config:
  max_attempts: 3
  backoff: exponential
  initial_delay_ms: 100
  retryable_errors:
    - TIMEOUT
    - CONNECTION_RESET

# Observability
observability:
  logging:
    level: debug
    fields: [task_id, async_model, duration_ms]
  metrics:
    - name: async_tasks_active
      type: gauge
    - name: async_task_duration_seconds
      type: histogram
    - name: async_errors_total
      type: counter
    - name: event_loop_lag_ms
      type: gauge
---

# Async Programming for Game Servers

Implement **efficient asynchronous patterns** for scalable game server code.

## Async Models Comparison

| Model | Language | Overhead | Complexity | Best For |
|-------|----------|----------|------------|----------|
| **async/await** | C#, JS, Rust | Low | Low | I/O bound |
| **Coroutines** | C++20, Kotlin | Very Low | Medium | High performance |
| **Goroutines** | Go | Very Low | Low | Concurrent services |
| **Futures** | C++, Java | Medium | Medium | Composable async |
| **Reactive** | All | Low | High | Stream processing |

## C# async/await

```csharp
public class GameServer
{
    private readonly SemaphoreSlim _connectionLimit = new(1000);
    private readonly CancellationTokenSource _cts = new();

    public async Task HandlePlayerAsync(
        Player player,
        CancellationToken cancellationToken = default)
    {
        // Combine with server shutdown token
        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(
            cancellationToken, _cts.Token);
        var token = linkedCts.Token;

        try
        {
            await _connectionLimit.WaitAsync(token);

            while (player.Connected && !token.IsCancellationRequested)
            {
                // Non-blocking read with timeout
                using var timeoutCts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
                using var combinedCts = CancellationTokenSource.CreateLinkedTokenSource(
                    token, timeoutCts.Token);

                var message = await player.ReadMessageAsync(combinedCts.Token);
                var result = await ProcessCommandAsync(message, token);
                await player.SendAsync(result, token);
            }
        }
        catch (OperationCanceledException) when (token.IsCancellationRequested)
        {
            // Graceful shutdown
        }
        finally
        {
            _connectionLimit.Release();
        }
    }

    private async Task<GameState> ProcessCommandAsync(
        Message msg,
        CancellationToken token)
    {
        // Parallel async operations with structured concurrency
        var validationTask = ValidateAsync(msg, token);
        var playerDataTask = LoadPlayerDataAsync(msg.PlayerId, token);
        var permissionsTask = CheckPermissionsAsync(msg.PlayerId, token);

        await Task.WhenAll(validationTask, playerDataTask, permissionsTask);

        // All tasks completed - apply command
        return ApplyCommand(msg,
            await validationTask,
            await playerDataTask,
            await permissionsTask);
    }

    public async Task GracefulShutdownAsync()
    {
        _cts.Cancel();
        // Wait for all connections to drain
        await Task.Delay(TimeSpan.FromSeconds(30));
    }
}
```

## Go Goroutines

```go
type Server struct {
    listener  net.Listener
    players   sync.Map
    wg        sync.WaitGroup
    quit      chan struct{}
    semaphore chan struct{}  // Connection limiter
}

func NewServer(maxConnections int) *Server {
    return &Server{
        quit:      make(chan struct{}),
        semaphore: make(chan struct{}, maxConnections),
    }
}

func (s *Server) AcceptLoop() {
    for {
        conn, err := s.listener.Accept()
        if err != nil {
            select {
            case <-s.quit:
                return  // Server shutting down
            default:
                log.Printf("Accept error: %v", err)
                continue
            }
        }

        // Rate limit connections
        select {
        case s.semaphore <- struct{}{}:
            s.wg.Add(1)
            go s.handlePlayer(conn)
        default:
            conn.Close()  // At capacity
        }
    }
}

func (s *Server) handlePlayer(conn net.Conn) {
    defer func() {
        <-s.semaphore
        s.wg.Done()
        conn.Close()
    }()

    player := NewPlayer(conn)
    s.players.Store(player.ID, player)
    defer s.players.Delete(player.ID)

    // Separate goroutines for read/write with channels
    readChan := make(chan Message, 100)
    writeChan := make(chan Message, 100)
    errChan := make(chan error, 2)

    go func() {
        errChan <- player.readLoop(readChan)
    }()
    go func() {
        errChan <- player.writeLoop(writeChan)
    }()

    for {
        select {
        case msg := <-readChan:
            result := s.processMessage(msg)
            writeChan <- result

        case err := <-errChan:
            if err != nil && !errors.Is(err, io.EOF) {
                log.Printf("Player %s error: %v", player.ID, err)
            }
            return

        case <-s.quit:
            return
        }
    }
}

func (s *Server) Shutdown(ctx context.Context) error {
    close(s.quit)
    s.listener.Close()

    done := make(chan struct{})
    go func() {
        s.wg.Wait()
        close(done)
    }()

    select {
    case <-done:
        return nil
    case <-ctx.Done():
        return ctx.Err()
    }
}
```

## C++20 Coroutines

```cpp
#include <coroutine>
#include <optional>

// Awaitable task type
template<typename T>
class Task {
public:
    struct promise_type {
        T value;
        std::exception_ptr exception;

        Task get_return_object() {
            return Task{std::coroutine_handle<promise_type>::from_promise(*this)};
        }
        std::suspend_never initial_suspend() { return {}; }
        std::suspend_always final_suspend() noexcept { return {}; }
        void return_value(T v) { value = std::move(v); }
        void unhandled_exception() { exception = std::current_exception(); }
    };

    bool await_ready() { return handle.done(); }
    void await_suspend(std::coroutine_handle<> h) { /* ... */ }
    T await_resume() {
        if (handle.promise().exception)
            std::rethrow_exception(handle.promise().exception);
        return std::move(handle.promise().value);
    }

private:
    std::coroutine_handle<promise_type> handle;
};

// Async game server
class AsyncGameServer {
public:
    Task<void> handlePlayer(Connection& conn) {
        while (conn.isOpen()) {
            auto msg = co_await conn.readAsync();
            auto result = co_await processAsync(msg);
            co_await conn.writeAsync(result);
        }
    }

    Task<GameState> processAsync(const Message& msg) {
        // Parallel async operations
        auto [validation, playerData] = co_await whenAll(
            validateAsync(msg),
            loadPlayerAsync(msg.playerId)
        );

        co_return applyCommand(msg, validation, playerData);
    }
};

// Generator for game updates
template<typename T>
class Generator {
public:
    struct promise_type {
        T current_value;
        Generator get_return_object() { /* ... */ }
        std::suspend_always yield_value(T value) {
            current_value = std::move(value);
            return {};
        }
    };

    class iterator { /* ... */ };
    iterator begin() { /* ... */ }
    iterator end() { /* ... */ }
};

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
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::{mpsc, Semaphore};
use std::sync::Arc;

struct GameServer {
    max_connections: Arc<Semaphore>,
    shutdown: tokio::sync::broadcast::Sender<()>,
}

impl GameServer {
    async fn run(&self, listener: TcpListener) -> Result<()> {
        let mut shutdown_rx = self.shutdown.subscribe();

        loop {
            tokio::select! {
                result = listener.accept() => {
                    let (socket, addr) = result?;

                    // Acquire connection permit
                    let permit = self.max_connections.clone().acquire_owned().await?;

                    let shutdown_rx = self.shutdown.subscribe();
                    tokio::spawn(async move {
                        let _permit = permit;  // Release on drop
                        if let Err(e) = handle_player(socket, shutdown_rx).await {
                            eprintln!("Player error: {}", e);
                        }
                    });
                }
                _ = shutdown_rx.recv() => {
                    println!("Shutting down");
                    break;
                }
            }
        }
        Ok(())
    }
}

async fn handle_player(
    stream: TcpStream,
    mut shutdown: tokio::sync::broadcast::Receiver<()>
) -> Result<()> {
    let (reader, writer) = stream.into_split();
    let mut reader = BufReader::new(reader);
    let mut writer = BufWriter::new(writer);

    loop {
        tokio::select! {
            result = read_message(&mut reader) => {
                let msg = result?;
                let response = process_command(&msg).await;
                write_message(&mut writer, &response).await?;
            }
            _ = shutdown.recv() => {
                // Graceful shutdown
                break;
            }
        }
    }
    Ok(())
}

// Concurrent task spawning with limits
async fn process_batch(items: Vec<Item>) -> Vec<Result> {
    let semaphore = Arc::new(Semaphore::new(100));  // Max 100 concurrent

    let tasks: Vec<_> = items.into_iter().map(|item| {
        let permit = semaphore.clone();
        tokio::spawn(async move {
            let _permit = permit.acquire().await.unwrap();
            process_item(item).await
        })
    }).collect();

    futures::future::join_all(tasks)
        .await
        .into_iter()
        .map(|r| r.unwrap())
        .collect()
}
```

## Best Practices

| Practice | Benefit |
|----------|---------|
| Avoid blocking in async | Prevents thread starvation |
| Use cancellation tokens | Clean shutdown |
| Limit concurrency | Prevent resource exhaustion |
| Structured concurrency | Proper error handling |
| Backpressure handling | Prevent memory overflow |

## Troubleshooting

### Common Failure Modes

| Problem | Root Cause | Solution |
|---------|------------|----------|
| Thread starvation | Blocking in async | Use spawn_blocking |
| Memory leak | Unbounded channels | Bounded channels |
| Deadlock | Sync in async context | Async-aware locks |
| Event loop lag | Long-running tasks | Break into smaller tasks |

### Debug Checklist

```bash
# Node.js event loop lag
node --trace-warnings --inspect server.js

# Go goroutine dump
curl http://localhost:6060/debug/pprof/goroutine?debug=1

# Rust tokio console
tokio-console http://localhost:6669

# C# async diagnostics
dotnet counters monitor --process-id <pid> System.Runtime
```

```javascript
// Monitor Node.js event loop
const { monitorEventLoopDelay } = require('perf_hooks');
const histogram = monitorEventLoopDelay({ resolution: 20 });
histogram.enable();

setInterval(() => {
    console.log(`Event loop lag: p99=${histogram.percentile(99)}ms`);
}, 5000);
```

## Unit Test Template

```csharp
[Fact]
public async Task HandlePlayer_ProcessesMessages()
{
    var server = new GameServer();
    var mockPlayer = new MockPlayer();

    mockPlayer.EnqueueMessage(new MoveCommand { Direction = Vector3.Forward });

    var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
    await server.HandlePlayerAsync(mockPlayer, cts.Token);

    Assert.Single(mockPlayer.SentMessages);
    Assert.IsType<GameState>(mockPlayer.SentMessages[0]);
}

[Fact]
public async Task ProcessCommand_RunsInParallel()
{
    var server = new GameServer();
    var stopwatch = Stopwatch.StartNew();

    // Each operation takes 100ms
    var result = await server.ProcessCommandAsync(new Message());

    stopwatch.Stop();
    // Should complete in ~100ms, not 300ms (3 x 100ms)
    Assert.True(stopwatch.ElapsedMilliseconds < 200);
}

[Fact]
public async Task GracefulShutdown_WaitsForConnections()
{
    var server = new GameServer();
    var longRunningTask = server.HandlePlayerAsync(new SlowPlayer());

    var shutdownTask = server.GracefulShutdownAsync();

    // Shutdown should wait for connection
    await Task.Delay(100);
    Assert.False(shutdownTask.IsCompleted);
}
```

## Resources

- `assets/` - Async patterns
- `references/` - Concurrency guides
