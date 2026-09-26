import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { GENRE_LIST } from '../../api/anilist';

export const Footer: React.FC = () => {
  const topGenres = GENRE_LIST.slice(0, 8);

  return (
    <footer className="mt-20 border-t border-[#1c2333] bg-[#080a0f] text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Description */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                A
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Anime<span className="text-blue-500">Pulse</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Open anime directory and personal tracker indexing streaming availability, seasonal broadcasts, and franchise relations.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <span>Data provided by</span>
              <a
                href="https://anilist.co"
                target="_blank"
                rel="noreferrer"
                className="text-slate-300 hover:text-white inline-flex items-center gap-1 font-medium transition"
              >
                AniList GraphQL API <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 font-mono">
              Directory
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Featured
                </Link>
              </li>
              <li>
                <Link to="/discover" className="hover:text-white transition">
                  Discover Catalog
                </Link>
              </li>
              <li>
                <Link to="/discover?sort=POPULARITY_DESC" className="hover:text-white transition">
                  Popular All-Time
                </Link>
              </li>
              <li>
                <Link to="/discover?sort=SCORE_DESC" className="hover:text-white transition">
                  Top 100 Ranked
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="hover:text-white transition">
                  My Watchlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 font-mono">
              Legal & Info
            </h3>
            <ul className="space-y-2 text-sm mb-4">
              <li>
                <Link to="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
            </ul>

            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 font-mono">
              Genres
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {topGenres.map((genre) => (
                <Link
                  key={genre}
                  to={`/discover?genre=${encodeURIComponent(genre)}`}
                  className="text-xs px-2 py-0.5 rounded bg-[#111622] hover:bg-[#1c2438] hover:text-slate-200 border border-[#212a3d] text-slate-400 transition"
                >
                  {genre}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#1c2333] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AnimePulse. Non-commercial anime index.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-slate-400 transition">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-400 transition">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
