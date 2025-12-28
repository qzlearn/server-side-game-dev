"""
Matchmaking System Template
Skill-based ranking and queue management
"""

from dataclasses import dataclass
from typing import List, Optional
import time
import heapq

@dataclass
class Player:
    id: str
    mmr: int
    queue_time: float = 0

@dataclass
class Match:
    team1: List[Player]
    team2: List[Player]
    average_mmr: int

class Matchmaker:
    def __init__(self, base_range: int = 100, range_expansion: int = 10):
        self.queue: List[Player] = []
        self.base_range = base_range
        self.range_expansion = range_expansion

    def add_to_queue(self, player: Player):
        player.queue_time = time.time()
        self.queue.append(player)

    def find_match(self, team_size: int = 5) -> Optional[Match]:
        if len(self.queue) < team_size * 2:
            return None

        # Sort by MMR
        sorted_players = sorted(self.queue, key=lambda p: p.mmr)

        # Find balanced teams
        for i in range(len(sorted_players) - team_size * 2 + 1):
            candidates = sorted_players[i:i + team_size * 2]
            mmr_range = candidates[-1].mmr - candidates[0].mmr

            # Check if within acceptable range
            wait_time = time.time() - min(p.queue_time for p in candidates)
            allowed_range = self.base_range + (wait_time * self.range_expansion)

            if mmr_range <= allowed_range:
                team1 = candidates[::2]  # Alternate assignment
                team2 = candidates[1::2]

                # Remove from queue
                for p in candidates:
                    self.queue.remove(p)

                return Match(
                    team1=team1,
                    team2=team2,
                    average_mmr=sum(p.mmr for p in candidates) // len(candidates)
                )

        return None
