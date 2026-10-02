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
  priority?: boolean;
}

export const CarouselRow: React.FC<CarouselRowProps> = ({
  title,
  subtitle,
  icon: Icon,
  animes,
  viewAllLink,
  priority,
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
    <section className="space-y-3.5">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-[#3db4f2] flex-shrink-0" />}
            <h2 className="text-base sm:text-lg font-bold text-[#edf1f5] uppercase tracking-wider">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs text-[#8ba0b2] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-xs font-bold text-[#3db4f2] hover:text-[#2ba2e0] flex items-center gap-1 transition p-2 -my-2"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Navigation arrow buttons */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded anilist-btn-secondary text-[#edf1f5] hover:text-[#3db4f2] transition"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded anilist-btn-secondary text-[#edf1f5] hover:text-[#3db4f2] transition"
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
        className="flex gap-2.5 sm:gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar touch-scroll-smooth scroll-smooth"
      >
        {animes.map((anime, idx) => (
          <div
            key={anime.id}
            className="flex-shrink-0 w-32 min-[400px]:w-36 sm:w-44 md:w-48"
          >
            <AnimeCard anime={anime} priority={priority && idx < 3} />
          </div>
        ))}
      </div>
    </section>
  );
};
