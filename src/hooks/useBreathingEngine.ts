'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { BreathingPhase, PhaseConfig, EngineState } from '@/types/breathing';

interface UseBreathingEngineProps {
  config: PhaseConfig;
  onPhaseChange?: (phase: BreathingPhase) => void;
  onCycleComplete?: (cycle: number) => void;
  onSessionComplete?: (totalSeconds: number) => void;
}

export function useBreathingEngine({
  config,
  onPhaseChange,
  onCycleComplete,
  onSessionComplete,
}: UseBreathingEngineProps) {
  // Primary state for rendering
  const [engineState, setEngineState] = useState<EngineState>({
    status: 'idle',
    currentPhase: 'INHALE',
    phaseDuration: config.inhaleDuration,
    elapsedInPhase: 0,
    remainingInPhase: config.inhaleDuration,
    phaseProgress: 0,
    overallProgress: 0,
    currentCycle: 1,
    targetCycles: config.cyclesTarget,
    totalSessionTime: 0,
    isTransitioning: false,
  });

  // Accurate rAF and timing refs
  const configRef = useRef(config);
  configRef.current = config;

  const onPhaseChangeRef = useRef(onPhaseChange);
  onPhaseChangeRef.current = onPhaseChange;

  const onCycleCompleteRef = useRef(onCycleComplete);
  onCycleCompleteRef.current = onCycleComplete;

  const onSessionCompleteRef = useRef(onSessionComplete);
  onSessionCompleteRef.current = onSessionComplete;

  const statusRef = useRef<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const currentPhaseRef = useRef<BreathingPhase>('INHALE');
  const currentCycleRef = useRef<number>(1);
  const phaseStartTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const pauseAccumulatorRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number>(0);
  const totalPausedTimeRef = useRef<number>(0);

  const rafIdRef = useRef<number | null>(null);

  // Helper to determine the duration for any phase
  const getPhaseDuration = useCallback((phase: BreathingPhase, cfg: PhaseConfig): number => {
    switch (phase) {
      case 'INHALE':
        return Math.max(0.5, cfg.inhaleDuration);
      case 'HOLD_TOP':
        return Math.max(0, cfg.holdTopDuration);
      case 'EXHALE':
        return Math.max(0.5, cfg.exhaleDuration);
      case 'HOLD_BOTTOM':
        return Math.max(0, cfg.holdBottomDuration);
    }
  }, []);

  // Helper to get next phase in the sequence, skipping 0-duration holds
  const getNextValidPhase = useCallback((
    current: BreathingPhase,
    cfg: PhaseConfig
  ): { nextPhase: BreathingPhase; isNewCycle: boolean } => {
    const sequence: BreathingPhase[] = ['INHALE', 'HOLD_TOP', 'EXHALE', 'HOLD_BOTTOM'];
    let currentIndex = sequence.indexOf(current);
    let isNewCycle = false;

    // Search forward for the next phase with duration > 0
    for (let i = 1; i <= 4; i++) {
      const nextIdx = (currentIndex + i) % 4;
      if (nextIdx === 0 && currentIndex !== 0) {
        isNewCycle = true;
      }
      const candidate = sequence[nextIdx];
      const duration = getPhaseDuration(candidate, cfg);
      if (duration > 0) {
        return { nextPhase: candidate, isNewCycle };
      }
    }

    // Default fallback to Inhale
    return { nextPhase: 'INHALE', isNewCycle: true };
  }, [getPhaseDuration]);

  // Transition to a specific phase
  const transitionToPhase = useCallback((
    nextPhase: BreathingPhase,
    isNewCycle: boolean,
    now: number
  ) => {
    const cfg = configRef.current;
    let nextCycle = currentCycleRef.current;

    if (isNewCycle) {
      onCycleCompleteRef.current?.(nextCycle);
      nextCycle += 1;

      // Check if target cycles completed
      if (cfg.cyclesTarget > 0 && nextCycle > cfg.cyclesTarget) {
        statusRef.current = 'completed';
        const totalSessionSeconds = (now - sessionStartTimeRef.current - totalPausedTimeRef.current) / 1000;
        setEngineState((prev) => ({
          ...prev,
          status: 'completed',
          currentPhase: 'HOLD_BOTTOM',
          phaseDuration: 0,
          elapsedInPhase: 0,
          remainingInPhase: 0,
          phaseProgress: 1,
          overallProgress: 1,
          totalSessionTime: totalSessionSeconds,
          isTransitioning: false,
        }));
        onSessionCompleteRef.current?.(totalSessionSeconds);
        return;
      }

      currentCycleRef.current = nextCycle;
    }

    currentPhaseRef.current = nextPhase;
    phaseStartTimeRef.current = now;
    pauseAccumulatorRef.current = 0;

    const duration = getPhaseDuration(nextPhase, cfg);
    onPhaseChangeRef.current?.(nextPhase);

    setEngineState((prev) => ({
      ...prev,
      currentPhase: nextPhase,
      phaseDuration: duration,
      elapsedInPhase: 0,
      remainingInPhase: duration,
      phaseProgress: 0,
      currentCycle: nextCycle,
      isTransitioning: true,
    }));

    // Reset transition flag quickly
    setTimeout(() => {
      setEngineState((prev) => ({ ...prev, isTransitioning: false }));
    }, 150);
  }, [getPhaseDuration]);

  // Main animation frame loop
  const tick = useCallback(() => {
    if (statusRef.current !== 'running') return;

    const now = performance.now();
    const cfg = configRef.current;
    const currentPhase = currentPhaseRef.current;
    const duration = getPhaseDuration(currentPhase, cfg);

    // Calculate elapsed time in active phase taking into account pause accumulators
    const elapsedSeconds = Math.max(0, (now - phaseStartTimeRef.current - pauseAccumulatorRef.current) / 1000);

    if (elapsedSeconds >= duration) {
      // Phase completed: advance to next phase
      const { nextPhase, isNewCycle } = getNextValidPhase(currentPhase, cfg);
      transitionToPhase(nextPhase, isNewCycle, now);
    } else {
      // Update state for current frame
      const remainingSeconds = Math.max(0, duration - elapsedSeconds);
      const progress = Math.min(1, Math.max(0, elapsedSeconds / duration));

      const totalActiveTime = Math.max(
        0,
        (now - sessionStartTimeRef.current - totalPausedTimeRef.current) / 1000
      );

      setEngineState((prev) => ({
        ...prev,
        status: 'running',
        currentPhase,
        phaseDuration: duration,
        elapsedInPhase: elapsedSeconds,
        remainingInPhase: remainingSeconds,
        phaseProgress: progress,
        totalSessionTime: totalActiveTime,
      }));
    }

    rafIdRef.current = requestAnimationFrame(tick);
  }, [getPhaseDuration, getNextValidPhase, transitionToPhase]);

  // Start breathing engine
  const start = useCallback(() => {
    const now = performance.now();

    if (statusRef.current === 'paused') {
      // Resuming from pause
      const pausedDuration = now - pausedAtRef.current;
      pauseAccumulatorRef.current += pausedDuration;
      totalPausedTimeRef.current += pausedDuration;
      statusRef.current = 'running';
      setEngineState((prev) => ({ ...prev, status: 'running' }));
    } else {
      // Fresh start
      statusRef.current = 'running';
      currentPhaseRef.current = 'INHALE';
      currentCycleRef.current = 1;
      phaseStartTimeRef.current = now;
      sessionStartTimeRef.current = now;
      pauseAccumulatorRef.current = 0;
      totalPausedTimeRef.current = 0;

      const duration = getPhaseDuration('INHALE', configRef.current);
      onPhaseChangeRef.current?.('INHALE');

      setEngineState({
        status: 'running',
        currentPhase: 'INHALE',
        phaseDuration: duration,
        elapsedInPhase: 0,
        remainingInPhase: duration,
        phaseProgress: 0,
        overallProgress: 0,
        currentCycle: 1,
        targetCycles: configRef.current.cyclesTarget,
        totalSessionTime: 0,
        isTransitioning: false,
      });
    }

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    rafIdRef.current = requestAnimationFrame(tick);
  }, [getPhaseDuration, tick]);

  // Pause breathing engine
  const pause = useCallback(() => {
    if (statusRef.current !== 'running') return;

    statusRef.current = 'paused';
    pausedAtRef.current = performance.now();

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    setEngineState((prev) => ({ ...prev, status: 'paused' }));
  }, []);

  // Toggle start / pause
  const togglePlayPause = useCallback(() => {
    if (statusRef.current === 'running') {
      pause();
    } else {
      start();
    }
  }, [pause, start]);

  // Reset breathing engine
  const reset = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    statusRef.current = 'idle';
    currentPhaseRef.current = 'INHALE';
    currentCycleRef.current = 1;
    phaseStartTimeRef.current = 0;
    pauseAccumulatorRef.current = 0;
    totalPausedTimeRef.current = 0;

    const initialDuration = getPhaseDuration('INHALE', configRef.current);

    setEngineState({
      status: 'idle',
      currentPhase: 'INHALE',
      phaseDuration: initialDuration,
      elapsedInPhase: 0,
      remainingInPhase: initialDuration,
      phaseProgress: 0,
      overallProgress: 0,
      currentCycle: 1,
      targetCycles: configRef.current.cyclesTarget,
      totalSessionTime: 0,
      isTransitioning: false,
    });
  }, [getPhaseDuration]);

  // Manually jump to next phase
  const skipToNextPhase = useCallback(() => {
    const now = performance.now();
    const cfg = configRef.current;
    const currentPhase = currentPhaseRef.current;
    const { nextPhase, isNewCycle } = getNextValidPhase(currentPhase, cfg);

    if (statusRef.current === 'idle') {
      start();
    } else {
      transitionToPhase(nextPhase, isNewCycle, now);
    }
  }, [getNextValidPhase, start, transitionToPhase]);

  // Update target cycles if config changes while idle
  useEffect(() => {
    if (statusRef.current === 'idle') {
      const initialDuration = getPhaseDuration('INHALE', config);
      setEngineState((prev) => ({
        ...prev,
        phaseDuration: initialDuration,
        remainingInPhase: initialDuration,
        targetCycles: config.cyclesTarget,
      }));
    }
  }, [config, getPhaseDuration]);

  // Clean up rAF loop on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    engineState,
    start,
    pause,
    togglePlayPause,
    reset,
    skipToNextPhase,
    status: engineState.status,
  };
}
