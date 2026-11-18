import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AnimeTitle } from '../api/types';

export type TitleLanguage = 'english' | 'romaji' | 'native';
export type LayoutDensity = 'comfortable' | 'compact';
export type TextSize = 'sm' | 'md' | 'lg' | 'xl';

export interface UserPreferences {
  titleLanguage: TitleLanguage;
  density: LayoutDensity;
  textSize: TextSize;
  preferredAudio: 'sub' | 'dub';
  contentFilter: boolean;
  autoTrailer: boolean;
  reduceMotion: boolean;
}

const PREFS_STORAGE_KEY = 'animesenpai_preferences_v1';

export const DEFAULT_PREFERENCES: UserPreferences = {
  titleLanguage: 'english',
  density: 'comfortable',
  textSize: 'md',
  preferredAudio: 'sub',
  contentFilter: true,
  autoTrailer: true,
  reduceMotion: false,
};

function loadStoredPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        titleLanguage:
          parsed.titleLanguage === 'romaji' || parsed.titleLanguage === 'native'
            ? parsed.titleLanguage
            : 'english',
        density: parsed.density === 'compact' ? 'compact' : 'comfortable',
        textSize:
          parsed.textSize === 'sm' || parsed.textSize === 'lg' || parsed.textSize === 'xl'
            ? parsed.textSize
            : 'md',
        preferredAudio: parsed.preferredAudio === 'dub' ? 'dub' : 'sub',
        contentFilter: typeof parsed.contentFilter === 'boolean' ? parsed.contentFilter : true,
        autoTrailer: typeof parsed.autoTrailer === 'boolean' ? parsed.autoTrailer : true,
        reduceMotion: typeof parsed.reduceMotion === 'boolean' ? parsed.reduceMotion : false,
      };
    }
  } catch {}
  return DEFAULT_PREFERENCES;
}

interface PreferencesContextValue {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  resetPreferences: () => void;
  getPreferredTitle: (title?: Partial<AnimeTitle> | null, fallback?: string) => string;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(loadStoredPreferences);

  // Sync density, motion, and body text size attributes
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.density = preferences.density;
    if (preferences.reduceMotion) {
      root.dataset.reduceMotion = 'true';
    } else {
      delete root.dataset.reduceMotion;
    }

    if (preferences.textSize === 'md') {
      delete document.body.dataset.textSize;
    } else {
      document.body.dataset.textSize = preferences.textSize;
    }
  }, [preferences.density, preferences.reduceMotion, preferences.textSize]);

  const updatePreference = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      setPreferences((prev) => {
        const next = { ...prev, [key]: value };
        try {
          localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    []
  );

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES));
    } catch {}
  }, []);

  const getPreferredTitle = useCallback(
    (title?: Partial<AnimeTitle> | null, fallback = 'Anime'): string => {
      if (!title) return fallback;
      if (preferences.titleLanguage === 'romaji') {
        return title.romaji || title.userPreferred || title.english || fallback;
      }
      if (preferences.titleLanguage === 'native') {
        return title.native || title.romaji || title.english || fallback;
      }
      return title.english || title.userPreferred || title.romaji || fallback;
    },
    [preferences.titleLanguage]
  );

  return (
    <PreferencesContext.Provider
      value={{ preferences, updatePreference, resetPreferences, getPreferredTitle }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return ctx;
}
