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
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden min-h-[480px] sm:min-h-[520px] md:min-h-[580px] lg:min-h-[620px] flex items-end border border-white/10 shadow-2xl group bg-[#09111c]">
        {/* Background Image Banner */}
        <div className="absolute inset-0 z-0">
          <img
            key={currentAnime.id}
            src={bgImage}
            alt={title}
            className="w-full h-full object-cover object-center filter brightness-[0.5] contrast-[1.08] transition-all duration-700 ease-out"
          />
          {/* AniList Navy Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1622] via-[#0b1622]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1622] via-[#0b1622]/60 to-transparent" />
        </div>

        {/* Dynamic Color Glow */}
        {currentAnime.coverImage.color && (
          <div
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none transition-colors duration-1000"
            style={{ backgroundColor: currentAnime.coverImage.color }}
          />
        )}

        {/* Carousel Prev/Next Overlay Buttons */}
        {spotlights.length > 1 && (
          <div className="absolute top-6 right-6 z-20 hidden sm:flex items-center gap-2">
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev - 1 + spotlights.length) % spotlights.length)
              }
              className="p-2 rounded-xl bg-[#0b1622]/70 hover:bg-[#3db4f2] text-white border border-white/10 backdrop-blur-md transition shadow-lg"
              title="Previous Anime"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % spotlights.length)}
              className="p-2 rounded-xl bg-[#0b1622]/70 hover:bg-[#3db4f2] text-white border border-white/10 backdrop-blur-md transition shadow-lg"
              title="Next Anime"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hero Content Box */}
        <div className="relative z-10 p-5 sm:p-8 md:p-12 max-w-3xl space-y-3.5 sm:space-y-4">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3db4f2] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-white" />
              # {currentIndex + 1} Spotlight
            </span>

            {currentAnime.averageScore && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0b1622]/80 border border-white/10 text-emerald-400 text-xs font-bold backdrop-blur-xl">
                <span>{currentAnime.averageScore}% Score</span>
              </span>
            )}

            {currentAnime.format && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0b1622]/80 border border-white/10 text-slate-300 text-xs font-medium backdrop-blur-xl">
                <Tv className="w-3.5 h-3.5 text-[#3db4f2]" />
                {currentAnime.format.replace('_', ' ')} ·{' '}
                {currentAnime.episodes ? `${currentAnime.episodes} eps` : 'Airing'}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            {title}
          </h1>

          {/* Genres */}
          {currentAnime.genres && currentAnime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {currentAnime.genres.slice(0, 4).map((genre) => (
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
          <p className="text-xs sm:text-sm md:text-base text-slate-300 line-clamp-3 leading-relaxed max-w-2xl">
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
            <div className="flex items-center gap-1.5 pt-2">
              {spotlights.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-6 bg-[#3db4f2]'
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
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
