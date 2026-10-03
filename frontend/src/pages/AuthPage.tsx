import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppLogo } from '../components/common/AppLogo';
import { useSEO, SITE_URL } from '../utils/seo';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const { user, login, signup, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  useSEO({
    title: mode === 'login' ? 'Sign In • AnimeSenpai' : 'Create Account • AnimeSenpai',
    description: 'Sign in to sync your AnimeSenpai watchlist across devices and track your favorite anime series.',
    canonicalUrl: `${SITE_URL}/login`,
    robots: 'noindex, nofollow',
  });
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

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
        setSuccessMsg('Welcome back to AnimeSenpai!');
        setTimeout(() => {
          navigate('/');
        }, 800);
      } else {
        setError(res.error || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
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
      });

      if (res.success) {
        setSuccessMsg('Account created successfully! Welcome to AnimeSenpai.');
        setTimeout(() => {
          navigate('/');
        }, 800);
      } else {
        setError(res.error || 'Sign up failed. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred during signup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        setSuccessMsg('Successfully connected with Google!');
        setTimeout(() => {
          navigate('/');
        }, 600);
      } else if (res.error) {
        setError(res.error);
      }
    } catch {
      setError('Google sign-in could not be completed. Please try again.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative overflow-hidden animate-fadeIn">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#3db4f2]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-[#3db4f2]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link to="/" className="inline-flex items-center transform hover:scale-105 transition-transform duration-200">
            <AppLogo size="lg" subtitle="" />
          </Link>
          <p className="text-xs sm:text-sm text-slate-400">
            {mode === 'login'
              ? 'Sign in to access your anime watchlist and statistics'
              : 'Join the next-generation anime tracking platform'}
          </p>
        </div>

        {/* Main Card Container */}
        <div className="anilist-card-static p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl relative backdrop-blur-xl bg-[#151f2e]/90">
          
          {/* Mode Switcher Tabs */}
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

          {/* Primary 1-Click Google Sign-In */}
          <button
            type="button"
            disabled={isGoogleSubmitting || isSubmitting}
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleSubmitting ? 'Connecting with Google...' : 'Continue with Google'}</span>
          </button>

          {/* Clean Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative px-3 bg-[#151f2e] text-[11px] text-slate-400 font-medium uppercase tracking-wider">
              or continue with email
            </span>
          </div>

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
                    placeholder="Enter email or username"
                    className="anilist-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="anilist-input w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
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
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full py-3 rounded-xl anilist-btn-primary font-bold text-xs sm:text-sm flex items-center justify-center gap-2 mt-2 shadow-lg shadow-[#3db4f2]/25 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    placeholder="e.g. TanjiroFan"
                    className="anilist-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
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
                    className="anilist-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="anilist-input w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-white/20 bg-[#0b1622] text-[#3db4f2] focus:ring-0 mt-0.5"
                />
                <label htmlFor="agree" className="text-[11px] text-slate-400 leading-tight">
                  I agree to the{' '}
                  <Link to="/terms" className="text-[#3db4f2] hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-[#3db4f2] hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full py-3 rounded-xl anilist-btn-primary font-bold text-xs sm:text-sm flex items-center justify-center gap-2 mt-2 shadow-lg shadow-[#3db4f2]/25 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Security badge footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secured by Firebase Authentication & Google Cloud</span>
        </div>
      </div>
    </div>
  );
};
