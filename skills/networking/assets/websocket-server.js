/**
 * WebSocket Game Server Template
 * Real-time multiplayer networking
 */

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

class GameServer {
  constructor(port = 8080) {
    this.wss = new WebSocket.Server({ port });
    this.players = new Map();
    this.rooms = new Map();

    this.wss.on('connection', this.handleConnection.bind(this));
    console.log(`Game server running on port ${port}`);
  }

  handleConnection(ws) {
    const playerId = uuidv4();
    const player = { id: playerId, ws, room: null, state: {} };
    this.players.set(playerId, player);

    this.send(ws, { type: 'connected', playerId });

    ws.on('message', (data) => this.handleMessage(player, data));
    ws.on('close', () => this.handleDisconnect(player));
    ws.on('error', (err) => console.error(`Player ${playerId} error:`, err));
  }

  handleMessage(player, data) {
    try {
      const msg = JSON.parse(data);
      switch (msg.type) {
        case 'join_room':
          this.joinRoom(player, msg.roomId);
          break;
        case 'game_action':
          this.broadcastToRoom(player.room, msg, player.id);
          break;
        case 'player_state':
          player.state = { ...player.state, ...msg.state };
          this.broadcastToRoom(player.room, {
            type: 'player_state',
            playerId: player.id,
            state: player.state
          });
          break;
      }
    } catch (err) {
      console.error('Message parse error:', err);
    }
  }

  joinRoom(player, roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(player.id);
    player.room = roomId;

    this.broadcastToRoom(roomId, {
      type: 'player_joined',
      playerId: player.id
    });
  }

  broadcastToRoom(roomId, msg, excludeId = null) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.forEach(playerId => {
      if (playerId !== excludeId) {
        const player = this.players.get(playerId);
        if (player) this.send(player.ws, msg);
      }
    });
  }

  send(ws, msg) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  handleDisconnect(player) {
    if (player.room) {
      const room = this.rooms.get(player.room);
      if (room) {
        room.delete(player.id);
        this.broadcastToRoom(player.room, {
          type: 'player_left',
          playerId: player.id
        });
      }
    }
    this.players.delete(player.id);
  }
}

module.exports = { GameServer };
