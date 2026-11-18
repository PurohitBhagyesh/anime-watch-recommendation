import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Check, Plus, Calendar, Tv, Clock, Smile, Sparkles, X } from 'lucide-react';
import type { AnimeCardData, WatchlistStatus } from '../../api/types';
import { useWatchlist } from '../../context/WatchlistContext';

interface AnimeCardProps {
  anime: AnimeCardData;
  priority?: boolean;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, priority = false }) => {
  const { isInWatchlist, getItem, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTouchPopup, setShowTouchPopup] = useState(false);
  const [placement, setPlacement] = useState<'right' | 'left' | 'center'>('right');
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const title = anime?.title?.userPreferred || anime?.title?.english || anime?.title?.romaji || 'Anime';
  const inWatchlist = anime?.id ? isInWatchlist(anime.id) : false;
  const currentItem = anime?.id ? getItem(anime.id) : undefined;

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
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches) return;
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

  const handleTouchToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    calculatePlacement();
    setShowTouchPopup((prev) => !prev);
  };

  const [isVisible, setIsVisible] = useState(priority || false);
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || isVisible) return;
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    if (posterRef.current) {
      observer.observe(posterRef.current);
    }
    return () => observer.disconnect();
  }, [priority, isVisible]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const isPopupVisible = (isHovered || showTouchPopup) && !showStatusMenu;

  if (!anime || !anime.id) return null;

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative flex flex-col anilist-card h-full ${
        isPopupVisible || showStatusMenu ? 'z-40' : 'z-10'
      }`}
    >
      {/* Poster Image Container */}
      <div ref={posterRef} className="relative aspect-[185/265] w-full bg-[#151519] rounded-t-[15px]">
        <Link
          to={`/anime/${anime.id}`}
          className="block w-full h-full overflow-hidden rounded-t-[15px]"
          aria-label={`View details for ${title}`}
        >
          {isVisible ? (
            <img
              src={anime.coverImage?.large || anime.coverImage?.medium || anime.coverImage?.extraLarge || '/animesenpai-banner.svg'}
              alt={`${title} anime poster`}
              width={185}
              height={265}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding={priority ? 'sync' : 'async'}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-[#151519]" />
          )}
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none z-20">
          {anime.format ? (
            <div className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-black/80 text-white border border-white/10 backdrop-blur-md uppercase tracking-wide truncate max-w-[48%]">
              {anime.format.replace('_', ' ')}
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1 flex-shrink-0">
            {anime.averageScore ? (
              <div
                className={`flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold backdrop-blur-md tabular-nums ${getScoreBadgeClass(
                  anime.averageScore
                )}`}
              >
                <Smile aria-hidden="true" className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>{anime.averageScore}%</span>
              </div>
            ) : null}

            {/* Mobile Quick Preview Trigger */}
            <button
              type="button"
              onClick={handleTouchToggle}
              className="sm:hidden pointer-events-auto w-6 h-6 rounded-full bg-black/85 text-white flex items-center justify-center border border-white/20 active:scale-95"
              aria-label={`Preview details for ${title}`}
              title="Quick preview"
            >
              <Sparkles aria-hidden="true" className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Next Airing Episode Banner */}
        {anime.nextAiringEpisode && (
          <div className="absolute bottom-2 left-2 z-10 pointer-events-none max-w-[calc(100%-3.25rem)]">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/85 border border-emerald-500/35 text-[#4ade80] text-[9px] sm:text-[10px] font-semibold backdrop-blur-md truncate tabular-nums">
              <Clock aria-hidden="true" className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">
                Ep {anime.nextAiringEpisode.episode} · {formatTimeUntilAiring(anime.nextAiringEpisode.timeUntilAiring)}
              </span>
            </div>
          </div>
        )}

        {/* Quick Add Button & Monochrome Popover */}
        <div className="absolute bottom-2 right-2 z-30 pointer-events-auto">
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowStatusMenu(!showStatusMenu);
                setIsHovered(false);
                setShowTouchPopup(false);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg active:scale-95 cursor-pointer ${
                inWatchlist
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'bg-black/85 text-white hover:bg-[#5360e6] hover:border-[#5360e6] border border-white/20'
              }`}
              title={inWatchlist ? `In List (${currentItem?.status})` : 'Add to List'}
              aria-label={`Manage watchlist status for ${title}`}
            >
              {inWatchlist ? (
                <Check aria-hidden="true" className="w-4 h-4 stroke-[3]" />
              ) : (
                <Plus aria-hidden="true" className="w-4 h-4" />
              )}
            </button>

            {showStatusMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowStatusMenu(false);
                  }}
                />
                <div className="absolute bottom-10 right-0 z-50 w-40 p-1.5 rounded-2xl bg-[#0b0b0d] border border-[#232329] shadow-2xl space-y-0.5 animate-fadeIn">
                  <div className="text-[10px] uppercase font-mono font-semibold text-[#666672] px-2.5 py-1 tracking-wider border-b border-[#232329]">
                    Set Status
                  </div>
                  {statusLabels.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToWatchlist(anime, st.id);
                        setShowStatusMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-xl flex items-center justify-between font-medium transition cursor-pointer ${
                        currentItem?.status === st.id
                          ? 'btn-accent-active font-bold'
                          : 'text-[#d2d2dc] hover:bg-[#16161b] hover:text-white'
                      }`}
                    >
                      <span>{st.label}</span>
                      {currentItem?.status === st.id && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  ))}
                  {inWatchlist && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromWatchlist(anime.id);
                        setShowStatusMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/15 rounded-xl transition font-medium border-t border-[#232329] mt-1 cursor-pointer"
                    >
                      Remove from list
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info Card Content */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <Link
            to={`/anime/${anime.id}`}
            className="font-semibold text-xs sm:text-[13.5px] text-white group-hover:text-[#e4e4ec] line-clamp-2 transition leading-snug min-h-[2.15rem] sm:min-h-[2.45rem]"
            title={title}
          >
            {title}
          </Link>
          {studioName ? (
            <p className="text-[11px] text-[#666672] mt-0.5 truncate font-medium">
              {studioName}
            </p>
          ) : (
            <p className="text-[11px] text-transparent mt-0.5 truncate select-none pointer-events-none">
              &nbsp;
            </p>
          )}
        </div>

        {/* Bottom meta row */}
        <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px] text-[#9a9aa6] pt-1.5 border-t border-[#232329] tabular-nums">
          <div className="flex items-center gap-1 min-w-0 truncate">
            <Calendar aria-hidden="true" className="w-3 h-3 text-[#666672] flex-shrink-0" />
            <span className="truncate">{anime.seasonYear || (anime.season ? `${anime.season}` : 'TBA')}</span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Tv aria-hidden="true" className="w-3 h-3 text-[#666672] flex-shrink-0" />
            <span className="whitespace-nowrap">
              {anime.episodes ? `${anime.episodes} eps` : anime.status === 'RELEASING' ? 'Airing' : 'Movie'}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Hover Preview Popup (OpenLid Obsidian Glass) */}
      {isHovered && !showTouchPopup && !showStatusMenu && placement !== 'center' && (
        <div
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            setIsHovered(true);
          }}
          onMouseLeave={handleMouseLeave}
          className={`hidden sm:block absolute z-50 p-4 rounded-2xl bg-[#0b0b0d] border border-[#3a3a44] shadow-2xl space-y-2.5 animate-fadeIn pointer-events-auto w-[272px] top-2 ${
            placement === 'left' ? 'right-[calc(100%+10px)]' : 'left-[calc(100%+10px)]'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="font-bold text-sm text-white tracking-tight line-clamp-2 leading-snug" title={title}>
              {title}
            </span>
            {anime.averageScore ? (
              <div className="flex items-center gap-1 text-xs font-bold text-[#4ade80] flex-shrink-0 pt-0.5 tabular-nums">
                <Smile aria-hidden="true" className="w-3.5 h-3.5" />
                <span>{anime.averageScore}%</span>
              </div>
            ) : null}
          </div>

          {studioName ? (
            <div className="text-xs font-medium text-[#c8c8d2] truncate">
              {studioName}
            </div>
          ) : null}

          <div className="text-xs text-[#9a9aa6] flex items-center flex-wrap gap-1.5 tabular-nums">
            <span>{formatLabel}</span>
            <span>·</span>
            <span>{episodeLabel}</span>
            {formatSeasonText() && (
              <>
                <span>·</span>
                <span>{formatSeasonText()}</span>
              </>
            )}
          </div>

          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {anime.genres.slice(0, 5).map((genre) => (
                <Link
                  key={genre}
                  to={`/discover?genre=${encodeURIComponent(genre)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsHovered(false);
                  }}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#151519] hover:bg-white text-[#c8c8d2] hover:text-black border border-[#232329] transition"
                >
                  {genre}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile Touch Preview Modal rendered via Portal */}
      {showTouchPopup && !showStatusMenu && typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[99980] flex items-center justify-center p-4 sm:hidden animate-fadeIn">
            <div
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setShowTouchPopup(false)}
              aria-hidden="true"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`${title} quick preview`}
              className="relative z-10 w-[min(92dvw,340px)] max-h-[85dvh] overflow-y-auto p-4 rounded-2xl bg-[#0b0b0d] border border-[#3a3a44] shadow-2xl space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-sm text-white tracking-tight leading-snug">
                  {title}
                </span>
                <button
                  type="button"
                  onClick={() => setShowTouchPopup(false)}
                  aria-label="Close preview"
                  className="p-1.5 -mt-1 -mr-1 rounded-full text-[#9a9aa6] hover:text-white hover:bg-[#151519] flex-shrink-0"
                >
                  <X aria-hidden="true" className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                {studioName ? (
                  <div className="text-xs font-medium text-[#c8c8d2] truncate">
                    {studioName}
                  </div>
                ) : (
                  <div />
                )}
                {anime.averageScore ? (
                  <div className="flex items-center gap-1 text-xs font-bold text-[#4ade80] flex-shrink-0 tabular-nums">
                    <Smile aria-hidden="true" className="w-3.5 h-3.5" />
                    <span>{anime.averageScore}%</span>
                  </div>
                ) : null}
              </div>

              <div className="text-xs text-[#9a9aa6] flex items-center flex-wrap gap-1.5 tabular-nums">
                <span>{formatLabel}</span>
                <span>·</span>
                <span>{episodeLabel}</span>
                {formatSeasonText() && (
                  <>
                    <span>·</span>
                    <span>{formatSeasonText()}</span>
                  </>
                )}
              </div>

              {anime.genres && anime.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {anime.genres.slice(0, 5).map((genre) => (
                    <Link
                      key={genre}
                      to={`/discover?genre=${encodeURIComponent(genre)}`}
                      onClick={() => setShowTouchPopup(false)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#151519] border border-[#232329] text-[#c8c8d2]"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-[#232329]">
                <Link
                  to={`/anime/${anime.id}`}
                  onClick={() => setShowTouchPopup(false)}
                  className="w-full py-2.5 anilist-btn-primary text-xs font-bold flex items-center justify-center"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
