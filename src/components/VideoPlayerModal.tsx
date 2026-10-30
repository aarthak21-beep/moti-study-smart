import React, { useState } from 'react';
import { VideoLecture } from '../types';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../i18n/translations';
import { api } from '../services/api';
import { X, CheckCircle, Bookmark, Lock, Sparkles, Clock, BookOpen, Share2, ThumbsUp, MessageSquare } from 'lucide-react';

interface VideoPlayerModalProps {
  video: VideoLecture | null;
  onClose: () => void;
  onVideoCompleted?: (videoId: string) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (videoId: string) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
  onVideoCompleted,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const { user, language, isPremium, isTrial, openSubscriptionModal } = useAuth();
  const t = getTranslation(language);

  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'notes' | 'doubts'>('summary');
  const [completed, setCompleted] = useState(() => {
    return Boolean(user?.progress?.completedVideos?.includes(video?.id || ''));
  });
  const [myNotes, setMyNotes] = useState('');
  const [copied, setCopied] = useState(false);

  if (!video) return null;

  const title =
    language === 'mr' ? video.titleMr : language === 'hi' ? video.titleHi : video.titleEn;
  const summary =
    language === 'mr' ? video.summaryMr : language === 'hi' ? video.summaryHi : video.summaryEn;

  const isLocked = video.isPremium && !isPremium && !isTrial;

  const handleMarkComplete = async () => {
    if (!completed) {
      try {
        await api.markVideoCompleted(video.id);
        setCompleted(true);
        if (onVideoCompleted) onVideoCompleted(video.id);
      } catch (e) {
        console.error('Failed to mark video complete', e);
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[95vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {video.chapterName || 'Lecture'}
            </span>
            {video.isPremium && (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {t.common.premium}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player or Locked Overlay */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {isLocked ? (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400 shadow-xl shadow-amber-500/10">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {t.course.lockedLectureMsg}
              </h3>
              <p className="text-sm text-slate-400 max-w-md mb-6">
                {t.home.trialBannerSub}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={openSubscriptionModal}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition-all transform hover:scale-105"
                >
                  {t.common.startTrial} (₹0)
                </button>
                <button
                  onClick={openSubscriptionModal}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
                >
                  {t.common.subscribe}
                </button>
              </div>
            </div>
          ) : (
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId || 'kqtD5dpn9C8'}?autoplay=1&rel=0&modestbranding=1`}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>

        {/* Video Details and Action Row */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  {video.duration}
                </span>
                <span>•</span>
                <span>Moti Study Smart Verified Faculty</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleMarkComplete}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  completed
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <CheckCircle className={`w-4 h-4 ${completed ? 'text-emerald-400 fill-emerald-400/20' : ''}`} />
                <span>{completed ? t.common.completed : t.common.markCompleted}</span>
              </button>

              {onToggleBookmark && (
                <button
                  onClick={() => onToggleBookmark(video.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isBookmarked
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                  <span>{isBookmarked ? t.common.bookmarked : t.common.bookmark}</span>
                </button>
              )}

              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs"
                title="Share Lecture"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {copied && <span className="text-xs text-emerald-400">Copied!</span>}
            </div>
          </div>

          {/* Sub tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveSubTab('summary')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeSubTab === 'summary'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              सारांश व संकल्पना (Summary)
            </button>
            <button
              onClick={() => setActiveSubTab('notes')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeSubTab === 'notes'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              माझ्या नोट्स (My Notes)
            </button>
          </div>

          {/* Sub content */}
          {activeSubTab === 'summary' && (
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 text-sm text-slate-300 leading-relaxed">
              <p>{summary || 'या व्याख्यानात संपूर्ण प्रकरण स्पष्ट करून शिकवले आहे.'}</p>
              <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>💡 परीक्षा टीप: महत्त्वाचे मुद्दे वहीत लिहून घ्या.</span>
                <span className="text-indigo-400">#MotiStudySmart</span>
              </div>
            </div>
          )}

          {activeSubTab === 'notes' && (
            <div className="space-y-2">
              <textarea
                value={myNotes}
                onChange={(e) => setMyNotes(e.target.value)}
                placeholder="अभ्यास करताना महत्त्वाचे मुद्दे येथे लिहून ठेवा..."
                className="w-full h-28 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => alert('नोट्स स्थानिकरित्या जतन करण्यात आल्या!')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  {t.common.save}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
