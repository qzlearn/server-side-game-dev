---
name: message-queues
description: Message queue systems for game servers including Kafka, RabbitMQ, and actor models
sasmp_version: "1.3.0"
bonded_agent: 01-game-server-architect
bond_type: SECONDARY_BOND
---

# Message Queues for Game Servers

Implement **asynchronous messaging** for scalable game server architecture.

## Queue Systems Comparison

| System | Throughput | Latency | Use Case |
|--------|------------|---------|----------|
| **Kafka** | Very High | Medium | Analytics, events |
| **RabbitMQ** | High | Low | Game events |
| **Redis Pub/Sub** | Very High | Very Low | Real-time updates |
| **NATS** | Very High | Ultra Low | Game state sync |

## Apache Kafka for Game Events

```java
// Producer - Game server sends events
Properties props = new Properties();
props.put("bootstrap.servers", "kafka:9092");
props.put("key.serializer", StringSerializer.class);
props.put("value.serializer", JsonSerializer.class);

KafkaProducer<String, GameEvent> producer = new KafkaProducer<>(props);

void onPlayerKill(String killerId, String victimId) {
    GameEvent event = new GameEvent("kill", killerId, victimId);
    producer.send(new ProducerRecord<>("game-events", killerId, event));
}
```

## RabbitMQ for Game Commands

```go
// Go consumer for match events
conn, _ := amqp.Dial("amqp://guest:guest@localhost:5672/")
ch, _ := conn.Channel()

ch.QueueDeclare("match-events", true, false, false, false, nil)

msgs, _ := ch.Consume("match-events", "", true, false, false, false, nil)

for msg := range msgs {
    var event MatchEvent
    json.Unmarshal(msg.Body, &event)
    processMatchEvent(event)
}
```

## Redis Pub/Sub for Real-Time

```python
# Publisher (Game Server)
import redis
r = redis.Redis()

def broadcast_state_update(game_id, state):
    r.publish(f"game:{game_id}", json.dumps(state))

# Subscriber (Client Gateway)
pubsub = r.pubsub()
pubsub.subscribe("game:12345")

for message in pubsub.listen():
    if message['type'] == 'message':
        send_to_client(message['data'])
```

## Actor Model (Akka/Orleans)

```csharp
// Orleans Grain (Actor)
public class PlayerGrain : Grain, IPlayer
{
    private PlayerState state;

    public async Task<bool> TakeDamage(int amount)
    {
        state.Health -= amount;
        if (state.Health <= 0)
        {
            await GrainFactory.GetGrain<IGame>(state.GameId)
                .OnPlayerDeath(this.GetPrimaryKeyString());
        }
        return state.Health > 0;
    }
}
```

## Use Case Mapping

| Use Case | Recommended |
|----------|-------------|
| Cross-server chat | RabbitMQ |
| Analytics pipeline | Kafka |
| Real-time state | Redis Pub/Sub |
| Distributed game state | Orleans/Akka |
| Match results | Kafka |

See `assets/` for queue configurations.
