import React from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  ArrowUp,
  Sparkles,
  Compass,
  Bookmark,
  Activity,
  Tv,
  Film,
  Scale,
} from 'lucide-react';
import { GENRE_LIST } from '../../api/anilist';
import { AppLogo } from './AppLogo';
import { SupportUpiCard } from './SupportUpiCard';

export const Footer: React.FC = () => {
  const topGenres = GENRE_LIST.slice(0, 12);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="mt-12 sm:mt-20 border-t border-white/[0.08] bg-[#060b12]/90 backdrop-blur-xl text-slate-400 text-sm relative overflow-x-clip">
      {/* Subtle top specular hairline */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-8 sm:pb-10 space-y-10">
        {/* Voluntary Developer Support Bar (UPI: Purohit2009@fam) */}
        <SupportUpiCard variant="compact" />

        {/* Main Footer Links & Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand & Live Database Attribution (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block">
              <AppLogo size="md" subtitle="" />
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md">
              Independent, open-source anime discovery catalog and watchlist tracker. Real-time ratings, seasonal airing schedules, voice cast, and official trailers via AniList GraphQL.
            </p>

            {/* Live API Attribution Pill */}
            <div className="liquid-glass-pill inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-slate-300 font-medium">Live data via</span>
              <a
                href="https://anilist.co"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7dd3fc] hover:underline font-bold inline-flex items-center gap-1 transition"
              >
                AniList GraphQL
                <ExternalLink aria-hidden="true" className="w-3 h-3" />
              </a>
            </div>

            {/* External Links */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="https://github.com/PurohitBhagyesh/anime-watch-recommendation"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 min-w-[38px] min-h-[38px] rounded-xl anilist-btn-secondary text-slate-300 hover:text-white flex items-center justify-center"
                title="GitHub Repository"
                aria-label="AnimeSenpai GitHub Repository"
              >
                <svg aria-hidden="true" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://anilist.co"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 min-h-[38px] rounded-xl anilist-btn-secondary text-slate-300 hover:text-[#7dd3fc] text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Activity aria-hidden="true" className="w-3.5 h-3.5 text-[#3db4f2]" />
                <span>AniList.co</span>
              </a>
              <Link
                to="/license"
                className="px-3 py-2 min-h-[38px] rounded-xl anilist-btn-secondary text-slate-300 hover:text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Scale aria-hidden="true" className="w-3.5 h-3.5 text-[#3db4f2]" />
                <span>MIT License</span>
              </Link>
            </div>
          </div>

          {/* Explore & Library (2-col on mobile, separate cols on lg+) */}
          <div className="grid grid-cols-2 gap-6 md:contents">
            <div className="lg:col-span-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5 font-mono flex items-center gap-1.5">
                <Compass aria-hidden="true" className="w-3.5 h-3.5 text-[#3db4f2]" />
                <span>Explore</span>
              </h3>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <Link to="/" className="hover:text-[#7dd3fc] transition">
                    Home & Spotlight
                  </Link>
                </li>
                <li>
                  <Link to="/discover" className="hover:text-[#7dd3fc] transition">
                    Browse Catalog
                  </Link>
                </li>
                <li>
                  <Link to="/discover?seasonal=true" className="hover:text-[#7dd3fc] transition">
                    Seasonal Airing
                  </Link>
                </li>
                <li>
                  <Link to="/discover?sort=SCORE_DESC" className="hover:text-[#7dd3fc] transition">
                    Top 100 Anime
                  </Link>
                </li>
                <li>
                  <Link to="/discover?sort=TRENDING_DESC" className="hover:text-[#7dd3fc] transition">
                    Trending Now
                  </Link>
                </li>
                <li>
                  <Link to="/discover?sort=POPULARITY_DESC" className="hover:text-[#7dd3fc] transition">
                    All-Time Popular
                  </Link>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5 font-mono flex items-center gap-1.5">
                <Bookmark aria-hidden="true" className="w-3.5 h-3.5 text-[#3db4f2]" />
                <span>Library</span>
              </h3>
              <ul className="space-y-2 text-xs font-medium mb-4">
                <li>
                  <Link to="/watchlist" className="hover:text-[#7dd3fc] transition">
                    My Watchlist
                  </Link>
                </li>
                <li>
                  <Link to="/account" className="hover:text-[#7dd3fc] transition">
                    Account & Data
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[#7dd3fc] transition">
                    Sign In
                  </Link>
                </li>
              </ul>

              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                Formats
              </h4>
              <div className="space-y-1.5 text-xs">
                <Link
                  to="/discover?format=TV"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition py-1"
                >
                  <Tv aria-hidden="true" className="w-3 h-3 text-[#3db4f2]" />
                  <span>TV Series</span>
                </Link>
                <Link
                  to="/discover?format=MOVIE"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition py-1"
                >
                  <Film aria-hidden="true" className="w-3 h-3 text-[#3db4f2]" />
                  <span>Anime Movies</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Popular Genres & Legal (Span 4) */}
          <div className="lg:col-span-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5 font-mono flex items-center gap-1.5">
              <Sparkles aria-hidden="true" className="w-3.5 h-3.5 text-[#3db4f2]" />
              <span>Genres</span>
            </h3>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {topGenres.map((genre) => (
                <Link
                  key={genre}
                  to={`/discover?genre=${encodeURIComponent(genre)}`}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.11] border border-white/[0.08] hover:border-[#3db4f2]/40 text-slate-300 hover:text-white transition font-medium"
                >
                  {genre}
                </Link>
              ))}
            </div>

            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
              Legal & Transparency
            </h4>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-slate-400">
              <Link to="/about" className="hover:text-[#7dd3fc] transition font-medium text-slate-300">
                About
              </Link>
              <span aria-hidden="true">·</span>
              <Link to="/privacy" className="hover:text-[#7dd3fc] transition">
                Privacy Policy
              </Link>
              <span aria-hidden="true">·</span>
              <Link to="/terms" className="hover:text-[#7dd3fc] transition">
                Terms of Service
              </Link>
              <span aria-hidden="true">·</span>
              <Link to="/license" className="hover:text-[#7dd3fc] transition">
                Licenses
              </Link>
              <span aria-hidden="true">·</span>
              <Link to="/security" className="hover:text-[#7dd3fc] transition">
                Security
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Sub-footer Bar */}
        <div className="pt-6 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} AnimeSenpai (animesenpai.online). Licensed under MIT. Anime metadata via AniList GraphQL.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="liquid-glass-pill flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-full text-slate-200 hover:text-white text-xs font-semibold group cursor-pointer"
            title="Scroll to top"
          >
            <span>Back to Top</span>
            <ArrowUp aria-hidden="true" className="w-3.5 h-3.5 text-[#3db4f2] group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
};
