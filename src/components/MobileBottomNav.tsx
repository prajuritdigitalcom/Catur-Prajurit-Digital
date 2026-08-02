import React from 'react';
import { Play, Trophy, Users, User, Settings } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  hidden?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onNavigate,
  hidden = false
}) => {
  if (hidden) return null;

  const navItems = [
    { id: 'play', label: 'Main', icon: Play },
    { id: 'leaderboard', label: 'Klasemen', icon: Trophy },
    { id: 'friends', label: 'Teman', icon: Users },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'settings', label: 'Setelan', icon: Settings }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-ink-900/95 backdrop-blur-md border-t border-ink-700 px-2 py-1.5 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id || (currentTab === 'landing' && item.id === 'play');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center justify-center py-1.5 px-3 min-w-[60px] transition-all"
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-md mb-0.5 transition-all ${
                  isActive ? 'bg-brass-500/15 border border-brass-500/40' : 'border border-transparent'
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] ${
                    isActive ? 'text-brass-400 stroke-[2.25px]' : 'text-bone-400 stroke-[1.75px]'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] tracking-tight ${
                  isActive ? 'text-brass-400 font-semibold' : 'text-bone-400 font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
