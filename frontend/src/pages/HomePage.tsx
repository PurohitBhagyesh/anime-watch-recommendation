import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  PlaySquare,
  Trophy,
  Clock,
  RefreshCw,
  AlertTriangle,
  Flame,
  Film,
  Sparkles,
  Swords,
  Heart,
} from 'lucide-react';
import { fetchHomeData, getCurrentSeason } from '../api/anilist';
import type { HomeSectionsData } from '../api/anilist';
import { HeroBanner } from '../components/home/HeroBanner';
import { CarouselRow } from '../components/home/CarouselRow';
import { GenreGrid } from '../components/home/GenreGrid';
import { HeroSkeleton, CardSkeleton } from '../components/common/Skeleton';

export const HomePage: React.FC = () => {
  const [data, setData] = useState<HomeSectionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchHomeData();
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch anime data from AniList');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const { season, year } = getCurrentSeason();

  if (loading) {
    return (
      <div className="w-full pb-20 space-y-10">
        <HeroSkeleton />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="h-6 bg-[#151f2e] rounded w-40 shimmer-loading" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-20 p-6 rounded-xl anilist-card-static text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-[#e85d75] mx-auto" />
        <h2 className="text-lg font-bold text-[#edf1f5]">Connection Error</h2>
        <p className="text-xs text-[#8ba0b2]">{error || 'Unable to connect to AniList API.'}</p>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded anilist-btn-primary text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const quickCategories = [
    { label: 'Trending', link: '/discover?sort=TRENDING_DESC', icon: Flame, color: 'text-amber-400' },
    { label: `${season} ${year}`, link: `/discover?season=${season}&year=${year}`, icon: PlaySquare, color: 'text-[#3db4f2]' },
    { label: 'All-Time Popular', link: '/discover?sort=POPULARITY_DESC', icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Top 100 Anime', link: '/discover?sort=SCORE_DESC', icon: Trophy, color: 'text-amber-300' },
    { label: 'Upcoming Next', link: '/discover?status=NOT_YET_RELEASED', icon: Clock, color: 'text-violet-400' },
    { label: 'Anime Movies', link: '/discover?format=MOVIE', icon: Film, color: 'text-pink-400' },
    { label: 'Action & Shonen', link: '/discover?genre=Action', icon: Swords, color: 'text-rose-400' },
    { label: 'Romance', link: '/discover?genre=Romance', icon: Heart, color: 'text-rose-300' },
    { label: 'Fantasy & Isekai', link: '/discover?genre=Fantasy', icon: Sparkles, color: 'text-purple-400' },
  ];

  return (
    <div className="w-full pb-20 animate-fadeIn">
      {/* Interactive Hero Spotlight Slider */}
      <HeroBanner animeList={data.spotlights} anime={data.spotlight} />

      {/* Main Body Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 pt-8">
        {/* Quick Jump Category Bar */}
        <div className="pt-2 pb-2">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
            {quickCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.label}
                  to={cat.link}
                  className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap bg-[#151f2e] hover:bg-[#1c2a3f] border border-white/10 hover:border-[#3db4f2]/50 hover:text-[#3db4f2] text-[#edf1f5] transition-all shadow-sm flex-shrink-0"
                >
                  <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                  <span>{cat.label}</span>
                </Link>
              );
            })}
          </div>
        </div>


        {/* Trending Now */}
        <div id="trending" className="scroll-mt-24">
          <CarouselRow
            title="Trending Now"
            subtitle="Top active and discussed anime right now"
            icon={Flame}
            animes={data.trending}
            viewAllLink="/discover?sort=TRENDING_DESC"
          />
        </div>

        {/* Popular This Season */}
        <div id="seasonal" className="scroll-mt-24">
          <CarouselRow
            title={`Popular This Season • ${season} ${year}`}
            subtitle="Currently broadcasting weekly anime series"
            icon={PlaySquare}
            animes={data.seasonal}
            viewAllLink={`/discover?season=${season}&year=${year}`}
          />
        </div>

        {/* Visual Genre Explorer */}
        <GenreGrid />

        {/* All Time Popular */}
        <div id="popular" className="scroll-mt-20">
          <CarouselRow
            title="All-Time Popular"
            subtitle="Most popular and recognized anime across the globe"
            icon={TrendingUp}
            animes={data.popularAllTime}
            viewAllLink="/discover?sort=POPULARITY_DESC"
          />
        </div>

        {/* Top 100 Highest Rated */}
        <div id="top100" className="scroll-mt-20">
          <CarouselRow
            title="Top 100 Anime"
            subtitle="Highest scoring anime of all time"
            icon={Trophy}
            animes={data.topRated}
            viewAllLink="/discover?sort=SCORE_DESC"
          />
        </div>

        {/* Upcoming Next Season */}
        <div id="upcoming" className="scroll-mt-20">
          <CarouselRow
            title="Upcoming Next Season"
            subtitle="Confirmed anime scheduled for future seasons"
            icon={Clock}
            animes={data.upcoming}
            viewAllLink="/discover?status=NOT_YET_RELEASED"
          />
        </div>
      </div>
    </div>
  );
};
