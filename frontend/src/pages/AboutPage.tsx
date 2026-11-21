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
import { useSEO, SITE_URL } from '../utils/seo';

export const AboutPage: React.FC = () => {
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About AnimeSenpai',
    url: `${SITE_URL}/about`,
    description:
      'Official platform information, mission, transparency, and copyright disclosure for AnimeSenpai (animesenpai.online).',
    mainEntity: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'AnimeSenpai',
      alternateName: ['AnimeSenpai Online', 'Anime Senpai Tracker'],
      url: `${SITE_URL}/`,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo-512.png?v=3`,
        width: 512,
        height: 512,
      },
      founder: {
        '@type': 'Person',
        name: 'Bhagyesh Purohit',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'support@animesenpai.online',
          url: `${SITE_URL}/about`,
        },
      ],
      knowsAbout: [
        'Anime tracking',
        'AniList GraphQL API',
        'Anime catalog discovery',
        'Seasonal anime schedules',
      ],
    },
  };

  const aboutBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About AnimeSenpai',
        item: `${SITE_URL}/about`,
      },
    ],
  };

  useSEO({
    title: 'About AnimeSenpai • Independent Anime Catalog & Transparency',
    description: 'Learn about AnimeSenpai\'s mission, platform independence, AniList GraphQL integration, and media discovery features.',
    canonicalUrl: `${SITE_URL}/about`,
    jsonLd: [aboutSchema, aboutBreadcrumbs],
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fadeIn text-slate-300">
      {/* Header Banner */}
      <div className="space-y-4 pb-8 border-b border-[#232329]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151519] border border-[#3a3a44] text-white text-xs font-bold">
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
      <section className="p-5 sm:p-6 rounded-2xl bg-[#0b0b0d] border border-amber-500/30 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start gap-3.5 sm:gap-4">
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
              AnimeSenpai was created strictly to give anime enthusiasts a fast, clean, and modern interface to explore seasonal schedules, track watchlist progress, and watch official trailers via verified public APIs.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Key Highlights */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-white" />
          Our Mission & Core Pillars
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl anilist-card-static space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#151519] border border-[#3a3a44] flex items-center justify-center text-white">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">Clean, Secure & Safe</h3>
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
                <strong className="text-white">Zero Video File Hosting:</strong> AnimeSenpai is an informational anime discovery and tracking catalog. It does not store, upload, or broadcast full anime episodes or video files on its servers.
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
                <strong className="text-white">DMCA & Copyright Takedowns:</strong> If you are a copyright owner or representative and wish to request removal of any specific metadata, links, or embed references, please contact us at <a href="mailto:support@animesenpai.online" className="text-white underline font-bold">support@animesenpai.online</a> for immediate action within 24 hours.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology & Open Source */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-white" />
          Technology & Open Source Heritage
        </h2>
        <div className="p-6 rounded-2xl anilist-card-static space-y-4">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            AnimeSenpai is built using modern web standards for maximum speed, accessibility, and responsiveness:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-[#0b0b0d] border border-[#232329] text-center">
              <span className="block text-xs font-bold text-white">React 19 & TypeScript</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">Type-safe frontend</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0b0b0d] border border-[#232329] text-center">
              <span className="block text-xs font-bold text-white">Vite & Tailwind CSS</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">Sub-second loading</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0b0b0d] border border-[#232329] text-center">
              <span className="block text-xs font-bold text-white">AniList GraphQL</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">Live database sync</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0b0b0d] border border-[#232329] text-center">
              <span className="block text-xs font-bold text-white">Vercel & Cloudflare</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">Global TLS 1.3 CDN</span>
            </div>
          </div>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="https://anilist.co"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0c0c0f] hover:bg-[#16161b] border border-[#23232b] text-xs font-semibold text-white transition"
            >
              <Globe className="w-4 h-4" />
              <span>AniList.co Official Portal</span>
              <ExternalLink className="w-3 h-3 text-[#9a9aa6]" />
            </a>
          </div>
        </div>
      </section>

      {/* Creator & Contact Details */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-white" />
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
                href="mailto:support@animesenpai.online"
                className="text-white hover:underline font-bold"
              >
                support@animesenpai.online
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
      <div className="pt-6 border-t border-[#232329] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl anilist-btn-primary font-bold text-xs"
        >
          ← Return to Home
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
          <span>·</span>
          <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
          <span>·</span>
          <Link to="/license" className="hover:text-white transition">Licenses</Link>
          <span>·</span>
          <Link to="/security" className="hover:text-white transition">Security</Link>
        </div>
      </div>
    </div>
  );
};
export default AboutPage;
