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
  Sliders,
  Sparkles,
  Search,
  Sun,
  Moon,
  Disc3,
  CloudRain,
  Flame,
  Coffee,
  Trees,
  Radio,
  ListMusic,
  Activity,
  FileText,
  Clock,
  Maximize2
} from 'lucide-react';
import AudioVisualizer from './components/AudioVisualizer';
import type { Track, VisualizerMode, EqualizerPreset, AmbientSound } from './types';

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
    isFavorite: true
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
    isFavorite: true
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
    isFavorite: false
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
    isFavorite: false
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
    isFavorite: true
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
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isLoop, setIsLoop] = useState<boolean>(false);

  // Sozlamalar va ko'rinish
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('bars');
  const [equalizer, setEqualizer] = useState<EqualizerPreset>('Bass Boost');
  const [activeTab, setActiveTab] = useState<'player' | 'visualizer' | 'ambient' | 'lyrics'>('player');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Ambient fon tovushlari
  const [ambientSounds, setAmbientSounds] = useState<AmbientSound[]>(AMBIENT_SOUNDS);

  // Web Audio Sintetizator konteksti
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const isDark = theme === 'dark';
  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('sw_tracks', JSON.stringify(tracks));
  }, [tracks]);

  // Audio sintetizatorni boshqarish (Haqiqiy yoqimli Lo-Fi tonlar generatsiyasi)
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

      // Past chastotali yoqimli bas va akkord
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
      // Audio autoplay policy fallback
    }
  };

  // Play / Pause boshqaruvi
  const togglePlay = () => {
    if (!isPlaying) {
      initAudioEngine();
      playSynthesizerBeat();
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  // Trek vaqti hisoblagichi
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentTrack.duration) {
            handleNextTrack();
            return 0;
          }
          // Har 3 soniyada fon ritm pulsatsiyasi
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
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      setCurrentTrackIndex(randomIndex);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    }
    playSynthesizerBeat();
  };

  // Oldingi trek
  const handlePrevTrack = () => {
    setCurrentTime(0);
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    playSynthesizerBeat();
  };

  // Sevimlilarga qo'shish
  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTracks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextState = !t.isFavorite;
          if (nextState) confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
          return { ...t, isFavorite: nextState };
        }
        return t;
      })
    );
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

      {/* TOP HEADER */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 lg:px-8 py-3.5 transition-colors ${themeClasses.headerBg}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3">
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
              <p className={`text-[11px] font-medium hidden sm:block ${themeClasses.textMuted}`}>Next-Gen Audio & Lo-Fi Flow Experience</p>
            </div>
          </div>

          {/* Tablar */}
          <nav className={`hidden md:flex items-center gap-1 p-1 rounded-2xl border text-xs font-bold ${themeClasses.panelBg}`}>
            <button
              onClick={() => setActiveTab('player')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'player' ? themeClasses.activeTab : themeClasses.inactiveTab
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Pleyer</span>
            </button>
            <button
              onClick={() => setActiveTab('visualizer')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'visualizer' ? themeClasses.activeTab : themeClasses.inactiveTab
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Spektr Vizualayzer</span>
            </button>
            <button
              onClick={() => setActiveTab('ambient')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'ambient' ? themeClasses.activeTab : themeClasses.inactiveTab
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>Fokus Mikser</span>
            </button>
            <button
              onClick={() => setActiveTab('lyrics')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'lyrics' ? themeClasses.activeTab : themeClasses.inactiveTab
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Matn</span>
            </button>
          </nav>

          {/* O'ng tomon boshqaruvi */}
          <div className="flex items-center gap-2.5">
            {/* Equalizer preset */}
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

            {/* Tema almashtirish */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-xl border transition-all ${
                isDark ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobil Nav */}
        <div className="flex md:hidden items-center justify-between gap-1 pt-3 border-t border-inherit mt-2 text-xs font-bold">
          <button onClick={() => setActiveTab('player')} className={`flex-1 py-1.5 rounded-lg ${activeTab === 'player' ? 'bg-pink-500 text-white' : themeClasses.inactiveTab}`}>Pleyer</button>
          <button onClick={() => setActiveTab('visualizer')} className={`flex-1 py-1.5 rounded-lg ${activeTab === 'visualizer' ? 'bg-pink-500 text-white' : themeClasses.inactiveTab}`}>Vizual</button>
          <button onClick={() => setActiveTab('ambient')} className={`flex-1 py-1.5 rounded-lg ${activeTab === 'ambient' ? 'bg-pink-500 text-white' : themeClasses.inactiveTab}`}>Mikser</button>
          <button onClick={() => setActiveTab('lyrics')} className={`flex-1 py-1.5 rounded-lg ${activeTab === 'lyrics' ? 'bg-pink-500 text-white' : themeClasses.inactiveTab}`}>Matn</button>
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-500 text-xs font-bold border border-pink-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentTrack.genre} • {currentTrack.bpm} BPM</span>
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
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-extrabold text-sm shadow-lg shadow-pink-500/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlaying ? 'Pauza' : 'Tinglash'}</span>
                </button>

                <button
                  onClick={() => toggleFavorite(currentTrack.id)}
                  className={`p-3 rounded-2xl border transition-all ${
                    currentTrack.isFavorite ? 'bg-rose-500/15 border-rose-500/30 text-rose-500' : 'border-inherit text-slate-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${currentTrack.isFavorite ? 'fill-current' : ''}`} />
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
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
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
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Qo'shiq yoki ijrochi qidirish..."
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
                      onClick={() => {
                        setCurrentTrackIndex(tracks.findIndex(t => t.id === track.id));
                        setIsPlaying(true);
                        setCurrentTime(0);
                        playSynthesizerBeat();
                      }}
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
                        <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 font-bold text-[11px]">
                          {track.genre}
                        </span>

                        <span className={`font-mono ${themeClasses.textMuted}`}>
                          {formatTime(track.duration)}
                        </span>

                        <button
                          onClick={(e) => toggleFavorite(track.id, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
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

      {/* 2-TAB: TO'LIQ SPEKTR VIZUALAYZER */}
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
                  {currentTrack.title} — {currentTrack.artist} ({currentTrack.bpm} BPM)
                </p>
              </div>

              {/* Rejimlar: Bars, Wave, Pulse */}
              <div className={`flex p-1 rounded-xl border text-xs font-bold ${themeClasses.panelBg}`}>
                {(['bars', 'wave', 'pulse'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setVisualizerMode(m)}
                    className={`px-3 py-1 rounded-lg uppercase transition-all ${
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
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-sm shadow-lg shadow-pink-500/30 flex items-center gap-2"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'Pauza' : 'Vizualizatsiyani Yoqish'}</span>
              </button>
            </div>
          </div>
        </main>
      )}

      {/* 3-TAB: FOKUS & AMBIENT MIKSER */}
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

      {/* 4-TAB: MATN (LYRICS) */}
      {activeTab === 'lyrics' && (
        <main className="max-w-2xl mx-auto w-full px-4 lg:px-8 py-8 space-y-6 flex-1">
          <div className={`${themeClasses.card} rounded-3xl p-8 border text-center space-y-6`}>
            <div>
              <h2 className="text-2xl font-extrabold">{currentTrack.title}</h2>
              <p className={`text-sm ${themeClasses.textMuted}`}>{currentTrack.artist}</p>
            </div>

            <div className="space-y-4 py-4 text-sm font-medium leading-relaxed">
              {currentTrack.lyrics.map((line, idx) => (
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
          <div className="flex items-center gap-3 w-full md:w-64">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className={`w-12 h-12 rounded-xl object-cover shrink-0 shadow-md ${isPlaying && 'animate-pulse'}`}
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-xs sm:text-sm truncate">{currentTrack.title}</h4>
              <p className={`text-[11px] truncate ${themeClasses.textMuted}`}>{currentTrack.artist}</p>
            </div>
            <button
              onClick={() => toggleFavorite(currentTrack.id)}
              className="p-1.5 text-slate-400 hover:text-rose-500"
            >
              <Heart className={`w-4 h-4 ${currentTrack.isFavorite ? 'text-rose-500 fill-current' : ''}`} />
            </button>
          </div>

          {/* Boshqaruv tugmalari va Seeker */}
          <div className="flex-1 max-w-xl w-full flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-1.5 transition-colors ${isShuffle ? 'text-pink-500' : 'text-slate-400'}`}
                title="Tasodifiy (Shuffle)"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handlePrevTrack}
                className="p-2 text-slate-300 hover:text-white transition-colors"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-pink-500/25 transition-transform"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={handleNextTrack}
                className="p-2 text-slate-300 hover:text-white transition-colors"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={() => setIsLoop(!isLoop)}
                className={`p-1.5 transition-colors ${isLoop ? 'text-pink-500' : 'text-slate-400'}`}
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
                max={currentTrack.duration}
                value={currentTime}
                onChange={(e) => setCurrentTime(Number(e.target.value))}
                className="flex-1 accent-pink-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer"
              />
              <span className={themeClasses.textMuted}>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          {/* Ovoz balandligi */}
          <div className="hidden md:flex items-center gap-2.5 w-44 justify-end">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-400 hover:text-pink-500 transition-colors"
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
    </div>
  );
}
