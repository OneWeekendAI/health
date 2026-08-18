'use client';

import React, { useState } from 'react';
import { BreathingPreset, PhaseConfig, ExhaleMethod } from '@/types/breathing';
import { DEFAULT_PRESETS } from '@/lib/presets';
import { X, Check, Sliders, Sparkles, Wind, Clock, Flame, Heart, Zap, RotateCcw } from 'lucide-react';

interface PresetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  activePresetId: string;
  onSelectPreset: (preset: BreathingPreset) => void;
  customConfig: PhaseConfig;
  onUpdateCustomConfig: (config: PhaseConfig) => void;
}

export function PresetSelector({
  isOpen,
  onClose,
  activePresetId,
  onSelectPreset,
  customConfig,
  onUpdateCustomConfig,
}: PresetSelectorProps) {
  const [tab, setTab] = useState<'presets' | 'builder'>('presets');
  const [localCustom, setLocalCustom] = useState<PhaseConfig>(customConfig);

  if (!isOpen) return null;

  const handleApplyCustom = () => {
    onUpdateCustomConfig(localCustom);
    onSelectPreset({
      id: 'custom',
      name: 'Custom Breath Flow',
      category: 'custom',
      description: 'Personalized phase timings and airflow pattern.',
      benefits: ['Customized for individual lung capacity and goal'],
      config: localCustom,
      isCustom: true,
    });
    onClose();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'focus':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'relaxation':
        return <Heart className="w-4 h-4 text-purple-400" />;
      case 'balance':
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
      case 'energy':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sliders className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preset-selector-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-white/15 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-white/10 bg-slate-950/40">
          <div>
            <h2 id="preset-selector-title" className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
              <Wind className="w-6 h-6 text-cyan-400" />
              Breathing Presets & Custom Builder
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Select a scientifically proven pattern or tailor custom phase durations.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/10 bg-slate-950/20 px-6 pt-3 gap-3">
          <button
            onClick={() => setTab('presets')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
              tab === 'presets'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Standard Presets
          </button>
          <button
            onClick={() => setTab('builder')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
              tab === 'builder'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Custom Duration Builder
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4">
          {tab === 'presets' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {DEFAULT_PRESETS.map((preset) => {
                const isSelected = activePresetId === preset.id;
                const { inhaleDuration, holdTopDuration, exhaleDuration, holdBottomDuration, exhaleMethod } = preset.config;

                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      onSelectPreset(preset);
                      onClose();
                    }}
                    className={`group relative p-4 rounded-2xl border transition-all cursor-pointer select-none text-left flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400/60 ring-2 ring-cyan-400/30 shadow-lg shadow-cyan-950/50'
                        : 'bg-slate-800/40 hover:bg-slate-800/80 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(preset.category)}
                          <span className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                            {preset.name}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-950/90 px-2 py-0.5 rounded-full border border-cyan-500/30">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                        {preset.description}
                      </p>
                    </div>

                    <div>
                      {/* Phase Timings Grid */}
                      <div className="grid grid-cols-4 gap-1 p-2 rounded-xl bg-black/40 border border-white/5 text-center text-xs">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-cyan-400 uppercase font-semibold">Inhale</span>
                          <span className="font-mono font-bold text-white">{inhaleDuration}s</span>
                          <span className="text-[9px] text-slate-400">Nose</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-amber-400 uppercase font-semibold">Hold</span>
                          <span className="font-mono font-bold text-white">{holdTopDuration}s</span>
                          <span className="text-[9px] text-slate-400">Top</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-indigo-400 uppercase font-semibold">Exhale</span>
                          <span className="font-mono font-bold text-white">{exhaleDuration}s</span>
                          <span className="text-[9px] text-slate-400 uppercase">{exhaleMethod}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-emerald-400 uppercase font-semibold">Hold</span>
                          <span className="font-mono font-bold text-white">{holdBottomDuration}s</span>
                          <span className="text-[9px] text-slate-400">Bottom</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Custom Engine Builder Form */
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-200">
                💡 Customize your breath cycle down to half-second increments. Set holds to 0s to automatically skip them.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Inhale Duration */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-cyan-300">
                      1. Inhale Duration (Nose)
                    </label>
                    <span className="text-lg font-mono font-bold text-white">
                      {localCustom.inhaleDuration.toFixed(1)}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="15.0"
                    step="0.5"
                    value={localCustom.inhaleDuration}
                    onChange={(e) =>
                      setLocalCustom({ ...localCustom, inhaleDuration: parseFloat(e.target.value) })
                    }
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>1.0s</span>
                    <span>7.5s</span>
                    <span>15.0s</span>
                  </div>
                </div>

                {/* Hold (Post-Inhale) */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-amber-300">
                      2. Top Hold (Lungs Full)
                    </label>
                    <span className="text-lg font-mono font-bold text-white">
                      {localCustom.holdTopDuration.toFixed(1)}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="20.0"
                    step="0.5"
                    value={localCustom.holdTopDuration}
                    onChange={(e) =>
                      setLocalCustom({ ...localCustom, holdTopDuration: parseFloat(e.target.value) })
                    }
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0.0s (Skip)</span>
                    <span>10.0s</span>
                    <span>20.0s</span>
                  </div>
                </div>

                {/* Exhale Duration */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-indigo-300">
                      3. Exhale Duration
                    </label>
                    <span className="text-lg font-mono font-bold text-white">
                      {localCustom.exhaleDuration.toFixed(1)}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="20.0"
                    step="0.5"
                    value={localCustom.exhaleDuration}
                    onChange={(e) =>
                      setLocalCustom({ ...localCustom, exhaleDuration: parseFloat(e.target.value) })
                    }
                    className="w-full accent-indigo-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>1.0s</span>
                    <span>10.0s</span>
                    <span>20.0s</span>
                  </div>
                </div>

                {/* Hold (Post-Exhale) */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-emerald-300">
                      4. Bottom Hold (Lungs Empty)
                    </label>
                    <span className="text-lg font-mono font-bold text-white">
                      {localCustom.holdBottomDuration.toFixed(1)}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="20.0"
                    step="0.5"
                    value={localCustom.holdBottomDuration}
                    onChange={(e) =>
                      setLocalCustom({ ...localCustom, holdBottomDuration: parseFloat(e.target.value) })
                    }
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0.0s (Skip)</span>
                    <span>10.0s</span>
                    <span>20.0s</span>
                  </div>
                </div>
              </div>

              {/* Exhale Method & Cycles Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {/* Exhale Method Toggle */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-3">
                  <label className="text-sm font-semibold text-slate-200 block">
                    Exhale Airflow Channel
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLocalCustom({ ...localCustom, exhaleMethod: 'mouth' })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        localCustom.exhaleMethod === 'mouth'
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-900/50'
                          : 'bg-slate-800/60 text-slate-300 border-white/10 hover:border-white/20'
                      }`}
                    >
                      👄 Through Mouth
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocalCustom({ ...localCustom, exhaleMethod: 'nose' })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        localCustom.exhaleMethod === 'nose'
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-900/50'
                          : 'bg-slate-800/60 text-slate-300 border-white/10 hover:border-white/20'
                      }`}
                    >
                      👃 Through Nose
                    </button>
                  </div>
                </div>

                {/* Target Cycles */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-200">
                      Target Breath Cycles
                    </label>
                    <span className="text-sm font-bold text-cyan-400">
                      {localCustom.cyclesTarget === 0 ? 'Continuous / Infinite' : `${localCustom.cyclesTarget} Cycles`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={localCustom.cyclesTarget}
                    onChange={(e) =>
                      setLocalCustom({ ...localCustom, cyclesTarget: parseInt(e.target.value) })
                    }
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0 (Infinite)</span>
                    <span>10 Cycles</span>
                    <span>20 Cycles</span>
                  </div>
                </div>
              </div>

              {/* Total Cycle Duration Summary */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Cycle Duration:</span>
                  <span className="font-mono font-bold text-white">
                    {(
                      localCustom.inhaleDuration +
                      localCustom.holdTopDuration +
                      localCustom.exhaleDuration +
                      localCustom.holdBottomDuration
                    ).toFixed(1)}s
                  </span>
                </div>

                <div className="text-slate-400">
                  Breath Rate:{' '}
                  <span className="font-mono text-cyan-300 font-bold">
                    {(
                      60 /
                      (localCustom.inhaleDuration +
                        localCustom.holdTopDuration +
                        localCustom.exhaleDuration +
                        localCustom.holdBottomDuration)
                    ).toFixed(1)}{' '}
                    BPM
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 md:p-6 border-t border-white/10 bg-slate-950/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          {tab === 'builder' && (
            <button
              onClick={handleApplyCustom}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 text-sm font-bold shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
            >
              Apply Custom Flow
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
