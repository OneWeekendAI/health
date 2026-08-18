'use client';

import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeybindGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeybindGuideModal({ isOpen, onClose }: KeybindGuideModalProps) {
  if (!isOpen) return null;

  const keybinds = [
    { key: 'Space', desc: 'Start, Pause, or Resume breathing session' },
    { key: 'R', desc: 'Reset timer back to cycle 1 Inhale' },
    { key: 'N or →', desc: 'Immediately advance to next breath phase' },
    { key: 'M', desc: 'Toggle compact multitasking Mini Mode' },
    { key: 'S', desc: 'Mute / unmute audio chimes and ambient sound' },
    { key: 'V', desc: 'Toggle hands-free voice command listening' },
    { key: 'Esc', desc: 'Exit mini mode or close active settings modal' },
    { key: '?', desc: 'Open this keyboard shortcut reference guide' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="keybind-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-white/15 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-5 h-5 text-cyan-400" />
            <h2 id="keybind-guide-title" className="text-lg font-bold text-white">
              Desktop Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-2.5">
          {keybinds.map((kb, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-white/5 text-xs"
            >
              <span className="text-slate-300">{kb.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-slate-950 border border-white/20 text-cyan-300 font-mono font-bold shadow-inner">
                {kb.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
