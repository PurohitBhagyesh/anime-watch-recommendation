import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Check,
  Award,
  Share2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Plus,
  Minus,
  Heart,
  ExternalLink as ExtLinkIcon,
  Clock,
  Sparkles,
  Users,
  GitFork,
  Smile,
  Search,
  RotateCcw,
  Compass,
  Bookmark,
  Film,
} from 'lucide-react';
import { fetchAnimeDetails } from '../api/anilist';
import type { AnimeDetailsData, WatchlistStatus } from '../api/types';
import { TrailerModal } from '../components/common/TrailerModal';
import { OfficialResources } from '../components/anime/OfficialResources';
import { CharacterGrid } from '../components/anime/CharacterGrid';
import { RelationsGrid } from '../components/anime/RelationsGrid';
import { RecommendationsGrid } from '../components/anime/RecommendationsGrid';
import { DetailsSkeleton } from '../components/common/Skeleton';
import { useWatchlist } from '../context/WatchlistContext';
import { usePreferences } from '../context/PreferencesContext';
import { useSEO, SITE_URL } from '../utils/seo';
import animeTrailersData from '../data/animeTrailers.json';

export const AnimeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [apiAnime, setApiAnime] = useState<AnimeDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'characters' | 'relations' | 'recommendations'>('overview');
  const [fallbackSearchQuery, setFallbackSearchQuery] = useState('');

  const {
    isInWatchlist,
    getItem,
    addToWatchlist,
    removeFromWatchlist,
    updateStatus,
    updateProgress,
    updateRating,
  } = useWatchlist();

  const { getPreferredTitle } = usePreferences();
  const animeId = Number(id);
  const inWatchlist = isInWatchlist(animeId);
  const watchlistItem = getItem(animeId);

  // Construct effective anime details (recover from Watchlist if AniList has no info / error)
  const effectiveAnime: AnimeDetailsData | null =
    apiAnime ||
    (watchlistItem?.anime
      ? {
          ...watchlistItem.anime,
          id: animeId,
          bannerImage:
            watchlistItem.anime.bannerImage ||
            watchlistItem.anime.coverImage?.extraLarge ||
            watchlistItem.anime.coverImage?.large ||
            '',
          description:
            watchlistItem.anime.description ||
            'Saved in your personal watchlist. Full synopsis and live streaming links from AniList are currently unavailable.',
          status: watchlistItem.anime.status || 'FINISHED',
          studios: (watchlistItem.anime as any)?.studios || { nodes: [] },
          characters: { edges: [] },
          relations: { edges: [] },
          recommendations: { nodes: [] },
          rankings: [],
          externalLinks: [],
          synonyms: (watchlistItem.anime as any)?.synonyms || [],
          source: (watchlistItem.anime as any)?.source || null,
          hashtag: null,
          startDate: { year: watchlistItem.anime.seasonYear || null, month: null, day: null },
          endDate: { year: null, month: null, day: null },
        }
      : null);

  // Dynamic SEO metadata derived from real anime information
  const animeTitle =
    effectiveAnime?.title?.userPreferred ||
    effectiveAnime?.title?.english ||
    effectiveAnime?.title?.romaji;
  const pageTitle = animeTitle
    ? `${animeTitle} • AnimeSenpai`
    : error
    ? 'Anime Information Unavailable • AnimeSenpai'
    : 'Anime Details • AnimeSenpai';

  const cleanSynopsis = effectiveAnime?.description
    ? effectiveAnime.description
        .replace(/<[^>]*>?/gm, '')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .trim()
    : '';

  const studioName = effectiveAnime?.studios?.nodes?.[0]?.name;
  const genresStr = effectiveAnime?.genres?.length ? effectiveAnime.genres.join(', ') : 'Anime';

  let pageDesc = 'Discover, track and explore thousands of anime titles with official trailers on AnimeSenpai.';
  if (animeTitle) {
    pageDesc = `Explore ${animeTitle} on AnimeSenpai.`;
    if (cleanSynopsis) {
      const excerpt = cleanSynopsis.length > 150 ? `${cleanSynopsis.slice(0, 147)}...` : cleanSynopsis;
      pageDesc += ` ${excerpt}`;
    }
    pageDesc += ` Genre: ${genresStr}. View release details, character cast, official links, and track watch progress.`;
  } else if (error && !effectiveAnime) {
    pageDesc = 'Could not find details for this anime on AnimeSenpai.';
  }

  // Trailer resolution: API trailer takes precedence; fallback to bundled authoritative catalog
  const fallbackTrailerInfo = animeId ? (animeTrailersData as Record<string, any>)[String(animeId)] : null;
  const effectiveTrailer =
    effectiveAnime?.trailer?.id && effectiveAnime.trailer.site === 'youtube'
      ? effectiveAnime.trailer
      : fallbackTrailerInfo?.trailerId
      ? { id: fallbackTrailerInfo.trailerId, site: 'youtube', thumbnail: fallbackTrailerInfo.thumbnailUrl }
      : null;
  const hasTrailer = Boolean(effectiveTrailer?.id);

  // Schema.org Movie or TVSeries structured data (strictly real data, no fake reviews or invented ratings)
  const animeSchema =
    effectiveAnime && animeTitle
      ? {
          '@context': 'https://schema.org',
          '@type': effectiveAnime.format === 'MOVIE' ? 'Movie' : 'TVSeries',
          name: animeTitle,
          alternateName: [
            effectiveAnime.title?.english,
            effectiveAnime.title?.romaji,
            effectiveAnime.title?.native,
          ].filter(Boolean),
          description: cleanSynopsis || undefined,
          image:
            effectiveAnime.coverImage?.extraLarge ||
            effectiveAnime.coverImage?.large ||
            effectiveAnime.coverImage?.medium,
          genre: effectiveAnime.genres || [],
          numberOfEpisodes: effectiveAnime.episodes || undefined,
          productionCompany: studioName ? { '@type': 'Organization', name: studioName } : undefined,
          datePublished: effectiveAnime.seasonYear ? `${effectiveAnime.seasonYear}` : undefined,
          aggregateRating: effectiveAnime.averageScore
            ? {
                '@type': 'AggregateRating',
                ratingValue: (effectiveAnime.averageScore / 10).toFixed(1),
                bestRating: '10',
                worstRating: '1',
                ratingCount: effectiveAnime.popularity || undefined,
              }
            : undefined,
          trailer: hasTrailer
            ? {
                '@type': 'VideoObject',
                name: `${animeTitle} Official Trailer`,
                description: `Official HD trailer for ${animeTitle} on AnimeSenpai.`,
                thumbnailUrl: [
                  `https://img.youtube.com/vi/${effectiveTrailer!.id}/maxresdefault.jpg`,
                  `https://img.youtube.com/vi/${effectiveTrailer!.id}/hqdefault.jpg`,
                  effectiveAnime.coverImage?.large,
                ].filter(Boolean),
                uploadDate: effectiveAnime.seasonYear ? `${effectiveAnime.seasonYear}-01-01T00:00:00+00:00` : '2024-01-01T00:00:00+00:00',
                embedUrl: `https://www.youtube.com/embed/${effectiveTrailer!.id}`,
                contentUrl: `https://www.youtube.com/watch?v=${effectiveTrailer!.id}`,
              }
            : undefined,
          url: `${SITE_URL}/anime/${effectiveAnime.id}`,
        }
      : null;

  const breadcrumbSchema =
    effectiveAnime && animeTitle
      ? {
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
              name: 'Discover',
              item: `${SITE_URL}/discover`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: animeTitle,
              item: `${SITE_URL}/anime/${effectiveAnime.id}`,
            },
          ],
        }
      : null;

  const jsonLd = animeSchema ? [animeSchema, breadcrumbSchema] : null;

  useSEO({
    title: pageTitle,
    description: pageDesc,
    keywords: effectiveAnime
      ? `${animeTitle}, ${animeTitle} anime, ${(effectiveAnime.genres || []).join(', ')}, watch ${animeTitle} trailer, ${animeTitle} cast, anime recommendations`
      : undefined,
    canonicalUrl: effectiveAnime ? `${SITE_URL}/anime/${effectiveAnime.id}` : undefined,
    ogType: hasTrailer ? 'video.other' : (effectiveAnime?.format === 'MOVIE' ? 'video.movie' : 'video.tv_show'),
    ogImage: hasTrailer
      ? `https://img.youtube.com/vi/${effectiveTrailer!.id}/maxresdefault.jpg`
      : (effectiveAnime?.coverImage?.extraLarge || effectiveAnime?.coverImage?.large),
    twitterImage: effectiveAnime?.bannerImage || effectiveAnime?.coverImage?.extraLarge,
    twitterCard: hasTrailer ? 'player' : 'summary_large_image',
    videoUrl: hasTrailer ? `https://www.youtube.com/embed/${effectiveTrailer!.id}` : undefined,
    robots: error && !effectiveAnime ? 'noindex, nofollow' : undefined,
    jsonLd,
  });

  const loadDetails = useCallback(async () => {
    if (!animeId || isNaN(animeId) || animeId <= 0) {
      setLoading(false);
      setError('Invalid anime ID');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAnimeDetails(animeId);
      setApiAnime(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to load anime details');
    } finally {
      setLoading(false);
    }
  }, [animeId]);

  useEffect(() => {
    loadDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loadDetails]);

  if (loading) {
    return <DetailsSkeleton />;
  }

  // Graceful Luxury Recovery State when Anime Info is Nothing
  if ((error && !effectiveAnime) || !effectiveAnime) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 space-y-6 text-center animate-fadeIn min-w-0">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-[#0c0c0f] border border-[#23232b] flex items-center justify-center shadow-2xl relative">
          <Film aria-hidden="true" className="w-8 h-8 text-[#9a9aa6]" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500/80 border-2 border-[#000000]" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f5f5f7] tracking-[-0.03em]">
            Anime Information Unavailable
          </h1>
          <p className="text-xs sm:text-sm text-[#9a9aa6] leading-relaxed">
            We couldn&apos;t retrieve details for this title from AniList. The anime may have been unlisted, temporarily unavailable, or the link may be outdated.
          </p>
        </div>

        {/* In-Page Search Box to immediately find another anime */}
        <div className="max-w-md mx-auto pt-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = fallbackSearchQuery.trim();
              if (q) navigate(`/discover?search=${encodeURIComponent(q)}`);
            }}
            className="relative flex items-center"
          >
            <input
              type="search"
              value={fallbackSearchQuery}
              onChange={(e) => setFallbackSearchQuery(e.target.value)}
              placeholder="Search anime catalog..."
              className="w-full pl-10 pr-24 py-3 bg-[#111116] border border-[#23232b] focus:border-[#5360e6] rounded-full text-sm text-[#f5f5f7] placeholder-[#9a9aa6] outline-none transition shadow-inner [&::-webkit-search-cancel-button]:appearance-none"
            />
            <Search aria-hidden="true" className="w-4 h-4 text-[#9a9aa6] absolute left-3.5 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 px-4 py-1.5 rounded-full btn-accent-active text-xs font-bold transition cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={loadDetails}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#16161b] hover:bg-[#202028] text-[#f5f5f7] border border-[#23232b] hover:border-[#383844] text-xs font-semibold transition cursor-pointer min-h-[40px]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#9a9aa6]" />
            <span>Try Again</span>
          </button>
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full btn-accent-active text-xs font-bold transition min-h-[40px]"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Browse Discover</span>
          </Link>
          <Link
            to="/watchlist"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#16161b] hover:bg-[#202028] text-[#f5f5f7] border border-[#23232b] hover:border-[#383844] text-xs font-semibold transition min-h-[40px]"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#9a9aa6]" />
            <span>My Watchlist</span>
          </Link>
        </div>

        {/* Popular Genres Quick Navigation */}
        <div className="pt-4 border-t border-[#1e1e24] max-w-lg mx-auto space-y-2.5">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#71717e] block">
            Or explore popular genres
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {['Action', 'Adventure', 'Comedy', 'Fantasy', 'Romance', 'Sci-Fi', 'Slice of Life'].map(
              (genre) => (
                <Link
                  key={genre}
                  to={`/discover?genre=${encodeURIComponent(genre)}`}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[#111116] hover:bg-[#1a1a22] text-[#9a9aa6] hover:text-[#f5f5f7] border border-[#23232b] hover:border-[#383844] transition"
                >
                  {genre}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active Anime Details (from AniList or recovered from personal Watchlist)
  const anime = effectiveAnime;
  const title = getPreferredTitle(anime.title, 'Anime');
  const banner =
    anime.bannerImage ||
    anime.coverImage?.extraLarge ||
    anime.coverImage?.large ||
    '/animesenpai-banner.svg';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const statusOptions: { id: WatchlistStatus; label: string }[] = [
    { id: 'watching', label: 'Watching' },
    { id: 'plan_to_watch', label: 'Planning' },
    { id: 'completed', label: 'Completed' },
    { id: 'rewatching', label: 'Rewatching' },
    { id: 'paused', label: 'Paused' },
    { id: 'dropped', label: 'Dropped' },
  ];

  const getScoreBadgeClass = (score: number | null) => {
    if (!score) return '';
    if (score >= 75) return 'score-pill-high';
    if (score >= 60) return 'score-pill-med';
    return 'score-pill-low';
  };

  const formatCountdown = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days} days, ${hours} hours`;
    return `${hours} hours, ${mins} minutes`;
  };

  return (
    <div className="space-y-6 pb-8 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="relative w-full h-44 min-[480px]:h-56 sm:h-72 md:h-84 lg:h-96 overflow-hidden bg-[#000000]">
        <img
          src={banner}
          alt={`${title} anime banner`}
          className="w-full h-full object-cover object-center filter brightness-[0.42] contrast-[1.06]"
          fetchPriority="high"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/animesenpai-banner.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/65 to-transparent" />

        {/* Back Link */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-8 z-10">
          <Link
            to={-1 as any}
            className="anilist-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[36px] text-xs font-semibold active:scale-95"
          >
            <ArrowLeft aria-hidden="true" className="w-3.5 h-3.5" />
            <span>Back</span>
          </Link>
        </div>
      </div>

      {/* Saved Watchlist Recovery Notice (if AniList network data is unavailable) */}
      {!apiAnime && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#111116] border border-[#2a2a35] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#9a9aa6]">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0 animate-pulse" />
              <span>
                Viewing saved records from your Watchlist. Full live streaming links and voice cast from AniList are currently unavailable.
              </span>
            </div>
            <button
              type="button"
              onClick={loadDetails}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181820] hover:bg-[#22222c] border border-[#2e2e3a] text-[#f5f5f7] font-semibold cursor-pointer transition text-xs flex-shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#9a9aa6]" />
              <span>Retry AniList</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 min-[480px]:-mt-24 sm:-mt-32 lg:-mt-40 relative z-10 space-y-6">
        {/* Row 1: Poster + Title & Primary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 md:items-end">
          <div className="flex items-end gap-3.5 sm:gap-5 md:contents">
            {/* Poster Card */}
            <div className="w-28 min-[400px]:w-32 sm:w-40 md:w-auto flex-shrink-0 md:col-span-4 lg:col-span-3">
              <div className="relative rounded-2xl overflow-hidden border border-[#232329] bg-[#0b0b0d] aspect-[185/265] shadow-2xl">
                <img
                  src={anime.coverImage?.extraLarge || anime.coverImage?.large || anime.coverImage?.medium || '/animesenpai-banner.svg'}
                  alt={`${title} anime poster`}
                  width={240}
                  height={344}
                  loading="eager"
                  fetchPriority="high"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/animesenpai-banner.svg';
                  }}
                />
                {anime.averageScore && (
                  <div
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded-full font-bold text-[10px] sm:text-xs backdrop-blur-md shadow-lg flex items-center gap-1 tabular-nums ${getScoreBadgeClass(
                      anime.averageScore
                    )}`}
                  >
                    <Smile aria-hidden="true" className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{anime.averageScore}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile-only compact title beside poster */}
            <div className="flex-1 min-w-0 space-y-1.5 pb-0.5 md:hidden">
              {anime.rankings && anime.rankings.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {anime.rankings.slice(0, 1).map((rank) => (
                    <span
                      key={rank.id}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#151519] border border-[#232329] text-white text-[10px] font-mono font-semibold tabular-nums"
                    >
                      <Award aria-hidden="true" className="w-3 h-3 text-[#9a9aa6]" />
                      #{rank.rank} {rank.context}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-lg min-[400px]:text-xl font-extrabold text-white tracking-[-0.025em] leading-snug line-clamp-3 break-words">
                {title}
              </p>

              {anime.title.native && (
                <p className="text-[11px] text-[#9a9aa6] font-medium truncate">
                  {anime.title.native}
                </p>
              )}

              <p className="text-[11px] text-[#c8c8d2] font-medium tabular-nums">
                {anime.format?.replace('_', ' ') || 'Anime'} · {anime.episodes ? `${anime.episodes} eps` : 'Airing'}
                {anime.seasonYear ? ` · ${anime.seasonYear}` : ''}
              </p>
            </div>
          </div>

          {/* Desktop Title + Shared Genres & Action Buttons */}
          <div className="md:col-span-8 lg:col-span-9 space-y-3 text-left">
            <div className="hidden md:block space-y-2.5">
              {anime.rankings && anime.rankings.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {anime.rankings.slice(0, 2).map((rank) => (
                    <span
                      key={rank.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0b0b0d]/90 border border-[#232329] text-white text-xs font-mono font-semibold tabular-nums"
                    >
                      <Award aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
                      #{rank.rank} {rank.context}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-[-0.03em] leading-tight">
                {title}
              </h1>

              {anime.title.native && (
                <p className="text-sm text-[#9a9aa6] font-medium">
                  {anime.title.native}
                </p>
              )}
            </div>

            <h1 className="sr-only md:hidden">{title}</h1>

            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {anime.genres.map((genre) => (
                  <Link
                    key={genre}
                    to={`/discover?genre=${encodeURIComponent(genre)}`}
                    className="text-[11px] sm:text-xs px-3 py-1 rounded-full bg-[#0b0b0d] hover:bg-[#151519] border border-[#232329] hover:border-[#3a3a44] text-[#c8c8d2] hover:text-white font-medium transition"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1.5">
              {hasTrailer && (
                <button
                  type="button"
                  onClick={() => setTrailerModalOpen(true)}
                  className="anilist-btn-primary flex items-center justify-center gap-2 px-5 py-2.5 min-h-[42px] text-xs sm:text-sm flex-1 sm:flex-none cursor-pointer"
                >
                  <Play aria-hidden="true" className="w-4 h-4 fill-current" />
                  <span>Watch Trailer</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="anilist-btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] text-xs sm:text-sm cursor-pointer"
              >
                <Share2 aria-hidden="true" className="w-4 h-4 text-[#9a9aa6]" />
                <span>{copiedShare ? 'Copied!' : 'Share'}</span>
              </button>

              <a
                href={`https://anilist.co/anime/${anime.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="anilist-btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] text-xs sm:text-sm"
              >
                <ExtLinkIcon aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
                <span>AniList</span>
              </a>
            </div>
          </div>
        </div>

        {/* Row 2: Left Sidebar (Tracker + Info) & Right Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            {anime.nextAiringEpisode && (
              <div className="p-3.5 rounded-2xl bg-[#0b0b0d] border border-emerald-500/30 text-[#4ade80] flex items-center gap-2.5 text-xs">
                <Clock aria-hidden="true" className="w-4 h-4 text-[#4ade80] flex-shrink-0" />
                <div className="tabular-nums">
                  <p className="font-semibold">
                    Episode {anime.nextAiringEpisode.episode} airing soon
                  </p>
                  <p className="text-[11px] text-[#4ade80]/80">
                    in {formatCountdown(anime.nextAiringEpisode.timeUntilAiring)}
                  </p>
                </div>
              </div>
            )}

            {/* Watchlist Tracker Box */}
            <div className="p-4 rounded-2xl anilist-card-static space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#9a9aa6]">
                  Watchlist Status
                </span>
                {inWatchlist && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/12 border border-emerald-500/30 text-[#4ade80] font-semibold">
                    In List
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-1.5">
                {statusOptions.map((st) => {
                  const isActive = inWatchlist && watchlistItem?.status === st.id;
                  return (
                    <button
                      type="button"
                      key={st.id}
                      onClick={() => {
                        if (inWatchlist) {
                          updateStatus(anime.id, st.id);
                        } else {
                          addToWatchlist(anime, st.id);
                        }
                      }}
                      className={`px-2.5 py-2 min-h-[38px] rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        isActive
                          ? 'btn-accent-active font-bold'
                          : 'bg-[#16161b] hover:bg-[#1d1d24] text-[#d2d2dc] hover:text-white border border-[#23232b]'
                      }`}
                    >
                      {isActive && <Check aria-hidden="true" className="w-3.5 h-3.5" />}
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>

              {inWatchlist && (
                <div className="pt-3 border-t border-[#232329] space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-[#9a9aa6] font-medium">Episodes:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateProgress(
                            anime.id,
                            Math.max(0, (watchlistItem?.currentEpisode || 0) - 1)
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#151519] hover:bg-[#1c1c22] text-white border border-[#232329] cursor-pointer"
                        title="Decrement episode"
                        aria-label="Decrement episode"
                      >
                        <Minus aria-hidden="true" className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-bold text-white min-w-[3rem] text-center tabular-nums">
                        {watchlistItem?.currentEpisode || 0} / {anime.episodes || '??'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const max = anime.episodes || 9999;
                          updateProgress(
                            anime.id,
                            Math.min(max, (watchlistItem?.currentEpisode || 0) + 1)
                          );
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#151519] hover:bg-[#1c1c22] text-white border border-[#232329] cursor-pointer"
                        title="Increment episode"
                        aria-label="Increment episode"
                      >
                        <Plus aria-hidden="true" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-[#9a9aa6] font-medium">My Rating:</span>
                    <select
                      value={watchlistItem?.userRating || 0}
                      onChange={(e) => updateRating(anime.id, Number(e.target.value))}
                      aria-label="My rating"
                      className="anilist-input text-xs px-2.5 py-1.5 min-h-[36px] font-semibold text-white"
                    >
                      <option value="0">Unrated</option>
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                          {r} / 10 ({r * 10}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromWatchlist(anime.id)}
                    className="w-full text-center text-xs text-rose-400 hover:underline py-1.5 font-medium cursor-pointer"
                  >
                    Remove from List
                  </button>
                </div>
              )}
            </div>

            {/* Information Sidebar */}
            <div className="p-4 rounded-2xl anilist-card-static space-y-3 text-xs">
              <h2 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#9a9aa6] pb-2 border-b border-[#232329]">
                Anime Information
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-3 md:gap-2.5 tabular-nums">
                <div className="flex flex-col md:flex-row md:justify-between md:gap-3">
                  <span className="text-[#666672] text-[11px] md:text-xs">Format</span>
                  <span className="font-semibold text-white uppercase md:text-right">{anime.format?.replace('_', ' ') || 'Unknown'}</span>
                </div>

                <div className="flex flex-col md:flex-row md:justify-between md:gap-3">
                  <span className="text-[#666672] text-[11px] md:text-xs">Status</span>
                  <span className="font-semibold text-white capitalize md:text-right">
                    {anime.status ? anime.status.toLowerCase().replace(/_/g, ' ') : 'Unknown'}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:justify-between md:gap-3">
                  <span className="text-[#666672] text-[11px] md:text-xs">Episodes</span>
                  <span className="font-semibold text-white md:text-right">{anime.episodes || 'TBA'}</span>
                </div>

                <div className="flex flex-col md:flex-row md:justify-between md:gap-3">
                  <span className="text-[#666672] text-[11px] md:text-xs">Duration</span>
                  <span className="font-semibold text-white md:text-right">
                    {anime.duration ? `${anime.duration} mins` : 'Unknown'}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:justify-between md:gap-3">
                  <span className="text-[#666672] text-[11px] md:text-xs">Season</span>
                  <span className="font-semibold text-white md:text-right">
                    {anime.season && anime.seasonYear ? `${anime.season} ${anime.seasonYear}` : 'TBA'}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:justify-between md:gap-3">
                  <span className="text-[#666672] text-[11px] md:text-xs">Studio</span>
                  <span className="font-semibold text-white md:text-right truncate">
                    {anime.studios?.nodes?.[0]?.name || 'Unknown'}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:justify-between md:gap-3">
                  <span className="text-[#666672] text-[11px] md:text-xs">Source</span>
                  <span className="font-semibold text-white capitalize md:text-right">
                    {anime.source ? anime.source.toLowerCase().replace(/_/g, ' ') : 'Original'}
                  </span>
                </div>

                {anime.favourites && (
                  <div className="flex flex-col md:flex-row md:justify-between md:gap-3">
                    <span className="text-[#666672] text-[11px] md:text-xs">Favorites</span>
                    <span className="font-semibold text-rose-400 flex items-center gap-1 md:justify-end">
                      <Heart aria-hidden="true" className="w-3 h-3 fill-rose-400" />
                      {anime.favourites.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Synopsis, OpenLid Segmented Tabs & Content */}
          <div className="md:col-span-8 lg:col-span-9 space-y-6 min-w-0">
            <div className="space-y-2.5 p-5 rounded-2xl anilist-card-static">
              <h2 className="text-[11px] font-mono font-semibold text-[#9a9aa6] uppercase tracking-wider">
                Synopsis
              </h2>
              <p
                className={`text-[#c8c8d2] text-xs sm:text-sm leading-relaxed ${
                  !showFullSynopsis && 'line-clamp-4'
                }`}
              >
                {cleanSynopsis}
              </p>
              {cleanSynopsis.length > 280 && (
                <button
                  type="button"
                  onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                  className="text-xs text-white hover:underline font-semibold flex items-center gap-1 transition pt-1 cursor-pointer"
                >
                  <span>{showFullSynopsis ? 'Show less' : 'Read more'}</span>
                  {showFullSynopsis ? (
                    <ChevronUp aria-hidden="true" className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown aria-hidden="true" className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>

            {/* Official Video Trailer Showcase (Prominent for users & Google Video Indexing) */}
            {hasTrailer && effectiveTrailer?.id && (
              <section
                aria-label={`${animeTitle} Official Trailer`}
                itemScope
                itemType="https://schema.org/VideoObject"
                className="p-4 sm:p-5 rounded-2xl anilist-card-static space-y-3.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#5360e6]/20 border border-[#5360e6]/40 flex items-center justify-center text-[#818cf8] flex-shrink-0">
                      <Play aria-hidden="true" className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <h2 itemProp="name" className="text-xs sm:text-sm font-semibold text-white tracking-wide truncate">
                        {animeTitle} — Official Trailer
                      </h2>
                      <p className="text-[11px] text-[#9a9aa6]">
                        Verified HD preview via official production committee
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#16161b] border border-[#23232b] text-[#818cf8] flex-shrink-0">
                    1080p HD
                  </span>
                </div>

                <meta itemProp="description" content={`Watch the official HD trailer for ${animeTitle} on AnimeSenpai.`} />
                <meta itemProp="thumbnailUrl" content={`https://img.youtube.com/vi/${effectiveTrailer.id}/hqdefault.jpg`} />
                <meta itemProp="embedUrl" content={`https://www.youtube.com/embed/${effectiveTrailer.id}`} />
                <meta itemProp="uploadDate" content={effectiveAnime?.seasonYear ? `${effectiveAnime.seasonYear}-01-01T00:00:00+00:00` : '2024-01-01T00:00:00+00:00'} />

                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#23232b] bg-black shadow-lg">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(effectiveTrailer.id)}?rel=0&modestbranding=1`}
                    title={`${animeTitle} Official Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    className="w-full h-full border-0"
                  />
                </div>
              </section>
            )}

            {/* OpenLid-Style Segmented Pill Tabs */}
            <div className="inline-flex max-w-full items-center gap-1 p-1 rounded-full bg-[#0b0b0d] border border-[#232329] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] overflow-x-auto no-scrollbar touch-scroll-smooth">
              {[
                { id: 'overview', label: 'Overview', icon: Sparkles },
                { id: 'characters', label: `Characters (${anime.characters?.edges?.length || 0})`, icon: Users },
                { id: 'relations', label: `Relations (${anime.relations?.edges?.length || 0})`, icon: GitFork },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition flex-shrink-0 whitespace-nowrap cursor-pointer ${
                      active
                        ? 'btn-accent-active font-bold'
                        : 'text-[#9a9aa6] hover:text-white'
                    }`}
                  >
                    <Icon aria-hidden="true" className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Panels */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Official Links & Resources */}
                <OfficialResources links={anime.externalLinks || []} />

                {/* Characters Spotlight */}
                <CharacterGrid characters={(anime.characters?.edges || []).slice(0, 6)} />

                {/* Franchise Relations */}
                <RelationsGrid relations={anime.relations?.edges || []} />

                {/* Recommendations */}
                <RecommendationsGrid recommendations={anime.recommendations?.nodes || []} />
              </div>
            )}

            {activeTab === 'characters' && (
              <div className="space-y-6 animate-fadeIn">
                <CharacterGrid characters={anime.characters?.edges || []} />
              </div>
            )}


            {activeTab === 'relations' && (
              <div className="space-y-6 animate-fadeIn">
                <RelationsGrid relations={anime.relations?.edges || []} />
                <RecommendationsGrid recommendations={anime.recommendations?.nodes || []} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerModalOpen}
        onClose={() => setTrailerModalOpen(false)}
        trailer={effectiveTrailer}
        title={animeTitle || title}
      />
    </div>
  );
};
