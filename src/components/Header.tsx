import React from 'react';
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
    <header className="sticky top-0 z-40 w-full bg-ink-900/95 backdrop-blur-md border-b border-ink-700 px-3.5 py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <button
          onClick={() => onNavigate('play')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-md bg-ink-800 border border-brass-600/40 flex items-center justify-center text-brass-400 group-active:scale-95 transition-transform text-lg font-display">
            ♞
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-semibold text-[15px] tracking-tight text-bone-100 leading-none">
                Prajurit Digital
              </span>
            </div>
            <p className="text-[10px] font-notation text-brass-500/80 tracking-wide mt-0.5">
              catur.hp/indonesia
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('profile')}
          className="flex items-center gap-1.5 bg-ink-800 hover:bg-ink-700 border border-ink-600 px-2.5 py-1 rounded-md text-left transition-all active:scale-95"
        >
          <span className="text-base leading-none">{profile.avatar || '⚔️'}</span>
          <div className="flex flex-col text-right">
            <span className="text-[11px] font-semibold text-bone-200 leading-tight truncate max-w-[85px]">
              {profile.displayName || profile.username}
            </span>
            <span className="text-[9px] text-brass-400 font-notation">
              {profile.rating} elo
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
