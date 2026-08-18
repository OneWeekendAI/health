'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { BreathingPhase, EngineStatus } from '@/types/breathing';
import { easeInOutCubic, easeInOutSine } from '@/lib/utils';
import { PHASE_METADATA } from '@/lib/presets';

interface VisualPacerProps {
  phase: BreathingPhase;
  progress: number; // 0.0 to 1.0 in current phase
  status: EngineStatus;
  exhaleMethod: 'mouth' | 'nose';
  size?: 'normal' | 'mini';
}

export function VisualPacer({
  phase,
  progress,
  status,
  exhaleMethod,
  size = 'normal',
}: VisualPacerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    radius: number;
    angle: number;
    dist: number;
    speed: number;
    alpha: number;
  }>>([]);

  const phaseMeta = useMemo(() => {
    return PHASE_METADATA[phase](exhaleMethod);
  }, [phase, exhaleMethod]);

  // Calculate current scale from 0.55 to 1.0 based on phase and easing
  const scale = useMemo(() => {
    if (status === 'idle') return 0.55;

    const eased = easeInOutCubic(progress);

    switch (phase) {
      case 'INHALE':
        // 0.55 -> 1.0
        return 0.55 + (1.0 - 0.55) * eased;
      case 'HOLD_TOP':
        // Steady 1.0 with subtle gentle shimmer
        return 1.0 + 0.015 * Math.sin(progress * Math.PI * 4);
      case 'EXHALE':
        // 1.0 -> 0.55
        return 1.0 - (1.0 - 0.55) * eased;
      case 'HOLD_BOTTOM':
        // Steady 0.55 with gentle stillness pulse
        return 0.55 + 0.01 * Math.sin(progress * Math.PI * 2);
      default:
        return 0.55;
    }
  }, [phase, progress, status]);

  // Dynamic opacity for inner energy core
  const coreOpacity = useMemo(() => {
    if (status === 'idle') return 0.4;
    return 0.6 + 0.4 * (scale - 0.55) / 0.45;
  }, [scale, status]);

  // Particle background simulation on Canvas for immersive atmosphere
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size === 'mini') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = 460);
    const height = (canvas.height = 460);
    const centerX = width / 2;
    const centerY = height / 2;

    // Initialize particles once
    if (particlesRef.current.length === 0) {
      const numParticles = 40;
      for (let i = 0; i < numParticles; i++) {
        particlesRef.current.push({
          x: 0,
          y: 0,
          radius: Math.random() * 2 + 1,
          angle: Math.random() * Math.PI * 2,
          dist: Math.random() * 160 + 40,
          speed: (Math.random() * 0.4 + 0.2) * (Math.random() > 0.5 ? 1 : -1),
          alpha: Math.random() * 0.5 + 0.2,
        });
      }
    }

    let animationFrameId: number;

    const renderParticles = () => {
      ctx.clearRect(0, 0, width, height);

      const color = phaseMeta.color.primary;

      particlesRef.current.forEach((p) => {
        // Particles drift dynamically
        p.angle += p.speed * 0.02;

        if (status === 'running') {
          if (phase === 'INHALE') {
            // Draw inward towards center
            p.dist = Math.max(30, p.dist - 0.6);
            if (p.dist <= 35) p.dist = 180;
          } else if (phase === 'EXHALE') {
            // Expand outward from center
            p.dist = Math.min(190, p.dist + 0.7);
            if (p.dist >= 185) p.dist = 40;
          }
        }

        const px = centerX + Math.cos(p.angle) * p.dist;
        const py = centerY + Math.sin(p.angle) * p.dist;

        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.alpha * (status === 'running' ? 0.7 : 0.25);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(renderParticles);
    };

    renderParticles();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [phase, status, phaseMeta.color.primary, size]);

  if (size === 'mini') {
    return (
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Ambient Ring */}
        <div
          className="absolute inset-0 rounded-full transition-colors duration-700"
          style={{
            background: `radial-gradient(circle, ${phaseMeta.color.glow} 0%, transparent 70%)`,
          }}
        />
        {/* Outer Guide */}
        <div className="absolute w-24 h-24 rounded-full border border-white/10" />
        {/* Dynamic Mini Orb */}
        <div
          className="rounded-full shadow-lg transition-transform duration-75 ease-linear"
          style={{
            width: '80px',
            height: '80px',
            transform: `scale(${scale})`,
            backgroundColor: phaseMeta.color.primary,
            boxShadow: `0 0 20px ${phaseMeta.color.glow}`,
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative w-[340px] h-[340px] md:w-[420px] md:h-[420px] flex items-center justify-center select-none">
      {/* Background Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-75"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Atmospheric Outer Glow Aura */}
      <div
        className="absolute inset-0 rounded-full transition-all duration-700 pointer-events-none blur-3xl"
        style={{
          background: `radial-gradient(circle, ${phaseMeta.color.glow} 0%, transparent 65%)`,
          opacity: status === 'running' ? 0.85 : 0.35,
          transform: `scale(${scale * 1.15})`,
        }}
      />

      {/* Concentric Reference Rings (Lung Full Capacity Guide) */}
      <div className="absolute inset-2 md:inset-4 rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute inset-10 md:inset-12 rounded-full border border-white/10 border-dashed pointer-events-none" />
      <div className="absolute inset-20 md:inset-24 rounded-full border border-white/5 pointer-events-none" />

      {/* Outer Pulse Wave Ring */}
      <div
        className="absolute rounded-full border pointer-events-none transition-all duration-75"
        style={{
          width: '320px',
          height: '320px',
          borderColor: phaseMeta.color.primary,
          opacity: status === 'running' ? 0.25 : 0.1,
          transform: `scale(${scale * 1.05})`,
          boxShadow: `0 0 35px ${phaseMeta.color.glow}`,
        }}
      />

      {/* Sacred Geometry / Secondary Fluid Orb Ring */}
      <div
        className="absolute rounded-full pointer-events-none transition-transform duration-75 ease-linear"
        style={{
          width: '280px',
          height: '280px',
          transform: `scale(${scale * 0.95}) rotate(${progress * 90}deg)`,
          background: `conic-gradient(from 0deg at 50% 50%, ${phaseMeta.color.glow}, transparent, ${phaseMeta.color.glow})`,
          opacity: 0.3,
          filter: 'blur(8px)',
        }}
      />

      {/* Central Visual Dynamic Pacer Orb */}
      <div
        className="relative rounded-full flex items-center justify-center shadow-2xl transition-transform duration-75 ease-linear"
        style={{
          width: '260px',
          height: '260px',
          transform: `scale(${scale})`,
          background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4) 0%, ${phaseMeta.color.primary} 45%, #050811 100%)`,
          boxShadow: `0 0 50px ${phaseMeta.color.glow}, inset 0 0 30px rgba(255,255,255,0.25)`,
        }}
      >
        {/* Inner Luminous Core */}
        <div
          className="w-28 h-28 rounded-full pointer-events-none transition-opacity duration-300"
          style={{
            opacity: coreOpacity,
            background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.1) 70%, transparent 100%)',
            filter: 'blur(6px)',
          }}
        />

        {/* Dynamic Capacity Ring Meter */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox="0 0 260 260"
        >
          <circle
            cx="130"
            cy="130"
            r="120"
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="3"
          />
          <circle
            cx="130"
            cy="130"
            r="120"
            fill="none"
            stroke={phaseMeta.color.primary}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - progress)}
            style={{
              transition: status === 'running' ? 'none' : 'stroke-dashoffset 0.3s ease',
              filter: `drop-shadow(0 0 6px ${phaseMeta.color.primary})`,
            }}
          />
        </svg>
      </div>
    </div>
  );
}
