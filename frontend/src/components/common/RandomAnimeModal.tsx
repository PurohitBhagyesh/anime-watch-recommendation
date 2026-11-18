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
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="relative w-full max-w-lg p-5 sm:p-7 rounded-2xl bg-[#0b0b0d] border border-[#232329] shadow-2xl z-10 space-y-5 max-h-[90dvh] overflow-y-auto my-auto pointer-events-auto">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#151519] border border-[#232329] hover:border-[#3a3a44] text-[#9a9aa6] hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close randomizer modal"
          >
            <X aria-hidden="true" className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 pr-10">
            <div className="w-10 h-10 rounded-xl bg-[#151519] border border-[#232329] flex items-center justify-center text-white flex-shrink-0">
              <Dices aria-hidden="true" className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Random Anime Picker
              </h2>
              <p className="text-xs text-[#9a9aa6]">
                Pulls a top-rated title directly from AniList.
              </p>
            </div>
          </div>

          {!rolledAnime ? (
            <div className="py-7 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#151519] border border-[#232329] flex items-center justify-center text-white">
                <Sparkles aria-hidden="true" className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Not sure what to watch next?</h3>
                <p className="text-xs text-[#9a9aa6] max-w-xs mx-auto mt-1">
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
              <div className="flex gap-3.5 p-3.5 rounded-2xl bg-[#151519] border border-[#232329]">
                <div className="w-20 sm:w-24 aspect-[185/265] rounded-xl overflow-hidden flex-shrink-0 bg-[#0b0b0d] relative border border-[#232329]">
                  <img
                    src={rolledAnime.coverImage.large || rolledAnime.coverImage.medium}
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  {rolledAnime.averageScore && (
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold score-pill-high tabular-nums">
                      {rolledAnime.averageScore}%
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2">
                      {title}
                    </h3>
                    <p className="text-xs text-[#c8c8d2] mt-1 font-medium tabular-nums">
                      {rolledAnime.format?.replace('_', ' ')} · {rolledAnime.seasonYear || 'TBA'} ·{' '}
                      {rolledAnime.episodes ? `${rolledAnime.episodes} eps` : 'Airing'}
                    </p>

                    {rolledAnime.genres && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {rolledAnime.genres.slice(0, 3).map((g) => (
                          <span
                            key={g}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-[#0b0b0d] border border-[#232329] text-[#9a9aa6]"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-[#9a9aa6] line-clamp-2 mt-1.5">
                    {rolledAnime.description?.replace(/<[^>]*>?/gm, '') || 'No description available.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-3 border-t border-[#232329]">
                <button
                  type="button"
                  onClick={handleRoll}
                  disabled={loading}
                  className="anilist-btn-secondary px-4 py-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Dices aria-hidden="true" className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Rolling...' : 'Roll Again'}</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  {rolledAnime.trailer?.id && (
                    <button
                      type="button"
                      onClick={() => setTrailerOpen(true)}
                      className="flex-1 sm:flex-none anilist-btn-secondary px-3.5 py-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play aria-hidden="true" className="w-3.5 h-3.5 fill-current" />
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
                    className={`flex-1 sm:flex-none px-3.5 py-2 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                      inWatchlist
                        ? 'bg-emerald-500/15 text-[#4ade80] border-emerald-500/35'
                        : 'anilist-btn-secondary'
                    }`}
                  >
                    {inWatchlist ? (
                      <Check aria-hidden="true" className="w-3.5 h-3.5" />
                    ) : (
                      <Plus aria-hidden="true" className="w-3.5 h-3.5" />
                    )}
                    <span>{inWatchlist ? 'In List' : 'Save'}</span>
                  </button>

                  <Link
                    to={`/anime/${rolledAnime.id}`}
                    onClick={onClose}
                    className="w-full sm:w-auto anilist-btn-primary px-4 py-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
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
