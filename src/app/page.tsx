'use client';

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { BreathingPhase, BreathingPreset, PhaseConfig, SessionStats } from '@/types/breathing';
import { DEFAULT_PRESETS, INITIAL_CONFIG, PHASE_METADATA } from '@/lib/presets';
import { useBreathingEngine } from '@/hooks/useBreathingEngine';
import { useAudioSynthesizer } from '@/hooks/useAudioSynthesizer';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { VisualPacer } from '@/components/VisualPacer';
import { InstructionBadge } from '@/components/InstructionBadge';
import { CountdownDisplay } from '@/components/CountdownDisplay';
import { Controls } from '@/components/Controls';
import { PresetSelector } from '@/components/PresetSelector';
import { MiniWidget } from '@/components/MiniWidget';
import { AudioSettingsModal } from '@/components/AudioSettingsModal';
import { SessionStatsModal } from '@/components/SessionStatsModal';
import { KeybindGuideModal } from '@/components/KeybindGuideModal';
import { VoiceCommandsModal } from '@/components/VoiceCommandsModal';
import { VoiceFeedbackPill } from '@/components/VoiceFeedbackPill';
import { safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils';
import {
  Sparkles,
  Sliders,
  BarChart3,
  HelpCircle,
  Volume2,
  VolumeX,
  Layers,
  Mic,
  MicOff,
} from 'lucide-react';

const STATS_STORAGE_KEY = 'breath_session_stats_v1';
const PRESET_STORAGE_KEY = 'breath_selected_preset_id_v1';
const CUSTOM_CONFIG_STORAGE_KEY = 'breath_custom_config_v1';

const INITIAL_STATS: SessionStats = {
  totalMinutesBreathed: 0,
  totalCompletedSessions: 0,
  totalCompletedBreaths: 0,
  currentStreakDays: 1,
  lastSessionDate: null,
  history: [],
};

export default function BreathingApp() {
  // Preset & Configuration state
  const [activePreset, setActivePreset] = useState<BreathingPreset>(DEFAULT_PRESETS[0]);
  const [customConfig, setCustomConfig] = useState<PhaseConfig>(INITIAL_CONFIG);

  // Modals & UI Mode
  const [isMiniMode, setIsMiniMode] = useState<boolean>(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);

  // Session stats state
  const [stats, setStats] = useState<SessionStats>(INITIAL_STATS);

  // Sound Synthesizer Hook
  const { config: soundConfig, updateConfig: updateSoundConfig, playPhaseChime, updateAmbientDrone, initAudio } =
    useAudioSynthesizer();

  // Load persistent stats & preset preference on mount
  useEffect(() => {
    const savedPresetId = safeLocalStorageGet<string>(PRESET_STORAGE_KEY, DEFAULT_PRESETS[0].id);
    const savedCustom = safeLocalStorageGet<PhaseConfig>(CUSTOM_CONFIG_STORAGE_KEY, INITIAL_CONFIG);
    const savedStats = safeLocalStorageGet<SessionStats>(STATS_STORAGE_KEY, INITIAL_STATS);

    setCustomConfig(savedCustom);
    setStats(savedStats);

    if (savedPresetId === 'custom') {
      setActivePreset({
        id: 'custom',
        name: 'Custom Breath Flow',
        category: 'custom',
        description: 'Personalized phase timings and airflow pattern.',
        benefits: ['Customized for individual lung capacity and goal'],
        config: savedCustom,
        isCustom: true,
      });
    } else {
      const found = DEFAULT_PRESETS.find((p) => p.id === savedPresetId);
      if (found) setActivePreset(found);
    }
  }, []);

  // Save session stats helper
  const logCompletedSession = useCallback(
    (totalSeconds: number, completedCycles: number) => {
      const todayStr = new Date().toISOString().split('T')[0];

      setStats((prev) => {
        const isNewDay = prev.lastSessionDate !== todayStr;
        let streak = prev.currentStreakDays;

        if (isNewDay && prev.lastSessionDate) {
          const lastDate = new Date(prev.lastSessionDate);
          const currentDate = new Date(todayStr);
          const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
          if (diffDays === 1) {
            streak += 1;
          } else if (diffDays > 1) {
            streak = 1;
          }
        }

        const updated: SessionStats = {
          totalMinutesBreathed: prev.totalMinutesBreathed + totalSeconds / 60,
          totalCompletedSessions: prev.totalCompletedSessions + 1,
          totalCompletedBreaths: prev.totalCompletedBreaths + completedCycles,
          currentStreakDays: streak,
          lastSessionDate: todayStr,
          history: [
            {
              date: new Date().toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              presetName: activePreset.name,
              durationSeconds: Math.round(totalSeconds),
              cyclesCompleted: completedCycles,
            },
            ...prev.history,
          ].slice(0, 50),
        };

        safeLocalStorageSet(STATS_STORAGE_KEY, updated);
        return updated;
      });
    },
    [activePreset.name]
  );

  // Phase transition callback
  const handlePhaseChange = useCallback(
    (phase: BreathingPhase) => {
      playPhaseChime(phase);
    },
    [playPhaseChime]
  );

  // Cycle completion callback
  const handleCycleComplete = useCallback((_cycle: number) => {
    // Optional intermediate feedback
  }, []);

  // Session completion callback (trigger confetti celebration!)
  const handleSessionComplete = useCallback(
    (totalSeconds: number) => {
      logCompletedSession(totalSeconds, activePreset.config.cyclesTarget || 1);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#10b981', '#f59e0b', '#818cf8'],
        });
      } catch {}
    },
    [activePreset.config.cyclesTarget, logCompletedSession]
  );

  // Breathing state machine engine
  const {
    engineState,
    start,
    pause,
    togglePlayPause,
    reset,
    skipToNextPhase,
    status,
  } = useBreathingEngine({
    config: activePreset.config,
    onPhaseChange: handlePhaseChange,
    onCycleComplete: handleCycleComplete,
    onSessionComplete: handleSessionComplete,
  });

  // Keep ambient audio drone in sync with engine
  useEffect(() => {
    updateAmbientDrone(
      status === 'running',
      engineState.currentPhase,
      engineState.phaseProgress
    );
  }, [
    status,
    engineState.currentPhase,
    engineState.phaseProgress,
    updateAmbientDrone,
  ]);

  // Handle preset selection
  const handleSelectPreset = useCallback(
    (preset: BreathingPreset) => {
      reset();
      setActivePreset(preset);
      safeLocalStorageSet(PRESET_STORAGE_KEY, preset.id);
    },
    [reset]
  );

  // Handle custom config update
  const handleUpdateCustomConfig = useCallback((cfg: PhaseConfig) => {
    setCustomConfig(cfg);
    safeLocalStorageSet(CUSTOM_CONFIG_STORAGE_KEY, cfg);
  }, []);

  // Hotkey & Voice helpers
  const handlePlayToggle = useCallback(() => {
    initAudio();
    togglePlayPause();
  }, [initAudio, togglePlayPause]);

  const handleSoundToggle = useCallback(() => {
    updateSoundConfig({ enabled: !soundConfig.enabled });
  }, [soundConfig.enabled, updateSoundConfig]);

  // Voice Command selection helper
  const handleSelectPresetByName = useCallback(
    (nameQuery: string) => {
      if (nameQuery === 'box') {
        const p = DEFAULT_PRESETS.find((x) => x.id === 'box-breathing');
        if (p) handleSelectPreset(p);
      } else if (nameQuery === '4-7-8') {
        const p = DEFAULT_PRESETS.find((x) => x.id === '4-7-8-relax');
        if (p) handleSelectPreset(p);
      } else if (nameQuery === 'coherent') {
        const p = DEFAULT_PRESETS.find((x) => x.id === 'coherent-resonant');
        if (p) handleSelectPreset(p);
      } else if (nameQuery === 'sigh') {
        const p = DEFAULT_PRESETS.find((x) => x.id === 'physiological-sigh');
        if (p) handleSelectPreset(p);
      }
    },
    [handleSelectPreset]
  );

  // Hands-free Voice Commands Hook
  const {
    isSupported: isVoiceSupported,
    isListening: isVoiceListening,
    lastCommand,
    feedbackMessage: voiceFeedbackMessage,
    toggleListening: toggleVoiceListening,
  } = useVoiceCommands({
    onStart: () => {
      initAudio();
      start();
    },
    onPause: pause,
    onTogglePlay: handlePlayToggle,
    onReset: reset,
    onNextPhase: skipToNextPhase,
    onSelectPresetByName: handleSelectPresetByName,
    onToggleMini: (targetState) => setIsMiniMode(targetState ?? !isMiniMode),
    onToggleSound: (targetState) => {
      if (typeof targetState === 'boolean') {
        updateSoundConfig({ enabled: targetState });
      } else {
        handleSoundToggle();
      }
    },
  });

  const handleEscape = useCallback(() => {
    if (isPresetModalOpen) setIsPresetModalOpen(false);
    else if (isAudioModalOpen) setIsAudioModalOpen(false);
    else if (isStatsModalOpen) setIsStatsModalOpen(false);
    else if (isHelpModalOpen) setIsHelpModalOpen(false);
    else if (isVoiceModalOpen) setIsVoiceModalOpen(false);
    else if (isMiniMode) setIsMiniMode(false);
  }, [
    isPresetModalOpen,
    isAudioModalOpen,
    isStatsModalOpen,
    isHelpModalOpen,
    isVoiceModalOpen,
    isMiniMode,
  ]);

  useKeyboardShortcuts({
    onTogglePlay: handlePlayToggle,
    onReset: reset,
    onNextPhase: skipToNextPhase,
    onToggleMini: () => setIsMiniMode((prev) => !prev),
    onToggleSound: handleSoundToggle,
    onToggleVoice: toggleVoiceListening,
    onEscape: handleEscape,
    onToggleHelp: () => setIsHelpModalOpen((prev) => !prev),
    enabled: true,
  });

  const phaseMeta = PHASE_METADATA[engineState.currentPhase](
    activePreset.config.exhaleMethod
  );

  return (
    <main className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#070a12] text-slate-100">
      {/* Dynamic Ambient Background Aura */}
      <div
        className="fixed inset-0 pointer-events-none transition-colors duration-1000 opacity-20 -z-10"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${phaseMeta.color.primary} 0%, transparent 60%)`,
        }}
      />

      {/* Grid Pattern overlay for depth */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] -z-10"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Voice Command Feedback Pill / Toast */}
      <VoiceFeedbackPill
        isListening={isVoiceListening}
        message={voiceFeedbackMessage}
        lastCommand={lastCommand}
        onToggleVoice={toggleVoiceListening}
      />

      {/* Top Navigation & Status Bar */}
      <header className="relative z-20 flex items-center justify-between p-4 md:px-8 border-b border-white/5 bg-slate-950/40 backdrop-blur-md">
        {/* Quick Preset Badges */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/70 border border-white/10">
          {DEFAULT_PRESETS.slice(0, 3).map((p) => {
            const isSelected = activePreset.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {p.name}
              </button>
            );
          })}
          <button
            onClick={() => setIsPresetModalOpen(true)}
            className="px-3 py-1 rounded-xl text-xs font-medium text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
          >
            <Sliders className="w-3 h-3" />
            More...
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Hands-free Voice Commands Toggle */}
          <button
            onClick={toggleVoiceListening}
            onContextMenu={(e) => {
              e.preventDefault();
              setIsVoiceModalOpen(true);
            }}
            title={
              isVoiceListening
                ? 'Voice Commands Active (V) — Click to stop, right-click for list'
                : 'Enable Hands-Free Voice Commands (V)'
            }
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
              isVoiceListening
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900/70 hover:bg-slate-800 border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            {isVoiceListening ? (
              <>
                <Mic className="w-4 h-4 animate-pulse text-emerald-400" />
                <span className="hidden md:inline text-emerald-300">Listening</span>
              </>
            ) : (
              <>
                <MicOff className="w-4 h-4 text-slate-400" />
                <span className="hidden md:inline">Voice (V)</span>
              </>
            )}
          </button>

          {/* Sound Quick Toggle */}
          <button
            onClick={handleSoundToggle}
            title={`Sound ${soundConfig.enabled ? 'Enabled' : 'Muted'} (S)`}
            className={`p-2.5 rounded-xl border transition-colors ${
              soundConfig.enabled
                ? 'bg-slate-900/70 border-white/10 text-cyan-400 hover:bg-slate-800'
                : 'bg-slate-900/40 border-white/5 text-slate-500 hover:text-slate-300'
            }`}
          >
            {soundConfig.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Stats Button */}
          <button
            onClick={() => setIsStatsModalOpen(true)}
            title="Mindfulness Stats"
            className="p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">
              {stats.totalMinutesBreathed > 0 ? `${stats.totalMinutesBreathed.toFixed(0)}m` : 'Stats'}
            </span>
          </button>

          {/* Mini Mode Toggle */}
          <button
            onClick={() => setIsMiniMode(true)}
            title="Enter Mini Mode (M)"
            className="p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Mini (M)</span>
          </button>
        </div>
      </header>

      {/* Main Breathing Stage (Focused only on visual pacer, instruction badge, and countdown) */}
      {!isMiniMode ? (
        <section className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 gap-5 max-w-4xl mx-auto w-full">
          {/* Central Pacer Orb & Visual Aura */}
          <div className="flex items-center justify-center">
            <VisualPacer
              phase={engineState.currentPhase}
              progress={engineState.phaseProgress}
              status={status}
              exhaleMethod={activePreset.config.exhaleMethod}
              size="normal"
            />
          </div>

          {/* High-Contrast Anatomical Directive Badge */}
          <InstructionBadge
            phase={engineState.currentPhase}
            status={status}
            exhaleMethod={activePreset.config.exhaleMethod}
            size="normal"
          />

          {/* Live Countdown & Cycle Counter */}
          <CountdownDisplay
            remainingSeconds={engineState.remainingInPhase}
            totalPhaseSeconds={engineState.phaseDuration}
            phase={engineState.currentPhase}
            status={status}
            currentCycle={engineState.currentCycle}
            targetCycles={engineState.targetCycles}
            exhaleMethod={activePreset.config.exhaleMethod}
            size="normal"
          />
        </section>
      ) : (
        /* Standalone Multitasking Watermark when Mini Mode is Active */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="p-4 rounded-3xl bg-slate-900/40 border border-white/5 max-w-sm backdrop-blur-sm">
            <Layers className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">Mini Multitasking Mode Active</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your compact breathing pacer is docked at the bottom-right corner. You can multitask while maintaining paced rhythm.
            </p>
            <button
              onClick={() => setIsMiniMode(false)}
              className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
            >
              Restore Full Screen (Esc / M)
            </button>
          </div>
        </div>
      )}

      {/* Floating Corner Mini Widget (When Mini Mode is enabled) */}
      {isMiniMode && (
        <MiniWidget
          phase={engineState.currentPhase}
          progress={engineState.phaseProgress}
          remainingSeconds={engineState.remainingInPhase}
          totalPhaseSeconds={engineState.phaseDuration}
          status={status}
          currentCycle={engineState.currentCycle}
          targetCycles={engineState.targetCycles}
          exhaleMethod={activePreset.config.exhaleMethod}
          presetName={activePreset.name}
          onTogglePlay={handlePlayToggle}
          onReset={reset}
          onNextPhase={skipToNextPhase}
          onExpand={() => setIsMiniMode(false)}
        />
      )}

      {/* Desktop Bottom Control & Keybind Bar */}
      <footer className="relative z-20 flex items-center justify-between p-3 md:px-8 border-t border-white/5 bg-slate-950/70 backdrop-blur-md text-[11px] text-slate-400">
        {/* Left: Active Preset Quick Info */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => setIsPresetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span className="font-semibold text-xs text-slate-200">{activePreset.name}</span>
            <span className="text-[10px] text-slate-500 font-mono">
              ({activePreset.config.inhaleDuration}s-{activePreset.config.holdTopDuration}s-
              {activePreset.config.exhaleDuration}s-{activePreset.config.holdBottomDuration}s)
            </span>
          </button>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-2 mx-auto lg:mx-0">
          <button
            onClick={reset}
            title="Reset session [R]"
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 active:scale-95"
          >
            <span>Reset</span>
            <kbd className="px-1 py-0.2 rounded bg-black/40 text-[10px] font-mono text-slate-400">R</kbd>
          </button>

          <button
            onClick={handlePlayToggle}
            title={status === 'running' ? 'Pause [Space]' : 'Start [Space]'}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95 ${
              status === 'running'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/40'
                : 'bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-cyan-950/40'
            }`}
          >
            <span>{status === 'running' ? 'Pause' : status === 'paused' ? 'Resume' : 'Begin'}</span>
            <kbd className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono font-bold">Space</kbd>
          </button>

          <button
            onClick={skipToNextPhase}
            title="Skip to next phase [N]"
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 active:scale-95"
          >
            <span>Next</span>
            <kbd className="px-1 py-0.2 rounded bg-black/40 text-[10px] font-mono text-slate-400">N</kbd>
          </button>
        </div>

        {/* Right: Voice List & Shortcuts modal trigger */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Voice cmds</span>
          </button>
          <span className="hidden sm:inline text-slate-600">•</span>
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shortcuts</span>
            <span>(?)</span>
          </button>
        </div>
      </footer>

      {/* Interactive Modals */}
      <PresetSelector
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        activePresetId={activePreset.id}
        onSelectPreset={handleSelectPreset}
        customConfig={customConfig}
        onUpdateCustomConfig={handleUpdateCustomConfig}
      />

      <AudioSettingsModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        config={soundConfig}
        onUpdateConfig={updateSoundConfig}
        onTestChime={() => playPhaseChime('INHALE')}
      />

      <SessionStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        stats={stats}
        onResetStats={() => {
          setStats(INITIAL_STATS);
          safeLocalStorageSet(STATS_STORAGE_KEY, INITIAL_STATS);
        }}
      />

      <KeybindGuideModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <VoiceCommandsModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        isListening={isVoiceListening}
        onToggleVoice={toggleVoiceListening}
      />
    </main>
  );
}
