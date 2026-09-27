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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10 gap-2.5 sm:gap-3">
        {FEATURED_GENRES.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={`/discover?genre=${encodeURIComponent(item.name)}`}
              className="anilist-card p-3 flex items-center gap-2.5 group hover:border-[#3db4f2]/40"
            >
              <div className="p-1.5 rounded bg-[#0b1622] text-[#3db4f2] group-hover:bg-[#3db4f2] group-hover:text-white transition">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-xs text-[#edf1f5] group-hover:text-[#3db4f2] transition truncate">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
