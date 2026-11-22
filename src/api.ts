// SoundWave Studio API Client

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('sw_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('sw_token', token);
  } else {
    localStorage.removeItem('sw_token');
  }
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'Xatolik yuz berdi';
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errData.message || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

// Auth APIs
export async function registerUser(username: string, email: string, password: string) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export async function loginUser(login: string, password: string) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ login, password }),
  });
}

export async function fetchCurrentUser() {
  return apiRequest('/auth/me');
}

export async function logoutUser() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } finally {
    setAuthToken(null);
  }
}

// History APIs
export async function fetchHistory() {
  return apiRequest('/history');
}

export async function saveToHistory(track: {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl?: string;
  genre?: string;
  duration?: number;
}) {
  return apiRequest('/history', {
    method: 'POST',
    body: JSON.stringify(track),
  });
}

export async function clearHistoryApi() {
  return apiRequest('/history', {
    method: 'DELETE',
  });
}

// Favorites APIs
export async function fetchFavorites() {
  return apiRequest('/favorites');
}

export async function toggleFavoriteApi(track: {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl?: string;
  genre?: string;
  duration?: number;
}) {
  return apiRequest('/favorites/toggle', {
    method: 'POST',
    body: JSON.stringify(track),
  });
}

// Search & Trending APIs
export async function searchTracks(query: string) {
  return apiRequest(`/search?q=${encodeURIComponent(query)}`);
}

export async function fetchTrendingTracks() {
  return apiRequest('/trending');
}
