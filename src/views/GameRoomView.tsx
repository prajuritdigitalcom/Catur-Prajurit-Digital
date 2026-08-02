import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ArrowLeft, Copy, Check, Users, Globe, Trophy, Share2 } from 'lucide-react';
import { ChessBoardContainer } from '../components/ChessBoardContainer';
import { CapturedPieces } from '../components/CapturedPieces';
import { GameClock } from '../components/GameClock';
import { MoveHistory } from '../components/MoveHistory';
import { ChatPanel } from '../components/ChatPanel';
import { Player, MoveRecord, BoardTheme, ChatMessage } from '../types';
import { INITIAL_FEN } from '../constants/chess';
import { supabase } from '../lib/supabaseClient';
import { mapRoomRowToApiShape, RoomRow } from '../lib/roomRealtime';

interface GameRoomViewProps {
  roomCode: string;
  userPlayer: Player;
  boardTheme: BoardTheme;
  onBack: () => void;
}

interface ServerRoomData {
  code: string;
  host: Player;
  guest?: Player;
  status: 'waiting' | 'active' | 'finished';
  timeControl: { id: string; name: string; minutes: number; increment: number; label: string };
  fen: string;
  pgn: string;
  history: MoveRecord[];
  chatMessages: ChatMessage[];
  currentTurn: 'w' | 'b';
  drawOfferedBy?: string;
  winner?: 'w' | 'b' | 'draw';
  statusReason?: string;
  viewersCount: number;
}

