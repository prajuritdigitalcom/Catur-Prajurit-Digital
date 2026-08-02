import React from 'react';
import { Play, Trophy, Users, User, Settings, Search } from 'lucide-react';

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-lg pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id || (currentTab === 'landing' && item.id === 'play');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl min-w-[62px] transition-all ${
                isActive
                  ? 'text-[#fe4c6f] font-bold bg-rose-50/80 scale-105'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
