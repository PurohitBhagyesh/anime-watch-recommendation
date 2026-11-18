import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Dices, X, Play, Plus, Check, ArrowRight, Sparkles } from 'lucide-react';
import { fetchRandomAnime } from '../../api/anilist';
import type { AnimeCardData } from '../../api/types';
import { useWatchlist } from '../../context/WatchlistContext';
import { TrailerModal } from './TrailerModal';

interface RandomAnimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RandomAnimeModal: React.FC<RandomAnimeModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [rolledAnime, setRolledAnime] = useState<AnimeCardData | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const { isInWatchlist, addToWatchlist } = useWatchlist();

  if (!isOpen) return null;

  const handleRoll = async () => {
    setLoading(true);
    try {
      const anime = await fetchRandomAnime();
      setRolledAnime(anime);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const title = rolledAnime
    ? rolledAnime.title.english || rolledAnime.title.romaji || rolledAnime.title.userPreferred
    : '';
  const inWatchlist = rolledAnime ? isInWatchlist(rolledAnime.id) : false;

  const modalContent = (
    <>
      <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4 overscroll-contain animate-fadeIn">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Window */}
        <div className="relative w-full max-w-lg p-5 sm:p-7 rounded-3xl liquid-glass-strong z-10 space-y-4 sm:space-y-5 max-h-[90dvh] overflow-y-auto my-auto pointer-events-auto">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close randomizer modal"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-2.5 pr-8">
            <div className="w-10 h-10 rounded-xl bg-[#3db4f2]/15 border border-[#3db4f2]/30 flex items-center justify-center text-[#3db4f2] flex-shrink-0">
              <Dices aria-hidden="true" className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Random Anime Picker
              </h2>
              <p className="text-xs text-slate-400">
                Pulls a random high-rated title directly from AniList.
              </p>
            </div>
          </div>

          {/* Body content */}
          {!rolledAnime ? (
            <div className="py-7 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl liquid-glass flex items-center justify-center text-[#3db4f2]">
                <Sparkles aria-hidden="true" className="w-7 h-7 text-[#3db4f2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Not sure what to watch next?</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                  Roll a random recommendation from the live AniList community rankings.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRoll}
                disabled={loading}
                className="anilist-btn-primary px-6 py-2.5 min-h-[42px] text-sm inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Dices aria-hidden="true" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Picking a title...' : 'Roll Random Anime'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-xl bg-[#0b1622] border border-white/10">
                {/* Poster */}
                <div className="w-20 sm:w-24 aspect-[185/265] rounded-lg overflow-hidden flex-shrink-0 bg-[#0b1622] relative shadow-md">
                  <img
                    src={rolledAnime.coverImage.large || rolledAnime.coverImage.medium}
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  {rolledAnime.averageScore && (
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-bold score-pill-high">
                      {rolledAnime.averageScore}%
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2">
                      {title}
                    </h3>
                    <p className="text-xs text-[#3db4f2] mt-0.5 font-medium">
                      {rolledAnime.format?.replace('_', ' ')} · {rolledAnime.seasonYear || 'TBA'} · {rolledAnime.episodes ? `${rolledAnime.episodes} eps` : 'Airing'}
                    </p>

                    {rolledAnime.genres && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {rolledAnime.genres.slice(0, 3).map((g) => (
                          <span
                            key={g}
                            className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {rolledAnime.description?.replace(/<[^>]*>?/gm, '') || 'No description available.'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleRoll}
                  disabled={loading}
                  className="anilist-btn-secondary px-3.5 py-2.5 sm:py-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Dices aria-hidden="true" className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Rolling...' : 'Roll Again'}</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  {rolledAnime.trailer?.id && (
                    <button
                      type="button"
                      onClick={() => setTrailerOpen(true)}
                      className="flex-1 sm:flex-none px-3 py-2.5 sm:py-2 rounded-lg bg-[#151f2e] hover:bg-[#1f2c3f] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border border-white/10"
                    >
                      <Play aria-hidden="true" className="w-3.5 h-3.5 fill-white" />
                      <span>Trailer</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (!inWatchlist) {
                        addToWatchlist(rolledAnime, 'plan_to_watch');
                      }
                    }}
                    className={`flex-1 sm:flex-none px-3 py-2.5 sm:py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      inWatchlist
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#151f2e] hover:bg-[#1f2c3f] text-white border border-white/10'
                    }`}
                  >
                    {inWatchlist ? <Check aria-hidden="true" className="w-3.5 h-3.5" /> : <Plus aria-hidden="true" className="w-3.5 h-3.5" />}
                    <span>{inWatchlist ? 'In List' : 'Save'}</span>
                  </button>

                  <Link
                    to={`/anime/${rolledAnime.id}`}
                    onClick={onClose}
                    className="w-full sm:w-auto anilist-btn-primary px-4 py-2.5 sm:py-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {rolledAnime && (
        <TrailerModal
          isOpen={trailerOpen}
          onClose={() => setTrailerOpen(false)}
          trailer={rolledAnime.trailer}
          title={title}
        />
      )}
    </>
  );

  return createPortal(modalContent, document.body);
};

