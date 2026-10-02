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
  Smile,
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
    currentAnime.title.userPreferred ||
    currentAnime.title.english ||
    currentAnime.title.romaji;
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
      <div className="relative w-full overflow-hidden min-h-[380px] sm:min-h-[480px] md:min-h-[560px] lg:min-h-[620px] flex items-end border-b border-white/[0.06] bg-[#0b1622] group">
        {/* Background Image Banner */}
        <div className="absolute inset-0 z-0">
          <img
            key={currentAnime.id}
            src={bgImage}
            alt={title}
            className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.08] transition-all duration-700 ease-out"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1622] via-[#0b1622]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1622] via-[#0b1622]/80 to-transparent" />
        </div>

        {/* Carousel Controls */}
        {spotlights.length > 1 && (
          <div className="absolute top-4 sm:top-8 right-4 sm:right-10 lg:right-16 z-20 flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev - 1 + spotlights.length) % spotlights.length)
              }
              className="p-1.5 sm:p-2 rounded-lg bg-[#151f2e]/80 hover:bg-[#3db4f2] text-white border border-white/10 backdrop-blur-md transition active:scale-95"
              title="Previous Spotlight"
              aria-label="Previous Spotlight"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % spotlights.length)}
              className="p-1.5 sm:p-2 rounded-lg bg-[#151f2e]/80 hover:bg-[#3db4f2] text-white border border-white/10 backdrop-blur-md transition active:scale-95"
              title="Next Spotlight"
              aria-label="Next Spotlight"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}

        {/* Hero Content Box */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 md:py-16">
          <div className="max-w-3xl space-y-4">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#3db4f2]/20 border border-[#3db4f2]/40 text-[#3db4f2] text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                Featured #{currentIndex + 1}
              </span>

              {currentAnime.averageScore && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#7bd555]/15 border border-[#7bd555]/30 text-[#7bd555] text-xs font-bold backdrop-blur-xl">
                  <Smile className="w-3 h-3" />
                  <span>{currentAnime.averageScore}% Score</span>
                </span>
              )}

              {currentAnime.format && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#151f2e]/85 border border-white/10 text-[#edf1f5] text-xs font-medium backdrop-blur-xl">
                  <Tv className="w-3.5 h-3.5 text-[#3db4f2]" />
                  {currentAnime.format.replace('_', ' ')} ·{' '}
                  {currentAnime.episodes ? `${currentAnime.episodes} eps` : 'Airing'}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#edf1f5] tracking-tight leading-tight">
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
                  onClick={() => setTrailerOpen(true)}
                  className="anilist-btn-primary flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Watch Trailer</span>
                </button>
              )}

              <Link
                to={`/anime/${currentAnime.id}`}
                className="anilist-btn-secondary flex items-center gap-2 px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-white/10"
              >
                <Info className="w-4 h-4 text-[#3db4f2]" />
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
                className={`flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded font-bold text-xs sm:text-sm border transition backdrop-blur-md ${
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

            {/* Slide Indicators */}
            {spotlights.length > 1 && (
              <div className="flex items-center gap-2 pt-2">
                {spotlights.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className="p-2 -m-2 flex items-center justify-center group"
                    aria-label={`Go to slide ${idx + 1}`}
                  >
                    <div className={`h-1.5 rounded-full transition-all ${
                      idx === currentIndex
                        ? 'w-8 bg-[#3db4f2]'
                        : 'w-2 bg-white/20 group-hover:bg-white/40'
                    }`} />
                  </button>
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
