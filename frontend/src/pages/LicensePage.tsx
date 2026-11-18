import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Code2, Database, ShieldCheck, ExternalLink, FileCode2 } from 'lucide-react';
import { useSEO, SITE_URL } from '../utils/seo';

export const LicensePage: React.FC = () => {
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Licenses & Attribution', item: `${SITE_URL}/license` },
    ],
  };

  useSEO({
    title: 'Licenses & Open Source Attribution • AnimeSenpai',
    description: 'MIT License, AniList GraphQL API attribution, third-party open-source software notices, and copyright disclosures for AnimeSenpai.',
    canonicalUrl: `${SITE_URL}/license`,
    jsonLd: breadcrumbs,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const packages = [
    { name: 'React & React DOM', license: 'MIT', purpose: 'User interface library' },
    { name: 'React Router', license: 'MIT', purpose: 'Client-side routing' },
    { name: 'Vite', license: 'MIT', purpose: 'Frontend build tool' },
    { name: 'Tailwind CSS', license: 'MIT', purpose: 'Utility CSS framework' },
    { name: 'Lucide Icons', license: 'ISC', purpose: 'Interface iconography' },
    { name: 'Web Elements (Coffee UPI & Share Link)', license: 'MIT', purpose: 'Floating UPI & native Web Share widgets' },
    { name: 'Firebase Web SDK', license: 'Apache-2.0', purpose: 'Optional authentication & profile storage' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8 animate-fadeIn text-slate-300">
      <div className="space-y-3 pb-6 border-b border-[#232329]">
        <div className="liquid-glass-pill inline-flex items-center gap-2 px-3 py-1 rounded-full text-[#c8c8d2] text-xs font-bold">
          <Scale aria-hidden="true" className="w-3.5 h-3.5" />
          <span>Open Source & Attribution</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Licenses & Legal Attributions
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Software license, anime database attribution, and third-party copyright notices.
        </p>
      </div>

      {/* MIT License */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FileCode2 aria-hidden="true" className="w-4 h-4 text-white" />
          1. AnimeSenpai Software License (MIT)
        </h2>
        <div className="anilist-card-static p-5 sm:p-6 space-y-3 text-xs leading-relaxed font-mono text-slate-300">
          <p className="font-bold text-white">MIT License — Copyright (c) 2026 AnimeSenpai Contributors</p>
          <p>
            Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
          </p>
          <p>
            The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
          </p>
          <p className="text-slate-400">
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
          </p>
        </div>
      </section>

      {/* Anime Data & Media Attribution */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Database aria-hidden="true" className="w-4 h-4 text-white" />
          2. Anime Database & Media Attribution
        </h2>
        <div className="anilist-card-static p-5 sm:p-6 space-y-3 text-xs sm:text-sm leading-relaxed">
          <p>
            All live anime metadata — including titles, synopses, episode counts, airing schedules, community scores, rankings, studios, voice actors, franchise relations, and recommendations — is sourced directly from the{' '}
            <a
              href="https://anilist.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline font-semibold inline-flex items-center gap-1"
            >
              AniList GraphQL API
              <ExternalLink aria-hidden="true" className="w-3 h-3" />
            </a>
            .
          </p>
          <p>
            All promotional trailers are played directly via official YouTube privacy-enhanced embeds (<code>youtube-nocookie.com</code>). AnimeSenpai does not host, mirror, or distribute copyrighted video files.
          </p>
          <p className="text-slate-400">
            All anime artwork, character designs, logos, titles, and trademarks belong solely to their respective studios, production committees, authors, and publishers.
          </p>
        </div>
      </section>

      {/* Third-Party Open Source Libraries */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Code2 aria-hidden="true" className="w-4 h-4 text-white" />
          3. Third-Party Open Source Components
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {packages.map((pkg) => (
            <div key={pkg.name} className="anilist-card-static p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white truncate">{pkg.name}</p>
                <p className="text-[11px] text-slate-400">{pkg.purpose}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-[#232329] text-[10px] font-mono font-bold text-[#c8c8d2] flex-shrink-0">
                {pkg.license}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Copyright & DMCA */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck aria-hidden="true" className="w-4 h-4 text-emerald-400" />
          4. Copyright & Takedown Requests
        </h2>
        <div className="anilist-card-static p-5 sm:p-6 text-xs sm:text-sm leading-relaxed space-y-2">
          <p>
            If you are a rights holder and want any specific reference, metadata entry, or external link reviewed or removed, contact{' '}
            <a href="mailto:Purohitunofficialbhagyesh@gmail.com" className="text-white hover:underline font-semibold">
              Purohitunofficialbhagyesh@gmail.com
            </a>
            . Valid notices are processed within 24 hours.
          </p>
        </div>
      </section>

      <div className="pt-6 border-t border-[#232329] flex flex-wrap items-center justify-between gap-3 text-xs">
        <Link to="/" className="anilist-btn-secondary px-4 py-2 text-xs font-bold">
          ← Return Home
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-slate-400">
          <Link to="/about" className="hover:text-white transition">About</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
          <span>·</span>
          <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
          <span>·</span>
          <Link to="/security" className="hover:text-white transition">Security</Link>
        </div>
      </div>
    </div>
  );
};

export default LicensePage;
