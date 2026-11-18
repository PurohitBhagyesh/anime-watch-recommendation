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
  Info,
  Shield,
  ShieldCheck,
  FileText,
  Scale,
  Lock,
  ChevronRight,
  ExternalLink,
  Mail,
  KeyRound,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  Link2,
} from 'lucide-react';
import {
  useAuth,
  validateUsername,
  validateEmail,
  validateNewPassword,
  getPasswordStrength,
} from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import {
  usePreferences,
  type TitleLanguage,
  type LayoutDensity,
  type TextSize,
} from '../context/PreferencesContext';
import { UserAvatar } from '../components/common/UserAvatar';
import { AppLogo } from '../components/common/AppLogo';
import { useSEO, SITE_URL } from '../utils/seo';

interface AccountPageProps {
  defaultTab?: 'account' | 'settings';
}

type SettingsSection = 'preferences' | 'profile' | 'security' | 'data' | 'about';

const TEXT_SIZE_STEPS: { id: TextSize; label: string; pct: string }[] = [
  { id: 'sm', label: 'Small', pct: '90%' },
  { id: 'md', label: 'Default', pct: '100%' },
  { id: 'lg', label: 'Large', pct: '112%' },
];

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

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
  const {
    user,
    emailVerified,
    linkedProviders,
    authProvider,
    updateProfile,
    logout,
    deleteAccount,
    resendVerificationEmail,
    refreshAuthUser,
    changePassword,
    changeEmail,
    sendPasswordReset,
    linkAuthProvider,
    unlinkAuthProvider,
  } = useAuth();
  const { watchlist, exportWatchlist, importWatchlist, clearWatchlist } = useWatchlist();
  const { preferences, updatePreference, resetPreferences } = usePreferences();

  useSEO({
    title: 'Settings & Account • AnimeSenpai',
    description:
      'Customize AnimeSenpai display, text size, profile photo, Google sign-in, security, backups, or delete your account.',
    canonicalUrl:
      defaultTab === 'account' || location.pathname.includes('account')
        ? `${SITE_URL}/account`
        : `${SITE_URL}/settings`,
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
  const [favoriteGenre, setFavoriteGenre] = useState(user?.favoriteGenre || 'Action / Shonen');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
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

  // Security state
  const [securityNotice, setSecurityNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [providerBusy, setProviderBusy] = useState<string | null>(null);

  // Email change state
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailReauthPassword, setEmailReauthPassword] = useState('');
  const [emailNeedsReauth, setEmailNeedsReauth] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showSecPasswords, setShowSecPasswords] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);

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

  useEffect(() => {
    if (cameraMode && videoRef.current && cameraStreamRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraMode]);

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
    setProfileError(null);
    setSaveSuccess(false);

    const uErr = validateUsername(username);
    if (uErr) {
      setProfileError(uErr);
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateProfile({
        username: username.trim().replace(/\s+/g, ' '),
        favoriteGenre,
      });
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2600);
      } else {
        setProfileError(res.error || 'Could not update profile.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getOAuthReauthToken = () => {
    if (linkedProviders.includes('google.com')) return '__google_reauth__';
    return '';
  };

  const handleSendVerification = async () => {
    setVerifyBusy(true);
    setSecurityNotice(null);
    try {
      const res = await resendVerificationEmail();
      setSecurityNotice({
        ok: res.success,
        text: res.success
          ? 'Verification email sent! Open the link in your inbox, then tap Refresh Status.'
          : res.error || 'Could not send verification email.',
      });
    } finally {
      setVerifyBusy(false);
    }
  };

  const handleRefreshSecurity = async () => {
    setVerifyBusy(true);
    try {
      await refreshAuthUser();
      setSecurityNotice({ ok: true, text: 'Account security status refreshed.' });
    } finally {
      setVerifyBusy(false);
    }
  };

  const handleGoogleProviderToggle = async () => {
    const providerId = 'google.com';
    const isLinked = linkedProviders.includes(providerId);
    setProviderBusy(providerId);
    setSecurityNotice(null);

    try {
      const res = isLinked
        ? await unlinkAuthProvider(providerId)
        : await linkAuthProvider('google');

      setSecurityNotice({
        ok: res.success,
        text: res.success
          ? isLinked
            ? 'Google disconnected from your account.'
            : 'Google linked to your account.'
          : res.error || 'Could not update sign-in provider.',
      });
    } finally {
      setProviderBusy(null);
    }
  };

  const handleEmailChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityNotice(null);
    const eErr = validateEmail(newEmail);
    if (eErr) {
      setSecurityNotice({ ok: false, text: eErr });
      return;
    }

    setEmailBusy(true);
    try {
      const reauthArg = emailNeedsReauth
        ? linkedProviders.includes('password')
          ? emailReauthPassword
          : getOAuthReauthToken()
        : undefined;

      const res = await changeEmail(newEmail, reauthArg);
      if (res.success) {
        setSecurityNotice({
          ok: true,
          text: `Confirmation link sent to ${newEmail.trim().toLowerCase()}. Open it to complete the email change.`,
        });
        setShowEmailForm(false);
        setNewEmail('');
        setEmailReauthPassword('');
        setEmailNeedsReauth(false);
      } else {
        if (res.requiresRecentLogin) setEmailNeedsReauth(true);
        setSecurityNotice({ ok: false, text: res.error || 'Could not change email.' });
      }
    } finally {
      setEmailBusy(false);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityNotice(null);

    const pErr = validateNewPassword(newPassword);
    if (pErr) {
      setSecurityNotice({ ok: false, text: pErr });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setSecurityNotice({ ok: false, text: 'New passwords do not match.' });
      return;
    }

    setPasswordBusy(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        setSecurityNotice({ ok: true, text: 'Password updated successfully.' });
        setShowPasswordForm(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setSecurityNotice({ ok: false, text: res.error || 'Could not change password.' });
      }
    } finally {
      setPasswordBusy(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    setPasswordBusy(true);
    setSecurityNotice(null);
    try {
      const res = await sendPasswordReset(user.email);
      setSecurityNotice({
        ok: res.success,
        text: res.success
          ? `Password reset link sent to ${user.email}.`
          : res.error || 'Unable to send password reset email.',
      });
    } finally {
      setPasswordBusy(false);
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

  const newPwdStrength = getPasswordStrength(newPassword);
  const strengthBarColors = [
    'bg-rose-500',
    'bg-rose-400',
    'bg-amber-400',
    'bg-emerald-400',
    'bg-emerald-500',
  ];

  const hasPasswordProvider = linkedProviders.includes('password');
  const hasGoogleProvider = linkedProviders.includes('google.com');

  const navItems: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
    { id: 'preferences', label: 'Display', icon: Sliders },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'about', label: 'About', icon: Info },
  ];

  const legalLinks = [
    {
      to: '/about',
      title: 'About AnimeSenpai',
      subtitle: 'Platform mission, independence, and transparency',
      icon: Info,
    },
    {
      to: '/privacy',
      title: 'Privacy Policy',
      subtitle: 'Zero data selling, local storage, and erasure rights',
      icon: Lock,
    },
    {
      to: '/terms',
      title: 'Terms of Service',
      subtitle: 'Usage guidelines and third-party media notices',
      icon: FileText,
    },
    {
      to: '/license',
      title: 'Licenses',
      subtitle: 'MIT open-source license and AniList attribution',
      icon: Scale,
    },
    {
      to: '/security',
      title: 'Security',
      subtitle: 'Vulnerability disclosure and security policy',
      icon: Shield,
    },
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
            Display, profile, sign-in security & data
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

      {/* Container-Query Adaptive Layout */}
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
                  onClick={() => {
                    setActiveSection(item.id);
                    setSecurityNotice(null);
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`settings-nav-btn flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-3.5 py-2 min-h-[38px] text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'btn-accent-active'
                      : 'text-[#9a9aa6] hover:text-[#f5f5f7] hover:bg-[#16161b]'
                  }`}
                >
                  <Icon aria-hidden="true" className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{item.label}</span>
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
              {/* Clean 3-Option Text Size Selector */}
              <div className="anilist-card-static p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Type aria-hidden="true" className="w-4 h-4 text-[#f5f5f7]" />
                    <h2 className="text-sm sm:text-base font-bold text-[#f5f5f7]">Text Size</h2>
                  </div>
                  <span className="text-xs font-mono text-[#9a9aa6] tabular-nums">
                    {TEXT_SIZE_STEPS[currentTextSizeIndex].label} ({TEXT_SIZE_STEPS[currentTextSizeIndex].pct})
                  </span>
                </div>

                <div
                  role="radiogroup"
                  aria-label="Text size"
                  className="grid grid-cols-3 p-1 rounded-full bg-[#16161b] border border-[#23232b] gap-1"
                >
                  {TEXT_SIZE_STEPS.map((step) => {
                    const isSelected = preferences.textSize === step.id;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handlePrefChange('textSize', step.id)}
                        className={`py-2.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'btn-accent-active'
                            : 'text-[#9a9aa6] hover:text-[#f5f5f7]'
                        }`}
                      >
                        {step.label}
                      </button>
                    );
                  })}
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
                      Sign in with Google or email to upload a photo, customize your profile, and sync your watchlist.
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
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-[#9a9aa6]">
                          <span className="truncate">{user.email || 'Signed in'}</span>
                          {user.email ? (
                            emailVerified ? (
                              <span className="inline-flex items-center gap-1 text-[#4ade80] text-[11px] font-medium">
                                <CheckCircle2 aria-hidden="true" className="w-3 h-3" />
                                Verified
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setActiveSection('security')}
                                className="text-amber-300 hover:underline text-[11px] font-medium cursor-pointer"
                              >
                                Verify email →
                              </button>
                            )
                          ) : null}
                        </div>
                        <div className="pt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <button
                            type="button"
                            onClick={openPhotoSheet}
                            className="anilist-btn-primary px-3.5 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Camera aria-hidden="true" className="w-3.5 h-3.5" />
                            <span>{user.avatar ? 'Change Photo' : 'Add Photo'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveSection('security')}
                            className="anilist-btn-secondary px-3.5 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <ShieldCheck aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
                            <span>Security</span>
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

                    {profileError && (
                      <div className="p-3 rounded-xl bg-rose-500/12 border border-rose-500/30 text-rose-300 text-xs font-semibold animate-fadeIn">
                        {profileError}
                      </div>
                    )}

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
                            Username
                          </label>
                          <input
                            id="profile-username"
                            type="text"
                            minLength={3}
                            maxLength={24}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Your username"
                            className="anilist-input w-full px-3.5 py-2.5 text-base sm:text-sm"
                          />
                          <p className="text-[11px] text-[#666672]">
                            3–24 characters: letters, numbers, spaces, dots, underscores, or hyphens.
                          </p>
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

          {/* SECTION 3: Account Security, Linked Providers, Email & Password */}
          {activeSection === 'security' && (
            <div className="space-y-4 animate-fadeIn">
              {!user ? (
                <div className="anilist-card-static p-6 sm:p-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#16161b] border border-[#23232b] flex items-center justify-center mx-auto text-[#f5f5f7]">
                    <ShieldCheck aria-hidden="true" className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-[#f5f5f7]">Sign in to manage account security</h2>
                    <p className="text-xs text-[#9a9aa6] max-w-sm mx-auto">
                      Manage Google sign-in, email verification, and password controls for your account.
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
                  {securityNotice && (
                    <div
                      className={`p-3.5 rounded-2xl text-xs font-medium border flex items-start justify-between gap-3 animate-fadeIn ${
                        securityNotice.ok
                          ? 'bg-emerald-500/12 border-emerald-500/30 text-[#4ade80]'
                          : 'bg-rose-500/12 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      <span>{securityNotice.text}</span>
                      <button
                        type="button"
                        onClick={() => setSecurityNotice(null)}
                        aria-label="Dismiss message"
                        className="opacity-70 hover:opacity-100 cursor-pointer flex-shrink-0"
                      >
                        <X aria-hidden="true" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Security Overview Strip */}
                  <div className="anilist-card-static p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#16161b] border border-[#23232b] flex items-center justify-center text-[#f5f5f7]">
                          <ShieldCheck aria-hidden="true" className="w-4 h-4" />
                        </div>
                        <div>
                          <h2 className="text-sm sm:text-base font-bold text-[#f5f5f7]">
                            Sign-In & Security
                          </h2>
                          <p className="text-xs text-[#9a9aa6]">
                            Manage Google sign-in, email verification, and password.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={verifyBusy}
                        onClick={handleRefreshSecurity}
                        className="anilist-btn-secondary px-3 py-1.5 text-[11px] inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw
                          aria-hidden="true"
                          className={`w-3 h-3 text-[#9a9aa6] ${verifyBusy ? 'animate-spin' : ''}`}
                        />
                        <span>Refresh Status</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <div className="p-3 rounded-xl bg-[#16161b] border border-[#23232b]">
                        <span className="text-[11px] text-[#9a9aa6] block">Email Status</span>
                        <span
                          className={`text-xs font-bold mt-0.5 inline-flex items-center gap-1 ${
                            emailVerified ? 'text-[#4ade80]' : 'text-amber-300'
                          }`}
                        >
                          {emailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#16161b] border border-[#23232b]">
                        <span className="text-[11px] text-[#9a9aa6] block">Sign-In Methods</span>
                        <span className="text-xs font-bold text-[#f5f5f7] mt-0.5 block">
                          {linkedProviders.length || 1} Connected
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CONNECTED SIGN-IN PROVIDERS (Google & Email) */}
                  <div className="anilist-card-static overflow-hidden divide-y divide-[#23232b]">
                    <div className="p-4 sm:p-5 flex items-center gap-2.5">
                      <Link2 aria-hidden="true" className="w-4 h-4 text-[#f5f5f7]" />
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-[#f5f5f7]">
                          Connected Sign-In Methods
                        </h2>
                        <p className="text-xs text-[#9a9aa6]">
                          Link your Google account for faster one-tap sign-in.
                        </p>
                      </div>
                    </div>

                    {/* Google */}
                    <div className="p-4 sm:px-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-xl bg-[#16161b] border border-[#23232b] flex items-center justify-center flex-shrink-0">
                          <GoogleIcon className="w-4 h-4" />
                        </span>
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-[#f5f5f7] block">Google</span>
                          <span className="text-xs text-[#9a9aa6]">
                            {hasGoogleProvider ? 'Connected to your Google Account' : 'One-tap Google authentication'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={providerBusy !== null || (hasGoogleProvider && linkedProviders.length <= 1)}
                        onClick={handleGoogleProviderToggle}
                        className={`px-3.5 py-1.5 text-xs flex-shrink-0 cursor-pointer disabled:opacity-45 ${
                          hasGoogleProvider ? 'anilist-btn-secondary' : 'anilist-btn-primary'
                        }`}
                      >
                        {providerBusy === 'google.com'
                          ? 'Working…'
                          : hasGoogleProvider
                          ? linkedProviders.length <= 1
                            ? 'Primary'
                            : 'Disconnect'
                          : 'Connect'}
                      </button>
                    </div>

                    {/* Email & Password Status */}
                    <div className="p-4 sm:px-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-xl bg-[#16161b] border border-[#23232b] flex items-center justify-center text-[#f5f5f7] flex-shrink-0">
                          <Mail aria-hidden="true" className="w-4 h-4" />
                        </span>
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-[#f5f5f7] block">
                            Email & Password
                          </span>
                          <span className="text-xs text-[#9a9aa6] truncate block">
                            {user.email || 'No email linked yet'}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex-shrink-0 ${
                          hasPasswordProvider
                            ? 'bg-emerald-500/12 border-emerald-500/30 text-[#4ade80]'
                            : 'bg-[#16161b] border-[#23232b] text-[#9a9aa6]'
                        }`}
                      >
                        {hasPasswordProvider ? 'Active' : user.email ? 'OAuth Only' : 'Not Linked'}
                      </span>
                    </div>
                  </div>

                  {/* EMAIL & PASSWORD MANAGEMENT */}
                  <div className="anilist-card-static overflow-hidden divide-y divide-[#23232b]">
                    <div className="p-4 sm:p-5 space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-[#f5f5f7]">Email Address</h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                emailVerified
                                  ? 'bg-emerald-500/12 border-emerald-500/30 text-[#4ade80]'
                                  : 'bg-amber-500/12 border-amber-500/30 text-amber-300'
                              }`}
                            >
                              {emailVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </div>
                          <p className="text-xs text-[#9a9aa6] mt-0.5 truncate">{user.email}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 flex-shrink-0">
                          {!emailVerified && (
                            <button
                              type="button"
                              disabled={verifyBusy}
                              onClick={handleSendVerification}
                              className="anilist-btn-primary px-3.5 py-1.5 text-xs cursor-pointer disabled:opacity-50"
                            >
                              {verifyBusy ? 'Sending…' : 'Verify Email'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setShowEmailForm((v) => !v);
                              setEmailNeedsReauth(false);
                              setEmailReauthPassword('');
                            }}
                            className="anilist-btn-secondary px-3.5 py-1.5 text-xs cursor-pointer"
                          >
                            {showEmailForm ? 'Cancel' : 'Change Email'}
                          </button>
                        </div>
                      </div>

                      {showEmailForm && (
                        <form
                          onSubmit={handleEmailChangeSubmit}
                          className="p-4 rounded-xl bg-[#16161b] border border-[#23232b] space-y-3 animate-fadeIn"
                        >
                          <div className="space-y-1.5">
                            <label htmlFor="new-email-input" className="text-xs font-semibold text-[#d2d2dc] block">
                              New Email Address
                            </label>
                            <input
                              id="new-email-input"
                              type="email"
                              autoComplete="email"
                              required
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              placeholder="new-email@domain.com"
                              className="anilist-input w-full px-3.5 py-2.5 text-base sm:text-sm"
                            />
                            <p className="text-[11px] text-[#666672]">
                              A confirmation link will be emailed to your new address before the change takes effect.
                            </p>
                          </div>

                          {emailNeedsReauth && hasPasswordProvider && (
                            <div className="space-y-1.5">
                              <label htmlFor="email-reauth-pwd" className="text-xs font-semibold text-[#d2d2dc] block">
                                Current Password
                              </label>
                              <input
                                id="email-reauth-pwd"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={emailReauthPassword}
                                onChange={(e) => setEmailReauthPassword(e.target.value)}
                                placeholder="Verify current password"
                                className="anilist-input w-full px-3.5 py-2.5 text-base sm:text-sm"
                              />
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={emailBusy}
                            className="anilist-btn-primary px-4 py-2 text-xs cursor-pointer disabled:opacity-50"
                          >
                            {emailBusy
                              ? 'Sending Confirmation…'
                              : emailNeedsReauth && !hasPasswordProvider
                              ? 'Verify & Send Confirmation'
                              : 'Send Confirmation Link'}
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Password Management */}
                    <div className="p-4 sm:p-5 space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <KeyRound aria-hidden="true" className="w-4 h-4 text-[#f5f5f7] mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="text-sm font-bold text-[#f5f5f7]">Password</h3>
                            <p className="text-xs text-[#9a9aa6] mt-0.5">
                              {hasPasswordProvider
                                ? 'Update your password anytime or send a recovery email.'
                                : 'Your login is currently managed by Google. You can also set a backup password via email.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 flex-shrink-0">
                          {hasPasswordProvider && (
                            <button
                              type="button"
                              onClick={() => setShowPasswordForm((v) => !v)}
                              className="anilist-btn-secondary px-3.5 py-1.5 text-xs cursor-pointer"
                            >
                              {showPasswordForm ? 'Cancel' : 'Change Password'}
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={passwordBusy}
                            onClick={handleSendResetEmail}
                            className="anilist-btn-secondary px-3.5 py-1.5 text-xs cursor-pointer disabled:opacity-50"
                          >
                            {passwordBusy ? 'Sending…' : hasPasswordProvider ? 'Send Reset Email' : 'Set Password via Email'}
                          </button>
                        </div>
                      </div>

                      {showPasswordForm && hasPasswordProvider && (
                        <form
                          onSubmit={handlePasswordChangeSubmit}
                          className="p-4 rounded-xl bg-[#16161b] border border-[#23232b] space-y-3 animate-fadeIn"
                        >
                          <div className="space-y-1.5">
                            <label htmlFor="sec-current-pwd" className="text-xs font-semibold text-[#d2d2dc] block">
                              Current Password
                            </label>
                            <div className="relative">
                              <input
                                id="sec-current-pwd"
                                type={showSecPasswords ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                className="anilist-input w-full px-3.5 pr-10 py-2.5 text-base sm:text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setShowSecPasswords((v) => !v)}
                                aria-label={showSecPasswords ? 'Hide passwords' : 'Show passwords'}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#9a9aa6] hover:text-white cursor-pointer"
                              >
                                {showSecPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label htmlFor="sec-new-pwd" className="text-xs font-semibold text-[#d2d2dc] block">
                                New Password
                              </label>
                              <input
                                id="sec-new-pwd"
                                type={showSecPasswords ? 'text' : 'password'}
                                autoComplete="new-password"
                                required
                                minLength={8}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="8+ chars, letters & numbers"
                                className="anilist-input w-full px-3.5 py-2.5 text-base sm:text-sm"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label htmlFor="sec-confirm-pwd" className="text-xs font-semibold text-[#d2d2dc] block">
                                Confirm New Password
                              </label>
                              <input
                                id="sec-confirm-pwd"
                                type={showSecPasswords ? 'text' : 'password'}
                                autoComplete="new-password"
                                required
                                minLength={8}
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                placeholder="Re-enter new password"
                                className="anilist-input w-full px-3.5 py-2.5 text-base sm:text-sm"
                              />
                            </div>
                          </div>

                          {newPassword.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              {[0, 1, 2, 3].map((idx) => (
                                <span
                                  key={idx}
                                  className={`h-1 flex-1 rounded-full transition-colors ${
                                    idx < newPwdStrength.score
                                      ? strengthBarColors[newPwdStrength.score]
                                      : 'bg-[#23232b]'
                                  }`}
                                />
                              ))}
                              <span className="text-[11px] font-medium text-[#9a9aa6] ml-1">
                                {newPwdStrength.label}
                              </span>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={passwordBusy}
                            className="anilist-btn-primary px-4 py-2 text-xs cursor-pointer disabled:opacity-50"
                          >
                            {passwordBusy ? 'Updating Password…' : 'Update Password'}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* SECTION 4: Data Ownership, Backups & Permanent Account Deletion */}
          {activeSection === 'data' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="anilist-card-static p-5 space-y-5">
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
              </div>

              {user && (
                <div className="anilist-card-static p-5 border-rose-500/30 space-y-4">
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
          )}

          {/* SECTION 5: About, Legal & Security */}
          {activeSection === 'about' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="anilist-card-static p-5 space-y-3">
                <AppLogo size="md" subtitle="" />
                <p className="text-xs sm:text-sm text-[#9a9aa6] leading-relaxed">
                  Independent, ad-free anime discovery catalog and personal watchlist tracker. Real-time community scores, seasonal airing schedules, voice cast, and official trailers powered by AniList GraphQL.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href="https://anilist.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16161b] border border-[#23232b] hover:border-[#383844] text-xs font-medium text-[#f5f5f7] transition"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Live data via AniList GraphQL</span>
                    <ExternalLink aria-hidden="true" className="w-3 h-3 text-[#9a9aa6]" />
                  </a>
                </div>
              </div>

              <div className="anilist-card-static overflow-hidden divide-y divide-[#23232b]">
                <div className="px-5 py-3.5">
                  <h2 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#9a9aa6]">
                    Legal & Security
                  </h2>
                </div>

                {legalLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#16161b] transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-8 h-8 rounded-xl bg-[#16161b] border border-[#23232b] group-hover:border-[#383844] flex items-center justify-center text-[#9a9aa6] group-hover:text-[#f5f5f7] flex-shrink-0 transition">
                          <Icon aria-hidden="true" className="w-4 h-4" />
                        </span>
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-[#f5f5f7] block truncate">
                            {item.title}
                          </span>
                          <span className="text-xs text-[#9a9aa6] block truncate">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        aria-hidden="true"
                        className="w-4 h-4 text-[#666672] group-hover:text-[#f5f5f7] group-hover:translate-x-0.5 transition flex-shrink-0"
                      />
                    </Link>
                  );
                })}
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
                autoComplete="current-password"
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
