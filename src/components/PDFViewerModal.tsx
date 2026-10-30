import React, { useState } from 'react';
import { PDFNote } from '../types';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../i18n/translations';
import { X, Download, Bookmark, ZoomIn, ZoomOut, Printer, Lock, Sparkles, FileText, Check } from 'lucide-react';

interface PDFViewerModalProps {
  note: PDFNote | null;
  onClose: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (noteId: string) => void;
}

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({
  note,
  onClose,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const { language, isPremium, isTrial, openSubscriptionModal } = useAuth();
  const t = getTranslation(language);

  const [zoom, setZoom] = useState(100);
  const [downloaded, setDownloaded] = useState(false);

  if (!note) return null;

  const title =
    language === 'mr' ? note.titleMr : language === 'hi' ? note.titleHi : note.titleEn;

  const isLocked = note.isPremium && !isPremium && !isTrial;

  const handleDownload = () => {
    // Generate text/markdown downloadable file
    const element = document.createElement('a');
    const file = new Blob([note.contentMarkdown || title], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${note.titleEn.replace(/\s+/g, '_')}_MotiStudySmart.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/95 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white max-w-[200px] sm:max-w-md truncate">
                {title}
              </h3>
              <p className="text-[11px] text-slate-400">
                {note.pages} {t.course.notes} • {note.size}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Zoom Controls */}
            {!isLocked && (
              <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
                <button
                  onClick={() => setZoom((prev) => Math.max(80, prev - 15))}
                  className="p-1 hover:text-white text-slate-400"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-1 text-[11px] text-slate-300 font-mono">{zoom}%</span>
                <button
                  onClick={() => setZoom((prev) => Math.min(150, prev + 15))}
                  className="p-1 hover:text-white text-slate-400"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Print */}
            {!isLocked && (
              <button
                onClick={handlePrint}
                className="hidden sm:flex p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs"
                title="Print Notes"
              >
                <Printer className="w-4 h-4" />
              </button>
            )}

            {/* Bookmark */}
            {onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(note.id)}
                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                  isBookmarked
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title="Bookmark Note"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
              </button>
            )}

            {/* Download Button */}
            {!isLocked && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all"
              >
                {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Download className="w-3.5 h-3.5" />}
                <span>{downloaded ? 'Downloaded' : t.common.download}</span>
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950 text-slate-100">
          {isLocked ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400 shadow-xl shadow-amber-500/10">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {t.course.lockedNoteMsg}
              </h3>
              <p className="text-sm text-slate-400 max-w-md mb-6">
                प्रिमियम सदस्यांना सर्व विषयांच्या हस्तलिखित, रंगीत आणि डाऊनलोडयोग्य PDF नोट्स मिळतात.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={openSubscriptionModal}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition-all transform hover:scale-105"
                >
                  <Sparkles className="w-4 h-4 inline-block mr-1 fill-slate-950" />
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
            <div
              className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-10 shadow-xl font-sans"
              style={{ fontSize: `${zoom}%` }}
            >
              {/* Document Header Watermark */}
              <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-indigo-400 text-lg">Moti Study Smart</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                    Certified Notes
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {note.chapterName || 'Comprehensive Study Notes'}
                </span>
              </div>

              {/* Markdown Rendered Content */}
              <div className="prose prose-invert max-w-none text-slate-200 space-y-4 whitespace-pre-wrap leading-relaxed font-sans">
                {note.contentMarkdown}
              </div>

              {/* Document Footer */}
              <div className="mt-12 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>मोती स्टडी स्मार्ट — सर्व हक्क राखीव (All Rights Reserved)</span>
                <span>पृष्ठ १ पैकी {note.pages}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
