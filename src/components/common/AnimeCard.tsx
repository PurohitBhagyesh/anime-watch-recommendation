import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Check, Plus, Tv, Calendar } from 'lucide-react';
import type { AnimeCardData, WatchlistStatus } from '../../api/types';
import { useWatchlist } from '../../context/WatchlistContext';

interface AnimeCardProps {
  anime: AnimeCardData;
  priority?: boolean;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const { isInWatchlist, getItem, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const title = anime.title.english || anime.title.romaji || anime.title.userPreferred;
  const inWatchlist = isInWatchlist(anime.id);
  const currentItem = getItem(anime.id);

  const formatScore = (score: number | null) => {
    if (!score) return null;
    return `${(score / 10).toFixed(1)}`;
  };

  const statusLabels: { id: WatchlistStatus; label: string }[] = [
    { id: 'watching', label: 'Watching' },
    { id: 'plan_to_watch', label: 'Plan to Watch' },
    { id: 'completed', label: 'Completed' },
    { id: 'favorite', label: 'Favorite' },
  ];

  return (
    <div className="group relative flex flex-col apple-card rounded-xl sm:rounded-2xl overflow-hidden">
      {/* Poster Image */}
      <Link to={`/anime/${anime.id}`} className="relative aspect-[3/4] w-full overflow-hidden bg-[#0a0d14] block">
        <img
          src={anime.coverImage.extraLarge || anime.coverImage.large}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
        />

        {/* Dynamic Translucent Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {anime.averageScore ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-[11px] font-bold text-amber-300 border border-white/10 shadow-sm">
              <Star className="w-3 h-3 fill-amber-300" />
              <span>{formatScore(anime.averageScore)}</span>
            </div>
          ) : (
            <div />
          )}

          {anime.format && (
            <div className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/65 text-slate-200 backdrop-blur-md border border-white/10 uppercase tracking-tight">
              {anime.format.replace('_', ' ')}
            </div>
          )}
        </div>

        {/* Quick Add Button */}
        <div className="absolute bottom-2 right-2 pointer-events-auto">
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowStatusMenu(!showStatusMenu);
              }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-xl transition-all shadow-md ${
                inWatchlist
                  ? 'bg-[#0071e3] text-white'
                  : 'bg-black/60 text-slate-200 hover:text-white hover:bg-[#0071e3] border border-white/15'
              }`}
              title={inWatchlist ? `In Watchlist (${currentItem?.status})` : 'Add to Watchlist'}
            >
              {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>

            {/* Apple Style Floating Action Popover */}
            {showStatusMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowStatusMenu(false);
                  }}
                />
                <div className="absolute bottom-10 right-0 z-40 w-40 p-1.5 rounded-xl bg-[#0f1420]/90 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-0.5 animate-fadeIn">
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider border-b border-white/10 font-mono">
                    Status
                  </div>
                  {statusLabels.map((st) => (
                    <button
                      key={st.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToWatchlist(anime, st.id);
                        setShowStatusMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between font-medium transition ${
                        currentItem?.status === st.id
                          ? 'bg-[#0071e3] text-white font-semibold'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{st.label}</span>
                      {currentItem?.status === st.id && <Check className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                  {inWatchlist && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromWatchlist(anime.id);
                        setShowStatusMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-500/20 rounded-lg transition font-medium border-t border-white/10 mt-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Info Content */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          <Link
            to={`/anime/${anime.id}`}
            className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-[#2997ff] line-clamp-2 transition leading-snug"
            title={title}
          >
            {title}
          </Link>
          {anime.studios?.nodes?.[0] && (
            <p className="text-[11px] text-slate-400 mt-0.5 truncate font-medium">
              {anime.studios.nodes[0].name}
            </p>
          )}
        </div>

        {/* Metadata footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-white/[0.06]">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>{anime.seasonYear || (anime.season ? `${anime.season}` : 'TBA')}</span>
          </div>

          <div className="flex items-center gap-1">
            <Tv className="w-3 h-3 text-slate-500" />
            <span>{anime.episodes ? `${anime.episodes} eps` : anime.status === 'RELEASING' ? 'Airing' : 'Movie'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
