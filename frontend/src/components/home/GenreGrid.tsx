import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sword,
  Heart,
  Rocket,
  Sparkles,
  Ghost,
  Compass,
  Laugh,
  Music,
  Trophy,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface GenreItem {
  name: string;
  icon: React.ElementType;
}

const FEATURED_GENRES: GenreItem[] = [
  { name: 'Action', icon: Sword },
  { name: 'Romance', icon: Heart },
  { name: 'Fantasy', icon: Sparkles },
  { name: 'Sci-Fi', icon: Rocket },
  { name: 'Comedy', icon: Laugh },
  { name: 'Adventure', icon: Compass },
  { name: 'Horror', icon: Ghost },
  { name: 'Sports', icon: Trophy },
  { name: 'Psychological', icon: ShieldAlert },
  { name: 'Music', icon: Music },
];

export const GenreGrid: React.FC = () => {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-white tracking-[-0.025em]">
            Browse by Genre
          </h2>
          <p className="text-xs sm:text-[13px] text-[#9a9aa6] mt-1">
            Filter the AniList catalog by theme and category
          </p>
        </div>
        <Link
          to="/discover"
          className="text-xs font-semibold text-[#9a9aa6] hover:text-white flex items-center gap-1 transition px-2.5 py-1.5 rounded-full hover:bg-[#151519] whitespace-nowrap"
        >
          <span>All genres</span>
          <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex overflow-x-auto no-scrollbar touch-scroll-smooth gap-2 pb-1 sm:grid sm:grid-cols-2 md:grid-cols-5 sm:gap-2.5 sm:overflow-visible sm:pb-0">
        {FEATURED_GENRES.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={`/discover?genre=${encodeURIComponent(item.name)}`}
              className="anilist-card px-3.5 py-2.5 sm:px-3.5 sm:py-3 flex items-center gap-2.5 group flex-shrink-0 snap-start min-h-[44px]"
            >
              <div className="w-7 h-7 rounded-lg bg-[#151519] border border-[#232329] text-[#9a9aa6] group-hover:bg-white group-hover:text-black group-hover:border-white transition flex items-center justify-center flex-shrink-0">
                <Icon aria-hidden="true" className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-xs sm:text-[13px] text-[#c8c8d2] group-hover:text-white transition whitespace-nowrap sm:truncate">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
