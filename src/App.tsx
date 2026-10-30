/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DeviceFrameToggle } from './components/DeviceFrameToggle';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { PDFViewerModal } from './components/PDFViewerModal';
import { QuizModal } from './components/QuizModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { AuthModal } from './components/AuthModal';

import { HomeView } from './views/HomeView';
import { CoursesView } from './views/CoursesView';
import { CourseDetailView } from './views/CourseDetailView';
import { QuizListView } from './views/QuizListView';
import { LeaderboardView } from './views/LeaderboardView';
import { BookmarksView } from './views/BookmarksView';
import { ProfileView } from './views/ProfileView';
import { AdminView } from './views/AdminView';

import { VideoLecture, PDFNote } from './types';
import { Search, X, Wifi, Battery, Signal } from 'lucide-react';

function AppContent() {
  const { user, isSubModalOpen, closeSubscriptionModal, isAuthModalOpen, closeAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState('home');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals state
  const [activeVideo, setActiveVideo] = useState<VideoLecture | null>(null);
  const [activeNote, setActiveNote] = useState<PDFNote | null>(null);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

  // Search modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile shell simulator toggle (default true for authentic mobile-first experience)
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveTab('courses');
  };

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      setSelectedCategory('all');
      setSelectedCourseId(null);
      setActiveTab('courses');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start antialiased font-sans">
      {/* Device frame switcher button */}
      <DeviceFrameToggle
        isMobileFrame={isMobileFrame}
        setIsMobileFrame={setIsMobileFrame}
      />

      {/* Main Container: Mobile Bezel Shell OR Full Responsive Layout */}
      <div
        className={`w-full transition-all duration-300 flex flex-col ${
          isMobileFrame
            ? 'max-w-[430px] my-4 sm:my-8 rounded-[48px] border-[10px] border-slate-800 shadow-[0_0_60px_rgba(79,70,229,0.25)] overflow-hidden bg-slate-950 min-h-[850px] max-h-[92vh] relative ring-1 ring-slate-700/50'
            : 'max-w-6xl'
        }`}
      >
        {/* Mobile Status Bar Simulation */}
        {isMobileFrame && (
          <div className="bg-slate-900 text-white px-6 pt-3 pb-1 flex items-center justify-between text-xs select-none border-b border-slate-800/60 z-50">
            <span className="font-bold text-[13px] tracking-tight">09:41</span>
            {/* Dynamic Island Pill */}
            <div className="w-20 h-4 bg-slate-950 rounded-full flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-indigo-500/80 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Global App Header */}
        <Header
          onOpenSearch={handleOpenSearch}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setSelectedCourseId(null);
            setActiveTab(tab);
          }}
        />

        {/* Scrollable View Area */}
        <main
          className={`flex-1 px-3 sm:px-6 py-4 overflow-y-auto ${
            isMobileFrame ? 'h-[720px] scrollbar-thin' : ''
          }`}
        >
          {activeTab === 'home' && (
            <HomeView
              onSelectCourse={handleSelectCourse}
              onOpenVideo={(vid) => setActiveVideo(vid)}
              onOpenQuiz={(qId) => setActiveQuizId(qId)}
              setActiveTab={setActiveTab}
              setSelectedCategory={(catId) => {
                setSelectedCategory(catId);
                setSelectedCourseId(null);
              }}
            />
          )}

          {activeTab === 'courses' &&
            (selectedCourseId ? (
              <CourseDetailView
                courseId={selectedCourseId}
                onBack={() => setSelectedCourseId(null)}
                onOpenVideo={(vid) => setActiveVideo(vid)}
                onOpenNote={(note) => setActiveNote(note)}
                onOpenQuiz={(qId) => setActiveQuizId(qId)}
              />
            ) : (
              <CoursesView
                onSelectCourse={handleSelectCourse}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            ))}

          {activeTab === 'practice' && (
            <QuizListView onOpenQuiz={(qId) => setActiveQuizId(qId)} />
          )}

          {activeTab === 'leaderboard' && <LeaderboardView />}

          {activeTab === 'saved' && (
            <BookmarksView
              onOpenVideo={(vid) => setActiveVideo(vid)}
              onOpenNote={(note) => setActiveNote(note)}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView onOpenAdmin={() => setActiveTab('admin')} />
          )}

          {activeTab === 'admin' && <AdminView />}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setSelectedCourseId(null);
            setActiveTab(tab);
          }}
        />

        {/* Mobile Home Indicator bar */}
        {isMobileFrame && (
          <div className="bg-slate-900 py-1 flex items-center justify-center border-t border-slate-800/80">
            <div className="w-32 h-1 bg-slate-600 rounded-full" />
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* 1. YouTube Educational Video Player */}
      {activeVideo && (
        <VideoPlayerModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
          isBookmarked={Boolean(user?.bookmarks?.videos?.includes(activeVideo.id))}
          onToggleBookmark={async (vId) => {
            // bookmark toggle logic
          }}
        />
      )}

      {/* 2. Interactive PDF Document Reader */}
      {activeNote && (
        <PDFViewerModal
          note={activeNote}
          onClose={() => setActiveNote(null)}
          isBookmarked={Boolean(user?.bookmarks?.notes?.includes(activeNote.id))}
        />
      )}

      {/* 3. Timed Practice MCQ Quiz Modal */}
      {activeQuizId && (
        <QuizModal
          quizId={activeQuizId}
          onClose={() => setActiveQuizId(null)}
          onQuizCompleted={() => {
            // refresh data
          }}
        />
      )}

      {/* 4. Razorpay Subscription & 7-Day Free Trial Modal */}
      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={closeSubscriptionModal}
      />

      {/* 5. User Login / Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />

      {/* 6. Quick Omnibar Search Dialog */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-16 px-4"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300">
                मोती स्टडी स्मार्ट — सर्व शोधा (Search)
              </span>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="mt-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="उदा. MPSC, भूगोल, 10th Maths, Physics, Python..."
                  className="w-full pl-10 pr-20 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white shadow-sm"
                >
                  शोधा
                </button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-500 font-semibold block mb-2">
                लोकप्रिय शोध (Trending Topics):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['MPSC भूगोल', '10th Maths Formula', '12th Physics', 'पोलीस भरती', 'Python DSA', 'मराठी व्याकरण'].map(
                  (trend, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSearchQuery(trend);
                        setIsSearchOpen(false);
                        setSelectedCategory('all');
                        setSelectedCourseId(null);
                        setActiveTab('courses');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 text-xs border border-slate-700/60 transition-colors"
                    >
                      {trend}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
