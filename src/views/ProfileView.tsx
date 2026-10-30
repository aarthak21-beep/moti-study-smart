import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../i18n/translations';
import { Language } from '../types';
import {
  User,
  Crown,
  Flame,
  Award,
  Globe,
  Clock,
  Shield,
  LogOut,
  Sparkles,
  Zap,
  CheckCircle2,
  Calendar,
  Settings,
} from 'lucide-react';

interface ProfileViewProps {
  onOpenAdmin: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenAdmin }) => {
  const {
    user,
    language,
    setLanguage,
    isPremium,
    isTrial,
    isOwnerAdmin,
    openSubscriptionModal,
    switchDemoUser,
    logout,
  } = useAuth();
  const t = getTranslation(language);

  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const languages: { code: Language; label: string }[] = [
    { code: 'mr', label: 'मराठी' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'en', label: 'English' },
  ];

  const quizAttempts = user.progress?.quizAttempts || [];
  const completedVideos = user.progress?.completedVideos || [];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200 max-w-3xl mx-auto">
      {/* 1. Profile Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-2xl flex items-center justify-center border-2 border-indigo-400/40 shadow-lg shadow-indigo-600/30">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white">{user.name}</h2>
              {isOwnerAdmin ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Owner Admin
                </span>
              ) : isPremium ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                  <Crown className="w-3 h-3 fill-amber-400" />
                  Pro Member
                </span>
              ) : isTrial ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  7-Day Trial
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                  Free Plan
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            <p className="text-xs text-indigo-400 font-semibold mt-1">
              लक्ष्य: {user.targetExam || 'MPSC / State Exams'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwnerAdmin && (
            <button
              onClick={onOpenAdmin}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          )}

          <button
            onClick={logout}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 text-slate-400 border border-slate-700 text-xs transition-colors"
            title={t.common.logout}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Subscription Status & Upgrade Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-amber-950/40 border border-amber-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {isPremium
                ? 'Moti Pro Subscription (Active)'
                : isTrial
                ? '7-Day Free Trial (Active)'
                : 'Free Scholar Plan (मर्यादित प्रवेश)'}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white">
            {isPremium
              ? 'सर्व प्रिमियम व्हिडिओ आणि हस्तलिखित नोट्स उपलब्ध आहेत.'
              : isTrial
              ? 'तुमची ७ दिवसांची मोफत चाचणी सक्रिय आहे!'
              : 'प्रिमियम प्लॅनसह सर्व लेक्चर्स आणि नोट्स अनलॉक करा'}
          </h3>

          <p className="text-xs text-slate-300 mt-1">
            {user.subscription?.trialExpiresAt && isTrial && (
              <span>
                चाचणी समाप्ती: {new Date(user.subscription.trialExpiresAt).toLocaleDateString()}
              </span>
            )}
            {user.subscription?.premiumExpiresAt && isPremium && (
              <span>
                पुढील नूतनीकरण: {new Date(user.subscription.premiumExpiresAt).toLocaleDateString()}
              </span>
            )}
            {!isPremium && !isTrial && (
              <span>केवळ ₹४९/महिना किंवा ७ दिवसांची मोफत चाचणी सुरू करा.</span>
            )}
          </p>
        </div>

        <button
          onClick={openSubscriptionModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 shrink-0 flex items-center justify-center gap-1.5 transition-all transform hover:scale-105"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>{isPremium ? 'प्लॅन व्यवस्थापित करा' : isTrial ? '₹४९ प्रिमियम घ्या' : '७ दिवस मोफत ट्रायल / ₹४९'}</span>
        </button>
      </div>

      {/* 3. Study Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <Flame className="w-6 h-6 text-amber-500 fill-amber-500 mx-auto mb-1 animate-pulse" />
          <span className="text-xl font-black text-white">{user.streak || 1}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">दिवस सलग अभ्यास</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <Award className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
          <span className="text-xl font-black text-white">{user.totalScore || 0}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">एकूण गुण (Points)</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
          <span className="text-xl font-black text-white">{quizAttempts.length}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">चाचण्या पूर्ण</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <Clock className="w-6 h-6 text-violet-400 mx-auto mb-1" />
          <span className="text-xl font-black text-white">{completedVideos.length}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">व्हिडिओ पाहिले</span>
        </div>
      </div>

      {/* 4. Language Selection */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">पसंतीची भाषा (Preferred Language)</h3>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                language === l.code
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Recent Quiz Attempts */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>अलीकडील चाचण्यांचा इतिहास</span>
        </h3>

        {quizAttempts.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">
            अद्याप कोणतीही सराव चाचणी सोडवलेली नाही. 'सराव चाचणी' विभागात जाऊन परीक्षा सुरू करा.
          </p>
        ) : (
          <div className="divide-y divide-slate-800">
            {quizAttempts.slice(0, 5).map((attempt) => (
              <div key={attempt.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-slate-200">{attempt.quizTitle}</h4>
                  <span className="text-[10px] text-slate-500">
                    {new Date(attempt.date).toLocaleDateString()} • {attempt.timeSpentSeconds} सेकंद
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`font-bold text-xs ${
                      attempt.percentage >= 60 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {attempt.score}/{attempt.total} ({attempt.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Switch Demo User for Testing */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
        <span className="text-xs font-semibold text-slate-400 block">
          🔧 चाचणीसाठी खात्याची अदलाबदल (Demo Switcher):
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => switchDemoUser('student')}
            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5"
          >
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span>Student Profile</span>
          </button>
          <button
            onClick={() => switchDemoUser('admin')}
            className="py-2 px-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/40 text-xs font-semibold text-purple-300 flex items-center justify-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Owner Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
};
