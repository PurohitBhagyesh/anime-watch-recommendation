import React from 'react';
import { Shield, Lock, Eye, Database } from 'lucide-react';
import { useSEO, SITE_URL } from '../utils/seo';

export const PrivacyPage: React.FC = () => {
  useSEO({
    title: 'Privacy Policy • AnimeSenpai',
    description: 'Read AnimeSenpai\'s privacy policy regarding user data ownership, cookies, and local storage usage.',
    canonicalUrl: `${SITE_URL}/privacy`,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fadeIn text-slate-300">
      <div className="space-y-3 pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3db4f2]/10 border border-[#3db4f2]/30 text-[#3db4f2] text-xs font-bold">
          <Shield className="w-3.5 h-3.5" />
          <span>Privacy & Transparency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Last updated: September 2026
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#3db4f2]" />
            1. Overview & Data Ownership
          </h2>
          <p>
            This application is built with privacy-first principles. We do not require invasive tracking or data selling. Track your watching progress, view trailers, and manage your personal anime list seamlessly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-[#3db4f2]" />
            2. Local Storage and Database Sync
          </h2>
          <p>
            Your watchlist data (including your watch status, custom episode progress, scores, and notes) is stored securely in your browser's storage and synchronized with your authenticated account database.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li>You can export your watchlist as a JSON file at any time for complete backups.</li>
            <li>You can import an existing JSON watchlist to restore your anime collection instantly.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#3db4f2]" />
            3. Third-Party Services & API Queries
          </h2>
          <p>
            To provide live anime metadata, schedules, streaming links, and official trailers, the application connects to the following endpoints:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-xl anilist-card-static">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-1 font-mono text-[#3db4f2]">AniList GraphQL API</h3>
              <p className="text-xs text-slate-400">Used to fetch titles, descriptions, seasonal ranks, character cast, voice actors, and verified streaming provider links.</p>
            </div>
            <div className="p-4 rounded-xl anilist-card-static">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-1 font-mono text-[#3db4f2]">YouTube Privacy-Enhanced Player</h3>
              <p className="text-xs text-slate-400">Used with privacy-enhanced mode (<code className="text-[11px] font-mono text-[#3db4f2]">youtube-nocookie.com</code>) to display official trailers only when triggered by user click.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Cookies & Tracking</h2>
          <p>
            We do not use tracking beacons or third-party behavioral advertising scripts.
          </p>
        </section>
      </div>
    </div>
  );
};

