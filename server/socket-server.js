import { WebSocketServer, WebSocket } from 'ws';

const PORT = process.env.WS_PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

const rooms = new Map();

function broadcastToRoom(room, message) {
  const payload = JSON.stringify(message);
  for (const player of room.players.values()) {
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(payload);
    }
  }
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KEY-${code}`;
}

const SAMPLE_PROMPTS = [
  'The digital circuit pulsed with energy as the keyboard transmitter sent packets across the low latency wire.',
  'Mastering high speed touch typing requires relaxation of the hands and consistent rhythmic muscle memory.',
  'In the arena of competitive typing, accuracy is always the foundation upon which raw speed is constructed.',
  'Every single keystroke reflects a deliberate decision made in milliseconds by a focused and disciplined mind.'
];

wss.on('connection', (ws) => {
  let currentPlayerId = null;
  let currentRoomId = null;

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case 'create_room': {
          const roomId = generateRoomCode();
          const playerId = `p_${Math.random().toString(36).substring(2, 8)}`;
          currentPlayerId = playerId;
          currentRoomId = roomId;

          const prompt = SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
          const room = {
            id: roomId,
            hostId: playerId,
            status: 'waiting',
            prompt,
            config: msg.config || { duration: 30, punctuation: false, numbers: false },
            players: new Map()
          };

          const player = {
            id: playerId,
            name: msg.playerName || 'Pilot',
            avatarColor: msg.avatarColor || '#00F700',
            ws,
            progress: 0,
            wpm: 0,
            isHost: true,
            isFinished: false
          };

          room.players.set(playerId, player);
          rooms.set(roomId, room);

          ws.send(JSON.stringify({
            type: 'room_joined',
            roomId,
            playerId,
            isHost: true,
            prompt,
            config: room.config,
            players: Array.from(room.players.values()).map(p => ({
              id: p.id,
              name: p.name,
              avatarColor: p.avatarColor,
              isHost: p.isHost,
              progress: p.progress,
              wpm: p.wpm,
              isFinished: p.isFinished
            }))
          }));
          break;
        }

        case 'join_room': {
          const roomId = (msg.roomId || '').toUpperCase();
          const room = rooms.get(roomId);

          if (!room) {
            ws.send(JSON.stringify({ type: 'error', message: `Room ${roomId} not found.` }));
            return;
          }

          if (room.status !== 'waiting') {
            ws.send(JSON.stringify({ type: 'error', message: `Race in ${roomId} is already in progress.` }));
            return;
          }

          const playerId = `p_${Math.random().toString(36).substring(2, 8)}`;
          currentPlayerId = playerId;
          currentRoomId = roomId;

          const player = {
            id: playerId,
            name: msg.playerName || 'Pilot',
            avatarColor: msg.avatarColor || '#a855f7',
            ws,
            progress: 0,
            wpm: 0,
            isHost: false,
            isFinished: false
          };

          room.players.set(playerId, player);

          ws.send(JSON.stringify({
            type: 'room_joined',
            roomId,
            playerId,
            isHost: false,
            prompt: room.prompt,
            config: room.config,
            players: Array.from(room.players.values()).map(p => ({
              id: p.id,
              name: p.name,
              avatarColor: p.avatarColor,
              isHost: p.isHost,
              progress: p.progress,
              wpm: p.wpm,
              isFinished: p.isFinished
            }))
          }));

          broadcastToRoom(room, {
            type: 'player_joined',
            player: {
              id: player.id,
              name: player.name,
              avatarColor: player.avatarColor,
              isHost: false,
              progress: 0,
              wpm: 0,
              isFinished: false
            }
          });
          break;
        }

        case 'start_countdown': {
          if (!currentRoomId) return;
          const room = rooms.get(currentRoomId);
          if (!room || room.hostId !== currentPlayerId) return;

          room.status = 'countdown';
          broadcastToRoom(room, { type: 'countdown_started', seconds: 3 });

          let count = 3;
          const interval = setInterval(() => {
            count--;
            if (count > 0) {
              broadcastToRoom(room, { type: 'countdown_tick', count });
            } else {
              clearInterval(interval);
              room.status = 'racing';
              broadcastToRoom(room, { type: 'race_started', startTime: Date.now() });
            }
          }, 1000);
          break;
        }

        case 'progress_update': {
          if (!currentRoomId || !currentPlayerId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          const player = room.players.get(currentPlayerId);
          if (!player) return;

          player.progress = msg.progress || 0;
          player.wpm = msg.wpm || 0;

          broadcastToRoom(room, {
            type: 'player_progress',
            playerId: player.id,
            progress: player.progress,
            wpm: player.wpm
          });
          break;
        }

        case 'finish_race': {
          if (!currentRoomId || !currentPlayerId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          const player = room.players.get(currentPlayerId);
          if (!player) return;

          player.isFinished = true;
          player.progress = 100;
          player.wpm = msg.wpm;
          player.finalResult = {
            wpm: msg.wpm,
            rawWpm: msg.rawWpm,
            accuracy: msg.accuracy
          };

          const finishedCount = Array.from(room.players.values()).filter(p => p.isFinished).length;
          player.finalRank = finishedCount;

          broadcastToRoom(room, {
            type: 'player_finished',
            playerId: player.id,
            rank: finishedCount,
            result: player.finalResult
          });

          if (finishedCount === room.players.size) {
            room.status = 'finished';
            broadcastToRoom(room, { type: 'race_finished' });
          }
          break;
        }
      }
    } catch (err) {
      console.error('Socket message parse error', err);
    }
  });

  ws.on('close', () => {
    if (currentRoomId && currentPlayerId) {
      const room = rooms.get(currentRoomId);
      if (room) {
        room.players.delete(currentPlayerId);
        if (room.players.size === 0) {
          rooms.delete(currentRoomId);
        } else {
          if (room.hostId === currentPlayerId) {
            const nextPlayer = room.players.values().next().value;
            if (nextPlayer) {
              nextPlayer.isHost = true;
              room.hostId = nextPlayer.id;
              broadcastToRoom(room, { type: 'host_changed', newHostId: nextPlayer.id });
            }
          }
          broadcastToRoom(room, { type: 'player_left', playerId: currentPlayerId });
        }
      }
    }
  });
});

console.log(`KeyArena WebSocket Server listening on port ${PORT}`);
