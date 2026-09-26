import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import type { AnimeCardData } from '../../api/types';
import { AnimeCard } from '../common/AnimeCard';

interface CarouselRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  animes: AnimeCardData[];
  viewAllLink?: string;
}

export const CarouselRow: React.FC<CarouselRowProps> = ({
  title,
  subtitle,
  icon: Icon,
  animes,
  viewAllLink,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!animes || animes.length === 0) return null;

  return (
    <section className="space-y-3">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-[#3db4f2] flex-shrink-0" />}
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-xs font-bold text-[#3db4f2] hover:text-[#00a8ff] flex items-center gap-1 transition pr-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Navigation arrow buttons */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg anilist-btn-secondary text-slate-300 hover:text-white transition"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg anilist-btn-secondary text-slate-300 hover:text-white transition"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth"
      >
        {animes.map((anime) => (
          <div
            key={anime.id}
            className="flex-shrink-0 w-36 sm:w-44 md:w-48"
          >
            <AnimeCard anime={anime} />
          </div>
        ))}
      </div>
    </section>
  );
};
