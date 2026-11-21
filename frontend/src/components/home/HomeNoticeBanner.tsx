import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ChevronDown,
  Compass,
  Bookmark,
  ShieldCheck,
  Zap,
  Layers,
  X,
} from 'lucide-react';

export const HomeNoticeBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-5 pb-1">
      <div
        className={`rounded-2xl border transition-all duration-300 bg-[#0c0c0f] ${
          isOpen
            ? 'border-[#5360e6]/50 shadow-[0_8px_32px_rgba(83,96,230,0.12)]'
            : 'border-[#23232b] hover:border-[#383844]'
        }`}
      >
        {/* Clickable Header Bar */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="Toggle AnimeSenpai platform notice"
          className="w-full px-3.5 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between gap-3 text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Pulsing Luminous Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#5360e6]/15 text-[#5360e6] border border-[#5360e6]/30 flex-shrink-0">
              <Sparkles aria-hidden="true" className="w-3 h-3 animate-pulse" />
              <span>Notice</span>
            </span>

            {/* Headline Text */}
            <span className="text-xs sm:text-sm font-semibold text-[#f5f5f7] group-hover:text-white transition-colors truncate">
              Welcome to AnimeSenpai — Ad-free tracking, live AniList schedules & portable backups
            </span>
          </div>

          {/* Upside-Down Rotating Chevron (turns upside down when opened) */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="hidden min-[480px]:inline text-[11px] font-mono text-[#9a9aa6] group-hover:text-[#f5f5f7] transition-colors">
              {isOpen ? 'Close' : 'Read'}
            </span>
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#16161b] border border-[#23232b] flex items-center justify-center text-[#9a9aa6] group-hover:text-[#f5f5f7] transition-all duration-300 ${
                isOpen ? 'rotate-180 bg-[#5360e6]/15 border-[#5360e6]/40 text-[#5360e6]' : 'rotate-0'
              }`}
            >
              <ChevronDown aria-hidden="true" className="w-4 h-4 transition-transform duration-300" />
            </div>
          </div>
        </button>

        {/* Expandable Notice Body (revealed when user flips the > upside down) */}
        {isOpen && (
          <div className="px-3.5 sm:px-5 pb-4 sm:pb-5 pt-1 border-t border-[#23232b] space-y-4 animate-fadeIn">
            {/* Highlight Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#131317] border border-[#23232b] space-y-1.5">
                <div className="flex items-center gap-2 text-[#5360e6]">
                  <Zap aria-hidden="true" className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-bold text-[#f5f5f7]">Live AniList Engine</span>
                </div>
                <p className="text-[11px] text-[#9a9aa6] leading-relaxed">
                  Real-time broadcast countdowns, voice actors, staff credits, and official HD trailers for over 20,000+ titles.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#131317] border border-[#23232b] space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Layers aria-hidden="true" className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-bold text-[#f5f5f7]">Cross-Device Watchlist</span>
                </div>
                <p className="text-[11px] text-[#9a9aa6] leading-relaxed">
                  Track episodes with tactile 1-tap +1 steppers, score anime 1–10, and backup/restore with standard JSON.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#131317] border border-[#23232b] space-y-1.5">
                <div className="flex items-center gap-2 text-purple-400">
                  <ShieldCheck aria-hidden="true" className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-bold text-[#f5f5f7]">100% Free & Open</span>
                </div>
                <p className="text-[11px] text-[#9a9aa6] leading-relaxed">
                  Zero intrusive popups, no tracking paywalls, and guest offline access saved directly on your browser.
                </p>
              </div>
            </div>

            {/* Quick Actions & Close Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#1c1c24]">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/discover"
                  className="anilist-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full min-h-[36px]"
                >
                  <Compass aria-hidden="true" className="w-3.5 h-3.5" />
                  <span>Browse Catalog</span>
                </Link>
                <Link
                  to="/watchlist"
                  className="anilist-btn-secondary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full min-h-[36px]"
                >
                  <Bookmark aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
                  <span>Open Watchlist</span>
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[#9a9aa6] hover:text-[#f5f5f7] rounded-lg transition-colors cursor-pointer"
              >
                <X aria-hidden="true" className="w-3.5 h-3.5" />
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
