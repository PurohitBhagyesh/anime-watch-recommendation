import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, AlertCircle, ExternalLink, Video } from 'lucide-react';
import type { AnimeTrailer } from '../../api/types';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailer: AnimeTrailer | null | undefined;
  title: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  trailer,
  title,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isYouTube = trailer?.site === 'youtube' && trailer?.id;
  const isDailymotion = trailer?.site === 'dailymotion' && trailer?.id;

  let embedUrl: string | null = null;
  if (isYouTube) {
    embedUrl = `https://www.youtube-nocookie.com/embed/${trailer.id}?autoplay=1&rel=0&modestbranding=1`;
  } else if (isDailymotion) {
    embedUrl = `https://www.dailymotion.com/embed/video/${trailer.id}?autoplay=1`;
  }

  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${title} official trailer anime`
  )}`;

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 md:p-8 overscroll-contain animate-fadeIn"
      style={{ minHeight: '100dvh' }}
    >
      {/* Click outside backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Modal Dialog Box */}
      <div
        className="relative w-full max-w-4xl bg-[#151f2e] border border-white/20 rounded-2xl overflow-hidden shadow-2xl z-10 my-auto flex flex-col pointer-events-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="trailer-modal-title"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 bg-[#0b1622] border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-3">
            <div className="w-7 h-7 rounded-lg bg-[#3db4f2]/20 border border-[#3db4f2]/40 flex items-center justify-center text-[#3db4f2] flex-shrink-0">
              <Play className="w-3.5 h-3.5 fill-[#3db4f2]" />
            </div>
            <h3
              id="trailer-modal-title"
              className="text-xs sm:text-sm font-bold text-white truncate"
            >
              {title} <span className="text-[#8ba0b2] font-normal hidden sm:inline">— Official Trailer</span>
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isYouTube && (
              <a
                href={`https://www.youtube.com/watch?v=${trailer.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden min-[480px]:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition"
                title="Open in YouTube"
              >
                <Video className="w-3.5 h-3.5 text-red-400" />
                <span>YouTube</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/15 active:scale-95 transition cursor-pointer"
              aria-label="Close trailer modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${title} Official Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0 absolute inset-0"
            />
          ) : (
            <div className="text-center p-6 sm:p-10 space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">No Direct Video Available</h4>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  We couldn't load the embedded video player for this title. You can search and watch it on YouTube directly.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2.5 pt-2">
                <a
                  href={youtubeSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="anilist-btn-primary px-4 py-2 text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Video className="w-4 h-4" />
                  <span>Search on YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={onClose}
                  className="anilist-btn-secondary px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

