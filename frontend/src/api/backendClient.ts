/**
 * Voltaku Backend Client
 * Connects to the Express + SQLite backend service, with automated fallback
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function getAuthHeader(): Record<string, string> {
  try {
    const sessionStr = localStorage.getItem('voltaku_user_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session.token) {
        return { Authorization: `Bearer ${session.token}` };
      }
    }
  } catch {
    // Ignore error
  }
  return {};
}

export const backendClient = {
  baseUrl: API_BASE_URL,

  async getHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  // Auth Endpoints
  async register(payload: { username: string; email: string; password?: string; avatar?: string }) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async login(payload: { emailOrUsername: string; password?: string }) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async demoLogin() {
    const res = await fetch(`${API_BASE_URL}/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  // Watchlist Endpoints
  async getWatchlist(status?: string, userId?: string) {
    const url = new URL(`${API_BASE_URL}/watchlist`);
    if (status) url.searchParams.append('status', status);
    if (userId) url.searchParams.append('userId', userId);

    const res = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return res.json();
  },

  async syncWatchlistItem(itemPayload: any) {
    const res = await fetch(`${API_BASE_URL}/watchlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(itemPayload),
    });
    return res.json();
  },

  async updateProgress(animeId: number, currentEpisode: number, status?: string) {
    const res = await fetch(`${API_BASE_URL}/watchlist/${animeId}/progress`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ currentEpisode, status }),
    });
    return res.json();
  },

  async removeWatchlistItem(animeId: number) {
    const res = await fetch(`${API_BASE_URL}/watchlist/${animeId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });
    return res.json();
  },

  // Recommendations
  async getPersonalizedRecommendations(userId?: string, limit: number = 12) {
    const url = new URL(`${API_BASE_URL}/recommendations/personalized`);
    if (userId) url.searchParams.append('userId', userId);
    url.searchParams.append('limit', limit.toString());

    const res = await fetch(url.toString(), {
      headers: {
        ...getAuthHeader(),
      },
    });
    return res.json();
  },

  // Reviews
  async getReviews(animeId: number) {
    const res = await fetch(`${API_BASE_URL}/reviews/anime/${animeId}`);
    return res.json();
  },

  async postReview(payload: { animeId: number; rating: number; reviewText: string; userId?: string }) {
    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
