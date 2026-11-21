import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, AlertCircle, Scale, Heart } from 'lucide-react';
import { useSEO, SITE_URL } from '../utils/seo';

export const TermsPage: React.FC = () => {
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Terms of Service', item: `${SITE_URL}/terms` },
    ],
  };

  useSEO({
    title: 'Terms of Service • AnimeSenpai',
    description: 'Read the Terms of Service, copyright compliance, voluntary donation terms, and MIT license disclaimers for AnimeSenpai.',
    canonicalUrl: `${SITE_URL}/terms`,
    jsonLd: breadcrumbs,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8 animate-fadeIn text-slate-300">
      <div className="space-y-3 pb-6 border-b border-[#232329]">
        <div className="liquid-glass-pill inline-flex items-center gap-2 px-3 py-1 rounded-full text-[#c8c8d2] text-xs font-bold">
          <FileText aria-hidden="true" className="w-3.5 h-3.5" />
          <span>Terms & Legal Notice</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Last updated: November 2026
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
        <section className="anilist-card-static p-5 sm:p-6 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle aria-hidden="true" className="w-4 h-4 text-emerald-400" />
            1. Acceptance & Independent Status
          </h2>
          <p>
            By accessing or using AnimeSenpai (<code>animesenpai.online</code>), you agree to these Terms of Service. AnimeSenpai is an independent, non-commercial open-source anime discovery catalog and personal watchlist tracker. It is not affiliated with anime news blogs, streaming mirrors, or third-party commercial networks.
          </p>
        </section>

        <section className="anilist-card-static p-5 sm:p-6 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <AlertCircle aria-hidden="true" className="w-4 h-4 text-amber-400" />
            2. Intellectual Property, Copyright & No Video Hosting
          </h2>
          <p>
            AnimeSenpai does not host, upload, or stream copyrighted anime episodes or video files. All metadata is retrieved in real time from the public AniList GraphQL API, and promotional trailers are played exclusively through official YouTube embeds.
          </p>
          <p className="text-slate-400">
            All anime titles, cover artwork, character portraits, studio names, and trademarks remain the property of their respective copyright holders. For DMCA or takedown notices, contact{' '}
            <a href="mailto:support@animesenpai.online" className="text-white hover:underline font-semibold">
              support@animesenpai.online
            </a>
            .
          </p>
        </section>

        <section className="anilist-card-static p-5 sm:p-6 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Scale aria-hidden="true" className="w-4 h-4 text-white" />
            3. User Accounts, Data Ownership & Deletion
          </h2>
          <p>
            You retain full ownership of your personal watchlist and may export it as JSON at any time. You may permanently delete your account and erase all associated personal data directly from{' '}
            <Link to="/settings" className="text-white hover:underline font-semibold">
              Settings
            </Link>
            .
          </p>
        </section>

        <section className="anilist-card-static p-5 sm:p-6 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Heart aria-hidden="true" className="w-4 h-4 text-rose-400" />
            4. Voluntary UPI Support
          </h2>
          <p>
            AnimeSenpai is completely free to use with no paywalled tiers. Any contributions sent to the maintainer's UPI ID (<code>Purohit2009@fam</code>) are strictly voluntary, non-refundable tips to help cover domain and infrastructure expenses, and do not constitute a purchase of goods or premium services.
          </p>
        </section>

        <section className="anilist-card-static p-5 sm:p-6 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold text-white">
            5. Open Source License & Disclaimer of Warranties
          </h2>
          <p>
            The AnimeSenpai application source code is provided "as is", without warranty of any kind, under the{' '}
            <Link to="/license" className="text-white hover:underline font-semibold">
              License
            </Link>
            . External links redirect to third-party services governed by their own terms and privacy policies.
          </p>
        </section>
      </div>

      <div className="pt-6 border-t border-[#232329] flex flex-wrap items-center justify-between gap-3 text-xs">
        <Link to="/" className="anilist-btn-secondary px-4 py-2 text-xs font-bold">
          ← Return Home
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-slate-400">
          <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
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
