import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserProfile {
  id: string;
  username: string;
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

export const AVATAR_PRESETS = [
  {
    id: 'avatar-1',
    name: 'Spike',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-2',
    name: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-3',
    name: 'Sakura',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-4',
    name: 'Shonen',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-5',
    name: 'Mecha',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-6',
    name: 'Fantasy',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
  },
];

const DEFAULT_DEMO_USER: UserProfile = {
  id: 'usr_demo_101',
  username: 'OtakuMaster',
  email: 'otakumaster@animesenpai.io',
  avatar: AVATAR_PRESETS[0].url,
  bio: 'Anime enthusiast exploring new seasonal gems and 90s classics.',
  joinedDate: 'Joined September 2026',
  animeWatchedCount: 42,
  episodesWatchedCount: 680,
  daysWatched: 11.3,
  favoriteGenre: 'Action / Sci-Fi',
};

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { username: string; email: string; password?: string; avatar?: string }) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickDemoLogin: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync auth state with Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUser({ id: firebaseUser.uid, ...docSnap.data() } as UserProfile);
          } else {
            // Fallback if document is somehow missing
            setUser({
              id: firebaseUser.uid,
              username: firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              avatar: AVATAR_PRESETS[0].url,
              joinedDate: new Date().toLocaleDateString(),
            });
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (emailOrUsername: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (!emailOrUsername.trim()) {
      return { success: false, error: 'Please enter your username or email.' };
    }

    try {
      const email = emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@animesenpai.io`;
      // We provide a fallback password if the UI didn't enforce it originally
      const authPassword = password || 'animesenpai_demo_123!';
      
      await signInWithEmailAndPassword(auth, email, authPassword);
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'An error occurred during login.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      }
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (data: {
    username: string;
    email: string;
    password?: string;
    avatar?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!data.username.trim() || !data.email.trim()) {
      return { success: false, error: 'Username and Email are required.' };
    }

    try {
      const authPassword = data.password || 'animesenpai_demo_123!';
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, authPassword);
      
      const newUser: UserProfile = {
        id: userCredential.user.uid,
        username: data.username.trim(),
        email: data.email.trim(),
        avatar: data.avatar || AVATAR_PRESETS[0].url,
        bio: 'Welcome to my AnimeSenpai profile!',
        joinedDate: new Date().toLocaleDateString(),
        animeWatchedCount: 0,
        episodesWatchedCount: 0,
        daysWatched: 0,
        favoriteGenre: 'All Genres',
      };

      // Store extra user details in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      
      // onAuthStateChanged will handle updating the state, but we can set it immediately for perceived performance
      setUser(newUser);
      
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'An error occurred during signup.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }
      return { success: false, error: errorMessage };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const docRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const newUser: UserProfile = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'AnimeFan',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || AVATAR_PRESETS[0].url,
          bio: 'Welcome to my AnimeSenpai profile!',
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          animeWatchedCount: 0,
          episodesWatchedCount: 0,
          daysWatched: 0,
          favoriteGenre: 'All Genres',
        };
        await setDoc(docRef, newUser);
        setUser(newUser);
      } else {
        setUser({ id: firebaseUser.uid, ...docSnap.data() } as UserProfile);
      }

      return { success: true };
    } catch (error: any) {
      console.error("Google sign in error:", error);
      let errorMessage = `Failed to sign in with Google. (${error.code || 'Unknown Error'}): ${error.message || 'No details available.'}`;
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in window closed before completing.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign-in popup was cancelled.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup blocked by browser. Please allow popups for this site.';
      }
      return { success: false, error: errorMessage };
    }
  };

  const quickDemoLogin = async () => {
    // For demo login, we could create an anonymous user or hardcode a demo user
    setUser(DEFAULT_DEMO_USER);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.id), updates);
      setUser((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (error) {
      console.error("Error updating profile: ", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        loginWithGoogle,
        logout: handleLogout,
        quickDemoLogin,
        updateProfile,
        loading
      }}
    >
      {!loading && children}
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

