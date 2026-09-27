import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';
import { useAuth, AVATAR_PRESETS } from '../context/AuthContext';
import { AppLogo } from '../components/common/AppLogo';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const { user, login, signup, quickDemoLogin } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].url);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  // If already logged in, redirect
  useEffect(() => {
    if (user && !successMsg) {
      navigate('/');
    }
  }, [user, navigate, successMsg]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await login(emailOrUsername, password);
      if (res.success) {
        setSuccessMsg('Welcome back to AniList!');
        setTimeout(() => {
          navigate('/');
        }, 800);
      } else {
        setError(res.error || 'Login failed. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service to create an account.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signup({
        username: signupUsername,
        email: signupEmail,
        password: signupPassword,
        avatar: selectedAvatar,
      });

      if (res.success) {
        setSuccessMsg('Account created successfully! Welcome to AniList.');
        setTimeout(() => {
          navigate('/');
        }, 800);
      } else {
        setError(res.error || 'Sign up failed. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoClick = () => {
    quickDemoLogin();
    setSuccessMsg('Logged in as OtakuMaster!');
    setTimeout(() => {
      navigate('/');
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative overflow-hidden animate-fadeIn">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#3db4f2]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-[#3db4f2]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link to="/" className="inline-flex items-center">
            <AppLogo size="lg" subtitle="" />
          </Link>
          <p className="text-xs sm:text-sm text-slate-400">
            {mode === 'login'
              ? 'Sign in to access your anime watchlist and statistics'
              : 'Join the next-generation anime tracking platform'}
          </p>
        </div>

        {/* Main Card Container */}
        <div className="anilist-card-static p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl relative">
          {/* Quick Demo Login Banner */}
          <div className="mb-6 p-3 rounded-xl bg-[#1f2c3f]/80 border border-[#3db4f2]/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <Zap className="w-4 h-4 text-[#3db4f2] flex-shrink-0 animate-pulse" />
              <span className="text-slate-200 font-medium">Want to test right away?</span>
            </div>
            <button
              onClick={handleDemoClick}
              type="button"
              className="px-3 py-1.5 rounded-lg anilist-btn-primary text-white text-xs font-bold transition shadow-sm whitespace-nowrap flex items-center gap-1.5"
            >
              <span>1-Click Demo</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#0b1622] border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'anilist-btn-primary text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                mode === 'signup'
                  ? 'anilist-btn-primary text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Email or Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    placeholder="e.g. OtakuMaster or user@anilist.co"
                    className="anilist-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-100"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => alert('Password recovery: Enter any email/username to sign in or use the 1-Click Demo.')}
                    className="text-[11px] text-[#3db4f2] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="anilist-input w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm text-slate-100"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/20 bg-[#0b1622] text-[#3db4f2] focus:ring-0"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl anilist-btn-primary font-bold text-xs sm:text-sm flex items-center justify-center gap-2 mt-2 shadow-lg shadow-[#3db4f2]/25"
              >
                <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Choose an Avatar</label>
                <div className="flex items-center gap-2.5 overflow-x-auto py-1 no-scrollbar">
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = selectedAvatar === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedAvatar(preset.url)}
                        className={`relative rounded-xl overflow-hidden p-0.5 transition flex-shrink-0 ${
                          isSelected
                            ? 'ring-2 ring-[#3db4f2] scale-105 shadow-md shadow-[#3db4f2]/30'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title={preset.name}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    placeholder="e.g. TanjiroFan"
                    className="anilist-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-100"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="anilist-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-100"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="anilist-input w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm text-slate-100"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="rounded border-white/20 bg-[#0b1622] text-[#3db4f2] focus:ring-0 mt-0.5"
                  />
                  <span>
                    I agree to the{' '}
                    <Link to="/terms" className="text-[#3db4f2] hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-[#3db4f2] hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl anilist-btn-primary font-bold text-xs sm:text-sm flex items-center justify-center gap-2 mt-2 shadow-lg shadow-[#3db4f2]/25"
              >
                <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </button>
            </form>
          )}

          {/* Social Sign In Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative px-3 bg-[#151f2e] text-[11px] text-slate-500 font-medium uppercase tracking-wider">
              Or connect with
            </span>
          </div>

          {/* Social Demo Buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={handleDemoClick}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0b1622] hover:bg-[#1f2c3f] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition"
              title="Sign in with Discord"
            >
              <span className="text-[#5865F2] font-black text-sm">✦</span>
              <span>Discord</span>
            </button>
            <button
              type="button"
              onClick={handleDemoClick}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0b1622] hover:bg-[#1f2c3f] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition"
              title="Sign in with Google"
            >
              <span className="text-rose-400 font-black text-sm">G</span>
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={handleDemoClick}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0b1622] hover:bg-[#1f2c3f] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition"
              title="Sign in with AniList"
            >
              <span className="text-[#3db4f2] font-black text-sm">AL</span>
              <span>AniList</span>
            </button>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secured client session & SQLite local storage backup</span>
        </div>
      </div>
    </div>
  );
};

