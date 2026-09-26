import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Info,
  Check,
  Plus,
  Tv,
  ChevronLeft,
  ChevronRight,
  Crown,
  Sparkles,
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
  const [trailerOpen, setTrailerOpen] = useState(false);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const currentAnime = spotlights[currentIndex] || anime;

  // Auto slide every 7 seconds
  useEffect(() => {
    if (spotlights.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % spotlights.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [spotlights.length]);

  if (!currentAnime) return null;

  const title =
    currentAnime.title.english ||
    currentAnime.title.romaji ||
    currentAnime.title.userPreferred;
  const inWatchlist = isInWatchlist(currentAnime.id);

  const cleanDescription = currentAnime.description
    ? currentAnime.description
        .replace(/<[^>]*>?/gm, '')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
    : 'No description available for this title.';

  const bgImage =
    currentAnime.bannerImage ||
    currentAnime.coverImage.extraLarge ||
    currentAnime.coverImage.large;

  return (
    <>
      <div className="relative w-full overflow-hidden min-h-[500px] sm:min-h-[560px] md:min-h-[640px] lg:min-h-[700px] flex items-end border-b border-white/[0.08] shadow-2xl group bg-[#050811]">
        {/* Background Image Banner */}
        <div className="absolute inset-0 z-0">
          <img
            key={currentAnime.id}
            src={bgImage}
            alt={title}
            className="w-full h-full object-cover object-center filter brightness-[0.42] contrast-[1.12] transition-all duration-700 ease-out"
          />
          {/* Royal Multi-Layer Gradients for smooth luxury blend */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-[#080d1a]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050811] via-[#080d1a]/85 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050811]/90 via-[#050811]/40 to-transparent pointer-events-none" />
        </div>

        {/* Dynamic Royal Color Glow */}
        {currentAnime.coverImage.color && (
          <div
            className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl pointer-events-none transition-colors duration-1000"
            style={{ backgroundColor: currentAnime.coverImage.color }}
          />
        )}

        {/* Carousel Prev/Next Overlay Buttons */}
        {spotlights.length > 1 && (
          <div className="absolute top-8 right-6 sm:right-10 lg:right-16 z-20 hidden sm:flex items-center gap-2">
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev - 1 + spotlights.length) % spotlights.length)
              }
              className="p-2.5 rounded-xl bg-[#0e1528]/80 hover:bg-[#6366f1] text-white border border-white/15 backdrop-blur-md transition shadow-lg"
              title="Previous Anime"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % spotlights.length)}
              className="p-2.5 rounded-xl bg-[#0e1528]/80 hover:bg-[#6366f1] text-white border border-white/15 backdrop-blur-md transition shadow-lg"
              title="Next Anime"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hero Content Box with centered container constraints */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          <div className="max-w-3xl space-y-4 sm:space-y-5">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/25 via-amber-400/20 to-yellow-500/15 border border-amber-400/40 text-amber-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                # {currentIndex + 1} Spotlight
              </span>

              {currentAnime.averageScore && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0e1528]/85 border border-emerald-500/30 text-emerald-400 text-xs font-bold backdrop-blur-xl">
                  <Sparkles className="w-3 h-3" />
                  <span>{currentAnime.averageScore}% Community Rating</span>
                </span>
              )}

              {currentAnime.format && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0e1528]/85 border border-white/10 text-slate-300 text-xs font-medium backdrop-blur-xl">
                  <Tv className="w-3.5 h-3.5 text-[#6366f1]" />
                  {currentAnime.format.replace('_', ' ')} ·{' '}
                  {currentAnime.episodes ? `${currentAnime.episodes} eps` : 'Airing'}
                </span>
              )}
            </div>

            {/* Impactful Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-2xl">
              {title}
            </h1>

            {/* Genres */}
            {currentAnime.genres && currentAnime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {currentAnime.genres.slice(0, 5).map((genre) => (
                  <span
                    key={genre}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.08] border border-white/10 text-slate-200 font-medium backdrop-blur-md"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <p className="text-xs sm:text-sm md:text-base text-slate-300 line-clamp-3 sm:line-clamp-4 leading-relaxed max-w-2xl">
              {cleanDescription}
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
              {currentAnime.trailer?.id && (
                <button
                  onClick={() => setTrailerOpen(true)}
                  className="royal-btn-primary flex items-center gap-2 px-5 py-2.5 sm:py-3 text-xs sm:text-sm"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Watch Trailer</span>
                </button>
              )}

              <Link
                to={`/anime/${currentAnime.id}`}
                className="royal-btn-secondary flex items-center gap-2 px-4 py-2.5 sm:py-3 text-xs sm:text-sm"
              >
                <Info className="w-4 h-4 text-[#818cf8]" />
                <span>View Details</span>
              </Link>

              <button
                onClick={() => {
                  if (inWatchlist) {
                    removeFromWatchlist(currentAnime.id);
                  } else {
                    addToWatchlist(currentAnime, 'plan_to_watch');
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg font-bold text-xs sm:text-sm border transition backdrop-blur-md ${
                  inWatchlist
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
                    : 'bg-white/[0.08] border-white/10 text-slate-200 hover:bg-white/[0.15]'
                }`}
              >
                {inWatchlist ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>In Watchlist</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-slate-300" />
                    <span>Add to Watchlist</span>
                  </>
                )}
              </button>
            </div>

            {/* Slide Indicators */}
            {spotlights.length > 1 && (
              <div className="flex items-center gap-2 pt-2">
                {spotlights.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentIndex
                        ? 'w-8 bg-[#6366f1]'
                        : 'w-2.5 bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
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
