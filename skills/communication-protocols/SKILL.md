---
name: communication-protocols
description: Game server communication protocols including gRPC, REST, and custom binary protocols
sasmp_version: "1.3.0"
bonded_agent: 02-networking-specialist
bond_type: SECONDARY_BOND
---

# Communication Protocols for Game Servers

Implement **efficient communication protocols** between game services and clients.

## Protocol Comparison

| Protocol | Latency | Throughput | Use Case |
|----------|---------|------------|----------|
| **Custom Binary** | Lowest | Highest | Real-time gameplay |
| **gRPC** | Low | High | Service-to-service |
| **WebSocket** | Low | Medium | Browser clients |
| **REST** | Medium | Medium | Admin APIs, lobbies |

## gRPC for Game Services

```protobuf
// matchmaking.proto
syntax = "proto3";

service Matchmaking {
    rpc FindMatch(MatchRequest) returns (MatchResponse);
    rpc JoinQueue(QueueRequest) returns (stream QueueUpdate);
    rpc CancelQueue(CancelRequest) returns (CancelResponse);
}

message MatchRequest {
    string player_id = 1;
    string game_mode = 2;
    int32 skill_rating = 3;
}

message MatchResponse {
    string match_id = 1;
    string server_address = 2;
    repeated string teammates = 3;
}
```

```go
// Go server implementation
func (s *server) FindMatch(ctx context.Context, req *pb.MatchRequest) (*pb.MatchResponse, error) {
    match := s.matchmaker.FindMatch(req.PlayerId, req.GameMode, req.SkillRating)
    return &pb.MatchResponse{
        MatchId: match.ID,
        ServerAddress: match.ServerAddr,
        Teammates: match.Teammates,
    }, nil
}
```

## Custom Binary Protocol

```cpp
// Game packet format
struct PacketHeader {
    uint8_t type;        // Message type
    uint16_t length;     // Payload length
    uint32_t sequence;   // Packet sequence number
    uint32_t ack;        // Last received sequence
};

enum PacketType : uint8_t {
    PLAYER_INPUT = 0x01,
    STATE_UPDATE = 0x02,
    PLAYER_JOIN = 0x03,
    PLAYER_LEAVE = 0x04,
    PING = 0xFE,
    PONG = 0xFF
};

// Zero-copy packet reading
struct PlayerInputPacket {
    uint32_t tick;
    uint8_t keys;      // Bitfield: WASD + jump + fire
    int16_t aim_x;     // Quantized aim direction
    int16_t aim_y;
};
```

## WebSocket for Browser Games

```javascript
// Server (Node.js)
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        const msg = JSON.parse(data);
        switch (msg.type) {
            case 'move':
                handleMove(ws.playerId, msg.direction);
                break;
            case 'action':
                handleAction(ws.playerId, msg.action);
                break;
        }
    });
});

// Binary WebSocket for better performance
ws.binaryType = 'arraybuffer';
ws.on('message', (data) => {
    const view = new DataView(data);
    const type = view.getUint8(0);
    // Parse binary...
});
```

## Protocol Selection

| Scenario | Recommended |
|----------|-------------|
| Real-time gameplay | Custom UDP binary |
| Microservices | gRPC |
| Web/mobile lobby | WebSocket JSON |
| Admin tools | REST |
| Streaming updates | gRPC streaming |

See `assets/` for protocol templates.
