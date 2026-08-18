# 🫁 Desk Health — Precision Guided Breathing & Autonomic Pacer

> **Live Application**: [https://health.meetdev.in](https://health.meetdev.in)  
> **Repository**: [https://github.com/OneWeekendAI/health](https://github.com/OneWeekendAI/health)

A desktop-focused, distraction-free guided breathing application designed for founders, developers, and builders who spend long hours sitting at their desk. Engineered with sub-millisecond clock accuracy, biological visual pacing, anatomical airflow directives, hands-free voice commands, and a multitasking corner mini mode.

---

## 🌟 Key Features

### 1. High-Precision Timing Engine
- Built with `performance.now()` and a continuous `requestAnimationFrame` loop.
- **Zero background tab drift**: Unlike standard `setInterval` timers that throttle when tabs lose focus, the clock maintains true physical millisecond synchronization.
- **Seamless Phase Skipping**: Automatically skips 0-second breath retention phases without visual glitching or freezing.

### 2. Hands-Free Voice Control (Web Speech API)
- Control your breathwork session without opening your eyes or touching the keyboard.
- **Always-On Engine**: Automatically revives and ignores harmless silence timeouts until explicitly turned off.
- **Supported Spoken Commands**:
  - **Session**: `"Start"`, `"Begin"`, `"Breathe"`, `"Pause"`, `"Stop"`, `"Reset"`, `"Restart"`, `"Next"`
  - **Presets**: `"Box"`, `"Relax"` / `"4-7-8"`, `"Coherent"` / `"Resonant"`, `"Sigh"`
  - **Modes**: `"Mini"`, `"Expand"` / `"Fullscreen"`, `"Mute"`, `"Unmute"`
- Toggle voice listening anytime with <kbd>V</kbd>.

### 3. Biological Visual Pacer & Aura
- Center bio-luminescent orb that expands during **Inhale**, holds steady during **Top Retention**, contracts during **Exhale**, and rests during **Bottom Retention**.
- Synchronized mathematical easing (`easeInOutCubic`) matching exact phase durations.
- Concentric fullness capacity guides and drifting canvas particle constellation.

### 4. High-Contrast Anatomical Guidance
- High-contrast visual cards explicitly directing airflow channel:
  - **Inhale**: `Inhale (Nose)` with animated intake arrows and diaphragm guidance.
  - **Top Hold**: `Hold breath` with full lung retention cue.
  - **Exhale**: `Exhale (Mouth)` or `Exhale (Nose)` with directional outflow arrows.
  - **Bottom Hold**: `Hold breath` with empty lung stillness cue.
- Live fractional digital countdown with remaining seconds and cycle progress dots.

### 5. Scientifically Proven Presets & Custom Builder
- **Box Breathing (Navy SEAL focus & stress reset)**: 4s Inhale (Nose) | 4s Hold | 4s Exhale (Mouth) | 4s Hold
- **4-7-8 Relax (Dr. Andrew Weil insomnia & deep calm)**: 4s Inhale (Nose) | 7s Hold | 8s Exhale (Mouth) | 0s Hold
- **Coherent / Resonant (Heart Rate Variability balance)**: 5.5s Inhale (Nose) | 0s Hold | 5.5s Exhale (Nose) | 0s Hold
- **Physiological Sigh (Dr. Andrew Huberman protocol)**: 3.5s Inhale (Nose) | 1s Hold | 6s Exhale (Mouth) | 1s Hold
- **Custom Duration Builder**: Sliders for Inhale (1–15s), Top Hold (0–20s), Exhale (1–20s), Bottom Hold (0–20s), Exhale channel, and cycle target counts.

### 6. Multitasking Corner Mini Mode
- Compact, floating glassmorphic widget (`backdrop-blur-2xl`) docked in the bottom-right corner.
- Allows you to maintain rhythmic paced breathing while coding, reading docs, or multitasking.
- Toggle with <kbd>M</kbd> or voice command `"Mini"`, and restore with <kbd>Esc</kbd>.

### 7. Web Audio API Ambient Soundscape
- Zero-latency procedural sound generation for Tibetan singing bowls, temple bells, zen plucks, and pure sine tones on phase transitions.
- Dynamic harmonic sub-bass drone that gently swells and recedes with lung expansion.

---

## ⌨️ Desktop Keyboard & Voice Shortcuts

| Key / Voice Command | Action |
| :--- | :--- |
| <kbd>Space</kbd> / `"Start"`, `"Pause"` | Start, Pause, or Resume breathing session |
| <kbd>R</kbd> / `"Reset"` | Reset session to cycle 1 Inhale |
| <kbd>N</kbd> or <kbd>→</kbd> / `"Next"` | Skip immediately to next phase |
| <kbd>V</kbd> | Toggle hands-free voice command listening |
| <kbd>M</kbd> / `"Mini"` | Toggle compact multitasking Mini Mode |
| <kbd>S</kbd> / `"Mute"`, `"Unmute"` | Toggle audio chimes on / off |
| <kbd>Esc</kbd> / `"Expand"` | Exit Mini Mode or close active modals |
| <kbd>?</kbd> | Open keyboard shortcuts help modal |

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router, Static Export)
- **Library**: [React 19](https://react.dev)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + Vanilla CSS Glassmorphism
- **Audio Engine**: Native [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- **Voice Engine**: Native [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- **Icons**: [Lucide React](https://lucide.dev)
- **Hosting**: [Cloudflare Pages](https://pages.cloudflare.com)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+
- npm / pnpm / yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/OneWeekendAI/health.git
cd health

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Static Export
```bash
npm run build
```
Generates the static distribution bundle in the `out/` directory.

### Deploying to Cloudflare Pages
```bash
npx wrangler pages deploy out --project-name health
```

---

## 📄 License
MIT License. Built for builders who sit long hours.
