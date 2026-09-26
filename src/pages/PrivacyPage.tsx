import React from 'react';
import { Shield, Lock, Eye, Database } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fadeIn text-slate-300">
      <div className="space-y-3 pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>Legal & Transparency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-400">
          Last updated: September 26, 2026
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-400" />
            1. Overview & Data Ownership
          </h2>
          <p>
            AnimePulse is built with privacy-first principles. We do not require you to create an account, enter an email address, or provide any personally identifiable information (PII) to discover anime, view trailers, or manage your personal watchlist.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            2. Local Storage and Client-Side Data
          </h2>
          <p>
            All watchlist data (including your watch status, custom episode progress, and personal ratings) is stored exclusively in your browser's local storage (<code className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-200 text-xs font-mono">localStorage</code>).
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li>We do not sync or upload your watchlist to any central database or telemetry server.</li>
            <li>You can export your watchlist as a JSON file at any time for backup.</li>
            <li>You can clear your watchlist data at any time via the Watchlist dashboard or by clearing your browser cache.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" />
            3. Third-Party Services & API Queries
          </h2>
          <p>
            To provide live anime metadata, schedules, streaming links, and official trailers, the application connects to the following public endpoints:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-1">AniList GraphQL API</h3>
              <p className="text-xs text-slate-400">Used to fetch titles, descriptions, character cast, and verified streaming provider links.</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-1">YouTube Embedded Player</h3>
              <p className="text-xs text-slate-400">Used with privacy-enhanced mode (<code className="text-[11px] font-mono">youtube-nocookie.com</code>) to display official trailers only when triggered by user click.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Cookies & Analytics</h2>
          <p>
            AnimePulse does not use tracking cookies, advertising trackers, or third-party behavioral analytics scripts.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">5. Contact Information</h2>
          <p>
            For questions regarding this policy or data management, please open an issue in the project repository.
          </p>
        </section>
      </div>
    </div>
  );
};
