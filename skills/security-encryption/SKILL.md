---
name: security-encryption
description: Game server security including encryption, anti-cheat, and secure communication
sasmp_version: "1.3.0"
bonded_agent: 01-game-server-architect
bond_type: SECONDARY_BOND
---

# Security & Encryption for Game Servers

Implement **secure game server architecture** with encryption and anti-cheat measures.

## Security Layers

```
[Client] ← TLS 1.3 → [Load Balancer] ← mTLS → [Game Server]
                                                    ↓
                                          [Encrypted State]
```

## Transport Security

### TLS/SSL Configuration
```cpp
// OpenSSL server setup
SSL_CTX* ctx = SSL_CTX_new(TLS_server_method());
SSL_CTX_set_min_proto_version(ctx, TLS1_3_VERSION);
SSL_CTX_use_certificate_file(ctx, "server.crt", SSL_FILETYPE_PEM);
SSL_CTX_use_PrivateKey_file(ctx, "server.key", SSL_FILETYPE_PEM);

// Secure cipher suites
SSL_CTX_set_cipher_list(ctx,
    "TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256");
```

### UDP Encryption (DTLS)
```cpp
// DTLS for UDP game traffic
SSL_CTX* ctx = SSL_CTX_new(DTLS_server_method());
SSL_CTX_set_min_proto_version(ctx, DTLS1_2_VERSION);
```

## Game-Specific Security

### Server Authority
```cpp
// NEVER trust client data
void onMoveCommand(int playerId, Vector3 targetPos) {
    // Validate movement is possible
    Vector3 currentPos = players[playerId].position;
    float distance = (targetPos - currentPos).length();

    if (distance > MAX_MOVE_SPEED * deltaTime) {
        // Possible speed hack
        logSuspicious(playerId, "speed_hack", distance);
        return;
    }

    // Validate no collision/teleport
    if (!isPathClear(currentPos, targetPos)) {
        return;
    }

    players[playerId].position = targetPos;
}
```

### Anti-Cheat Measures

| Threat | Server-Side Defense |
|--------|---------------------|
| Speed hack | Velocity validation |
| Teleport | Path validation |
| Aimbot | Statistical detection |
| Wallhack | Server-side visibility |
| Packet injection | Sequence/checksum |

## Authentication

```cpp
// JWT token validation
bool validateToken(const std::string& token) {
    auto decoded = jwt::decode(token);
    auto verifier = jwt::verify()
        .allow_algorithm(jwt::algorithm::hs256{"secret"})
        .with_issuer("game-auth-server");

    verifier.verify(decoded);
    return true;
}
```

## Encryption for Game Data

```cpp
// AES-GCM for sensitive data
#include <openssl/evp.h>

void encryptGameState(const GameState& state, Buffer& out) {
    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    EVP_EncryptInit_ex(ctx, EVP_aes_256_gcm(), NULL, key, iv);
    // Encrypt state...
}
```

## Rate Limiting

| Action | Limit | Window |
|--------|-------|--------|
| Login attempts | 5 | 1 min |
| Commands/sec | 60 | 1 sec |
| Chat messages | 10 | 10 sec |

See `assets/` for security checklists.
