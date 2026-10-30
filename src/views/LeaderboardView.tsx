import React, { useState, useEffect } from 'react';
import { LeaderboardUser } from '../types';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../i18n/translations';
import { api } from '../services/api';
import { Trophy, Medal, Flame, Crown, Award, Sparkles, TrendingUp } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { user, language } = useAuth();
  const t = getTranslation(language);

  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'overall'>('overall');
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await api.getLeaderboard(period);
        setLeaderboard(data.leaderboard || []);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [period]);

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  const currentUserRank = leaderboard.find((item) => item.id === user?.id);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span>{t.nav.leaderboard}</span>
          </h1>
          <p className="text-xs text-slate-400">
            दैनिक व साप्ताहिक चाचण्यांमधील सर्वोत्तम गुणवंत विद्यार्थी
          </p>
        </div>

        {/* Time period filter */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setPeriod('overall')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              period === 'overall'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            सर्व वेळ (Overall)
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              period === 'monthly'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            या महिन्यातील
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              period === 'weekly'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            या आठवड्यातील
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>{t.common.loading}</span>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {topThree.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 items-end max-w-xl mx-auto">
              {/* Rank 2 - Silver */}
              <div className="order-1 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 sm:p-4 text-center shadow-lg flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/40 flex items-center justify-center text-xs font-black mb-2">
                  🥈 2
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-200 font-black text-sm flex items-center justify-center border border-slate-700 mb-2">
                  {topThree[1].name.charAt(0)}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-full">
                  {topThree[1].name.split(' ')[0]}
                </h4>
                <span className="text-[10px] text-amber-400 font-extrabold mt-1">
                  {topThree[1].totalScore} pts
                </span>
                <span className="text-[9px] text-slate-400">{topThree[1].streak} 🔥</span>
              </div>

              {/* Rank 1 - Gold (Elevated) */}
              <div className="order-2 bg-gradient-to-b from-amber-950/40 via-slate-900 to-indigo-950/40 border-2 border-amber-500/60 rounded-2xl p-4 sm:p-5 text-center shadow-2xl flex flex-col items-center relative -translate-y-4">
                <Crown className="w-6 h-6 text-amber-400 fill-amber-400 animate-bounce mb-1" />
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center text-xs font-black mb-2">
                  🥇 1
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-200 font-black text-base flex items-center justify-center border border-amber-500/40 mb-2 shadow-inner">
                  {topThree[0].name.charAt(0)}
                </div>
                <h4 className="text-xs sm:text-base font-black text-white truncate max-w-full">
                  {topThree[0].name}
                </h4>
                <span className="text-xs text-amber-400 font-black mt-1">
                  {topThree[0].totalScore} pts
                </span>
                <span className="text-[10px] text-slate-300 mt-0.5">
                  {topThree[0].streak} दिवस 🔥
                </span>
              </div>

              {/* Rank 3 - Bronze */}
              <div className="order-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 sm:p-4 text-center shadow-lg flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-amber-800/30 text-amber-400 border border-amber-800/50 flex items-center justify-center text-xs font-black mb-2">
                  🥉 3
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-200 font-black text-sm flex items-center justify-center border border-slate-700 mb-2">
                  {topThree[2].name.charAt(0)}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-full">
                  {topThree[2].name.split(' ')[0]}
                </h4>
                <span className="text-[10px] text-amber-400 font-extrabold mt-1">
                  {topThree[2].totalScore} pts
                </span>
                <span className="text-[9px] text-slate-400">{topThree[2].streak} 🔥</span>
              </div>
            </div>
          )}

          {/* Current User Rank Pill */}
          {currentUserRank && (
            <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  #{currentUserRank.rank}
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{currentUserRank.name} (तुम्ही)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300">
                      माझे स्थान
                    </span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {currentUserRank.targetExam || 'Moti Study Smart'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs sm:text-sm font-black text-amber-400 block">
                  {currentUserRank.totalScore} Points
                </span>
                <span className="text-[11px] text-slate-400">
                  {currentUserRank.quizzesCompleted} चाचण्या पूर्ण
                </span>
              </div>
            </div>
          )}

          {/* Full Leaderboard List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 text-xs font-bold text-slate-400 flex items-center justify-between">
              <span>विद्यार्थी व क्रमवारी</span>
              <span>एकूण गुण / चाचण्या</span>
            </div>

            <div className="divide-y divide-slate-800">
              {leaderboard.map((item) => {
                const isMe = item.id === user?.id;
                return (
                  <div
                    key={item.id}
                    className={`px-4 py-3.5 flex items-center justify-between transition-colors ${
                      isMe ? 'bg-indigo-600/10 font-bold' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                          item.rank === 1
                            ? 'bg-amber-500 text-slate-950'
                            : item.rank === 2
                            ? 'bg-slate-400 text-slate-950'
                            : item.rank === 3
                            ? 'bg-amber-800 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.rank}
                      </span>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm text-white font-semibold">
                            {item.name}
                          </span>
                          {item.isPremium && (
                            <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {item.targetExam || 'सामान्य तयारी'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-bold text-amber-400 block">
                        {item.totalScore} pts
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                        <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {item.streak} दिवस
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
