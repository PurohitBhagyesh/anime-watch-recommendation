import React, { createContext, useContext, useState, useEffect } from 'react';

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
  email: 'otakumaster@voltaku.io',
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
  logout: () => void;
  quickDemoLogin: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'voltaku_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('anipulse_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to sync auth state', e);
    }
  }, [user]);

  const login = async (emailOrUsername: string, _password?: string): Promise<{ success: boolean; error?: string }> => {
    if (!emailOrUsername.trim()) {
      return { success: false, error: 'Please enter your username or email.' };
    }

    // Mock successful authentication
    const cleanName = emailOrUsername.includes('@')
      ? emailOrUsername.split('@')[0]
      : emailOrUsername.trim();

    const loggedInUser: UserProfile = {
      id: `usr_${Date.now()}`,
      username: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
      email: emailOrUsername.includes('@') ? emailOrUsername : `${cleanName}@voltaku.io`,
      avatar: AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)].url,
      bio: 'Anime enthusiast tracking anime with Voltaku.',
      joinedDate: 'Joined September 2026',
      animeWatchedCount: 18,
      episodesWatchedCount: 240,
      daysWatched: 4.2,
      favoriteGenre: 'Shounen',
    };

    setUser(loggedInUser);
    return { success: true };
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

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      username: data.username.trim(),
      email: data.email.trim(),
      avatar: data.avatar || AVATAR_PRESETS[0].url,
      bio: 'Welcome to my Voltaku profile!',
      joinedDate: 'Joined September 2026',
      animeWatchedCount: 0,
      episodesWatchedCount: 0,
      daysWatched: 0,
      favoriteGenre: 'All Genres',
    };

    setUser(newUser);
    return { success: true };
  };

  const quickDemoLogin = () => {
    setUser(DEFAULT_DEMO_USER);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        quickDemoLogin,
        updateProfile,
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
