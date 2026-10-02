import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  Bookmark,
  ExternalLink,
  Code2,
  Lock,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Film,
  Sparkles,
} from 'lucide-react';
import { AppLogo } from '../components/common/AppLogo';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    document.title = 'About AnimeSenpai | Official Platform Info & Transparency';
    window.scrollTo(0, 0);

    // Dynamic JSON-LD structured data for AboutPage
    const scriptId = 'about-schema-jsonld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About AnimeSenpai',
        url: 'https://www.animesenpai.online/#/about',
        description:
          'Official platform information, mission, transparency, and copyright disclosure for AnimeSenpai (animesenpai.online).',
        mainEntity: {
          '@type': 'Organization',
          name: 'AnimeSenpai',
          alternateName: ['AnimeSenpai Online', 'Anime Senpai Tracker'],
          url: 'https://www.animesenpai.online/',
          logo: 'https://www.animesenpai.online/logo-512.png',
          sameAs: [
            'https://github.com/PurohitBhagyesh/anime-watch-recommendation',
          ],
          founder: {
            '@type': 'Person',
            name: 'Bhagyesh Purohit',
          },
          knowsAbout: [
            'Anime tracking',
            'AniList GraphQL API',
            'Anime catalog discovery',
            'Seasonal anime schedules',
          ],
        },
      });
      document.head.appendChild(script);
    }

    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fadeIn text-slate-300">
      {/* Header Banner */}
      <div className="space-y-4 pb-8 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3db4f2]/10 border border-[#3db4f2]/30 text-[#3db4f2] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>About AnimeSenpai • Platform Mission & Transparency</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              About AnimeSenpai
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              An independent, community-first anime discovery and personal watchlist platform powered by the AniList GraphQL network.
            </p>
          </div>
          <div className="flex-shrink-0">
            <AppLogo size="lg" />
          </div>
        </div>
      </div>

      {/* Official Disambiguation & Authenticity Notice */}
      <section className="p-6 rounded-2xl bg-[#151f2e] border border-amber-500/30 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Official Identity & Brand Differentiation Notice
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">AnimeSenpai (animesenpai.online)</strong> is an independent open-source anime catalog, recommendation, and watchlist tracking tool.
              We are <strong>NOT affiliated, associated, authorized, endorsed by, or in any way officially connected</strong> with third-party anime news blogs (such as <em>animesenpai.net</em>), commercial media apps, or pirated video aggregators.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              AnimeSenpai was created strictly to give anime enthusiasts a fast, ad-free, and clean interface to explore seasonal schedules, track watchlist progress, and watch official trailers via verified public APIs.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Key Highlights */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#3db4f2]" />
          Our Mission & Core Pillars
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl anilist-card-static space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#3db4f2]/20 border border-[#3db4f2]/30 flex items-center justify-center text-[#3db4f2]">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">100% Ad-Free & Safe</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No deceptive banners, no intrusive redirects, no malware, and no crypto miners. Your security and privacy are paramount.
            </p>
          </div>

          <div className="p-5 rounded-xl anilist-card-static space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">Strictly Legal Media</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We never host or distribute pirated files. All trailers are official YouTube embeds, and all data comes from licensed public sources.
            </p>
          </div>

          <div className="p-5 rounded-xl anilist-card-static space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Bookmark className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">Smart Watchlist</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time score tracking, episode progress counters, and seamless JSON import/export backups for complete data ownership.
            </p>
          </div>
        </div>
      </section>

      {/* Legality & DMCA Compliance */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Film className="w-5 h-5 text-emerald-400" />
          Content Sourcing & Copyright Compliance (DMCA)
        </h2>
        <div className="p-6 rounded-2xl anilist-card-static space-y-4">
          <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Zero Video File Hosting:</strong> AnimeSenpai does not store, upload, or broadcast full anime episodes or video files on its servers. All streaming pointers link exclusively to authorized licensors (Crunchyroll, Netflix, Hulu, Disney+) as indexed by AniList.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Official YouTube Trailer Embeds:</strong> Preview clips and promotional trailers are displayed via YouTube’s official embed player using privacy-enhanced mode (<code>youtube-nocookie.com</code>), directly crediting the respective production committees and studios.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">AniList GraphQL Network:</strong> Anime synopsis, voice actor lists, staff credits, and airing counts are queried directly from the open AniList GraphQL API under standard fair use.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">DMCA & Copyright Takedowns:</strong> If you are a copyright owner or representative and wish to request removal of any specific metadata, links, or embed references, please contact us at <a href="mailto:contact@animesenpai.online" className="text-[#3db4f2] underline font-bold">contact@animesenpai.online</a> for immediate action within 24 hours.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology & Open Source */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-[#3db4f2]" />
          Technology & Open Source Heritage
        </h2>
        <div className="p-6 rounded-2xl anilist-card-static space-y-4">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            AnimeSenpai is built using modern web standards for maximum speed, accessibility, and responsiveness:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-[#0b1622] border border-white/5 text-center">
              <span className="block text-xs font-bold text-white">React 19 & TypeScript</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">Type-safe frontend</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0b1622] border border-white/5 text-center">
              <span className="block text-xs font-bold text-white">Vite & Tailwind CSS</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">Sub-second loading</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0b1622] border border-white/5 text-center">
              <span className="block text-xs font-bold text-white">AniList GraphQL</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">Live database sync</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0b1622] border border-white/5 text-center">
              <span className="block text-xs font-bold text-white">Vercel & Cloudflare</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">Global TLS 1.3 CDN</span>
            </div>
          </div>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/PurohitBhagyesh/anime-watch-recommendation"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#151f2e] hover:bg-[#1f2c3f] border border-white/10 text-xs font-bold text-white transition shadow"
            >
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Inspect Source on GitHub</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href="https://anilist.co"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#151f2e] hover:bg-[#1f2c3f] border border-white/10 text-xs font-bold text-[#3db4f2] transition shadow"
            >
              <Globe className="w-4 h-4" />
              <span>AniList.co Official Portal</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </section>

      {/* Creator & Contact Details */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#3db4f2]" />
          Contact & Community Support
        </h2>
        <div className="p-6 rounded-2xl anilist-card-static space-y-3 text-xs sm:text-sm text-slate-300">
          <p>
            Have feedback, feature suggestions, or need assistance with your watchlist? We welcome community engagement.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Email:</span>
              <a
                href="mailto:contact@animesenpai.online"
                className="text-[#3db4f2] hover:underline font-bold"
              >
                contact@animesenpai.online
              </a>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Engineering:</span>
              <span className="text-white font-medium">Bhagyesh Purohit (Lead Maintainer)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Home Action */}
      <div className="pt-6 border-t border-white/10 flex items-center justify-between">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-[#3db4f2] hover:bg-[#2ba2e0] text-[#0b1622] font-bold text-xs transition shadow-lg"
        >
          ← Return to Home
        </Link>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
};
export default AboutPage;
