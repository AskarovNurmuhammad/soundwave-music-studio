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
