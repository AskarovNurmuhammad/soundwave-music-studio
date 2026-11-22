export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  genre: string;
  bpm: number;
  lyrics: string[];
  isFavorite: boolean;
  audioUrl?: string;
  isOnline?: boolean;
  isFull?: boolean;
  hasFull?: boolean;
}

export type VisualizerMode = 'bars' | 'wave' | 'pulse';
export type EqualizerPreset = 'Flat' | 'Bass Boost' | 'Electronic' | 'Acoustic' | 'Vocal';

export interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  volume: number; // 0 to 100
  isPlaying: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface HistoryItem {
  historyId: number;
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  genre: string;
  duration: number;
  playedAt: string;
  isFull?: boolean;
}

export interface FavoriteItem {
  favId: number;
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  genre: string;
  duration: number;
  createdAt: string;
  isFull?: boolean;
}
