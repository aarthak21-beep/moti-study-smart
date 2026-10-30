import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Course, Category, VideoLecture, PDFNote, Quiz, PaymentRecord } from '../types';
import {
  Shield,
  Users,
  IndianRupee,
  BookOpen,
  PlayCircle,
  FileText,
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Crown,
  Search,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { user, isOwnerAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'stats' | 'courses' | 'videos' | 'notes' | 'quizzes' | 'users' | 'payments'
  >('stats');

  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<VideoLecture[]>([]);
  const [notes, setNotes] = useState<PDFNote[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  // Modals for creating new items
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddQuiz, setShowAddQuiz] = useState(false);

  // Forms
  const [newCourse, setNewCourse] = useState({
    titleEn: '',
    titleMr: '',
    categoryId: 'competitive',
    grade: 'Competitive',
    instructor: 'Moti Study Faculty',
    isPremium: false,
    descriptionEn: '',
    descriptionMr: '',
    thumbnail: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
  });

  const [newVideo, setNewVideo] = useState({
    courseId: '',
    titleEn: '',
    titleMr: '',
    youtubeUrl: '',
    duration: '20:00',
    chapterName: 'प्रकरण १',
    isPremium: false,
    summaryMr: '',
  });

  const [newNote, setNewNote] = useState({
    courseId: '',
    titleEn: '',
    titleMr: '',
    pages: 10,
    size: '2.5 MB',
    chapterName: 'प्रकरण १',
    isPremium: false,
    contentMarkdown: '',
  });

  const [newQuiz, setNewQuiz] = useState({
    courseId: '',
    titleEn: '',
    titleMr: '',
    timeMinutes: 10,
    passingScore: 3,
    isPremium: false,
    questionText: '',
    opt1: '',
    opt2: '',
    opt3: '',
    opt4: '',
    correctAnswer: 0,
    explanation: '',
  });

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [stRes, crsRes, catsRes, vidsRes, notesRes, qzRes, usrRes, payRes] =
        await Promise.all([
          api.getAdminStats(),
          api.getCourses(),
          api.getCategories(),
          api.request<{ videos: VideoLecture[] }>('/api/admin/videos'),
          api.request<{ notes: PDFNote[] }>('/api/admin/notes'),
          api.request<{ quizzes: Quiz[] }>('/api/admin/quizzes'),
          api.getAdminUsers(),
          api.getAdminPayments(),
        ]);

      setStats(stRes.stats);
      setCourses(crsRes.courses || []);
      setCategories(catsRes.categories || []);
      setVideos(vidsRes.videos || []);
      setNotes(notesRes.notes || []);
      setQuizzes(qzRes.quizzes || []);
      setUsersList(usrRes.users || []);
      setPayments(payRes.payments || []);

      if (crsRes.courses && crsRes.courses.length > 0) {
        setNewVideo((prev) => ({ ...prev, courseId: crsRes.courses[0].id }));
        setNewNote((prev) => ({ ...prev, courseId: crsRes.courses[0].id }));
        setNewQuiz((prev) => ({ ...prev, courseId: crsRes.courses[0].id }));
      }
    } catch (err: any) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOwnerAdmin) {
      loadAllAdminData();
    }
  }, [isOwnerAdmin]);

  if (!isOwnerAdmin) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">प्रवेश नाकारला (Access Denied)</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          हे नियंत्रण कक्ष केवळ मालक व्यवस्थापकांसाठी (Owner Admin aarthak21@gmail.com) आरक्षित आहे.
        </p>
      </div>
    );
  }

  // Course handlers
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addAdminCourse(newCourse);
      setCourses((prev) => [...prev, res.course]);
      setShowAddCourse(false);
      setStatusMsg('अभ्यासक्रम यशस्वीरित्या जोडला!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Course creation failed');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('हा अभ्यासक्रम आणि त्याचे सर्व व्हिडिओ/नोट्स हटवायचे आहेत का?')) return;
    try {
      await api.deleteAdminCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Video handlers
  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addAdminVideo(newVideo);
      setVideos((prev) => [...prev, res.video]);
      setShowAddVideo(false);
      setStatusMsg('व्हिडिओ व्याख्यान यशस्वीरित्या जोडले!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Video creation failed');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('व्हिडिओ हटवायचा आहे का?')) return;
    try {
      await api.deleteAdminVideo(id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Note handlers
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addAdminNote(newNote);
      setNotes((prev) => [...prev, res.note]);
      setShowAddNote(false);
      setStatusMsg('PDF नोट्स यशस्वीरित्या जोडल्या!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Note creation failed');
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('PDF नोट हटवायची आहे का?')) return;
    try {
      await api.deleteAdminNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Quiz handlers
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const quizPayload = {
        courseId: newQuiz.courseId,
        titleEn: newQuiz.titleEn,
        titleMr: newQuiz.titleMr || newQuiz.titleEn,
        timeMinutes: newQuiz.timeMinutes,
        passingScore: newQuiz.passingScore,
        isPremium: newQuiz.isPremium,
        questions: [
          {
            questionEn: newQuiz.questionText,
            questionMr: newQuiz.questionText,
            optionsEn: [newQuiz.opt1, newQuiz.opt2, newQuiz.opt3, newQuiz.opt4],
            optionsMr: [newQuiz.opt1, newQuiz.opt2, newQuiz.opt3, newQuiz.opt4],
            correctAnswer: Number(newQuiz.correctAnswer),
            explanationEn: newQuiz.explanation,
            explanationMr: newQuiz.explanation,
          },
        ],
      };

      const res = await api.addAdminQuiz(quizPayload);
      setQuizzes((prev) => [...prev, res.quiz]);
      setShowAddQuiz(false);
      setStatusMsg('सराव चाचणी यशस्वीरित्या जोडली!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Quiz creation failed');
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('चाचणी हटवायची आहे का?')) return;
    try {
      await api.deleteAdminQuiz(id);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // User management
  const handleTogglePremiumUser = async (uId: string, currentPlan: string) => {
    const newPlan = currentPlan === 'premium' ? 'free' : 'premium';
    try {
      await api.updateAdminUser(uId, { plan: newPlan, status: 'active', extendDays: 30 });
      setUsersList((prev) =>
        prev.map((u) => (u.id === uId ? { ...u, subscription: { ...u.subscription, plan: newPlan } } : u))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
              Moti Study Smart Super Admin
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              मालक नियंत्रण कक्ष (Owner Admin Panel)
            </h1>
          </div>
        </div>

        {statusMsg && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
            <Check className="w-4 h-4" />
            <span>{statusMsg}</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>एकूण विद्यार्थी</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats.totalStudents}</div>
            <span className="text-[10px] text-slate-500">नोंदणीकृत खाती</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>प्रिमियम / ट्रायल सदस्य</span>
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">{stats.premiumUsers}</div>
            <span className="text-[10px] text-slate-500">
              {stats.trialUsers} मोफत चाचणी वापरकर्ते
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>एकूण महसूल</span>
              <IndianRupee className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">₹{stats.totalRevenue}</div>
            <span className="text-[10px] text-slate-500">Razorpay Verified</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>चाचण्यांचा सराव</span>
              <CheckSquare className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats.totalQuizAttempts}</div>
            <span className="text-[10px] text-slate-500">{stats.totalQuizzes} उपलब्ध चाचण्या</span>
          </div>
        </div>
      )}

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
        {[
          { id: 'courses', label: 'अभ्यासक्रम (Courses)', count: courses.length, icon: BookOpen },
          { id: 'videos', label: 'व्हिडिओ लेक्चर्स (Videos)', count: videos.length, icon: PlayCircle },
          { id: 'notes', label: 'PDF नोट्स (Notes)', count: notes.length, icon: FileText },
          { id: 'quizzes', label: 'सराव चाचण्या (Quizzes)', count: quizzes.length, icon: CheckSquare },
          { id: 'users', label: 'विद्यार्थी (Students)', count: usersList.length, icon: Users },
          { id: 'payments', label: 'पेमेंट नोंदी (Payments)', count: payments.length, icon: IndianRupee },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>
                {tab.label} ({tab.count})
              </span>
            </button>
          );
        })}
      </div>

      {/* 1. COURSES TAB */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">अभ्यासक्रम यादी</h3>
            <button
              onClick={() => setShowAddCourse(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>नवीन अभ्यासक्रम जोडा</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={c.thumbnail}
                    alt={c.titleEn}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-800"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                        {c.grade}
                      </span>
                      {c.isPremium && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                          PRO
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white mt-1 line-clamp-1">
                      {c.titleMr || c.titleEn}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{c.instructor}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteCourse(c.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                  title="Delete Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. VIDEOS TAB */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">व्हिडिओ लेक्चर्स (YouTube Links)</h3>
            <button
              onClick={() => setShowAddVideo(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>नवीन व्हिडिओ जोडा</span>
            </button>
          </div>

          <div className="space-y-2">
            {videos.map((v) => (
              <div
                key={v.id}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{v.chapterName}</span>
                      {v.isPremium && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                          PREMIUM
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                      {v.titleMr || v.titleEn}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      YouTube: {v.youtubeUrl} • {v.duration}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteVideo(v.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">PDF हस्तलिखित नोट्स</h3>
            <button
              onClick={() => setShowAddNote(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>नवीन PDF नोट जोडा</span>
            </button>
          </div>

          <div className="space-y-2">
            {notes.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{n.chapterName}</span>
                      {n.isPremium && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                          PRO PDF
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                      {n.titleMr || n.titleEn}
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      {n.pages} पाने • {n.size}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteNote(n.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. QUIZZES TAB */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">MCQ सराव चाचण्या आणि प्रश्न</h3>
            <button
              onClick={() => setShowAddQuiz(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>नवीन चाचणी / प्रश्न जोडा</span>
            </button>
          </div>

          <div className="space-y-2">
            {quizzes.map((q) => (
              <div
                key={q.id}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      {q.titleMr || q.titleEn}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      वेळ: {q.timeMinutes} मिनिटे • प्रश्न: {q.questions?.length || q.questionCount} • उत्तीर्ण गुण: {q.passingScore}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteQuiz(q.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. USERS & SUBSCRIPTIONS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">नोंदणीकृत विद्यार्थी व वर्गणीदार</h3>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="divide-y divide-slate-800">
              {usersList.map((u) => (
                <div
                  key={u.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{u.name}</h4>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          u.subscription?.plan === 'premium'
                            ? 'bg-amber-500/20 text-amber-300'
                            : u.subscription?.plan === 'trial'
                            ? 'bg-indigo-500/20 text-indigo-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {u.subscription?.plan?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>
                    <span className="text-[11px] text-slate-500">
                      लक्ष्य: {u.targetExam} • गुण: {u.totalScore} • सलग: {u.streak} दिवस
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePremiumUser(u.id, u.subscription?.plan)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-slate-700 flex items-center gap-1"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>{u.subscription?.plan === 'premium' ? 'Revoke Pro' : 'Grant Pro'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. PAYMENTS AUDIT TAB */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">रेझरपे व्यवहार नोंदी (Razorpay Audit Log)</h3>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {payments.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                कोणतेही पेमेंट व्यवहार नोंदी आढळल्या नाहीत.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          ₹{p.amount} {p.currency}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {p.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-1">
                        विद्यार्थी: <strong>{p.userName}</strong> ({p.userEmail})
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Order ID: {p.orderId} • Payment ID: {p.paymentId}
                      </p>
                    </div>

                    <div className="text-right text-slate-400 text-[11px]">
                      {new Date(p.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD COURSE */}
      {showAddCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCourse}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-lg w-full space-y-3"
          >
            <h3 className="font-bold text-white text-base">नवीन अभ्यासक्रम जोडा</h3>

            <div>
              <label className="text-xs text-slate-300 block mb-1">नाव (Marathi)</label>
              <input
                type="text"
                required
                value={newCourse.titleMr}
                onChange={(e) => setNewCourse({ ...newCourse, titleMr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">नाव (English)</label>
              <input
                type="text"
                required
                value={newCourse.titleEn}
                onChange={(e) => setNewCourse({ ...newCourse, titleEn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-300 block mb-1">प्रवर्ग</label>
                <select
                  value={newCourse.categoryId}
                  onChange={(e) => setNewCourse({ ...newCourse, categoryId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="competitive">स्पर्धा परीक्षा</option>
                  <option value="hsc">११ वी व १२ वी</option>
                  <option value="school">शालेय शिक्षण</option>
                  <option value="college">कॉलेज व कोडिंग</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">मार्गदर्शक</label>
                <input
                  type="text"
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isPremCourse"
                checked={newCourse.isPremium}
                onChange={(e) => setNewCourse({ ...newCourse, isPremium: e.target.checked })}
              />
              <label htmlFor="isPremCourse" className="text-xs text-amber-300 font-bold">
                प्रिमियम अभ्यासक्रम म्हणून चिन्हांकित करा (Premium Course)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCourse(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                रद्द करा
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
              >
                जतन करा
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD VIDEO */}
      {showAddVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateVideo}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-lg w-full space-y-3"
          >
            <h3 className="font-bold text-white text-base">नवीन YouTube व्हिडिओ लेक्चर जोडा</h3>

            <div>
              <label className="text-xs text-slate-300 block mb-1">अभ्यासक्रम निवडा</label>
              <select
                value={newVideo.courseId}
                onChange={(e) => setNewVideo({ ...newVideo, courseId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titleMr || c.titleEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">लेक्चर शीर्षक (Title)</label>
              <input
                type="text"
                required
                value={newVideo.titleMr}
                onChange={(e) => setNewVideo({ ...newVideo, titleMr: e.target.value, titleEn: e.target.value })}
                placeholder="उदा. प्रकरण १: प्राकृतिक भूगोल व नद्या"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">YouTube Video Link किंवा ID</label>
              <input
                type="text"
                required
                value={newVideo.youtubeUrl}
                onChange={(e) => setNewVideo({ ...newVideo, youtubeUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=kqtD5dpn9C8"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-300 block mb-1">कालावधी (Duration)</label>
                <input
                  type="text"
                  value={newVideo.duration}
                  onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })}
                  placeholder="24:15"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">प्रकरणाचे नाव</label>
                <input
                  type="text"
                  value={newVideo.chapterName}
                  onChange={(e) => setNewVideo({ ...newVideo, chapterName: e.target.value })}
                  placeholder="प्रकरण १"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isPremVideo"
                checked={newVideo.isPremium}
                onChange={(e) => setNewVideo({ ...newVideo, isPremium: e.target.checked })}
              />
              <label htmlFor="isPremVideo" className="text-xs text-amber-300 font-bold">
                केवळ प्रिमियम सदस्यांसाठी ठेवा (Premium Only)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddVideo(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                रद्द करा
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
              >
                जोडा
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD PDF NOTE */}
      {showAddNote && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNote}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-lg w-full space-y-3"
          >
            <h3 className="font-bold text-white text-base">नवीन PDF नोट्स अपलोड करा</h3>

            <div>
              <label className="text-xs text-slate-300 block mb-1">अभ्यासक्रम निवडा</label>
              <select
                value={newNote.courseId}
                onChange={(e) => setNewNote({ ...newNote, courseId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titleMr || c.titleEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">नोट्सचे शीर्षक</label>
              <input
                type="text"
                required
                value={newNote.titleMr}
                onChange={(e) => setNewNote({ ...newNote, titleMr: e.target.value, titleEn: e.target.value })}
                placeholder="उदा. संपूर्ण इतिहास व भूगोल रिव्हिजन नोट्स"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-300 block mb-1">पानांची संख्या (Pages)</label>
                <input
                  type="number"
                  value={newNote.pages}
                  onChange={(e) => setNewNote({ ...newNote, pages: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">साइज (Size)</label>
                <input
                  type="text"
                  value={newNote.size}
                  onChange={(e) => setNewNote({ ...newNote, size: e.target.value })}
                  placeholder="2.5 MB"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">नोट्स मजकूर (Markdown / Text)</label>
              <textarea
                value={newNote.contentMarkdown}
                onChange={(e) => setNewNote({ ...newNote, contentMarkdown: e.target.value })}
                placeholder="# प्रकरणाचे नाव&#10;&#10;महत्त्वाचे सूत्रे व संकल्पना..."
                className="w-full h-24 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isPremNote"
                checked={newNote.isPremium}
                onChange={(e) => setNewNote({ ...newNote, isPremium: e.target.checked })}
              />
              <label htmlFor="isPremNote" className="text-xs text-amber-300 font-bold">
                केवळ प्रिमियम सदस्यांसाठी ठेवा (Premium PDF)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddNote(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                रद्द करा
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
              >
                जतन करा
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD QUIZ */}
      {showAddQuiz && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateQuiz}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-lg w-full space-y-3 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-bold text-white text-base">नवीन MCQ सराव चाचणी जोडा</h3>

            <div>
              <label className="text-xs text-slate-300 block mb-1">अभ्यासक्रम निवडा</label>
              <select
                value={newQuiz.courseId}
                onChange={(e) => setNewQuiz({ ...newQuiz, courseId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titleMr || c.titleEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">चाचणीचे नाव (Quiz Title)</label>
              <input
                type="text"
                required
                value={newQuiz.titleMr}
                onChange={(e) => setNewQuiz({ ...newQuiz, titleMr: e.target.value, titleEn: e.target.value })}
                placeholder="उदा. महाराष्ट्र भूगोल व इतिहास चाचणी"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">प्रश्न (Question)</label>
              <input
                type="text"
                required
                value={newQuiz.questionText}
                onChange={(e) => setNewQuiz({ ...newQuiz, questionText: e.target.value })}
                placeholder="उदा. महाराष्ट्रातील सर्वोच्च शिखर कोणते?"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">पर्याय A</label>
                <input
                  type="text"
                  required
                  value={newQuiz.opt1}
                  onChange={(e) => setNewQuiz({ ...newQuiz, opt1: e.target.value })}
                  placeholder="साल्हेर"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">पर्याय B (अचूक)</label>
                <input
                  type="text"
                  required
                  value={newQuiz.opt2}
                  onChange={(e) => setNewQuiz({ ...newQuiz, opt2: e.target.value })}
                  placeholder="कळसूबाई"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">पर्याय C</label>
                <input
                  type="text"
                  required
                  value={newQuiz.opt3}
                  onChange={(e) => setNewQuiz({ ...newQuiz, opt3: e.target.value })}
                  placeholder="महाबळेश्वर"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">पर्याय D</label>
                <input
                  type="text"
                  required
                  value={newQuiz.opt4}
                  onChange={(e) => setNewQuiz({ ...newQuiz, opt4: e.target.value })}
                  placeholder="हरिश्चंद्रगड"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">योग्य पर्याय क्रमांक (Index)</label>
              <select
                value={newQuiz.correctAnswer}
                onChange={(e) => setNewQuiz({ ...newQuiz, correctAnswer: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value={0}>पर्याय A</option>
                <option value={1}>पर्याय B</option>
                <option value={2}>पर्याय C</option>
                <option value={3}>पर्याय D</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">स्पष्टीकरण (Explanation)</label>
              <textarea
                value={newQuiz.explanation}
                onChange={(e) => setNewQuiz({ ...newQuiz, explanation: e.target.value })}
                placeholder="कळसूबाई हे १६४६ मीटर उंचीचे सर्वोच्च शिखर आहे..."
                className="w-full h-16 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddQuiz(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                रद्द करा
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
              >
                चाचणी तयार करा
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