export const GameRoomView: React.FC<GameRoomViewProps> = ({
  roomCode,
  userPlayer,
  boardTheme,
  onBack
}) => {
  const [chess] = useState(() => new Chess(INITIAL_FEN));
  const [roomData, setRoomData] = useState<ServerRoomData | null>(null);
  const [fen, setFen] = useState(INITIAL_FEN);
  const [copiedCode, setCopiedCode] = useState(false);
  const [myRole, setMyRole] = useState<'host' | 'guest' | 'spectator'>('spectator');

  // Join Room & Realtime Setup
  useEffect(() => {
    let channel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;

    const applyRoom = (room: ServerRoomData) => {
      setRoomData(room);
      if (room.fen) {
        chess.load(room.fen);
        setFen(room.fen);
      }
    };

    const joinAndConnect = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomCode}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ player: userPlayer })
        });
        const data = await res.json();
        if (data.success) {
          setMyRole(data.role);
          applyRoom(data.room);
        }
      } catch {
        // ignore
      }

      // Subscribe ke perubahan baris room ini lewat Supabase Realtime.
      // Ini koneksi WebSocket langsung ke Supabase (bukan lewat Vercel
      // function), jadi tidak kena batas waktu eksekusi serverless.
      if (!supabase) return;

      channel = supabase
        .channel(`room-${roomCode}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'rooms', filter: `code=eq.${roomCode}` },
          (payload) => {
            const row = payload.new as RoomRow | undefined;
            if (!row || Object.keys(row).length === 0) return;
            applyRoom(mapRoomRowToApiShape(row));
          }
        )
        .subscribe();
    };

    joinAndConnect();

    return () => {
      channel?.unsubscribe();
    };
  }, [roomCode]);

  const myColor: 'w' | 'b' =
    roomData?.host.id === userPlayer.id
      ? roomData.host.color
      : roomData?.guest?.id === userPlayer.id
      ? roomData.guest.color
      : 'w';

  const isMyTurn = roomData?.status === 'active' && roomData.currentTurn === myColor && myRole !== 'spectator';

  const handleUserMove = (from: string, to: string, promotion?: string): boolean => {
    if (!isMyTurn || !roomData) return false;

    try {
      const moveResult = chess.move({ from, to, promotion: promotion || 'q' });
      if (!moveResult) return false;

      const newFen = chess.fen();
      setFen(newFen);

      const movePayload = {
        from: moveResult.from,
        to: moveResult.to,
        san: moveResult.san,
        fenAfter: newFen,
        promotion: moveResult.promotion,
        playedBy: userPlayer.id
      };

      fetch(`/api/rooms/${roomCode}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ move: movePayload })
      });

      if (chess.isCheckmate()) {
        const winnerColor = chess.turn() === 'w' ? 'b' : 'w';
        fetch(`/api/rooms/${roomCode}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'checkmate', winnerColor, playerId: userPlayer.id })
        });
      }

      return true;
    } catch {
      return false;
    }
  };

  const handleSendMessage = (msg: string) => {
    fetch(`/api/rooms/${roomCode}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: userPlayer.id,
        senderName: userPlayer.name || userPlayer.username,
        message: msg
      })
    });
  };

  const handleResign = () => {
    fetch(`/api/rooms/${roomCode}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resign', playerId: userPlayer.id })
    });
  };

  const handleOfferDraw = () => {
    fetch(`/api/rooms/${roomCode}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'offer_draw', playerId: userPlayer.id })
    });
  };

  const handleAcceptDraw = () => {
    fetch(`/api/rooms/${roomCode}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'accept_draw', playerId: userPlayer.id })
    });
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!roomData) {
    return (
      <div className="w-full max-w-md mx-auto py-20 text-center space-y-3">
        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#fe4c6f] mx-auto flex items-center justify-center animate-spin border border-rose-200">
          <Globe className="w-5 h-5" />
        </div>
        <p className="text-slate-700 font-bold text-xs">Menghubungkan ke Room [{roomCode}]...</p>
      </div>
    );
  }

  const opponentPlayer =
    roomData.host.id === userPlayer.id ? roomData.guest : roomData.host;

  return (
    <div className="w-full max-w-md mx-auto px-3 py-3 space-y-3 animate-in fade-in duration-200">
      {/* Mobile Top Header */}
      <div className="flex items-center justify-between bg-white border border-slate-200/90 px-3 py-2 rounded-2xl shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Keluar
        </button>

        {/* Room Code Badge */}
        <div className="flex items-center gap-1.5 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
          <span className="text-[10px] text-slate-500 font-bold">Room:</span>
          <span className="font-mono font-extrabold text-xs text-[#fe4c6f]">{roomCode}</span>
          <button
            onClick={copyRoomCode}
            className="p-0.5 text-slate-400 hover:text-slate-800 transition-colors"
            title="Salin Kode"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
          <Users className="w-3.5 h-3.5 text-amber-600" />
          <span>{roomData.viewersCount}</span>
        </div>
      </div>

      {/* Waiting overlay for opponent */}
      {roomData.status === 'waiting' && (
        <div className="bg-white border-2 border-[#fe4c6f]/60 rounded-3xl p-5 text-center space-y-3 shadow-md">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#fe4c6f] mx-auto flex items-center justify-center animate-bounce border border-rose-200">
            <Share2 className="w-5 h-5" />
          </div>
          <h3 className="font-black text-sm text-slate-900">Menunggu Lawan Bergabung...</h3>
          <p className="text-slate-600 text-xs leading-relaxed">
            Bagikan kode <strong className="text-[#fe4c6f] font-mono">{roomCode}</strong> ke teman Anda.
          </p>
          <button
            onClick={copyRoomCode}
            className="w-full py-2.5 bg-[#fe4c6f] hover:bg-[#e03a5b] text-white font-extrabold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-98"
          >
            {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedCode ? 'Kode Tersalin!' : 'Salin Kode Room HP'}
          </button>
        </div>
      )}

      {/* Draw Offer Notification */}
      {roomData.drawOfferedBy && roomData.drawOfferedBy !== userPlayer.id && (
        <div className="bg-amber-50 border border-amber-300 p-3 rounded-2xl flex items-center justify-between gap-2 text-xs">
          <span className="text-amber-900 font-bold text-[11px]">Lawan menawarkan Remis!</span>
          <button
            onClick={handleAcceptDraw}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl shadow-xs transition-colors"
          >
            Terima
          </button>
        </div>
      )}

      {/* Opponent Clock */}
      {opponentPlayer && (
        <GameClock
          player={opponentPlayer}
          timeSeconds={roomData.timeControl.minutes * 60}
          isActive={roomData.currentTurn === opponentPlayer.color}
          unlimited={roomData.timeControl.minutes === 0}
        />
      )}

      {/* Chessboard */}
      <div className="w-full flex justify-center">
        <ChessBoardContainer
          chess={chess}
          orientation={myColor}
          onMove={handleUserMove}
          theme={boardTheme}
          disabled={roomData.status !== 'active' || !isMyTurn}
        />
      </div>

      {/* Captured Pieces Bar */}
      <CapturedPieces fen={fen} />

      {/* User Clock */}
      <GameClock
        player={userPlayer}
        timeSeconds={roomData.timeControl.minutes * 60}
        isActive={roomData.currentTurn === myColor}
        unlimited={roomData.timeControl.minutes === 0}
      />

      {/* Move History Card */}
      <MoveHistory
        history={roomData.history || []}
        pgn={roomData.pgn || ''}
        fen={fen}
        onResign={handleResign}
        onOfferDraw={handleOfferDraw}
        isGameOver={roomData.status === 'finished'}
      />

      {/* Live Chat Panel */}
      <div className="h-[240px]">
        <ChatPanel
          messages={roomData.chatMessages || []}
          onSendMessage={handleSendMessage}
          currentUserId={userPlayer.id}
        />
      </div>

      {/* Finished Modal */}
      {roomData.status === 'finished' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-[#fe4c6f] p-5 rounded-3xl max-w-xs w-full text-center space-y-3 shadow-xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#fe4c6f] mx-auto flex items-center justify-center text-2xl border border-rose-200">
              <Trophy className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900">Pertandingan Selesai</h3>
            <p className="text-slate-600 text-xs leading-relaxed">{roomData.statusReason}</p>

            <button
              onClick={onBack}
              className="w-full py-2.5 rounded-2xl bg-[#fe4c6f] hover:bg-[#e03a5b] text-white font-extrabold text-xs shadow-md transition-all active:scale-98"
            >
              Kembali ke Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
