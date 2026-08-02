import React, { useState, useEffect } from 'react';
import { Trophy, Search } from 'lucide-react';
import { LeaderboardEntry } from '../types';

export const LeaderboardView: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.leaderboard)) {
          setLeaderboard(data.leaderboard);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = leaderboard.filter(
    (p) =>
      p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-md mx-auto px-3.5 py-4 space-y-3.5 animate-in fade-in duration-200 pb-20">
      {/* Mobile Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-4 text-white shadow-xs space-y-1">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white font-black text-[10px] uppercase">
          <Trophy className="w-3 h-3" />
          Peringkat Elo Resmi
        </div>
        <h2 className="text-xl font-black">Klasemen Pemain</h2>
        <p className="text-amber-100 text-xs">Penyatur terbaik Prajurit Digital.</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari pemain..."
          className="w-full bg-white border border-slate-200/90 rounded-2xl pl-10 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#fe4c6f] shadow-xs"
        />
      </div>

      {/* Leaderboard List */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs divide-y divide-slate-100">
        {isLoading ? (
          <div className="py-10 text-center text-slate-400 text-xs font-semibold">
            Memuat peringkat...
          </div>
        ) : (
          filtered.map((entry) => {
            const isTop1 = entry.rank === 1;
            const isTop2 = entry.rank === 2;
            const isTop3 = entry.rank === 3;

            return (
              <div
                key={entry.id}
                className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
                      isTop1
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : isTop2
                        ? 'bg-slate-200 text-slate-800'
                        : isTop3
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {entry.rank}
                  </div>

                  <span className="text-xl flex-shrink-0">{entry.avatar}</span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-slate-900 truncate">
                        {entry.displayName}
                      </span>
                      {entry.isOnline && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Online" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      @{entry.username} • {entry.wins}W / {entry.losses}L
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="font-mono font-black text-xs text-[#fe4c6f]">
                    {entry.rating} Elo
                  </div>
                  <div className="text-[9px] text-emerald-600 font-bold">
                    {entry.winRate}%
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
