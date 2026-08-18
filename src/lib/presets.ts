import { BreathingPreset, BreathingPhase, PhaseInfo, PhaseConfig } from '@/types/breathing';

export const DEFAULT_PRESETS: BreathingPreset[] = [
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    category: 'focus',
    description: 'Navy SEAL regulation technique to sharpen mental focus, control stress, and stabilize the nervous system.',
    benefits: ['Down-regulates cortisol', 'Sharpens situational focus', 'Balances autonomic tone'],
    config: {
      inhaleDuration: 4.0,
      holdTopDuration: 4.0,
      exhaleDuration: 4.0,
      holdBottomDuration: 4.0,
      exhaleMethod: 'mouth',
      cyclesTarget: 4,
    },
  },
  {
    id: '4-7-8-relax',
    name: '4-7-8 Relax',
    category: 'relaxation',
    description: 'Dr. Andrew Weil’s natural tranquilizer for the nervous system. Ideal for bedtime calm and anxiety release.',
    benefits: ['Induces parasympathetic surge', 'Reduces racing thoughts', 'Aids deep sleep onset'],
    config: {
      inhaleDuration: 4.0,
      holdTopDuration: 7.0,
      exhaleDuration: 8.0,
      holdBottomDuration: 0.0,
      exhaleMethod: 'mouth',
      cyclesTarget: 4,
    },
  },
  {
    id: 'coherent-resonant',
    name: 'Coherent / Resonant',
    category: 'balance',
    description: 'Synchronizes heart rate variability (HRV) and respiratory sinus arrhythmia at ~5.5 breaths per minute.',
    benefits: ['Maximizes HRV coherence', 'Optimal blood oxygenation', 'Sustained emotional poise'],
    config: {
      inhaleDuration: 5.5,
      holdTopDuration: 0.0,
      exhaleDuration: 5.5,
      holdBottomDuration: 0.0,
      exhaleMethod: 'nose',
      cyclesTarget: 10,
    },
  },
  {
    id: 'physiological-sigh',
    name: 'Physiological Sigh',
    category: 'relaxation',
    description: 'Fastest biological reset to offload CO2 and instantly drop acute stress (Dr. Andrew Huberman protocol).',
    benefits: ['Fastest acute anxiety relief', 'Re-inflates collapsed alveoli', 'Drops elevated heart rate'],
    config: {
      inhaleDuration: 3.5,
      holdTopDuration: 1.0,
      exhaleDuration: 6.0,
      holdBottomDuration: 1.0,
      exhaleMethod: 'mouth',
      cyclesTarget: 5,
    },
  },
  {
    id: 'pranayama-clarity',
    name: 'Pranayama Clarity',
    category: 'energy',
    description: 'Rhythmic yogic breathwork to cultivate alert calmness, mental presence, and balanced oxygen flow.',
    benefits: ['Boosts oxygen saturation', 'Clears mental fog', 'Grounds physical energy'],
    config: {
      inhaleDuration: 4.0,
      holdTopDuration: 2.0,
      exhaleDuration: 4.0,
      holdBottomDuration: 2.0,
      exhaleMethod: 'nose',
      cyclesTarget: 8,
    },
  },
];

export const PHASE_METADATA: Record<BreathingPhase, (exhaleMethod: 'mouth' | 'nose') => PhaseInfo> = {
  INHALE: () => ({
    phase: 'INHALE',
    name: 'Inhale',
    actionText: 'Inhale through Nose',
    anatomicalHint: 'Expand your diaphragm and fill the belly gently',
    airflowSource: 'nose',
    color: {
      primary: '#06b6d4', // Cyan 500
      glow: 'rgba(6, 182, 212, 0.45)',
      text: 'text-cyan-400',
      border: 'border-cyan-500/40',
      bgGradient: 'from-cyan-500/20 via-teal-500/10 to-transparent',
      badgeBg: 'bg-cyan-950/80 text-cyan-200 border-cyan-400/40',
    },
  }),
  HOLD_TOP: () => ({
    phase: 'HOLD_TOP',
    name: 'Hold',
    actionText: 'Hold breath',
    anatomicalHint: 'Lungs full. Soften shoulders, remain still and relaxed',
    airflowSource: 'still',
    color: {
      primary: '#f59e0b', // Amber 500
      glow: 'rgba(245, 158, 11, 0.45)',
      text: 'text-amber-400',
      border: 'border-amber-500/40',
      bgGradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
      badgeBg: 'bg-amber-950/80 text-amber-200 border-amber-400/40',
    },
  }),
  EXHALE: (exhaleMethod: 'mouth' | 'nose') => ({
    phase: 'EXHALE',
    name: 'Exhale',
    actionText: exhaleMethod === 'mouth' ? 'Exhale through Mouth' : 'Exhale through Nose',
    anatomicalHint: exhaleMethod === 'mouth' ? 'Release steady stream with pursed lips' : 'Smooth, quiet outflow through the nostrils',
    airflowSource: exhaleMethod,
    color: {
      primary: '#818cf8', // Indigo 400
      glow: 'rgba(129, 140, 248, 0.45)',
      text: 'text-indigo-400',
      border: 'border-indigo-500/40',
      bgGradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
      badgeBg: 'bg-indigo-950/80 text-indigo-200 border-indigo-400/40',
    },
  }),
  HOLD_BOTTOM: () => ({
    phase: 'HOLD_BOTTOM',
    name: 'Hold',
    actionText: 'Hold breath',
    anatomicalHint: 'Lungs empty. Rest in stillness without tension',
    airflowSource: 'still',
    color: {
      primary: '#10b981', // Emerald 500
      glow: 'rgba(16, 185, 129, 0.45)',
      text: 'text-emerald-400',
      border: 'border-emerald-500/40',
      bgGradient: 'from-emerald-500/20 via-slate-500/10 to-transparent',
      badgeBg: 'bg-emerald-950/80 text-emerald-200 border-emerald-400/40',
    },
  }),
};

export const INITIAL_CONFIG: PhaseConfig = {
  inhaleDuration: 4.0,
  holdTopDuration: 4.0,
  exhaleDuration: 4.0,
  holdBottomDuration: 4.0,
  exhaleMethod: 'mouth',
  cyclesTarget: 4,
};
