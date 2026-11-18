import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Smartphone,
} from 'lucide-react';
import {
  useAuth,
  validateUsername,
  validateEmail,
  validateNewPassword,
  validatePhoneNumber,
  normalizePhoneE164,
  getPasswordStrength,
} from '../context/AuthContext';
import { AppLogo } from '../components/common/AppLogo';
import { useSEO, SITE_URL } from '../utils/seo';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
}

const COUNTRY_CODES = [
  { code: '+91', label: 'IN (+91)' },
  { code: '+1', label: 'US / CA (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+81', label: 'JP (+81)' },
  { code: '+61', label: 'AU (+61)' },
  { code: '+49', label: 'DE (+49)' },
  { code: '+33', label: 'FR (+33)' },
  { code: '+65', label: 'SG (+65)' },
  { code: '+971', label: 'AE (+971)' },
  { code: '', label: 'Custom (+)' },
];

const PHONE_RECAPTCHA_ID = 'phone-signin-recaptcha';

const GoogleMark: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const {
    user,
    login,
    signup,
    loginWithGoogle,
    sendPhoneSignInCode,
    verifyPhoneSignInCode,
    cancelPhoneFlow,
    sendPasswordReset,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'phone' | 'reset'>(initialMode);

  useSEO({
    title:
      mode === 'signup'
        ? 'Create Account • AnimeSenpai'
        : mode === 'phone'
        ? 'Phone Sign In • AnimeSenpai'
        : mode === 'reset'
        ? 'Reset Password • AnimeSenpai'
        : 'Sign In • AnimeSenpai',
    description:
      'Sign in with Google, Phone SMS, or email to sync your AnimeSenpai watchlist across devices.',
    canonicalUrl: `${SITE_URL}/login`,
    robots: 'noindex, nofollow',
  });

  // Email login & signup state
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');

  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Phone SMS auth state
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneInput, setPhoneInput] = useState('');
  const [sentPhoneE164, setSentPhoneE164] = useState('');
  const [phoneStep, setPhoneStep] = useState<'enter' | 'verify'>('enter');
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Reset password state
  const [resetEmail, setResetEmail] = useState('');

  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(false);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  useEffect(() => {
    if (user && !successMsg) {
      navigate('/');
    }
  }, [user, navigate, successMsg]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => {
    return () => cancelPhoneFlow();
  }, [cancelPhoneFlow]);

  const strength = getPasswordStrength(signupPassword);
  const strengthBarColors = [
    'bg-rose-500',
    'bg-rose-400',
    'bg-amber-400',
    'bg-emerald-400',
    'bg-emerald-500',
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await login(emailOrUsername, password, rememberMe);
      if (res.success) {
        setSuccessMsg('Welcome back to AnimeSenpai!');
        setTimeout(() => navigate('/'), 700);
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
    setSuccessMsg(null);

    const uErr = validateUsername(signupUsername);
    if (uErr) {
      setError(uErr);
      return;
    }
    const eErr = validateEmail(signupEmail);
    if (eErr) {
      setError(eErr);
      return;
    }
    const pErr = validateNewPassword(signupPassword);
    if (pErr) {
      setError(pErr);
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy to create an account.');
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
        setSuccessMsg('Account created! Check your inbox to verify your email address.');
        setTimeout(() => navigate('/'), 1000);
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
    setSuccessMsg(null);
    setOauthBusy(true);

    try {
      const res = await loginWithGoogle(rememberMe);

      if (res.success) {
        setSuccessMsg('Signed in with Google!');
        setTimeout(() => navigate('/'), 600);
      } else if (res.error) {
        setError(res.error);
      }
    } catch {
      setError('Sign-in could not be completed. Please try again.');
    } finally {
      setOauthBusy(false);
    }
  };

  const handleSendPhoneCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const e164 = normalizePhoneE164(countryCode, phoneInput);
    const pErr = validatePhoneNumber(e164);
    if (pErr) {
      setError(pErr);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendPhoneSignInCode(e164, PHONE_RECAPTCHA_ID, rememberMe);
      if (res.success) {
        setSentPhoneE164(e164);
        setPhoneStep('verify');
        setOtpCode('');
        setResendCooldown(30);
        setSuccessMsg(`6-digit verification code sent to ${e164}.`);
      } else {
        setError(res.error || 'Could not send verification SMS.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await verifyPhoneSignInCode(otpCode);
      if (res.success) {
        setSuccessMsg('Phone verified! Welcome to AnimeSenpai.');
        setTimeout(() => navigate('/'), 650);
      } else {
        setError(res.error || 'Invalid 6-digit code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const eErr = validateEmail(resetEmail);
    if (eErr) {
      setError(eErr);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendPasswordReset(resetEmail);
      if (res.success) {
        setSuccessMsg(
          'If an account exists for that email, a password reset link has been sent. Check your inbox and spam folder.'
        );
      } else {
        setError(res.error || 'Unable to send password reset email.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const anyBusy = isSubmitting || oauthBusy;

  return (
    <div className="min-h-[calc(100dvh-7rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative overflow-hidden animate-fadeIn">
      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link to="/" className="inline-flex items-center transition-opacity hover:opacity-90">
            <AppLogo size="lg" subtitle="" />
          </Link>
          <p className="text-xs sm:text-sm text-[#9a9aa6]">
            {mode === 'phone'
              ? phoneStep === 'verify'
                ? `Enter the 6-digit SMS code sent to ${sentPhoneE164}`
                : 'Sign in quickly using a one-time SMS code'
              : mode === 'reset'
              ? 'Reset your password via email'
              : mode === 'login'
              ? 'Sign in to access your anime watchlist and progress'
              : 'Create a free account to sync your watchlist across devices'}
          </p>
        </div>

        <div className="anilist-card-static p-6 sm:p-7 rounded-3xl relative">
          {/* Dedicated invisible reCAPTCHA mount node for Firebase Phone Auth */}
          <div id={PHONE_RECAPTCHA_ID} />

          {mode === 'phone' ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-3 pb-3 border-b border-[#23232b]">
                <div className="w-10 h-10 rounded-xl bg-[#16161b] border border-[#23232b] flex items-center justify-center text-[#f5f5f7] flex-shrink-0">
                  <Smartphone aria-hidden="true" className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base font-bold text-[#f5f5f7]">Sign In with Phone</h1>
                  <p className="text-xs text-[#9a9aa6]">
                    {phoneStep === 'verify' ? 'Verify your 6-digit SMS code' : 'SMS verification powered by Firebase'}
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/12 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/12 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
                  <Check aria-hidden="true" className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {phoneStep === 'enter' ? (
                <form onSubmit={handleSendPhoneCode} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="phone-number-input" className="text-xs font-medium text-[#d2d2dc] block">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        aria-label="Country calling code"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="anilist-input px-2.5 py-2.5 text-base sm:text-xs font-medium text-[#f5f5f7] w-28 flex-shrink-0"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.label} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>

                      <input
                        id="phone-number-input"
                        type="tel"
                        autoComplete="tel-national"
                        required
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder={countryCode ? '98765 43210' : '+919876543210'}
                        className="anilist-input flex-1 min-w-0 px-3.5 py-2.5 text-base sm:text-sm text-white placeholder:text-[#666672]"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#9a9aa6] hover:text-white">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#3a3a44] bg-[#151519] accent-[#5360e6]"
                    />
                    <span>Keep me signed in</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 anilist-btn-primary text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Sending SMS Code…' : 'Send Verification Code'}</span>
                    <ArrowRight aria-hidden="true" className="w-4 h-4" />
                  </button>

                  <p className="text-[11px] text-[#666672] leading-relaxed text-center">
                    Protected by reCAPTCHA. Standard SMS rates may apply.
                  </p>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneCode} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="phone-otp-input" className="text-xs font-medium text-[#d2d2dc] block">
                      6-Digit Verification Code
                    </label>
                    <input
                      id="phone-otp-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                      autoFocus
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="anilist-input w-full px-4 py-3 text-center text-xl font-mono tracking-[0.35em] text-[#f5f5f7] placeholder:text-[#666672]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || otpCode.length !== 6}
                    className="w-full py-3 anilist-btn-primary text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Verifying…' : 'Verify & Sign In'}</span>
                    <ArrowRight aria-hidden="true" className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between gap-2 text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        cancelPhoneFlow();
                        setPhoneStep('enter');
                        setOtpCode('');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[#9a9aa6] hover:text-[#f5f5f7] transition cursor-pointer"
                    >
                      Change number
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting || resendCooldown > 0}
                      onClick={() => handleSendPhoneCode()}
                      className="text-[#f5f5f7] hover:underline disabled:opacity-45 disabled:no-underline cursor-pointer"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                    </button>
                  </div>
                </form>
              )}

              <button
                type="button"
                onClick={() => {
                  cancelPhoneFlow();
                  setPhoneStep('enter');
                  setOtpCode('');
                  setMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="w-full py-2.5 anilist-btn-secondary text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
                <span>Back to All Sign-In Options</span>
              </button>
            </div>
          ) : mode === 'reset' ? (
            <form onSubmit={handleResetSubmit} className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-3 pb-3 border-b border-[#23232b]">
                <div className="w-10 h-10 rounded-xl bg-[#16161b] border border-[#23232b] flex items-center justify-center text-[#f5f5f7] flex-shrink-0">
                  <KeyRound aria-hidden="true" className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-[#f5f5f7]">Reset Password</h1>
                  <p className="text-xs text-[#9a9aa6]">
                    We&apos;ll email you a secure password reset link.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/12 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/12 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
                  <Check aria-hidden="true" className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="reset-email" className="text-xs font-medium text-[#d2d2dc] block">
                  Account Email Address
                </label>
                <div className="relative">
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="anilist-input w-full pl-10 pr-4 py-2.5 text-base sm:text-sm text-white placeholder:text-[#666672]"
                  />
                  <Mail aria-hidden="true" className="w-4 h-4 text-[#666672] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 anilist-btn-primary text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Sending Reset Link…' : 'Send Reset Link'}</span>
                <ArrowRight aria-hidden="true" className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="w-full py-2.5 anilist-btn-secondary text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
                <span>Back to Sign In</span>
              </button>
            </form>
          ) : (
            <>
              <div className="grid grid-cols-2 p-1 rounded-full bg-[#16161b] border border-[#23232b] mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-2 rounded-full text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer ${
                    mode === 'login'
                      ? 'btn-accent-active font-bold'
                      : 'text-[#9a9aa6] hover:text-white'
                  }`}
                >
                  <LogIn aria-hidden="true" className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-2 rounded-full text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer ${
                    mode === 'signup'
                      ? 'btn-accent-active font-bold'
                      : 'text-[#9a9aa6] hover:text-white'
                  }`}
                >
                  <UserPlus aria-hidden="true" className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/12 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
                  <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/12 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
                  <Check aria-hidden="true" className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Fast Sign-In Providers: Google + Phone SMS */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={anyBusy}
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 px-4 rounded-full bg-white hover:bg-[#ececf2] text-black text-xs sm:text-sm font-bold transition flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  <GoogleMark className="w-4 h-4 flex-shrink-0" />
                  <span>{oauthBusy ? 'Connecting with Google…' : 'Continue with Google'}</span>
                </button>

                <button
                  type="button"
                  disabled={anyBusy}
                  onClick={() => {
                    setMode('phone');
                    setPhoneStep('enter');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="w-full py-3 px-4 rounded-full bg-[#16161b] hover:bg-[#1e1e26] border border-[#383844] text-[#f5f5f7] text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2.5 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  <Smartphone aria-hidden="true" className="w-4 h-4 text-[#9a9aa6] flex-shrink-0" />
                  <span>Continue with Phone</span>
                </button>
              </div>

              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#232329]" />
                </div>
                <span className="relative px-3 bg-[#0c0c0f] text-[11px] text-[#666672] font-mono uppercase tracking-wider">
                  or continue with email
                </span>
              </div>

              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="login-identifier" className="text-xs font-medium text-[#d2d2dc] block">
                      Email or Username
                    </label>
                    <div className="relative">
                      <input
                        id="login-identifier"
                        type="text"
                        autoComplete="username"
                        required
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        placeholder="you@domain.com or username"
                        className="anilist-input w-full pl-10 pr-4 py-2.5 text-base sm:text-sm text-white placeholder:text-[#666672]"
                      />
                      <User aria-hidden="true" className="w-4 h-4 text-[#666672] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor="login-password" className="text-xs font-medium text-[#d2d2dc]">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(emailOrUsername.includes('@') ? emailOrUsername : '');
                          setMode('reset');
                          setError(null);
                          setSuccessMsg(null);
                        }}
                        className="text-[11px] font-medium text-[#9a9aa6] hover:text-[#f5f5f7] transition cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="anilist-input w-full pl-10 pr-11 py-2.5 text-base sm:text-sm text-white placeholder:text-[#666672]"
                      />
                      <Lock aria-hidden="true" className="w-4 h-4 text-[#666672] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[#9a9aa6] hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff aria-hidden="true" className="w-4 h-4" /> : <Eye aria-hidden="true" className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-[#9a9aa6] hover:text-white">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-[#3a3a44] bg-[#151519] accent-[#5360e6]"
                      />
                      <span>Keep me signed in</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={anyBusy}
                    className="w-full py-3 anilist-btn-primary text-xs sm:text-sm flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Signing In…' : 'Sign In'}</span>
                    <ArrowRight aria-hidden="true" className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="signup-username" className="text-xs font-medium text-[#d2d2dc] block">
                      Username
                    </label>
                    <div className="relative">
                      <input
                        id="signup-username"
                        type="text"
                        autoComplete="username"
                        required
                        minLength={3}
                        maxLength={24}
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        placeholder="e.g. Bhagyesh Purohit"
                        className="anilist-input w-full pl-10 pr-4 py-2.5 text-base sm:text-sm text-white placeholder:text-[#666672]"
                      />
                      <User aria-hidden="true" className="w-4 h-4 text-[#666672] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <p className="text-[11px] text-[#666672]">
                      3–24 characters: letters, numbers, spaces, dots, underscores, or hyphens.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="signup-email" className="text-xs font-medium text-[#d2d2dc] block">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="anilist-input w-full pl-10 pr-4 py-2.5 text-base sm:text-sm text-white placeholder:text-[#666672]"
                      />
                      <Mail aria-hidden="true" className="w-4 h-4 text-[#666672] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="signup-password" className="text-xs font-medium text-[#d2d2dc] block">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="At least 8 characters with letters & numbers"
                        className="anilist-input w-full pl-10 pr-11 py-2.5 text-base sm:text-sm text-white placeholder:text-[#666672]"
                      />
                      <Lock aria-hidden="true" className="w-4 h-4 text-[#666672] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[#9a9aa6] hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff aria-hidden="true" className="w-4 h-4" /> : <Eye aria-hidden="true" className="w-4 h-4" />}
                      </button>
                    </div>

                    {signupPassword.length > 0 && (
                      <div className="pt-1 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          {[0, 1, 2, 3].map((idx) => (
                            <span
                              key={idx}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                idx < strength.score
                                  ? strengthBarColors[strength.score]
                                  : 'bg-[#23232b]'
                              }`}
                            />
                          ))}
                          <span className="text-[11px] font-medium text-[#9a9aa6] ml-1">
                            {strength.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                          <span className={strength.checks.minLength ? 'text-emerald-400' : 'text-[#666672]'}>
                            ✓ 8+ chars
                          </span>
                          <span className={strength.checks.hasLetter ? 'text-emerald-400' : 'text-[#666672]'}>
                            ✓ Letter
                          </span>
                          <span className={strength.checks.hasNumber ? 'text-emerald-400' : 'text-[#666672]'}>
                            ✓ Number
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="signup-confirm-password" className="text-xs font-medium text-[#d2d2dc] block">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="signup-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="anilist-input w-full pl-10 pr-4 py-2.5 text-base sm:text-sm text-white placeholder:text-[#666672]"
                      />
                      <Lock aria-hidden="true" className="w-4 h-4 text-[#666672] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="agree"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="rounded border-[#3a3a44] bg-[#151519] accent-[#5360e6] mt-0.5"
                    />
                    <label htmlFor="agree" className="text-[11px] text-[#9a9aa6] leading-tight">
                      I agree to the{' '}
                      <Link to="/terms" className="text-white hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-white hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={anyBusy}
                    className="w-full py-3 anilist-btn-primary text-xs sm:text-sm flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Creating Account…' : 'Create Account'}</span>
                    <ArrowRight aria-hidden="true" className="w-4 h-4" />
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-[#666672]">
          <ShieldCheck aria-hidden="true" className="w-3.5 h-3.5 text-emerald-400" />
          <span>Protected by Firebase Authentication, Phone SMS & Google OAuth</span>
        </div>
      </div>
    </div>
  );
};
