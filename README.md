# 🎵 SoundWave Studio

A next-generation, high-performance **Web Audio Player & Real-Time Spectrum Visualizer** built with **React 19, TypeScript (TSX), Tailwind CSS**, and the native HTML5 **Web Audio API**.

![SoundWave Studio Banner](https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Key Features

- 🎧 **Interactive Web Audio Synthesizer & Player**: 
  - Dynamic procedural audio synthesis (ambient synth, lo-fi beats, chord pads, acoustic melodies, and energetic basslines) built entirely in Web Audio API.
  - Multi-track playlist with rich metadata (duration, BPM, genre, mood, lyrics, high-res covers).
- 📊 **Real-time Canvas Spectrum Visualizer**:
  - Three distinct rendering modes:
    - **Frequency Spectrum**: Glowing neon gradient bars reacting dynamically to real-time audio frequencies.
    - **Smooth Oscilloscope Waveform**: Continuous sinusoidal wave geometry with dynamic glow.
    - **Circular Energy Pulse**: Concentric radial frequency analyzer with rotational phase effects.
- 🌧️ **Ambient Background Soundscape Mixer**:
  - Layer simultaneous realistic soundscapes: Gentle Rain 🌧️, Cozy Campfire 🔥, Coffee Shop Chatter ☕, Forest Birds 🌲, and Ocean Waves 🌊.
  - Independent volume fader controls for each ambient layer for deep focus, studying, or relaxation.
- 🎛️ **Graphic Equalizer & Presets**:
  - 5-Band EQ (Bass, Low-Mid, Mid, High-Mid, Treble) with real-time gain adjustment.
  - One-click presets: Flat, Bass Boost, Vocal Enhance, Lo-Fi Chill, and Electronic Dance.
- 🎤 **Synchronized Interactive Lyrics Panel**:
  - Real-time lyric line tracking with synchronized auto-scrolling and timestamp clicking.
- 🌓 **High-Contrast Dark & Light Themes**:
  - Meticulously designed dual theme system with crisp borders, sleek glassmorphism, and zero washed-out elements.
- 🔍 **Fast Search & Genre Filtering**:
  - Instant filter by genre (Lo-Fi, Synthwave, Ambient, Chillhop, Electronic) and search by title, artist, or tags.
- 💾 **Favorites & Local Persistence**:
  - Save your favorite tracks locally with responsive mobile + desktop playback controls.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Sound Engine**: Native Web Audio API (`AudioContext`, `BiquadFilterNode`, `AnalyserNode`, `OscillatorNode`, `GainNode`)
- **Visuals**: HTML5 2D Canvas & Web Animations API
- **Effects**: `canvas-confetti`

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/AskarovNurmuhammad/soundwave-music-studio.git

# Navigate to project folder
cd soundwave-music-studio

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to start exploring SoundWave Studio!

### Production Build

```bash
# Build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🎹 Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` | Play / Pause current track |
| `N` / `Right Arrow` | Skip to next track |
| `P` / `Left Arrow` | Return to previous track |
| `M` | Mute / Unmute audio |
| `V` | Cycle visualizer rendering modes |
| `L` | Toggle lyrics modal |

---

## 📄 License

This project is licensed under the MIT License — feel free to use, modify, and build upon it!

---

*Part of the 30-Day Frontend & Full-Stack Challenge by [Nurmuhammad Askarov](https://github.com/AskarovNurmuhammad).*
