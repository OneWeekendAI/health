export type BreathingPhase = 'INHALE' | 'HOLD_TOP' | 'EXHALE' | 'HOLD_BOTTOM';

export type ExhaleMethod = 'mouth' | 'nose';

export type EngineStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface PhaseConfig {
  inhaleDuration: number;     // seconds (e.g. 4.0)
  holdTopDuration: number;    // seconds (e.g. 4.0 or 0)
  exhaleDuration: number;     // seconds (e.g. 4.0)
  holdBottomDuration: number; // seconds (e.g. 4.0 or 0)
  exhaleMethod: ExhaleMethod; // 'mouth' | 'nose'
  cyclesTarget: number;       // 0 for infinite/continuous, or 1..100
}

export interface BreathingPreset {
  id: string;
  name: string;
  category: 'focus' | 'relaxation' | 'balance' | 'energy' | 'custom';
  description: string;
  benefits: string[];
  config: PhaseConfig;
  isCustom?: boolean;
}

export interface PhaseInfo {
  phase: BreathingPhase;
  name: string;
  actionText: string;
  anatomicalHint: string;
  airflowSource: 'nose' | 'mouth' | 'still';
  color: {
    primary: string;
    glow: string;
    text: string;
    border: string;
    bgGradient: string;
    badgeBg: string;
  };
}

export interface EngineState {
  status: EngineStatus;
  currentPhase: BreathingPhase;
  phaseDuration: number;
  elapsedInPhase: number;
  remainingInPhase: number;
  phaseProgress: number; // 0.0 to 1.0
  overallProgress: number; // For current cycle 0.0 to 1.0
  currentCycle: number;
  targetCycles: number;
  totalSessionTime: number; // Total active breathing time in seconds
  isTransitioning: boolean;
}

export interface SoundConfig {
  enabled: boolean;
  volume: number; // 0 to 1
  soundType: 'singing_bowl' | 'soft_bell' | 'zen_harp' | 'pure_sine';
  ambientDrone: boolean;
  ambientVolume: number;
}

export interface SessionStats {
  totalMinutesBreathed: number;
  totalCompletedSessions: number;
  totalCompletedBreaths: number;
  currentStreakDays: number;
  lastSessionDate: string | null;
  history: Array<{
    date: string;
    presetName: string;
    durationSeconds: number;
    cyclesCompleted: number;
  }>;
}
