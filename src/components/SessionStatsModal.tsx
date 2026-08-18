'use client';

import React from 'react';
import { SessionStats } from '@/types/breathing';
import { X, Flame, Clock, CheckCircle2, Trophy, RotateCcw, Calendar } from 'lucide-react';
import { formatTimeMMSS } from '@/lib/utils';

interface SessionStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: SessionStats;
  onResetStats: () => void;
}

export function SessionStatsModal({
  isOpen,
  onClose,
  stats,
  onResetStats,
}: SessionStatsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="stats-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/15 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 id="stats-modal-title" className="text-lg font-bold text-white">
              Mindfulness & Breath Stats
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
        <div className="p-5 space-y-4">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Minutes */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Time</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <span className="text-2xl font-black font-mono text-white">
                  {stats.totalMinutesBreathed.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400 ml-1">mins</span>
              </div>
            </div>

            {/* Streak */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Streak</span>
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="text-2xl font-black font-mono text-white">
                  {stats.currentStreakDays}
                </span>
                <span className="text-xs text-slate-400 ml-1">days</span>
              </div>
            </div>

            {/* Total Sessions */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Sessions</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-2xl font-black font-mono text-white">
                  {stats.totalCompletedSessions}
                </span>
                <span className="text-xs text-slate-400 ml-1">completed</span>
              </div>
            </div>

            {/* Total Breaths */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Breath Cycles</span>
                <Calendar className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <span className="text-2xl font-black font-mono text-white">
                  {stats.totalCompletedBreaths}
                </span>
                <span className="text-xs text-slate-400 ml-1">cycles</span>
              </div>
            </div>
          </div>

          {/* Recent History Log */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Recent Session History
            </span>
            <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-2xl bg-slate-950/40 border border-white/5 p-2">
              {stats.history.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No sessions recorded yet. Start your first session to track progress!
                </div>
              ) : (
                stats.history.slice(0, 10).map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/30 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white block">{h.presetName}</span>
                      <span className="text-[10px] text-slate-400">{h.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-cyan-300 font-bold block">
                        {formatTimeMMSS(h.durationSeconds)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {h.cyclesCompleted} cycles
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all breathing statistics?')) {
                onResetStats();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400/80 hover:text-rose-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset History</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
