---
name: io-multiplexing
description: High-performance I/O multiplexing including epoll, IOCP, kqueue, and io_uring
sasmp_version: "1.3.0"
bonded_agent: 02-networking-specialist
bond_type: PRIMARY_BOND
---

# I/O Multiplexing for Game Servers

Implement **high-performance I/O handling** for thousands of concurrent connections.

## I/O Model Comparison

| Model | Platform | Connections | Latency |
|-------|----------|-------------|---------|
| **epoll** | Linux | 100K+ | Low |
| **kqueue** | BSD/macOS | 100K+ | Low |
| **IOCP** | Windows | 100K+ | Low |
| **io_uring** | Linux 5.1+ | 1M+ | Lowest |
| select | All | ~1000 | Medium |

## Linux epoll

```c
#include <sys/epoll.h>

int epollfd = epoll_create1(0);

// Add socket to epoll
struct epoll_event ev;
ev.events = EPOLLIN | EPOLLET;  // Edge-triggered
ev.data.fd = client_socket;
epoll_ctl(epollfd, EPOLL_CTL_ADD, client_socket, &ev);

// Event loop
struct epoll_event events[MAX_EVENTS];
while (running) {
    int nfds = epoll_wait(epollfd, events, MAX_EVENTS, timeout_ms);
    for (int i = 0; i < nfds; i++) {
        if (events[i].events & EPOLLIN) {
            handleRead(events[i].data.fd);
        }
        if (events[i].events & EPOLLOUT) {
            handleWrite(events[i].data.fd);
        }
    }
}
```

## Linux io_uring (Modern)

```c
#include <liburing.h>

struct io_uring ring;
io_uring_queue_init(256, &ring, 0);

// Submit read operation
struct io_uring_sqe *sqe = io_uring_get_sqe(&ring);
io_uring_prep_recv(sqe, socket_fd, buffer, BUFFER_SIZE, 0);
io_uring_sqe_set_data(sqe, &connection);
io_uring_submit(&ring);

// Reap completions
struct io_uring_cqe *cqe;
io_uring_wait_cqe(&ring, &cqe);
Connection* conn = (Connection*)io_uring_cqe_get_data(cqe);
handleCompletion(conn, cqe->res);
io_uring_cqe_seen(&ring, cqe);
```

## Windows IOCP

```cpp
// Create completion port
HANDLE iocp = CreateIoCompletionPort(
    INVALID_HANDLE_VALUE, NULL, 0, numThreads);

// Associate socket
CreateIoCompletionPort(
    (HANDLE)socket, iocp, (ULONG_PTR)context, 0);

// Worker thread
while (running) {
    DWORD bytesTransferred;
    ULONG_PTR completionKey;
    OVERLAPPED* overlapped;

    GetQueuedCompletionStatus(
        iocp, &bytesTransferred, &completionKey,
        &overlapped, INFINITE);

    Context* ctx = (Context*)completionKey;
    handleCompletion(ctx, bytesTransferred);
}
```

## Reactor vs Proactor

| Pattern | Model | Examples |
|---------|-------|----------|
| **Reactor** | Ready notification | epoll, kqueue, select |
| **Proactor** | Completion notification | IOCP, io_uring |

## Game Server Pattern

```cpp
class GameServer {
    int epollfd;
    std::unordered_map<int, Connection*> connections;

    void run() {
        while (running) {
            // 1. Handle I/O events
            pollEvents(16);  // 16ms timeout = 60 FPS budget

            // 2. Process game tick
            gameTick();

            // 3. Send updates
            broadcastState();
        }
    }

    void pollEvents(int timeout_ms) {
        struct epoll_event events[1024];
        int n = epoll_wait(epollfd, events, 1024, timeout_ms);
        for (int i = 0; i < n; i++) {
            handleEvent(events[i]);
        }
    }
};
```

See `assets/` for I/O benchmarks.
