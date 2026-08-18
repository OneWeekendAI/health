'use client';

import React from 'react';
import { X, Mic, Play, Pause, RotateCcw, SkipForward, Layers, Volume2, Sparkles } from 'lucide-react';

interface VoiceCommandsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isListening: boolean;
  onToggleVoice: () => void;
}

export function VoiceCommandsModal({
  isOpen,
  onClose,
  isListening,
  onToggleVoice,
}: VoiceCommandsModalProps) {
  if (!isOpen) return null;

  const categories = [
    {
      title: 'Session Control',
      commands: [
        { spoken: '"Start", "Begin", "Breathe"', desc: 'Starts or resumes breathing timer' },
        { spoken: '"Pause", "Stop", "Wait"', desc: 'Pauses active breathing cycle' },
        { spoken: '"Reset", "Restart"', desc: 'Resets back to cycle 1' },
        { spoken: '"Next", "Skip"', desc: 'Advances immediately to next phase' },
      ],
    },
    {
      title: 'Presets & Flow',
      commands: [
        { spoken: '"Box", "Box Breathing"', desc: 'Activates 4-4-4-4 Box Breathing' },
        { spoken: '"Relax", "4-7-8", "Sleep"', desc: 'Activates 4-7-8 Relax protocol' },
        { spoken: '"Coherent", "Resonant"', desc: 'Activates 5.5s HRV Coherent flow' },
        { spoken: '"Sigh", "Physiological"', desc: 'Activates physiological sigh protocol' },
      ],
    },
    {
      title: 'Display & Audio',
      commands: [
        { spoken: '"Mini", "Minimize"', desc: 'Enters corner mini multitasking mode' },
        { spoken: '"Expand", "Fullscreen"', desc: 'Restores standard full-screen view' },
        { spoken: '"Mute", "Sound Off"', desc: 'Mutes transition chimes and audio' },
        { spoken: '"Unmute", "Sound On"', desc: 'Enables audio feedback' },
      ],
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/15 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <Mic className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 id="voice-modal-title" className="text-lg font-bold text-white">
                Hands-Free Voice Commands
              </h2>
              <p className="text-xs text-slate-400">
                Control your meditation and breathing flow without opening your eyes or touching keys.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Toggle Voice Banner */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-white/10">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  isListening
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-white/5'
                }`}
              >
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-white text-sm block">
                  {isListening ? 'Microphone Active' : 'Microphone Inactive'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isListening
                    ? 'Listening continuously for voice triggers'
                    : 'Click to start continuous speech recognition'}
                </span>
              </div>
            </div>

            <button
              onClick={onToggleVoice}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                isListening
                  ? 'bg-rose-500/80 hover:bg-rose-500 text-white shadow-rose-900/30'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-900/30'
              }`}
            >
              {isListening ? 'Turn Off' : 'Enable Voice (V)'}
            </button>
          </div>

          {/* Command Reference Categories */}
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {cat.title}
              </h3>
              <div className="space-y-1.5">
                {cat.commands.map((cmd, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/30 border border-white/5 text-xs"
                  >
                    <span className="text-slate-300">{cmd.desc}</span>
                    <span className="font-mono font-bold text-cyan-300 bg-slate-950 px-2 py-0.5 rounded-md border border-white/10">
                      {cmd.spoken}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-200">V</kbd> anytime to toggle microphone
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
