import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../i18n/translations';
import { Language } from '../types';
import { Flame, Crown, Globe, Shield, Sparkles, User as UserIcon, LogIn, Search, Check } from 'lucide-react';

interface HeaderProps {
  onOpenSearch?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, setActiveTab }) => {
  const { user, language, setLanguage, isPremium, isTrial, isOwnerAdmin, openSubscriptionModal, openAuthModal } = useAuth();
  const t = getTranslation(language);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages: { code: Language; label: string; nativeName: string }[] = [
    { code: 'mr', label: 'मराठी', nativeName: 'मराठी' },
    { code: 'hi', label: 'हिंदी', nativeName: 'हिंदी' },
    { code: 'en', label: 'English', nativeName: 'English' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div
          onClick={() => setActiveTab && setActiveTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-violet-600 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-indigo-400 text-lg tracking-wider">
                M
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                Moti Study Smart
              </span>
              {(isPremium || isTrial) && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                  <Crown className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  {isTrial ? 'Trial' : 'Pro'}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {t.tagline}
            </span>
          </div>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Button */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              aria-label="Search"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Study Streak Badge */}
          {user && (
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 font-bold text-xs"
              title={`${user.streak || 1} ${t.common.streakDays}`}
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{user.streak || 1}</span>
            </div>
          )}

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{languages.find((l) => l.code === language)?.label}</span>
            </button>

            {langDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-36 rounded-xl bg-slate-900 border border-slate-700 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Select Language
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-indigo-600/20 transition-colors ${
                      language === l.code ? 'text-indigo-400 font-bold bg-indigo-950/40' : 'text-slate-300'
                    }`}
                  >
                    <span>{l.nativeName}</span>
                    {language === l.code && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Premium / Upgrade Crown CTA */}
          {!isPremium && (
            <button
              onClick={openSubscriptionModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>{isTrial ? 'Upgrade ₹49' : 'Free Trial'}</span>
            </button>
          )}

          {/* Admin Indicator */}
          {isOwnerAdmin && setActiveTab && (
            <button
              onClick={() => setActiveTab('admin')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-colors"
              title="Owner Admin Panel"
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden md:inline">Admin</span>
            </button>
          )}

          {/* User Profile / Login */}
          {user ? (
            <button
              onClick={() => setActiveTab && setActiveTab('profile')}
              className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600/40 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/40">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline text-xs font-medium text-slate-200 max-w-[80px] truncate">
                {user.name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.common.login}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
