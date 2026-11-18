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
    <section className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#edf1f5] tracking-tight uppercase">
            Browse by Genre
          </h2>
          <p className="text-xs text-[#8ba0b2] mt-0.5">
            Filter the anime database by genre and themes
          </p>
        </div>
        <Link
          to="/discover"
          className="text-xs font-bold text-[#3db4f2] hover:text-[#2ba2e0] flex items-center gap-1 transition"
        >
          <span>All genres</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex overflow-x-auto no-scrollbar touch-scroll-smooth gap-2 pb-1 sm:grid sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10 sm:gap-3 sm:overflow-visible sm:pb-0">
        {FEATURED_GENRES.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={`/discover?genre=${encodeURIComponent(item.name)}`}
              className="anilist-card px-3.5 py-2.5 sm:p-3 flex items-center gap-2 sm:gap-2.5 group hover:border-[#3db4f2]/40 flex-shrink-0 snap-start min-h-[42px]"
            >
              <div className="p-1.5 rounded-lg bg-[#070d16]/80 text-[#3db4f2] group-hover:bg-[#3db4f2] group-hover:text-[#06101c] transition flex-shrink-0">
                <Icon aria-hidden="true" className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-xs text-[#edf1f5] group-hover:text-[#7dd3fc] transition whitespace-nowrap sm:truncate">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
