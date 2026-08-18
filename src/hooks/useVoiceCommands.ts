'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// TypeScript declaration for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
}

interface UseVoiceCommandsProps {
  onStart: () => void;
  onPause: () => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onNextPhase: () => void;
  onSelectPresetByName: (presetName: string) => void;
  onToggleMini: (targetState?: boolean) => void;
  onToggleSound: (targetState?: boolean) => void;
}

export function useVoiceCommands({
  onStart,
  onPause,
  onTogglePlay,
  onReset,
  onNextPhase,
  onSelectPresetByName,
  onToggleMini,
  onToggleSound,
}: UseVoiceCommandsProps) {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Persistent desired active state (set only by explicit user toggle)
  const isWantedActiveRef = useRef<boolean>(false);
  const isCurrentlyRunningRef = useRef<boolean>(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Show a momentary feedback banner when a command is recognized
  const triggerFeedback = useCallback((msg: string) => {
    setFeedbackMessage(msg);
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedbackMessage(null);
    }, 2500);
  }, []);

  // Parse spoken transcript and execute corresponding action
  const processTranscript = useCallback((rawTranscript: string) => {
    const text = rawTranscript.toLowerCase().trim();
    setLastCommand(text);

    // Play/Start commands
    if (
      text.includes('start') ||
      text.includes('begin') ||
      text.includes('breathe') ||
      text.includes('resume') ||
      text.includes('play')
    ) {
      onStart();
      triggerFeedback('▶️ Voice Command: Start / Resume');
      return;
    }

    // Pause/Stop commands
    if (
      text.includes('pause') ||
      text.includes('stop') ||
      text.includes('wait') ||
      text.includes('freeze')
    ) {
      onPause();
      triggerFeedback('⏸️ Voice Command: Pause');
      return;
    }

    // Reset commands
    if (
      text.includes('reset') ||
      text.includes('restart') ||
      text.includes('start over') ||
      text.includes('from beginning')
    ) {
      onReset();
      triggerFeedback('🔄 Voice Command: Reset');
      return;
    }

    // Next phase commands
    if (
      text.includes('next') ||
      text.includes('skip') ||
      text.includes('forward')
    ) {
      onNextPhase();
      triggerFeedback('⏭️ Voice Command: Next Phase');
      return;
    }

    // Preset switching commands
    if (text.includes('box') || text.includes('box breathing') || text.includes('square')) {
      onSelectPresetByName('box');
      triggerFeedback('📦 Switched to Box Breathing');
      return;
    }

    if (
      text.includes('relax') ||
      text.includes('sleep') ||
      text.includes('478') ||
      text.includes('4 7 8') ||
      text.includes('four seven eight')
    ) {
      onSelectPresetByName('4-7-8');
      triggerFeedback('🌙 Switched to 4-7-8 Relax');
      return;
    }

    if (
      text.includes('coherent') ||
      text.includes('resonance') ||
      text.includes('resonant') ||
      text.includes('hrv')
    ) {
      onSelectPresetByName('coherent');
      triggerFeedback('✨ Switched to Coherent Breathing');
      return;
    }

    if (text.includes('sigh') || text.includes('physiological')) {
      onSelectPresetByName('sigh');
      triggerFeedback('🫁 Switched to Physiological Sigh');
      return;
    }

    // Mini mode commands
    if (text.includes('mini') || text.includes('minimize') || text.includes('compact') || text.includes('dock')) {
      onToggleMini(true);
      triggerFeedback('🗗 Entered Mini Mode');
      return;
    }

    if (text.includes('expand') || text.includes('fullscreen') || text.includes('maximize') || text.includes('full screen')) {
      onToggleMini(false);
      triggerFeedback('🗖 Restored Fullscreen');
      return;
    }

    // Sound commands
    if (text.includes('unmute') || text.includes('sound on') || text.includes('audio on')) {
      onToggleSound(true);
      triggerFeedback('🔊 Sound Enabled');
      return;
    }

    if (text.includes('mute') || text.includes('sound off') || text.includes('silence') || text.includes('audio off')) {
      onToggleSound(false);
      triggerFeedback('🔇 Sound Muted');
      return;
    }
  }, [
    onStart,
    onPause,
    onReset,
    onNextPhase,
    onSelectPresetByName,
    onToggleMini,
    onToggleSound,
    triggerFeedback,
  ]);

  // Safely initiate or restart speech recognition instance
  const initAndStartRecognition = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRec) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    // If an instance exists and is running, avoid double-start
    if (recognitionRef.current && isCurrentlyRunningRef.current) {
      return;
    }

    // Abort old instance if lingering
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isCurrentlyRunningRef.current = true;
      setIsListening(true);
    };

    recognition.onend = () => {
      isCurrentlyRunningRef.current = false;

      // If user still wants voice control active, automatically revive with 100ms debounce
      if (isWantedActiveRef.current) {
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (isWantedActiveRef.current && !isCurrentlyRunningRef.current) {
            try {
              recognition.start();
            } catch {
              // Re-instantiate if engine locked
              initAndStartRecognition();
            }
          }
        }, 150);
      } else {
        setIsListening(false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Harmless browser events when no words are spoken for a few seconds
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // Do not deactivate; onend will automatically re-listen
        return;
      }

      console.warn('Speech recognition status:', event.error);

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        isWantedActiveRef.current = false;
        isCurrentlyRunningRef.current = false;
        setIsListening(false);
        triggerFeedback('⚠️ Microphone permission denied');
      } else if (isWantedActiveRef.current) {
        // For network/temporary glitches, revive automatically
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (isWantedActiveRef.current) {
            initAndStartRecognition();
          }
        }, 300);
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      if (transcript) {
        processTranscript(transcript);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      console.warn('Error starting speech recognition:', e);
    }
  }, [processTranscript, triggerFeedback]);

  // Start voice listening (sets wantedActive to true permanently until user turns it off)
  const startListening = useCallback(() => {
    isWantedActiveRef.current = true;
    setIsListening(true);
    initAndStartRecognition();
    triggerFeedback('🎙️ Voice control active (Always On): Speak "Start", "Pause", "Box", "4-7-8"');
  }, [initAndStartRecognition, triggerFeedback]);

  // Stop voice listening (only when user explicitly toggles off)
  const stopListening = useCallback(() => {
    isWantedActiveRef.current = false;
    isCurrentlyRunningRef.current = false;
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    setIsListening(false);
    triggerFeedback('🎙️ Voice control deactivated');
  }, [triggerFeedback]);

  // Toggle voice listening
  const toggleListening = useCallback(() => {
    if (isWantedActiveRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

  // Watchdog timer: Keeps voice recognition permanently active if user has it on
  useEffect(() => {
    const watchdog = setInterval(() => {
      if (isWantedActiveRef.current && !isCurrentlyRunningRef.current) {
        initAndStartRecognition();
      }
    }, 1500);

    return () => {
      clearInterval(watchdog);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    };
  }, [initAndStartRecognition]);

  // Check browser support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRec =
        (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;
      setIsSupported(!!SpeechRec);
    }
  }, []);

  return {
    isSupported,
    isListening,
    lastCommand,
    feedbackMessage,
    startListening,
    stopListening,
    toggleListening,
  };
}
