'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { BreathingPhase, SoundConfig } from '@/types/breathing';
import { safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils';

const SOUND_STORAGE_KEY = 'breath_sound_settings_v1';

const DEFAULT_SOUND_CONFIG: SoundConfig = {
  enabled: true,
  volume: 0.65,
  soundType: 'singing_bowl',
  ambientDrone: false,
  ambientVolume: 0.25,
};

export function useAudioSynthesizer() {
  const [config, setConfig] = useState<SoundConfig>(DEFAULT_SOUND_CONFIG);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneNodesRef = useRef<{
    gainNode: GainNode | null;
    osc1: OscillatorNode | null;
    osc2: OscillatorNode | null;
    filter: BiquadFilterNode | null;
  }>({
    gainNode: null,
    osc1: null,
    osc2: null,
    filter: null,
  });

  // Load settings on mount
  useEffect(() => {
    const saved = safeLocalStorageGet<SoundConfig>(SOUND_STORAGE_KEY, DEFAULT_SOUND_CONFIG);
    setConfig(saved);
  }, []);

  // Save settings when changed
  const updateConfig = useCallback((newConfig: Partial<SoundConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      safeLocalStorageSet(SOUND_STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  // Initialize or resume AudioContext
  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Play phase transition sound
  const playPhaseChime = useCallback((phase: BreathingPhase) => {
    if (!config.enabled) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(config.volume * 0.35, now);
    masterGain.connect(ctx.destination);

    // Frequencies tailored to phases for biological emotional cueing
    // Inhale: Uplifting 432Hz (A4) / 540Hz (C#5)
    // Hold Top: Shimmering 528Hz (Love/Transformation) / 660Hz
    // Exhale: Grounding, relaxing 288Hz (D4) / 360Hz (F#4)
    // Hold Bottom: Deep stillness 216Hz (A3) / 324Hz (E4)
    let baseFreq = 432;
    let overtoneFreq = 648;
    let attack = 0.05;
    let release = 2.4;

    switch (phase) {
      case 'INHALE':
        baseFreq = 432;
        overtoneFreq = 648;
        attack = 0.08;
        release = 2.2;
        break;
      case 'HOLD_TOP':
        baseFreq = 528;
        overtoneFreq = 792;
        attack = 0.04;
        release = 2.0;
        break;
      case 'EXHALE':
        baseFreq = 288;
        overtoneFreq = 432;
        attack = 0.12;
        release = 2.8;
        break;
      case 'HOLD_BOTTOM':
        baseFreq = 216;
        overtoneFreq = 324;
        attack = 0.06;
        release = 2.2;
        break;
    }

    if (config.soundType === 'singing_bowl') {
      // Singing bowl simulation with 3 harmonic partials & subtle vibrato
      const partials = [
        { freq: baseFreq, mult: 1.0, gain: 0.6 },
        { freq: overtoneFreq, mult: 1.5, gain: 0.3 },
        { freq: baseFreq * 2.76, mult: 2.76, gain: 0.1 },
      ];

      partials.forEach(({ freq, gain: partGain }) => {
        const osc = ctx.createOscillator();
        const pGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Gentle pitch drop characteristic of singing bowls
        osc.frequency.exponentialRampToValueAtTime(freq * 0.992, now + release);

        pGain.gain.setValueAtTime(0.0001, now);
        pGain.gain.exponentialRampToValueAtTime(partGain, now + attack);
        pGain.gain.exponentialRampToValueAtTime(0.00001, now + release);

        osc.connect(pGain);
        pGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + release + 0.1);
      });
    } else if (config.soundType === 'soft_bell') {
      // Soft temple bell chime
      const osc = ctx.createOscillator();
      const bellGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * 1.5, now);

      bellGain.gain.setValueAtTime(0.0001, now);
      bellGain.gain.exponentialRampToValueAtTime(0.8, now + 0.02);
      bellGain.gain.exponentialRampToValueAtTime(0.00001, now + 1.6);

      osc.connect(bellGain);
      bellGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 1.8);
    } else if (config.soundType === 'zen_harp') {
      // Warm plucked resonant harmonic
      const freqs = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const pluckGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.05);

        pluckGain.gain.setValueAtTime(0.0001, now + idx * 0.05);
        pluckGain.gain.exponentialRampToValueAtTime(0.5, now + idx * 0.05 + 0.03);
        pluckGain.gain.exponentialRampToValueAtTime(0.00001, now + idx * 0.05 + 1.8);

        osc.connect(pluckGain);
        pluckGain.connect(masterGain);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 2.0);
      });
    } else {
      // Pure sine wave tone
      const osc = ctx.createOscillator();
      const sineGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);

      sineGain.gain.setValueAtTime(0.0001, now);
      sineGain.gain.exponentialRampToValueAtTime(0.7, now + 0.05);
      sineGain.gain.exponentialRampToValueAtTime(0.00001, now + 1.8);

      osc.connect(sineGain);
      sineGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 2.0);
    }
  }, [config, getAudioContext]);

  // Ambient swell / drone management
  const updateAmbientDrone = useCallback((isActive: boolean, phase: BreathingPhase, phaseProgress: number) => {
    if (!config.ambientDrone || !config.enabled || !isActive) {
      if (droneNodesRef.current.gainNode) {
        const ctx = audioCtxRef.current;
        if (ctx) {
          droneNodesRef.current.gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
        }
      }
      return;
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    if (!droneNodesRef.current.gainNode) {
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(108, ctx.currentTime); // Sub-bass root

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(162, ctx.currentTime); // Harmonic fifth

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      droneNodesRef.current = { gainNode: masterGain, osc1, osc2, filter };
    }

    // Modulate ambient filter and volume based on breath phase & progress
    const now = ctx.currentTime;
    const targetBaseVol = config.ambientVolume * config.volume * 0.4;

    if (phase === 'INHALE') {
      const vol = targetBaseVol * (0.5 + 0.5 * phaseProgress);
      const cutoff = 240 + 260 * phaseProgress;
      droneNodesRef.current.gainNode?.gain.setTargetAtTime(vol, now, 0.1);
      droneNodesRef.current.filter?.frequency.setTargetAtTime(cutoff, now, 0.1);
    } else if (phase === 'HOLD_TOP') {
      droneNodesRef.current.gainNode?.gain.setTargetAtTime(targetBaseVol, now, 0.1);
      droneNodesRef.current.filter?.frequency.setTargetAtTime(500, now, 0.1);
    } else if (phase === 'EXHALE') {
      const vol = targetBaseVol * (1.0 - 0.5 * phaseProgress);
      const cutoff = 500 - 260 * phaseProgress;
      droneNodesRef.current.gainNode?.gain.setTargetAtTime(vol, now, 0.1);
      droneNodesRef.current.filter?.frequency.setTargetAtTime(cutoff, now, 0.1);
    } else {
      // HOLD_BOTTOM
      droneNodesRef.current.gainNode?.gain.setTargetAtTime(targetBaseVol * 0.4, now, 0.1);
      droneNodesRef.current.filter?.frequency.setTargetAtTime(220, now, 0.1);
    }
  }, [config, getAudioContext]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (droneNodesRef.current.osc1) {
        try {
          droneNodesRef.current.osc1.stop();
          droneNodesRef.current.osc2?.stop();
        } catch {}
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    config,
    updateConfig,
    playPhaseChime,
    updateAmbientDrone,
    initAudio: getAudioContext,
  };
}
