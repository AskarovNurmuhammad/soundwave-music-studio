import React, { useState, useEffect } from 'react';
import { Clock, Play, Trash2, History as HistoryIcon, Music, UserCheck, LogIn } from 'lucide-react';
import { fetchHistory, clearHistoryApi } from '../api';
import type { HistoryItem, Track, User } from '../types';

interface HistoryViewProps {
  user: User | null;
  onOpenAuth: () => void;
  onPlayTrack: (track: Track) => void;
  isDark: boolean;
}

export default function HistoryView({ user, onOpenAuth, onPlayTrack, isDark }: HistoryViewProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchHistory();
      setHistory(data.history || []);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const handleClearHistory = async () => {
    if (!window.confirm("Barcha eshitilgan qo'shiqlar tarixini tozalamoqchimisiz?")) return;
    try {
      await clearHistoryApi();
      setHistory([]);
    } catch {
      // ignore
    }
  };

  const formatPlayedAt = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Hozirgina';
      if (diffMins < 60) return `${diffMins} daqiqa oldin`;
      if (diffHours < 24) return `${diffHours} soat oldin`;
      return date.toLocaleDateString();
    } catch {
      return 'Yaqinda';
    }
  };

  if (!user) {
    return (
      <div className={`p-10 rounded-3xl border text-center space-y-4 max-w-lg mx-auto ${
        isDark ? 'bg-[#121826] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="w-14 h-14 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center mx-auto">
          <HistoryIcon className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-extrabold">Eshitish Tarixini Saqlash</h3>
        <p className="text-xs text-slate-400">
          Qaysi qo'shiqlarni qachon eshitganingizni saqlab borish uchun shaxsiy hisobingizga kiring.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-extrabold text-xs shadow-md shadow-pink-500/25 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Tizimga Kirish / Ro'yxatdan O'tish</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Clock className="w-5 h-5 text-pink-500" />
            <span>Eshitilgan Qo'shiqlar Tarixi</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {user.username} hisobida jami {history.length} ta eshitilgan audio yozuvi mavjud.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1.5 p-2 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Tarixni Tozalash</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Tarix yuklanmoqda...</div>
      ) : history.length === 0 ? (
        <div className={`p-10 rounded-3xl border text-center space-y-3 ${
          isDark ? 'bg-[#121826] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <Music className="w-10 h-10 text-slate-500 mx-auto opacity-40" />
          <h4 className="font-bold text-base">Hali hech qanday qo'shiq eshitilmadi</h4>
          <p className="text-xs text-slate-400">
            Pleyer yoki Internet qidiruv bo'limidan qo'shiq eshitsangiz, u shu yerda avtomatik saqlanadi.
          </p>
        </div>
      ) : (
        <div className={`rounded-3xl border overflow-hidden ${
          isDark ? 'bg-[#121826] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="divide-y divide-inherit">
            {history.map((item, idx) => {
              const mappedTrack: Track = {
                id: item.id,
                title: item.title,
                artist: item.artist,
                album: 'Tarixdan',
                duration: item.duration || 30,
                coverUrl: item.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
                genre: item.genre || 'Music',
                bpm: 120,
                lyrics: [`[00:00] ${item.title} — ${item.artist}`],
                isFavorite: false,
                audioUrl: item.audioUrl,
                isOnline: Boolean(item.audioUrl)
              };

              return (
                <div
                  key={item.historyId}
                  onClick={() => onPlayTrack(mappedTrack)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-pink-500/5 transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xs font-mono font-bold w-5 text-center text-slate-400">
                      {idx + 1}
                    </span>

                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-xs">
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-bold text-sm truncate group-hover:text-pink-500 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">
                        {item.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 font-semibold text-[11px] hidden sm:inline">
                      {item.genre}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {formatPlayedAt(item.playedAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
