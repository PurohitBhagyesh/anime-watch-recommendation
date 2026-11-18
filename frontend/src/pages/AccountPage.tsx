import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Camera,
  Image as ImageIcon,
  FolderOpen,
  Type,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import {
  usePreferences,
  type TitleLanguage,
  type LayoutDensity,
  type TextSize,
} from '../context/PreferencesContext';
import { UserAvatar } from '../components/common/UserAvatar';
import { useSEO, SITE_URL } from '../utils/seo';

interface AccountPageProps {
  defaultTab?: 'account' | 'settings';
}

type SettingsSection = 'preferences' | 'profile' | 'data' | 'danger';

const TEXT_SIZE_STEPS: { id: TextSize; label: string; pct: string }[] = [
  { id: 'sm', label: 'Small', pct: '90%' },
  { id: 'md', label: 'Default', pct: '100%' },
  { id: 'lg', label: 'Large', pct: '112%' },
  { id: 'xl', label: 'XL', pct: '124%' },
];

/** Center-crops and compresses an image file or video frame into a crisp 256x256 JPEG data URL */
function cropImageSourceToDataUrl(source: HTMLImageElement | HTMLVideoElement): string {
  const sw = 'videoWidth' in source ? source.videoWidth : source.naturalWidth;
  const sh = 'videoHeight' in source ? source.videoHeight : source.naturalHeight;
  const side = Math.min(sw, sh) || 256;
  const sx = Math.max(0, (sw - side) / 2);
  const sy = Math.max(0, (sh - side) / 2);

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.drawImage(source, sx, sy, side, side, 0, 0, 256, 256);
  return canvas.toDataURL('image/jpeg', 0.84);
}

function readFileAsCroppedAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(cropImageSourceToDataUrl(img));
      img.onerror = () => reject(new Error('Unsupported image format'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Could not read selected file'));
    reader.readAsDataURL(file);
  });
}

