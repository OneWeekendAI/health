'use client';

import { useEffect } from 'react';

interface KeyShortcutOptions {
  onTogglePlay?: () => void;
  onReset?: () => void;
  onNextPhase?: () => void;
  onToggleMini?: () => void;
  onToggleSound?: () => void;
  onToggleVoice?: () => void;
  onEscape?: () => void;
  onToggleHelp?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onTogglePlay,
  onReset,
  onNextPhase,
  onToggleMini,
  onToggleSound,
  onToggleVoice,
  onEscape,
  onToggleHelp,
  enabled = true,
}: KeyShortcutOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onTogglePlay?.();
          break;
        case 'KeyR':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            onReset?.();
          }
          break;
        case 'KeyN':
        case 'ArrowRight':
          e.preventDefault();
          onNextPhase?.();
          break;
        case 'KeyM':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            onToggleMini?.();
          }
          break;
        case 'KeyS':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            onToggleSound?.();
          }
          break;
        case 'KeyV':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            onToggleVoice?.();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onEscape?.();
          break;
        case 'Slash':
          if (e.shiftKey) { // '?' key
            e.preventDefault();
            onToggleHelp?.();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    onTogglePlay,
    onReset,
    onNextPhase,
    onToggleMini,
    onToggleSound,
    onToggleVoice,
    onEscape,
    onToggleHelp,
  ]);
}
