import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

interface PlayerInfo {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  color: 'w' | 'b';
}

interface MovePayload {
  from: string;
  to: string;
  san: string;
  fenAfter: string;
  promotion?: string;
  playedBy: string;
}

interface ChatMsg {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
  isSystem?: boolean;
}

interface ServerRoom {
  code: string;
  host: PlayerInfo;
  guest?: PlayerInfo;
  status: 'waiting' | 'active' | 'finished';
  timeControl: { id: string; name: string; minutes: number; increment: number; label: string };
  fen: string;
  pgn: string;
  history: MovePayload[];
  chatMessages: ChatMsg[];
  currentTurn: 'w' | 'b';
  drawOfferedBy?: string;
  winner?: 'w' | 'b' | 'draw';
  statusReason?: string;
  createdAt: number;
  sseClients: Response[];
}

const rooms = new Map<string, ServerRoom>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 2; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function broadcastRoomUpdate(room: ServerRoom) {
  const roomData = {
    code: room.code,
    host: room.host,
    guest: room.guest,
    status: room.status,
    timeControl: room.timeControl,
    fen: room.fen,
    pgn: room.pgn,
    history: room.history,
    chatMessages: room.chatMessages,
    currentTurn: room.currentTurn,
    drawOfferedBy: room.drawOfferedBy,
    winner: room.winner,
    statusReason: room.statusReason,
    viewersCount: Math.max(1, room.sseClients.length)
  };

  const payload = `data: ${JSON.stringify(roomData)}\n\n`;
  room.sseClients.forEach((res) => {
    try {
      res.write(payload);
    } catch {
      // client disconnected
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', activeRooms: rooms.size, timestamp: Date.now() });
  });

  // 2. Create Room
  app.post('/api/rooms/create', (req: Request, res: Response) => {
    const { host, timeControl } = req.body;
    if (!host || !timeControl) {
      return res.status(400).json({ error: 'Missing host or timeControl parameter' });
    }

    let code = generateRoomCode();
    while (rooms.has(code)) {
      code = generateRoomCode();
    }

    const hostPlayer: PlayerInfo = {
      id: host.id,
      name: host.name || host.username || 'PrajuritGuest',
      avatar: host.avatar || '⚔️',
      rating: host.rating || 1200,
      color: Math.random() < 0.5 ? 'w' : 'b'
    };

    const newRoom: ServerRoom = {
      code,
      host: hostPlayer,
      status: 'waiting',
      timeControl,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      pgn: '',
      history: [],
      chatMessages: [
        {
          id: `sys-${Date.now()}`,
          senderId: 'system',
          senderName: 'Prajurit Digital Bot',
          message: `Room dibuat dengan kode [${code}]. Bagikan kode ke teman untuk bergabung!`,
          timestamp: Date.now(),
          isSystem: true
        }
      ],
      currentTurn: 'w',
      createdAt: Date.now(),
      sseClients: []
    };

    rooms.set(code, newRoom);
    return res.json({ success: true, roomCode: code, room: newRoom });
  });

  // 3. Get Active Rooms (Matchmaking List)
  app.get('/api/rooms/list', (req, res) => {
    const activeList = Array.from(rooms.values())
      .filter((r) => r.status === 'waiting' || r.status === 'active')
      .slice(0, 15)
      .map((r) => ({
        code: r.code,
        hostName: r.host.name,
        hostRating: r.host.rating,
        hostAvatar: r.host.avatar,
        status: r.status,
        timeControlLabel: r.timeControl.label,
        hasGuest: !!r.guest
      }));

    res.json({ success: true, rooms: activeList });
  });

  // 4. Get Room Detail
  app.get('/api/rooms/:code', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const room = rooms.get(code);
    if (!room) {
      return res.status(404).json({ error: 'Room tidak ditemukan' });
    }

    res.json({
      success: true,
      room: {
        code: room.code,
        host: room.host,
        guest: room.guest,
        status: room.status,
        timeControl: room.timeControl,
        fen: room.fen,
        pgn: room.pgn,
        history: room.history,
        chatMessages: room.chatMessages,
        currentTurn: room.currentTurn,
        drawOfferedBy: room.drawOfferedBy,
        winner: room.winner,
        statusReason: room.statusReason,
        viewersCount: Math.max(1, room.sseClients.length)
      }
    });
  });

  // 5. Join Room
  app.post('/api/rooms/:code/join', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const { player } = req.body;

    const room = rooms.get(code);
    if (!room) {
      return res.status(404).json({ error: 'Room tidak ditemukan' });
    }

    if (room.host.id === player.id) {
      return res.json({ success: true, room, role: 'host' });
    }

    if (room.guest && room.guest.id === player.id) {
      return res.json({ success: true, room, role: 'guest' });
    }

    if (room.guest && room.guest.id !== player.id) {
      // Connect as spectator
      return res.json({ success: true, room, role: 'spectator' });
    }

    // Join as Guest Player
    const guestPlayer: PlayerInfo = {
      id: player.id,
      name: player.name || player.username || 'PrajuritGuest',
      avatar: player.avatar || '🛡️',
      rating: player.rating || 1200,
      color: room.host.color === 'w' ? 'b' : 'w'
    };

    room.guest = guestPlayer;
    room.status = 'active';
    room.chatMessages.push({
      id: `sys-${Date.now()}`,
      senderId: 'system',
      senderName: 'Prajurit Digital Bot',
      message: `${guestPlayer.name} telah bergabung! Pertandingan dimulai.`,
      timestamp: Date.now(),
      isSystem: true
    });

    broadcastRoomUpdate(room);
    return res.json({ success: true, room, role: 'guest' });
  });

  // 6. Submit Move
  app.post('/api/rooms/:code/move', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const { move } = req.body as { move: MovePayload };

    const room = rooms.get(code);
    if (!room) {
      return res.status(404).json({ error: 'Room tidak ditemukan' });
    }

    if (room.status !== 'active') {
      return res.status(400).json({ error: 'Pertandingan belum aktif atau sudah selesai' });
    }

    room.fen = move.fenAfter;
    room.currentTurn = room.currentTurn === 'w' ? 'b' : 'w';
    room.history.push(move);
    room.drawOfferedBy = undefined; // Reset draw offer on new move

    broadcastRoomUpdate(room);
    return res.json({ success: true });
  });

  // 7. Send Chat
  app.post('/api/rooms/:code/chat', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const { senderId, senderName, message } = req.body;

    const room = rooms.get(code);
    if (!room) {
      return res.status(404).json({ error: 'Room tidak ditemukan' });
    }

    const msg: ChatMsg = {
      id: `chat-${Date.now()}-${Math.random()}`,
      senderId,
      senderName,
      message,
      timestamp: Date.now()
    };

    room.chatMessages.push(msg);
    broadcastRoomUpdate(room);
    return res.json({ success: true, chatMessage: msg });
  });

  // 8. Resign / Offer Draw / Finish
  app.post('/api/rooms/:code/action', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const { action, playerId } = req.body;

    const room = rooms.get(code);
    if (!room) {
      return res.status(404).json({ error: 'Room tidak ditemukan' });
    }

    if (action === 'resign') {
      room.status = 'finished';
      const isHostResigned = room.host.id === playerId;
      room.winner = isHostResigned ? (room.host.color === 'w' ? 'b' : 'w') : room.host.color;
      room.statusReason = `${isHostResigned ? room.host.name : room.guest?.name || 'Lawan'} telah menyerah (Resign).`;
      room.chatMessages.push({
        id: `sys-${Date.now()}`,
        senderId: 'system',
        senderName: 'Prajurit Digital Bot',
        message: room.statusReason,
        timestamp: Date.now(),
        isSystem: true
      });
    } else if (action === 'offer_draw') {
      room.drawOfferedBy = playerId;
      const offerName = room.host.id === playerId ? room.host.name : room.guest?.name || 'Lawan';
      room.chatMessages.push({
        id: `sys-${Date.now()}`,
        senderId: 'system',
        senderName: 'Prajurit Digital Bot',
        message: `${offerName} menawarkan hasil Remis (Draw).`,
        timestamp: Date.now(),
        isSystem: true
      });
    } else if (action === 'accept_draw') {
      room.status = 'finished';
      room.winner = 'draw';
      room.statusReason = 'Pertandingan berakhir Remis atas kesepakatan bersama.';
      room.chatMessages.push({
        id: `sys-${Date.now()}`,
        senderId: 'system',
        senderName: 'Prajurit Digital Bot',
        message: room.statusReason,
        timestamp: Date.now(),
        isSystem: true
      });
    } else if (action === 'checkmate') {
      room.status = 'finished';
      const winnerColor = req.body.winnerColor as 'w' | 'b';
      room.winner = winnerColor;
      const winnerName = room.host.color === winnerColor ? room.host.name : room.guest?.name || 'Lawan';
      room.statusReason = `Skakmat (Checkmate)! Selamat kepada ${winnerName}.`;
      room.chatMessages.push({
        id: `sys-${Date.now()}`,
        senderId: 'system',
        senderName: 'Prajurit Digital Bot',
        message: room.statusReason,
        timestamp: Date.now(),
        isSystem: true
      });
    }

    broadcastRoomUpdate(room);
    return res.json({ success: true });
  });

  // 9. SSE Stream
  app.get('/api/rooms/:code/stream', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const room = rooms.get(code);

    if (!room) {
      return res.status(404).send('Room not found');
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    room.sseClients.push(res);
    broadcastRoomUpdate(room);

    req.on('close', () => {
      room.sseClients = room.sseClients.filter((c) => c !== res);
      broadcastRoomUpdate(room);
    });
  });

  // 10. Leaderboard API
  app.get('/api/leaderboard', (req, res) => {
    const topPlayers = [
      { rank: 1, id: 'gm-1', username: 'PrajuritGrandmaster', displayName: 'Kapten Catur ID', avatar: '👑', rating: 2450, wins: 182, losses: 14, draws: 22, winRate: 83, isOnline: true },
      { rank: 2, id: 'gm-2', username: 'Rani_ChessPro', displayName: 'Rani WFM', avatar: '🐉', rating: 2210, wins: 140, losses: 30, draws: 18, winRate: 74, isOnline: true },
      { rank: 3, id: 'gm-3', username: 'Dimas_Tactics', displayName: 'Dimas Taktis', avatar: '⚔️', rating: 1980, wins: 95, losses: 25, draws: 10, winRate: 73, isOnline: false },
      { rank: 4, id: 'gm-4', username: 'Bima_Master', displayName: 'Bima Setya', avatar: '🦁', rating: 1840, wins: 88, losses: 40, draws: 12, winRate: 63, isOnline: true },
      { rank: 5, id: 'gm-5', username: 'Siti_Queen', displayName: 'Siti Chess Queen', avatar: '⚡', rating: 1720, wins: 76, losses: 38, draws: 9, winRate: 61, isOnline: false }
    ];

    res.json({ success: true, leaderboard: topPlayers });
  });

  // Vite or Static file serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Prajurit Digital Chess Server running on http://localhost:${PORT}`);
  });
}

startServer();
