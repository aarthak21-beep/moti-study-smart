import React, { useState, useEffect } from 'react';
import { Quiz, QuizQuestion } from '../types';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../i18n/translations';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { X, Clock, Award, CheckCircle2, XCircle, ArrowRight, ArrowLeft, RotateCcw, AlertTriangle, Sparkles } from 'lucide-react';

interface QuizModalProps {
  quizId: string;
  onClose: () => void;
  onQuizCompleted?: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ quizId, onClose, onQuizCompleted }) => {
  const { language, refreshUser } = useAuth();
  const t = getTranslation(language);

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(600);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const data = await api.getQuizQuestions(quizId);
        setQuiz(data.quiz);
        setSecondsRemaining((data.quiz.timeMinutes || 10) * 60);
      } catch (err: any) {
        console.error('Failed to load quiz', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  // Countdown timer
  useEffect(() => {
    if (!quiz || result || loading) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, result, loading]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || submitting) return;
    setSubmitting(true);
    setShowConfirmSubmit(false);

    try {
      const timeSpent = (quiz.timeMinutes || 10) * 60 - secondsRemaining;
      const res = await api.submitQuiz(quiz.id, answers, Math.max(10, timeSpent));
      setResult(res);
      await refreshUser();
      if (onQuizCompleted) onQuizCompleted();

      if (res.passed) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-white">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return null;
  }

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentQ = quiz.questions[currentIndex];
  const qTitle =
    language === 'mr' ? currentQ.questionMr : language === 'hi' ? currentQ.questionHi : currentQ.questionEn;
  const qOptions =
    language === 'mr' ? currentQ.optionsMr : language === 'hi' ? currentQ.optionsHi : currentQ.optionsEn;

  const totalAnswered = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl max-h-[95vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
          <div>
            <span className="text-xs font-bold text-indigo-400">
              {language === 'mr' ? quiz.titleMr : language === 'hi' ? quiz.titleHi : quiz.titleEn}
            </span>
            <div className="text-[11px] text-slate-400">
              {totalAnswered} / {quiz.questions.length} उत्तर दिले
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!result && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold border ${
                  secondsRemaining < 60
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
                    : 'bg-slate-800 text-amber-300 border-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!result ? (
            /* Active Quiz Mode */
            <div className="space-y-6">
              {/* Question Navigation Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {quiz.questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`min-w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 scale-105'
                          : isAnswered
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Question Box */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold mb-3">
                  <span>प्रश्न {currentIndex + 1} / {quiz.questions.length}</span>
                  <span>गुण: +1</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                  {qTitle}
                </h3>
              </div>

              {/* 4 Options */}
              <div className="space-y-3">
                {qOptions.map((optText, optIdx) => {
                  const isSelected = answers[currentQ.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500 shadow-md'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center border transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-400'
                              : 'bg-slate-800 text-slate-400 border-slate-700 group-hover:border-slate-500'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-snug">{optText}</span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Results & Review Mode */
            <div className="space-y-6">
              {/* Score Banner */}
              <div
                className={`p-6 rounded-2xl border text-center ${
                  result.passed
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                    : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                  <Award
                    className={`w-8 h-8 ${result.passed ? 'text-emerald-400' : 'text-amber-400'}`}
                  />
                </div>
                <h3 className="text-2xl font-black mb-1">
                  {result.passed ? t.quiz.congrats : t.quiz.needImprovement}
                </h3>
                <p className="text-3xl font-extrabold text-white my-2">
                  {result.score} / {result.total}{' '}
                  <span className="text-base font-medium text-slate-300">
                    ({result.percentage}%)
                  </span>
                </p>
                <p className="text-xs text-slate-300">
                  मिळालेले गुण: <span className="font-bold text-amber-400">+{result.earnedPoints} Points</span> • एकूण स्कोअर: {result.totalScore}
                </p>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  {t.quiz.reviewTitle}
                </h4>

                {result.review.map((item: any, idx: number) => {
                  const itemTitle =
                    language === 'mr'
                      ? item.questionMr
                      : language === 'hi'
                      ? item.questionHi
                      : item.questionEn;
                  const itemOptions =
                    language === 'mr'
                      ? item.optionsMr
                      : language === 'hi'
                      ? item.optionsHi
                      : item.optionsEn;
                  const itemExplanation =
                    language === 'mr'
                      ? item.explanationMr
                      : language === 'hi'
                      ? item.explanationHi
                      : item.explanationEn;

                  return (
                    <div
                      key={item.id}
                      className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-indigo-400">
                          प्रश्न {idx + 1}
                        </span>
                        {item.isCorrect ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            अचूक (+1)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            चुकीचे
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-slate-100">{itemTitle}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block mb-0.5">
                            {t.quiz.yourAnswer}:
                          </span>
                          <span
                            className={
                              item.isCorrect
                                ? 'text-emerald-400 font-bold'
                                : 'text-rose-400 font-bold'
                            }
                          >
                            {item.selectedOption !== null
                              ? itemOptions[item.selectedOption] || 'अनुत्तरित'
                              : 'सोडवले नाही'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/20">
                          <span className="text-[10px] text-slate-400 block mb-0.5">
                            {t.quiz.correctAnswer}:
                          </span>
                          <span className="text-emerald-400 font-bold">
                            {itemOptions[item.correctOption]}
                          </span>
                        </div>
                      </div>

                      {itemExplanation && (
                        <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200">
                          <span className="font-bold text-indigo-300 block mb-1">
                            💡 {t.quiz.explanation}:
                          </span>
                          {itemExplanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between">
          {!result ? (
            <>
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.quiz.prevQuestion}</span>
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < quiz.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                  >
                    <span>{t.quiz.nextQuestion}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmSubmit(true)}
                    className="flex items-center gap-1 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.quiz.submitTest}</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <button
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                  setCurrentIndex(0);
                  setSecondsRemaining((quiz.timeMinutes || 10) * 60);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>पुन्हा चाचणी द्या</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {t.common.close}
              </button>
            </div>
          )}
        </div>

        {/* Confirmation Modal overlay */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">चाचणी सबमिट करायची आहे का?</h4>
              <p className="text-xs text-slate-400">
                तुम्ही {quiz.questions.length} पैकी {totalAnswered} प्रश्नांची उत्तरे दिली आहेत.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md"
                >
                  {submitting ? t.common.loading : 'होय, सबमिट करा'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
