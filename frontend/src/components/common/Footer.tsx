import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  ArrowUp,
  Scale,
  AlertCircle,
  Mail,
  X,
} from 'lucide-react';
import { GENRE_LIST } from '../../api/anilist';
import { AppLogo } from './AppLogo';

export const Footer: React.FC = () => {
  const topGenres = GENRE_LIST.slice(0, 12);
  const issueDialogRef = useRef<HTMLDialogElement>(null);

  const scrollToTop = () => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  };

  // Safari fallback for light-dismiss on native <dialog>
  useEffect(() => {
    const dialog = issueDialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

    const isOutside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };

    let pressedOutside = false;
    const onDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const onUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e)) dialog.close();
    };

    dialog.addEventListener('pointerdown', onDown);
    dialog.addEventListener('pointerup', onUp);
    return () => {
      dialog.removeEventListener('pointerdown', onDown);
      dialog.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <>
      <footer className="mt-10 sm:mt-16 border-t border-[#232329] bg-[#000000] text-[#9a9aa6] text-sm relative overflow-x-clip">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-24 sm:pb-16 space-y-10">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Brand & Live Database Attribution */}
            <div className="lg:col-span-4 space-y-4">
              <Link to="/" className="inline-block">
                <AppLogo size="md" subtitle="" />
              </Link>
              <p className="text-[#9a9aa6] text-xs sm:text-[13px] leading-relaxed max-w-md">
                Independent, open-source anime discovery catalog and watchlist tracker. Real-time community scores, seasonal airing schedules, voice cast, and official trailers via AniList GraphQL.
              </p>

              {/* Live API Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b0b0d] border border-[#232329] text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[#9a9aa6]">Live data via</span>
                <a
                  href="https://anilist.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline font-semibold inline-flex items-center gap-1 transition"
                >
                  AniList GraphQL
                  <ExternalLink aria-hidden="true" className="w-3 h-3 text-[#666672]" />
                </a>
              </div>

              {/* Action Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href="https://github.com/PurohitBhagyesh/anime-watch-recommendation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 min-h-[36px] rounded-full anilist-btn-secondary text-xs inline-flex items-center gap-1.5"
                  aria-label="AnimeSenpai GitHub Repository"
                >
                  <svg aria-hidden="true" className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>GitHub</span>
                </a>
                <Link
                  to="/license"
                  className="px-3.5 py-2 min-h-[36px] rounded-full anilist-btn-secondary text-xs inline-flex items-center gap-1.5"
                >
                  <Scale aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
                  <span>MIT License</span>
                </Link>
                <button
                  type="button"
                  onClick={() => issueDialogRef.current?.showModal()}
                  className="px-3.5 py-2 min-h-[36px] rounded-full anilist-btn-secondary text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <AlertCircle aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
                  <span>Report Issue</span>
                </button>
              </div>
            </div>

            {/* Explore & Library */}
            <div className="grid grid-cols-2 gap-6 md:contents">
              <div className="lg:col-span-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white mb-3.5 font-mono">
                  Explore
                </h3>
                <ul className="space-y-2 text-[13px]">
                  <li>
                    <Link to="/" className="hover:text-white transition">
                      Home & Spotlight
                    </Link>
                  </li>
                  <li>
                    <Link to="/discover" className="hover:text-white transition">
                      Browse Catalog
                    </Link>
                  </li>
                  <li>
                    <Link to="/discover?seasonal=true" className="hover:text-white transition">
                      Seasonal Airing
                    </Link>
                  </li>
                  <li>
                    <Link to="/discover?sort=SCORE_DESC" className="hover:text-white transition">
                      Top 100 Anime
                    </Link>
                  </li>
                  <li>
                    <Link to="/discover?sort=TRENDING_DESC" className="hover:text-white transition">
                      Trending Now
                    </Link>
                  </li>
                  <li>
                    <Link to="/discover?sort=POPULARITY_DESC" className="hover:text-white transition">
                      All-Time Popular
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white mb-3.5 font-mono">
                  Library
                </h3>
                <ul className="space-y-2 text-[13px] mb-5">
                  <li>
                    <Link to="/watchlist" className="hover:text-white transition">
                      My Watchlist
                    </Link>
                  </li>
                  <li>
                    <Link to="/account" className="hover:text-white transition">
                      Account & Data
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="hover:text-white transition">
                      Sign In
                    </Link>
                  </li>
                </ul>

                <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[#666672] mb-2.5 font-mono">
                  Formats
                </h4>
                <div className="space-y-1.5 text-[13px]">
                  <Link to="/discover?format=TV" className="block hover:text-white transition">
                    TV Series
                  </Link>
                  <Link to="/discover?format=MOVIE" className="block hover:text-white transition">
                    Anime Movies
                  </Link>
                </div>
              </div>
            </div>

            {/* Genres & Legal */}
            <div className="lg:col-span-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white mb-3.5 font-mono">
                Genres
              </h3>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {topGenres.map((genre) => (
                  <Link
                    key={genre}
                    to={`/discover?genre=${encodeURIComponent(genre)}`}
                    className="text-xs px-2.5 py-1 rounded-full bg-[#0b0b0d] hover:bg-[#151519] border border-[#232329] hover:border-[#3a3a44] text-[#9a9aa6] hover:text-white transition"
                  >
                    {genre}
                  </Link>
                ))}
              </div>

              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[#666672] mb-2.5 font-mono">
                Legal & Security
              </h4>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                <Link to="/about" className="text-[#c8c8d2] hover:text-white transition">
                  About
                </Link>
                <span aria-hidden="true" className="text-[#3a3a44]">·</span>
                <Link to="/privacy" className="hover:text-white transition">
                  Privacy
                </Link>
                <span aria-hidden="true" className="text-[#3a3a44]">·</span>
                <Link to="/terms" className="hover:text-white transition">
                  Terms
                </Link>
                <span aria-hidden="true" className="text-[#3a3a44]">·</span>
                <Link to="/license" className="hover:text-white transition">
                  Licenses
                </Link>
                <span aria-hidden="true" className="text-[#3a3a44]">·</span>
                <Link to="/security" className="hover:text-white transition">
                  Security
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-[#232329] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#666672] text-center sm:text-left">
            <p>
              © {new Date().getFullYear()} AnimeSenpai (animesenpai.online) · MIT License · Data via AniList GraphQL.
            </p>

            <button
              type="button"
              onClick={scrollToTop}
              className="anilist-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[36px] text-xs cursor-pointer"
              title="Scroll to top"
            >
              <span>Back to Top</span>
              <ArrowUp aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
            </button>
          </div>
        </div>
      </footer>

      {/* OpenLid-Style Native Report an Issue Modal */}
      <dialog
        ref={issueDialogRef}
        {...({ closedby: 'any' } as Record<string, string>)}
        aria-labelledby="issue-modal-title"
        className="liquid-dialog"
      >
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 id="issue-modal-title" className="text-lg font-bold text-white tracking-tight">
                Report an Issue
              </h3>
              <p className="text-xs text-[#9a9aa6] leading-relaxed">
                Found a bug, broken anime metadata, or have a feature request? Pick how you’d like to report it.
              </p>
            </div>
            <button
              type="button"
              onClick={() => issueDialogRef.current?.close()}
              aria-label="Close modal"
              className="w-8 h-8 rounded-full bg-[#151519] border border-[#232329] hover:border-[#3a3a44] text-[#9a9aa6] hover:text-white flex items-center justify-center flex-shrink-0 cursor-pointer"
            >
              <X aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://github.com/PurohitBhagyesh/anime-watch-recommendation/issues/new/choose"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => issueDialogRef.current?.close()}
              className="p-4 rounded-2xl bg-[#151519] border border-[#232329] hover:border-[#3a3a44] transition space-y-1.5 block"
            >
              <div className="text-sm font-semibold text-white">GitHub Issue ↗</div>
              <p className="text-xs text-[#9a9aa6] leading-relaxed">
                Track bugs and feature requests publicly on our repository.
              </p>
            </a>

            <a
              href="mailto:contact@animesenpai.online?subject=AnimeSenpai%20Issue%20Report"
              onClick={() => issueDialogRef.current?.close()}
              className="p-4 rounded-2xl bg-[#151519] border border-[#232329] hover:border-[#3a3a44] transition space-y-1.5 block"
            >
              <div className="text-sm font-semibold text-white inline-flex items-center gap-1.5">
                <Mail aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
                <span>Direct Email</span>
              </div>
              <p className="text-xs text-[#9a9aa6] leading-relaxed">
                Reach out privately at contact@animesenpai.online.
              </p>
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
};
