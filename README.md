# 🎵 SoundWave Studio Pro (Full-Stack Edition)

A high-performance **Full-Stack Web Audio Player, Online Music Search & Real-Time Spectrum Visualizer** built with **FastAPI (Python)** backend, **SQLite** database, **React 19 + TypeScript (TSX)**, **Tailwind CSS v4**, and the native **HTML5 Web Audio API**.

![SoundWave Studio Banner](https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Features

### 🌐 1. Live Internet Music Search & Streaming
- Search **any artist or song in the world** in real-time (e.g., Billie Eilish, Eminem, The Weeknd, Xamdam Sobirov, Konsta, Alan Walker, Imagine Dragons).
- Fetches official high-res cover art (600x600), artist, album, duration, and direct high-quality audio streams.
- Plays directly in SoundWave Studio player with live Canvas Spectrum visualizer feedback!

### 👤 2. User Authentication & Multi-User Accounts
- User Registration and Login with encrypted password hashing (`SHA-256`) and bearer session tokens.
- Each user has their own private listening history and favorites database.
- Sleek interactive Auth Modal with instant login/register toggle and confetti celebrations.

### 🕒 3. Listening History ("Eshitilganlar Tarixi")
- Automatically logs every song played by the logged-in user into SQLite with timestamp and metadata.
- Human-friendly relative timestamps (e.g. *"Hozirgina"*, *"15 daqiqa oldin"*, *"2 soat oldin"*).
- One-click replay from history and "Tarixni Tozalash" (Clear History) functionality.

### ❤️ 4. Synced Favorites ("Sevimlilar")
- Bookmark and like tracks across the player, search results, or history.
- Stored permanently in user's profile in the SQLite backend.

### 📊 5. Real-Time Canvas Spectrum Visualizer
- 3 dynamic rendering modes:
  - **Neon Frequency Bars**: Glowing neon bars reacting to audio frequencies.
  - **Oscilloscope Wave**: Continuous glowing audio waveform.
  - **Radial Pulse**: Concentric pulsating circular visualizer.

### 🌧️ 6. Lo-Fi Ambient Nature Soundscape Mixer
- Layer focus sounds: Rain 🌧️, Campfire 🔥, Coffee Shop ☕, Forest Birds 🌲, White Noise 📻.
- Independent volume sliders for deep study and coding sessions.

### 🌓 7. Dual Themes & Accessibility
- High-contrast Dark Mode & clean Light Mode with zero washed-out elements.

---

## 🛠️ Tech Stack

- **Backend**:
  - Python 3.12+
  - [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous REST API)
  - [Uvicorn](https://www.uvicorn.org/) (ASGI Server)
  - [SQLite3](https://sqlite.org/) (Persistent Database)
  - Requests & Pydantic
- **Frontend**:
  - [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
  - [Vite 6](https://vitejs.dev/)
  - [Tailwind CSS v4](https://tailwindcss.com/)
  - [Lucide React](https://lucide.dev/)
  - [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Audio Engine**: Native HTML5 Web Audio API & HTML5 Audio Element

---

## 🚀 Quick Start (One-Click)

### Option A: One-Click Batch Launcher (Windows)
Double-click `run_fullstack.bat` in the project root:
```cmd
run_fullstack.bat
```
This automatically starts the FastAPI backend, starts the Vite frontend, and opens [http://localhost:5173](http://localhost:5173) in your browser!

### Option B: Manual Setup

1. **Start Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

2. **Start Frontend**:
   ```bash
   npm install
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173).

---

## 📄 License
MIT License — Created as part of the 30-Day Frontend & Full-Stack Challenge by [Nurmuhammad Askarov](https://github.com/AskarovNurmuhammad).
