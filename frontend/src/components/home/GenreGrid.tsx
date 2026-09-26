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
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Browse by Genre
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Filter the anime catalog by genre and themes
          </p>
        </div>
        <Link
          to="/discover"
          className="text-xs font-bold text-[#818cf8] hover:text-[#c084fc] flex items-center gap-1 transition"
        >
          <span>All genres</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10 gap-2.5 sm:gap-3 lg:gap-4">
        {FEATURED_GENRES.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={`/discover?genre=${encodeURIComponent(item.name)}`}
              className="royal-card p-3.5 flex items-center gap-3 group"
            >
              <div className="p-2 rounded-lg bg-[#080d1a] text-[#818cf8] group-hover:bg-gradient-to-br group-hover:from-[#6366f1] group-hover:to-[#a855f7] group-hover:text-white transition shadow-sm">
                <Icon className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs sm:text-sm text-slate-200 group-hover:text-white transition">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
