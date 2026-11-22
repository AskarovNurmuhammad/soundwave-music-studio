import React, { useState, useEffect } from 'react';
import { Heart, Play, Music, LogIn } from 'lucide-react';
import { fetchFavorites } from '../api';
import type { FavoriteItem, Track, User } from '../types';

interface FavoritesViewProps {
  user: User | null;
  onOpenAuth: () => void;
  onPlayTrack: (track: Track) => void;
  onToggleFavorite: (track: Track) => void;
  isDark: boolean;
}

export default function FavoritesView({ user, onOpenAuth, onPlayTrack, onToggleFavorite, isDark }: FavoritesViewProps) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFavorites = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchFavorites();
      setFavorites(data.favorites || []);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  if (!user) {
    return (
      <div className={`p-10 rounded-3xl border text-center space-y-4 max-w-lg mx-auto ${
        isDark ? 'bg-[#121826] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <Heart className="w-7 h-7 fill-current" />
        </div>
        <h3 className="text-xl font-extrabold">Sevimli Qo'shiqlar Ro'yxati</h3>
        <p className="text-xs text-slate-400">
          Yoqtirgan qo'shiqlaringizni har qanday qurilmada saqlab qolish uchun profilingizga kiring.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-extrabold text-xs shadow-md shadow-pink-500/25 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Kirish / Ro'yxatdan O'tish</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-current" />
            <span>Sevimlilar ({favorites.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {user.username} tomonidan saqlangan eng sevimli audio kompozitsiyalar.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Sevimlilar yuklanmoqda...</div>
      ) : favorites.length === 0 ? (
        <div className={`p-10 rounded-3xl border text-center space-y-3 ${
          isDark ? 'bg-[#121826] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <Music className="w-10 h-10 text-slate-500 mx-auto opacity-40" />
          <h4 className="font-bold text-base">Hozircha sevimlilar ro'yxati bo'sh</h4>
          <p className="text-xs text-slate-400">
            Qo'shiqlardagi yurakcha belgisini bosish orqali ularni sevimlilarga qo'shing.
          </p>
        </div>
      ) : (
        <div className={`rounded-3xl border overflow-hidden ${
          isDark ? 'bg-[#121826] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="divide-y divide-inherit">
            {favorites.map((item, idx) => {
              const mappedTrack: Track = {
                id: item.id,
                title: item.title,
                artist: item.artist,
                album: 'Sevimlilar',
                duration: item.duration || 30,
                coverUrl: item.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
                genre: item.genre || 'Favorite',
                bpm: 120,
                lyrics: [`[00:00] ${item.title} — ${item.artist}`],
                isFavorite: true,
                audioUrl: item.audioUrl,
                isOnline: Boolean(item.audioUrl)
              };

              return (
                <div
                  key={item.favId}
                  onClick={() => onPlayTrack(mappedTrack)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-rose-500/5 transition-colors group"
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
                      <h4 className="font-bold text-sm truncate group-hover:text-rose-500 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">
                        {item.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(mappedTrack);
                        setFavorites(prev => prev.filter(f => f.id !== item.id));
                      }}
                      className="p-2 text-rose-500 hover:scale-110 transition-transform cursor-pointer"
                      title="Sevimlilardan o'chirish"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
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
