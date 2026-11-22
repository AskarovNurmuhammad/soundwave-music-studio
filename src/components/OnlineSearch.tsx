import React, { useState, useEffect } from 'react';
import { Search, Play, Pause, Heart, Sparkles, Music2, Loader2, Disc, Flame } from 'lucide-react';
import { searchTracks, fetchTrendingTracks, fetchFullAudio } from '../api';
import type { Track } from '../types';

interface OnlineSearchProps {
  onPlayTrack: (track: Track) => void;
  currentTrackId?: string;
  isPlaying: boolean;
  onToggleFavorite: (track: Track) => void;
  isDark: boolean;
}

const POPULAR_QUERIES = [
  'Billie Eilish',
  'The Weeknd',
  'Eminem',
  'Xamdam Sobirov',
  'Konsta',
  'Alan Walker',
  'Imagine Dragons',
  'Synthwave',
  'Lo-Fi Study'
];

export default function OnlineSearch({
  onPlayTrack,
  currentTrackId,
  isPlaying,
  onToggleFavorite,
  isDark
}: OnlineSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFullId, setLoadingFullId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Load trending songs initially
  useEffect(() => {
    let mounted = true;
    fetchTrendingTracks()
      .then(data => {
        if (mounted && data.results) {
          setTrending(data.results);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const handleSearch = async (term?: string) => {
    const q = term !== undefined ? term : query;
    if (!q.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const data = await searchTracks(q.trim());
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayFullSong = async (item: any) => {
    setLoadingFullId(item.id);
    try {
      const fullData = await fetchFullAudio(`${item.title} ${item.artist}`);
      const mappedTrack: Track = {
        id: item.id,
        title: item.title,
        artist: item.artist,
        album: item.album || 'Full Track',
        duration: fullData.duration || 210,
        coverUrl: item.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
        genre: item.genre || 'Pop',
        bpm: 120,
        lyrics: [
          `[00:00] ${item.title} — ${item.artist}`,
          `[00:10] To'liq versiya (Full Song Edition) faol!`,
          `[00:30] Real-vaqtli Web Audio Spektri ishlamoqda.`
        ],
        isFavorite: false,
        audioUrl: fullData.audioUrl,
        isOnline: true,
        isFull: true
      };
      onPlayTrack(mappedTrack);
    } catch (err) {
      alert("To'liq audio yuklashda xatolik yuz berdi, qisqa versiyasi yoqiladi.");
      // Fallback to preview
      handlePlayPreview(item);
    } finally {
      setLoadingFullId(null);
    }
  };

  const handlePlayPreview = (item: any) => {
    const mappedTrack: Track = {
      id: item.id,
      title: item.title,
      artist: item.artist,
      album: item.album || 'Single',
      duration: item.duration || 30,
      coverUrl: item.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
      genre: item.genre || 'Pop',
      bpm: 120,
      lyrics: [
        `[00:00] ${item.title} — ${item.artist}`,
        `[00:05] Audio oqim: Original Master Stream`,
        `[00:15] To'liq versiyani eshitish uchun 'To'liq (Full)' tugmasini bosing!`
      ],
      isFavorite: false,
      audioUrl: item.audioUrl,
      isOnline: true,
      isFull: false
    };
    onPlayTrack(mappedTrack);
  };

  const formatDuration = (sec?: number) => {
    if (!sec) return '0:30';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const displayedList = hasSearched ? results : trending;

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden ${
        isDark ? 'bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 border-purple-500/20' : 'bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border-purple-200'
      }`}>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 text-xs font-bold border border-purple-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>To'liq Musiqalar & Real-Time Audio Qidiruv</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Istalgan Qo'shiqni To'liq (Full 3-5 daqiqa) Tinglang
          </h2>
          <p className={`text-xs sm:text-sm mt-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Dunyo va o'zbek estradasi yulduzlarining asl to'liq kompozitsiyalari, original audio oqimlari va jonli vizualizatsiya.
          </p>

          {/* Search Input Box */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="mt-5 flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Masalan: Billie Eilish, Eminem, Xamdam Sobirov..."
                className={`w-full py-3 pl-11 pr-4 text-xs sm:text-sm rounded-2xl border outline-none shadow-sm transition-all ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-700 text-white focus:border-purple-500'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-purple-500'
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-purple-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="hidden sm:inline">Qidirish</span>
            </button>
          </form>

          {/* Quick Search Tags */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Mashhur ijrochilar:
            </span>
            {POPULAR_QUERIES.map(chip => (
              <button
                key={chip}
                onClick={() => { setQuery(chip); handleSearch(chip); }}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-purple-500 hover:text-white'
                    : 'bg-white/80 border-slate-200 text-slate-700 hover:border-purple-500 hover:text-purple-600'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Disc className="w-5 h-5 text-purple-500" />
          <h3 className="font-extrabold text-lg">
            {hasSearched ? `Qidiruv natijalari (${results.length})` : `Hozirgi Trend Musiqalar (${trending.length})`}
          </h3>
        </div>
        {hasSearched && (
          <button
            onClick={() => { setHasSearched(false); setQuery(''); }}
            className="text-xs font-bold text-purple-500 hover:underline cursor-pointer"
          >
            Trend musiqalarga qaytish
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-400">Internetdan qo'shiqlar qidirilmoqda...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && hasSearched && results.length === 0 && (
        <div className={`p-12 rounded-3xl border text-center space-y-3 ${
          isDark ? 'bg-[#121826] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <Music2 className="w-10 h-10 text-slate-500 mx-auto opacity-50" />
          <h4 className="font-bold text-base">Hech narsa topilmadi</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Boshqa ijrochi yoki qo'shiq nomini yozib ko'ring (masalan: "Eminem", "Billie Eilish", "Xamdam Sobirov").
          </p>
        </div>
      )}

      {/* Grid of Tracks */}
      {!loading && displayedList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedList.map((item) => {
            const isThisPlaying = isPlaying && currentTrackId === item.id;
            const isFetchingFull = loadingFullId === item.id;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 group ${
                  isThisPlaying
                    ? isDark ? 'bg-purple-900/20 border-purple-500/50 shadow-md shadow-purple-500/10' : 'bg-purple-50 border-purple-300 shadow-xs'
                    : isDark ? 'bg-[#121826] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-purple-200 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Cover with Play Overlay */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-xs">
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <button
                      onClick={() => handlePlayPreview(item)}
                      className="absolute inset-0 bg-black/40 hover:bg-black/50 flex items-center justify-center text-white transition-opacity cursor-pointer"
                      title="Tezkor tinglash"
                    >
                      {isThisPlaying ? (
                        <Pause className="w-5 h-5 fill-current text-pink-400" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
                      )}
                    </button>
                  </div>

                  {/* Track Details */}
                  <div className="min-w-0 flex-1">
                    <h4 className={`font-bold text-xs sm:text-sm truncate ${isThisPlaying ? 'text-purple-400' : ''}`}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {item.artist}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 font-semibold truncate max-w-[100px]">
                        {item.genre}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {formatDuration(item.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={() => onToggleFavorite({
                      id: item.id,
                      title: item.title,
                      artist: item.artist,
                      album: item.album || 'Single',
                      duration: item.duration || 30,
                      coverUrl: item.coverUrl,
                      genre: item.genre || 'Pop',
                      bpm: 120,
                      lyrics: [],
                      isFavorite: false,
                      audioUrl: item.audioUrl,
                      isOnline: true
                    })}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer self-start"
                    title="Sevimlilarga qo'shish"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                {/* Full Track Trigger Button */}
                <div className="pt-2 border-t border-inherit flex items-center justify-between gap-2">
                  <button
                    onClick={() => handlePlayFullSong(item)}
                    disabled={isFetchingFull}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-600/90 to-pink-600/90 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isFetchingFull ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>To'liq audio yuklanmoqda...</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-3.5 h-3.5 text-amber-300 fill-current" />
                        <span>To'liq Qo'shiq (Full 3-5 min)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
