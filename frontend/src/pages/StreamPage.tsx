import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import {
  Tv,
  Play,
  Lock,
  Unlock,
  KeyRound,
  LogIn,
  Search,
  Plus,
  Sparkles,
  ShieldCheck,
  Settings,
  Radio,
  Bookmark,
  Flame,
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';
import { AnimeStreamPlayer } from '../components/anime/AnimeStreamPlayer';
import { fetchAnimeDetails, searchAnimeAutocomplete } from '../api/anilist';
import type { AnimeDetailsData, AnimeCardData } from '../api/types';
import { useSEO } from '../utils/seo';

// Curated popular anime for instant 1-click streaming
const CURATED_STREAM_PICKS: Array<{ id: number; title: string; episodes: number; format: string; cover: string }> = [
  {
    id: 195516,
    title: 'Kusuriya no Hitorigoto 3rd Season',
    episodes: 12,
    format: 'TV',
    cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx195516-Z00gS00Z48xT.jpg',
  },
  {
    id: 154587,
    title: 'Sousou no Frieren (Frieren: Beyond Journey\'s End)',
    episodes: 28,
    format: 'TV',
    cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx154587-n6bLPTzE53m3.jpg',
  },
  {
    id: 16498,
    title: 'Shingeki no Kyojin (Attack on Titan)',
    episodes: 25,
    format: 'TV',
    cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx16498-C6FPmWm59CyP.jpg',
  },
  {
    id: 1,
    title: 'Cowboy Bebop',
    episodes: 26,
    format: 'TV',
    cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx1-CXtrrkMpJ8ig.png',
  },
];

export const StreamPage: React.FC = () => {
  const { id: paramId } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const { watchlist, addToWatchlist, isInWatchlist } = useWatchlist();
  const { user, isAuthenticated, quickDemoLogin } = useAuth();

  // Active Anime state
  const [selectedAnime, setSelectedAnime] = useState<AnimeDetailsData | null>(null);
  const [isLoadingAnime, setIsLoadingAnime] = useState<boolean>(false);
  const [animeLoadError, setAnimeLoadError] = useState<string | null>(null);

  // Vault Passcode state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('animesenpai_stream_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [passcode, setPasscode] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<string>('');

  // Search & add anime state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<AnimeCardData[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);

  // Read episode param
  const initialEpisode = parseInt(searchParams.get('episode') || '1', 10);

  // SEO
  useSEO({
    title: selectedAnime
      ? `Stream ${selectedAnime.title.userPreferred || selectedAnime.title.english || 'Anime'} • Ad-Free | AnimeSenpai`
      : 'Ad-Free Anime Stream Vault • In-App HTML5 Player | AnimeSenpai',
    description: 'Stream anime in 1080p, 720p, and 480p with zero ads, zero external popups, custom subtitles, playback speed controls, and 1-click downloads.',
  });

  // Sync unlock state with storage
  useEffect(() => {
    const handleVaultChange = () => {
      try {
        setIsUnlocked(sessionStorage.getItem('animesenpai_stream_unlocked') === 'true');
      } catch {}
    };
    window.addEventListener('streamVaultStatusChanged', handleVaultChange);
    return () => window.removeEventListener('streamVaultStatusChanged', handleVaultChange);
  }, []);

  // Determine active anime ID
  const activeAnimeId = useMemo(() => {
    if (paramId) return parseInt(paramId, 10);
    const queryId = searchParams.get('id') || searchParams.get('animeId');
    if (queryId) return parseInt(queryId, 10);
    if (watchlist.length > 0 && watchlist[0].anime) return watchlist[0].anime.id;
    return CURATED_STREAM_PICKS[0].id;
  }, [paramId, searchParams, watchlist]);

  // Fetch anime details when ID changes
  useEffect(() => {
    if (!activeAnimeId || isNaN(activeAnimeId)) return;

    let isMounted = true;
    setIsLoadingAnime(true);
    setAnimeLoadError(null);

    fetchAnimeDetails(activeAnimeId)
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          setSelectedAnime(data);
        } else {
          setAnimeLoadError(`Anime with ID ${activeAnimeId} not found.`);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load anime details:', err);
        setAnimeLoadError('Failed to load anime stream details. Please check your network connection.');
      })
      .finally(() => {
        if (isMounted) setIsLoadingAnime(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeAnimeId]);

  // Handle Passcode Unlock
  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === '111111') {
      try {
        sessionStorage.setItem('animesenpai_stream_unlocked', 'true');
        window.dispatchEvent(new Event('streamVaultStatusChanged'));
      } catch {}
      setIsUnlocked(true);
      setPasscodeError('');
    } else {
      setPasscodeError('Incorrect passcode! Please enter 111111 to unlock.');
    }
  };

  const handleQuickUnlock = () => {
    setPasscode('111111');
    try {
      sessionStorage.setItem('animesenpai_stream_unlocked', 'true');
      window.dispatchEvent(new Event('streamVaultStatusChanged'));
    } catch {}
    setIsUnlocked(true);
    setPasscodeError('');
  };

  const handleLockVault = () => {
    try {
      sessionStorage.removeItem('animesenpai_stream_unlocked');
      window.dispatchEvent(new Event('streamVaultStatusChanged'));
    } catch {}
    setIsUnlocked(false);
    setPasscode('');
    setPasscodeError('');
  };

  // Autocomplete search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchAnimeAutocomplete(searchQuery.trim());
        setSearchResults(results.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Select Anime to Stream
  const handleSelectAnime = (animeId: number) => {
    setSearchParams({ id: animeId.toString(), episode: '1' });
    setSearchQuery('');
    setSearchResults([]);
  };

  // Add anime to library and stream
  const handleAddAndStream = (animeCard: AnimeCardData) => {
    // Add to watchlist if not already
    if (!isInWatchlist(animeCard.id)) {
      // Create minimal details wrapper
      const minimalAnime: any = {
        ...animeCard,
        description: '',
        genres: animeCard.genres || [],
        averageScore: animeCard.averageScore || 0,
        popularity: animeCard.popularity || 0,
        episodes: animeCard.episodes || 12,
      };
      addToWatchlist(minimalAnime, 'watching');
    }
    handleSelectAnime(animeCard.id);
  };

  // 1. GATE: Authentication Required
  if (!isAuthenticated || !user) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[75vh]">
        <div className="w-full max-w-lg p-8 rounded-3xl bg-[#151f2e]/90 border border-white/10 shadow-2xl backdrop-blur-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3db4f2]/10 border border-[#3db4f2]/30 text-[#3db4f2] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>VIP Member Stream Feature</span>
            </div>
            <h1 className="text-2xl font-black text-white">Stream Vault Access Required</h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              In-app ad-free anime streaming and 1-click direct MP4 downloads are reserved for members.
              Please sign in to unlock your personal streaming theater.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/login?redirect=/stream"
              className="flex-1 py-3 px-4 rounded-xl anilist-btn-primary font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#3db4f2]/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Stream</span>
            </Link>
            <button
              onClick={() => quickDemoLogin()}
              className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition"
            >
              Quick Guest Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. GATE: Passcode Required (111111)
  if (!isUnlocked) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[75vh]">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#151f2e]/95 border border-white/15 shadow-2xl backdrop-blur-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#3db4f2]/15 border border-[#3db4f2]/30 flex items-center justify-center mx-auto text-[#3db4f2]">
            <KeyRound className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Enter Stream Passcode</h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              This VIP streaming vault is passcode protected. Enter the 6-digit access code to unlock pure, ad-free in-app playback and 1-click video downloads.
            </p>
          </div>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div className="space-y-1">
              <input
                type="password"
                maxLength={6}
                placeholder="••••••"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value.replace(/\D/g, ''));
                  setPasscodeError('');
                }}
                autoFocus
                className="w-full text-center text-3xl font-mono tracking-[0.5em] py-3 px-4 rounded-xl bg-[#0b1622] text-[#3db4f2] border border-white/20 focus:border-[#3db4f2] outline-none shadow-inner transition"
              />
              {passcodeError && (
                <p className="text-xs text-rose-400 font-semibold pt-1">{passcodeError}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl anilist-btn-primary font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#3db4f2]/20"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Stream (111111)</span>
              </button>
              <button
                type="button"
                onClick={handleQuickUnlock}
                className="py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold"
                title="1-Click Auto Fill Passcode"
              >
                Auto-Unlock
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Default VIP access code: <span className="text-[#3db4f2] font-mono font-bold">111111</span>
            </p>
          </form>
        </div>
      </div>
    );
  }

  // 3. UNLOCKED STREAM SECTION
  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner / Vault Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#151f2e]/90 border border-white/10 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white">Stream Vault</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>100% Ad-Free Guarantee</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Pure in-app HTML5 streaming • Zero external redirects • Direct 1-click video downloads
            </p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowHowItWorks((prev) => !prev)}
            className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>How Real Anime Streams Work</span>
          </button>

          <Link
            to="/settings"
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Settings className="w-3.5 h-3.5 text-[#3db4f2]" />
            <span>Player Settings</span>
          </Link>

          <button
            onClick={handleLockVault}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Re-lock vault with passcode 111111"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Vault</span>
          </button>
        </div>
      </div>

      {/* "How Real Anime Streams Work" Informational Card (Toggleable) */}
      {showHowItWorks && (
        <div className="p-6 rounded-2xl bg-[#111927] border border-purple-500/30 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-purple-300 font-bold">
              <Radio className="w-5 h-5 text-purple-400" />
              <h2 className="text-base">How Real Anime Streams Work & How AnimeSenpai Fetches Them</h2>
            </div>
            <button
              onClick={() => setShowHowItWorks(false)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed text-slate-300">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <span className="font-extrabold text-[#3db4f2] text-sm block">1. Metadata vs Media</span>
              <p>
                APIs like AniList and MyAnimeList provide show information, episode numbers, character lists, and posters. They legally do not host full copyrighted video files.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <span className="font-extrabold text-emerald-400 text-sm block">2. Reverse Proxy & Referers</span>
              <p>
                Video servers (Megacloud, Vidstream, Gogo) require HTTP <code className="font-mono text-purple-300">Referer</code> headers. Standard browsers block this cross-origin. AnimeSenpai provides a built-in backend proxy (<code className="font-mono text-emerald-300">/api/stream/proxy</code>) that injects the required headers so videos stream without CORS or 403 blocks!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <span className="font-extrabold text-amber-400 text-sm block">3. In-App Ad-Free Player</span>
              <p>
                Instead of embedding external iframes full of popups, AnimeSenpai streams video directly via HTML5 & Hls.js with native scrub controls, audio tracks, and 1-click downloads.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout: Left/Top is Player, Right/Bottom is Library Stream Switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left 3 cols: Stream Player */}
        <div className="lg:col-span-3 space-y-6">
          {isLoadingAnime ? (
            <div className="w-full aspect-video rounded-2xl bg-[#151f2e] border border-white/10 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-white/10 border-t-[#3db4f2] animate-spin" />
              <p className="text-xs text-slate-400">Loading anime stream data...</p>
            </div>
          ) : animeLoadError ? (
            <div className="p-8 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-center space-y-3">
              <p className="text-sm font-bold text-rose-300">{animeLoadError}</p>
              <button
                onClick={() => handleSelectAnime(CURATED_STREAM_PICKS[0].id)}
                className="px-4 py-2 rounded-xl anilist-btn-primary text-xs font-bold"
              >
                Load Default Demo Stream
              </button>
            </div>
          ) : selectedAnime ? (
            <AnimeStreamPlayer
              anime={selectedAnime}
              initialEpisode={initialEpisode}
              onEpisodeChange={(ep) => {
                setSearchParams({ id: selectedAnime.id.toString(), episode: ep.toString() });
              }}
            />
          ) : null}
        </div>

        {/* Right 1 col: Stream Library & Quick Switcher */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Quick Search & Add Anime to Stream */}
          <div className="anilist-card-static rounded-2xl p-4 border border-white/10 bg-[#151f2e]/80 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
              <span>Add Anime to Stream</span>
              <Plus className="w-3.5 h-3.5 text-[#3db4f2]" />
            </h2>

            <div className="relative">
              <input
                type="text"
                placeholder="Search anime title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-[#0b1622] rounded-xl text-white placeholder-slate-400 border border-white/10 focus:border-[#3db4f2] outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              {isSearching && (
                <div className="w-3.5 h-3.5 border-2 border-[#3db4f2] border-t-transparent rounded-full animate-spin absolute right-2.5 top-2.5" />
              )}

              {/* Autocomplete Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0b1622] border border-white/15 rounded-xl shadow-2xl p-1.5 z-30 max-h-72 overflow-y-auto space-y-1">
                  {searchResults.map((res) => {
                    const title = res.title.english || res.title.romaji || res.title.userPreferred;
                    return (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => handleAddAndStream(res)}
                        className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 text-left transition group cursor-pointer"
                      >
                        <img
                          src={res.coverImage.medium}
                          alt={title}
                          className="w-7 h-10 object-cover rounded bg-[#151f2e] flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-200 group-hover:text-[#3db4f2] truncate">
                            {title}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {res.episodes ? `${res.episodes} eps` : 'TV'} • {res.seasonYear || 'TBA'}
                          </p>
                        </div>
                        <Play className="w-3.5 h-3.5 text-[#3db4f2] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* User's Watchlist / Library Streams */}
          <div className="anilist-card-static rounded-2xl p-4 border border-white/10 bg-[#151f2e]/80 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-[#3db4f2]" />
                <span>My Stream Library ({watchlist.length})</span>
              </h2>
              <Link to="/watchlist" className="text-[11px] text-[#3db4f2] hover:underline font-bold">
                View All
              </Link>
            </div>

            {watchlist.length === 0 ? (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-2">
                <p className="text-xs text-slate-400">No anime in your library yet.</p>
                <p className="text-[11px] text-slate-500">
                  Search anime above or pick from popular titles below to stream!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {watchlist.map((item) => {
                  const anime = item.anime;
                  if (!anime) return null;
                  const animeId = anime.id;
                  const isActive = selectedAnime?.id === animeId;
                  const itemTitle = anime.title.english || anime.title.romaji || anime.title.userPreferred || 'Anime';
                  return (
                    <button
                      key={animeId}
                      type="button"
                      onClick={() => handleSelectAnime(animeId)}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition text-left cursor-pointer border ${
                        isActive
                          ? 'bg-[#3db4f2]/15 border-[#3db4f2] text-white'
                          : 'bg-[#0b1622]/60 hover:bg-white/[0.08] border-white/5 text-slate-300'
                      }`}
                    >
                      <img
                        src={anime?.coverImage?.medium || anime?.coverImage?.large}
                        alt={itemTitle}
                        className="w-9 h-12 object-cover rounded-lg bg-[#0b1622] flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold truncate ${isActive ? 'text-[#3db4f2]' : 'text-slate-200'}`}>
                          {itemTitle}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Ep {item.currentEpisode || 1} / {anime?.episodes || '??'}
                        </p>
                        <span className="inline-block px-1.5 py-0.2 rounded text-[9px] uppercase font-bold bg-white/5 text-slate-400 mt-1">
                          {item.status}
                        </span>
                      </div>
                      {isActive ? (
                        <div className="w-2 h-2 rounded-full bg-[#3db4f2] animate-pulse" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Popular Curated Stream Picks */}
          <div className="anilist-card-static rounded-2xl p-4 border border-white/10 bg-[#151f2e]/80 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Stream Picks</span>
            </h2>

            <div className="space-y-2">
              {CURATED_STREAM_PICKS.map((pick) => {
                const isActive = selectedAnime?.id === pick.id;
                return (
                  <button
                    key={pick.id}
                    type="button"
                    onClick={() => handleSelectAnime(pick.id)}
                    className={`w-full flex items-center gap-2 p-1.5 rounded-xl transition text-left cursor-pointer border ${
                      isActive
                        ? 'bg-[#3db4f2]/15 border-[#3db4f2] text-white'
                        : 'bg-[#0b1622]/40 hover:bg-white/[0.06] border-white/5 text-slate-300'
                    }`}
                  >
                    <img
                      src={pick.cover}
                      alt={pick.title}
                      className="w-8 h-10 object-cover rounded-lg bg-[#0b1622] flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate text-slate-200">
                        {pick.title}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {pick.episodes} Episodes • {pick.format}
                      </p>
                    </div>
                    <Play className="w-3.5 h-3.5 text-[#3db4f2]" />
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
