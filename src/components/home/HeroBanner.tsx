import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Star, Check, Plus, Tv, TrendingUp } from 'lucide-react';
import type { AnimeCardData } from '../../api/types';
import { TrailerModal } from '../common/TrailerModal';
import { useWatchlist } from '../../context/WatchlistContext';

interface HeroBannerProps {
  anime: AnimeCardData | null;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ anime }) => {
  const [trailerOpen, setTrailerOpen] = useState(false);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  if (!anime) return null;

  const title = anime.title.english || anime.title.romaji || anime.title.userPreferred;
  const inWatchlist = isInWatchlist(anime.id);

  // Clean synopsis
  const cleanDescription = anime.description
    ? anime.description.replace(/<[^>]*>?/gm, '').replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    : 'No description available for this title.';

  const bgImage = anime.bannerImage || anime.coverImage.extraLarge || anime.coverImage.large;

  return (
    <>
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden min-h-[440px] md:min-h-[520px] flex items-end border border-white/10 shadow-2xl group bg-[#090d16]">
        {/* Background Image Banner */}
        <div className="absolute inset-0 z-0">
          <img
            src={bgImage}
            alt={title}
            className="w-full h-full object-cover object-center filter brightness-[0.55] contrast-[1.05] group-hover:scale-102 transition-transform duration-1000 ease-out"
          />
          {/* Multi-layered Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-[#05070b]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070b] via-[#05070b]/60 to-transparent" />
        </div>

        {/* Ambient Color Glow */}
        {anime.coverImage.color && (
          <div
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ backgroundColor: anime.coverImage.color }}
          />
        )}

        {/* Hero Content */}
        <div className="relative z-10 p-5 sm:p-8 md:p-12 max-w-3xl space-y-3.5 sm:space-y-4">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3]/90 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border border-white/15">
              <TrendingUp className="w-3.5 h-3.5" />
              Featured Spotlight
            </span>

            {anime.averageScore && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-amber-300 text-xs font-bold backdrop-blur-xl">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                {(anime.averageScore / 10).toFixed(1)} Rating
              </span>
            )}

            {anime.format && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-slate-300 text-xs font-medium backdrop-blur-xl">
                <Tv className="w-3.5 h-3.5 text-[#0071e3]" />
                {anime.format.replace('_', ' ')} · {anime.episodes ? `${anime.episodes} eps` : 'Airing'}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
            {title}
          </h1>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {anime.genres.slice(0, 4).map((genre) => (
                <span
                  key={genre}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.07] border border-white/10 text-slate-200 font-medium backdrop-blur-md"
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

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
            {anime.trailer?.id && (
              <button
                onClick={() => setTrailerOpen(true)}
                className="apple-btn-primary flex items-center gap-2 px-5 py-2.5 sm:py-3 text-xs sm:text-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch Trailer</span>
              </button>
            )}

            <Link
              to={`/anime/${anime.id}`}
              className="apple-btn-secondary flex items-center gap-2 px-4 py-2.5 sm:py-3 text-xs sm:text-sm"
            >
              <Info className="w-4 h-4 text-[#2997ff]" />
              <span>Details</span>
            </Link>

            <button
              onClick={() => {
                if (inWatchlist) {
                  removeFromWatchlist(anime.id);
                } else {
                  addToWatchlist(anime, 'plan_to_watch');
                }
              }}
              className={`flex items-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl font-medium text-xs sm:text-sm border transition backdrop-blur-md ${
                inWatchlist
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-white/[0.07] border-white/10 text-slate-300 hover:bg-white/[0.12]'
              }`}
            >
              {inWatchlist ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-slate-400" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailer={anime.trailer}
        title={title}
      />
    </>
  );
};
