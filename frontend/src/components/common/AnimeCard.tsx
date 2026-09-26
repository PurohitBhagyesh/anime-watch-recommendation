import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Plus, Calendar, Tv, Clock, Crown } from 'lucide-react';
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

  const getScoreBadgeClass = (score: number | null) => {
    if (!score) return '';
    if (score >= 80) return 'score-pill-gold';
    if (score >= 70) return 'score-pill-high';
    if (score >= 60) return 'score-pill-med';
    return 'score-pill-low';
  };

  const statusLabels: { id: WatchlistStatus; label: string }[] = [
    { id: 'watching', label: 'Watching' },
    { id: 'plan_to_watch', label: 'Planning' },
    { id: 'completed', label: 'Completed' },
    { id: 'rewatching', label: 'Rewatching' },
    { id: 'paused', label: 'Paused' },
    { id: 'dropped', label: 'Dropped' },
  ];

  // Helper for countdown
  const formatTimeUntilAiring = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="group relative flex flex-col anilist-card overflow-hidden h-full">
      {/* Poster Image Container */}
      <Link
        to={`/anime/${anime.id}`}
        className="relative aspect-[3/4] w-full overflow-hidden bg-[#070b14] block"
      >
        <img
          src={anime.coverImage.extraLarge || anime.coverImage.large}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Subtle royal gradient shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080d1a] via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
          {anime.format ? (
            <div className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#080d1a]/85 text-slate-300 backdrop-blur-md border border-white/10 uppercase tracking-tight">
              {anime.format.replace('_', ' ')}
            </div>
          ) : (
            <div />
          )}

          {anime.averageScore ? (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold backdrop-blur-md shadow-md ${getScoreBadgeClass(
                anime.averageScore
              )}`}
            >
              {anime.averageScore >= 80 && <Crown className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />}
              <span>{anime.averageScore}%</span>
            </div>
          ) : null}
        </div>

        {/* Next Airing Episode Banner */}
        {anime.nextAiringEpisode && (
          <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/85 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold backdrop-blur-md">
              <Clock className="w-2.5 h-2.5" />
              <span>
                Ep {anime.nextAiringEpisode.episode} in{' '}
                {formatTimeUntilAiring(anime.nextAiringEpisode.timeUntilAiring)}
              </span>
            </div>
          </div>
        )}

        {/* Quick Add Button & Popover */}
        <div className="absolute bottom-2 right-2 pointer-events-auto z-20">
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowStatusMenu(!showStatusMenu);
              }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center backdrop-blur-xl transition-all shadow-lg ${
                inWatchlist
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/25'
                  : 'bg-[#080d1a]/80 text-slate-300 hover:text-white hover:bg-[#6366f1] border border-white/15'
              }`}
              title={inWatchlist ? `In List (${currentItem?.status})` : 'Add to Watchlist'}
            >
              {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>

            {/* Status Selector Popover */}
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
                <div className="absolute bottom-10 right-0 z-40 w-44 p-1.5 rounded-xl anilist-surface-elevated border border-white/15 shadow-2xl space-y-0.5 animate-fadeIn">
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider border-b border-white/10 font-mono">
                    Set Status
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
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between font-semibold transition ${
                        currentItem?.status === st.id
                          ? 'bg-[#6366f1] text-white'
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
                      Remove from list
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Info Card Content */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-2">
        <div>
          <Link
            to={`/anime/${anime.id}`}
            className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-[#818cf8] line-clamp-2 transition leading-snug"
            title={title}
          >
            {title}
          </Link>
          {anime.studios?.nodes?.[0] && (
            <p className="text-[11px] text-[#6366f1] mt-0.5 truncate font-medium">
              {anime.studios.nodes[0].name}
            </p>
          )}
        </div>

        {/* Bottom meta row */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-white/[0.06]">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>{anime.seasonYear || (anime.season ? `${anime.season}` : 'TBA')}</span>
          </div>

          <div className="flex items-center gap-1">
            <Tv className="w-3 h-3 text-slate-500" />
            <span>
              {anime.episodes ? `${anime.episodes} eps` : anime.status === 'RELEASING' ? 'Airing' : 'Movie'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
