import React from 'react';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fadeIn text-slate-300">
      <div className="space-y-3 pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#3db4f2]/10 border border-[#3db4f2]/30 text-[#3db4f2] text-xs font-bold">
          <FileText className="w-3.5 h-3.5" />
          <span>Terms & Conditions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Last updated: September 2026
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using AniPulse, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please discontinue use of the site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            2. Intellectual Property & Fair Use
          </h2>
          <p>
            All anime titles, artwork, character images, studio names, and video materials displayed on AniPulse remain the property of their respective copyright holders, authors, and production studios.
          </p>
          <p>
            AniPulse is a non-commercial index and personal tracker created for educational, research, and entertainment purposes under fair use guidelines.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Third-Party Links & Streaming Providers</h2>
          <p>
            AniPulse indexes official streaming links (such as Crunchyroll, Netflix, Hulu, Disney+, Amazon Prime Video). We do not host, store, or stream copyrighted video files on our own servers. Clicking external streaming links will redirect you to third-party services governed by their respective terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. User Watchlist Responsibility</h2>
          <p>
            You are solely responsible for maintaining backups of your local watchlist data via the Export Backup feature.
          </p>
        </section>
      </div>
    </div>
  );
};
