import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  PlaySquare,
  Trophy,
  Clock,
  RefreshCw,
  AlertTriangle,
  Flame,
  Crown,
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
          <div className="h-6 bg-[#0e1528] rounded-md w-40 shimmer-loading" />
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
      <div className="max-w-md mx-auto my-20 p-6 rounded-2xl royal-card-static text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Connection Error</h2>
        <p className="text-xs text-slate-400">{error || 'Unable to connect to AniList API.'}</p>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg royal-btn-primary text-xs font-semibold"
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
    { label: 'Top 100 Imperial', anchor: '#top100', icon: Crown },
    { label: 'All-Time Popular', anchor: '#popular', icon: TrendingUp },
    { label: 'Upcoming Releases', anchor: '#upcoming', icon: Clock },
  ];

  return (
    <div className="w-full pb-20 animate-fadeIn">
      {/* Interactive Hero Spotlight Slider */}
      <HeroBanner animeList={data.spotlights} anime={data.spotlight} />

      {/* Main Body Sections with centered container alignment */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 pt-8">
        {/* Quick Jump Category Bar */}
        <div className="pt-2 pb-2">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar">
            {quickCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <a
                  key={cat.label}
                  href={cat.anchor}
                  className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap royal-card hover:border-[#6366f1]/50 hover:text-[#818cf8] text-slate-300 transition-all shadow-sm"
                >
                  <Icon className="w-3.5 h-3.5 text-[#6366f1]" />
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
            subtitle="Top active and discussed anime in the global community"
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

        {/* Top 100 Imperial Ratings */}
        <div id="top100" className="scroll-mt-20">
          <CarouselRow
            title="Top 100 Imperial Masterpieces"
            subtitle="Highest rated anime of all time"
            icon={Trophy}
            animes={data.topRated}
            viewAllLink="/discover?sort=SCORE_DESC"
          />
        </div>

        {/* All Time Popular */}
        <div id="popular" className="scroll-mt-20">
          <CarouselRow
            title="All-Time Global Favorites"
            subtitle="Anime with the largest international follower base"
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
    </div>
  );
};
