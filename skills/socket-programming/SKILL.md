---
name: socket-programming
description: Low-level socket programming including BSD sockets, Winsock, and network byte manipulation
sasmp_version: "1.3.0"
bonded_agent: 02-networking-specialist
bond_type: SECONDARY_BOND
---

# Socket Programming for Games

Master **low-level socket programming** for custom game networking protocols.

## Socket Types

| Type | Protocol | Use Case |
|------|----------|----------|
| `SOCK_STREAM` | TCP | Reliable game data |
| `SOCK_DGRAM` | UDP | Real-time updates |
| `SOCK_RAW` | Raw IP | Custom protocols |

## BSD Socket Example (C)

```c
#include <sys/socket.h>
#include <netinet/in.h>

int create_game_server(int port) {
    int sockfd = socket(AF_INET, SOCK_DGRAM, 0);

    struct sockaddr_in addr = {
        .sin_family = AF_INET,
        .sin_port = htons(port),
        .sin_addr.s_addr = INADDR_ANY
    };

    bind(sockfd, (struct sockaddr*)&addr, sizeof(addr));

    // Set non-blocking for game loop
    fcntl(sockfd, F_SETFL, O_NONBLOCK);

    return sockfd;
}
```

## Byte Order Conversion

```c
// Network byte order (big-endian)
uint16_t port_network = htons(8080);   // host to network short
uint32_t ip_network = htonl(ip_host);  // host to network long

// Host byte order
uint16_t port_host = ntohs(port_network);
uint32_t ip_host = ntohl(ip_network);
```

## Socket Options for Games

```c
// Disable Nagle's algorithm (reduce latency)
int flag = 1;
setsockopt(sockfd, IPPROTO_TCP, TCP_NODELAY, &flag, sizeof(flag));

// Enable address reuse (fast server restart)
setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, &flag, sizeof(flag));

// Set receive buffer size
int bufsize = 65536;
setsockopt(sockfd, SOL_SOCKET, SO_RCVBUF, &bufsize, sizeof(bufsize));
```

## Platform Differences

| Feature | BSD (Linux/Mac) | Winsock (Windows) |
|---------|-----------------|-------------------|
| Init | None needed | `WSAStartup()` |
| Close | `close()` | `closesocket()` |
| Error | `errno` | `WSAGetLastError()` |
| Non-block | `fcntl()` | `ioctlsocket()` |

## Common Patterns

- **Non-blocking I/O**: Essential for game loops
- **Connection pooling**: Reuse connections
- **Keep-alive**: Detect dead connections
- **MTU awareness**: Avoid fragmentation

See `assets/` for socket templates.
