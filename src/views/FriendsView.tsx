import React, { useState } from 'react';
import { Users, UserPlus, Globe, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface FriendsViewProps {
  profile: UserProfile;
  onOpenOnlineRoom: () => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({ profile, onOpenOnlineRoom }) => {
  const [newFriendName, setNewFriendName] = useState('');
  const [friendList, setFriendList] = useState([
    { name: 'Dimas_Grandmaster', elo: 1850, avatar: '🦁', status: 'online' },
    { name: 'Rani_ChessPro', elo: 2100, avatar: '🐉', status: 'online' },
    { name: 'Bima_Tactics', elo: 1620, avatar: '⚔️', status: 'offline' }
  ]);
  const [addedMessage, setAddedMessage] = useState('');

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;

    setFriendList((prev) => [
      ...prev,
      {
        name: newFriendName.trim(),
        elo: 1200,
        avatar: '♟️',
        status: 'online'
      }
    ]);

    setAddedMessage(`Permintaan terkirim ke "${newFriendName}"!`);
    setNewFriendName('');
    setTimeout(() => setAddedMessage(''), 3000);
  };

  return (
    <div className="w-full max-w-md mx-auto px-3.5 py-4 space-y-3.5 animate-in fade-in duration-200 pb-20">
      {/* Mobile Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-4 text-white shadow-xs space-y-2">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white font-black text-[10px] uppercase">
          <Users className="w-3 h-3" />
          Komunitas Catur
        </div>
        <h2 className="text-xl font-black">Teman & Komunitas</h2>
        <button
          onClick={onOpenOnlineRoom}
          className="w-full py-2.5 rounded-2xl bg-white text-blue-700 font-extrabold text-xs shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5"
        >
          <Globe className="w-4 h-4 text-[#fe4c6f]" />
          Buat Undangan Room HP
        </button>
      </div>

      {/* Add Friend Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 space-y-3 shadow-xs">
        <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
          <UserPlus className="w-4 h-4 text-[#fe4c6f]" />
          Tambah Teman Baru
        </h3>

        {addedMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            {addedMessage}
          </div>
        )}

        <form onSubmit={handleAddFriend} className="flex items-center gap-1.5">
          <input
            type="text"
            value={newFriendName}
            onChange={(e) => setNewFriendName(e.target.value)}
            placeholder="Username (contoh: Rani_ChessPro)..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#fe4c6f]"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-2xl bg-[#fe4c6f] hover:bg-[#e03a5b] text-white font-extrabold text-xs shadow-2xs flex-shrink-0 active:scale-98"
          >
            Tambah
          </button>
        </form>
      </div>

      {/* Friends List */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 space-y-3 shadow-xs">
        <h3 className="font-extrabold text-xs text-slate-900">Teman Saya ({friendList.length})</h3>

        <div className="space-y-2">
          {friendList.map((f) => (
            <div
              key={f.name}
              className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl">{f.avatar}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-slate-900 truncate">{f.name}</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        f.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                      title={f.status}
                    />
                  </div>
                  <span className="text-[10px] text-[#fe4c6f] font-mono font-bold">
                    {f.elo} Elo
                  </span>
                </div>
              </div>

              <button
                onClick={onOpenOnlineRoom}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#fe4c6f] text-slate-800 font-bold text-xs transition-colors shadow-2xs"
              >
                Tantang
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
