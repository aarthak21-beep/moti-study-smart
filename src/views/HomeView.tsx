import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../i18n/translations';
import { Course, Category, VideoLecture, Quiz } from '../types';
import { api } from '../services/api';
import {
  Flame,
  Award,
  Crown,
  PlayCircle,
  FileText,
  CheckSquare,
  ArrowRight,
  Sparkles,
  BookOpen,
  GraduationCap,
  Briefcase,
  Zap,
  Lock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface HomeViewProps {
  onSelectCourse: (courseId: string) => void;
  onOpenVideo: (video: VideoLecture) => void;
  onOpenQuiz: (quizId: string) => void;
  setActiveTab: (tab: string) => void;
  setSelectedCategory: (catId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectCourse,
  onOpenVideo,
  onOpenQuiz,
  setActiveTab,
  setSelectedCategory,
}) => {
  const { user, language, isPremium, isTrial, openSubscriptionModal, openAuthModal } = useAuth();
  const t = getTranslation(language);

  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [freeVideos, setFreeVideos] = useState<VideoLecture[]>([]);
  const [dailyQuiz, setDailyQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [catData, crsData, qzData] = await Promise.all([
          api.getCategories(),
          api.getCourses(),
          api.getQuizzes(),
        ]);

        setCategories(catData.categories || []);
        setFeaturedCourses(crsData.courses || []);

        if (qzData.quizzes && qzData.quizzes.length > 0) {
          setDailyQuiz(qzData.quizzes[0]);
        }

        // Fetch free videos for the home carousel
        if (crsData.courses && crsData.courses.length > 0) {
          const detail = await api.getCourseDetails(crsData.courses[0].id);
          setFreeVideos(detail.videos.slice(0, 4));
        }
      } catch (err) {
        console.error('Home load error', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Award':
        return Award;
      case 'GraduationCap':
        return GraduationCap;
      case 'Briefcase':
        return Briefcase;
      default:
        return BookOpen;
    }
  };

  const hasTrialAlready = Boolean(user?.subscription?.trialStartedAt);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* 1. Student Welcome Greeting & Streak */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-5 sm:p-7 border border-indigo-500/30 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-2 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{user?.targetExam || 'Moti Study Smart'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {t.home.greeting}, {user ? user.name.split(' ')[0] : 'विद्यार्थी मित्र'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              {t.home.greetingSub}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-sm shadow-inner">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
              <div>
                <span className="text-base">{user?.streak || 1}</span>
                <span className="text-[10px] block font-normal text-amber-200/80">दिवस सलग</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-200 font-extrabold text-sm shadow-inner">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="text-base">{user?.totalScore || 0}</span>
                <span className="text-[10px] block font-normal text-indigo-300/80">एकूण गुण</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 7-Day Free Trial / Subscription Callout Banner */}
      {!isPremium && !isTrial && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 p-4 sm:p-5 text-slate-950 shadow-xl shadow-amber-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950/20 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm uppercase tracking-wide">
                  {t.home.trialBannerTitle}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-400 text-[10px] font-extrabold">
                  ₹० मोफत
                </span>
              </div>
              <p className="text-xs text-slate-950/90 font-medium mt-0.5 max-w-lg">
                {t.home.trialBannerSub} (केवळ ₹४९/महिना नंतर)
              </p>
            </div>
          </div>

          <button
            onClick={openSubscriptionModal}
            className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-black text-xs shadow-lg transition-transform hover:scale-105 shrink-0 flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{!hasTrialAlready ? '७ दिवस मोफत चाचणी घ्या' : '₹४९ प्रिमियम घ्या'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Category Selector Cards */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>{t.home.categoriesTitle}</span>
          </h2>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setActiveTab('courses');
            }}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
          >
            <span>{t.common.viewAll}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            const catName =
              language === 'mr' ? cat.nameMr : language === 'hi' ? cat.nameHi : cat.nameEn;
            const catDesc =
              language === 'mr'
                ? cat.descriptionMr
                : language === 'hi'
                ? cat.descriptionHi
                : cat.descriptionEn;

            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setActiveTab('courses');
                }}
                className="group p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all hover:-translate-y-1 shadow-md hover:shadow-indigo-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                    {cat.badge}
                  </span>
                  <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {catName}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {catDesc}
                  </p>
                </div>
                <div className="mt-3 flex items-center text-[11px] font-semibold text-slate-400 group-hover:text-indigo-400 transition-colors">
                  <span>पाहा</span>
                  <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Daily Practice 5-Min MCQ Test Banner */}
      {dailyQuiz && (
        <div className="rounded-2xl bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 border border-indigo-500/30 p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0 shadow-inner">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Daily Challenge
                </span>
                <span className="text-xs text-slate-400">{dailyQuiz.timeMinutes} मिनिटे</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {language === 'mr'
                  ? dailyQuiz.titleMr
                  : language === 'hi'
                  ? dailyQuiz.titleHi
                  : dailyQuiz.titleEn}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {t.home.dailyQuizSub}
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenQuiz(dailyQuiz.id)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all shrink-0 flex items-center justify-center gap-1.5"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{t.common.startQuiz}</span>
          </button>
        </div>
      )}

      {/* 5. Featured Courses */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>{t.home.featuredCourses}</span>
          </h2>
          <button
            onClick={() => setActiveTab('courses')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
          >
            <span>{t.common.viewAll}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredCourses.map((course) => {
            const courseTitle =
              language === 'mr'
                ? course.titleMr
                : language === 'hi'
                ? course.titleHi
                : course.titleEn;

            return (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course.id)}
                className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 overflow-hidden cursor-pointer shadow-md hover:shadow-indigo-500/10 transition-all hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                    <img
                      src={course.thumbnail}
                      alt={courseTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 backdrop-blur-md text-white border border-slate-700">
                        {course.grade}
                      </span>
                      {course.isPremium ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-0.5 shadow-sm">
                          <Crown className="w-3 h-3 fill-slate-950" />
                          {t.common.premium}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-slate-950 shadow-sm">
                          {t.common.free}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                      {courseTitle}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                      <span className="truncate max-w-[150px]">{course.instructor}</span>
                      <span className="text-amber-400 font-bold">★ {course.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-1 flex items-center justify-between text-xs border-t border-slate-800/80">
                  <span className="text-slate-400">
                    {course.totalStudents.toLocaleString()} {t.common.students}
                  </span>
                  <span className="text-indigo-400 font-bold group-hover:underline flex items-center gap-0.5">
                    अभ्यासक्रम पहा
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Free Educational Video Lectures Strip */}
      {freeVideos.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <PlayCircle className="w-4 h-4 text-emerald-400" />
              <span>{t.home.freeLecturesTitle}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {freeVideos.map((vid) => {
              const vidTitle =
                language === 'mr' ? vid.titleMr : language === 'hi' ? vid.titleHi : vid.titleEn;
              const isUserDone = user?.progress?.completedVideos?.includes(vid.id);

              return (
                <div
                  key={vid.id}
                  onClick={() => onOpenVideo(vid)}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between gap-3 group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <PlayCircle className="w-5 h-5 fill-emerald-500/20" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                        {vidTitle}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {vid.chapterName} • {vid.duration}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                    {isUserDone ? '✓ पूर्ण' : t.common.free}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
