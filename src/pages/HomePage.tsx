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
      <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <HeroSkeleton />
        <div className="space-y-4">
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

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fadeIn">
      {/* Interactive Hero Spotlight Slider */}
      <HeroBanner animeList={data.spotlights} anime={data.spotlight} />

      {/* Trending Now */}
      <CarouselRow
        title="Trending Now"
        subtitle="Top active and discussed titles in the community"
        icon={Flame}
        animes={data.trending}
        viewAllLink="/discover?sort=TRENDING_DESC"
      />

      {/* Popular This Season */}
      <CarouselRow
        title={`Popular This Season • ${season} ${year}`}
        subtitle="Currently broadcasting weekly anime series"
        icon={PlaySquare}
        animes={data.seasonal}
        viewAllLink={`/discover?season=${season}&year=${year}`}
      />

      {/* Visual Genre Cards */}
      <GenreGrid />

      {/* Top 100 Highest Rated */}
      <CarouselRow
        title="Top 100 Anime"
        subtitle="Highest community score of all time"
        icon={Trophy}
        animes={data.topRated}
        viewAllLink="/discover?sort=SCORE_DESC"
      />

      {/* All Time Popular */}
      <CarouselRow
        title="All Time Popular"
        subtitle="Anime with the largest global follower counts"
        icon={TrendingUp}
        animes={data.popularAllTime}
        viewAllLink="/discover?sort=POPULARITY_DESC"
      />

      {/* Upcoming Releases */}
      <CarouselRow
        title="Upcoming Next Season"
        subtitle="Confirmed anime scheduled for future broadcast"
        icon={Clock}
        animes={data.upcoming}
        viewAllLink="/discover?status=NOT_YET_RELEASED"
      />
    </div>
  );
};
