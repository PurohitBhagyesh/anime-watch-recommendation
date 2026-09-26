import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Play,
  Check,
  Award,
  Share2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Plus,
  Minus,
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
      <div className="max-w-md mx-auto my-20 p-6 rounded-2xl apple-card-static text-center space-y-3">
        <h2 className="text-base font-bold text-white">Anime Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'Could not find details for this anime.'}</p>
        <Link
          to="/discover"
          className="apple-btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Discover</span>
        </Link>
      </div>
    );
  }

  const title = anime.title.english || anime.title.romaji || anime.title.userPreferred;
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
    { id: 'plan_to_watch', label: 'Plan to Watch' },
    { id: 'completed', label: 'Completed' },
    { id: 'favorite', label: 'Favorite' },
  ];

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="relative w-full h-56 sm:h-72 md:h-80 overflow-hidden bg-[#0a0d14]">
        <img
          src={banner}
          alt=""
          className="w-full h-full object-cover object-center filter brightness-[0.5] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-[#05070b]/60 to-transparent" />
        
        {/* Back Link */}
        <div className="absolute top-4 left-4 sm:left-8 z-10">
          <Link
            to={-1 as any}
            className="apple-btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Link>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-28 sm:-mt-36 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column: Poster, Status Tracker & Metadata Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {/* Poster Card */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0a0d14] aspect-[3/4] max-w-xs mx-auto lg:max-w-none shadow-xl">
              <img
                src={anime.coverImage.extraLarge || anime.coverImage.large}
                alt={title}
                className="w-full h-full object-cover"
              />
              {/* Score Overlay */}
              {anime.averageScore && (
                <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-full bg-black/70 backdrop-blur-xl border border-white/10 text-amber-300 font-bold text-xs flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  <span>{(anime.averageScore / 10).toFixed(1)} / 10</span>
                </div>
              )}
            </div>

            {/* Watchlist Tracker Box */}
            <div className="p-4 rounded-2xl apple-card-static space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  Watch Status
                </span>
                {inWatchlist && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#0071e3]/20 border border-[#0071e3]/40 text-[#2997ff] font-semibold">
                    In Watchlist
                  </span>
                )}
              </div>

              {/* Status Selector */}
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
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                        isActive
                          ? 'apple-btn-primary'
                          : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/10'
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3" />}
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Episode Progress & Rating */}
              {inWatchlist && (
                <div className="pt-2.5 border-t border-white/[0.08] space-y-2.5">
                  {/* Episode progress counter */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Episodes Watched:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          updateProgress(anime.id, Math.max(0, (watchlistItem?.currentEpisode || 0) - 1))
                        }
                        className="p-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 border border-white/10"
                        title="Decrement episode"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold text-[#2997ff] min-w-[2.5rem] text-center">
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
                        className="p-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 border border-white/10"
                        title="Increment episode"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Personal Rating */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">My Score:</span>
                    <select
                      value={watchlistItem?.userRating || 0}
                      onChange={(e) => updateRating(anime.id, Number(e.target.value))}
                      className="apple-input text-xs px-2 py-1"
                    >
                      <option value="0">Unrated</option>
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                          {r} / 10
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Remove action */}
                  <button
                    onClick={() => removeFromWatchlist(anime.id)}
                    className="w-full text-center text-xs text-rose-400 hover:text-rose-300 pt-1 font-medium"
                  >
                    Remove from Watchlist
                  </button>
                </div>
              )}
            </div>

            {/* Information Sidebar */}
            <div className="p-4 rounded-2xl apple-card-static space-y-2.5 text-xs">
              <h3 className="font-semibold uppercase tracking-wider text-slate-400 font-mono pb-2 border-b border-white/[0.08]">
                Information
              </h3>

              <div className="flex justify-between">
                <span className="text-slate-400">Format:</span>
                <span className="font-semibold text-slate-200 uppercase">{anime.format || 'Unknown'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-semibold text-slate-200 capitalize">
                  {anime.status ? anime.status.toLowerCase().replace('_', ' ') : 'Unknown'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Episodes:</span>
                <span className="font-semibold text-slate-200">{anime.episodes || 'TBA'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="font-semibold text-slate-200">
                  {anime.duration ? `${anime.duration} mins` : 'Unknown'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Season:</span>
                <span className="font-semibold text-slate-200">
                  {anime.season && anime.seasonYear ? `${anime.season} ${anime.seasonYear}` : 'TBA'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Studio:</span>
                <span className="font-semibold text-[#2997ff]">
                  {anime.studios?.nodes?.[0]?.name || 'Unknown'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Source:</span>
                <span className="font-semibold text-slate-200 capitalize">
                  {anime.source ? anime.source.toLowerCase().replace('_', ' ') : 'Original'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title & Action Buttons */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {anime.rankings?.slice(0, 2).map((rank) => (
                  <span
                    key={rank.id}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0071e3]/15 border border-[#0071e3]/30 text-[#2997ff] text-xs font-semibold backdrop-blur-md"
                  >
                    <Award className="w-3.5 h-3.5 text-[#2997ff]" />
                    #{rank.rank} {rank.context}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                {title}
              </h1>

              {anime.title.native && (
                <p className="text-xs sm:text-sm text-slate-400 font-medium">{anime.title.native}</p>
              )}

              {/* Genres */}
              {anime.genres && anime.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {anime.genres.map((genre) => (
                    <Link
                      key={genre}
                      to={`/discover?genre=${encodeURIComponent(genre)}`}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-200 font-medium backdrop-blur-md transition"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                {anime.trailer?.id && (
                  <button
                    onClick={() => setTrailerModalOpen(true)}
                    className="apple-btn-primary flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Watch Trailer</span>
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="apple-btn-secondary flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm"
                >
                  <Share2 className="w-4 h-4 text-slate-400" />
                  <span>{copiedShare ? 'Link Copied' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-2.5 p-4 sm:p-5 rounded-2xl apple-card-static">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Synopsis
              </h3>
              <p
                className={`text-slate-300 text-xs sm:text-sm leading-relaxed ${
                  !showFullSynopsis && 'line-clamp-4'
                }`}
              >
                {cleanSynopsis}
              </p>
              {cleanSynopsis.length > 280 && (
                <button
                  onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                  className="text-xs text-[#2997ff] hover:underline font-semibold flex items-center gap-1 transition pt-1"
                >
                  <span>{showFullSynopsis ? 'Show less' : 'Read more'}</span>
                  {showFullSynopsis ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* Where to Stream */}
            <StreamingPlatforms links={anime.externalLinks || []} />

            {/* Streaming Episodes */}
            <EpisodesGrid
              episodes={anime.streamingEpisodes || []}
              totalEpisodes={anime.episodes}
            />

            {/* Characters & Voice Cast */}
            <CharacterGrid characters={anime.characters?.edges || []} />

            {/* Franchise & Related Titles */}
            <RelationsGrid relations={anime.relations?.edges || []} />

            {/* Recommendations */}
            <RecommendationsGrid recommendations={anime.recommendations?.nodes || []} />
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
