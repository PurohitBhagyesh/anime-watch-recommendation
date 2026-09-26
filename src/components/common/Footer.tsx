import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Heart } from 'lucide-react';
import { GENRE_LIST } from '../../api/anilist';

export const Footer: React.FC = () => {
  const topGenres = GENRE_LIST.slice(0, 10);

  return (
    <footer className="mt-20 border-t border-white/[0.06] bg-[#070e17] text-slate-400 text-sm">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Description */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#3db4f2] to-[#0084ff] flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-[#3db4f2]/20 border border-white/20">
                AL
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Ani<span className="text-[#3db4f2]">Pulse</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              Modern anime discovery and personal tracking platform inspired by AniList. Track your watching progress, explore seasonal anime, discover voice actors, and view detailed statistics.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <span>Data powered by</span>
              <a
                href="https://anilist.co"
                target="_blank"
                rel="noreferrer"
                className="text-[#3db4f2] hover:underline inline-flex items-center gap-1 font-bold transition"
              >
                AniList GraphQL API <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 font-mono">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link to="/" className="hover:text-[#3db4f2] transition">
                  Home / Spotlight
                </Link>
              </li>
              <li>
                <Link to="/discover" className="hover:text-[#3db4f2] transition">
                  Browse Catalog
                </Link>
              </li>
              <li>
                <Link to="/discover?seasonal=true" className="hover:text-[#3db4f2] transition">
                  Seasonal Airing
                </Link>
              </li>
              <li>
                <Link to="/discover?sort=SCORE_DESC" className="hover:text-[#3db4f2] transition">
                  Top 100 Anime
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="hover:text-[#3db4f2] transition">
                  My Anime List
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Popular Genres */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 font-mono">
              Top Genres
            </h3>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {topGenres.map((genre) => (
                <Link
                  key={genre}
                  to={`/discover?genre=${encodeURIComponent(genre)}`}
                  className="text-[11px] px-2 py-0.5 rounded bg-[#151f2e] hover:bg-[#1f2d42] hover:text-white border border-white/10 text-slate-300 transition font-medium"
                >
                  {genre}
                </Link>
              ))}
            </div>

            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>
                <Link to="/privacy" className="hover:text-slate-300 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-slate-300 transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AniPulse. An AniList-inspired anime tracker.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted for anime fans</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
