import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Info,
  Check,
  Plus,
  Tv,
  Smile,
  Sparkles,
  MoveHorizontal,
} from 'lucide-react';
import type { AnimeCardData } from '../../api/types';
import { TrailerModal } from '../common/TrailerModal';
import { useWatchlist } from '../../context/WatchlistContext';

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
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isPointerDownRef = useRef<boolean>(false);
  const hasMovedRef = useRef<boolean>(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accumulatedDeltaXRef = useRef<number>(0);
  const isWheelLockedRef = useRef<boolean>(false);
  const wheelResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentAnime = spotlights[currentIndex] || anime;

  // Slide navigation handlers
  const goToNext = useCallback(() => {
    if (spotlights.length <= 1) return;
    setSlideDirection('next');
    setCurrentIndex((prev) => (prev + 1) % spotlights.length);
  }, [spotlights.length]);

  const goToPrev = useCallback(() => {
    if (spotlights.length <= 1) return;
    setSlideDirection('prev');
    setCurrentIndex((prev) => (prev - 1 + spotlights.length) % spotlights.length);
  }, [spotlights.length]);

  const goToSlide = (idx: number) => {
    if (idx === currentIndex) return;
    setSlideDirection(idx > currentIndex ? 'next' : 'prev');
    setCurrentIndex(idx);
  };

  // Auto-advance banner every 6.5s when not paused
  useEffect(() => {
    if (spotlights.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      goToNext();
    }, 6500);
    return () => clearInterval(interval);
  }, [spotlights.length, isPaused, goToNext]);

  // macOS Trackpad two-finger horizontal gesture support
  useEffect(() => {
    const container = containerRef.current;
    if (!container || spotlights.length <= 1) return;

    const handleWheel = (e: WheelEvent) => {
      // Check if horizontal swipe intent dominates vertical page scroll
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        // Prevent native macOS browser history navigation (back/forward page swipe)
        e.preventDefault();

        // Pause auto-advance during gesture
        setIsPaused(true);
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);

        // If locked during active slide animation, prevent multi-slide skipping
        if (isWheelLockedRef.current) return;

        accumulatedDeltaXRef.current += e.deltaX;

        // Provide kinetic tactile feedback under finger motion
        const clampedOffset = -Math.max(-75, Math.min(75, accumulatedDeltaXRef.current * 0.75));
        setDragOffset(clampedOffset);
        setIsDragging(true);

        if (wheelResetTimeoutRef.current) {
          clearTimeout(wheelResetTimeoutRef.current);
        }

        const GESTURE_THRESHOLD = 32;

        if (accumulatedDeltaXRef.current > GESTURE_THRESHOLD) {
          // Trackpad swipe left (two fingers moving left) -> Next Spotlight
          isWheelLockedRef.current = true;
          accumulatedDeltaXRef.current = 0;
          setDragOffset(0);
          setIsDragging(false);
          goToNext();

          setTimeout(() => {
            isWheelLockedRef.current = false;
          }, 550);

          resumeTimerRef.current = setTimeout(() => {
            setIsPaused(false);
          }, 4000);
        } else if (accumulatedDeltaXRef.current < -GESTURE_THRESHOLD) {
          // Trackpad swipe right (two fingers moving right) -> Previous Spotlight
          isWheelLockedRef.current = true;
          accumulatedDeltaXRef.current = 0;
          setDragOffset(0);
          setIsDragging(false);
          goToPrev();

          setTimeout(() => {
            isWheelLockedRef.current = false;
          }, 550);

          resumeTimerRef.current = setTimeout(() => {
            setIsPaused(false);
          }, 4000);
        } else {
          // Inertia dissipates without triggering threshold -> smoothly reset
          wheelResetTimeoutRef.current = setTimeout(() => {
            accumulatedDeltaXRef.current = 0;
            setDragOffset(0);
            setIsDragging(false);
            resumeTimerRef.current = setTimeout(() => {
              setIsPaused(false);
            }, 3000);
          }, 150);
        }
      }
    };

    // Note: { passive: false } is essential on macOS to allow e.preventDefault()
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (wheelResetTimeoutRef.current) clearTimeout(wheelResetTimeoutRef.current);
    };
  }, [spotlights.length, goToNext, goToPrev]);

  // Keyboard left/right arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (!isVisible) return;

      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  // Touch Swipe Gesture Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (spotlights.length <= 1) return;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    setIsPaused(true);
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    hasMovedRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || spotlights.length <= 1) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartRef.current.x;
    const diffY = touch.clientY - touchStartRef.current.y;

    // Check if horizontal intent is stronger than vertical scroll
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 10) {
        hasMovedRef.current = true;
        setIsDragging(true);
        // Apply smooth tactile resistance
        setDragOffset(diffX * 0.55);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current) return;
    const drag = dragOffset;
    const elapsed = Date.now() - touchStartRef.current.time;
    const velocity = Math.abs(drag) / (elapsed || 1);

    // Threshold check: displacement or fast flick
    if (drag < -40 || (drag < -20 && velocity > 0.25)) {
      goToNext();
    } else if (drag > 40 || (drag > 20 && velocity > 0.25)) {
      goToPrev();
    }

    setDragOffset(0);
    setIsDragging(false);
    touchStartRef.current = null;

    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
      hasMovedRef.current = false;
    }, 3000);
  };

  // Mouse / Pointer Drag Handlers (for trackpad & desktop drag support)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || spotlights.length <= 1) return;
    const target = e.target as HTMLElement;
    // Don't hijack clicks on buttons, links, or inputs
    if (target.closest('button') || target.closest('a')) return;

    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    setIsPaused(true);
    isPointerDownRef.current = true;
    hasMovedRef.current = false;
    touchStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current || !touchStartRef.current || spotlights.length <= 1) return;
    const diffX = e.clientX - touchStartRef.current.x;
    const diffY = e.clientY - touchStartRef.current.y;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
      hasMovedRef.current = true;
      setIsDragging(true);
      setDragOffset(diffX * 0.45);
    }
  };

  const handlePointerUp = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    handleTouchEnd();
  };

  if (!currentAnime) return null;

  const title =
    currentAnime?.title?.userPreferred ||
    currentAnime?.title?.english ||
    currentAnime?.title?.romaji ||
    'Featured Anime';
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

  return (
    <>
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          if (!isDragging) setIsPaused(false);
        }}
        style={{ touchAction: 'pan-y' }}
        className="relative w-full overflow-hidden min-h-[380px] sm:min-h-[480px] md:min-h-[560px] lg:min-h-[620px] flex items-end border-b border-white/[0.06] bg-[#0b1622] group select-none cursor-grab active:cursor-grabbing"
      >
        {/* Background Image with Kinetic Depth Parallax */}
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
                ? `translate3d(${dragOffset * 0.15}px, 0, 0) scale(1.03)`
                : undefined,
              transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease',
            }}
            className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.08] animate-fadeIn will-change-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1622] via-[#0b1622]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1622] via-[#0b1622]/80 to-transparent" />
        </div>

        {/* Hero Interactive Content Box */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 md:py-16 pointer-events-none">
          <div
            key={currentAnime.id}
            style={{
              transform: isDragging ? `translate3d(${dragOffset}px, 0, 0)` : undefined,
              transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className={`max-w-3xl space-y-4 pointer-events-auto will-change-transform ${
              isDragging
                ? ''
                : slideDirection === 'next'
                ? 'animate-hero-slide-right'
                : 'animate-hero-slide-left'
            }`}
          >
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#3db4f2]/20 border border-[#3db4f2]/40 text-[#3db4f2] text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Featured #{currentIndex + 1}
              </span>

              {currentAnime.averageScore && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#7bd555]/15 border border-[#7bd555]/30 text-[#7bd555] text-xs font-bold backdrop-blur-xl shadow-sm">
                  <Smile className="w-3 h-3" />
                  <span>{currentAnime.averageScore}% Score</span>
                </span>
              )}

              {currentAnime.format && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#151f2e]/85 border border-white/10 text-[#edf1f5] text-xs font-medium backdrop-blur-xl shadow-sm">
                  <Tv className="w-3.5 h-3.5 text-[#3db4f2]" />
                  {currentAnime.format.replace('_', ' ')} ·{' '}
                  {currentAnime.episodes ? `${currentAnime.episodes} eps` : 'Airing'}
                </span>
              )}

              {/* Mobile Swipe Hint Badge */}
              {spotlights.length > 1 && (
                <span className="sm:hidden flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 text-[10px] font-mono tracking-tight">
                  <MoveHorizontal className="w-3 h-3 text-[#3db4f2]" />
                  <span>Swipe</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#edf1f5] tracking-tight leading-tight drop-shadow-md">
              {title}
            </h1>

            {/* Genres */}
            {currentAnime.genres && currentAnime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {currentAnime.genres.slice(0, 5).map((genre) => (
                  <span
                    key={genre}
                    className="text-xs px-2.5 py-0.5 rounded bg-[#151f2e]/80 border border-white/10 text-[#8ba0b2] font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <p className="text-xs sm:text-sm text-[#8ba0b2] line-clamp-3 sm:line-clamp-4 leading-relaxed max-w-2xl">
              {cleanDescription}
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              {currentAnime.trailer?.id && (
                <button
                  onClick={(e) => {
                    if (hasMovedRef.current) return;
                    e.stopPropagation();
                    setTrailerOpen(true);
                  }}
                  className="anilist-btn-primary flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Watch Trailer</span>
                </button>
              )}

              <Link
                to={`/anime/${currentAnime.id}`}
                onClick={(e) => {
                  if (hasMovedRef.current) e.preventDefault();
                }}
                className="anilist-btn-secondary flex items-center gap-2 px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-white/10"
              >
                <Info className="w-4 h-4 text-[#3db4f2]" />
                <span>View Details</span>
              </Link>

              <button
                onClick={(e) => {
                  if (hasMovedRef.current) return;
                  e.stopPropagation();
                  if (inWatchlist) {
                    removeFromWatchlist(currentAnime.id);
                  } else {
                    addToWatchlist(currentAnime, 'plan_to_watch');
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded font-bold text-xs sm:text-sm border transition backdrop-blur-md cursor-pointer ${
                  inWatchlist
                    ? 'bg-[#7bd555]/20 border-[#7bd555]/50 text-[#7bd555]'
                    : 'bg-[#151f2e] border-white/10 text-[#edf1f5] hover:bg-white/10'
                }`}
              >
                {inWatchlist ? (
                  <>
                    <Check className="w-4 h-4 text-[#7bd555]" />
                    <span>In Watchlist</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-[#8ba0b2]" />
                    <span>Add to List</span>
                  </>
                )}
              </button>
            </div>

            {/* Slide Indicators & Swipe Hint */}
            {spotlights.length > 1 && (
              <div className="flex items-center gap-3 pt-3">
                <div className="flex items-center gap-1.5">
                  {spotlights.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        goToSlide(idx);
                      }}
                      className="h-7 px-1 flex items-center justify-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3db4f2] cursor-pointer"
                      aria-label={`Go to slide ${idx + 1}`}
                    >
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          idx === currentIndex
                            ? 'w-8 bg-[#3db4f2] shadow-sm shadow-[#3db4f2]/50'
                            : 'w-2 bg-white/25 group-hover:bg-white/50'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
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
