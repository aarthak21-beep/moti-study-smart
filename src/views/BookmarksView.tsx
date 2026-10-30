import React, { useState, useEffect } from 'react';
import { VideoLecture, PDFNote } from '../types';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../i18n/translations';
import { api } from '../services/api';
import { Bookmark, PlayCircle, FileText, Trash2, Clock, Sparkles } from 'lucide-react';

interface BookmarksViewProps {
  onOpenVideo: (video: VideoLecture) => void;
  onOpenNote: (note: PDFNote) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({ onOpenVideo, onOpenNote }) => {
  const { language } = useAuth();
  const t = getTranslation(language);

  const [activeTab, setActiveTab] = useState<'videos' | 'notes'>('videos');
  const [videos, setVideos] = useState<VideoLecture[]>([]);
  const [notes, setNotes] = useState<PDFNote[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const data = await api.getBookmarks();
      setVideos(data.videos || []);
      setNotes(data.notes || []);
    } catch (err) {
      console.error('Failed to load bookmarks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleRemoveVideo = async (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation();
    try {
      await api.toggleVideoBookmark(videoId);
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    try {
      await api.toggleNoteBookmark(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5 pb-20 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-amber-400 fill-amber-400/20" />
          <span>{t.nav.saved}</span>
        </h1>
        <p className="text-xs text-slate-400">
          महत्त्वाच्या वेळी जलद उजळणीसाठी तुम्ही बुकमार्क केलेले व्हिडिओ व नोट्स
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
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
          className={`flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'notes'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>PDF नोट्स ({notes.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>{t.common.loading}</span>
        </div>
      ) : activeTab === 'videos' ? (
        /* Videos List */
        videos.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-900/60 rounded-2xl border border-slate-800">
            कोणतेही व्हिडिओ जतन केलेले नाहीत. व्हिडिओ पाहताना 'बुकमार्क' बटण दाबा.
          </div>
        ) : (
          <div className="space-y-3">
            {videos.map((vid) => {
              const vidTitle =
                language === 'mr' ? vid.titleMr : language === 'hi' ? vid.titleHi : vid.titleEn;

              return (
                <div
                  key={vid.id}
                  onClick={() => onOpenVideo(vid)}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 flex items-center justify-between gap-3 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <PlayCircle className="w-5 h-5 fill-indigo-500/20" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                        {vid.chapterName}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {vidTitle}
                      </h4>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        {vid.duration}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleRemoveVideo(e, vid.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="बुकमार्क काढून टाका"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : /* Notes List */
      notes.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs bg-slate-900/60 rounded-2xl border border-slate-800">
          कोणत्याही PDF नोट्स जतन केलेल्या नाहीत. नोट्स वाचताना 'बुकमार्क' बटण दाबा.
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const noteTitle =
              language === 'mr' ? note.titleMr : language === 'hi' ? note.titleHi : note.titleEn;

            return (
              <div
                key={note.id}
                onClick={() => onOpenNote(note)}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 flex items-center justify-between gap-3 cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                      {note.chapterName} • {note.pages} पाने
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-red-300 transition-colors line-clamp-1">
                      {noteTitle}
                    </h4>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">{note.size}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => handleRemoveNote(e, note.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="बुकमार्क काढून टाका"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
