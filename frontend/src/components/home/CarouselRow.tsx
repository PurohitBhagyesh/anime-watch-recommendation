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

const CarouselRowComponent: React.FC<CarouselRowProps> = ({
  title,
  subtitle,
  icon: Icon,
  animes,
  viewAllLink,
  priority,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const track = scrollContainerRef.current;
    if (!track) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollAmount = Math.round(track.clientWidth * 0.78);
    track.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  };

  if (!animes || animes.length === 0) return null;

  return (
    <section className="space-y-3">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {Icon && (
              <span className="w-6 h-6 rounded-lg bg-[#151519] border border-[#232329] flex items-center justify-center flex-shrink-0">
                <Icon aria-hidden="true" className="w-3.5 h-3.5 text-white" />
              </span>
            )}
            <h2 className="text-base sm:text-xl font-bold text-white tracking-[-0.025em]">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-[13px] text-[#9a9aa6] mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-xs font-semibold text-[#9a9aa6] hover:text-white flex items-center gap-1 transition px-2.5 py-1.5 rounded-full hover:bg-[#151519] whitespace-nowrap"
            >
              <span>View all</span>
              <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Monochrome Navigation Controls */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full bg-[#0b0b0d] hover:bg-[#151519] border border-[#232329] hover:border-[#3a3a44] flex items-center justify-center text-[#9a9aa6] hover:text-white transition cursor-pointer active:scale-95"
              aria-label={`Scroll ${title} left`}
            >
              <ChevronLeft aria-hidden="true" className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full bg-[#0b0b0d] hover:bg-[#151519] border border-[#232329] hover:border-[#3a3a44] flex items-center justify-center text-[#9a9aa6] hover:text-white transition cursor-pointer active:scale-95"
              aria-label={`Scroll ${title} right`}
            >
              <ChevronRight aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Smooth Horizontal Scroll-Snap Slider */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2.5 sm:gap-3.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar touch-scroll-smooth"
      >
        {animes.map((anime, idx) => (
          <div
            key={anime?.id || idx}
            className="flex-shrink-0 w-[134px] min-[400px]:w-[148px] sm:w-[172px] md:w-[184px] snap-start"
          >
            <AnimeCard anime={anime} priority={priority && idx < 3} />
          </div>
        ))}
      </div>
    </section>
  );
};

export const CarouselRow = React.memo(CarouselRowComponent);
