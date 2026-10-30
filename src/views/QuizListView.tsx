import React, { useState, useEffect } from 'react';
import { Quiz } from '../types';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../i18n/translations';
import { api } from '../services/api';
import { CheckSquare, Clock, Award, Crown, Lock, PlayCircle, Sparkles } from 'lucide-react';

interface QuizListViewProps {
  onOpenQuiz: (quizId: string) => void;
}

export const QuizListView: React.FC<QuizListViewProps> = ({ onOpenQuiz }) => {
  const { user, language, isPremium, isTrial, openSubscriptionModal } = useAuth();
  const t = getTranslation(language);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const data = await api.getQuizzes();
        setQuizzes(data.quizzes || []);
      } catch (err) {
        console.error('Quiz list load error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  return (
    <div className="space-y-5 pb-20 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-indigo-400" />
          <span>{t.nav.practice}</span>
        </h1>
        <p className="text-xs text-slate-400">
          वेळेचे नियोजन व अचूकतेसाठी विषयनिहाय MCQ सराव चाचण्या आणि स्पष्टीकरण
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>{t.common.loading}</span>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs bg-slate-900/60 rounded-2xl border border-slate-800">
          सध्या कोणतीही चाचणी उपलब्ध नाही.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => {
            const quizTitle =
              language === 'mr' ? quiz.titleMr : language === 'hi' ? quiz.titleHi : quiz.titleEn;
            const isLocked = quiz.isPremium && !isPremium && !isTrial;

            // Check if student has attempted this quiz before
            const previousAttempt = user?.progress?.quizAttempts?.find(
              (a) => a.quizId === quiz.id
            );

            return (
              <div
                key={quiz.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isLocked
                    ? 'bg-slate-950/60 border-slate-800/80 opacity-90'
                    : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/50 shadow-lg hover:shadow-indigo-500/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      MCQ Mock Test
                    </span>
                    {quiz.isPremium ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Crown className="w-3 h-3 fill-amber-400" />
                        {t.common.premium}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {t.common.free}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-2">
                    {quizTitle}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {quiz.timeMinutes} मिनिटे
                    </span>
                    <span>•</span>
                    <span>{quiz.questionCount || 5} प्रश्न</span>
                    <span>•</span>
                    <span>उत्तीर्ण: {quiz.passingScore} गुण</span>
                  </div>

                  {previousAttempt && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">मागील निकाल:</span>
                      <span
                        className={`font-bold ${
                          previousAttempt.percentage >= 60 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {previousAttempt.score}/{previousAttempt.total} ({previousAttempt.percentage}%)
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    +{(quiz.questionCount || 5) * 20} Points
                  </span>

                  {isLocked ? (
                    <button
                      onClick={openSubscriptionModal}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>अनलॉक करा</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenQuiz(quiz.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>चाचणी सुरू करा</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
