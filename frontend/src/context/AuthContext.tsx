import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  verifyBeforeUpdateEmail,
  updateProfile as firebaseUpdateProfile,
  linkWithPopup,
  unlink,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { eventBus } from '../utils/pubsub';

export interface UserProfile {
  id: string;
  username: string;
  usernameLower?: string;
  email: string;
  avatar: string;
  banner?: string;
  bio?: string;
  joinedDate: string;
  animeWatchedCount?: number;
  episodesWatchedCount?: number;
  daysWatched?: number;
  favoriteGenre?: string;
}

export interface AuthActionResult {
  success: boolean;
  error?: string;
  requiresRecentLogin?: boolean;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Too weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  checks: {
    minLength: boolean;
    hasLetter: boolean;
    hasNumber: boolean;
    hasUpperOrSymbol: boolean;
  };
}

const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,24}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateUsername(raw: string): string | null {
  const cleaned = raw.trim();
  if (!cleaned) return 'Username is required.';
  if (cleaned.length < 3 || cleaned.length > 24) {
    return 'Username must be between 3 and 24 characters.';
  }
  if (!USERNAME_REGEX.test(cleaned)) {
    return 'Username can only contain letters, numbers, dots, underscores, and hyphens.';
  }
  return null;
}

export function validateEmail(raw: string): string | null {
  const cleaned = raw.trim().toLowerCase();
  if (!cleaned) return 'Email address is required.';
  if (cleaned.length > 254 || !EMAIL_REGEX.test(cleaned)) {
    return 'Please enter a valid email address.';
  }
  return null;
}

export function getPasswordStrength(password: string): PasswordStrength {
  const checks = {
    minLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasUpperOrSymbol: /[A-Z]/.test(password) && /[^a-zA-Z0-9]/.test(password),
  };

  let score = 0;
  if (checks.minLength) score += 1;
  if (checks.hasLetter && checks.hasNumber) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password) || password.length >= 12) score += 1;

  const labels: PasswordStrength['label'][] = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return {
    score: score as PasswordStrength['score'],
    label: labels[score],
    checks,
  };
}

export function validateNewPassword(password: string): string | null {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return 'Password must include at least one letter and one number.';
  }
  if (password.length > 128) return 'Password must be 128 characters or fewer.';
  return null;
}

const DEFAULT_DEMO_USER: UserProfile = {
  id: 'usr_demo_101',
  username: 'OtakuMaster',
  usernameLower: 'otakumaster',
  email: 'otakumaster@animesenpai.io',
  avatar: '',
  bio: 'Anime enthusiast exploring new seasonal gems and 90s classics.',
  joinedDate: 'Joined September 2026',
  animeWatchedCount: 42,
  episodesWatchedCount: 680,
  daysWatched: 11.3,
  favoriteGenre: 'Action / Sci-Fi',
};

export type PrimaryAuthProvider = 'google' | 'apple' | 'password' | 'demo';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  emailVerified: boolean;
  linkedProviders: string[];
  authProvider: PrimaryAuthProvider;
  login: (emailOrUsername: string, password: string, rememberMe?: boolean) => Promise<AuthActionResult>;
  signup: (data: { username: string; email: string; password: string; avatar?: string }) => Promise<AuthActionResult>;
  loginWithGoogle: (rememberMe?: boolean) => Promise<AuthActionResult>;
  loginWithApple: (rememberMe?: boolean) => Promise<AuthActionResult>;
  sendPasswordReset: (email: string) => Promise<AuthActionResult>;
  resendVerificationEmail: () => Promise<AuthActionResult>;
  refreshAuthUser: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthActionResult>;
  changeEmail: (newEmail: string, reauthPassword?: string) => Promise<AuthActionResult>;
  linkAuthProvider: (provider: 'google' | 'apple') => Promise<AuthActionResult>;
  unlinkAuthProvider: (providerId: string) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  quickDemoLogin: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<AuthActionResult>;
  deleteAccount: (password?: string) => Promise<AuthActionResult>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getPrimaryProviderFromUser(firebaseUser: FirebaseUser | null): PrimaryAuthProvider {
  if (!firebaseUser) return 'demo';
  const providers = firebaseUser.providerData.map((p) => p.providerId);
  if (providers.includes('password')) return 'password';
  if (providers.includes('apple.com')) return 'apple';
  if (providers.includes('google.com')) return 'google';
  return 'password';
}

