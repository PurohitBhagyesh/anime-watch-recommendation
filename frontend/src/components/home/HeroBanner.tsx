import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  Info,
  Check,
  Plus,
  Tv,
  Smile,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { AnimeCardData } from '../../api/types';
import { TrailerModal } from '../common/TrailerModal';
import { useWatchlist } from '../../context/WatchlistContext';
import { usePreferences } from '../../context/PreferencesContext';

interface HeroBannerProps {
  animeList?: AnimeCardData[];
  anime?: AnimeCardData | null;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ animeList, anime }) => {
  const spotlights = (animeList && animeList.length > 0 ? animeList : anime ? [anime] : []).slice(0, 5);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isHoverPaused, setIsHoverPaused] = useState<boolean>(false);
  const [userPaused, setUserPaused] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { getPreferredTitle } = usePreferences();

  const containerRef = useRef<HTMLElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isPointerDownRef = useRef<boolean>(false);
  const hasMovedRef = useRef<boolean>(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accumulatedDeltaXRef = useRef<number>(0);
  const isWheelLockedRef = useRef<boolean>(false);
  const wheelResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPaused = userPaused || isHoverPaused || trailerOpen;
  const currentAnime = spotlights[currentIndex] || anime;

  const goToNext = useCallback(
    (manual = false) => {
      if (spotlights.length <= 1) return;
      if (manual) setHasInteracted(true);
      setSlideDirection('next');
      setCurrentIndex((prev) => (prev + 1) % spotlights.length);
    },
    [spotlights.length]
  );

  const goToPrev = useCallback(
    (manual = false) => {
      if (spotlights.length <= 1) return;
      if (manual) setHasInteracted(true);
      setSlideDirection('prev');
      setCurrentIndex((prev) => (prev - 1 + spotlights.length) % spotlights.length);
    },
    [spotlights.length]
  );

  const goToSlide = (idx: number) => {
    if (idx === currentIndex) return;
    setHasInteracted(true);
    setSlideDirection(idx > currentIndex ? 'next' : 'prev');
    setCurrentIndex(idx);
  };

  // Auto-advance every 6.5s when active
  useEffect(() => {
    if (spotlights.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      goToNext(false);
    }, 6500);
    return () => clearInterval(interval);
  }, [spotlights.length, isPaused, goToNext]);

  // macOS Trackpad two-finger horizontal gesture support
  useEffect(() => {
    const container = containerRef.current;
    if (!container || spotlights.length <= 1) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        setIsHoverPaused(true);
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);

        if (isWheelLockedRef.current) return;

        accumulatedDeltaXRef.current += e.deltaX;
        const clampedOffset = -Math.max(-72, Math.min(72, accumulatedDeltaXRef.current * 0.72));
        setDragOffset(clampedOffset);
        setIsDragging(true);

        if (wheelResetTimeoutRef.current) clearTimeout(wheelResetTimeoutRef.current);

        const GESTURE_THRESHOLD = 32;
        if (accumulatedDeltaXRef.current > GESTURE_THRESHOLD) {
          isWheelLockedRef.current = true;
          accumulatedDeltaXRef.current = 0;
          setDragOffset(0);
          setIsDragging(false);
          goToNext(true);
          setTimeout(() => {
            isWheelLockedRef.current = false;
          }, 520);
          resumeTimerRef.current = setTimeout(() => setIsHoverPaused(false), 3800);
        } else if (accumulatedDeltaXRef.current < -GESTURE_THRESHOLD) {
          isWheelLockedRef.current = true;
          accumulatedDeltaXRef.current = 0;
          setDragOffset(0);
          setIsDragging(false);
          goToPrev(true);
          setTimeout(() => {
            isWheelLockedRef.current = false;
          }, 520);
          resumeTimerRef.current = setTimeout(() => setIsHoverPaused(false), 3800);
        } else {
          wheelResetTimeoutRef.current = setTimeout(() => {
            accumulatedDeltaXRef.current = 0;
            setDragOffset(0);
            setIsDragging(false);
            resumeTimerRef.current = setTimeout(() => setIsHoverPaused(false), 2600);
          }, 150);
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (wheelResetTimeoutRef.current) clearTimeout(wheelResetTimeoutRef.current);
    };
  }, [spotlights.length, goToNext, goToPrev]);

  // Keyboard arrow navigation when hero is visible and not inside interactive controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (!isVisible) return;

      if (e.key === 'ArrowRight') {
        goToNext(true);
      } else if (e.key === 'ArrowLeft') {
        goToPrev(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  // Touch Swipe Gesture Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (spotlights.length <= 1) return;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    setIsHoverPaused(true);
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    hasMovedRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || spotlights.length <= 1) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartRef.current.x;
    const diffY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      hasMovedRef.current = true;
      setIsDragging(true);
      setDragOffset(diffX * 0.55);
    }
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current) return;
    const drag = dragOffset;
    const elapsed = Date.now() - touchStartRef.current.time;
    const velocity = Math.abs(drag) / (elapsed || 1);

    if (drag < -38 || (drag < -20 && velocity > 0.25)) {
      goToNext(true);
    } else if (drag > 38 || (drag > 20 && velocity > 0.25)) {
      goToPrev(true);
    }

    setDragOffset(0);
    setIsDragging(false);
    touchStartRef.current = null;

    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsHoverPaused(false);
      hasMovedRef.current = false;
    }, 2800);
  };

  // Mouse / Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || e.button !== 0 || spotlights.length <= 1) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;

    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    setIsHoverPaused(true);
    isPointerDownRef.current = true;
    hasMovedRef.current = false;
    touchStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || !isPointerDownRef.current || !touchStartRef.current || spotlights.length <= 1) return;
    const diffX = e.clientX - touchStartRef.current.x;
    const diffY = e.clientY - touchStartRef.current.y;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
      hasMovedRef.current = true;
      setIsDragging(true);
      setDragOffset(diffX * 0.45);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || !isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    handleTouchEnd();
  };

  if (!currentAnime) return null;

  const title = getPreferredTitle(currentAnime?.title, 'Featured Anime');
  const inWatchlist = currentAnime?.id ? isInWatchlist(currentAnime.id) : false;

  const cleanDescription = currentAnime?.description
    ? currentAnime.description
        .replace(/<[^>]*>?/gm, '')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
    : 'Discover 20,000+ anime titles, track your watchlist, and explore trailers on AnimeSenpai.';

  const bgImage =
    currentAnime?.bannerImage ||
    currentAnime?.coverImage?.extraLarge ||
    currentAnime?.coverImage?.large ||
    '/animesenpai-banner.svg';

  const padIndex = (n: number) => String(n).padStart(2, '0');

  return (
    <>
      <section
        ref={containerRef}
        aria-roledescription="carousel"
        aria-label="Featured anime spotlight"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onMouseEnter={() => setIsHoverPaused(true)}
        onMouseLeave={() => {
          if (!isDragging) setIsHoverPaused(false);
        }}
        style={{ touchAction: 'pan-y' }}
        className="hero-adaptive relative w-full overflow-hidden min-h-[370px] sm:min-h-[420px] md:min-h-[460px] lg:min-h-[490px] flex items-end border-b border-[#23232b] bg-[#000000] select-none cursor-grab active:cursor-grabbing"
      >
        {/* Background Artwork with Smooth Reveal + Parallax */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            key={currentAnime.id}
            src={bgImage}
            alt={`${title} anime featured banner`}
            loading="eager"
            decoding="sync"
            fetchPriority="high"
            style={{
              transform: isDragging
                ? `translate3d(${dragOffset * 0.16}px, 0, 0) scale(1.03)`
                : undefined,
              transition: isDragging
                ? 'none'
                : 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="w-full h-full object-cover object-center filter brightness-[0.42] sm:brightness-[0.44] contrast-[1.06] animate-hero-bg will-change-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/75 sm:via-[#000000]/65 to-[#000000]/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000000]/72 sm:via-[#000000]/75 to-transparent" />
        </div>

        {/* Hero Foreground Slide Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 sm:py-10 md:py-12 pointer-events-none">
          <div
            key={currentAnime.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${currentIndex + 1} of ${spotlights.length}: ${title}`}
            style={{
              transform: isDragging ? `translate3d(${dragOffset}px, 0, 0)` : undefined,
              transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className={`max-w-3xl space-y-3.5 sm:space-y-4 pointer-events-auto will-change-transform ${
              isDragging
                ? ''
                : slideDirection === 'next'
                ? 'animate-hero-slide-right'
                : 'animate-hero-slide-left'
            }`}
          >
            {/* Clean 2-Color UI Metadata Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0c0c0f]/90 border border-[#23232b] text-[#f5f5f7] text-[11px] font-mono font-semibold tracking-wider uppercase tabular-nums shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5360e6]" />
                Spotlight {padIndex(currentIndex + 1)} / {padIndex(spotlights.length)}
              </span>

              {currentAnime.averageScore && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/12 border border-emerald-500/30 text-[#4ade80] text-[11px] sm:text-xs font-semibold tabular-nums">
                  <Smile aria-hidden="true" className="w-3 h-3" />
                  <span>{currentAnime.averageScore}%</span>
                </span>
              )}

              {currentAnime.format && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0b0b0d]/85 border border-[#232329] text-[#c8c8d2] text-[11px] sm:text-xs font-medium tabular-nums">
                  <Tv aria-hidden="true" className="w-3 h-3 text-[#9a9aa6]" />
                  {currentAnime.format.replace('_', ' ')} ·{' '}
                  {currentAnime.episodes ? `${currentAnime.episodes} eps` : 'Airing'}
                </span>
              )}
            </div>

            {/* Editorial Title */}
            <h2
              title={title}
              className="text-2xl min-[400px]:text-3xl sm:text-4xl md:text-[3.1rem] font-extrabold text-white tracking-[-0.035em] leading-[1.08] line-clamp-3 sm:line-clamp-2 break-words"
            >
              {title}
            </h2>

            {/* Genres (clean muted monochrome pills) */}
            {currentAnime.genres && currentAnime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {currentAnime.genres.slice(0, 4).map((genre, idx) => (
                  <span
                    key={genre}
                    className={`text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-[#151519]/90 border border-[#232329] text-[#c8c8d2] font-medium ${
                      idx >= 3 ? 'hidden sm:inline-flex' : ''
                    }`}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <p className="text-[13px] sm:text-sm text-[#9a9aa6] line-clamp-3 leading-relaxed max-w-2xl">
              {cleanDescription}
            </p>

            {/* OpenLid Inverted White Pill Primary CTA + Bordered Secondary Pills */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 pt-2">
              {currentAnime.trailer?.id ? (
                <button
                  type="button"
                  onClick={(e) => {
                    if (hasMovedRef.current) return;
                    e.stopPropagation();
                    setTrailerOpen(true);
                  }}
                  className="col-span-2 sm:col-span-1 anilist-btn-primary flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] text-xs sm:text-[13.5px] cursor-pointer"
                >
                  <Play aria-hidden="true" className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Trailer</span>
                </button>
              ) : (
                <Link
                  to={`/anime/${currentAnime.id}`}
                  onClick={(e) => {
                    if (hasMovedRef.current) e.preventDefault();
                  }}
                  className="col-span-2 sm:col-span-1 anilist-btn-primary flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] text-xs sm:text-[13.5px]"
                >
                  <Info aria-hidden="true" className="w-3.5 h-3.5" />
                  <span>Explore Anime</span>
                </Link>
              )}

              {currentAnime.trailer?.id && (
                <Link
                  to={`/anime/${currentAnime.id}`}
                  onClick={(e) => {
                    if (hasMovedRef.current) e.preventDefault();
                  }}
                  className="anilist-btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] text-xs sm:text-[13.5px]"
                >
                  <Info aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
                  <span>View Details</span>
                </Link>
              )}

              <button
                type="button"
                onClick={(e) => {
                  if (hasMovedRef.current) return;
                  e.stopPropagation();
                  if (inWatchlist) {
                    removeFromWatchlist(currentAnime.id);
                  } else {
                    addToWatchlist(currentAnime, 'plan_to_watch');
                  }
                }}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full font-semibold text-xs sm:text-[13.5px] border transition cursor-pointer ${
                  inWatchlist
                    ? 'bg-emerald-500/15 border-emerald-500/35 text-[#4ade80]'
                    : 'anilist-btn-secondary'
                }`}
              >
                {inWatchlist ? (
                  <>
                    <Check aria-hidden="true" className="w-3.5 h-3.5" />
                    <span>In Watchlist</span>
                  </>
                ) : (
                  <>
                    <Plus aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
                    <span>Add to List</span>
                  </>
                )}
              </button>
            </div>

            {/* Monochrome Slide Controls, Indicators & WCAG Pause Button */}
            {spotlights.length > 1 && (
              <div className="flex items-center justify-between gap-3 pt-3">
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#0b0b0d]/90 border border-[#232329] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserPaused((p) => !p);
                    }}
                    aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}
                    title={userPaused ? 'Play slideshow' : 'Pause slideshow'}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#9a9aa6] hover:text-white hover:bg-[#151519] transition cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
                  >
                    {userPaused ? (
                      <Play aria-hidden="true" className="w-3 h-3 fill-current" />
                    ) : (
                      <Pause aria-hidden="true" className="w-3 h-3 fill-current" />
                    )}
                  </button>

                  <span className="w-px h-3.5 bg-[#232329] mx-0.5" aria-hidden="true" />

                  <nav aria-label="Choose spotlight slide" className="inline-flex items-center">
                    {spotlights.map((item, idx) => {
                      const isCurrent = idx === currentIndex;
                      return (
                        <button
                          type="button"
                          key={item.id ?? idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            goToSlide(idx);
                          }}
                          className="min-w-[26px] h-7 px-1 flex items-center justify-center group focus-visible:outline-2 focus-visible:outline-white rounded-full cursor-pointer"
                          aria-label={`Go to slide ${idx + 1} of ${spotlights.length}`}
                          aria-current={isCurrent ? 'true' : undefined}
                        >
                          <span
                            className={`relative block h-1.5 rounded-full overflow-hidden transition-all duration-300 ${
                              isCurrent
                                ? 'w-8 bg-white/25'
                                : 'w-2 bg-white/30 group-hover:bg-white/60'
                            }`}
                          >
                            {isCurrent && (
                              <span
                                key={`${currentIndex}-${isPaused ? 'paused' : 'play'}`}
                                className={`absolute inset-0 rounded-full bg-[#5360e6] ${
                                  isPaused ? 'w-full' : 'animate-hero-progress'
                                }`}
                              />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Desktop Prev / Next Monochrome Arrows */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPrev(true);
                    }}
                    aria-label="Previous featured anime"
                    className="w-9 h-9 rounded-full bg-[#0b0b0d]/90 hover:bg-[#151519] border border-[#232329] hover:border-[#3a3a44] flex items-center justify-center text-[#c8c8d2] hover:text-white transition cursor-pointer active:scale-95"
                  >
                    <ChevronLeft aria-hidden="true" className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNext(true);
                    }}
                    aria-label="Next featured anime"
                    className="w-9 h-9 rounded-full bg-[#0b0b0d]/90 hover:bg-[#151519] border border-[#232329] hover:border-[#3a3a44] flex items-center justify-center text-[#c8c8d2] hover:text-white transition cursor-pointer active:scale-95"
                  >
                    <ChevronRight aria-hidden="true" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visually hidden polite live region announcing slide changes after user interaction */}
        <p className="sr-only" role="status" aria-live="polite">
          {hasInteracted ? `Slide ${currentIndex + 1} of ${spotlights.length}: ${title}` : ''}
        </p>
      </section>

      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailer={currentAnime.trailer}
        title={title}
      />
    </>
  );
};

export default HeroBanner;
