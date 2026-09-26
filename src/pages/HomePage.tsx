import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  PlaySquare,
  Trophy,
  Clock,
  RefreshCw,
  AlertTriangle,
  Flame,
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
      <div className="space-y-12 w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-6">
        <HeroSkeleton />
        <div className="space-y-4">
          <div className="h-6 bg-[#151f2e] rounded w-40 shimmer-loading" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-20 p-6 rounded-2xl anilist-card-static text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Connection Error</h2>
        <p className="text-xs text-slate-400">{error || 'Unable to connect to AniList API.'}</p>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg anilist-btn-primary text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const quickCategories = [
    { label: 'Trending', anchor: '#trending', icon: Flame },
    { label: `${season} ${year}`, anchor: '#seasonal', icon: PlaySquare },
    { label: 'Top 100', anchor: '#top100', icon: Trophy },
    { label: 'Popular', anchor: '#popular', icon: TrendingUp },
    { label: 'Upcoming', anchor: '#upcoming', icon: Clock },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 pt-8 sm:pt-10 pb-20 animate-fadeIn">
      {/* Interactive Hero Spotlight Slider */}
      <HeroBanner animeList={data.spotlights} anime={data.spotlight} />

      {/* Quick Jump Category Bar (Apple Frosted Glass) with generous spacing */}
      <div className="pt-2 pb-2">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {quickCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <a
                key={cat.label}
                href={cat.anchor}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap anilist-card hover:border-[#3db4f2]/40 hover:text-[#3db4f2] text-slate-300 transition-all shadow-sm"
              >
                <Icon className="w-3.5 h-3.5 text-[#3db4f2]" />
                <span>{cat.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Trending Now */}
      <div id="trending" className="scroll-mt-24">
        <CarouselRow
          title="Trending Now"
          subtitle="Top active and discussed titles in the community"
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

      {/* Visual Genre Cards */}
      <GenreGrid />

      {/* Top 100 Highest Rated */}
      <div id="top100" className="scroll-mt-20">
        <CarouselRow
          title="Top 100 Anime"
          subtitle="Highest community score of all time"
          icon={Trophy}
          animes={data.topRated}
          viewAllLink="/discover?sort=SCORE_DESC"
        />
      </div>

      {/* All Time Popular */}
      <div id="popular" className="scroll-mt-20">
        <CarouselRow
          title="All Time Popular"
          subtitle="Anime with the largest global follower counts"
          icon={TrendingUp}
          animes={data.popularAllTime}
          viewAllLink="/discover?sort=POPULARITY_DESC"
        />
      </div>

      {/* Upcoming Releases */}
      <div id="upcoming" className="scroll-mt-20">
        <CarouselRow
          title="Upcoming Next Season"
          subtitle="Confirmed anime scheduled for future broadcast"
          icon={Clock}
          animes={data.upcoming}
          viewAllLink="/discover?status=NOT_YET_RELEASED"
        />
      </div>
    </div>
  );
};
