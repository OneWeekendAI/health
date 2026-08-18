'use client';

import React from 'react';
import { SoundConfig } from '@/types/breathing';
import { X, Volume2, VolumeX, Music, Waves, Bell, Sparkles } from 'lucide-react';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SoundConfig;
  onUpdateConfig: (config: Partial<SoundConfig>) => void;
  onTestChime: () => void;
}

export function AudioSettingsModal({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onTestChime,
}: AudioSettingsModalProps) {
  if (!isOpen) return null;

  const soundOptions = [
    {
      id: 'singing_bowl',
      name: 'Tibetan Singing Bowl',
      desc: 'Harmonic bronze resonance with subtle vibrato',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'soft_bell',
      name: 'Temple Bell Chime',
      desc: 'Clear, crisp zen bell for immediate phase recognition',
      icon: <Bell className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'zen_harp',
      name: 'Acoustic Zen Pluck',
      desc: 'Warm harmonic chord progression per phase',
      icon: <Music className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'pure_sine',
      name: 'Minimal Pure Tone',
      desc: 'Gentle, zero-distraction soft sine wave',
      icon: <Waves className="w-4 h-4 text-indigo-400" />,
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audio-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/15 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-5 h-5 text-cyan-400" />
            <h2 id="audio-settings-title" className="text-lg font-bold text-white">
              Audio & Ambient Soundscape
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-sm">
          {/* Main Sound Master Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-white/10">
            <div>
              <span className="font-semibold text-white block">Phase Transition Chimes</span>
              <span className="text-xs text-slate-400">
                Auditory cue generated via Web Audio API on each breath phase
              </span>
            </div>
            <button
              onClick={() => onUpdateConfig({ enabled: !config.enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.enabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sound Type Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Chime Instrument
            </label>
            <div className="grid grid-cols-1 gap-2">
              {soundOptions.map((opt) => {
                const isSelected = config.soundType === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onUpdateConfig({ soundType: opt.id as SoundConfig['soundType'] });
                      setTimeout(onTestChime, 50);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400/60 ring-1 ring-cyan-400/30'
                        : 'bg-slate-800/30 hover:bg-slate-800/60 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5">{opt.icon}</div>
                      <div>
                        <span className="font-bold text-white text-sm block">{opt.name}</span>
                        <span className="text-[11px] text-slate-400">{opt.desc}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-bold text-cyan-400">Active</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Slider */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-xs uppercase tracking-wider">
                Chime Volume
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                {Math.round(config.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.volume}
              onChange={(e) => onUpdateConfig({ volume: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Ambient Swell / Sub-harmonic Drone Toggle */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Continuous Ambient Drone</span>
                <span className="text-xs text-slate-400">
                  Dynamic sub-harmonic wave that gently swells with your lung capacity
                </span>
              </div>
              <button
                onClick={() => onUpdateConfig({ ambientDrone: !config.ambientDrone })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.ambientDrone ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.ambientDrone ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {config.ambientDrone && (
              <div className="space-y-1 pt-2 border-t border-white/5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Drone Intensity</span>
                  <span className="font-mono">{Math.round(config.ambientVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={config.ambientVolume}
                  onChange={(e) => onUpdateConfig({ ambientVolume: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onTestChime}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
          >
            🔊 Test Chime
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
