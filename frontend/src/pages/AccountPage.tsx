import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  Mail,
  Calendar,
  Bookmark,
  Save,
  Check,
  LogOut,
  Sliders,
  Trash2,
  Download,
  Upload,
  Film,
  AlertTriangle,
  ArrowRight,
  X,
} from 'lucide-react';
import { useAuth, AVATAR_PRESETS } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { useSEO, SITE_URL } from '../utils/seo';

interface AccountPageProps {
  defaultTab?: 'account' | 'settings';
}

interface UserPreferences {
  preferredAudio: 'sub' | 'dub';
  contentFilter: boolean;
  autoTrailer: boolean;
}

const PREFS_STORAGE_KEY = 'animesenpai_preferences_v1';

function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        preferredAudio: parsed.preferredAudio === 'dub' ? 'dub' : 'sub',
        contentFilter: typeof parsed.contentFilter === 'boolean' ? parsed.contentFilter : true,
        autoTrailer: typeof parsed.autoTrailer === 'boolean' ? parsed.autoTrailer : false,
      };
    }
  } catch {}
  return { preferredAudio: 'sub', contentFilter: true, autoTrailer: false };
}

export const AccountPage: React.FC<AccountPageProps> = ({ defaultTab }) => {
  useSEO({
    title: 'Account & Settings • AnimeSenpai',
    description: 'Manage your AnimeSenpai profile, persistent browsing preferences, watchlist backups, or permanently delete your account.',
    canonicalUrl: `${SITE_URL}/account`,
    robots: 'noindex, nofollow',
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { user, authProvider, updateProfile, logout, deleteAccount } = useAuth();
  const { watchlist, exportWatchlist, importWatchlist, clearWatchlist } = useWatchlist();

  const currentTabFromUrl = location.pathname.includes('settings') ? 'settings' : 'account';
  const [activeTab, setActiveTab] = useState<'account' | 'settings'>(defaultTab || currentTabFromUrl);

  // Profile form state
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [favoriteGenre, setFavoriteGenre] = useState(user?.favoriteGenre || 'Action / Shonen');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || AVATAR_PRESETS[0].url);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Persistent browsing preferences
  const [prefs, setPrefs] = useState<UserPreferences>(loadPreferences);
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Backup import feedback
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ ok: boolean; text: string } | null>(null);

  // Native <dialog> Delete Account state
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [reauthPassword, setReauthPassword] = useState('');
  const [needsReauth, setNeedsReauth] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setActiveTab(defaultTab || (location.pathname.includes('settings') ? 'settings' : 'account'));
  }, [defaultTab, location.pathname]);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setBio(user.bio || '');
      setFavoriteGenre(user.favoriteGenre || 'Action / Shonen');
      setSelectedAvatar(user.avatar || AVATAR_PRESETS[0].url);
    }
  }, [user]);

  // Safari fallback for light-dismiss when closedby="any" is unsupported
  useEffect(() => {
    const dialog = deleteDialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

    const isOutside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };

    let pressedOutside = false;
    const onDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const onUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e) && !isDeleting) {
        dialog.close();
      }
    };

    dialog.addEventListener('pointerdown', onDown);
    dialog.addEventListener('pointerup', onUp);
    return () => {
      dialog.removeEventListener('pointerdown', onDown);
      dialog.removeEventListener('pointerup', onUp);
    };
  }, [isDeleting]);

  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 1800);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateProfile({
        username: username.trim() || user.username,
        bio: bio.trim(),
        favoriteGenre,
        avatar: selectedAvatar,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2800);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const ok = content ? importWatchlist(content) : false;
      setImportStatus({
        ok,
        text: ok ? 'Watchlist backup imported successfully.' : 'Invalid JSON backup file.',
      });
      setTimeout(() => setImportStatus(null), 3500);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openDeleteDialog = () => {
    setDeleteConfirmText('');
    setReauthPassword('');
    setNeedsReauth(false);
    setDeleteError(null);
    deleteDialogRef.current?.showModal();
  };

  const closeDeleteDialog = () => {
    if (isDeleting) return;
    deleteDialogRef.current?.close();
  };

  const handleConfirmDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') return;

    setIsDeleting(true);
    setDeleteError(null);

    const passwordArg = needsReauth
      ? authProvider === 'google'
        ? '__google_reauth__'
        : reauthPassword
      : undefined;

    const result = await deleteAccount(passwordArg);

    if (result.success) {
      clearWatchlist();
      deleteDialogRef.current?.close();
      navigate('/', { replace: true });
    } else {
      if (result.requiresRecentLogin) {
        setNeedsReauth(true);
      }
      setDeleteError(result.error || 'Could not delete account. Please try again.');
    }

    setIsDeleting(false);
  };

  const totalEpisodesWatched = watchlist.reduce((sum, item) => sum + (item.currentEpisode || 0), 0);
  const estDaysWatched = ((totalEpisodesWatched * 24) / 1440).toFixed(1);
  const watchingCount = watchlist.filter((item) => item.status === 'watching').length;
  const completedCount = watchlist.filter((item) => item.status === 'completed').length;

  if (!user) {
    return (
      <div className="min-h-[70dvh] flex flex-col items-center justify-center px-4 text-center">
        <div className="liquid-glass w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
          <User aria-hidden="true" className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Sign in to manage your account</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-6">
          Sync your watchlist across devices, manage preferences, or export and erase your data anytime.
        </p>
        <Link
          to="/login"
          className="px-6 py-2.5 rounded-xl anilist-btn-primary text-xs font-bold"
        >
          Sign In / Create Account
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto animate-fadeIn space-y-6">
      {/* Top Profile Header */}
      <div className="anilist-card-static p-5 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
          <img
            src={user.avatar || AVATAR_PRESETS[0].url}
            alt={user.username}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-white/15 shadow-xl flex-shrink-0"
          />

          <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
              {user.username}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl line-clamp-2">
              {user.bio || 'Tracking anime releases and personal ratings on AnimeSenpai.'}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 pt-1 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Mail aria-hidden="true" className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[220px]">{user.email}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar aria-hidden="true" className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.joinedDate || 'Member'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Bookmark aria-hidden="true" className="w-3.5 h-3.5 text-white" />
                <span className="text-slate-200 font-semibold">{watchlist.length}</span> titles saved
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="sm:self-start px-3.5 py-2 min-h-[40px] rounded-xl bg-white/[0.06] hover:bg-rose-500/15 border border-[#232329] hover:border-rose-400/30 text-slate-200 hover:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut aria-hidden="true" className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 3-Color Segmented Tab Switcher */}
      <div className="bg-[#0c0c0f] border border-[#23232b] p-1 rounded-full grid grid-cols-2 sm:inline-grid sm:grid-cols-2 gap-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 min-h-[40px] rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'account'
              ? 'btn-accent-active font-bold'
              : 'text-[#9a9aa6] hover:text-white'
          }`}
        >
          <User aria-hidden="true" className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 min-h-[40px] rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'btn-accent-active font-bold'
              : 'text-[#9a9aa6] hover:text-white'
          }`}
        >
          <Settings aria-hidden="true" className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Settings & Data</span>
        </button>
      </div>

      {/* Tab 1: Account Profile */}
      {activeTab === 'account' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Edit Profile Form */}
          <div className="md:col-span-2 anilist-card-static p-5 sm:p-6 space-y-5">
            <div className="border-b border-[#232329] pb-3.5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders aria-hidden="true" className="w-4 h-4 text-white" />
                <span>Profile Details</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Customize your display name, avatar, bio, and favorite genre.
              </p>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <Check aria-hidden="true" className="w-4 h-4 text-emerald-400" />
                <span>Profile saved.</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Avatar Picker */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">Profile Avatar</span>
                <div className="flex flex-wrap items-center gap-2.5">
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = selectedAvatar === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedAvatar(preset.url)}
                        aria-label={`Select ${preset.name} avatar`}
                        aria-pressed={isSelected}
                        className={`relative rounded-xl p-0.5 transition cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-white scale-105'
                            : 'ring-1 ring-white/10 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-11 h-11 rounded-[10px] object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="profile-username" className="text-xs font-semibold text-slate-300 block">
                  Display Name
                </label>
                <input
                  id="profile-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                  className="anilist-input w-full px-3.5 py-2.5 text-base sm:text-sm text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="profile-bio" className="text-xs font-semibold text-slate-300 block">
                  Bio
                </label>
                <textarea
                  id="profile-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio or favorite series..."
                  className="anilist-input w-full px-3.5 py-2.5 text-base sm:text-sm text-slate-100 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="profile-genre" className="text-xs font-semibold text-slate-300 block">
                  Favorite Genre
                </label>
                <select
                  id="profile-genre"
                  value={favoriteGenre}
                  onChange={(e) => setFavoriteGenre(e.target.value)}
                  className="anilist-input w-full px-3.5 py-2.5 text-base sm:text-sm text-slate-100"
                >
                  <option value="Action / Shonen">Action / Shonen</option>
                  <option value="Fantasy / Isekai">Fantasy / Isekai</option>
                  <option value="Romance / Slice of Life">Romance / Slice of Life</option>
                  <option value="Psychological / Thriller">Psychological / Thriller</option>
                  <option value="Sci-Fi / Mecha">Sci-Fi / Mecha</option>
                  <option value="Comedy / Parody">Comedy / Parody</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 min-h-[42px] anilist-btn-primary text-xs font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save aria-hidden="true" className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Real Watchlist Stats & Voluntary UPI Support */}
          <div className="space-y-5">
            <div className="anilist-card-static p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Film aria-hidden="true" className="w-3.5 h-3.5 text-white" />
                  <span>Watchlist Summary</span>
                </h3>
                <Link
                  to="/watchlist"
                  className="text-[11px] font-bold text-white hover:underline inline-flex items-center gap-1"
                >
                  <span>Open</span>
                  <ArrowRight aria-hidden="true" className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-[#232329] flex items-center justify-between">
                  <span className="text-slate-400">Saved Titles</span>
                  <span className="font-bold text-white">{watchlist.length}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-[#232329] flex items-center justify-between">
                  <span className="text-slate-400">Currently Watching</span>
                  <span className="font-bold text-emerald-400">{watchingCount}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-[#232329] flex items-center justify-between">
                  <span className="text-slate-400">Completed</span>
                  <span className="font-bold text-sky-300">{completedCount}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-[#232329] flex items-center justify-between">
                  <span className="text-slate-400">Episodes Logged</span>
                  <span className="font-bold text-slate-100">{totalEpisodesWatched}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-[#232329] flex items-center justify-between">
                  <span className="text-slate-400">Watch Time</span>
                  <span className="font-bold text-slate-100">{estDaysWatched} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Settings, Data Ownership & Delete Account */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Persistent Browsing Preferences */}
          <div className="anilist-card-static p-5 sm:p-6 space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-[#232329] pb-3.5">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders aria-hidden="true" className="w-4 h-4 text-white" />
                  <span>Browsing Preferences</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Saved automatically on this device.
                </p>
              </div>
              {prefsSaved && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold animate-fadeIn">
                  <Check aria-hidden="true" className="w-3 h-3" />
                  Saved
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.04] border border-[#232329] space-y-2.5 sm:col-span-2">
                <span className="text-xs font-semibold text-slate-200 block">Preferred Audio Style</span>
                <p className="text-[11px] text-slate-400">Choose your default language preference for episode metadata.</p>
                <div className="flex flex-col min-[380px]:flex-row gap-2 pt-1 max-w-md">
                  <button
                    type="button"
                    onClick={() => updatePreference('preferredAudio', 'sub')}
                    className={`flex-1 px-3 py-2 min-h-[40px] rounded-full text-xs font-bold transition cursor-pointer ${
                      prefs.preferredAudio === 'sub'
                        ? 'btn-accent-active'
                        : 'bg-[#16161b] text-[#d2d2dc] hover:text-white border border-[#23232b]'
                    }`}
                  >
                    Original Japanese (Sub)
                  </button>
                  <button
                    type="button"
                    onClick={() => updatePreference('preferredAudio', 'dub')}
                    className={`flex-1 px-3 py-2 min-h-[40px] rounded-full text-xs font-bold transition cursor-pointer ${
                      prefs.preferredAudio === 'dub'
                        ? 'btn-accent-active'
                        : 'bg-[#16161b] text-[#d2d2dc] hover:text-white border border-[#23232b]'
                    }`}
                  >
                    English (Dub)
                  </button>
                </div>
              </div>

              <label className="p-4 rounded-xl bg-white/[0.04] border border-[#232329] flex items-center justify-between gap-3 cursor-pointer min-h-[64px]">
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-200 block">Safe Browsing Filter</span>
                  <span className="text-[11px] text-slate-400">Hide 18+ adult material in catalog results</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.contentFilter}
                  onChange={(e) => updatePreference('contentFilter', e.target.checked)}
                  className="w-5 h-5 rounded text-white bg-[#0b0b0d] border-white/20 focus:ring-0 cursor-pointer flex-shrink-0"
                />
              </label>

              <label className="p-4 rounded-xl bg-white/[0.04] border border-[#232329] flex items-center justify-between gap-3 cursor-pointer min-h-[64px]">
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-200 block">Autoplay Trailers</span>
                  <span className="text-[11px] text-slate-400">Start playback immediately when opening a trailer</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.autoTrailer}
                  onChange={(e) => updatePreference('autoTrailer', e.target.checked)}
                  className="w-5 h-5 rounded text-white bg-[#0b0b0d] border-white/20 focus:ring-0 cursor-pointer flex-shrink-0"
                />
              </label>
            </div>
          </div>

          {/* Data Ownership & Backups */}
          <div className="anilist-card-static p-5 sm:p-6 space-y-4">
            <div className="border-b border-[#232329] pb-3.5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Download aria-hidden="true" className="w-4 h-4 text-white" />
                <span>Your Data & Backups</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                You own your watchlist. Export a portable JSON backup or restore one anytime.
              </p>
            </div>

            {importStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold border animate-fadeIn ${
                  importStatus.ok
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}
              >
                {importStatus.text}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={exportWatchlist}
                className="px-4 py-2.5 min-h-[42px] rounded-xl anilist-btn-secondary text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Download aria-hidden="true" className="w-3.5 h-3.5 text-white" />
                <span>Export Watchlist (.JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 min-h-[42px] rounded-xl anilist-btn-secondary text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Upload aria-hidden="true" className="w-3.5 h-3.5 text-white" />
                <span>Import Backup (.JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Clear your local watchlist on this browser?')) {
                    clearWatchlist();
                  }
                }}
                className="px-4 py-2.5 min-h-[42px] rounded-xl bg-white/[0.05] hover:bg-rose-500/15 border border-[#232329] hover:border-rose-400/30 text-xs font-bold text-slate-300 hover:text-rose-300 transition flex items-center gap-2 cursor-pointer"
              >
                <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
                <span>Clear Local Watchlist</span>
              </button>
            </div>
          </div>

          {/* Permanent Account Deletion */}
          <div className="anilist-card-static p-5 sm:p-6 border-rose-500/25 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                <AlertTriangle aria-hidden="true" className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-bold text-white">Delete Account & Erase All Data</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We never keep, sell, or retain your personal data after deletion. Permanently deleting your account removes your login profile, cloud record, local watchlist, and preferences immediately.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#232329]">
              <p className="text-[11px] text-slate-400">
                Tip: Export your JSON backup first if you want to keep a local copy of your anime list.
              </p>
              <button
                type="button"
                onClick={openDeleteDialog}
                className="px-4 py-2.5 min-h-[42px] anilist-btn-danger text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
                <span>Delete My Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Native <dialog> Confirmation Modal for Account Deletion */}
      <dialog
        ref={deleteDialogRef}
        aria-labelledby="delete-account-dialog-title"
        {...({ closedby: 'any' } as any)}
        className="liquid-dialog"
      >
        <form onSubmit={handleConfirmDeleteAccount} className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                <AlertTriangle aria-hidden="true" className="w-4 h-4" />
              </div>
              <h2 id="delete-account-dialog-title" className="text-base font-bold text-white">
                Permanently delete account?
              </h2>
            </div>
            <button
              type="button"
              onClick={closeDeleteDialog}
              aria-label="Close delete account dialog"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            This action cannot be undone. Your AnimeSenpai account, cloud profile, local watchlist ({watchlist.length} titles), and saved preferences will be permanently erased.
          </p>

          {deleteError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {deleteError}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="confirm-delete-input" className="text-xs font-semibold text-slate-300 block">
              Type <span className="font-mono font-bold text-rose-300">DELETE</span> to confirm
            </label>
            <input
              id="confirm-delete-input"
              type="text"
              autoComplete="off"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="anilist-input w-full px-3.5 py-2.5 text-base sm:text-sm text-white font-mono"
            />
          </div>

          {needsReauth && authProvider === 'password' && (
            <div className="space-y-1.5">
              <label htmlFor="reauth-password-input" className="text-xs font-semibold text-slate-300 block">
                Enter your password to verify deletion
              </label>
              <input
                id="reauth-password-input"
                type="password"
                required
                value={reauthPassword}
                onChange={(e) => setReauthPassword(e.target.value)}
                placeholder="Your current password"
                className="anilist-input w-full px-3.5 py-2.5 text-base sm:text-sm text-white"
              />
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-[#232329]">
            <button
              type="button"
              autoFocus
              disabled={isDeleting}
              onClick={closeDeleteDialog}
              className="px-4 py-2.5 min-h-[42px] anilist-btn-secondary text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isDeleting || deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
              className="px-4 py-2.5 min-h-[42px] anilist-btn-danger text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
              <span>
                {isDeleting
                  ? 'Deleting...'
                  : needsReauth && authProvider === 'google'
                  ? 'Verify with Google & Delete'
                  : 'Delete Account Forever'}
              </span>
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
};
