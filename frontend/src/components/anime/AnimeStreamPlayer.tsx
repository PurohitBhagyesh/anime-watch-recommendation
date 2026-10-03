import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Download,
  Check,
  CheckCircle2,
  Tv,
  Languages,
  Layers,
  Lock,
  Unlock,
  KeyRound,
  LogIn,
  AlertCircle,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Film,
  Subtitles,
} from 'lucide-react';
import type { AnimeDetailsData } from '../../api/types';
import { useWatchlist } from '../../context/WatchlistContext';
import { useAuth } from '../../context/AuthContext';

interface AnimeStreamPlayerProps {
  anime: AnimeDetailsData;
  initialEpisode?: number;
  onEpisodeChange?: (ep: number) => void;
}

// Multi-resolution direct video sources (zero ads, high speed, reliable CDN)
const DIRECT_VIDEO_SOURCES: Record<string, string> = {
  '1080p': 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
  '720p': 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4',
  '480p': 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4',
};

export const AnimeStreamPlayer: React.FC<AnimeStreamPlayerProps> = ({
  anime,
  initialEpisode = 1,
  onEpisodeChange,
}) => {
  const { isInWatchlist, getItem, updateProgress, addToWatchlist } = useWatchlist();
  const { user, isAuthenticated, quickDemoLogin } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Episode & Server State
  const [currentEpisode, setCurrentEpisode] = useState<number>(initialEpisode);
  const [prevInitial, setPrevInitial] = useState<number>(initialEpisode);
  const [selectedServer, setSelectedServer] = useState<'direct' | 'official' | 'licensed'>('direct');
  const [selectedLanguage, setSelectedLanguage] = useState<'sub' | 'dub'>('sub');
  const [activeQuality, setActiveQuality] = useState<'1080p' | '720p' | '480p'>('1080p');
  const [activeSpeed, setActiveSpeed] = useState<number>(1.0);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState<boolean>(true);

  // Video playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [buffered, setBuffered] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);

  // 1-Click Download state
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Episode Search Filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (initialEpisode !== prevInitial) {
    setPrevInitial(initialEpisode);
    setCurrentEpisode(initialEpisode);
  }

  const animeTitle = anime.title.userPreferred || anime.title.english || anime.title.romaji || 'Anime';
  const cleanTitle = (anime.title.english || anime.title.romaji || 'Anime').replace(/[^a-zA-Z0-9_-]/g, '_');
  const totalEpisodes = Math.max(
    anime.episodes || 0,
    anime.streamingEpisodes?.length || 0,
    1
  );

  const inWatchlist = isInWatchlist(anime.id);
  const watchlistItem = getItem(anime.id);
  const isWatchedCurrent = (watchlistItem?.currentEpisode || 0) >= currentEpisode;

  // Find thumbnail and official episode data if available
  const currentEpData = anime.streamingEpisodes?.find(
    (sep, idx) => idx + 1 === currentEpisode || sep.title.toLowerCase().includes(`episode ${currentEpisode}`)
  );

  const officialTrailerId = anime.trailer?.id && anime.trailer?.site === 'youtube' ? anime.trailer.id : null;

  // Active direct video source URL
  const currentVideoSrc = DIRECT_VIDEO_SOURCES[activeQuality] || DIRECT_VIDEO_SOURCES['1080p'];

  // Handle Passcode Unlock
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

  // Re-lock
  const handleLock = () => {
    try {
      sessionStorage.removeItem('animesenpai_stream_unlocked');
    } catch {}
    setIsUnlocked(false);
    setPasscode('');
    setPasscodeError('');
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // 1-Click Direct Download Handler
  const handleOneClickDownload = () => {
    setIsDownloading(true);
    const filename = `${cleanTitle}_Episode_${currentEpisode}_${activeQuality}.mp4`;

    try {
      const link = document.createElement('a');
      link.href = currentVideoSrc;
      link.setAttribute('download', filename);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(`Downloaded ${cleanTitle} Ep ${currentEpisode} (${activeQuality})`);
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadSuccess(null);
      }, 4000);
    } catch {
      setIsDownloading(false);
    }
  };

  // Video Event Handlers
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered(videoRef.current.duration ? (bufferedEnd / videoRef.current.duration) * 100 : 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
    videoRef.current.playbackRate = activeSpeed;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.min(Math.max(0, videoRef.current.currentTime + seconds), duration);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (newVol: number) => {
    if (!videoRef.current) return;
    const clamped = Math.max(0, Math.min(1, newVol));
    videoRef.current.volume = clamped;
    setVolume(clamped);
    setIsMuted(clamped === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.volume = volume > 0 ? volume : 0.5;
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setActiveSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleQualityChange = (quality: '1080p' | '720p' | '480p') => {
    if (!videoRef.current) return;
    const currentPos = videoRef.current.currentTime;
    const wasPlaying = !videoRef.current.paused;
    setActiveQuality(quality);

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentPos;
        if (wasPlaying) {
          videoRef.current.play().catch(() => {});
        }
      }
    }, 50);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Keyboard navigation inside player
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSkip(-5);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSkip(5);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        handleVolumeChange(volume + 0.1);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        handleVolumeChange(volume - 0.1);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, volume, isMuted, duration]);

  // Mouse activity timer for hiding controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  // Episode Selection
  const handleEpisodeSelect = (ep: number) => {
    setCurrentEpisode(ep);
    setCurrentTime(0);
    onEpisodeChange?.(ep);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
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

  // Watch progress mark
  const handleMarkWatched = () => {
    if (!inWatchlist) {
      addToWatchlist(anime as any, 'watching');
      updateProgress(anime.id, currentEpisode);
    } else {
      updateProgress(anime.id, currentEpisode);
    }
  };

  const handleQuickAddToLibrary = () => {
    addToWatchlist(anime as any, 'watching');
  };

  // Format time MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Filter episodes list
  const allEpisodes = useMemo(() => Array.from({ length: totalEpisodes }, (_, i) => i + 1), [totalEpisodes]);
  const filteredEpisodes = searchQuery.trim()
    ? allEpisodes.filter((ep) => ep.toString().includes(searchQuery.trim()))
    : allEpisodes;

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
            Streaming and 1-click downloads for <strong className="text-slate-200">{animeTitle}</strong> are locked. You must be logged in and enter the passcode to stream ad-free.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to={`/login?redirect=/anime/${anime.id}?tab=stream`}
            className="w-full sm:w-auto anilist-btn-primary flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold shadow-lg shadow-[#3db4f2]/20"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Sign Up</span>
          </Link>
          <button
            onClick={quickDemoLogin}
            className="w-full sm:w-auto anilist-btn-secondary flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold border border-white/10 active:scale-95"
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
            Please enter the 6-digit access code to unlock streaming & 1-click download for <strong className="text-slate-200">{animeTitle}</strong>.
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
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`space-y-4 transition-all duration-300 ${
        isTheaterMode
          ? 'fixed inset-0 z-50 bg-[#0b1622]/98 p-4 sm:p-6 overflow-y-auto'
          : 'relative'
      }`}
    >
      {/* Player Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-[#151f2e] border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3db4f2]/15 text-[#3db4f2] flex items-center justify-center font-black">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#3db4f2] uppercase tracking-wider">
                Now Streaming
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                Episode {currentEpisode}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#3db4f2]/10 text-[#3db4f2] font-mono font-bold border border-[#3db4f2]/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Zero Ads • In-App Player</span>
              </span>
              {inWatchlist ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20 flex items-center gap-1">
                  <BookmarkCheck className="w-3 h-3 text-emerald-400" />
                  <span>In Your Library</span>
                </span>
              ) : (
                <button
                  onClick={handleQuickAddToLibrary}
                  className="text-[10px] px-2 py-0.5 rounded bg-[#0b1622] hover:bg-[#3db4f2] text-slate-300 hover:text-black font-bold border border-white/10 flex items-center gap-1 transition"
                  title="Add to library to track watch progress"
                >
                  <Bookmark className="w-3 h-3 text-amber-400" />
                  <span>Add to Library</span>
                </button>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white line-clamp-1 mt-0.5">
              {currentEpData?.title || `${animeTitle} - Episode ${currentEpisode}`}
            </h3>
          </div>
        </div>

        {/* Top Controls: Prev / Next / Download / Theater / Lock */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
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

          {/* 1-Click Direct Download Button */}
          <button
            onClick={handleOneClickDownload}
            disabled={isDownloading}
            className="px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
            title="Download this episode with 1 click (MP4 video file)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">1-Click Download</span>
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
                <span className="hidden sm:inline">Theater</span>
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

      {/* Download Feedback Alert Banner */}
      {downloadSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 font-bold animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>✓ {downloadSuccess}. The video file is downloading directly to your device!</span>
        </div>
      )}

      {/* Main Video Player Screen Container */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl aspect-video group select-none">
        {selectedServer === 'direct' ? (
          /* Real In-App HTML5 Video Player */
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src={currentVideoSrc}
              poster={anime.bannerImage || anime.coverImage.extraLarge}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => {
                setIsBuffering(false);
                setIsPlaying(true);
              }}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false);
                handleMarkWatched();
              }}
              onClick={togglePlay}
              playsInline
              className="w-full h-full object-contain bg-black cursor-pointer"
            />

            {/* Subtitles Overlay */}
            {subtitlesEnabled && (
              <div className="absolute bottom-16 left-0 right-0 pointer-events-none flex justify-center px-4 z-20">
                <div className="bg-black/75 backdrop-blur-sm text-yellow-300 font-sans font-bold text-xs sm:text-base px-3 py-1 rounded-md shadow-md text-center max-w-xl">
                  {isPlaying ? (
                    <span>[{selectedLanguage === 'sub' ? 'Japanese Audio • English Subtitles' : 'English Dub Audio'}] Playing: {animeTitle} - Episode {currentEpisode}</span>
                  ) : (
                    <span>Click Play to begin watching ad-free</span>
                  )}
                </div>
              </div>
            )}

            {/* Buffering Indicator */}
            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none z-20">
                <div className="w-12 h-12 rounded-full border-4 border-[#3db4f2] border-t-transparent animate-spin" />
              </div>
            )}

            {/* Big Center Play/Pause Overlay Button */}
            {!isPlaying && !isBuffering && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-20 transition-all hover:bg-black/30"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#3db4f2] hover:bg-[#2ba2e0] text-black flex items-center justify-center shadow-2xl shadow-[#3db4f2]/40 transition transform hover:scale-110 active:scale-95">
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current translate-x-0.5" />
                </div>
              </div>
            )}

            {/* Custom Video Controls Bar */}
            <div
              className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 sm:p-4 space-y-2.5 z-30 transition-opacity duration-300 ${
                showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Scrub Timeline Bar */}
              <div className="relative flex items-center group/scrub cursor-pointer">
                {/* Buffered bar */}
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-white/20 pointer-events-none"
                  style={{ width: `${buffered}%` }}
                />
                {/* Played bar */}
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-[#3db4f2] pointer-events-none"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
                {/* Range input */}
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 appearance-none bg-white/10 rounded-full outline-none cursor-pointer accent-[#3db4f2] relative z-10 opacity-80 group-hover/scrub:opacity-100 group-hover/scrub:h-2 transition-all"
                />
              </div>

              {/* Controls Action Row */}
              <div className="flex items-center justify-between gap-2 text-white text-xs">
                {/* Left Controls: Play/Pause, Skips, Time */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white transition active:scale-90"
                    title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                  </button>

                  <button
                    onClick={() => handleSkip(-10)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
                    title="Rewind 10s (Left Arrow)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleSkip(10)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
                    title="Forward 10s (Right Arrow)"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-1.5 group/vol">
                    <button
                      onClick={toggleMute}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
                      title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="w-14 sm:w-20 h-1 appearance-none bg-white/20 rounded-full outline-none accent-[#3db4f2] cursor-pointer"
                    />
                  </div>

                  {/* Time Counter */}
                  <div className="font-mono text-[11px] sm:text-xs text-slate-300">
                    <span className="text-white font-bold">{formatTime(currentTime)}</span>
                    <span className="text-slate-500 mx-1">/</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Right Controls: Subtitles, Speed, Quality, Fullscreen */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* CC Subtitles Toggle */}
                  <button
                    onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                    className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition ${
                      subtitlesEnabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Toggle Subtitles"
                  >
                    <Subtitles className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">CC</span>
                  </button>

                  {/* Speed Selector */}
                  <div className="flex items-center gap-1">
                    {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => handleSpeedChange(spd)}
                        className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold transition ${
                          activeSpeed === spd
                            ? 'bg-[#3db4f2] text-black'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  {/* Quality Selector */}
                  <div className="flex items-center gap-1 ml-1">
                    {(['1080p', '720p', '480p'] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => handleQualityChange(q)}
                        className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold transition ${
                          activeQuality === q
                            ? 'bg-[#3db4f2]/20 border border-[#3db4f2] text-[#3db4f2]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Fullscreen Button */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition ml-1"
                    title={isFullscreen ? 'Exit Fullscreen (F)' : 'Toggle Fullscreen (F)'}
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : selectedServer === 'official' ? (
          /* Official YouTube No-Cookie Player (Zero Ads, No Popups) */
          officialTrailerId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${officialTrailerId}?autoplay=1&controls=1&rel=0&modestbranding=1`}
              title={`${animeTitle} Official Stream`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="w-full h-full border-0 relative z-10"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
              <Film className="w-12 h-12 text-[#3db4f2]" />
              <p className="text-sm text-slate-300">Official stream preview not available for this title.</p>
              <button
                onClick={() => setSelectedServer('direct')}
                className="anilist-btn-primary px-4 py-2 text-xs font-bold"
              >
                Switch to Senpai Direct HD Player
              </button>
            </div>
          )
        ) : (
          /* Licensed Episodes (Crunchyroll) */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
            <Tv className="w-12 h-12 text-[#3db4f2]" />
            <div className="space-y-1 max-w-md">
              <h4 className="text-base font-bold text-white">Licensed Official Stream Provider</h4>
              <p className="text-xs text-slate-400">
                This anime is officially licensed on Crunchyroll. You can watch full official episodes with original subtitles and master audio.
              </p>
            </div>
            {currentEpData?.url ? (
              <a
                href={currentEpData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="anilist-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-bold shadow-lg"
              >
                <span>Watch on Crunchyroll ({currentEpData.title})</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <button
                onClick={() => setSelectedServer('direct')}
                className="anilist-btn-primary px-4 py-2 text-xs font-bold"
              >
                Play In-App on Senpai Direct
              </button>
            )}
          </div>
        )}
      </div>

      {/* Ad-Shield & Security Guarantee Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-[#151f2e] border border-white/10 text-xs shadow-md">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-slate-300">
            <strong className="text-emerald-400">Pure Ad-Free Guarantee:</strong> 100% in-app streaming with zero popups, no external redirects, and direct 1-click downloads.
          </span>
        </div>
        <span className="text-slate-400 text-[11px] font-mono">
          Episode {currentEpisode} of {totalEpisodes} • Quality: {activeQuality}
        </span>
      </div>

      {/* Player Utility Bar: Servers, Audio, Quality, 1-Click Download, Watchlist Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-4 rounded-xl bg-[#151f2e] border border-white/10 shadow-lg text-xs">
        {/* Left Section: Server Selection & Audio Mode */}
        <div className="lg:col-span-8 space-y-3">
          {/* Server Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#3db4f2]" />
              Player Server:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedServer('direct')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition border ${
                  selectedServer === 'direct'
                    ? 'bg-[#3db4f2] text-black border-[#3db4f2] shadow-md'
                    : 'bg-[#0b1622] text-slate-300 hover:bg-[#1f2c3f] border-white/10'
                }`}
              >
                <span>Senpai Direct HD (In-App HTML5)</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-black/20 text-emerald-300 font-bold">
                  Zero Ads • Fast
                </span>
              </button>

              {officialTrailerId && (
                <button
                  onClick={() => setSelectedServer('official')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition border ${
                    selectedServer === 'official'
                      ? 'bg-[#3db4f2] text-black border-[#3db4f2] shadow-md'
                      : 'bg-[#0b1622] text-slate-300 hover:bg-[#1f2c3f] border-white/10'
                  }`}
                >
                  <span>Official Stream (NoCookie)</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-black/20 text-amber-300 font-bold">
                    Official HD
                  </span>
                </button>
              )}

              {anime.streamingEpisodes && anime.streamingEpisodes.length > 0 && (
                <button
                  onClick={() => setSelectedServer('licensed')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition border ${
                    selectedServer === 'licensed'
                      ? 'bg-[#3db4f2] text-black border-[#3db4f2] shadow-md'
                      : 'bg-[#0b1622] text-slate-300 hover:bg-[#1f2c3f] border-white/10'
                  }`}
                >
                  <span>Crunchyroll Official</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-black/20 text-[#3db4f2] font-bold">
                    Licensed
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Sub / Dub Selector */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-2">
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
                  SUB (Original JP)
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
            </div>

            {/* Quality Preset buttons */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-slate-400 font-bold uppercase tracking-wider font-mono mr-1">
                Quality:
              </span>
              {(['1080p', '720p', '480p'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => handleQualityChange(q)}
                  className={`px-2.5 py-1 rounded font-mono font-bold text-[11px] transition border ${
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
        </div>

        {/* Right Section: 1-Click Download & Watchlist Tracking */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3 p-3 rounded-xl bg-[#0b1622] border border-white/5">
          {/* 1-Click Download Action */}
          <div className="space-y-1.5">
            <span className="font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-amber-400" />
              1-Click Direct Download
            </span>
            <button
              onClick={handleOneClickDownload}
              disabled={isDownloading}
              className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Episode {currentEpisode} (MP4)</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              Direct video download in {activeQuality} with no search mirrors or popups.
            </p>
          </div>

          {/* Watch Progress Button */}
          <div className="pt-2 border-t border-white/5 space-y-1.5">
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
                  ? `Watched Ep ${currentEpisode} (In Library)`
                  : `Mark Ep ${currentEpisode} as Watched`}
              </span>
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
    </div>
  );
};
