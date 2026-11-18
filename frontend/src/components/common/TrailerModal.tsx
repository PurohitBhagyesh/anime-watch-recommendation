import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, AlertCircle, ExternalLink, Video } from 'lucide-react';
import type { AnimeTrailer } from '../../api/types';
import { usePreferences } from '../../context/PreferencesContext';

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
  const { preferences } = usePreferences();

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

  const autoPlayFlag = preferences.autoTrailer ? 1 : 0;
  let embedUrl: string | null = null;
  if (isYouTube) {
    embedUrl = `https://www.youtube-nocookie.com/embed/${trailer.id}?autoplay=${autoPlayFlag}&rel=0&modestbranding=1`;
  } else if (isDailymotion) {
    embedUrl = `https://www.dailymotion.com/embed/video/${trailer.id}?autoplay=${autoPlayFlag}`;
  }

  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${title} official trailer anime`
  )}`;

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 md:p-8 overscroll-contain animate-fadeIn"
      style={{ minHeight: '100dvh' }}
    >
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-4xl bg-[#0b0b0d] border border-[#232329] rounded-2xl overflow-hidden shadow-2xl z-10 my-auto flex flex-col pointer-events-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="trailer-modal-title"
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#000000] border-b border-[#232329] flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-3">
            <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0">
              <Play aria-hidden="true" className="w-3.5 h-3.5 fill-current" />
            </div>
            <h3 id="trailer-modal-title" className="text-xs sm:text-sm font-semibold text-white truncate">
              {title} <span className="text-[#9a9aa6] font-normal hidden sm:inline">· Official Trailer</span>
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isYouTube && (
              <a
                href={`https://www.youtube.com/watch?v=${trailer.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden min-[480px]:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#c8c8d2] hover:text-white bg-[#151519] hover:bg-[#1c1c22] rounded-full border border-[#232329] transition"
                title="Open in YouTube"
              >
                <Video aria-hidden="true" className="w-3.5 h-3.5 text-rose-400" />
                <span>YouTube</span>
                <ExternalLink aria-hidden="true" className="w-3 h-3 text-[#666672]" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#151519] border border-[#232329] hover:border-[#3a3a44] text-[#9a9aa6] hover:text-white flex items-center justify-center active:scale-95 transition cursor-pointer"
              aria-label="Close trailer modal"
            >
              <X aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>
        </div>

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
              <div className="w-12 h-12 rounded-2xl bg-[#151519] border border-[#232329] flex items-center justify-center mx-auto text-white">
                <AlertCircle aria-hidden="true" className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">No Embedded Trailer Available</h4>
                <p className="text-xs sm:text-sm text-[#9a9aa6] mt-1">
                  This title does not include a direct video embed from AniList. You can watch it directly on YouTube.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <a
                  href={youtubeSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="anilist-btn-primary px-4 py-2 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Video aria-hidden="true" className="w-4 h-4" />
                  <span>Search on YouTube</span>
                  <ExternalLink aria-hidden="true" className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="anilist-btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
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
