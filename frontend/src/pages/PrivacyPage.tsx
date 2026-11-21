import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Database, Trash2, Mail } from 'lucide-react';
import { useSEO, SITE_URL } from '../utils/seo';

export const PrivacyPage: React.FC = () => {
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: `${SITE_URL}/privacy` },
    ],
  };

  useSEO({
    title: 'Privacy Policy • AnimeSenpai',
    description: 'Read AnimeSenpai\'s privacy policy covering zero data selling, local storage, optional account sync, and instant permanent account deletion.',
    canonicalUrl: `${SITE_URL}/privacy`,
    jsonLd: breadcrumbs,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8 animate-fadeIn text-slate-300">
      <div className="space-y-3 pb-6 border-b border-[#232329]">
        <div className="liquid-glass-pill inline-flex items-center gap-2 px-3 py-1 rounded-full text-[#c8c8d2] text-xs font-bold">
          <Shield aria-hidden="true" className="w-3.5 h-3.5" />
          <span>Privacy & Data Rights</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Last updated: November 2026
        </p>
      </div>

      <div className="space-y-7 text-xs sm:text-sm leading-relaxed">
        <section className="anilist-card-static p-5 sm:p-6 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Lock aria-hidden="true" className="w-4 h-4 text-white" />
            1. Zero Data Selling & Privacy Protection
          </h2>
          <p>
            AnimeSenpai is built with a strict privacy-first architecture. We do not sell, rent, or trade personal user data, and we collect only the minimal data necessary to provide discovery and watchlist features.
          </p>
          <p className="text-slate-400">
            You can browse the full anime catalog, search 20,000+ titles, and watch official trailers without creating an account.
          </p>
        </section>

        <section className="anilist-card-static p-5 sm:p-6 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Database aria-hidden="true" className="w-4 h-4 text-white" />
            2. Local Storage & Optional Account Data
          </h2>
          <p>
            Your watchlist entries, episode progress, ratings, and browsing preferences are stored locally in your browser via <code>localStorage</code>. If you optionally create an account using email or Google Sign-In, only your chosen display name, email address, avatar, and favorite genre are stored via Firebase to maintain your profile.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
            <li>Export your complete watchlist as a portable JSON file at any time.</li>
            <li>Import an existing JSON backup or clear local browser data anytime.</li>
          </ul>
        </section>

        <section className="anilist-card-static p-5 sm:p-6 space-y-3 border-rose-500/20">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Trash2 aria-hidden="true" className="w-4 h-4 text-rose-400" />
            3. Right to Permanent Account & Data Deletion
          </h2>
          <p>
            We do not hold onto your personal information if you decide to leave. You can permanently delete your account at any time directly from{' '}
            <Link to="/settings" className="text-white hover:underline font-semibold">
              Account Settings → Delete Account
            </Link>
            .
          </p>
          <p className="text-slate-400">
            Deleting your account permanently removes your Firebase Authentication account, deletes your Firestore profile record, and erases local watchlist and preference data stored in your browser.
          </p>
        </section>

        <section className="anilist-card-static p-5 sm:p-6 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Eye aria-hidden="true" className="w-4 h-4 text-white" />
            4. Third-Party APIs & Embeds
          </h2>
          <p>
            To deliver live anime catalog data and official trailers, AnimeSenpai communicates directly with:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-xl bg-white/[0.04] border border-[#232329]">
              <h3 className="font-bold text-[#c8c8d2] text-xs uppercase tracking-wider mb-1 font-mono">
                AniList GraphQL API
              </h3>
              <p className="text-xs text-slate-400">
                Provides live anime titles, scores, rankings, airing countdowns, voice cast, relations, and external links.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.04] border border-[#232329]">
              <h3 className="font-bold text-[#c8c8d2] text-xs uppercase tracking-wider mb-1 font-mono">
                YouTube Privacy-Enhanced Mode
              </h3>
              <p className="text-xs text-slate-400">
                Official trailers load from <code>youtube-nocookie.com</code> only when you click Watch Trailer.
              </p>
            </div>
          </div>
        </section>

        <section className="anilist-card-static p-5 sm:p-6 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Shield aria-hidden="true" className="w-4 h-4 text-white" />
            5. Google Advertising & Cookie Policy
          </h2>
          <p>
            AnimeSenpai partners with third-party vendors, including Google, to serve advertisements on the site:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-1">
            <li>Google and third-party vendors use cookies to serve ads based on a user's prior visits to AnimeSenpai or other websites on the Internet.</li>
            <li>Google's use of advertising cookies enables it and its partners to serve ads to users based on their visits to this site and other sites across the web.</li>
            <li>
              You can opt out of personalized advertising at any time by visiting{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline font-semibold"
              >
                Google Ads Settings
              </a>
              {' '}or by visiting{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline font-semibold"
              >
                www.aboutads.info
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="anilist-card-static p-5 sm:p-6 space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Mail aria-hidden="true" className="w-4 h-4 text-white" />
            6. Contact for Privacy Requests
          </h2>
          <p>
            For any privacy inquiry or manual data deletion assistance, email{' '}
            <a href="mailto:support@animesenpai.online" className="text-white hover:underline font-semibold">
              support@animesenpai.online
            </a>
            .
          </p>
        </section>
      </div>

      <div className="pt-6 border-t border-[#232329] flex flex-wrap items-center justify-between gap-3 text-xs">
        <Link to="/" className="anilist-btn-secondary px-4 py-2 text-xs font-bold">
          ← Return Home
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-slate-400">
          <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
          <span>·</span>
          <Link to="/license" className="hover:text-white transition">Licenses</Link>
          <span>·</span>
          <Link to="/security" className="hover:text-white transition">Security</Link>
          <span>·</span>
          <Link to="/about" className="hover:text-white transition">About</Link>
        </div>
      </div>
    </div>
  );
};
