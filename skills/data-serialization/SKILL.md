---
name: data-serialization
description: Efficient data serialization for game networking including Protobuf, FlatBuffers, and custom binary formats
sasmp_version: "1.3.0"
bonded_agent: 02-networking-specialist
bond_type: SECONDARY_BOND
---

# Data Serialization for Games

Implement **efficient serialization** for low-latency game networking.

## Format Comparison

| Format | Size | Speed | Schema | Use Case |
|--------|------|-------|--------|----------|
| **Protobuf** | Small | Fast | Required | Most games |
| **FlatBuffers** | Small | Fastest | Required | Real-time |
| **MessagePack** | Small | Fast | Optional | Flexible |
| **JSON** | Large | Slow | None | Debug/lobby |
| **Custom Binary** | Smallest | Fastest | Custom | Ultra-low latency |

## Protocol Buffers Example

```protobuf
// game_messages.proto
syntax = "proto3";

message PlayerState {
    uint32 player_id = 1;
    float x = 2;
    float y = 3;
    float z = 4;
    float yaw = 5;
    uint32 health = 6;
    repeated uint32 inventory = 7;
}

message GameUpdate {
    uint64 tick = 1;
    repeated PlayerState players = 2;
}
```

```cpp
// C++ usage
GameUpdate update;
update.set_tick(current_tick);
auto* player = update.add_players();
player->set_player_id(1);
player->set_x(pos.x);

std::string serialized;
update.SerializeToString(&serialized);
```

## FlatBuffers (Zero-copy)

```flatbuffers
// game.fbs
table PlayerState {
    id: uint;
    position: Vec3;
    velocity: Vec3;
}

struct Vec3 {
    x: float;
    y: float;
    z: float;
}
```

## Custom Binary Format

```cpp
struct PacketHeader {
    uint16_t type;
    uint16_t length;
    uint32_t sequence;
};

struct PlayerUpdate {
    uint32_t player_id;
    float position[3];
    uint16_t angle;  // Compressed rotation
    uint8_t flags;
};

// Write with proper byte order
void serialize(Buffer& buf, const PlayerUpdate& p) {
    buf.write_u32(htonl(p.player_id));
    for (int i = 0; i < 3; i++)
        buf.write_float(p.position[i]);
    buf.write_u16(htons(p.angle));
    buf.write_u8(p.flags);
}
```

## Compression Techniques

| Technique | Savings | Complexity |
|-----------|---------|------------|
| Delta compression | 50-80% | Medium |
| Quantization | 30-50% | Low |
| Dictionary encoding | 40-60% | High |
| LZ4 compression | 50-70% | Low |

See `assets/` for serialization benchmarks.
