import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  Sliders,
  Database,
  Trash2,
  Save,
  Check,
  LogOut,
  Download,
  Upload,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  X,
  LogIn,
} from 'lucide-react';
import { useAuth, AVATAR_PRESETS } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { usePreferences, type TitleLanguage, type LayoutDensity } from '../context/PreferencesContext';
import { useSEO, SITE_URL } from '../utils/seo';

interface AccountPageProps {
  defaultTab?: 'account' | 'settings';
}

type SettingsSection = 'preferences' | 'profile' | 'data' | 'danger';

export const AccountPage: React.FC<AccountPageProps> = ({ defaultTab }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, authProvider, updateProfile, logout, deleteAccount } = useAuth();
  const { watchlist, exportWatchlist, importWatchlist, clearWatchlist } = useWatchlist();
  const { preferences, updatePreference, resetPreferences } = usePreferences();

  useSEO({
    title: 'Settings & Account • AnimeSenpai',
    description:
      'Customize AnimeSenpai display preferences, title language, density, backups, profile, or permanently delete your account.',
    canonicalUrl: `${SITE_URL}/settings`,
    robots: 'noindex, nofollow',
  });

  const initialSection: SettingsSection =
    defaultTab === 'account' || location.pathname.includes('account')
      ? user
        ? 'profile'
        : 'preferences'
      : 'preferences';

  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection);

  // Profile form state
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [favoriteGenre, setFavoriteGenre] = useState(user?.favoriteGenre || 'Action / Shonen');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || AVATAR_PRESETS[0].url);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Subtle saved toast for preferences
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
    if (defaultTab === 'account' || location.pathname.includes('account')) {
      setActiveSection(user ? 'profile' : 'preferences');
    } else if (defaultTab === 'settings' || location.pathname.includes('settings')) {
      setActiveSection('preferences');
    }
  }, [defaultTab, location.pathname, user]);

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

  const handlePrefChange = <K extends keyof typeof preferences>(
    key: K,
    value: (typeof preferences)[K]
  ) => {
    updatePreference(key, value);
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 1600);
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
      setTimeout(() => setSaveSuccess(false), 2600);
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

  const navItems: { id: SettingsSection; label: string; icon: React.ElementType; danger?: boolean }[] = [
    { id: 'preferences', label: 'Appearance & Playback', icon: Sliders },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'data', label: 'Data & Backups', icon: Database },
    ...(user ? [{ id: 'danger' as const, label: 'Delete Account', icon: Trash2, danger: true }] : []),
  ];

  return (
    <div className="settings-workspace w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10 animate-fadeIn space-y-6">
      {/* Clean Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#23232b]">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f5f5f7] tracking-[-0.03em]">
            Settings
          </h1>
          <p className="text-xs sm:text-[13px] text-[#9a9aa6]">
            Customize how AnimeSenpai looks, displays titles, and manages your personal data.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {prefsSaved && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/12 border border-emerald-500/30 text-[#4ade80] text-xs font-semibold animate-fadeIn">
              <Check aria-hidden="true" className="w-3.5 h-3.5" />
              Saved
            </span>
          )}

          {user ? (
            <button
              type="button"
              onClick={logout}
              className="anilist-btn-secondary px-4 py-2 min-h-[38px] text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
              <span>Sign Out</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="anilist-btn-primary px-4 py-2 min-h-[38px] text-xs inline-flex items-center gap-1.5"
            >
              <LogIn aria-hidden="true" className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Container-Query Adaptive Workspace: Sidebar on wide screens, pill bar on narrow screens */}
      <div className="settings-layout">
        {/* Adaptive Navigation Rail */}
        <nav aria-label="Settings sections" className="min-w-0">
          <div className="settings-nav no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`settings-nav-btn flex items-center gap-2.5 px-3.5 py-2.5 min-h-[40px] text-xs font-semibold transition whitespace-nowrap flex-shrink-0 cursor-pointer text-left ${
                    isActive
                      ? item.danger
                        ? 'bg-rose-600 text-white'
                        : 'btn-accent-active'
                      : item.danger
                      ? 'text-rose-400 hover:bg-rose-500/10'
                      : 'text-[#9a9aa6] hover:text-[#f5f5f7] hover:bg-[#0c0c0f]'
                  }`}
                >
                  <Icon aria-hidden="true" className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Adaptive Main Content Area */}
        <div className="min-w-0 space-y-6">
          {/* SECTION 1: Appearance, Display & Playback Preferences */}
          {activeSection === 'preferences' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="anilist-card-static divide-y divide-[#23232b] overflow-hidden">
                <div className="p-5 sm:p-6 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-[#f5f5f7]">Appearance & Display</h2>
                    <p className="text-xs text-[#9a9aa6] mt-0.5">
                      Changes apply live across the entire website and save automatically.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      resetPreferences();
                      setPrefsSaved(true);
                      setTimeout(() => setPrefsSaved(false), 1600);
                    }}
                    className="anilist-btn-secondary px-3 py-1.5 text-[11px] inline-flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                    title="Reset all preferences to defaults"
                  >
                    <RotateCcw aria-hidden="true" className="w-3 h-3 text-[#9a9aa6]" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Title Language */}
                <div className="settings-row-container p-5 sm:p-6">
                  <div className="settings-row">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-[#f5f5f7] block">
                        Anime Title Language
                      </span>
                      <span className="text-xs text-[#9a9aa6]">
                        Choose how anime titles appear across cards, hero slides, and search.
                      </span>
                    </div>

                    <div className="inline-flex p-1 rounded-full bg-[#16161b] border border-[#23232b] self-start sm:self-auto flex-shrink-0">
                      {([
                        { id: 'english', label: 'English' },
                        { id: 'romaji', label: 'Romaji' },
                        { id: 'native', label: '日本語' },
                      ] as { id: TitleLanguage; label: string }[]).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handlePrefChange('titleLanguage', opt.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                            preferences.titleLanguage === opt.id
                              ? 'btn-accent-active'
                              : 'text-[#9a9aa6] hover:text-[#f5f5f7]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Layout Density */}
                <div className="settings-row-container p-5 sm:p-6">
                  <div className="settings-row">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-[#f5f5f7] block">
                        Catalog Density
                      </span>
                      <span className="text-xs text-[#9a9aa6]">
                        Switch between spacious editorial cards or compact high-density grids.
                      </span>
                    </div>

                    <div className="inline-flex p-1 rounded-full bg-[#16161b] border border-[#23232b] self-start sm:self-auto flex-shrink-0">
                      {([
                        { id: 'comfortable', label: 'Comfortable' },
                        { id: 'compact', label: 'Compact' },
                      ] as { id: LayoutDensity; label: string }[]).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handlePrefChange('density', opt.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                            preferences.density === opt.id
                              ? 'btn-accent-active'
                              : 'text-[#9a9aa6] hover:text-[#f5f5f7]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Audio Style */}
                <div className="settings-row-container p-5 sm:p-6">
                  <div className="settings-row">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-[#f5f5f7] block">
                        Preferred Audio Metadata
                      </span>
                      <span className="text-xs text-[#9a9aa6]">
                        Default preference for original Japanese (Sub) or English (Dub).
                      </span>
                    </div>

                    <div className="inline-flex p-1 rounded-full bg-[#16161b] border border-[#23232b] self-start sm:self-auto flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handlePrefChange('preferredAudio', 'sub')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                          preferences.preferredAudio === 'sub'
                            ? 'btn-accent-active'
                            : 'text-[#9a9aa6] hover:text-[#f5f5f7]'
                        }`}
                      >
                        Sub
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePrefChange('preferredAudio', 'dub')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                          preferences.preferredAudio === 'dub'
                            ? 'btn-accent-active'
                            : 'text-[#9a9aa6] hover:text-[#f5f5f7]'
                        }`}
                      >
                        Dub
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Playback & Accessibility Switches */}
              <div className="anilist-card-static divide-y divide-[#23232b] overflow-hidden">
                <div className="p-5 sm:p-6">
                  <h2 className="text-base font-bold text-[#f5f5f7]">Playback & Comfort</h2>
                  <p className="text-xs text-[#9a9aa6] mt-0.5">
                    Control trailer behavior, content filtering, and interface motion.
                  </p>
                </div>

                <label className="settings-row-container p-5 sm:p-6 block cursor-pointer">
                  <div className="settings-row">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-[#f5f5f7] block">
                        Autoplay Trailers
                      </span>
                      <span className="text-xs text-[#9a9aa6]">
                        Start video playback automatically when opening an official trailer.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      role="switch"
                      {...({ switch: '' } as Record<string, string>)}
                      checked={preferences.autoTrailer}
                      onChange={(e) => handlePrefChange('autoTrailer', e.target.checked)}
                      className="senpai-switch"
                    />
                  </div>
                </label>

                <label className="settings-row-container p-5 sm:p-6 block cursor-pointer">
                  <div className="settings-row">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-[#f5f5f7] block">
                        Safe Browsing Filter
                      </span>
                      <span className="text-xs text-[#9a9aa6]">
                        Exclude adult 18+ entries from catalog discovery results.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      role="switch"
                      {...({ switch: '' } as Record<string, string>)}
                      checked={preferences.contentFilter}
                      onChange={(e) => handlePrefChange('contentFilter', e.target.checked)}
                      className="senpai-switch"
                    />
                  </div>
                </label>

                <label className="settings-row-container p-5 sm:p-6 block cursor-pointer">
                  <div className="settings-row">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-[#f5f5f7] block">
                        Reduce Animations
                      </span>
                      <span className="text-xs text-[#9a9aa6]">
                        Disable slide transitions and hero entrance motion for instant navigation.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      role="switch"
                      {...({ switch: '' } as Record<string, string>)}
                      checked={preferences.reduceMotion}
                      onChange={(e) => handlePrefChange('reduceMotion', e.target.checked)}
                      className="senpai-switch"
                    />
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* SECTION 2: Profile */}
          {activeSection === 'profile' && (
            <div className="space-y-5 animate-fadeIn">
              {!user ? (
                <div className="anilist-card-static p-6 sm:p-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#16161b] border border-[#23232b] flex items-center justify-center mx-auto text-[#f5f5f7]">
                    <User aria-hidden="true" className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-[#f5f5f7]">Sign in to customize your profile</h2>
                    <p className="text-xs text-[#9a9aa6] max-w-sm mx-auto">
                      Sync your display name, avatar, and watchlist across devices with a free account.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                    <Link to="/login" className="anilist-btn-primary px-5 py-2.5 text-xs">
                      Sign In
                    </Link>
                    <Link to="/signup" className="anilist-btn-secondary px-5 py-2.5 text-xs">
                      Create Account
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Compact Profile Overview + Stats */}
                  <div className="anilist-card-static p-5 sm:p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4">
                      <img
                        src={user.avatar || AVATAR_PRESETS[0].url}
                        alt={user.username}
                        className="w-16 h-16 rounded-2xl object-cover border border-[#383844] flex-shrink-0"
                      />
                      <div className="text-center sm:text-left min-w-0 flex-1">
                        <h2 className="text-lg font-bold text-[#f5f5f7] truncate">{user.username}</h2>
                        <p className="text-xs text-[#9a9aa6] truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/watchlist"
                        className="anilist-btn-secondary px-3.5 py-2 text-xs inline-flex items-center gap-1.5 flex-shrink-0"
                      >
                        <span>Watchlist</span>
                        <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-[#23232b] tabular-nums">
                      <div className="p-3 rounded-xl bg-[#16161b] border border-[#23232b]">
                        <span className="text-[11px] text-[#9a9aa6] block">Saved</span>
                        <span className="text-base font-bold text-[#f5f5f7]">{watchlist.length}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#16161b] border border-[#23232b]">
                        <span className="text-[11px] text-[#9a9aa6] block">Watching</span>
                        <span className="text-base font-bold text-[#f5f5f7]">{watchingCount}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#16161b] border border-[#23232b]">
                        <span className="text-[11px] text-[#9a9aa6] block">Completed</span>
                        <span className="text-base font-bold text-[#f5f5f7]">{completedCount}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#16161b] border border-[#23232b]">
                        <span className="text-[11px] text-[#9a9aa6] block">Watch Time</span>
                        <span className="text-base font-bold text-[#f5f5f7]">{estDaysWatched}d</span>
                      </div>
                    </div>
                  </div>

                  {/* Edit Profile Form */}
                  <div className="anilist-card-static p-5 sm:p-6 space-y-5">
                    <div className="border-b border-[#23232b] pb-3.5">
                      <h2 className="text-base font-bold text-[#f5f5f7]">Edit Profile</h2>
                      <p className="text-xs text-[#9a9aa6] mt-0.5">
                        Update your public display name, avatar preset, bio, and favorite genre.
                      </p>
                    </div>

                    {saveSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/12 border border-emerald-500/30 text-[#4ade80] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                        <Check aria-hidden="true" className="w-4 h-4" />
                        <span>Profile updated.</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-[#d2d2dc] block">Avatar</span>
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
                                    ? 'ring-2 ring-[#5360e6] scale-105'
                                    : 'ring-1 ring-[#23232b] opacity-75 hover:opacity-100'
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="profile-username" className="text-xs font-semibold text-[#d2d2dc] block">
                            Display Name
                          </label>
                          <input
                            id="profile-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Your username"
                            className="anilist-input w-full px-3.5 py-2.5 text-base sm:text-sm"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="profile-genre" className="text-xs font-semibold text-[#d2d2dc] block">
                            Favorite Genre
                          </label>
                          <select
                            id="profile-genre"
                            value={favoriteGenre}
                            onChange={(e) => setFavoriteGenre(e.target.value)}
                            className="anilist-input w-full px-3.5 py-2.5 text-base sm:text-sm"
                          >
                            <option value="Action / Shonen">Action / Shonen</option>
                            <option value="Fantasy / Isekai">Fantasy / Isekai</option>
                            <option value="Romance / Slice of Life">Romance / Slice of Life</option>
                            <option value="Psychological / Thriller">Psychological / Thriller</option>
                            <option value="Sci-Fi / Mecha">Sci-Fi / Mecha</option>
                            <option value="Comedy / Parody">Comedy / Parody</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="profile-bio" className="text-xs font-semibold text-[#d2d2dc] block">
                          Bio
                        </label>
                        <textarea
                          id="profile-bio"
                          rows={3}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Share a short bio or favorite series..."
                          className="anilist-input w-full px-3.5 py-2.5 text-base sm:text-sm resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSaving}
                        className="anilist-btn-primary px-5 py-2.5 min-h-[42px] text-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Save aria-hidden="true" className="w-3.5 h-3.5" />
                        <span>{isSaving ? 'Saving…' : 'Save Changes'}</span>
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          )}

          {/* SECTION 3: Data Ownership & Backups */}
          {activeSection === 'data' && (
            <div className="anilist-card-static p-5 sm:p-6 space-y-5 animate-fadeIn">
              <div className="border-b border-[#23232b] pb-3.5">
                <h2 className="text-base font-bold text-[#f5f5f7]">Your Data & Backups</h2>
                <p className="text-xs text-[#9a9aa6] mt-0.5">
                  You own your anime watchlist. Export a portable JSON backup, restore one, or clear local browser data anytime.
                </p>
              </div>

              {importStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold border animate-fadeIn ${
                    importStatus.ok
                      ? 'bg-emerald-500/12 border-emerald-500/30 text-[#4ade80]'
                      : 'bg-rose-500/12 border-rose-500/30 text-rose-300'
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={exportWatchlist}
                  className="anilist-btn-primary px-4 py-3 text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download aria-hidden="true" className="w-4 h-4" />
                  <span>Export JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="anilist-btn-secondary px-4 py-3 text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload aria-hidden="true" className="w-4 h-4 text-[#9a9aa6]" />
                  <span>Import Backup</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Clear your local watchlist on this browser?')) {
                      clearWatchlist();
                    }
                  }}
                  className="px-4 py-3 rounded-full bg-[#16161b] hover:bg-rose-500/15 border border-[#23232b] hover:border-rose-500/35 text-xs font-semibold text-[#d2d2dc] hover:text-rose-300 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 aria-hidden="true" className="w-4 h-4" />
                  <span>Clear Local List</span>
                </button>
              </div>

              <div className="pt-3 border-t border-[#23232b] flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#9a9aa6]">
                <Link to="/privacy" className="hover:text-[#f5f5f7] transition">
                  Privacy Policy →
                </Link>
                <Link to="/terms" className="hover:text-[#f5f5f7] transition">
                  Terms of Service →
                </Link>
                <Link to="/license" className="hover:text-[#f5f5f7] transition">
                  Open Source Licenses →
                </Link>
                <Link to="/security" className="hover:text-[#f5f5f7] transition">
                  Security Policy →
                </Link>
              </div>
            </div>
          )}

          {/* SECTION 4: Permanent Account Deletion */}
          {activeSection === 'danger' && user && (
            <div className="anilist-card-static p-5 sm:p-6 border-rose-500/30 space-y-4 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/12 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                  <AlertTriangle aria-hidden="true" className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-[#f5f5f7]">
                    Delete Account & Erase All Data
                  </h2>
                  <p className="text-xs text-[#9a9aa6] leading-relaxed">
                    We never keep, sell, or retain your personal data after deletion. Permanently deleting your account removes your login profile, Firestore cloud record, local watchlist, and preferences immediately.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#23232b]">
                <p className="text-xs text-[#9a9aa6]">
                  Export your JSON backup first if you want to keep a copy of your list.
                </p>
                <button
                  type="button"
                  onClick={openDeleteDialog}
                  className="anilist-btn-danger px-5 py-2.5 min-h-[42px] text-xs inline-flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
                >
                  <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
                  <span>Delete My Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Native <dialog> Confirmation Modal for Account Deletion */}
      <dialog
        ref={deleteDialogRef}
        aria-labelledby="delete-account-dialog-title"
        {...({ closedby: 'any' } as Record<string, string>)}
        className="liquid-dialog"
      >
        <form onSubmit={handleConfirmDeleteAccount} className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/12 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                <AlertTriangle aria-hidden="true" className="w-4 h-4" />
              </div>
              <h2 id="delete-account-dialog-title" className="text-base font-bold text-[#f5f5f7]">
                Permanently delete account?
              </h2>
            </div>
            <button
              type="button"
              onClick={closeDeleteDialog}
              aria-label="Close delete account dialog"
              className="w-8 h-8 rounded-full bg-[#16161b] border border-[#23232b] text-[#9a9aa6] hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#d2d2dc] leading-relaxed">
            This action cannot be undone. Your AnimeSenpai account, cloud profile, local watchlist ({watchlist.length} titles), and saved preferences will be permanently erased.
          </p>

          {deleteError && (
            <div className="p-3 rounded-xl bg-rose-500/12 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {deleteError}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="confirm-delete-input" className="text-xs font-semibold text-[#d2d2dc] block">
              Type <span className="font-mono font-bold text-rose-300">DELETE</span> to confirm
            </label>
            <input
              id="confirm-delete-input"
              type="text"
              autoComplete="off"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="anilist-input w-full px-3.5 py-2.5 text-base sm:text-sm font-mono"
            />
          </div>

          {needsReauth && authProvider === 'password' && (
            <div className="space-y-1.5">
              <label htmlFor="reauth-password-input" className="text-xs font-semibold text-[#d2d2dc] block">
                Enter your password to verify deletion
              </label>
              <input
                id="reauth-password-input"
                type="password"
                required
                value={reauthPassword}
                onChange={(e) => setReauthPassword(e.target.value)}
                placeholder="Your current password"
                className="anilist-input w-full px-3.5 py-2.5 text-base sm:text-sm"
              />
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-[#23232b]">
            <button
              type="button"
              autoFocus
              disabled={isDeleting}
              onClick={closeDeleteDialog}
              className="anilist-btn-secondary px-4 py-2.5 min-h-[42px] text-xs cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isDeleting || deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
              className="anilist-btn-danger px-5 py-2.5 min-h-[42px] text-xs inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
              <span>
                {isDeleting
                  ? 'Deleting…'
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
