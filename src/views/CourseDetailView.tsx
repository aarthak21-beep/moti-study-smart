import React, { useState, useEffect } from 'react';
import { Course, VideoLecture, PDFNote, Quiz } from '../types';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../i18n/translations';
import { api } from '../services/api';
import {
  ArrowLeft,
  PlayCircle,
  FileText,
  CheckSquare,
  Lock,
  Crown,
  Sparkles,
  Download,
  Clock,
  BookOpen,
  Share2,
} from 'lucide-react';

interface CourseDetailViewProps {
  courseId: string;
  onBack: () => void;
  onOpenVideo: (video: VideoLecture) => void;
  onOpenNote: (note: PDFNote) => void;
  onOpenQuiz: (quizId: string) => void;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  courseId,
  onBack,
  onOpenVideo,
  onOpenNote,
  onOpenQuiz,
}) => {
  const { user, language, isPremium, isTrial, openSubscriptionModal } = useAuth();
  const t = getTranslation(language);

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<VideoLecture[]>([]);
  const [notes, setNotes] = useState<PDFNote[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeTab, setActiveTab] = useState<'videos' | 'notes' | 'quizzes'>('videos');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await api.getCourseDetails(courseId);
        setCourse(data.course);
        setVideos(data.videos || []);
        setNotes(data.notes || []);
        setQuizzes(data.quizzes || []);
      } catch (err) {
        console.error('Course details load error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span>{t.common.loading}</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p>अभ्यासक्रम सापडला नाही.</p>
        <button onClick={onBack} className="mt-3 text-indigo-400 font-bold text-xs underline">
          परत जा
        </button>
      </div>
    );
  }

  const courseTitle =
    language === 'mr' ? course.titleMr : language === 'hi' ? course.titleHi : course.titleEn;
  const courseDesc =
    language === 'mr'
      ? course.descriptionMr
      : language === 'hi'
      ? course.descriptionHi
      : course.descriptionEn;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>सर्व अभ्यासक्रमांकडे परत जा</span>
      </button>

      {/* Course Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 p-5 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {course.grade}
                </span>
                {course.isPremium ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {t.common.premium}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {t.common.free}
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  ★ {course.rating} • {course.totalStudents.toLocaleString()} विद्यार्थी
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {courseTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {courseDesc}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>मार्गदर्शक: <strong className="text-white">{course.instructor}</strong></span>
              <span className="text-indigo-400 font-semibold">{course.targetAudience}</span>
            </div>
          </div>

          <div className="relative aspect-video md:aspect-auto h-full overflow-hidden bg-slate-950">
            <img
              src={course.thumbnail}
              alt={courseTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent md:bg-gradient-to-l" />
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'videos'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>व्हिडिओ लेक्चर्स ({videos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'notes'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>PDF हस्तलिखित नोट्स ({notes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quizzes')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'quizzes'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>सराव चाचण्या ({quizzes.length})</span>
        </button>
      </div>

      {/* Tab 1: Video Lectures Playlist */}
      {activeTab === 'videos' && (
        <div className="space-y-3">
          {videos.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-900/60 rounded-2xl border border-slate-800">
              या अभ्यासक्रमासाठी लवकरच व्हिडिओ लेक्चर्स जोडले जातील.
            </div>
          ) : (
            videos.map((vid, idx) => {
              const vidTitle =
                language === 'mr' ? vid.titleMr : language === 'hi' ? vid.titleHi : vid.titleEn;
              const isLocked = vid.isPremium && !isPremium && !isTrial;
              const isCompleted = user?.progress?.completedVideos?.includes(vid.id);

              return (
                <div
                  key={vid.id}
                  onClick={() => onOpenVideo(vid)}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isLocked
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-80 hover:opacity-100 hover:border-amber-500/40'
                      : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 hover:border-indigo-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isLocked
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          : isCompleted
                          ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                          : 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400'
                      }`}
                    >
                      {isLocked ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <PlayCircle className="w-5 h-5 fill-current/10" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          भाग {idx + 1} • {vid.chapterName}
                        </span>
                        {vid.isPremium && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            PRO
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5 line-clamp-1">
                        {vidTitle}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {vid.duration}
                    </span>
                    {isLocked ? (
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        अनलॉक
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-600/30 text-indigo-300 border border-indigo-500/40">
                        {isCompleted ? '✓ पाहिले' : 'पहा'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: PDF Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-900/60 rounded-2xl border border-slate-800">
              या अभ्यासक्रमासाठी लवकरच PDF नोट्स जोडल्या जातील.
            </div>
          ) : (
            notes.map((note) => {
              const noteTitle =
                language === 'mr' ? note.titleMr : language === 'hi' ? note.titleHi : note.titleEn;
              const isLocked = note.isPremium && !isPremium && !isTrial;

              return (
                <div
                  key={note.id}
                  onClick={() => onOpenNote(note)}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isLocked
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-80 hover:opacity-100 hover:border-amber-500/40'
                      : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 hover:border-indigo-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isLocked
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}
                    >
                      {isLocked ? <Lock className="w-4 h-4" /> : <FileText className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          {note.chapterName} • {note.pages} पाने
                        </span>
                        {note.isPremium && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            PRO PDF
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5 line-clamp-1">
                        {noteTitle}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-400 font-mono">{note.size}</span>
                    <button
                      className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 ${
                        isLocked
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                      }`}
                    >
                      {isLocked ? <Lock className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                      <span>{isLocked ? 'अनलॉक' : 'वाचा'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Quizzes */}
      {activeTab === 'quizzes' && (
        <div className="space-y-3">
          {quizzes.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-900/60 rounded-2xl border border-slate-800">
              या अभ्यासक्रमासाठी सराव प्रश्न लवकरच उपलब्ध होतील.
            </div>
          ) : (
            quizzes.map((q) => {
              const qTitle =
                language === 'mr' ? q.titleMr : language === 'hi' ? q.titleHi : q.titleEn;
              const isLocked = q.isPremium && !isPremium && !isTrial;

              return (
                <div
                  key={q.id}
                  onClick={() => onOpenQuiz(q.id)}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isLocked
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-80 hover:opacity-100 hover:border-amber-500/40'
                      : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 hover:border-indigo-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isLocked
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {isLocked ? <Lock className="w-4 h-4" /> : <CheckSquare className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          {q.questionCount || 5} प्रश्न • {q.timeMinutes} मिनिटे
                        </span>
                        {q.isPremium && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            PRO MOCK
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5 line-clamp-1">
                        {qTitle}
                      </h4>
                    </div>
                  </div>

                  <button
                    className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                      isLocked
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/40'
                    }`}
                  >
                    {isLocked ? 'अनलॉक' : 'चाचणी द्या'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
