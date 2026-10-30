import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../i18n/translations';
import { Home, BookOpen, CheckSquare, Trophy, Bookmark, User, Shield } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { language, isOwnerAdmin } = useAuth();
  const t = getTranslation(language);

  const navItems = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'courses', label: t.nav.courses, icon: BookOpen },
    { id: 'practice', label: t.nav.practice, icon: CheckSquare },
    { id: 'leaderboard', label: t.nav.leaderboard, icon: Trophy },
    { id: 'saved', label: t.nav.saved, icon: Bookmark },
    { id: 'profile', label: t.nav.profile, icon: User },
  ];

  if (isOwnerAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: Shield });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 text-slate-400 py-1 px-2 shadow-2xl">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative ${
                isActive
                  ? 'text-indigo-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping opacity-75" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[55px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
