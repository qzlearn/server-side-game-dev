---
name: matchmaking
description: Skill-based matchmaking systems, ranking algorithms, and queue management for fair multiplayer matches
sasmp_version: "1.3.0"
version: "2.0.0"
bonded_agent: 03-matchmaking-engineer
bond_type: PRIMARY_BOND

# Parameters
parameters:
  required:
    - algorithm
  optional:
    - queue_timeout_s
    - skill_range_expansion
    - team_size
  validation:
    algorithm:
      type: string
      enum: [elo, trueskill, glicko2, custom]
    queue_timeout_s:
      type: integer
      min: 30
      max: 600
      default: 120
    skill_range_expansion:
      type: number
      min: 0.1
      max: 2.0
      default: 0.5
    team_size:
      type: integer
      min: 1
      max: 100
      default: 5

# Retry Configuration
retry_config:
  max_attempts: 3
  backoff: linear
  initial_delay_ms: 5000
  max_delay_ms: 30000
  retryable_errors:
    - QUEUE_TIMEOUT
    - INSUFFICIENT_PLAYERS

# Observability
observability:
  logging:
    level: info
    fields: [player_id, mmr, queue_time_ms, match_quality]
  metrics:
    - name: matchmaking_queue_time_seconds
      type: histogram
    - name: matches_created_total
      type: counter
    - name: queue_size
      type: gauge
    - name: match_quality_score
      type: histogram
---

# Matchmaking System

Implement **fair skill-based matchmaking** for competitive multiplayer games.

## Algorithm Comparison

| Algorithm | Accuracy | Convergence | Use Case |
|-----------|----------|-------------|----------|
| Elo | Good | Fast | 1v1 games |
| TrueSkill | Excellent | Medium | Team games |
| Glicko-2 | Excellent | Slow | Chess, turn-based |
| Custom | Variable | Variable | Specialized |

## Elo Rating System

```python
def calculate_elo_change(winner_mmr, loser_mmr, k=32):
    """Calculate MMR change for a match result."""
    expected = 1 / (1 + 10 ** ((loser_mmr - winner_mmr) / 400))
    return k * (1 - expected)

# Example
mmr_change = calculate_elo_change(1500, 1400)
winner_new = 1500 + mmr_change  # ~1512
loser_new = 1400 - mmr_change   # ~1388
```

## TrueSkill for Team Games

```python
import trueskill

def calculate_trueskill_match(team1, team2, winner):
    """Update ratings after team match."""
    env = trueskill.TrueSkill(draw_probability=0.0)

    # Convert to Rating objects
    t1_ratings = [env.create_rating(p.mu, p.sigma) for p in team1]
    t2_ratings = [env.create_rating(p.mu, p.sigma) for p in team2]

    # Calculate new ratings
    if winner == 1:
        new_t1, new_t2 = env.rate([t1_ratings, t2_ratings], ranks=[0, 1])
    else:
        new_t1, new_t2 = env.rate([t1_ratings, t2_ratings], ranks=[1, 0])

    return new_t1, new_t2
```

## Queue Management

```python
class MatchmakingQueue:
    def __init__(self, config):
        self.queue = []
        self.config = config

    def add_player(self, player):
        entry = QueueEntry(
            player_id=player.id,
            mmr=player.mmr,
            enter_time=time.time(),
            skill_range=self.config.initial_range
        )
        self.queue.append(entry)
        self.try_match()

    def try_match(self):
        # Sort by wait time
        self.queue.sort(key=lambda e: e.enter_time)

        for entry in self.queue:
            # Expand range over time
            wait_time = time.time() - entry.enter_time
            entry.skill_range = min(
                self.config.initial_range + wait_time * self.config.expansion_rate,
                self.config.max_range
            )

            # Find compatible players
            candidates = [p for p in self.queue
                         if abs(p.mmr - entry.mmr) <= entry.skill_range
                         and p != entry]

            if len(candidates) >= self.config.team_size * 2 - 1:
                self.create_match(entry, candidates)
                return
```

## Match Quality Scoring

```python
def calculate_match_quality(team1, team2):
    """Score match quality 0-1 based on skill balance."""
    avg_t1 = sum(p.mmr for p in team1) / len(team1)
    avg_t2 = sum(p.mmr for p in team2) / len(team2)

    mmr_diff = abs(avg_t1 - avg_t2)

    # Sigmoid decay based on MMR difference
    quality = 1 / (1 + mmr_diff / 200)

    return quality
```

## Troubleshooting

### Common Failure Modes

| Error | Root Cause | Solution |
|-------|------------|----------|
| Long queue times | Too strict matching | Increase expansion rate |
| Unbalanced matches | Fast expansion | Tune quality threshold |
| Rating inflation | No decay | Add seasonal reset |
| Smurf accounts | No placement | Require placement matches |

### Debug Checklist

```python
# Monitor queue health
def queue_diagnostics(queue):
    print(f"Queue size: {len(queue.queue)}")
    print(f"Avg wait time: {queue.avg_wait_time():.1f}s")
    print(f"Match rate: {queue.matches_per_minute():.2f}/min")

    # MMR distribution
    mmrs = [e.mmr for e in queue.queue]
    print(f"MMR range: {min(mmrs)} - {max(mmrs)}")
    print(f"MMR median: {statistics.median(mmrs)}")

# Check match quality
def validate_match(match):
    quality = calculate_match_quality(match.team1, match.team2)
    assert quality >= 0.6, f"Low quality match: {quality}"
```

## Unit Test Template

```python
import pytest

class TestMatchmaking:
    def test_elo_calculation(self):
        change = calculate_elo_change(1500, 1400)
        assert 10 < change < 20  # Expected range

    def test_queue_matching(self):
        queue = MatchmakingQueue(config)

        # Add 10 similar-skill players
        for i in range(10):
            queue.add_player(Player(mmr=1500 + i*10))

        # Should create a match
        assert queue.matches_created == 1

    def test_match_quality(self):
        team1 = [Player(mmr=1500), Player(mmr=1520)]
        team2 = [Player(mmr=1480), Player(mmr=1540)]

        quality = calculate_match_quality(team1, team2)
        assert quality >= 0.9  # Good balance

    def test_queue_timeout(self):
        queue = MatchmakingQueue(config)
        queue.add_player(Player(mmr=3000))  # Outlier

        # Fast forward time
        time.sleep(config.queue_timeout_s)

        # Should trigger timeout callback
        assert queue.timed_out_count == 1
```

## Resources

- `assets/` - Matchmaking templates
- `references/` - Algorithm papers