export const AccountPage: React.FC<AccountPageProps> = ({ defaultTab }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, authProvider, updateProfile, logout, deleteAccount } = useAuth();
  const { watchlist, exportWatchlist, importWatchlist, clearWatchlist } = useWatchlist();
  const { preferences, updatePreference, resetPreferences } = usePreferences();

  useSEO({
    title: 'Settings & Account • AnimeSenpai',
    description:
      'Customize AnimeSenpai text size, title language, density, profile photo, backups, or permanently delete your account.',
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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Apple-style Photo Picker & Live Camera state
  const photoDialogRef = useRef<HTMLDialogElement>(null);
  const photoLibraryInputRef = useRef<HTMLInputElement>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [cameraMode, setCameraMode] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Saved indicator for preferences
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Backup import feedback
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ ok: boolean; text: string } | null>(null);

  // Delete Account <dialog> state
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
    }
  }, [user]);

  const stopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    setCameraMode(false);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // Attach MediaStream to <video> when live camera activates
  useEffect(() => {
    if (cameraMode && videoRef.current && cameraStreamRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraMode]);

  // Safari fallback for light-dismiss on both native <dialog>s
  useEffect(() => {
    if ('closedBy' in HTMLDialogElement.prototype) return;
    const dialogs = [
      { el: deleteDialogRef.current, blocked: isDeleting, onClose: undefined },
      { el: photoDialogRef.current, blocked: photoBusy, onClose: stopCamera },
    ];
    const cleanups: (() => void)[] = [];

    for (const item of dialogs) {
      const dialog = item.el;
      if (!dialog) continue;
      const isOutside = (e: PointerEvent) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      let pressedOutside = false;
      const onDown = (e: PointerEvent) => {
        pressedOutside = isOutside(e);
      };
      const onUp = (e: PointerEvent) => {
        if (pressedOutside && isOutside(e) && !item.blocked) {
          item.onClose?.();
          dialog.close();
        }
      };
      dialog.addEventListener('pointerdown', onDown);
      dialog.addEventListener('pointerup', onUp);
      cleanups.push(() => {
        dialog.removeEventListener('pointerdown', onDown);
        dialog.removeEventListener('pointerup', onUp);
      });
    }
    return () => cleanups.forEach((fn) => fn());
  }, [isDeleting, photoBusy, stopCamera]);

  const handlePrefChange = <K extends keyof typeof preferences>(
    key: K,
    value: (typeof preferences)[K]
  ) => {
    updatePreference(key, value);
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 1600);
  };

  const openPhotoSheet = () => {
    setPhotoError(null);
    stopCamera();
    photoDialogRef.current?.showModal();
  };

  const closePhotoSheet = () => {
    stopCamera();
    photoDialogRef.current?.close();
  };

  const handlePhotoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please choose an image file (JPG, PNG, or WebP).');
      return;
    }

    setPhotoBusy(true);
    setPhotoError(null);
    try {
      const dataUrl = await readFileAsCroppedAvatar(file);
      await updateProfile({ avatar: dataUrl });
      closePhotoSheet();
    } catch {
      setPhotoError('Could not process that image. Please try another photo.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleStartLiveCamera = async () => {
    setPhotoError(null);

    // On mobile touch devices, native capture="user" provides the crispest OS camera experience
    const isCoarsePointer =
      typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

    if (isCoarsePointer || !navigator.mediaDevices?.getUserMedia) {
      nativeCameraInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      cameraStreamRef.current = stream;
      setCameraMode(true);
    } catch {
      // Fallback to native file/camera input if webcam permission was denied or unavailable
      nativeCameraInputRef.current?.click();
    }
  };

  const handleCaptureCameraFrame = async () => {
    if (!videoRef.current || !user) return;
    setPhotoBusy(true);
    setPhotoError(null);
    try {
      const dataUrl = cropImageSourceToDataUrl(videoRef.current);
      await updateProfile({ avatar: dataUrl });
      closePhotoSheet();
    } catch {
      setPhotoError('Could not capture photo. Please try again.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;
    setPhotoBusy(true);
    try {
      await updateProfile({ avatar: '' });
      closePhotoSheet();
    } finally {
      setPhotoBusy(false);
    }
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

  const currentTextSizeIndex = Math.max(
    0,
    TEXT_SIZE_STEPS.findIndex((s) => s.id === preferences.textSize)
  );

  const navItems: { id: SettingsSection; label: string; icon: React.ElementType; danger?: boolean }[] = [
    { id: 'preferences', label: 'Display', icon: Sliders },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'data', label: 'Data', icon: Database },
    ...(user ? [{ id: 'danger' as const, label: 'Delete', icon: Trash2, danger: true }] : []),
  ];

  return (
    <div className="settings-workspace w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 sm:py-8 animate-fadeIn space-y-5">
      {/* Compact Single-Row Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#23232b]">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f5f5f7] tracking-[-0.03em] leading-tight">
            Settings
          </h1>
          <p className="text-xs text-[#9a9aa6] mt-0.5 truncate">
            Display, text size, profile photo & data
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {prefsSaved && (
            <span className="hidden min-[420px]:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/12 border border-emerald-500/30 text-[#4ade80] text-[11px] font-semibold animate-fadeIn">
              <Check aria-hidden="true" className="w-3 h-3" />
              Saved
            </span>
          )}

          {user ? (
            <button
              type="button"
              onClick={logout}
              className="anilist-btn-secondary px-3.5 py-2 min-h-[36px] text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
              <span>Sign Out</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="anilist-btn-primary px-4 py-2 min-h-[36px] text-xs inline-flex items-center gap-1.5"
            >
              <LogIn aria-hidden="true" className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Container-Query Adaptive Layout: Full-width pill bar on mobile, sticky rail on wide screens */}
      <div className="settings-layout">
        <nav aria-label="Settings sections" className="min-w-0">
          <div className="settings-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`settings-nav-btn flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3.5 py-2 min-h-[38px] text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? item.danger
                        ? 'bg-rose-600 text-white'
                        : 'btn-accent-active'
                      : item.danger
                      ? 'text-rose-400 hover:bg-rose-500/10'
                      : 'text-[#9a9aa6] hover:text-[#f5f5f7] hover:bg-[#16161b]'
                  }`}
                >
                  <Icon aria-hidden="true" className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Panel */}
        <div className="min-w-0 space-y-5">
          {/* SECTION 1: Display, Text Size & Playback */}
          {activeSection === 'preferences' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Apple-Style Text Size Card */}
              <div className="anilist-card-static p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Type aria-hidden="true" className="w-4 h-4 text-[#f5f5f7]" />
                    <h2 className="text-sm sm:text-base font-bold text-[#f5f5f7]">Text Size</h2>
                  </div>
                  <span className="text-xs font-mono text-[#9a9aa6] tabular-nums">
                    {TEXT_SIZE_STEPS[currentTextSizeIndex].label} ({TEXT_SIZE_STEPS[currentTextSizeIndex].pct})
                  </span>
                </div>

                {/* Apple A ───●─── A Range Slider */}
                <div className="flex items-center gap-3.5 px-1">
                  <span className="text-xs font-semibold text-[#9a9aa6] select-none" aria-hidden="true">
                    A
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={TEXT_SIZE_STEPS.length - 1}
                    step={1}
                    value={currentTextSizeIndex}
                    aria-label="Text size"
                    onChange={(e) => {
                      const step = TEXT_SIZE_STEPS[Number(e.target.value)];
                      if (step) handlePrefChange('textSize', step.id);
                    }}
                    className="senpai-range flex-1"
                  />
                  <span className="text-xl font-bold text-[#f5f5f7] select-none" aria-hidden="true">
                    A
                  </span>
                </div>

                {/* Quick Size Stops */}
                <div className="grid grid-cols-4 gap-1.5">
                  {TEXT_SIZE_STEPS.map((step) => (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => handlePrefChange('textSize', step.id)}
                      className={`py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                        preferences.textSize === step.id
                          ? 'btn-accent-active'
                          : 'bg-[#16161b] text-[#9a9aa6] hover:text-[#f5f5f7] border border-[#23232b]'
                      }`}
                    >
                      {step.label}
                    </button>
                  ))}
                </div>

                {/* Live Preview */}
                <div className="p-3.5 rounded-xl bg-[#16161b] border border-[#23232b] space-y-1">
                  <p className="text-sm font-semibold text-[#f5f5f7]">
                    Live Typography Preview
                  </p>
                  <p className="text-xs text-[#9a9aa6] leading-relaxed">
                    Drag the slider above to resize headings, synopses, and episode metadata across AnimeSenpai.
                  </p>
                </div>
              </div>

              {/* Display & Title Options */}
              <div className="anilist-card-static divide-y divide-[#23232b] overflow-hidden">
                <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[#f5f5f7]">Catalog & Language</h2>
                    <p className="text-xs text-[#9a9aa6] mt-0.5">
                      Applies immediately across all pages.
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
                  >
                    <RotateCcw aria-hidden="true" className="w-3 h-3 text-[#9a9aa6]" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="settings-row-container p-4 sm:p-5">
                  <div className="settings-row">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-[#f5f5f7] block">
                        Anime Title Language
                      </span>
                      <span className="text-xs text-[#9a9aa6]">
                        Title style shown on cards, hero, and search.
                      </span>
                    </div>

                    <div className="inline-flex p-1 rounded-full bg-[#16161b] border border-[#23232b] self-start flex-shrink-0">
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

                <div className="settings-row-container p-4 sm:p-5">
                  <div className="settings-row">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-[#f5f5f7] block">
                        Catalog Density
                      </span>
                      <span className="text-xs text-[#9a9aa6]">
                        Comfortable spacing or compact high-density cards.
                      </span>
                    </div>

                    <div className="inline-flex p-1 rounded-full bg-[#16161b] border border-[#23232b] self-start flex-shrink-0">
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

                <div className="settings-row-container p-4 sm:p-5">
                  <div className="settings-row">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-[#f5f5f7] block">
                        Preferred Audio
                      </span>
                      <span className="text-xs text-[#9a9aa6]">
                        Subtitled Japanese or English Dub metadata.
                      </span>
                    </div>

                    <div className="inline-flex p-1 rounded-full bg-[#16161b] border border-[#23232b] self-start flex-shrink-0">
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

              {/* Playback & Comfort Switches */}
              <div className="anilist-card-static divide-y divide-[#23232b] overflow-hidden">
                <label className="settings-row-container p-4 sm:p-5 block cursor-pointer">
                  <div className="settings-row">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-[#f5f5f7] block">
                        Autoplay Trailers
                      </span>
                      <span className="text-xs text-[#9a9aa6]">
                        Start playback immediately when opening an official trailer.
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

                <label className="settings-row-container p-4 sm:p-5 block cursor-pointer">
                  <div className="settings-row">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-[#f5f5f7] block">
                        Safe Browsing Filter
                      </span>
                      <span className="text-xs text-[#9a9aa6]">
                        Exclude adult 18+ entries from discovery results.
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

                <label className="settings-row-container p-4 sm:p-5 block cursor-pointer">
                  <div className="settings-row">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-[#f5f5f7] block">
                        Reduce Animations
                      </span>
                      <span className="text-xs text-[#9a9aa6]">
                        Disable slide transitions for instant navigation.
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

          {/* SECTION 2: Profile & Apple-Style Photo Picker */}
          {activeSection === 'profile' && (
            <div className="space-y-4 animate-fadeIn">
              {!user ? (
                <div className="anilist-card-static p-6 sm:p-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#16161b] border border-[#23232b] flex items-center justify-center mx-auto text-[#f5f5f7]">
                    <User aria-hidden="true" className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-[#f5f5f7]">Sign in to edit your profile</h2>
                    <p className="text-xs text-[#9a9aa6] max-w-sm mx-auto">
                      Upload a profile photo, customize your bio, and sync your watchlist across devices.
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
                  {/* Apple-Style Profile Photo & Quick Stats */}
                  <div className="anilist-card-static p-5 space-y-5">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <button
                        type="button"
                        onClick={openPhotoSheet}
                        aria-label="Change profile photo"
                        className="relative group rounded-full focus-visible:outline-2 focus-visible:outline-[#5360e6] focus-visible:outline-offset-2 cursor-pointer flex-shrink-0"
                      >
                        <UserAvatar src={user.avatar} name={user.username} size="xl" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-[#5360e6] text-white border-2 border-[#0c0c0f] flex items-center justify-center shadow-lg group-hover:bg-[#6470f2] transition">
                          <Camera aria-hidden="true" className="w-3.5 h-3.5" />
                        </span>
                      </button>

                      <div className="text-center sm:text-left min-w-0 flex-1 space-y-1">
                        <h2 className="text-lg font-bold text-[#f5f5f7] truncate">{user.username}</h2>
                        <p className="text-xs text-[#9a9aa6] truncate">{user.email}</p>
                        <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <button
                            type="button"
                            onClick={openPhotoSheet}
                            className="anilist-btn-primary px-3.5 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Camera aria-hidden="true" className="w-3.5 h-3.5" />
                            <span>{user.avatar ? 'Change Photo' : 'Add Photo'}</span>
                          </button>
                          <Link
                            to="/watchlist"
                            className="anilist-btn-secondary px-3.5 py-1.5 text-xs inline-flex items-center gap-1"
                          >
                            <span>Watchlist</span>
                            <ArrowRight aria-hidden="true" className="w-3 h-3 text-[#9a9aa6]" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-[#23232b] tabular-nums">
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

                  {/* Edit Profile Details */}
                  <div className="anilist-card-static p-5 space-y-4">
                    <div className="border-b border-[#23232b] pb-3">
                      <h2 className="text-sm sm:text-base font-bold text-[#f5f5f7]">Profile Details</h2>
                    </div>

                    {saveSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/12 border border-emerald-500/30 text-[#4ade80] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                        <Check aria-hidden="true" className="w-4 h-4" />
                        <span>Profile updated.</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveProfile} className="space-y-4">
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
                            placeholder="Your name"
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
            <div className="anilist-card-static p-5 space-y-5 animate-fadeIn">
              <div className="border-b border-[#23232b] pb-3">
                <h2 className="text-sm sm:text-base font-bold text-[#f5f5f7]">Your Data & Backups</h2>
                <p className="text-xs text-[#9a9aa6] mt-0.5">
                  Export a portable JSON backup of your anime list, restore one, or clear local browser data anytime.
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
            <div className="anilist-card-static p-5 border-rose-500/30 space-y-4 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/12 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                  <AlertTriangle aria-hidden="true" className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-sm sm:text-base font-bold text-[#f5f5f7]">
                    Delete Account & Erase All Data
                  </h2>
                  <p className="text-xs text-[#9a9aa6] leading-relaxed">
                    We never keep, sell, or retain your personal data after deletion. Permanently deleting your account removes your login profile, cloud record, local watchlist, and preferences immediately.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#23232b]">
                <p className="text-xs text-[#9a9aa6]">
                  Export your JSON backup first if you want a local copy.
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

      {/* Hidden File & Native Camera Inputs for Apple-Style Photo Options */}
      <input
        ref={photoLibraryInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoFileSelected}
        className="hidden"
      />
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handlePhotoFileSelected}
        className="hidden"
      />
      <input
        ref={photoFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/heic"
        onChange={handlePhotoFileSelected}
        className="hidden"
      />

      {/* Apple-Style Profile Photo Action Sheet & Live Camera <dialog> */}
      <dialog
        ref={photoDialogRef}
        aria-labelledby="photo-sheet-title"
        {...({ closedby: 'any' } as Record<string, string>)}
        onCancel={stopCamera}
        className="liquid-dialog"
      >
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="photo-sheet-title" className="text-base font-bold text-[#f5f5f7]">
              {cameraMode ? 'Take Profile Photo' : 'Update Profile Photo'}
            </h2>
            <button
              type="button"
              onClick={closePhotoSheet}
              aria-label="Close photo picker"
              className="w-8 h-8 rounded-full bg-[#16161b] border border-[#23232b] text-[#9a9aa6] hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>

          {photoError && (
            <div className="p-3 rounded-xl bg-rose-500/12 border border-rose-500/30 text-rose-300 text-xs">
              {photoError}
            </div>
          )}

          {cameraMode ? (
            <div className="space-y-4">
              <div className="relative mx-auto w-60 h-60 rounded-full overflow-hidden bg-black border-2 border-[#383844]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              </div>

              <div className="flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={stopCamera}
                  disabled={photoBusy}
                  className="anilist-btn-secondary px-4 py-2.5 text-xs cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCaptureCameraFrame}
                  disabled={photoBusy}
                  className="anilist-btn-primary px-6 py-2.5 text-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Camera aria-hidden="true" className="w-4 h-4" />
                  <span>{photoBusy ? 'Saving…' : 'Capture Photo'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="rounded-2xl bg-[#16161b] border border-[#23232b] divide-y divide-[#23232b] overflow-hidden">
                <button
                  type="button"
                  disabled={photoBusy}
                  onClick={() => photoLibraryInputRef.current?.click()}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium text-[#f5f5f7] hover:bg-[#1d1d24] transition cursor-pointer"
                >
                  <span>Photo Library</span>
                  <ImageIcon aria-hidden="true" className="w-4 h-4 text-[#9a9aa6]" />
                </button>

                <button
                  type="button"
                  disabled={photoBusy}
                  onClick={handleStartLiveCamera}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium text-[#f5f5f7] hover:bg-[#1d1d24] transition cursor-pointer"
                >
                  <span>Take Photo</span>
                  <Camera aria-hidden="true" className="w-4 h-4 text-[#9a9aa6]" />
                </button>

                <button
                  type="button"
                  disabled={photoBusy}
                  onClick={() => photoFileInputRef.current?.click()}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium text-[#f5f5f7] hover:bg-[#1d1d24] transition cursor-pointer"
                >
                  <span>Choose File</span>
                  <FolderOpen aria-hidden="true" className="w-4 h-4 text-[#9a9aa6]" />
                </button>

                {user?.avatar && (
                  <button
                    type="button"
                    disabled={photoBusy}
                    onClick={handleRemovePhoto}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  >
                    <span>Remove Current Photo</span>
                    <Trash2 aria-hidden="true" className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={closePhotoSheet}
                className="w-full anilist-btn-secondary py-2.5 text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </dialog>

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
