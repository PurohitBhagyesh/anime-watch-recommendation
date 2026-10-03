import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, Compass, TrendingUp, AlertCircle, ArrowLeft } from 'lucide-react';
import { useSEO, SITE_URL } from '../utils/seo';

export const NotFoundPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useSEO({
    title: 'Page Not Found (404) • AnimeSenpai',
    description: 'The requested anime page or route does not exist on AnimeSenpai. Search 20,000+ anime titles or return to the catalog.',
    canonicalUrl: `${SITE_URL}/`,
    robots: 'noindex, nofollow',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/discover?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-10rem)] px-4 py-16 animate-fadeIn">
      <div className="max-w-xl w-full text-center space-y-6 p-6 sm:p-8 rounded-2xl anilist-card-static border border-white/10 shadow-2xl">
        {/* Error Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#e85d75]/15 border border-[#e85d75]/30 text-[#e85d75] shadow-inner mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>

        {/* Heading Hierarchy */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-[#e85d75] tracking-widest uppercase">
            HTTP 404 Error
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#edf1f5] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#8ba0b2] max-w-md mx-auto leading-relaxed">
            The anime title, page, or link you followed could not be found. It may have been relocated, or the URL might have a typo.
          </p>
        </div>

        {/* Search Bar for Discoverability */}
        <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 20,000+ anime titles..."
            className="w-full text-xs sm:text-sm pl-10 pr-24 py-2.5 bg-[#0b1622] hover:bg-[#111927] focus:bg-[#111927] border border-white/15 focus:border-[#3db4f2] rounded-xl text-white placeholder-slate-400 outline-none transition shadow-inner focus:ring-1 focus:ring-[#3db4f2]/40"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg anilist-btn-primary text-xs font-bold"
          >
            Search
          </button>
        </form>

        {/* Quick Navigation Links */}
        <div className="pt-4 border-t border-white/[0.08] space-y-3">
          <p className="text-[11px] uppercase font-bold text-[#8ba0b2] tracking-wider font-mono">
            Explore Other Sections
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#151f2e] hover:bg-[#1f2c3f] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition"
            >
              <Home className="w-3.5 h-3.5 text-[#3db4f2]" />
              <span>Homepage</span>
            </Link>

            <Link
              to="/discover"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#151f2e] hover:bg-[#1f2c3f] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition"
            >
              <Compass className="w-3.5 h-3.5 text-[#3db4f2]" />
              <span>Discover Catalog</span>
            </Link>

            <Link
              to="/discover?sort=TRENDING_DESC"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#151f2e] hover:bg-[#1f2c3f] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#e4a834]" />
              <span>Trending Anime</span>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#151f2e] hover:bg-[#1f2c3f] border border-white/10 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
