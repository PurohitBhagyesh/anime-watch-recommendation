import React from 'react';
import { Link } from 'react-router-dom';
import { Sword, Heart, Rocket, Sparkles, Ghost, Compass, Laugh, Music, Trophy, ShieldAlert } from 'lucide-react';

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
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Browse by Genre
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Filter catalog by theme and genre tags
          </p>
        </div>
        <Link
          to="/discover"
          className="text-xs font-semibold text-[#2997ff] hover:text-[#0071e3] transition"
        >
          All genres →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
        {FEATURED_GENRES.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={`/discover?genre=${encodeURIComponent(item.name)}`}
              className="apple-card-interactive p-3.5 rounded-xl sm:rounded-2xl flex items-center gap-3 group"
            >
              <div className="p-2 rounded-lg bg-white/[0.06] text-slate-300 group-hover:text-[#2997ff] transition">
                <Icon className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-white transition">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
