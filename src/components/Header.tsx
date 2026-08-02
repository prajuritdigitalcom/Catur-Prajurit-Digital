import React from 'react';
import { Crown, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  profile: UserProfile;
  currentTab: string;
  onNavigate: (tab: string) => void;
  isGameActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  currentTab,
  onNavigate,
  isGameActive = false
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 py-2.5 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <button
          onClick={() => onNavigate('play')}
          className="flex items-center gap-2 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-[#fe4c6f] flex items-center justify-center text-white shadow-md shadow-rose-200 group-active:scale-95 transition-transform">
            <Crown className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 group-hover:text-[#fe4c6f] transition-colors">
                Prajurit Digital
              </span>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-rose-50 text-[#fe4c6f] font-bold border border-rose-200/60">
                Chess
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Catur HP Indonesia</p>
          </div>
        </button>

        {/* Compact User Profile Chip */}
        <button
          onClick={() => onNavigate('profile')}
          className="flex items-center gap-1.5 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 px-2.5 py-1 rounded-full text-left transition-all active:scale-95"
        >
          <span className="text-base">{profile.avatar || '⚔️'}</span>
          <div className="flex flex-col text-right">
            <span className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[85px]">
              {profile.displayName || profile.username}
            </span>
            <span className="text-[9px] text-[#fe4c6f] font-mono font-bold">
              {profile.rating} Elo
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