function createAppleProvider(): OAuthProvider {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  return provider;
}

function createGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

function sanitizeOAuthUsername(raw: string | null | undefined, fallback = 'AnimeFan'): string {
  const cleaned = (raw || '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .slice(0, 24);
  if (cleaned.length >= 3) return cleaned;
  return fallback;
}

async function buildAndSyncUserProfile(
  firebaseUser: FirebaseUser,
  defaultNameFallback = 'AnimeFan'
): Promise<UserProfile> {
  const fallbackUsername = sanitizeOAuthUsername(
    firebaseUser.displayName || firebaseUser.email?.split('@')[0],
    defaultNameFallback
  );

  const fallbackUser: UserProfile = {
    id: firebaseUser.uid,
    username: fallbackUsername,
    usernameLower: fallbackUsername.toLowerCase(),
    email: firebaseUser.email || '',
    avatar: firebaseUser.photoURL || '',
    bio: 'Welcome to my AnimeSenpai profile!',
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    animeWatchedCount: 0,
    episodesWatchedCount: 0,
    daysWatched: 0,
    favoriteGenre: 'All Genres',
  };

  try {
    const docRef = doc(db, 'users', firebaseUser.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      await setDoc(docRef, fallbackUser);
      return fallbackUser;
    }

    const data = docSnap.data() as Partial<UserProfile>;
    const merged: UserProfile = {
      ...fallbackUser,
      ...data,
      id: firebaseUser.uid,
      email: firebaseUser.email || data.email || '',
    };

    const patch: Partial<UserProfile> = {};
    if (merged.username && data.usernameLower !== merged.username.toLowerCase()) {
      patch.usernameLower = merged.username.toLowerCase();
    }
    if (firebaseUser.email && data.email !== firebaseUser.email) {
      patch.email = firebaseUser.email;
    }
    if (Object.keys(patch).length > 0) {
      updateDoc(docRef, patch).catch(() => {});
    }

    return merged;
  } catch (firestoreError) {
    console.warn('Could not sync Firestore profile, using Firebase Auth profile:', firestoreError);
    return fallbackUser;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [linkedProviders, setLinkedProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const syncFirebaseSecurityMeta = useCallback((firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      setEmailVerified(false);
      setLinkedProviders([]);
      return;
    }
    setEmailVerified(Boolean(firebaseUser.emailVerified));
    setLinkedProviders(firebaseUser.providerData.map((p) => p.providerId));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        syncFirebaseSecurityMeta(firebaseUser);
        const profile = await buildAndSyncUserProfile(firebaseUser);
        setUser(profile);
        eventBus.publish('auth:changed', { isAuthenticated: true, userId: firebaseUser.uid });
      } else {
        syncFirebaseSecurityMeta(null);
        setUser(null);
        eventBus.publish('auth:changed', { isAuthenticated: false, userId: null });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncFirebaseSecurityMeta]);

  const applyPersistence = async (rememberMe: boolean) => {
    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
    } catch {
      // Fallback safely if browser blocks persistence switching
    }
  };

  const reauthenticateCurrentUser = async (reauthPassword?: string): Promise<void> => {
    const current = auth.currentUser;
    if (!current) return;

    const providers = current.providerData.map((p) => p.providerId);

    if (reauthPassword === '__google_reauth__') {
      await reauthenticateWithPopup(current, createGoogleProvider());
      return;
    }

    if (reauthPassword === '__apple_reauth__') {
      await reauthenticateWithPopup(current, createAppleProvider());
      return;
    }

    if (reauthPassword && current.email && providers.includes('password')) {
      const credential = EmailAuthProvider.credential(current.email, reauthPassword);
      await reauthenticateWithCredential(current, credential);
      return;
    }

    if (!reauthPassword && !providers.includes('password')) {
      if (providers.includes('apple.com')) {
        await reauthenticateWithPopup(current, createAppleProvider());
      } else if (providers.includes('google.com')) {
        await reauthenticateWithPopup(current, createGoogleProvider());
      }
    }
  };

  const login = async (
    emailOrUsername: string,
    password: string,
    rememberMe = true
  ): Promise<AuthActionResult> => {
    const identifier = emailOrUsername.trim();
    if (!identifier) {
      return { success: false, error: 'Please enter your email address or username.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    let resolvedEmail = identifier.toLowerCase();

    if (!identifier.includes('@')) {
      const usernameErr = validateUsername(identifier);
      if (usernameErr) {
        return { success: false, error: 'Please enter a valid email address or username.' };
      }

      try {
        const q = query(
          collection(db, 'users'),
          where('usernameLower', '==', identifier.toLowerCase()),
          limit(1)
        );
        const snap = await getDocs(q);
        if (snap.empty) {
          return {
            success: false,
            error: 'No account found with that username. Try signing in with your email address.',
          };
        }
        const matchedEmail = snap.docs[0].data()?.email;
        if (!matchedEmail || typeof matchedEmail !== 'string') {
          return {
            success: false,
            error: 'Please sign in using the email address linked to your account.',
          };
        }
        resolvedEmail = matchedEmail.trim().toLowerCase();
      } catch {
        return {
          success: false,
          error: 'Please sign in with your email address.',
        };
      }
    } else {
      const emailErr = validateEmail(resolvedEmail);
      if (emailErr) return { success: false, error: emailErr };
    }

    try {
      await applyPersistence(rememberMe);
      const cred = await signInWithEmailAndPassword(auth, resolvedEmail, password);
      syncFirebaseSecurityMeta(cred.user);
      const profile = await buildAndSyncUserProfile(cred.user);
      setUser(profile);
      return { success: true };
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      let errorMessage = 'Unable to sign in right now. Please try again.';
      if (
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential'
      ) {
        errorMessage = 'Invalid email or password.';
      } else if (code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please wait a few minutes or reset your password.';
      } else if (code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Contact support for help.';
      } else if (code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (data: {
    username: string;
    email: string;
    password: string;
    avatar?: string;
  }): Promise<AuthActionResult> => {
    const cleanUsername = data.username.trim();
    const cleanEmail = data.email.trim().toLowerCase();

    const usernameError = validateUsername(cleanUsername);
    if (usernameError) return { success: false, error: usernameError };

    const emailError = validateEmail(cleanEmail);
    if (emailError) return { success: false, error: emailError };

    const passwordError = validateNewPassword(data.password);
    if (passwordError) return { success: false, error: passwordError };

    try {
      const q = query(
        collection(db, 'users'),
        where('usernameLower', '==', cleanUsername.toLowerCase()),
        limit(1)
      );
      const existing = await getDocs(q);
      if (!existing.empty) {
        return { success: false, error: 'That username is already taken. Please choose another.' };
      }
    } catch {
      // Firestore rules block unauthenticated list queries; proceed safely
    }

    try {
      await applyPersistence(true);
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);

      try {
        await firebaseUpdateProfile(userCredential.user, { displayName: cleanUsername });
      } catch {
        // Non-fatal
      }

      try {
        await sendEmailVerification(userCredential.user);
      } catch {
        // Non-fatal
      }

      const newUser: UserProfile = {
        id: userCredential.user.uid,
        username: cleanUsername,
        usernameLower: cleanUsername.toLowerCase(),
        email: cleanEmail,
        avatar: data.avatar || '',
        bio: 'Welcome to my AnimeSenpai profile!',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        animeWatchedCount: 0,
        episodesWatchedCount: 0,
        daysWatched: 0,
        favoriteGenre: 'All Genres',
      };

      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      } catch (firestoreErr) {
        console.warn('Could not persist user profile document on signup:', firestoreErr);
      }

      syncFirebaseSecurityMeta(userCredential.user);
      setUser(newUser);
      return { success: true };
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      let errorMessage = 'Unable to create your account right now. Please try again.';
      if (code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already registered. Try signing in instead.';
      } else if (code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Use at least 8 characters with letters and numbers.';
      } else if (code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password sign-up is currently disabled in Firebase Auth.';
      }
      return { success: false, error: errorMessage };
    }
  };

  const loginWithOAuth = async (
    providerKind: 'google' | 'apple',
    rememberMe = true
  ): Promise<AuthActionResult> => {
    try {
      await applyPersistence(rememberMe);
      const provider =
        providerKind === 'apple' ? createAppleProvider() : createGoogleProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      syncFirebaseSecurityMeta(firebaseUser);
      const profile = await buildAndSyncUserProfile(
        firebaseUser,
        providerKind === 'apple' ? 'AppleUser' : 'AnimeFan'
      );
      setUser(profile);
      return { success: true };
    } catch (error: unknown) {
      const err = error as { code?: string };
      const providerLabel = providerKind === 'apple' ? 'Apple' : 'Google';
      let errorMessage = `Failed to sign in with ${providerLabel}. Please try again.`;

      if (err?.code === 'auth/popup-closed-by-user') {
        errorMessage = `${providerLabel} sign-in window was closed before completing.`;
      } else if (err?.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign-in popup was cancelled.';
      } else if (err?.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by your browser. Please allow popups for AnimeSenpai.';
      } else if (err?.code === 'auth/account-exists-with-different-credential') {
        errorMessage =
          'An account already exists with this email using a different sign-in method. Sign in with your original method, then link this provider in Settings → Security.';
      } else if (err?.code === 'auth/operation-not-allowed') {
        errorMessage =
          providerKind === 'apple'
            ? 'Sign in with Apple needs to be enabled in Firebase Console (Authentication → Sign-in method → Apple).'
            : 'Google Sign-In is not enabled in Firebase Console.';
      } else if (err?.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not yet authorized in Firebase Authentication settings.';
      }
      return { success: false, error: errorMessage };
    }
  };

  const loginWithGoogle = (rememberMe = true) => loginWithOAuth('google', rememberMe);
  const loginWithApple = (rememberMe = true) => loginWithOAuth('apple', rememberMe);

  const sendPasswordReset = async (email: string): Promise<AuthActionResult> => {
    const cleanEmail = email.trim().toLowerCase();
    const emailError = validateEmail(cleanEmail);
    if (emailError) return { success: false, error: emailError };

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return { success: true };
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code === 'auth/too-many-requests') {
        return { success: false, error: 'Too many reset requests. Please wait a few minutes and try again.' };
      }
      if (code === 'auth/invalid-email') {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (code === 'auth/user-not-found') {
        return { success: true };
      }
      return { success: false, error: 'Could not send reset email right now. Please try again.' };
    }
  };

  const resendVerificationEmail = async (): Promise<AuthActionResult> => {
    const current = auth.currentUser;
    if (!current) return { success: false, error: 'Please sign in first.' };
    if (current.emailVerified) return { success: true };

    try {
      await sendEmailVerification(current);
      return { success: true };
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code === 'auth/too-many-requests') {
        return { success: false, error: 'Verification email was sent recently. Please check your inbox or wait a moment.' };
      }
      return { success: false, error: 'Could not send verification email right now.' };
    }
  };

  const refreshAuthUser = async () => {
    const current = auth.currentUser;
    if (!current) return;
    try {
      await current.reload();
      syncFirebaseSecurityMeta(auth.currentUser);
      if (auth.currentUser?.email) {
        setUser((prev) =>
          prev ? { ...prev, email: auth.currentUser?.email || prev.email } : prev
        );
      }
    } catch {
      // Ignore reload errors
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<AuthActionResult> => {
    const current = auth.currentUser;
    if (!current || !current.email) {
      return { success: false, error: 'Sign in with an email account to change your password.' };
    }
    if (!currentPassword) {
      return { success: false, error: 'Enter your current password to continue.' };
    }
    const pwdError = validateNewPassword(newPassword);
    if (pwdError) return { success: false, error: pwdError };
    if (currentPassword === newPassword) {
      return { success: false, error: 'New password must be different from your current password.' };
    }

    try {
      const credential = EmailAuthProvider.credential(current.email, currentPassword);
      await reauthenticateWithCredential(current, credential);
      await updatePassword(current, newPassword);
      return { success: true };
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        return { success: false, error: 'Current password is incorrect.' };
      }
      if (code === 'auth/weak-password') {
        return { success: false, error: 'Please choose a stronger password (at least 8 characters).' };
      }
      if (code === 'auth/too-many-requests') {
        return { success: false, error: 'Too many attempts. Please wait a few minutes and try again.' };
      }
      return { success: false, error: 'Could not update password. Please try again.' };
    }
  };

  const changeEmail = async (
    newEmail: string,
    reauthPassword?: string
  ): Promise<AuthActionResult> => {
    const current = auth.currentUser;
    if (!current) return { success: false, error: 'Please sign in first.' };

    const cleanEmail = newEmail.trim().toLowerCase();
    const emailErr = validateEmail(cleanEmail);
    if (emailErr) return { success: false, error: emailErr };
    if (cleanEmail === (current.email || '').toLowerCase()) {
      return { success: false, error: 'That is already your current email address.' };
    }

    try {
      if (reauthPassword) {
        await reauthenticateCurrentUser(reauthPassword);
      }
      await verifyBeforeUpdateEmail(current, cleanEmail);
      return { success: true };
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code === 'auth/requires-recent-login') {
        return {
          success: false,
          requiresRecentLogin: true,
          error: 'Please verify your current sign-in before changing your email address.',
        };
      }
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        return { success: false, requiresRecentLogin: true, error: 'Incorrect password.' };
      }
      if (code === 'auth/email-already-in-use') {
        return { success: false, error: 'That email address is already linked to another account.' };
      }
      if (code === 'auth/popup-closed-by-user') {
        return { success: false, requiresRecentLogin: true, error: 'Verification popup was closed.' };
      }
      return { success: false, error: 'Unable to send email change verification right now.' };
    }
  };

  const linkAuthProvider = async (providerKind: 'google' | 'apple'): Promise<AuthActionResult> => {
    const current = auth.currentUser;
    if (!current) return { success: false, error: 'Please sign in first.' };

    try {
      const provider =
        providerKind === 'apple' ? createAppleProvider() : createGoogleProvider();
      await linkWithPopup(current, provider);
      await current.reload();
      syncFirebaseSecurityMeta(auth.currentUser);
      return { success: true };
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      const label = providerKind === 'apple' ? 'Apple' : 'Google';
      if (code === 'auth/credential-already-in-use') {
        return { success: false, error: `That ${label} account is already linked to another AnimeSenpai user.` };
      }
      if (code === 'auth/provider-already-linked') {
        return { success: true };
      }
      if (code === 'auth/popup-closed-by-user') {
        return { success: false, error: `${label} sign-in window was closed.` };
      }
      if (code === 'auth/operation-not-allowed') {
        return {
          success: false,
          error:
            providerKind === 'apple'
              ? 'Sign in with Apple must be enabled in Firebase Console first.'
              : 'Google Sign-In must be enabled in Firebase Console first.',
        };
      }
      return { success: false, error: `Could not link ${label} account right now.` };
    }
  };

  const unlinkAuthProvider = async (providerId: string): Promise<AuthActionResult> => {
    const current = auth.currentUser;
    if (!current) return { success: false, error: 'Please sign in first.' };
    if (current.providerData.length <= 1) {
      return {
        success: false,
        error: 'You cannot disconnect your only remaining sign-in method.',
      };
    }

    try {
      await unlink(current, providerId);
      await current.reload();
      syncFirebaseSecurityMeta(auth.currentUser);
      return { success: true };
    } catch {
      return { success: false, error: 'Could not disconnect that sign-in method right now.' };
    }
  };

  const quickDemoLogin = () => {
    setUser(DEFAULT_DEMO_USER);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      syncFirebaseSecurityMeta(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<AuthActionResult> => {
    if (!user) return { success: false, error: 'Not signed in.' };

    const safeUpdates: Partial<UserProfile> = { ...updates };

    if (typeof updates.username === 'string') {
      const err = validateUsername(updates.username);
      if (err) return { success: false, error: err };
      safeUpdates.username = updates.username.trim();
      safeUpdates.usernameLower = safeUpdates.username.toLowerCase();
    }

    if (typeof updates.bio === 'string') {
      safeUpdates.bio = updates.bio.trim().slice(0, 280);
    }

    try {
      if (auth.currentUser && safeUpdates.username) {
        await firebaseUpdateProfile(auth.currentUser, { displayName: safeUpdates.username }).catch(
          () => {}
        );
      }

      await updateDoc(doc(db, 'users', user.id), safeUpdates);
      setUser((prev) => (prev ? { ...prev, ...safeUpdates } : null));
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      setUser((prev) => (prev ? { ...prev, ...safeUpdates } : null));
      return { success: true };
    }
  };

  const clearLocalUserData = () => {
    try {
      localStorage.removeItem('animesenpai_watchlist_v1');
      localStorage.removeItem('anime_pulse_watchlist_v1');
      localStorage.removeItem('animesenpai_preferences_v1');
      localStorage.removeItem('animesenpai_user_session');
    } catch {}
  };

  const deleteAccount = async (password?: string): Promise<AuthActionResult> => {
    const current = auth.currentUser;

    if (!current) {
      clearLocalUserData();
      setUser(null);
      return { success: true };
    }

    try {
      if (password) {
        await reauthenticateCurrentUser(password);
      }

      try {
        await deleteDoc(doc(db, 'users', current.uid));
      } catch (firestoreErr) {
        console.warn('Firestore profile cleanup warning:', firestoreErr);
      }

      await deleteUser(current);

      clearLocalUserData();
      setUser(null);
      syncFirebaseSecurityMeta(null);

      return { success: true };
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err?.code === 'auth/requires-recent-login') {
        return {
          success: false,
          requiresRecentLogin: true,
          error: 'For your security, please verify your login one more time to permanently delete your account.',
        };
      }
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        return {
          success: false,
          requiresRecentLogin: true,
          error: 'Incorrect password. Please try again.',
        };
      }
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        return {
          success: false,
          requiresRecentLogin: true,
          error: 'Verification popup was closed before completing.',
        };
      }
      return {
        success: false,
        error: err?.message || 'Unable to delete account right now. Please sign out, sign back in, and try again.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        emailVerified,
        linkedProviders,
        authProvider: getPrimaryProviderFromUser(auth.currentUser),
        login,
        signup,
        loginWithGoogle,
        loginWithApple,
        sendPasswordReset,
        resendVerificationEmail,
        refreshAuthUser,
        changePassword,
        changeEmail,
        linkAuthProvider,
        unlinkAuthProvider,
        logout: handleLogout,
        quickDemoLogin,
        updateProfile,
        deleteAccount,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
