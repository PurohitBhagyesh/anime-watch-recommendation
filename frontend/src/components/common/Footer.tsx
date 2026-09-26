import React from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  Heart,
  ArrowUp,
  Sparkles,
  Compass,
  Bookmark,
  Zap,
  Shield,
  Activity,
  Tv,
  Film,
} from 'lucide-react';
import { GENRE_LIST } from '../../api/anilist';
import { AppLogo } from './AppLogo';

export const Footer: React.FC = () => {
  const topGenres = GENRE_LIST.slice(0, 12);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="mt-20 border-t border-white/[0.08] bg-[#070e17] text-slate-400 text-sm relative">
      {/* Subtle top glowing line effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-[#3db4f2]/40 to-transparent" />

      {/* Feature Highlights Strip */}
      <div className="border-b border-white/[0.06] bg-[#09121d]/60">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#3db4f2]/10 border border-[#3db4f2]/20 text-[#3db4f2] flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">AniList Powered</p>
                <p className="text-[11px] text-slate-500">Real-time GraphQL sync</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex-shrink-0">
                <Bookmark className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Smart Watchlist</p>
                <p className="text-[11px] text-slate-500">Custom tracking & scores</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex-shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Deep Discovery</p>
                <p className="text-[11px] text-slate-500">Seasonal anime & voice cast</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex-shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Ad-Free & Fast</p>
                <p className="text-[11px] text-slate-500">Clean, privacy-first UI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Directory */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 pt-12 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 mb-12">
          {/* Brand & Mission Column (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block">
              <AppLogo size="md" subtitle="" />
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md">
              Modern anime discovery and personal tracking platform powered by AniList. Track your watching progress, explore seasonal anime, discover voice actors, and view rich statistics.
            </p>

            {/* Live API Status indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101a28] border border-white/10 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-medium">Data via</span>
              <a
                href="https://anilist.co"
                target="_blank"
                rel="noreferrer"
                className="text-[#3db4f2] hover:underline font-bold inline-flex items-center gap-1 transition"
              >
                AniList GraphQL API
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Social / External Links */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-[#151f2e] hover:bg-[#1f2d42] text-slate-300 hover:text-white border border-white/10 transition flex items-center justify-center"
                title="GitHub Repository"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://anilist.co"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg bg-[#151f2e] hover:bg-[#1f2d42] text-slate-300 hover:text-[#3db4f2] border border-white/10 text-xs font-bold transition inline-flex items-center gap-1.5"
                title="AniList Official"
              >
                <Activity className="w-3.5 h-3.5 text-[#3db4f2]" />
                <span>AniList.co</span>
              </a>
            </div>
          </div>

          {/* Quick Navigation Column (Span 2) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5 font-mono flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#3db4f2]" />
              <span>Explore</span>
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/" className="hover:text-[#3db4f2] transition flex items-center gap-1.5">
                  Home / Spotlight
                </Link>
              </li>
              <li>
                <Link to="/discover" className="hover:text-[#3db4f2] transition flex items-center gap-1.5">
                  Browse Catalog
                </Link>
              </li>
              <li>
                <Link to="/discover?seasonal=true" className="hover:text-[#3db4f2] transition flex items-center gap-1.5">
                  Seasonal Airing
                </Link>
              </li>
              <li>
                <Link to="/discover?sort=SCORE_DESC" className="hover:text-[#3db4f2] transition flex items-center gap-1.5">
                  Top 100 Anime
                </Link>
              </li>
              <li>
                <Link to="/discover?sort=TRENDING_DESC" className="hover:text-[#3db4f2] transition flex items-center gap-1.5">
                  Trending Now
                </Link>
              </li>
              <li>
                <Link to="/discover?sort=POPULARITY_DESC" className="hover:text-[#3db4f2] transition flex items-center gap-1.5">
                  All Time Popular
                </Link>
              </li>
            </ul>
          </div>

          {/* Formats & Library Column (Span 2) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5 font-mono flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-[#3db4f2]" />
              <span>My Library</span>
            </h3>
            <ul className="space-y-2 text-xs font-medium mb-4">
              <li>
                <Link to="/watchlist" className="hover:text-[#3db4f2] transition">
                  My Anime List
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#3db4f2] transition">
                  User Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-[#3db4f2] transition">
                  Create Account
                </Link>
              </li>
            </ul>

            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
              Formats
            </h4>
            <div className="space-y-1.5 text-xs">
              <Link
                to="/discover?format=TV"
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition"
              >
                <Tv className="w-3 h-3 text-[#3db4f2]" />
                <span>TV Series</span>
              </Link>
              <Link
                to="/discover?format=MOVIE"
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition"
              >
                <Film className="w-3 h-3 text-purple-400" />
                <span>Anime Movies</span>
              </Link>
            </div>
          </div>

          {/* Top Genres Column (Span 4) */}
          <div className="lg:col-span-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#3db4f2]" />
              <span>Popular Genres</span>
            </h3>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {topGenres.map((genre) => (
                <Link
                  key={genre}
                  to={`/discover?genre=${encodeURIComponent(genre)}`}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-[#151f2e] hover:bg-[#1f2d42] hover:border-[#3db4f2]/40 hover:text-white border border-white/[0.08] text-slate-300 transition font-medium shadow-sm"
                >
                  {genre}
                </Link>
              ))}
            </div>

            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
              Legal & Policy
            </h4>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <Link to="/privacy" className="hover:text-[#3db4f2] transition">
                Privacy Policy
              </Link>
              <span>·</span>
              <Link to="/terms" className="hover:text-[#3db4f2] transition">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Sub-footer Bar */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Voltaku. Non-commercial tracker powered by AniList GraphQL.</p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Crafted with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>for anime fans</span>
            </div>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151f2e] hover:bg-[#1f2d42] text-slate-300 hover:text-white border border-white/10 transition text-xs font-semibold group"
              title="Scroll to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#3db4f2] group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

