import React, { useEffect } from 'react';
import { X, Play, AlertCircle } from 'lucide-react';
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

  const isYouTube = trailer?.site === 'youtube' && trailer.id;
  const embedUrl = isYouTube
    ? `https://www.youtube-nocookie.com/embed/${trailer.id}?autoplay=1&rel=0`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/90 backdrop-blur-sm animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-[#111622] border border-[#222c40] rounded-lg overflow-hidden shadow-2xl z-10">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a0d14] border-b border-[#1c2438]">
          <div className="flex items-center gap-2 truncate pr-4">
            <Play className="w-4 h-4 text-blue-400 fill-blue-400 flex-shrink-0" />
            <h3 className="text-sm font-semibold text-white truncate">
              {title}: Official Trailer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded bg-slate-800/80 hover:bg-slate-700 transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="text-center p-8 space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-slate-300 text-sm font-medium">No video trailer available for this anime.</p>
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
