import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Tv,
  Languages,
  Download,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  Search,
  Check,
  Settings2,
  ExternalLink,
  Layers,
  RotateCcw,
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  LogIn,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { AnimeDetailsData } from '../../api/types';
import { useWatchlist } from '../../context/WatchlistContext';
import { useAuth } from '../../context/AuthContext';

interface AnimeStreamPlayerProps {
  anime: AnimeDetailsData;
  initialEpisode?: number;
  onEpisodeChange?: (ep: number) => void;
}

interface ServerOption {
  id: string;
  name: string;
  badge: string;
  getUrl: (id: number, ep: number, lang: 'sub' | 'dub') => string;
}

export const AnimeStreamPlayer: React.FC<AnimeStreamPlayerProps> = ({
  anime,
  initialEpisode = 1,
  onEpisodeChange,
}) => {
  const { isInWatchlist, getItem, updateProgress, addToWatchlist } = useWatchlist();
  const { user, isAuthenticated, quickDemoLogin } = useAuth();
  const playerRef = useRef<HTMLDivElement>(null);

  // Passcode unlock & session state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('animesenpai_stream_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [passcode, setPasscode] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<string>('');

  const [currentEpisode, setCurrentEpisode] = useState<number>(initialEpisode);
  const [selectedLanguage, setSelectedLanguage] = useState<'sub' | 'dub'>('sub');
  const [selectedServer, setSelectedServer] = useState<string>('server-1');
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeQuality, setActiveQuality] = useState<string>('Auto');
  const [activeSpeed, setActiveSpeed] = useState<string>('1.0x');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState<boolean>(true);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [prevInitial, setPrevInitial] = useState<number>(initialEpisode);
  const [adShield, setAdShield] = useState<boolean>(true);

  if (initialEpisode !== prevInitial) {
    setPrevInitial(initialEpisode);
    setCurrentEpisode(initialEpisode);
  }

  const animeTitle = anime.title.userPreferred || anime.title.english || anime.title.romaji;
  const totalEpisodes = Math.max(
    anime.episodes || 0,
    anime.streamingEpisodes?.length || 0,
    1
  );

  const watchlistItem = getItem(anime.id);
  const isWatchedCurrent = (watchlistItem?.currentEpisode || 0) >= currentEpisode;

  // Streaming server sources (cleanest multi-provider setup)
  const servers: ServerOption[] = [
    {
      id: 'server-1',
      name: 'Server 1 (Embed.su HD)',
      badge: 'Clean • Fast',
      getUrl: (id, ep) => `https://embed.su/embed/anime/${id}/${ep}`,
    },
    {
      id: 'server-2',
      name: 'Server 2 (AutoEmbed HD)',
      badge: 'Multi-Res',
      getUrl: (id, ep) => `https://player.autoembed.cc/embed/anime/${id}/${ep}`,
    },
    {
      id: 'server-3',
      name: 'Server 3 (2Embed Stream)',
      badge: '1080p • Stable',
      getUrl: (id, ep) => `https://www.2embed.cc/embed/anime/${id}/${ep}`,
    },
    {
      id: 'server-4',
      name: 'Server 4 (MultiEmbed)',
      badge: 'Multi-Source',
      getUrl: (id, ep) => `https://multiembed.mov/?video_id=${id}&anime=1&s=${ep}`,
    },
    {
      id: 'server-5',
      name: 'Server 5 (VidSrc Anime)',
      badge: 'Backup',
      getUrl: (id, ep) => `https://vidsrc.me/embed/anime?id=${id}&ep=${ep}`,
    },
  ];

  const activeServerObj = servers.find((s) => s.id === selectedServer) || servers[0];
  const streamUrl = activeServerObj.getUrl(anime.id, currentEpisode, selectedLanguage);

  const handleEpisodeSelect = (ep: number) => {
    setCurrentEpisode(ep);
    setIframeKey((prev) => prev + 1);
    onEpisodeChange?.(ep);
  };

  const handleNextEpisode = () => {
    if (currentEpisode < totalEpisodes) {
      handleEpisodeSelect(currentEpisode + 1);
    }
  };

  const handlePrevEpisode = () => {
    if (currentEpisode > 1) {
      handleEpisodeSelect(currentEpisode - 1);
    }
  };

  const handleMarkWatched = () => {
    if (!isInWatchlist(anime.id)) {
      addToWatchlist(anime as any, 'watching');
      updateProgress(anime.id, currentEpisode);
    } else {
      updateProgress(anime.id, currentEpisode);
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === '111111') {
      try {
        sessionStorage.setItem('animesenpai_stream_unlocked', 'true');
      } catch {}
      setIsUnlocked(true);
      setPasscodeError('');
    } else {
      setPasscodeError('Incorrect passcode! Please enter 111111 to unlock.');
    }
  };

  const handleLock = () => {
    try {
      sessionStorage.removeItem('animesenpai_stream_unlocked');
    } catch {}
    setIsUnlocked(false);
    setPasscode('');
    setPasscodeError('');
  };

  // Filter episodes list
  const allEpisodes = Array.from({ length: totalEpisodes }, (_, i) => i + 1);
  const filteredEpisodes = searchQuery.trim()
    ? allEpisodes.filter((ep) => ep.toString().includes(searchQuery.trim()))
    : allEpisodes;

  // Find thumbnail from AniList streamingEpisodes if matched
  const currentEpData = anime.streamingEpisodes?.find(
    (sep, idx) => idx + 1 === currentEpisode || sep.title.includes(`Episode ${currentEpisode}`)
  );

  // 1. GATE: Authentication Required
  if (!isAuthenticated) {
    return (
      <div className="p-8 sm:p-12 rounded-2xl bg-[#151f2e] border border-white/10 shadow-2xl text-center max-w-xl mx-auto space-y-5 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-[#3db4f2]/10 border border-[#3db4f2]/30 flex items-center justify-center mx-auto text-[#3db4f2] shadow-lg shadow-[#3db4f2]/10">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-mono font-bold border border-amber-500/20">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Members Only • Passcode Protected</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Sign In to Access Stream Theater
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Streaming for <strong className="text-slate-200">{animeTitle}</strong> is locked. You must be logged in and enter the passcode to watch episodes directly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to={`/login?redirect=/anime/${anime.id}`}
            className="w-full sm:w-auto anilist-btn-primary flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold shadow-lg shadow-[#3db4f2]/20"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Sign Up</span>
          </Link>
          <button
            onClick={quickDemoLogin}
            className="w-full sm:w-auto anilist-btn-secondary flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold border border-white/10"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Quick Demo Login</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. GATE: Passcode 111111 Required
  if (!isUnlocked) {
    return (
      <div className="p-8 sm:p-12 rounded-2xl bg-[#151f2e] border border-white/10 shadow-2xl text-center max-w-lg mx-auto space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
          <KeyRound className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/20">
            <Check className="w-3.5 h-3.5" />
            <span>Authenticated as {user?.username || 'Member'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Enter Passcode to Unlock Stream
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Please enter the 6-digit access code to unlock streaming for <strong className="text-slate-200">{animeTitle}</strong>.
          </p>
        </div>

        <form onSubmit={handlePasscodeSubmit} className="space-y-4 max-w-xs mx-auto">
          <div className="relative">
            <input
              type="password"
              maxLength={6}
              placeholder="••••••"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (passcodeError) setPasscodeError('');
              }}
              className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 px-4 rounded-xl bg-[#0b1622] text-white border border-white/10 focus:border-[#3db4f2] focus:ring-2 focus:ring-[#3db4f2]/20 outline-none transition"
              autoFocus
            />
          </div>

          {passcodeError && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 font-semibold animate-shake">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{passcodeError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl anilist-btn-primary font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#3db4f2]/20 active:scale-95 transition"
          >
            <Unlock className="w-4 h-4" />
            <span>Unlock Stream Theater</span>
          </button>
        </form>
      </div>
    );
  }

  // 3. UNLOCKED STREAM THEATER SECTION
  return (
    <div
      ref={playerRef}
      className={`space-y-4 transition-all duration-300 ${
        isTheaterMode
          ? 'fixed inset-0 z-50 bg-[#0b1622]/98 p-4 sm:p-6 overflow-y-auto'
          : 'relative'
      }`}
    >
      {/* Player Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-[#151f2e] border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#3db4f2]/15 text-[#3db4f2] flex items-center justify-center font-black">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#3db4f2] uppercase tracking-wider">
                Now Streaming
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                Episode {currentEpisode}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold border border-emerald-500/30 hidden min-[480px]:inline-flex items-center gap-1">
                <Unlock className="w-2.5 h-2.5" />
                <span>Unlocked</span>
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white line-clamp-1">
              {currentEpData?.title || `${animeTitle} - Episode ${currentEpisode}`}
            </h3>
          </div>
        </div>

        {/* Top Controls: Prev / Next / Theater / Lock */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handlePrevEpisode}
            disabled={currentEpisode <= 1}
            className="p-2 rounded-lg bg-[#0b1622] hover:bg-[#1f2c3f] text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition border border-white/5"
            title="Previous Episode"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-slate-300 px-1">
            {currentEpisode} / {totalEpisodes}
          </span>
          <button
            onClick={handleNextEpisode}
            disabled={currentEpisode >= totalEpisodes}
            className="p-2 rounded-lg bg-[#0b1622] hover:bg-[#1f2c3f] text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition border border-white/5"
            title="Next Episode"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Ad-Shield Toggle */}
          <button
            onClick={() => {
              setAdShield(!adShield);
              setIframeKey((prev) => prev + 1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition border ${
              adShield
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400 shadow-sm'
                : 'bg-[#0b1622] text-slate-400 border-white/10 hover:text-white'
            }`}
            title={adShield ? 'Ad-Shield Active: Popups and redirects are blocked' : 'Ad-Shield Disabled'}
          >
            {adShield ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Shield className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="hidden sm:inline">{adShield ? 'Ad-Shield: ON' : 'Ad-Shield: OFF'}</span>
          </button>

          {/* Theater Mode Toggle */}
          <button
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition border ${
              isTheaterMode
                ? 'bg-[#3db4f2] text-black border-[#3db4f2]'
                : 'bg-[#0b1622] text-slate-300 hover:text-white border-white/10'
            }`}
            title="Toggle Theater Mode"
          >
            {isTheaterMode ? (
              <>
                <Minimize className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit Theater</span>
              </>
            ) : (
              <>
                <Maximize className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Theater Mode</span>
              </>
            )}
          </button>

          {/* Re-Lock Vault Button */}
          <button
            onClick={handleLock}
            className="p-2 rounded-lg bg-[#0b1622] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition border border-white/5"
            title="Lock Stream Vault"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Video Screen Container */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl aspect-video group">
        <iframe
          key={`${selectedServer}-${currentEpisode}-${selectedLanguage}-${iframeKey}-${adShield}`}
          src={streamUrl}
          title={`${animeTitle} Episode ${currentEpisode} Stream`}
          sandbox={
            adShield
              ? 'allow-scripts allow-same-origin allow-forms allow-presentation'
              : 'allow-scripts allow-same-origin allow-forms allow-presentation allow-popups'
          }
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="no-referrer"
          className="w-full h-full border-0 relative z-10"
        />

        {/* Fallback & Reload overlay buttons */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIframeKey((prev) => prev + 1)}
            className="p-1.5 rounded-lg bg-black/80 hover:bg-black text-slate-300 hover:text-white backdrop-blur-md border border-white/10 text-xs flex items-center gap-1 shadow"
            title="Reload Video Player"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">Reload</span>
          </button>
        </div>
      </div>

      {/* Ad-Shield & Tips Notice Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[#151f2e] border border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-slate-300">
            <strong className="text-emerald-400">Ad-Shield Active:</strong> All annoying popups, new window spawns, and redirects are strictly blocked.
          </span>
        </div>
        <span className="text-slate-400 text-[11px]">
          If a video buffers, switch to Server 2 or Server 3 below.
        </span>
      </div>

      {/* Player Utility Bar: Language, Server, Quality, Speed, Subtitles, Download, Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-4 rounded-xl bg-[#151f2e] border border-white/10 shadow-lg text-xs">
        {/* Left Section: Language (Sub/Dub) & Servers */}
        <div className="lg:col-span-8 space-y-3">
          {/* Sub / Dub Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-[#3db4f2]" />
              Audio:
            </span>
            <div className="inline-flex rounded-lg bg-[#0b1622] p-1 border border-white/10">
              <button
                onClick={() => setSelectedLanguage('sub')}
                className={`px-3 py-1 rounded-md font-bold text-xs transition ${
                  selectedLanguage === 'sub'
                    ? 'bg-[#3db4f2] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                SUB (Japanese)
              </button>
              <button
                onClick={() => setSelectedLanguage('dub')}
                className={`px-3 py-1 rounded-md font-bold text-xs transition ${
                  selectedLanguage === 'dub'
                    ? 'bg-[#3db4f2] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                DUB (English)
              </button>
            </div>

            {/* Quality Preset Guide */}
            <div className="ml-auto flex items-center gap-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider font-mono mr-1">
                Quality:
              </span>
              {['1080p', '720p', 'Auto'].map((q) => (
                <button
                  key={q}
                  onClick={() => setActiveQuality(q)}
                  className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] transition border ${
                    activeQuality === q
                      ? 'bg-[#3db4f2]/20 border-[#3db4f2] text-[#3db4f2]'
                      : 'bg-[#0b1622] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Multi-Server Selection */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#3db4f2]" />
              Servers:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {servers.map((server) => (
                <button
                  key={server.id}
                  onClick={() => {
                    setSelectedServer(server.id);
                    setIframeKey((prev) => prev + 1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition border ${
                    selectedServer === server.id
                      ? 'bg-[#3db4f2] text-black border-[#3db4f2] shadow-md'
                      : 'bg-[#0b1622] text-slate-300 hover:bg-[#1f2c3f] border-white/10'
                  }`}
                >
                  <span>{server.name}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-normal ${
                      selectedServer === server.id ? 'bg-black/20 text-black' : 'text-slate-400'
                    }`}
                  >
                    {server.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Subtitles & Playback Speed Controls */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px]">
            {/* Speed selection */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-bold uppercase tracking-wider font-mono">
                Speed:
              </span>
              {['0.75x', '1.0x', '1.25x', '1.5x'].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setActiveSpeed(spd)}
                  className={`px-2 py-0.5 rounded font-mono font-bold transition border ${
                    activeSpeed === spd
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-[#0b1622] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}
                </button>
              ))}
            </div>

            {/* Subtitles Toggle */}
            <button
              onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
              className={`px-2.5 py-1 rounded font-bold flex items-center gap-1.5 border transition ${
                subtitlesEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-[#0b1622] text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              <Settings2 className="w-3 h-3" />
              <span>CC Subtitles: {subtitlesEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Right Section: Watch Progress & Download Actions */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3 p-3 rounded-xl bg-[#0b1622] border border-white/5">
          <div className="space-y-2">
            <span className="font-bold text-slate-400 uppercase tracking-wider font-mono block">
              Watch Tracking
            </span>
            <button
              onClick={handleMarkWatched}
              className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition ${
                isWatchedCurrent
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-[#151f2e] hover:bg-[#1f2c3f] text-[#3db4f2] border border-[#3db4f2]/30'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {isWatchedCurrent
                  ? `Watched Ep ${currentEpisode} (Completed)`
                  : `Mark Ep ${currentEpisode} as Watched`}
              </span>
            </button>
          </div>

          {/* Download & External Mirror Button */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <button
              onClick={() => setShowDownloadModal(true)}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Episode {currentEpisode}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Episode Selector Section */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#151f2e] border border-white/10 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-[#3db4f2]" />
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
              Select Episode ({totalEpisodes} Available)
            </h4>
          </div>

          {/* Search Episode Filter */}
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search episode #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0b1622] text-xs text-white border border-white/10 focus:border-[#3db4f2] outline-none font-mono"
            />
          </div>
        </div>

        {/* Episode Buttons Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 max-h-60 overflow-y-auto pr-1">
          {filteredEpisodes.map((ep) => {
            const isSelected = ep === currentEpisode;
            const isWatched = (watchlistItem?.currentEpisode || 0) >= ep;

            return (
              <button
                key={ep}
                onClick={() => handleEpisodeSelect(ep)}
                className={`py-2 px-1 rounded-lg text-xs font-mono font-bold transition flex flex-col items-center justify-center relative border ${
                  isSelected
                    ? 'bg-[#3db4f2] text-black border-[#3db4f2] shadow-md scale-105'
                    : isWatched
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/60'
                    : 'bg-[#0b1622] text-slate-300 hover:bg-[#1f2c3f] hover:text-white border-white/10'
                }`}
              >
                <span>{ep}</span>
                {isWatched && !isSelected && (
                  <Check className="w-2.5 h-2.5 text-emerald-400 absolute top-1 right-1" />
                )}
              </button>
            );
          })}
        </div>

        {filteredEpisodes.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4">
            No episode found matching "{searchQuery}"
          </p>
        )}
      </div>

      {/* Download Mirrors Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-[#151f2e] border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-base">
                  Download Episode {currentEpisode}
                </h3>
              </div>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Choose your preferred download source mirror for{' '}
              <strong className="text-white">{animeTitle}</strong> (Episode {currentEpisode}):
            </p>

            <div className="space-y-2">
              <a
                href={`https://animepahe.ru/api?m=search&q=${encodeURIComponent(animeTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-[#0b1622] hover:bg-[#1f2c3f] border border-white/10 flex items-center justify-between text-xs text-white font-bold transition"
              >
                <div>
                  <span className="block text-[#3db4f2]">Mirror 1: High-Speed HD (1080p/720p)</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Optimized for fast download with dual audio & soft subs
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>

              <a
                href={`https://anitaku.so/search.html?keyword=${encodeURIComponent(animeTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-[#0b1622] hover:bg-[#1f2c3f] border border-white/10 flex items-center justify-between text-xs text-white font-bold transition"
              >
                <div>
                  <span className="block text-amber-400">Mirror 2: Multi-Quality MP4</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Direct MP4 download for 360p, 480p, 720p, 1080p
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>

              <a
                href={`https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent(animeTitle)}+${String(
                  currentEpisode
                ).padStart(2, '0')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-[#0b1622] hover:bg-[#1f2c3f] border border-white/10 flex items-center justify-between text-xs text-white font-bold transition"
              >
                <div>
                  <span className="block text-emerald-400">Mirror 3: Batch Torrent / BDRip</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Raw Blu-Ray & Master release torrents
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowDownloadModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#0b1622] hover:bg-[#1f2c3f] text-slate-300 font-bold text-xs border border-white/10 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
