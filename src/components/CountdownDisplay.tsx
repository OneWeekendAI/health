'use client';

import React, { useMemo } from 'react';
import { BreathingPhase, EngineStatus } from '@/types/breathing';
import { PHASE_METADATA } from '@/lib/presets';

interface CountdownDisplayProps {
  remainingSeconds: number;
  totalPhaseSeconds: number;
  phase: BreathingPhase;
  status: EngineStatus;
  currentCycle: number;
  targetCycles: number;
  exhaleMethod: 'mouth' | 'nose';
  size?: 'normal' | 'mini';
}

export function CountdownDisplay({
  remainingSeconds,
  totalPhaseSeconds,
  phase,
  status,
  currentCycle,
  targetCycles,
  exhaleMethod,
  size = 'normal',
}: CountdownDisplayProps) {
  const meta = useMemo(() => {
    return PHASE_METADATA[phase](exhaleMethod);
  }, [phase, exhaleMethod]);

  // Clean numeric seconds formatting (1 decimal place if < 10s and running, otherwise whole integer)
  const displayVal = useMemo(() => {
    if (status === 'idle') {
      return totalPhaseSeconds.toFixed(0);
    }
    if (status === 'completed') {
      return '0.0';
    }
    return Math.max(0.1, remainingSeconds).toFixed(1);
  }, [remainingSeconds, status, totalPhaseSeconds]);

  if (size === 'mini') {
    return (
      <div className="flex items-baseline gap-1">
        <span className={`text-xl font-bold font-mono ${meta.color.text}`}>
          {displayVal}
        </span>
        <span className="text-xs text-slate-400 font-medium">s</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center select-none">
      {/* Big Digital Countdown */}
      <div className="flex items-baseline justify-center">
        <span
          className="text-5xl md:text-7xl font-black font-mono tracking-tighter text-white drop-shadow-md"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {displayVal}
        </span>
        <span className="text-lg md:text-2xl font-bold text-slate-400 ml-1.5 font-mono">
          s
        </span>
      </div>

      {/* Cycle Indicator & Progress Dots */}
      <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-slate-900/60 border border-white/10 text-xs text-slate-300 backdrop-blur-sm">
        <span className="font-semibold text-slate-200">
          Cycle {currentCycle}
          {targetCycles > 0 ? ` / ${targetCycles}` : ' (Continuous)'}
        </span>

        {targetCycles > 0 && targetCycles <= 12 && (
          <div className="flex items-center gap-1 ml-1.5">
            {Array.from({ length: targetCycles }).map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                  idx + 1 < currentCycle
                    ? 'bg-emerald-400'
                    : idx + 1 === currentCycle
                    ? 'bg-cyan-400 ring-2 ring-cyan-400/40'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
