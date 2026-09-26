import React, { useState } from 'react';
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

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={onClose}
        />

        {/* Modal Window */}
        <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-2xl anilist-card-static border border-white/10 shadow-2xl z-10 space-y-5 animate-fadeIn">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#3db4f2]/20 border border-[#3db4f2]/40 flex items-center justify-center text-[#3db4f2]">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                AniList Randomizer
              </h2>
              <p className="text-xs text-slate-400">
                Can't decide what to watch? Roll for a top-rated anime!
              </p>
            </div>
          </div>

          {/* Body content */}
          {!rolledAnime ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-[#0f1824] border border-white/10 flex items-center justify-center text-[#3db4f2]">
                <Sparkles className="w-10 h-10 animate-pulse text-[#3db4f2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Ready to discover something new?</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                  We'll pull a highly rated anime from the AniList community rankings.
                </p>
              </div>

              <button
                onClick={handleRoll}
                disabled={loading}
                className="anilist-btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                <Dices className={`w-4 h-4 ${loading ? 'animate-spin-dice' : ''}`} />
                <span>{loading ? 'Rolling the dice...' : 'Roll Anime'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-4 p-3 rounded-xl bg-[#0f1824] border border-white/10">
                {/* Poster */}
                <div className="w-24 aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0 bg-[#0b1622] relative">
                  <img
                    src={rolledAnime.coverImage.large || rolledAnime.coverImage.medium}
                    alt={title}
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
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={handleRoll}
                  disabled={loading}
                  className="anilist-btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5"
                >
                  <Dices className={`w-3.5 h-3.5 ${loading ? 'animate-spin-dice' : ''}`} />
                  <span>{loading ? 'Rolling...' : 'Roll Again'}</span>
                </button>

                <div className="flex items-center gap-2">
                  {rolledAnime.trailer?.id && (
                    <button
                      onClick={() => setTrailerOpen(true)}
                      className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Trailer</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (!inWatchlist) {
                        addToWatchlist(rolledAnime, 'plan_to_watch');
                      }
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      inWatchlist
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/10 hover:bg-white/15 text-white'
                    }`}
                  >
                    {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{inWatchlist ? 'Saved' : 'Save'}</span>
                  </button>

                  <Link
                    to={`/anime/${rolledAnime.id}`}
                    onClick={onClose}
                    className="anilist-btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
};
