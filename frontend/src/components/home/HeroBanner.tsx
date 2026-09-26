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
  Flame,
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
      <div className="relative w-full overflow-hidden min-h-[520px] sm:min-h-[580px] md:min-h-[660px] lg:min-h-[720px] flex items-end border-b border-white/10 shadow-2xl group bg-[#09111c]">
        {/* Background Image Banner */}
        <div className="absolute inset-0 z-0">
          <img
            key={currentAnime.id}
            src={bgImage}
            alt={title}
            className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.1] transition-all duration-700 ease-out"
          />
          {/* AniList Multi-Layer Gradients for smooth navbar blend and content readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1622] via-[#0b1622]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1622] via-[#0b1622]/75 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0b1622]/90 via-[#0b1622]/40 to-transparent pointer-events-none" />
        </div>

        {/* Dynamic Color Glow */}
        {currentAnime.coverImage.color && (
          <div
            className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none transition-colors duration-1000"
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
              className="p-2.5 rounded-xl bg-[#0b1622]/80 hover:bg-[#3db4f2] text-white border border-white/15 backdrop-blur-md transition shadow-lg"
              title="Previous Anime"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % spotlights.length)}
              className="p-2.5 rounded-xl bg-[#0b1622]/80 hover:bg-[#3db4f2] text-white border border-white/15 backdrop-blur-md transition shadow-lg"
              title="Next Anime"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hero Content Box stretching till nav bar */}
        <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-12 md:py-16">
          <div className="max-w-4xl space-y-4 sm:space-y-5">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3db4f2] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-white" />
                # {currentIndex + 1} Spotlight
              </span>

              {currentAnime.averageScore && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0b1622]/85 border border-white/10 text-emerald-400 text-xs font-bold backdrop-blur-xl">
                  <span>{currentAnime.averageScore}% Score</span>
                </span>
              )}

              {currentAnime.format && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0b1622]/85 border border-white/10 text-slate-300 text-xs font-medium backdrop-blur-xl">
                  <Tv className="w-3.5 h-3.5 text-[#3db4f2]" />
                  {currentAnime.format.replace('_', ' ')} ·{' '}
                  {currentAnime.episodes ? `${currentAnime.episodes} eps` : 'Airing'}
                </span>
              )}
            </div>

            {/* Stretched Impactful Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight sm:leading-none drop-shadow-2xl">
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

            {/* Synopsis preview */}
            <p className="text-xs sm:text-sm md:text-base text-slate-300 line-clamp-3 sm:line-clamp-4 leading-relaxed max-w-2xl">
              {cleanDescription}
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
              {currentAnime.trailer?.id && (
                <button
                  onClick={() => setTrailerOpen(true)}
                  className="anilist-btn-primary flex items-center gap-2 px-5 py-2.5 sm:py-3 text-xs sm:text-sm"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Watch Trailer</span>
                </button>
              )}

              <Link
                to={`/anime/${currentAnime.id}`}
                className="anilist-btn-secondary flex items-center gap-2 px-4 py-2.5 sm:py-3 text-xs sm:text-sm"
              >
                <Info className="w-4 h-4 text-[#3db4f2]" />
                <span>Details</span>
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
                    <span>In List</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-slate-300" />
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
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentIndex
                        ? 'w-8 bg-[#3db4f2]'
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
