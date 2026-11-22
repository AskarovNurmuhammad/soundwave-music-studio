import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Heart,
  Music,
  Headphones,
  Sparkles,
  Search,
  Sun,
  Moon,
  Disc3,
  CloudRain,
  Radio,
  Activity,
  FileText,
  Clock,
  User as UserIcon,
  LogOut,
  Globe,
  Flame,
  Loader2
} from 'lucide-react';
import AudioVisualizer from './components/AudioVisualizer';
import AuthModal from './components/AuthModal';
import OnlineSearch from './components/OnlineSearch';
import HistoryView from './components/HistoryView';
import FavoritesView from './components/FavoritesView';
import {
  fetchCurrentUser,
  logoutUser,
  saveToHistory,
  toggleFavoriteApi,
  getAuthToken,
  fetchFullAudio
} from './api';
import type { Track, VisualizerMode, EqualizerPreset, AmbientSound, User } from './types';

const INITIAL_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Midnight Coding Vibes',
    artist: 'Aura Chillhop',
    album: 'Deep Focus Vol. 1',
    duration: 194,
    genre: 'Lo-Fi Chill',
    bpm: 82,
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    lyrics: [
      '[00:10] Kechki sokinlik, faqat kod va klaviatura tovushi...',
      '[00:45] Qahva qultumi va ekrandagi yashil qatorlar.',
      '[01:20] Xatoliklar tuzatildi, funksiyalar silliq ishlamoqda.',
      '[02:15] Fikrlar tiniqlashdi, mukammal arxitektura.'
    ],
    isFavorite: true,
    isFull: true
  },
  {
    id: 'track-2',
    title: 'Cyberpunk Overdrive',
    artist: 'Neon Synthetix',
    album: 'Neo Tokyo 2077',
    duration: 218,
    genre: 'Synthwave',
    bpm: 128,
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    lyrics: [
      '[00:15] Neon chiroqlari va tungi avtomagistral.',
      '[00:50] Tezlik 180 km/soat, bas to\'lqinlari yurakni larzaga soladi.',
      '[01:30] Kiber dunyo, yangi texnologiyalar davri.'
    ],
    isFavorite: true,
    isFull: true
  },
  {
    id: 'track-3',
    title: 'Rainy Cafe Afternoon',
    artist: 'Lofi Coffee Club',
    album: 'Warm Acoustic Beats',
    duration: 165,
    genre: 'Acoustic Lo-Fi',
    bpm: 76,
    coverUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&fit=crop&q=80',
    lyrics: [
      '[00:08] Derazaga urilayotgan yomg\'ir tomchilari.',
      '[00:40] Yangi qovurilgan kofe ifori va sokin gitara akkordi.',
      '[01:15] O\'qish va ilhom olish uchun eng sokin fursat.'
    ],
    isFavorite: false,
    isFull: true
  },
  {
    id: 'track-4',
    title: 'Infinity Horizons',
    artist: 'Stellar Ambient Project',
    album: 'Space Meditation',
    duration: 240,
    genre: 'Deep Ambient',
    bpm: 68,
    coverUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=500&auto=format&fit=crop&q=80',
    lyrics: [
      '[00:20] Cheksiz koinot, sayyoralar va yulduzlar to\'lqini...',
      '[01:10] Ichki xotirjamlik va chuqur nafas olish.',
      '[02:00] Har bir nafasda yengillik va quvvat.'
    ],
    isFavorite: false,
    isFull: true
  },
  {
    id: 'track-5',
    title: 'Tokyo Electric Pulse',
    artist: 'Future Bass Labs',
    album: 'Shibuya Beats',
    duration: 182,
    genre: 'Electronic',
    bpm: 140,
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
    lyrics: [
      '[00:12] Shibuya ko\'chalaridagi energiya.',
      '[00:48] Ritm ko\'tarilmoqda, harakat boshlandi!',
      '[01:25] Yengilmas quvvat va yangi yutuqlar sari.'
    ],
    isFavorite: true,
    isFull: true
  }
];

