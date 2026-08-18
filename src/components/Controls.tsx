'use client';

import React from 'react';
import { EngineStatus } from '@/types/breathing';
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, Sliders, Minimize2, BarChart3, HelpCircle } from 'lucide-react';

interface ControlsProps {
  status: EngineStatus;
  onTogglePlay: () => void;
  onReset: () => void;
  onNextPhase: () => void;
  onOpenPresets: () => void;
  onOpenStats: () => void;
  onOpenHelp: () => void;
  onToggleMini: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAudioSettings: () => void;
}

export function Controls({
  status,
  onTogglePlay,
  onReset,
  onNextPhase,
  onOpenPresets,
  onOpenStats,
  onOpenHelp,
  onToggleMini,
  soundEnabled,
  onToggleSound,
  onOpenAudioSettings,
}: ControlsProps) {
  const isRunning = status === 'running';

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xl">
      {/* Primary Action Control Bar */}
      <div className="flex items-center justify-center gap-3 md:gap-4 p-2.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl">
        {/* Reset Button */}
        <button
          onClick={onReset}
          title="Reset session [R]"
          aria-label="Reset session"
          className="group relative p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all active:scale-95 border border-white/5"
        >
          <RotateCcw className="w-5 h-5 transition-transform group-hover:-rotate-45" />
          <span className="sr-only">Reset</span>
          <span className="hidden group-hover:block absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-800 border border-white/10 text-[10px] font-mono text-slate-300 pointer-events-none whitespace-nowrap shadow-lg">
            Reset (R)
          </span>
        </button>

        {/* Start / Pause Main Action Button */}
        <button
          onClick={onTogglePlay}
          title={isRunning ? 'Pause [Space]' : 'Start [Space]'}
          aria-label={isRunning ? 'Pause' : 'Start'}
          className={`group relative flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base md:text-lg transition-all transform active:scale-95 shadow-xl ${
            isRunning
              ? 'bg-amber-500/90 hover:bg-amber-500 text-slate-950 shadow-amber-500/20'
              : 'bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-cyan-500/25 ring-2 ring-cyan-400/30'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-6 h-6 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6 fill-current ml-0.5" />
              <span>{status === 'paused' ? 'Resume' : 'Begin'}</span>
            </>
          )}
          <span className="hidden group-hover:block absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-800 border border-white/10 text-[10px] font-mono text-slate-300 pointer-events-none whitespace-nowrap shadow-lg">
            Space
          </span>
        </button>

        {/* Skip to Next Phase Button */}
        <button
          onClick={onNextPhase}
          title="Skip to next phase [N or →]"
          aria-label="Skip to next phase"
          className="group relative p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all active:scale-95 border border-white/5"
        >
          <SkipForward className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          <span className="sr-only">Next Phase</span>
          <span className="hidden group-hover:block absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-800 border border-white/10 text-[10px] font-mono text-slate-300 pointer-events-none whitespace-nowrap shadow-lg">
            Next Phase (N)
          </span>
        </button>
      </div>

      {/* Secondary Desktop Utility Bar */}
      <div className="flex items-center justify-center flex-wrap gap-2 text-xs text-slate-400">
        {/* Presets & Builder Button */}
        <button
          onClick={onOpenPresets}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-white/10 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Presets & Builder</span>
        </button>

        {/* Audio Toggle & Settings */}
        <div className="flex items-center rounded-lg bg-slate-900/60 border border-white/10 overflow-hidden">
          <button
            onClick={onToggleSound}
            title="Toggle Sound [S]"
            className={`flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-800/80 transition-colors ${
              soundEnabled ? 'text-cyan-400' : 'text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>
          <button
            onClick={onOpenAudioSettings}
            title="Audio Configuration"
            className="px-2 py-1.5 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border-l border-white/10 text-[11px]"
          >
            ⚙️
          </button>
        </div>

        {/* Mini Mode Toggle */}
        <button
          onClick={onToggleMini}
          title="Compact Mini Mode [M]"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-white/10 transition-colors"
        >
          <Minimize2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Mini Mode (M)</span>
        </button>

        {/* Stats Modal */}
        <button
          onClick={onOpenStats}
          title="Session & Streak Stats"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-white/10 transition-colors"
        >
          <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Stats</span>
        </button>

        {/* Keybind Help */}
        <button
          onClick={onOpenHelp}
          title="Keyboard shortcuts [?]"
          className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-white/10 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span className="sr-only">Keybinds</span>
        </button>
      </div>
    </div>
  );
}
