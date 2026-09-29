import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Plus, Calendar, Tv, Clock, Smile, Sparkles, X } from 'lucide-react';
import type { AnimeCardData, WatchlistStatus } from '../../api/types';
import { useWatchlist } from '../../context/WatchlistContext';

interface AnimeCardProps {
  anime: AnimeCardData;
  priority?: boolean;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const { isInWatchlist, getItem, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTouchPopup, setShowTouchPopup] = useState(false);
  const [placement, setPlacement] = useState<'right' | 'left' | 'center'>('right');
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const title = anime.title.userPreferred || anime.title.english || anime.title.romaji;
  const inWatchlist = isInWatchlist(anime.id);
  const currentItem = getItem(anime.id);

  const getScoreBadgeClass = (score: number | null) => {
    if (!score) return '';
    if (score >= 75) return 'score-pill-high';
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

  const formatSeasonText = () => {
    const seasonStr = anime.season
      ? anime.season.charAt(0).toUpperCase() + anime.season.slice(1).toLowerCase()
      : '';
    if (seasonStr && anime.seasonYear) return `${seasonStr} ${anime.seasonYear}`;
    if (anime.seasonYear) return `${anime.seasonYear}`;
    return anime.status === 'RELEASING' ? 'Releasing' : 'TBA';
  };

  const formatMap: Record<string, string> = {
    TV: 'TV Show',
    TV_SHORT: 'TV Short',
    MOVIE: 'Movie',
    SPECIAL: 'Special',
    OVA: 'OVA',
    ONA: 'ONA',
    MUSIC: 'Music',
  };
  const formatLabel = (anime.format && formatMap[anime.format]) || anime.format || 'Anime';
  const episodeLabel = anime.episodes
    ? `${anime.episodes} episodes`
    : anime.status === 'RELEASING'
    ? 'Airing'
    : 'TBA';

  const studioName = anime.studios?.nodes?.[0]?.name;

  const calculatePlacement = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      if (screenWidth < 640) {
        setPlacement('center');
      } else if (rect.right + 280 > screenWidth) {
        setPlacement('left');
      } else {
        setPlacement('right');
      }
    }
  };

  const handleMouseEnter = () => {
    calculatePlacement();
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  const handleTouchToggle = () => {
    // Only toggle if not clicking quick add
    calculatePlacement();
    setShowTouchPopup((prev) => !prev);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const isPopupVisible = (isHovered || showTouchPopup) && !showStatusMenu;

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative flex flex-col anilist-card h-full transition-all duration-200 ${
        isPopupVisible ? 'z-40' : 'z-10'
      }`}
    >
      {/* Poster Image Container */}
      <Link
        to={`/anime/${anime.id}`}
        className="relative aspect-[185/265] w-full overflow-hidden bg-[#11161d] block rounded-t-[6px]"
      >
        <img
          src={anime.coverImage.extraLarge || anime.coverImage.large}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
          {anime.format ? (
            <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0b1622]/85 text-[#edf1f5] backdrop-blur-md uppercase tracking-tight">
              {anime.format.replace('_', ' ')}
            </div>
          ) : (
            <div />
          )}

          {anime.averageScore ? (
            <div
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold backdrop-blur-md shadow-md ${getScoreBadgeClass(
                anime.averageScore
              )}`}
            >
              <Smile className="w-3 h-3" />
              <span>{anime.averageScore}%</span>
            </div>
          ) : null}
        </div>

        {/* Next Airing Episode Banner */}
        {anime.nextAiringEpisode && (
          <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#0b1622]/90 border border-[#7bd555]/40 text-[#7bd555] text-[10px] font-bold backdrop-blur-md">
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
                setIsHovered(false);
                setShowTouchPopup(false);
              }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center backdrop-blur-md transition-all shadow-md ${
                inWatchlist
                  ? 'bg-[#7bd555] text-[#0b1622] font-bold'
                  : 'bg-[#0b1622]/85 text-[#edf1f5] hover:text-white hover:bg-[#3db4f2] border border-white/10'
              }`}
              title={inWatchlist ? `In List (${currentItem?.status})` : 'Add to List'}
            >
              {inWatchlist ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4" />}
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
                <div className="absolute bottom-10 right-0 z-40 w-44 p-1.5 rounded-lg anilist-surface-elevated border border-white/10 shadow-2xl space-y-0.5 animate-fadeIn">
                  <div className="text-[10px] uppercase font-bold text-[#8ba0b2] px-2 py-1 tracking-wider border-b border-white/10">
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
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded flex items-center justify-between font-semibold transition ${
                        currentItem?.status === st.id
                          ? 'bg-[#3db4f2] text-white'
                          : 'text-[#edf1f5] hover:bg-white/10'
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
                      className="w-full text-left px-2.5 py-1 text-xs text-[#e85d75] hover:bg-[#e85d75]/20 rounded transition font-medium border-t border-white/10 mt-1"
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
      <div className="p-3 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          <Link
            to={`/anime/${anime.id}`}
            className="font-semibold text-xs sm:text-sm text-[#edf1f5] group-hover:text-[#3db4f2] line-clamp-2 transition leading-snug min-h-[2.2rem] sm:min-h-[2.5rem]"
            title={title}
          >
            {title}
          </Link>
          {studioName ? (
            <p className="text-[11px] text-[#8ba0b2] mt-0.5 truncate font-medium">
              {studioName}
            </p>
          ) : (
            <p className="text-[11px] text-transparent mt-0.5 truncate font-medium select-none pointer-events-none">
              &nbsp;
            </p>
          )}
        </div>

        {/* Bottom meta row */}
        <div className="flex items-center justify-between text-[11px] text-[#8ba0b2] pt-1.5 border-t border-white/[0.04]">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#8ba0b2]" />
            <span>{anime.seasonYear || (anime.season ? `${anime.season}` : 'TBA')}</span>
          </div>

          <div className="flex items-center gap-1">
            <Tv className="w-3 h-3 text-[#8ba0b2]" />
            <span>
              {anime.episodes ? `${anime.episodes} eps` : anime.status === 'RELEASING' ? 'Airing' : 'Movie'}
            </span>
          </div>
        </div>
      </div>

      {/* Touch Preview Trigger Button (Mobile visible) */}
      <button
        type="button"
        onClick={handleTouchToggle}
        className="sm:hidden absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-[#0b1622]/80 text-[#3db4f2] flex items-center justify-center text-[11px] font-bold border border-white/10"
        aria-label="Preview anime details"
        title="Tap for details"
      >
        <Sparkles className="w-3 h-3" />
      </button>

      {/* Floating Hover/Touch AniList Preview Popup Card */}
      {isPopupVisible && (
        <>
          {showTouchPopup && (
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] sm:hidden"
              onClick={() => setShowTouchPopup(false)}
            />
          )}

          <div
            onMouseEnter={() => {
              if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
              setIsHovered(true);
            }}
            onMouseLeave={handleMouseLeave}
            className={`absolute z-50 p-4 rounded-xl bg-[#151f2e] border border-[#223348] shadow-2xl space-y-2.5 animate-fadeIn pointer-events-auto transition-all ${
              placement === 'center'
                ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[88vw] max-w-[320px]'
                : placement === 'left'
                ? 'right-[calc(100%+10px)] top-2 w-[270px]'
                : 'left-[calc(100%+10px)] top-2 w-[270px]'
            }`}
            style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.6))' }}
          >
            {/* Header: Season & Year on left, Score on right */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-extrabold text-sm text-[#edf1f5] tracking-tight">
                {formatSeasonText()}
              </span>

              <div className="flex items-center gap-2">
                {anime.averageScore ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#7bd555]">
                    <Smile className="w-4 h-4 fill-[#7bd555]/20 stroke-[#7bd555]" />
                    <span>{anime.averageScore}%</span>
                  </div>
                ) : null}

                {showTouchPopup && (
                  <button
                    onClick={() => setShowTouchPopup(false)}
                    className="sm:hidden p-1 text-[#8ba0b2] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Studio row in cyan */}
            {studioName ? (
              <div className="text-xs font-bold text-[#00c4d6] hover:underline cursor-pointer">
                {studioName}
              </div>
            ) : null}

            {/* Format and Episodes */}
            <div className="text-xs text-[#8ba0b2] font-medium flex items-center gap-1.5">
              <span>{formatLabel}</span>
              <span>•</span>
              <span>{episodeLabel}</span>
            </div>

            {/* Interactive Genre Pills */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {anime.genres.slice(0, 5).map((genre) => (
                  <Link
                    key={genre}
                    to={`/discover?genre=${encodeURIComponent(genre)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsHovered(false);
                      setShowTouchPopup(false);
                    }}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#00c4d6] hover:bg-[#00a8ba] text-[#0b1622] lowercase transition duration-150 shadow-sm"
                  >
                    {genre.toLowerCase()}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

