---
name: programming-languages
description: Core programming languages for game server development including C++, C#, Go, and their game-specific features
sasmp_version: "1.3.0"
bonded_agent: 01-game-server-architect
bond_type: PRIMARY_BOND
---

# Programming Languages for Game Servers

Master **high-performance programming languages** optimized for real-time game server development.

## Language Comparison

| Language | Strengths | Use Cases |
|----------|-----------|-----------|
| **C++** | Maximum performance, memory control | AAA game servers, FPS |
| **C#** | Unity backend, async support | Mobile, casual games |
| **Go** | Concurrency, simplicity | Matchmaking, microservices |
| **Java** | Enterprise, JVM ecosystem | MMO backends, Android |
| **Erlang** | Fault tolerance, distributed | Chat, presence systems |
| **Rust** | Memory safety, performance | New projects, security |

## C++ for Game Servers

```cpp
#include <boost/asio.hpp>
#include <iostream>
#include <thread>

class GameServer {
public:
    GameServer(boost::asio::io_context& io, short port)
        : acceptor_(io, tcp::endpoint(tcp::v4(), port)) {
        start_accept();
    }

private:
    void start_accept() {
        auto socket = std::make_shared<tcp::socket>(acceptor_.get_executor());
        acceptor_.async_accept(*socket,
            [this, socket](boost::system::error_code ec) {
                if (!ec) handle_connection(socket);
                start_accept();
            });
    }

    tcp::acceptor acceptor_;
};
```

## Go for Concurrency

```go
package main

import (
    "net"
    "sync"
)

type GameServer struct {
    players sync.Map
    tick    *time.Ticker
}

func (s *GameServer) handlePlayer(conn net.Conn) {
    defer conn.Close()
    for {
        // Handle player messages with goroutines
        msg := readMessage(conn)
        go s.processMessage(msg)
    }
}
```

## Language Selection Criteria

| Factor | Recommendation |
|--------|----------------|
| Latency critical | C++, Rust |
| Rapid development | Go, C# |
| Existing ecosystem | Match team expertise |
| Scalability | Go, Erlang |
| Unity integration | C# |

## Performance Considerations

- Memory management (GC vs manual)
- Concurrency model (threads vs goroutines)
- Compilation (AOT vs JIT)
- Network I/O efficiency

See `assets/` for language-specific templates.
