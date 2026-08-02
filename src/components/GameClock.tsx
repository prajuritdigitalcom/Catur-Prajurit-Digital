import React from 'react';
import { Timer } from 'lucide-react';
import { Player } from '../types';

interface GameClockProps {
  player: Player;
  timeSeconds: number;
  isActive: boolean;
  unlimited?: boolean;
}

export const GameClock: React.FC<GameClockProps> = ({
  player,
  timeSeconds,
  isActive,
  unlimited = false
}) => {
  const formatTime = (totalSec: number) => {
    if (unlimited) return '∞';
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = !unlimited && timeSeconds <= 30;

  return (
    <div
      className={`flex items-center justify-between px-3 py-1.5 rounded-xl transition-all border ${
        isActive
          ? 'bg-rose-50/90 border-[#fe4c6f] shadow-sm'
          : 'bg-white border-slate-200/90 opacity-90'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-lg flex-shrink-0">{player.avatar}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-xs text-slate-900 truncate">
              {player.name}
            </span>
            <span className="text-[10px] text-[#fe4c6f] font-mono font-bold">
              ({player.rating})
            </span>
          </div>
          <span className="text-[9px] text-slate-500 block font-medium">
            {player.color === 'w' ? 'Putih' : 'Hitam'}
          </span>
        </div>
      </div>

      <div
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono font-extrabold text-xs tracking-wider ${
          isActive
            ? isLowTime
              ? 'bg-rose-100 text-rose-600 border border-rose-300 animate-pulse'
              : 'bg-[#fe4c6f] text-white shadow-xs'
            : 'bg-slate-100 text-slate-700 border border-slate-200'
        }`}
      >
        <Timer className="w-3 h-3 opacity-80" />
        <span>{formatTime(timeSeconds)}</span>
      </div>
    </div>
  );
};