const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'rain', name: 'Yomg\'ir', icon: '🌧️', volume: 0, isPlaying: false },
  { id: 'fire', name: 'Kamin Olovi', icon: '🔥', volume: 0, isPlaying: false },
  { id: 'cafe', name: 'Qahvaxona', icon: '☕', volume: 0, isPlaying: false },
  { id: 'forest', name: 'O\'rmon', icon: '🌲', volume: 0, isPlaying: false },
  { id: 'noise', name: 'Oq Shovqin', icon: '📻', volume: 0, isPlaying: false }
];

export default function App() {
  const [tracks, setTracks] = useState<Track[]>(() => {
    const saved = localStorage.getItem('sw_tracks');
    return saved ? JSON.parse(saved) : INITIAL_TRACKS;
  });

  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isLoop, setIsLoop] = useState<boolean>(false);

  // Navigatsiya va sozlamalar
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('bars');
  const [equalizer, setEqualizer] = useState<EqualizerPreset>('Bass Boost');
  const [activeTab, setActiveTab] = useState<'player' | 'search' | 'history' | 'favorites' | 'visualizer' | 'ambient' | 'lyrics'>('player');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Ambient fon tovushlari
  const [ambientSounds, setAmbientSounds] = useState<AmbientSound[]>(AMBIENT_SOUNDS);

  // Foydalanuvchi hisobi & Auth
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sw_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isUpgradingFull, setIsUpgradingFull] = useState(false);

  // Audio elements
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const isDark = theme === 'dark';
  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Auth holatini server bilan tekshirish
  useEffect(() => {
    if (getAuthToken()) {
      fetchCurrentUser()
        .then(data => {
          if (data && data.user) {
            setUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Save tracks to localStorage
  useEffect(() => {
    localStorage.setItem('sw_tracks', JSON.stringify(tracks));
  }, [tracks]);

  // Audio HTML5 player boshqaruvi
  useEffect(() => {
    if (!audioElRef.current) return;
    audioElRef.current.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  // Web Audio Sintetizator konteksti
  const initAudioEngine = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
  };

  const playSynthesizerBeat = () => {
    try {
      initAudioEngine();
      if (!audioCtxRef.current) return;
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      const freq = 130 + (currentTrackIndex * 25);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, audioCtxRef.current.currentTime + 0.4);

      const targetGain = isMuted ? 0 : (volume / 100) * 0.15;
      gain.gain.setValueAtTime(targetGain, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.8);
    } catch {
      // autoplay fallback
    }
  };

  // Trek o'zgarganda yoki ijro boshlanganda
  const handlePlayCurrent = async () => {
    initAudioEngine();
    if (currentTrack.audioUrl && audioElRef.current) {
      if (audioElRef.current.src !== currentTrack.audioUrl) {
        audioElRef.current.src = currentTrack.audioUrl;
      }
      try {
        await audioElRef.current.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      playSynthesizerBeat();
      setIsPlaying(true);
    }

    if (user) {
      saveToHistory({
        id: currentTrack.id,
        title: currentTrack.title,
        artist: currentTrack.artist,
        coverUrl: currentTrack.coverUrl,
        audioUrl: currentTrack.audioUrl,
        genre: currentTrack.genre,
        duration: currentTrack.duration
      }).catch(() => {});
    }
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (!isPlaying) {
      handlePlayCurrent();
    } else {
      if (audioElRef.current && currentTrack.audioUrl) {
        audioElRef.current.pause();
      }
      setIsPlaying(false);
    }
  };

  // To'liq (Full) qo'shiqqa o'tish
  const handleUpgradeToFullSong = async () => {
    if (isUpgradingFull) return;
    setIsUpgradingFull(true);
    try {
      const data = await fetchFullAudio(`${currentTrack.title} ${currentTrack.artist}`);
      const updated: Track = {
        ...currentTrack,
        audioUrl: data.audioUrl,
        duration: data.duration || 210,
        isFull: true,
        isOnline: true
      };

      setTracks(prev => prev.map(t => (t.id === currentTrack.id ? updated : t)));

      if (audioElRef.current) {
        audioElRef.current.src = data.audioUrl;
        audioElRef.current.currentTime = 0;
        await audioElRef.current.play();
        setIsPlaying(true);
      }
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {
      alert("To'liq audio topilmadi yoki internet sekin, hozirgi formatda davom etiladi.");
    } finally {
      setIsUpgradingFull(false);
    }
  };

  // Internet qidiruv yoki boshqa joydan trek tanlanganda
  const handleSelectTrackToPlay = (newTrack: Track) => {
    const existingIndex = tracks.findIndex(t => t.id === newTrack.id);
    if (existingIndex !== -1) {
      setCurrentTrackIndex(existingIndex);
    } else {
      setTracks(prev => [newTrack, ...prev]);
      setCurrentTrackIndex(0);
    }

    setCurrentTime(0);
    setTimeout(() => {
      initAudioEngine();
      if (audioElRef.current && newTrack.audioUrl) {
        audioElRef.current.src = newTrack.audioUrl;
        audioElRef.current.currentTime = 0;
        audioElRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(true);
        playSynthesizerBeat();
      }

      if (user) {
        saveToHistory({
          id: newTrack.id,
          title: newTrack.title,
          artist: newTrack.artist,
          coverUrl: newTrack.coverUrl,
          audioUrl: newTrack.audioUrl,
          genre: newTrack.genre,
          duration: newTrack.duration
        }).catch(() => {});
      }
    }, 50);
  };

  // Sintetik treklar uchun timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && !currentTrack.audioUrl) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentTrack.duration) {
            handleNextTrack();
            return 0;
          }
          if (prev % 3 === 0) playSynthesizerBeat();
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  // Keyingi trek
  const handleNextTrack = () => {
    setCurrentTime(0);
    let nextIdx = 0;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * tracks.length);
    } else {
      nextIdx = (currentTrackIndex + 1) % tracks.length;
    }
    setCurrentTrackIndex(nextIdx);

    const nextTrack = tracks[nextIdx];
    setTimeout(() => {
      if (nextTrack?.audioUrl && audioElRef.current) {
        audioElRef.current.src = nextTrack.audioUrl;
        audioElRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        playSynthesizerBeat();
        setIsPlaying(true);
      }

      if (user && nextTrack) {
        saveToHistory({
          id: nextTrack.id,
          title: nextTrack.title,
          artist: nextTrack.artist,
          coverUrl: nextTrack.coverUrl,
          audioUrl: nextTrack.audioUrl,
          genre: nextTrack.genre,
          duration: nextTrack.duration
        }).catch(() => {});
      }
    }, 50);
  };

  // Oldingi trek
  const handlePrevTrack = () => {
    setCurrentTime(0);
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIdx);

    const prevTrack = tracks[prevIdx];
    setTimeout(() => {
      if (prevTrack?.audioUrl && audioElRef.current) {
        audioElRef.current.src = prevTrack.audioUrl;
        audioElRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        playSynthesizerBeat();
        setIsPlaying(true);
      }
    }, 50);
  };

  // Sevimlilarga qo'shish / o'chirish
  const toggleFavorite = (track: Track, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const nextState = !track.isFavorite;
    if (nextState) confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });

    setTracks(prev =>
      prev.map(t => (t.id === track.id ? { ...t, isFavorite: nextState } : t))
    );

    if (user) {
      toggleFavoriteApi({
        id: track.id,
        title: track.title,
        artist: track.artist,
        coverUrl: track.coverUrl,
        audioUrl: track.audioUrl,
        genre: track.genre,
        duration: track.duration
      }).catch(() => {});
    }
  };

  // Logout
  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    localStorage.removeItem('sw_user');
  };

  // Ambient tovushlar mikseri
  const updateAmbientVolume = (id: string, vol: number) => {
    initAudioEngine();
    setAmbientSounds(prev =>
      prev.map(s => (s.id === id ? { ...s, volume: vol, isPlaying: vol > 0 } : s))
    );
  };

  // Vaqtni formatlash (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filtrlangan treklar
  const filteredTracks = useMemo(() => {
    return tracks.filter(t => {
      const matchGenre = selectedGenre === 'all' ||
        (selectedGenre === 'favorites' ? t.isFavorite : t.genre.toLowerCase().includes(selectedGenre.toLowerCase()));
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.artist.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGenre && matchSearch;
    });
  }, [tracks, selectedGenre, searchQuery]);

  const genres = ['all', 'favorites', 'Lo-Fi Chill', 'Synthwave', 'Acoustic Lo-Fi', 'Deep Ambient', 'Electronic'];

  const themeClasses = {
    appBg: isDark ? 'bg-[#0b0e17] text-slate-100' : 'bg-[#f8fafc] text-slate-900',
    headerBg: isDark ? 'bg-[#0f1422]/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-xs',
    card: isDark ? 'bg-[#131b2e] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-sm',
    panelBg: isDark ? 'bg-[#101728] border-slate-800' : 'bg-slate-100/80 border-slate-200',
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
    activeTab: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/25',
    inactiveTab: isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900',
    playerBar: isDark ? 'bg-[#0d121f]/95 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-slate-900 shadow-lg'
  };

  return (
    <div className={`min-h-screen flex flex-col pb-28 transition-colors duration-200 ${themeClasses.appBg}`}>

      {/* Real Audio Stream Element */}
      <audio
        ref={audioElRef}
        onTimeUpdate={() => {
          if (audioElRef.current) {
            setCurrentTime(Math.floor(audioElRef.current.currentTime));
          }
        }}
        onEnded={handleNextTrack}
      />

      {/* TOP HEADER */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 lg:px-8 py-3 transition-colors ${themeClasses.headerBg}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('player')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/25">
              <Headphones className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  SoundWave
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20 uppercase">
                  Studio Pro
                </span>
              </div>
              <p className={`text-[11px] font-medium hidden sm:block ${themeClasses.textMuted}`}>
                Web Audio & Full-Length Streaming Engine
              </p>
            </div>
          </div>

          {/* Desktop Tablar */}
          <nav className={`hidden lg:flex items-center gap-1 p-1 rounded-2xl border text-xs font-bold ${themeClasses.panelBg}`}>
            <button
              onClick={() => setActiveTab('player')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'player' ? themeClasses.activeTab : themeClasses.inactiveTab
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Pleyer</span>
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer relative ${
                activeTab === 'search' ? themeClasses.activeTab : themeClasses.inactiveTab
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-pink-400" />
              <span>Internet Qidiruv</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history' ? themeClasses.activeTab : themeClasses.inactiveTab
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Tarix</span>
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'favorites' ? themeClasses.activeTab : themeClasses.inactiveTab
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Sevimlilar</span>
            </button>

            <button
              onClick={() => setActiveTab('visualizer')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'visualizer' ? themeClasses.activeTab : themeClasses.inactiveTab
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Spektr</span>
            </button>

            <button
              onClick={() => setActiveTab('ambient')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ambient' ? themeClasses.activeTab : themeClasses.inactiveTab
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>Mikser</span>
            </button>

            <button
              onClick={() => setActiveTab('lyrics')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'lyrics' ? themeClasses.activeTab : themeClasses.inactiveTab
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Matn</span>
            </button>
          </nav>

          {/* O'ng tomon: User Profile & EQ & Theme */}
          <div className="flex items-center gap-2.5">
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 text-[11px] font-bold border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>FastAPI Full Stream</span>
            </div>

            {/* Equalizer Preset Selector */}
            <select
              value={equalizer}
              onChange={(e) => setEqualizer(e.target.value as EqualizerPreset)}
              className={`hidden sm:block text-xs font-bold py-1.5 px-3 rounded-xl border outline-none cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <option value="Bass Boost">🔊 Bass Boost</option>
              <option value="Electronic">⚡ Electronic</option>
              <option value="Acoustic">🎸 Acoustic</option>
              <option value="Vocal">🎤 Vocal</option>
              <option value="Flat">⚖️ Flat</option>
            </select>

            {/* Foydalanuvchi hisobi (Auth) */}
            {user ? (
              <div className="flex items-center gap-2 pl-1">
                <div
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border cursor-pointer transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 hover:border-pink-500' : 'bg-white border-slate-200 hover:border-pink-500 shadow-xs'
                  }`}
                  title={`${user.username} - Tarixni ko'rish`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold hidden sm:inline max-w-[90px] truncate">
                    {user.username}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Chiqish"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAuthModalMode('login'); setIsAuthModalOpen(true); }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Kirish</span>
              </button>
            )}

            {/* Tema almashtirish */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobil Nav */}
        <div className="flex lg:hidden items-center justify-between gap-1 pt-2.5 border-t border-inherit mt-2 text-xs font-bold overflow-x-auto scrollbar-none">
          <button onClick={() => setActiveTab('player')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'player' ? 'bg-pink-500 text-white' : themeClasses.inactiveTab}`}>Pleyer</button>
          <button onClick={() => setActiveTab('search')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap text-pink-400 ${activeTab === 'search' ? 'bg-pink-500 text-white' : themeClasses.inactiveTab}`}>🌐 Qidiruv</button>
          <button onClick={() => setActiveTab('history')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'history' ? 'bg-pink-500 text-white' : themeClasses.inactiveTab}`}>Tarix</button>
          <button onClick={() => setActiveTab('favorites')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'favorites' ? 'bg-pink-500 text-white' : themeClasses.inactiveTab}`}>Sevimlilar</button>
          <button onClick={() => setActiveTab('visualizer')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'visualizer' ? 'bg-pink-500 text-white' : themeClasses.inactiveTab}`}>Vizual</button>
          <button onClick={() => setActiveTab('ambient')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'ambient' ? 'bg-pink-500 text-white' : themeClasses.inactiveTab}`}>Mikser</button>
          <button onClick={() => setActiveTab('lyrics')} className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'lyrics' ? 'bg-pink-500 text-white' : themeClasses.inactiveTab}`}>Matn</button>
        </div>
      </header>

      {/* 1-TAB: ASOSIY PLEYER VA KATALOG */}
      {activeTab === 'player' && (
        <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-8 space-y-8 flex-1">

          {/* HERO NOW PLAYING BANNER */}
          <div className={`${themeClasses.card} rounded-3xl p-6 sm:p-10 border relative overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-xl`}>
            {/* Vinil aylanuvchi disk */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0 flex items-center justify-center">
              <div className={`w-full h-full rounded-full border-4 border-slate-800 shadow-2xl overflow-hidden animate-vinyl ${!isPlaying && 'paused'}`}>
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute w-12 h-12 rounded-full bg-slate-900 border-2 border-white/40 flex items-center justify-center shadow-lg">
                <Disc3 className="w-5 h-5 text-pink-500" />
              </div>
            </div>

            {/* Trek ma'lumotlari va mini spektr */}
            <div className="flex-1 text-center md:text-left space-y-3 z-10">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-500 text-xs font-bold border border-pink-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{currentTrack.genre} • {currentTrack.bpm || 120} BPM</span>
                </div>

                {currentTrack.isFull ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30">
                    <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
                    <span>To'liq Qo'shiq (Full Version)</span>
                  </div>
                ) : (
                  <button
                    onClick={handleUpgradeToFullSong}
                    disabled={isUpgradingFull}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    {isUpgradingFull ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>To'liq audio yuklanmoqda...</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span>To'liq Versiyaga O'tish (Full 3-5 min)</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {currentTrack.title}
              </h1>

              <p className={`text-sm sm:text-base font-semibold ${themeClasses.textMuted}`}>
                {currentTrack.artist} • <span className="text-pink-400">{currentTrack.album}</span>
              </p>

              {/* Mini visualizer chizig'i */}
              <div className="h-16 w-full max-w-md pt-2">
                <AudioVisualizer isPlaying={isPlaying} mode={visualizerMode} isDark={isDark} />
              </div>

              {/* Tezkor boshqaruv tugmalari */}
              <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                <button
                  onClick={togglePlay}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-extrabold text-sm shadow-lg shadow-pink-500/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlaying ? 'Pauza' : 'Tinglash'}</span>
                </button>

                <button
                  onClick={() => toggleFavorite(currentTrack)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    currentTrack.isFavorite ? 'bg-rose-500/15 border-rose-500/30 text-rose-500' : 'border-inherit text-slate-400'
                  }`}
                  title="Sevimlilarga qo'shish"
                >
                  <Heart className={`w-5 h-5 ${currentTrack.isFavorite ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={() => setActiveTab('search')}
                  className="px-4 py-3 rounded-2xl border border-inherit text-xs font-bold flex items-center gap-2 hover:bg-purple-500/10 hover:text-purple-400 transition-colors cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>Internetdan Qidirish</span>
                </button>
              </div>
            </div>

            {/* Orqa fon gradient nuri */}
            <div className="absolute right-[-10%] top-[-20%] w-96 h-96 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* QIDIRUV VA JANR FILTRLARI */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Janr teglari */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {genres.map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                      selectedGenre === g
                        ? 'bg-pink-500 text-white border-pink-400 shadow-sm'
                        : isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {g === 'all' ? 'Barcha Musiqalar' : g === 'favorites' ? '❤️ Sevimlilar' : g}
                  </button>
                ))}
              </div>

              {/* Qidiruv */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Katalogdan qidirish..."
                  className={`w-full py-2 pl-9 pr-3 text-xs rounded-xl border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-pink-500' : 'bg-white border-slate-300 text-slate-900 focus:border-pink-500 shadow-xs'
                  }`}
                />
              </div>
            </div>

            {/* TREKLAR RO'YXATI */}
            <div className={`${themeClasses.card} rounded-3xl border overflow-hidden`}>
              <div className="divide-y divide-inherit">
                {filteredTracks.map((track, idx) => {
                  const isCurrent = track.id === currentTrack.id;

                  return (
                    <div
                      key={track.id}
                      onClick={() => handleSelectTrackToPlay(track)}
                      className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition-all ${
                        isCurrent
                          ? isDark ? 'bg-pink-500/10 border-l-4 border-l-pink-500' : 'bg-pink-50 border-l-4 border-l-pink-500'
                          : 'hover:bg-slate-500/5'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className={`text-xs font-mono font-bold w-5 text-center ${isCurrent ? 'text-pink-500' : themeClasses.textMuted}`}>
                          {idx + 1}
                        </span>

                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-xs"
                        />

                        <div className="min-w-0">
                          <h4 className={`font-bold text-sm truncate ${isCurrent ? 'text-pink-500' : ''}`}>
                            {track.title}
                          </h4>
                          <p className={`text-xs truncate ${themeClasses.textMuted}`}>
                            {track.artist} • <span className="opacity-80">{track.album}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        {track.isFull && (
                          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold text-[10px]">
                            Full Song
                          </span>
                        )}

                        <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 font-bold text-[11px]">
                          {track.genre}
                        </span>

                        <span className={`font-mono ${themeClasses.textMuted}`}>
                          {formatTime(track.duration)}
                        </span>

                        <button
                          onClick={(e) => toggleFavorite(track, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <Heart className={`w-4 h-4 ${track.isFavorite ? 'text-rose-500 fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 2-TAB: INTERNET QIDIRUV (ONLINE SEARCH) */}
      {activeTab === 'search' && (
        <main className="max-w-6xl mx-auto w-full px-4 lg:px-8 py-8 flex-1">
          <OnlineSearch
            onPlayTrack={handleSelectTrackToPlay}
            currentTrackId={currentTrack.id}
            isPlaying={isPlaying}
            onToggleFavorite={toggleFavorite}
            isDark={isDark}
          />
        </main>
      )}

      {/* 3-TAB: TARIX (HISTORY) */}
      {activeTab === 'history' && (
        <main className="max-w-5xl mx-auto w-full px-4 lg:px-8 py-8 flex-1">
          <HistoryView
            user={user}
            onOpenAuth={() => { setAuthModalMode('login'); setIsAuthModalOpen(true); }}
            onPlayTrack={handleSelectTrackToPlay}
            isDark={isDark}
          />
        </main>
      )}

      {/* 4-TAB: SEVIMLILAR (FAVORITES) */}
      {activeTab === 'favorites' && (
        <main className="max-w-5xl mx-auto w-full px-4 lg:px-8 py-8 flex-1">
          <FavoritesView
            user={user}
            onOpenAuth={() => { setAuthModalMode('login'); setIsAuthModalOpen(true); }}
            onPlayTrack={handleSelectTrackToPlay}
            onToggleFavorite={toggleFavorite}
            isDark={isDark}
          />
        </main>
      )}

      {/* 5-TAB: TO'LIQ SPEKTR VIZUALAYZER */}
      {activeTab === 'visualizer' && (
        <main className="max-w-5xl mx-auto w-full px-4 lg:px-8 py-8 space-y-6 flex-1">
          <div className={`${themeClasses.card} rounded-3xl p-6 sm:p-10 border space-y-6 text-center`}>
            <div className="flex items-center justify-between border-b border-inherit pb-4">
              <div className="text-left">
                <h2 className="text-xl font-extrabold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-pink-500" />
                  <span>Real-Vaqtli Web Audio Spektrogrammasi</span>
                </h2>
                <p className={`text-xs ${themeClasses.textMuted}`}>
                  {currentTrack.title} — {currentTrack.artist} ({currentTrack.bpm || 120} BPM)
                </p>
              </div>

              {/* Rejimlar: Bars, Wave, Pulse */}
              <div className={`flex p-1 rounded-xl border text-xs font-bold ${themeClasses.panelBg}`}>
                {(['bars', 'wave', 'pulse'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setVisualizerMode(m)}
                    className={`px-3 py-1 rounded-lg uppercase transition-all cursor-pointer ${
                      visualizerMode === m ? 'bg-pink-500 text-white shadow-xs' : themeClasses.textMuted
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Katta Canvas Visualizer maydoni */}
            <div className="h-72 w-full rounded-2xl bg-black/40 border border-slate-800 p-4 relative overflow-hidden flex items-center justify-center">
              <AudioVisualizer isPlaying={isPlaying} mode={visualizerMode} isDark={isDark} />
            </div>

            <div className="flex justify-center items-center gap-4">
              <button
                onClick={togglePlay}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-sm shadow-lg shadow-pink-500/30 flex items-center gap-2 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'Pauza' : 'Vizualizatsiyani Yoqish'}</span>
              </button>
            </div>
          </div>
        </main>
      )}

      {/* 6-TAB: FOKUS & AMBIENT MIKSER */}
      {activeTab === 'ambient' && (
        <main className="max-w-4xl mx-auto w-full px-4 lg:px-8 py-8 space-y-6 flex-1">
          <div className={`${themeClasses.card} rounded-3xl p-6 sm:p-10 border space-y-6`}>
            <div className="text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-3">
                <CloudRain className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold">Dasturchilar Uchun Fokus Tovushlar</h2>
              <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                Musiqa bilan birga fon yomg'iri, kamin olovi yoki qahvaxona shovqinini mikser qiling.
              </p>
            </div>

            {/* Tovushlar slayderlari */}
            <div className="space-y-4">
              {ambientSounds.map(snd => (
                <div
                  key={snd.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                    snd.isPlaying ? 'border-purple-500/40 bg-purple-500/5' : 'border-inherit'
                  }`}
                >
                  <div className="flex items-center gap-3 w-40">
                    <span className="text-2xl">{snd.icon}</span>
                    <span className="font-bold text-sm">{snd.name}</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={snd.volume}
                    onChange={(e) => updateAmbientVolume(snd.id, Number(e.target.value))}
                    className="flex-1 accent-purple-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />

                  <span className="text-xs font-mono font-bold w-12 text-right">
                    {snd.volume}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* 7-TAB: MATN (LYRICS) */}
      {activeTab === 'lyrics' && (
        <main className="max-w-2xl mx-auto w-full px-4 lg:px-8 py-8 space-y-6 flex-1">
          <div className={`${themeClasses.card} rounded-3xl p-8 border text-center space-y-6`}>
            <div>
              <h2 className="text-2xl font-extrabold">{currentTrack.title}</h2>
              <p className={`text-sm ${themeClasses.textMuted}`}>{currentTrack.artist}</p>
            </div>

            <div className="space-y-4 py-4 text-sm font-medium leading-relaxed">
              {currentTrack.lyrics?.map((line, idx) => (
                <p
                  key={idx}
                  className={`p-3 rounded-xl transition-all ${
                    idx === 1
                      ? 'bg-pink-500/10 text-pink-500 font-extrabold text-base scale-105'
                      : 'text-slate-400'
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* DOIMIY PASTKI PLEYER (FIXED BOTTOM PLAYER BAR) */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 border-t px-4 lg:px-8 py-3.5 backdrop-blur-xl transition-all ${themeClasses.playerBar}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">

          {/* Hozir ijro etilayotgan trek */}
          <div className="flex items-center gap-3 w-full md:w-72">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className={`w-12 h-12 rounded-xl object-cover shrink-0 shadow-md ${isPlaying && 'animate-pulse'}`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-xs sm:text-sm truncate">{currentTrack.title}</h4>
                {currentTrack.isFull && (
                  <span title="To'liq Qo'shiq (Full)">
                    <Flame className="w-3.5 h-3.5 text-amber-400 fill-current shrink-0" />
                  </span>
                )}
              </div>
              <p className={`text-[11px] truncate ${themeClasses.textMuted}`}>{currentTrack.artist}</p>
            </div>
            <button
              onClick={() => toggleFavorite(currentTrack)}
              className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${currentTrack.isFavorite ? 'text-rose-500 fill-current' : ''}`} />
            </button>
          </div>

          {/* Boshqaruv tugmalari va Seeker */}
          <div className="flex-1 max-w-xl w-full flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-1.5 transition-colors cursor-pointer ${isShuffle ? 'text-pink-500' : 'text-slate-400'}`}
                title="Tasodifiy (Shuffle)"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handlePrevTrack}
                className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-pink-500/25 transition-transform cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={handleNextTrack}
                className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={() => setIsLoop(!isLoop)}
                className={`p-1.5 transition-colors cursor-pointer ${isLoop ? 'text-pink-500' : 'text-slate-400'}`}
                title="Qaytarish (Loop)"
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="w-full flex items-center gap-3 text-[11px] font-mono">
              <span className={themeClasses.textMuted}>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={currentTrack.duration || 30}
                value={currentTime}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentTime(val);
                  if (audioElRef.current && currentTrack.audioUrl) {
                    audioElRef.current.currentTime = val;
                  }
                }}
                className="flex-1 accent-pink-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer"
              />
              <span className={themeClasses.textMuted}>{formatTime(currentTrack.duration || 30)}</span>
            </div>
          </div>

          {/* Ovoz balandligi */}
          <div className="hidden md:flex items-center gap-2.5 w-44 justify-end">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-400 hover:text-pink-500 transition-colors cursor-pointer"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
              className="w-24 accent-pink-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(newUser) => {
          setUser(newUser);
        }}
        isDark={isDark}
        initialMode={authModalMode}
      />
    </div>
  );
}
