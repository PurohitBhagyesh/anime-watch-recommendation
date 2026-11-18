import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Clock, Lock, FileCode2, ExternalLink, AlertTriangle } from 'lucide-react';
import { useSEO, SITE_URL } from '../utils/seo';

export const SecurityPage: React.FC = () => {
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Security Policy', item: `${SITE_URL}/security` },
    ],
  };

  useSEO({
    title: 'Security Policy & Responsible Disclosure • AnimeSenpai',
    description: 'AnimeSenpai security policy, vulnerability disclosure process, response timelines, RFC 9116 security.txt, and privacy architecture.',
    canonicalUrl: `${SITE_URL}/security`,
    jsonLd: breadcrumbs,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8 animate-fadeIn text-slate-300">
      <div className="space-y-3 pb-6 border-b border-[#232329]">
        <div className="liquid-glass-pill inline-flex items-center gap-2 px-3 py-1 rounded-full text-emerald-300 text-xs font-bold">
          <ShieldCheck aria-hidden="true" className="w-3.5 h-3.5" />
          <span>Responsible Disclosure</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Security Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          How to report vulnerabilities, expected response times, and how AnimeSenpai protects user safety.
        </p>
      </div>

      {/* Responsible Disclosure */}
      <section className="anilist-card-static p-5 sm:p-6 space-y-3 border-amber-500/25">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <AlertTriangle aria-hidden="true" className="w-4 h-4 text-amber-400" />
          1. Reporting a Vulnerability Privately
        </h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          Please report security vulnerabilities privately so we can patch them before public disclosure:
        </p>
        <div className="pt-1">
          <a
            href="mailto:Purohitunofficialbhagyesh@gmail.com?subject=AnimeSenpai%20Security%20Report"
            className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-[#23232b] transition flex items-start justify-between gap-2"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-white block">Direct Security &amp; Support Email</span>
              <span className="text-[11px] text-[#c8c8d2] font-mono block">
                Purohitunofficialbhagyesh@gmail.com
              </span>
            </div>
            <Mail aria-hidden="true" className="w-3.5 h-3.5 text-white flex-shrink-0 mt-0.5" />
          </a>
        </div>
      </section>

      {/* Response Timelines */}
      <section className="anilist-card-static p-5 sm:p-6 space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Clock aria-hidden="true" className="w-4 h-4 text-white" />
          2. Response Timelines
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-[#232329]">
            <span className="text-[#c8c8d2] font-bold block">48 Hours</span>
            <span className="text-slate-400 mt-0.5 block">Initial report acknowledgment</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-[#232329]">
            <span className="text-[#c8c8d2] font-bold block">5 Business Days</span>
            <span className="text-slate-400 mt-0.5 block">Severity triage & confirmation</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-[#232329]">
            <span className="text-[#c8c8d2] font-bold block">Coordinated Fix</span>
            <span className="text-slate-400 mt-0.5 block">Priority patch & disclosure</span>
          </div>
        </div>
      </section>

      {/* Platform Security Guarantees */}
      <section className="anilist-card-static p-5 sm:p-6 space-y-3 text-xs sm:text-sm leading-relaxed">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Lock aria-hidden="true" className="w-4 h-4 text-white" />
          3. Security & Privacy Architecture
        </h2>
        <ul className="list-disc list-inside space-y-1.5 text-slate-300">
          <li>Zero hosted video files — official trailers stream strictly from <code>youtube-nocookie.com</code>.</li>
          <li>Live read-only anime metadata retrieved directly from the official AniList GraphQL API.</li>
          <li>Automated CI secret scanning on every push and pull request to prevent credential leaks.</li>
          <li>Zero third-party ad networks, tracking pixels, or data brokers.</li>
          <li>
            Full self-service permanent account and data deletion available anytime in{' '}
            <Link to="/settings" className="text-white hover:underline font-semibold">
              Account Settings
            </Link>
            .
          </li>
        </ul>
      </section>

      {/* Machine-Readable & Source Docs */}
      <section className="anilist-card-static p-5 sm:p-6 space-y-3 text-xs">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <FileCode2 aria-hidden="true" className="w-4 h-4 text-white" />
          4. Official Security References
        </h2>
        <div className="flex flex-wrap gap-2.5">
          <a
            href="/.well-known/security.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="anilist-btn-secondary px-3.5 py-2 inline-flex items-center gap-1.5 font-mono text-xs"
          >
            <span>/.well-known/security.txt</span>
            <ExternalLink aria-hidden="true" className="w-3 h-3 text-white" />
          </a>
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
          <Link to="/license" className="hover:text-white transition">Licenses</Link>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
