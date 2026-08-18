'use client';

import React from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceFeedbackPillProps {
  isListening: boolean;
  message: string | null;
  lastCommand: string | null;
  onToggleVoice: () => void;
}

export function VoiceFeedbackPill({
  isListening,
  message,
  lastCommand,
  onToggleVoice,
}: VoiceFeedbackPillProps) {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1.5 pointer-events-none select-none">
      {/* Toast Feedback Notification Banner */}
      {message && (
        <div className="animate-fadeIn px-4 py-2 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-cyan-200 text-xs font-semibold backdrop-blur-xl shadow-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{message}</span>
        </div>
      )}

      {/* Persistent Listening Mic Pill */}
      {isListening && !message && (
        <div className="animate-fadeIn px-3 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium backdrop-blur-md shadow-lg flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Voice Control Listening</span>
          {lastCommand && (
            <span className="text-slate-400 text-[10px] font-mono">"{lastCommand}"</span>
          )}
        </div>
      )}
    </div>
  );
}
