import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  Info,
  Check,
  Plus,
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

  const desktopBanner =
    currentAnime?.bannerImage ||
    currentAnime?.coverImage?.extraLarge ||
    currentAnime?.coverImage?.large ||
    '/animesenpai-banner.svg';

  const mobileArtwork =
    currentAnime?.coverImage?.extraLarge ||
    currentAnime?.coverImage?.large ||
    currentAnime?.bannerImage ||
    '/animesenpai-banner.svg';

  const hasTrailer = Boolean(currentAnime.trailer?.id);

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
        className="hero-adaptive relative w-full overflow-hidden min-h-[470px] min-[400px]:min-h-[510px] sm:min-h-[430px] md:min-h-[465px] lg:min-h-[500px] flex items-end border-b border-[#23232b] bg-[#000000] select-none cursor-grab active:cursor-grabbing"
      >
        {/* Responsive Art-Directed Background: Portrait Key Art on Mobile, Wide Banner on Desktop */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <picture key={currentAnime.id} className="block w-full h-full">
            <source media="(min-width: 640px)" srcSet={desktopBanner} />
            <img
              src={mobileArtwork}
              alt={`${title} anime featured banner`}
              width={1920}
              height={490}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              style={{
                transform: isDragging
                  ? `translate3d(${dragOffset * 0.16}px, 0, 0) scale(1.03)`
                  : undefined,
                transition: isDragging
                  ? 'none'
                  : 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className={`w-full h-full object-cover object-[center_18%] sm:object-center filter brightness-[0.76] sm:brightness-[0.46] contrast-[1.05] ${
                hasInteracted || currentIndex > 0 ? 'animate-hero-bg will-change-transform' : ''
              }`}
            />
          </picture>
          {/* Mobile vertical cinema vignette (keeps top artwork vibrant, bottom text crisp) */}
          <div className="absolute inset-0 sm:hidden bg-gradient-to-b from-[#000000]/35 via-[#000000]/15 via-35% to-[#000000]" />
          <div className="absolute inset-x-0 bottom-0 h-[66%] sm:hidden bg-gradient-to-t from-[#000000] via-[#000000]/88 to-transparent" />
          {/* Desktop cinematic dual-axis vignette */}
          <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/65 to-[#000000]/20" />
          <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000000]/75 to-transparent" />
        </div>

        {/* Hero Foreground Slide Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 min-[400px]:pt-48 pb-5 sm:py-10 md:py-12 pointer-events-none">
          <div
            key={currentAnime.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${currentIndex + 1} of ${spotlights.length}: ${title}`}
            style={{
              transform: isDragging ? `translate3d(${dragOffset}px, 0, 0)` : undefined,
              transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className={`max-w-3xl space-y-3 sm:space-y-4 pointer-events-auto ${
              isDragging || (!hasInteracted && currentIndex === 0)
                ? ''
                : slideDirection === 'next'
                ? 'animate-hero-slide-right will-change-transform'
                : 'animate-hero-slide-left will-change-transform'
            }`}
          >
            {/* Editorial Title */}
            <h2
              title={title}
              className="text-[1.6rem] min-[400px]:text-[1.85rem] sm:text-4xl md:text-[3.1rem] font-extrabold text-white tracking-[-0.035em] leading-[1.1] line-clamp-2 break-words drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)]"
            >
              {title}
            </h2>

            {/* Genres (clean muted monochrome pills) */}
            {currentAnime.genres && currentAnime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {currentAnime.genres.slice(0, 4).map((genre, idx) => (
                  <span
                    key={genre}
                    className={`text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-[#121218]/90 backdrop-blur-sm border border-[#2a2a36] text-[#d4d4de] font-medium ${
                      idx >= 3 ? 'hidden sm:inline-flex' : ''
                    }`}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <p className="text-[12.5px] sm:text-sm text-[#b4b4c0] sm:text-[#9a9aa6] line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-2xl">
              {cleanDescription}
            </p>

            {/* Primary CTA + Secondary Pills (Balanced 2-col on mobile, inline flex on desktop) */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 pt-1 sm:pt-2">
              {hasTrailer ? (
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
                  className="anilist-btn-primary flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 min-h-[44px] text-xs sm:text-[13.5px]"
                >
                  <Info aria-hidden="true" className="w-3.5 h-3.5" />
                  <span>Explore Anime</span>
                </Link>
              )}

              {hasTrailer && (
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
              <div className="flex items-center justify-between gap-3 pt-2 sm:pt-3">
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
                          className="min-w-[24px] sm:min-w-[26px] h-7 px-1 flex items-center justify-center group focus-visible:outline-2 focus-visible:outline-white rounded-full cursor-pointer"
                          aria-label={`Go to slide ${idx + 1} of ${spotlights.length}`}
                          aria-current={isCurrent ? 'true' : undefined}
                        >
                          <span
                            className={`relative block h-1.5 rounded-full overflow-hidden transition-all duration-300 ${
                              isCurrent
                                ? 'w-7 sm:w-8 bg-white/25'
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
