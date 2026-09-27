import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Tv,
  GitFork,
  Smile,
} from 'lucide-react';
import { fetchAnimeDetails } from '../api/anilist';
import type { AnimeDetailsData, WatchlistStatus } from '../api/types';
import { TrailerModal } from '../components/common/TrailerModal';
import { StreamingPlatforms } from '../components/anime/StreamingPlatforms';
import { CharacterGrid } from '../components/anime/CharacterGrid';
import { EpisodesGrid } from '../components/anime/EpisodesGrid';
import { RelationsGrid } from '../components/anime/RelationsGrid';
import { RecommendationsGrid } from '../components/anime/RecommendationsGrid';
import { DetailsSkeleton } from '../components/common/Skeleton';
import { useWatchlist } from '../context/WatchlistContext';

export const AnimeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<AnimeDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'characters' | 'episodes' | 'relations' | 'recommendations'>('overview');

  const {
    isInWatchlist,
    getItem,
    addToWatchlist,
    removeFromWatchlist,
    updateStatus,
    updateProgress,
    updateRating,
  } = useWatchlist();

  const animeId = Number(id);
  const inWatchlist = isInWatchlist(animeId);
  const watchlistItem = getItem(animeId);

  useEffect(() => {
    const loadDetails = async () => {
      if (!animeId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAnimeDetails(animeId);
        setAnime(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load anime details');
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [animeId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DetailsSkeleton />
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="max-w-md mx-auto my-20 p-6 rounded-xl anilist-card-static text-center space-y-3">
        <h2 className="text-base font-bold text-[#edf1f5]">Anime Not Found</h2>
        <p className="text-xs text-[#8ba0b2]">{error || 'Could not find details for this anime.'}</p>
        <Link
          to="/discover"
          className="anilist-btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Discover</span>
        </Link>
      </div>
    );
  }

  const title = anime.title.userPreferred || anime.title.english || anime.title.romaji;
  const banner = anime.bannerImage || anime.coverImage.extraLarge;
  const cleanSynopsis = anime.description
    ? anime.description.replace(/<[^>]*>?/gm, '').replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    : 'No synopsis available.';

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
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden bg-[#0b1622]">
        <img
          src={banner}
          alt=""
          className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.08]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1622] via-[#0b1622]/60 to-transparent" />

        {/* Back Link */}
        <div className="absolute top-4 left-4 sm:left-8 z-10">
          <Link
            to={-1 as any}
            className="anilist-btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold shadow-md border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Link>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-28 sm:-mt-40 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column: Poster, Status Tracker & Metadata Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">
            {/* Poster Card */}
            <div className="relative rounded-lg overflow-hidden border border-white/10 bg-[#11161d] aspect-[185/265] max-w-xs mx-auto lg:max-w-none shadow-2xl">
              <img
                src={anime.coverImage.extraLarge || anime.coverImage.large}
                alt={title}
                className="w-full h-full object-cover"
              />
              {/* Score Overlay */}
              {anime.averageScore && (
                <div
                  className={`absolute top-3 right-3 px-2 py-0.5 rounded font-bold text-xs backdrop-blur-md shadow-lg flex items-center gap-1 ${getScoreBadgeClass(
                    anime.averageScore
                  )}`}
                >
                  <Smile className="w-3.5 h-3.5" />
                  <span>{anime.averageScore}%</span>
                </div>
              )}
            </div>

            {/* Next Airing Countdown Banner if applicable */}
            {anime.nextAiringEpisode && (
              <div className="p-3 rounded-lg bg-[#0b1622]/90 border border-[#7bd555]/35 text-[#7bd555] flex items-center gap-2.5 text-xs">
                <Clock className="w-4 h-4 text-[#7bd555] flex-shrink-0 animate-pulse" />
                <div>
                  <p className="font-bold">
                    Episode {anime.nextAiringEpisode.episode} airing soon
                  </p>
                  <p className="text-[11px] text-[#7bd555]/80">
                    in {formatCountdown(anime.nextAiringEpisode.timeUntilAiring)}
                  </p>
                </div>
              </div>
            )}

            {/* Watchlist Tracker Box */}
            <div className="p-4 rounded-xl anilist-card-static space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8ba0b2]">
                  Watchlist Status
                </span>
                {inWatchlist && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#7bd555]/15 border border-[#7bd555]/30 text-[#7bd555] font-bold">
                    In List
                  </span>
                )}
              </div>

              {/* Status Selector Grid */}
              <div className="grid grid-cols-2 gap-1.5">
                {statusOptions.map((st) => {
                  const isActive = inWatchlist && watchlistItem?.status === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => {
                        if (inWatchlist) {
                          updateStatus(anime.id, st.id);
                        } else {
                          addToWatchlist(anime, st.id);
                        }
                      }}
                      className={`px-2.5 py-2 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        isActive
                          ? 'anilist-btn-primary'
                          : 'bg-[#0b1622] hover:bg-[#1f2c3f] text-[#edf1f5] border border-white/10'
                      }`}
                    >
                      {isActive && <Check className="w-3.5 h-3.5" />}
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Episode Progress & Rating */}
              {inWatchlist && (
                <div className="pt-2.5 border-t border-white/[0.06] space-y-2.5">
                  {/* Episode progress counter */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8ba0b2] font-semibold">Episodes Watched:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          updateProgress(
                            anime.id,
                            Math.max(0, (watchlistItem?.currentEpisode || 0) - 1)
                          )
                        }
                        className="p-1 rounded bg-[#0b1622] hover:bg-[#1f2c3f] text-[#edf1f5] border border-white/10"
                        title="Decrement episode"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold text-[#3db4f2] min-w-[2.5rem] text-center">
                        {watchlistItem?.currentEpisode || 0} / {anime.episodes || '??'}
                      </span>
                      <button
                        onClick={() => {
                          const max = anime.episodes || 9999;
                          updateProgress(
                            anime.id,
                            Math.min(max, (watchlistItem?.currentEpisode || 0) + 1)
                          );
                        }}
                        className="p-1 rounded bg-[#0b1622] hover:bg-[#1f2c3f] text-[#edf1f5] border border-white/10"
                        title="Increment episode"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Personal Rating */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8ba0b2] font-semibold">My Rating:</span>
                    <select
                      value={watchlistItem?.userRating || 0}
                      onChange={(e) => updateRating(anime.id, Number(e.target.value))}
                      className="anilist-input text-xs px-2 py-1 font-bold text-[#e4a834]"
                    >
                      <option value="0">Unrated</option>
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                          {r} / 10 ({r * 10}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Remove action */}
                  <button
                    onClick={() => removeFromWatchlist(anime.id)}
                    className="w-full text-center text-xs text-[#e85d75] hover:underline pt-1 font-semibold"
                  >
                    Remove from List
                  </button>
                </div>
              )}
            </div>

            {/* Information Sidebar */}
            <div className="p-4 rounded-xl anilist-card-static space-y-2.5 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-[#8ba0b2] pb-2 border-b border-white/[0.06]">
                Information
              </h3>

              <div className="flex justify-between">
                <span className="text-[#8ba0b2]">Format:</span>
                <span className="font-bold text-[#edf1f5] uppercase">{anime.format || 'Unknown'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8ba0b2]">Status:</span>
                <span className="font-bold text-[#edf1f5] capitalize">
                  {anime.status ? anime.status.toLowerCase().replace('_', ' ') : 'Unknown'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8ba0b2]">Episodes:</span>
                <span className="font-bold text-[#edf1f5]">{anime.episodes || 'TBA'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8ba0b2]">Episode Duration:</span>
                <span className="font-bold text-[#edf1f5]">
                  {anime.duration ? `${anime.duration} mins` : 'Unknown'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8ba0b2]">Season:</span>
                <span className="font-bold text-[#edf1f5]">
                  {anime.season && anime.seasonYear ? `${anime.season} ${anime.seasonYear}` : 'TBA'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8ba0b2]">Studio:</span>
                <span className="font-bold text-[#3db4f2]">
                  {anime.studios?.nodes?.[0]?.name || 'Unknown'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8ba0b2]">Source:</span>
                <span className="font-bold text-[#edf1f5] capitalize">
                  {anime.source ? anime.source.toLowerCase().replace('_', ' ') : 'Original'}
                </span>
              </div>

              {anime.favourites && (
                <div className="flex justify-between">
                  <span className="text-[#8ba0b2]">Favorites:</span>
                  <span className="font-bold text-[#e85d75] flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-[#e85d75]" />
                    {anime.favourites.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details, Rankings, Navigation Tabs & Content */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Title & Action Buttons */}
            <div className="space-y-3">
              {/* Rankings Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {anime.rankings?.slice(0, 2).map((rank) => (
                  <span
                    key={rank.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#3db4f2]/15 border border-[#3db4f2]/30 text-[#3db4f2] text-xs font-bold backdrop-blur-md"
                  >
                    <Award className="w-3.5 h-3.5 text-[#3db4f2]" />
                    #{rank.rank} {rank.context}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#edf1f5] tracking-tight leading-tight">
                {title}
              </h1>

              {anime.title.native && (
                <p className="text-xs sm:text-sm text-[#8ba0b2] font-medium font-sans">
                  {anime.title.native}
                </p>
              )}

              {/* Genres */}
              {anime.genres && anime.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {anime.genres.map((genre) => (
                    <Link
                      key={genre}
                      to={`/discover?genre=${encodeURIComponent(genre)}`}
                      className="text-xs px-2.5 py-1 rounded bg-[#151f2e] hover:bg-[#1f2c3f] border border-white/10 text-[#edf1f5] font-semibold transition"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              )}

              {/* Action Buttons Bar */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                {anime.trailer?.id && (
                  <button
                    onClick={() => setTrailerModalOpen(true)}
                    className="anilist-btn-primary flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Watch Trailer</span>
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="anilist-btn-secondary flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold border border-white/10"
                >
                  <Share2 className="w-4 h-4 text-[#8ba0b2]" />
                  <span>{copiedShare ? 'Link Copied!' : 'Share'}</span>
                </button>

                <a
                  href={`https://anilist.co/anime/${anime.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="anilist-btn-secondary flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold border border-white/10"
                >
                  <ExtLinkIcon className="w-3.5 h-3.5 text-[#3db4f2]" />
                  <span>AniList</span>
                </a>
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-2.5 p-4 sm:p-5 rounded-xl anilist-card-static">
              <h3 className="text-xs font-bold text-[#edf1f5] uppercase tracking-wider">
                Synopsis
              </h3>
              <p
                className={`text-[#8ba0b2] text-xs sm:text-sm leading-relaxed ${
                  !showFullSynopsis && 'line-clamp-4'
                }`}
              >
                {cleanSynopsis}
              </p>
              {cleanSynopsis.length > 280 && (
                <button
                  onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                  className="text-xs text-[#3db4f2] hover:underline font-bold flex items-center gap-1 transition pt-1"
                >
                  <span>{showFullSynopsis ? 'Show less' : 'Read more'}</span>
                  {showFullSynopsis ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* Content Tabs */}
            <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-[#151f2e] border border-white/10">
              {[
                { id: 'overview', label: 'Overview', icon: Sparkles },
                { id: 'characters', label: `Characters (${anime.characters?.edges?.length || 0})`, icon: Users },
                { id: 'episodes', label: `Episodes (${anime.streamingEpisodes?.length || anime.episodes || 0})`, icon: Tv },
                { id: 'relations', label: `Relations (${anime.relations?.edges?.length || 0})`, icon: GitFork },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-bold transition ${
                      active
                        ? 'bg-[#3db4f2] text-white shadow-sm'
                        : 'text-[#8ba0b2] hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Panels */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Where to Stream */}
                <StreamingPlatforms links={anime.externalLinks || []} />

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

            {activeTab === 'episodes' && (
              <div className="space-y-6 animate-fadeIn">
                <EpisodesGrid
                  episodes={anime.streamingEpisodes || []}
                  totalEpisodes={anime.episodes}
                />
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
        trailer={anime.trailer}
        title={title}
      />
    </div>
  );
};
