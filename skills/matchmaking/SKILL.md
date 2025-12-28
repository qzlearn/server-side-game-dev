---
name: matchmaking
description: Skill-based matchmaking systems, ranking algorithms, and queue management for fair multiplayer matches
sasmp_version: "1.3.0"
bonded_agent: 03-matchmaking-engineer
bond_type: PRIMARY_BOND
---

# Matchmaking System

Implement **fair skill-based matchmaking** for competitive multiplayer games.

## MMR Calculation

```python
def calculate_mmr_change(winner_mmr, loser_mmr, k=32):
    expected = 1 / (1 + 10 ** ((loser_mmr - winner_mmr) / 400))
    return k * (1 - expected)

# Winner gains, loser loses
mmr_change = calculate_mmr_change(1500, 1400)
winner_new = 1500 + mmr_change  # ~1512
loser_new = 1400 - mmr_change   # ~1388
```

## Queue Management

Players enter queue → Search for similar MMR → Expand range over time → Create match.

See `assets/` for matchmaking templates and `references/` for algorithm details.
