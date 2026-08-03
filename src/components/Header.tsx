import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { User, Settings, X, ChevronRight } from 'lucide-react';

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
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close popup if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsPopupOpen(false);
      }
    };

    if (isPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopupOpen]);

  const winRate =
    profile.gamesPlayed > 0
      ? Math.round((profile.wins / profile.gamesPlayed) * 100)
      : 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-ink-900/95 backdrop-blur-md border-b border-ink-700 px-3.5 py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        <button
          onClick={() => {
            setIsPopupOpen(false);
            onNavigate('play');
          }}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-md bg-ink-800 border border-brass-600/40 flex items-center justify-center text-brass-400 group-active:scale-95 transition-transform text-lg font-display">
            ♞
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-semibold text-[15px] tracking-tight text-bone-100 leading-none">
                Catur HP
              </span>
            </div>
            <p className="text-[10px] font-notation text-brass-500/80 tracking-wide mt-0.5">
              Indonesia
            </p>
          </div>
        </button>

        <button
          ref={buttonRef}
          onClick={() => setIsPopupOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 bg-ink-800 hover:bg-ink-700 border px-2.5 py-1 rounded-md text-left transition-all active:scale-95 ${
            isPopupOpen ? 'border-brass-500 ring-2 ring-brass-500/30' : 'border-ink-600'
          }`}
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

        {/* Profile Pop-up Card */}
        {isPopupOpen && (
          <div
            ref={popupRef}
            className="absolute top-full right-0 mt-2 w-72 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3"
          >
            {/* Pop-up Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-[#fe4c6f]/40 flex items-center justify-center text-xl shrink-0">
                  {profile.avatar || '⚔️'}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 truncate">
                    {profile.displayName || profile.username}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    @{profile.username}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsPopupOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl">
                <div className="text-[8px] uppercase font-bold text-slate-400">Rating</div>
                <div className="text-xs font-mono font-extrabold text-[#fe4c6f]">
                  {profile.rating}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl">
                <div className="text-[8px] uppercase font-bold text-slate-400">Menang</div>
                <div className="text-xs font-mono font-extrabold text-emerald-600">
                  {profile.wins}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl">
                <div className="text-[8px] uppercase font-bold text-slate-400">Win Rate</div>
                <div className="text-xs font-mono font-extrabold text-slate-800">
                  {winRate}%
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => {
                  setIsPopupOpen(false);
                  onNavigate('profile');
                }}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#fe4c6f]" />
                  Lihat / Edit Profil
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setIsPopupOpen(false);
                  onNavigate('settings');
                }}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-slate-600" />
                  Pengaturan
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
