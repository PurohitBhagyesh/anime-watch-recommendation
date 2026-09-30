import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  User,
  Settings,
  Mail,
  Calendar,
  Shield,
  Bookmark,
  Sparkles,
  Save,
  Check,
  LogOut,
  Sliders,
  Trash2,
  Download,
  Film,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';

interface AccountPageProps {
  defaultTab?: 'account' | 'settings';
}

export const AccountPage: React.FC<AccountPageProps> = ({ defaultTab }) => {
  const location = useLocation();
  const { user, updateProfile, logout } = useAuth();
  const { watchlist, exportWatchlist, clearWatchlist } = useWatchlist();

  // Tab state based on route or prop
  const currentTabFromUrl = location.pathname.includes('settings') ? 'settings' : 'account';
  const [activeTab, setActiveTab] = useState<'account' | 'settings'>(defaultTab || currentTabFromUrl);

  // Form states for profile editing
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [favoriteGenre, setFavoriteGenre] = useState(user?.favoriteGenre || 'Action / Shonen');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Settings states
  const [preferredAudio, setPreferredAudio] = useState<'sub' | 'dub'>('sub');
  const [contentFilter, setContentFilter] = useState(true);
  const [autoTrailer, setAutoTrailer] = useState(false);
  const [streamingPriority, setStreamingPriority] = useState('crunchyroll');

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
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-4">
          <User className="w-8 h-8 text-[#3db4f2]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Sign in to view your Account</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          Access your personal anime watchlist, custom preferences, and synchronized cloud profile.
        </p>
        <Link
          to="/login"
          className="px-6 py-2.5 rounded-xl anilist-btn-primary text-white text-xs font-bold shadow-lg shadow-[#3db4f2]/25"
        >
          Sign In / Create Account
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Top Profile Card Header */}
      <div className="anilist-card-static rounded-2xl border border-white/10 p-6 sm:p-8 mb-8 relative overflow-hidden backdrop-blur-xl bg-[#151f2e]/90 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#3db4f2]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar */}
          <div className="relative group">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80'}
              alt={user.username}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-[#3db4f2]/30 shadow-xl"
            />
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active</span>
            </div>
          </div>

          {/* User Bio & Meta */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {user.username}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#3db4f2]/15 border border-[#3db4f2]/30 text-[#3db4f2] text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Anime Explorer</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl line-clamp-2">
              {user.bio || 'Tracking anime releases and personal ratings on AnimeSenpai.'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.email}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.joinedDate || 'Member'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-[#3db4f2]" />
                <span className="text-slate-200 font-semibold">{watchlist.length}</span> titles saved
              </span>
            </div>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={logout}
            className="sm:self-start px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 mb-8 pb-3">
        <button
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'account'
              ? 'bg-[#3db4f2] text-white shadow-md shadow-[#3db4f2]/25'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Account Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'settings'
              ? 'bg-[#3db4f2] text-white shadow-md shadow-[#3db4f2]/25'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Preferences & Settings</span>
        </button>
      </div>

      {/* Tab 1: Account Profile */}
      {activeTab === 'account' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Edit Profile Form */}
          <div className="md:col-span-2 anilist-card-static rounded-2xl border border-white/10 p-6 space-y-6 bg-[#151f2e]/80">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#3db4f2]" />
                <span>Edit Profile Details</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Customize your display name, bio, and favorite anime categories.
              </p>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Display Name</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                  className="anilist-input w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Registered Email</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="anilist-input w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-slate-400 bg-white/5 cursor-not-allowed opacity-80"
                />
                <span className="text-[10px] text-slate-500">
                  Authentication provider managed via Firebase & Google.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio or your all-time favorite anime series..."
                  className="anilist-input w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-slate-100 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Favorite Genre</label>
                <select
                  value={favoriteGenre}
                  onChange={(e) => setFavoriteGenre(e.target.value)}
                  className="anilist-input w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-slate-100 bg-[#0b1622]"
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
                className="px-5 py-2.5 rounded-xl anilist-btn-primary text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#3db4f2]/25 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Account Security & Stats */}
          <div className="space-y-6">
            {/* Security Box */}
            <div className="anilist-card-static rounded-2xl border border-white/10 p-5 bg-[#151f2e]/80 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[#3db4f2]" />
                <span>Security & Identity</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400">Auth Method</span>
                  <span className="font-semibold text-slate-200">Firebase Auth</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 flex flex-col gap-1">
                  <span className="text-slate-400">Cloud User ID</span>
                  <span className="font-mono text-[10px] text-slate-300 truncate">{user.id}</span>
                </div>
              </div>
            </div>

            {/* Watchlist Summary Box */}
            <div className="anilist-card-static rounded-2xl border border-white/10 p-5 bg-[#151f2e]/80 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Film className="w-3.5 h-3.5 text-[#3db4f2]" />
                <span>Watchlist Analytics</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400">Total Anime Saved</span>
                  <span className="font-bold text-[#3db4f2]">{watchlist.length}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400">Currently Watching</span>
                  <span className="font-bold text-emerald-400">
                    {watchlist.filter((item) => item.status === 'watching').length}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400">Completed Series</span>
                  <span className="font-bold text-indigo-400">
                    {watchlist.filter((item) => item.status === 'completed').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Settings & Preferences */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Playback & Content Preferences */}
          <div className="anilist-card-static rounded-2xl border border-white/10 p-6 space-y-6 bg-[#151f2e]/80">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#3db4f2]" />
                <span>Anime Browsing Preferences</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Customize your audio, streaming platform priorities, and catalog filters.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Audio Priority */}
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/5 space-y-2">
                <span className="text-xs font-semibold text-slate-200 block">Preferred Audio Format</span>
                <p className="text-[11px] text-slate-400">Select which audio style you default to for episode titles.</p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setPreferredAudio('sub')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                      preferredAudio === 'sub'
                        ? 'bg-[#3db4f2] text-white'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    Original Japanese (Sub)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredAudio('dub')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                      preferredAudio === 'dub'
                        ? 'bg-[#3db4f2] text-white'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    English (Dub)
                  </button>
                </div>
              </div>

              {/* Streaming Platform Priority */}
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/5 space-y-2">
                <span className="text-xs font-semibold text-slate-200 block">Default Streaming Platform</span>
                <p className="text-[11px] text-slate-400">Quick-link priority when viewing anime watch links.</p>
                <select
                  value={streamingPriority}
                  onChange={(e) => setStreamingPriority(e.target.value)}
                  className="anilist-input w-full px-3 py-1.5 rounded-lg text-xs text-slate-200 bg-[#0b1622] mt-1"
                >
                  <option value="crunchyroll">Crunchyroll</option>
                  <option value="netflix">Netflix</option>
                  <option value="hulu">Hulu</option>
                  <option value="disney">Disney+</option>
                  <option value="prime">Amazon Prime Video</option>
                </select>
              </div>

              {/* Content Safety Filter */}
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Safe Browsing Filter</span>
                  <span className="text-[11px] text-slate-400">Hide 18+ adult material in catalog search</span>
                </div>
                <input
                  type="checkbox"
                  checked={contentFilter}
                  onChange={(e) => setContentFilter(e.target.checked)}
                  className="w-4 h-4 rounded text-[#3db4f2] bg-[#0b1622] border-white/20 focus:ring-0 cursor-pointer"
                />
              </div>

              {/* Auto Trailer Play */}
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Autoplay Anime Trailers</span>
                  <span className="text-[11px] text-slate-400">Auto-start video when opening trailer dialogs</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoTrailer}
                  onChange={(e) => setAutoTrailer(e.target.checked)}
                  className="w-4 h-4 rounded text-[#3db4f2] bg-[#0b1622] border-white/20 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Data & Backup Management */}
          <div className="anilist-card-static rounded-2xl border border-white/10 p-6 space-y-4 bg-[#151f2e]/80">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-[#3db4f2]" />
                <span>Data & Backup</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Export your personal watchlist or manage local browser cache.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={exportWatchlist}
                className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-xs font-bold text-white transition flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#3db4f2]" />
                <span>Export Watchlist (.JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear local watchlist cache? Your cloud Firestore user profile will remain intact.')) {
                    clearWatchlist();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold text-rose-300 transition flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Local Cache</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
