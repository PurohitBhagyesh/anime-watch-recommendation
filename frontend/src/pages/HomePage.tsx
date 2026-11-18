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
import { HeroSkeleton, CarouselRowSkeleton } from '../components/common/Skeleton';
import initialHomeData from '../data/initialHomeData.json';
import { useSEO, SITE_URL } from '../utils/seo';

export const HomePage: React.FC = () => {
  useSEO({
    title: 'AnimeSenpai • Anime Discovery, Tracker & Recommendations',
    description:
      'AnimeSenpai is your modern anime discovery & watchlist tracking platform. Explore trending releases, personalized recommendations, airing schedules, and official trailers.',
    canonicalUrl: `${SITE_URL}/`,
  });

  const [data, setData] = useState<HomeSectionsData>(() => {
    try {
      const cached = localStorage.getItem('animesenpai_home_data');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (
          parsed &&
          Array.isArray(parsed.trending) &&
          parsed.trending.length >= 3 &&
          parsed.spotlight
        ) {
          return parsed as HomeSectionsData;
        }
      }
    } catch {}
    return initialHomeData as unknown as HomeSectionsData;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      setError(null);
      const res = await fetchHomeData();
      if (res && Array.isArray(res.trending) && res.trending.length > 0) {
        setData((prev) => {
          if (isBackground && prev?.spotlight) {
            // Preserve the preloaded slide-0 hero banner during background refresh so LCP never shifts
            const pinnedHero = prev.spotlight;
            const liveOthers = (res.spotlights || []).filter((item) => item.id !== pinnedHero.id);
            const mergedSpotlights = [pinnedHero, ...liveOthers].slice(0, 5);
            return {
              ...res,
              spotlight: pinnedHero,
              spotlights: mergedSpotlights,
            };
          }
          return res;
        });
        try {
          localStorage.setItem('animesenpai_home_data', JSON.stringify(res));
        } catch {}
      }
    } catch (err: any) {
      console.warn('AniList live fetch warning, retaining bundled fallback catalog:', err);
      setData((prev) => {
        if (prev && Array.isArray(prev.trending) && prev.trending.length > 0) return prev;
        return initialHomeData as unknown as HomeSectionsData;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!data || !Array.isArray(data.trending) || data.trending.length === 0) {
      setData(initialHomeData as unknown as HomeSectionsData);
    }
    const timer = setTimeout(() => {
      loadData(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const { season, year } = getCurrentSeason();

  if (loading) {
    return (
      <div className="w-full pb-4 min-h-screen">
        <HeroSkeleton />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 divide-y divide-[#1a1a22]">
          {[1, 2, 3].map((row) => (
            <div key={row} className="py-5 sm:py-7">
              <CarouselRowSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-20 p-6 rounded-2xl anilist-card-static text-center space-y-3">
        <AlertTriangle className="w-9 h-9 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Connection Error</h2>
        <p className="text-xs text-[#9a9aa6]">{error || 'Unable to connect to AniList API.'}</p>
        <button
          type="button"
          onClick={() => loadData(false)}
          className="inline-flex items-center gap-2 px-5 py-2.5 anilist-btn-primary text-xs font-bold cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full pb-2 sm:pb-4">
      {/* Primary Semantic H1 for Search Engine Crawlers */}
      <h1 className="sr-only">
        AnimeSenpai — Anime Discovery, Personal Watchlist Tracker & Recommendations
      </h1>

      {/* Cinematic Spotlight Hero Slider */}
      <HeroBanner
        animeList={data?.spotlights?.length ? data.spotlights : (initialHomeData as any).spotlights}
        anime={data?.spotlight || (initialHomeData as any).spotlight}
      />

      {/* Main Editorial Catalog Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 divide-y divide-[#1a1a22]">
        <div id="trending" className="py-5 sm:py-7 scroll-mt-20">
          <CarouselRow
            title="Trending Now"
            subtitle="Most active and discussed anime across AniList right now"
            icon={Flame}
            animes={data?.trending?.length ? data.trending : (initialHomeData as any).trending}
            viewAllLink="/discover?sort=TRENDING_DESC"
            priority={false}
          />
        </div>

        <div id="seasonal" className="py-5 sm:py-7 scroll-mt-20 scroll-reveal-section">
          <CarouselRow
            title={`Popular This Season · ${season} ${year}`}
            subtitle="Currently airing weekly anime series"
            icon={PlaySquare}
            animes={data?.seasonal?.length ? data.seasonal : (initialHomeData as any).seasonal}
            viewAllLink={`/discover?season=${season}&year=${year}`}
          />
        </div>

        <div className="py-5 sm:py-7 below-fold-section scroll-reveal-section">
          <GenreGrid />
        </div>

        <div id="popular" className="py-5 sm:py-7 scroll-mt-20 below-fold-section scroll-reveal-section">
          <CarouselRow
            title="All-Time Popular"
            subtitle="Most followed anime series and movies worldwide"
            icon={TrendingUp}
            animes={data?.popularAllTime?.length ? data.popularAllTime : (initialHomeData as any).popularAllTime}
            viewAllLink="/discover?sort=POPULARITY_DESC"
          />
        </div>

        <div id="top100" className="py-5 sm:py-7 scroll-mt-20 below-fold-section scroll-reveal-section">
          <CarouselRow
            title="Top 100 Anime"
            subtitle="Highest community-scored anime of all time"
            icon={Trophy}
            animes={data?.topRated?.length ? data.topRated : (initialHomeData as any).topRated}
            viewAllLink="/discover?sort=SCORE_DESC"
          />
        </div>

        <div id="upcoming" className="pt-5 pb-4 sm:pt-7 sm:pb-6 scroll-mt-20 below-fold-section scroll-reveal-section">
          <CarouselRow
            title="Upcoming Next Season"
            subtitle="Confirmed anime scheduled for future release"
            icon={Clock}
            animes={data?.upcoming?.length ? data.upcoming : (initialHomeData as any).upcoming}
            viewAllLink="/discover?status=NOT_YET_RELEASED"
          />
        </div>
      </div>
    </div>
  );
};
