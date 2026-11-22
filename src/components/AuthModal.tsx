import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { loginUser, registerUser, setAuthToken } from '../api';
import type { User } from '../types';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  isDark: boolean;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, onSuccess, isDark, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!username || !email || !password) {
          throw new Error('Barcha maydonlarni to\'ldiring');
        }
        const data = await registerUser(username, email, password);
        setAuthToken(data.token);
        localStorage.setItem('sw_user', JSON.stringify(data.user));
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        onSuccess(data.user);
        onClose();
      } else {
        if (!loginInput || !password) {
          throw new Error('Login va parolni kiriting');
        }
        const data = await loginUser(loginInput, password);
        setAuthToken(data.token);
        localStorage.setItem('sw_user', JSON.stringify(data.user));
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
        onSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDark ? 'bg-[#121826] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                {mode === 'login' ? 'Tizimga Kirish' : 'Yangi Hisob Ochish'}
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {mode === 'login' ? 'Tarixingiz va sevimli qo\'shiqlaringizni saqlang' : 'SoundWave Studio a\'zosi bo\'ling'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-4 pb-0">
          <div className={`grid grid-cols-2 p-1 rounded-2xl border text-xs font-bold ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`py-2 rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kirish
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`py-2 rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ro'yxatdan O'tish
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' ? (
            <>
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Foydalanuvchi nomi
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masalan: nurmuhammad"
                    className={`w-full py-2.5 pl-9 pr-3 text-xs rounded-xl border outline-none transition-all ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white focus:border-pink-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-pink-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Elektron pochta
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className={`w-full py-2.5 pl-9 pr-3 text-xs rounded-xl border outline-none transition-all ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white focus:border-pink-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-pink-500'
                    }`}
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Foydalanuvchi nomi yoki Email
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="Foydalanuvchi nomi yoki pochta"
                  className={`w-full py-2.5 pl-9 pr-3 text-xs rounded-xl border outline-none transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white focus:border-pink-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-pink-500'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Parol
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full py-2.5 pl-9 pr-3 text-xs rounded-xl border outline-none transition-all ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-pink-500'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-pink-500'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-extrabold shadow-lg shadow-pink-500/25 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Kutilmoqda...' : mode === 'login' ? 'Kirish' : 'Ro\'yxatdan o\'tish'}
          </button>
        </form>
      </div>
    </div>
  );
}
