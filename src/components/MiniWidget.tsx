'use client';

import React from 'react';
import { BreathingPhase, EngineStatus } from '@/types/breathing';
import { VisualPacer } from './VisualPacer';
import { InstructionBadge } from './InstructionBadge';
import { CountdownDisplay } from './CountdownDisplay';
import { Play, Pause, Maximize2, SkipForward, RotateCcw } from 'lucide-react';
import { PHASE_METADATA } from '@/lib/presets';

interface MiniWidgetProps {
  phase: BreathingPhase;
  progress: number;
  remainingSeconds: number;
  totalPhaseSeconds: number;
  status: EngineStatus;
  currentCycle: number;
  targetCycles: number;
  exhaleMethod: 'mouth' | 'nose';
  presetName: string;
  onTogglePlay: () => void;
  onReset: () => void;
  onNextPhase: () => void;
  onExpand: () => void;
}

export function MiniWidget({
  phase,
  progress,
  remainingSeconds,
  totalPhaseSeconds,
  status,
  currentCycle,
  targetCycles,
  exhaleMethod,
  presetName,
  onTogglePlay,
  onReset,
  onNextPhase,
  onExpand,
}: MiniWidgetProps) {
  const isRunning = status === 'running';
  const meta = PHASE_METADATA[phase](exhaleMethod);

  return (
    <aside
      aria-label="Breathing Widget"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-4 p-3.5 pr-4 rounded-3xl bg-slate-950/85 border border-white/15 backdrop-blur-2xl shadow-2xl transition-all duration-300 hover:border-white/25 select-none"
      style={{
        boxShadow: `0 12px 35px -5px rgba(0, 0, 0, 0.7), 0 0 25px ${meta.color.glow}`,
      }}
    >
      {/* Mini Visual Pacer */}
      <div className="relative">
        <VisualPacer
          phase={phase}
          progress={progress}
          status={status}
          exhaleMethod={exhaleMethod}
          size="mini"
        />
      </div>

      {/* Center Details: Badge, Countdown, Preset */}
      <div className="flex flex-col justify-center gap-1 min-w-[130px]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-slate-400 truncate max-w-[90px]">
            {presetName}
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            C{currentCycle}{targetCycles > 0 ? `/${targetCycles}` : ''}
          </span>
        </div>

        <InstructionBadge
          phase={phase}
          status={status}
          exhaleMethod={exhaleMethod}
          size="mini"
        />

        <div className="flex items-center justify-between pt-0.5">
          <CountdownDisplay
            remainingSeconds={remainingSeconds}
            totalPhaseSeconds={totalPhaseSeconds}
            phase={phase}
            status={status}
            currentCycle={currentCycle}
            targetCycles={targetCycles}
            exhaleMethod={exhaleMethod}
            size="mini"
          />

          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
            {Math.round(progress * 100)}%
          </span>
        </div>
      </div>

      {/* Mini Actions */}
      <div className="flex flex-col gap-1.5 pl-2 border-l border-white/10">
        <button
          onClick={onExpand}
          title="Expand to Fullscreen [Esc or M]"
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="sr-only">Expand</span>
        </button>

        <button
          onClick={onTogglePlay}
          title={isRunning ? 'Pause [Space]' : 'Start [Space]'}
          className={`p-1.5 rounded-lg transition-colors ${
            isRunning
              ? 'bg-amber-500/80 hover:bg-amber-500 text-slate-950'
              : 'bg-cyan-500/80 hover:bg-cyan-400 text-slate-950'
          }`}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          <span className="sr-only">Toggle Play</span>
        </button>

        <button
          onClick={onNextPhase}
          title="Next Phase [N]"
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
        >
          <SkipForward className="w-3.5 h-3.5" />
          <span className="sr-only">Next</span>
        </button>
      </div>
    </aside>
  );
}
