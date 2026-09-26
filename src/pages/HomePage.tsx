import React, { useEffect, useState } from 'react';
import { TrendingUp, PlaySquare, Trophy, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
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
      <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <HeroSkeleton />
        <div className="space-y-4">
          <div className="h-6 bg-slate-800 rounded w-40 shimmer-loading" />
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
      <div className="max-w-md mx-auto my-20 p-6 rounded-lg bg-[#111622] border border-[#1e2638] text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Connection Error</h2>
        <p className="text-xs text-slate-400">{error || 'Unable to connect to AniList API.'}</p>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fadeIn">
      {/* Hero Spotlight */}
      <HeroBanner anime={data.spotlight} />

      {/* Trending Now */}
      <CarouselRow
        title="Trending Anime"
        subtitle="Most active titles in the community"
        icon={TrendingUp}
        animes={data.trending}
        viewAllLink="/discover?sort=TRENDING_DESC"
      />

      {/* Popular This Season */}
      <CarouselRow
        title={`Airing ${season} ${year}`}
        subtitle="Currently broadcasting weekly series"
        icon={PlaySquare}
        animes={data.seasonal}
        viewAllLink={`/discover?season=${season}&year=${year}`}
      />

      {/* Visual Genre Cards */}
      <GenreGrid />

      {/* Top Rated of All Time */}
      <CarouselRow
        title="Top 100 Highest Rated"
        subtitle="Highest scoring anime of all time"
        icon={Trophy}
        animes={data.topRated}
        viewAllLink="/discover?sort=SCORE_DESC"
      />

      {/* All Time Popular */}
      <CarouselRow
        title="Most Popular All-Time"
        subtitle="Titles with the largest global audience"
        icon={TrendingUp}
        animes={data.popularAllTime}
        viewAllLink="/discover?sort=POPULARITY_DESC"
      />

      {/* Upcoming Releases */}
      <CarouselRow
        title="Upcoming Releases"
        subtitle="Confirmed anime scheduled for future broadcast"
        icon={Clock}
        animes={data.upcoming}
        viewAllLink="/discover?status=NOT_YET_RELEASED"
      />
    </div>
  );
};
