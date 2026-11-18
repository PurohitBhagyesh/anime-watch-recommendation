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
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {Icon && <Icon aria-hidden="true" className="w-4 h-4 text-[#3db4f2] flex-shrink-0" />}
            <h2 className="text-sm sm:text-lg font-bold text-[#edf1f5] uppercase tracking-wider">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs text-[#8ba0b2] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-xs font-bold text-[#3db4f2] hover:text-[#2ba2e0] flex items-center gap-1 transition p-2 -my-2 whitespace-nowrap"
            >
              <span>View All</span>
              <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Liquid Glass Navigation arrow buttons */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="liquid-glass-pill w-8 h-8 rounded-full flex items-center justify-center text-[#edf1f5] hover:text-[#3db4f2] transition cursor-pointer active:scale-95"
              aria-label={`Scroll ${title} left`}
            >
              <ChevronLeft aria-hidden="true" className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="liquid-glass-pill w-8 h-8 rounded-full flex items-center justify-center text-[#edf1f5] hover:text-[#3db4f2] transition cursor-pointer active:scale-95"
              aria-label={`Scroll ${title} right`}
            >
              <ChevronRight aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Smooth Horizontal Slider Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2.5 sm:gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar touch-scroll-smooth scroll-smooth"
      >
        {animes.map((anime, idx) => (
          <div
            key={anime?.id || idx}
            className="flex-shrink-0 w-32 min-[400px]:w-36 sm:w-44 md:w-48 snap-start"
          >
            <AnimeCard anime={anime} priority={priority && idx < 3} />
          </div>
        ))}
      </div>
    </section>
  );
};
