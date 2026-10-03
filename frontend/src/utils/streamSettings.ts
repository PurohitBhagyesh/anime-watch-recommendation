// Shared persistent stream & player settings

export interface StreamSettings {
  quality: '1080p' | '720p' | '480p';
  speed: number;
  audioLanguage: 'sub' | 'dub';
  subtitlesEnabled: boolean;
  subtitleSize: 'small' | 'medium' | 'large';
  subtitleColor: string;
  subtitleBg: 'transparent' | 'solid' | 'none';
  subtitleLang: string;
  autoPlayNext: boolean;
  autoSkipIntro: boolean;
  autoMarkWatched: boolean;
  customStreamUrl: string;
  consumetApiUrl: string;
}

const DEFAULT_SETTINGS: StreamSettings = {
  quality: '1080p',
  speed: 1.0,
  audioLanguage: 'sub',
  subtitlesEnabled: true,
  subtitleSize: 'medium',
  subtitleColor: '#facc15', // Anime yellow
  subtitleBg: 'transparent',
  subtitleLang: 'English',
  autoPlayNext: true,
  autoSkipIntro: false,
  autoMarkWatched: true,
  customStreamUrl: '',
  consumetApiUrl: '',
};

const STORAGE_KEY = 'animesenpai_stream_settings';

export const getStreamSettings = (): StreamSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveStreamSettings = (settings: Partial<StreamSettings>): StreamSettings => {
  const current = getStreamSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('streamSettingsUpdated'));
  } catch (err) {
    console.error('Failed to save stream settings:', err);
  }
  return updated;
};

export const isStreamVaultUnlocked = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem('animesenpai_stream_unlocked') === 'true';
  } catch {
    return false;
  }
};

export const unlockStreamVault = (code: string): boolean => {
  if (code.trim() === '111111') {
    try {
      sessionStorage.setItem('animesenpai_stream_unlocked', 'true');
      window.dispatchEvent(new Event('streamVaultStatusChanged'));
      return true;
    } catch {
      return false;
    }
  }
  return false;
};

export const lockStreamVault = (): void => {
  try {
    sessionStorage.removeItem('animesenpai_stream_unlocked');
    window.dispatchEvent(new Event('streamVaultStatusChanged'));
  } catch (err) {
    console.error('Failed to lock stream vault:', err);
  }
};
