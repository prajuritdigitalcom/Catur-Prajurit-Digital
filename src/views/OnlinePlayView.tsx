import React, { useState, useEffect } from 'react';
import { ArrowLeft, Globe, Plus, LogIn, Users, RefreshCw, Sparkles } from 'lucide-react';
import { Player, TimeControl } from '../types';
import { TIME_CONTROLS } from '../constants/chess';

interface OnlinePlayViewProps {
  userPlayer: Player;
  onJoinRoomCode: (code: string) => void;
  onBack: () => void;
}

interface ActiveRoomSummary {
  code: string;
  hostName: string;
  hostRating: number;
  hostAvatar: string;
  status: 'waiting' | 'active';
  timeControlLabel: string;
  hasGuest: boolean;
}

export const OnlinePlayView: React.FC<OnlinePlayViewProps> = ({
  userPlayer,
  onJoinRoomCode,
  onBack
}) => {
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControl>(TIME_CONTROLS[2]); // 3m Blitz
  const [isCreating, setIsCreating] = useState(false);
  const [activeRooms, setActiveRooms] = useState<ActiveRoomSummary[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchActiveRooms = async () => {
    setIsLoadingRooms(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/rooms/list');
      const data = await res.json();
      if (data.success && Array.isArray(data.rooms)) {
        setActiveRooms(data.rooms);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchActiveRooms();
  }, []);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: userPlayer,
          timeControl: selectedTimeControl
        })
      });
      const data = await res.json();
      if (data.success && data.roomCode) {
        onJoinRoomCode(data.roomCode);
      } else {
        setErrorMessage(data.error || 'Gagal membuat room.');
      }
    } catch {
      setErrorMessage('Gagal menghubungkan ke server.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    onJoinRoomCode(roomCodeInput.trim().toUpperCase());
  };

  return (
    <div className="w-full max-w-md mx-auto px-3.5 py-4 space-y-4 animate-in fade-in duration-200 pb-20">
      {/* Mobile Header Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200/90 px-3 py-2 rounded-2xl shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <div className="flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-[#fe4c6f]" />
          <span className="font-extrabold text-xs text-slate-900">
            Lobi Room Online
          </span>
        </div>

        <button
          onClick={fetchActiveRooms}
          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
          title="Refresh Lobi"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingRooms ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-3 py-2 rounded-xl text-xs font-bold">
          {errorMessage}
        </div>
      )}

      {/* Section 1: Create Private Room Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-rose-50 text-[#fe4c6f] flex items-center justify-center font-bold border border-rose-100">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-slate-900">Buat Private Room Baru</h3>
            <p className="text-slate-500 text-[11px]">Dapatkan kode 2-digit untuk teman Anda.</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Kontrol Waktu:
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {TIME_CONTROLS.map((tc) => (
              <button
                key={tc.id}
                onClick={() => setSelectedTimeControl(tc)}
                className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                  selectedTimeControl.id === tc.id
                    ? 'bg-[#fe4c6f] text-white border-[#fe4c6f] shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {tc.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreateRoom}
          disabled={isCreating}
          className="w-full py-3 rounded-2xl bg-[#fe4c6f] hover:bg-[#e03a5b] text-white font-extrabold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          {isCreating ? 'Membuat Room...' : 'Buat Room HP'}
        </button>
      </div>

      {/* Section 2: Join by Room Code Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
            <LogIn className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-slate-900">Gabung Kode Room</h3>
            <p className="text-slate-500 text-[11px]">Masukkan kode 2-digit dari teman.</p>
          </div>
        </div>

        <form onSubmit={handleJoinByCode} className="space-y-2">
          <input
            type="text"
            maxLength={2}
            value={roomCodeInput}
            onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
            placeholder="CONTOH: X8"
            className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#fe4c6f] rounded-2xl px-3 py-2.5 font-mono font-black text-center text-base text-slate-900 uppercase tracking-widest placeholder-slate-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!roomCodeInput.trim()}
            className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-xs transition-all active:scale-98"
          >
            Gabung Pertandingan
          </button>
        </form>
      </div>

      {/* Section 3: Active Public Rooms */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-600" />
            <h3 className="font-extrabold text-xs text-slate-900">Lobi Room Publik</h3>
          </div>
          <span className="text-[10px] text-slate-500 font-bold">
            {activeRooms.length} room
          </span>
        </div>

        {activeRooms.length === 0 ? (
          <div className="text-center text-slate-400 py-6 text-xs italic">
            Belum ada room publik terbuka. Buat room pertama Anda!
          </div>
        ) : (
          <div className="space-y-2">
            {activeRooms.map((room) => (
              <div
                key={room.code}
                className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl">{room.hostAvatar}</span>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 truncate">
                      {room.hostName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {room.hostRating} Elo • {room.timeControlLabel}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onJoinRoomCode(room.code)}
                  className="px-3 py-1.5 rounded-xl bg-[#fe4c6f] hover:bg-[#e03a5b] text-white font-bold text-xs shadow-2xs flex-shrink-0"
                >
                  Masuk
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
