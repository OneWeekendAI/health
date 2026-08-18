'use client';

import React, { useMemo } from 'react';
import { BreathingPhase, EngineStatus } from '@/types/breathing';
import { PHASE_METADATA } from '@/lib/presets';
import { Wind, Pause, ArrowDown, ArrowUp, Sparkles, Activity } from 'lucide-react';

interface InstructionBadgeProps {
  phase: BreathingPhase;
  status: EngineStatus;
  exhaleMethod: 'mouth' | 'nose';
  size?: 'normal' | 'mini';
}

export function InstructionBadge({
  phase,
  status,
  exhaleMethod,
  size = 'normal',
}: InstructionBadgeProps) {
  const meta = useMemo(() => {
    return PHASE_METADATA[phase](exhaleMethod);
  }, [phase, exhaleMethod]);

  // Direct short badge label as requested: "Inhale (Nose)", "Exhale (Mouth)" / "Exhale (Nose)", "Hold breath"
  const shortBadgeLabel = useMemo(() => {
    switch (phase) {
      case 'INHALE':
        return 'Inhale (Nose)';
      case 'HOLD_TOP':
        return 'Hold breath';
      case 'EXHALE':
        return exhaleMethod === 'mouth' ? 'Exhale (Mouth)' : 'Exhale (Nose)';
      case 'HOLD_BOTTOM':
        return 'Hold breath';
    }
  }, [phase, exhaleMethod]);

  if (size === 'mini') {
    return (
      <div className="flex flex-col items-center text-center">
        <span className={`text-xs font-semibold uppercase tracking-wider ${meta.color.text}`}>
          {shortBadgeLabel}
        </span>
        <span className="text-[11px] text-slate-400">
          {phase === 'HOLD_TOP' ? 'Full Lungs' : phase === 'HOLD_BOTTOM' ? 'Empty Lungs' : meta.actionText}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-2 select-none">
      {/* High-Contrast Primary Anatomical Flow Pill Badge */}
      <div
        className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border backdrop-blur-md shadow-lg transition-all duration-500 ${meta.color.badgeBg}`}
        style={{
          boxShadow: `0 4px 20px ${meta.color.glow}`,
        }}
      >
        {/* Animated Directional Airflow Icon */}
        <div className="flex items-center justify-center">
          {phase === 'INHALE' && (
            <div className="flex items-center text-cyan-300 animate-bounce">
              <ArrowDown className="w-4 h-4" />
            </div>
          )}
          {(phase === 'HOLD_TOP' || phase === 'HOLD_BOTTOM') && (
            <div className="flex items-center text-amber-300">
              <Pause className="w-3.5 h-3.5 fill-current" />
            </div>
          )}
          {phase === 'EXHALE' && (
            <div className="flex items-center text-indigo-300 animate-bounce">
              <ArrowUp className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* High-Contrast Anatomical Directive */}
        <span className="text-sm md:text-base font-bold tracking-wide">
          {shortBadgeLabel}
        </span>

        {/* Anatomical source pill tag */}
        <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 uppercase tracking-wider font-semibold opacity-90">
          {meta.airflowSource === 'nose' ? '👃 Nasal' : meta.airflowSource === 'mouth' ? '👄 Oral' : '⏸️ Retention'}
        </span>
      </div>

      {/* Primary Action Title */}
      <h2
        className={`text-2xl md:text-4xl font-extrabold tracking-tight transition-colors duration-500 ${meta.color.text}`}
      >
        {status === 'idle' ? 'Ready to Begin' : status === 'completed' ? 'Session Complete' : meta.actionText}
      </h2>

      {/* Calming Anatomical Guidance Subtext */}
      <p className="text-xs md:text-sm text-slate-400 max-w-sm font-medium transition-opacity duration-300">
        {status === 'idle'
          ? 'Find a comfortable upright posture and press Space or Start.'
          : status === 'completed'
          ? 'Great job! Take a moment to notice your calm, balanced state.'
          : meta.anatomicalHint}
      </p>
    </div>
  );
}
