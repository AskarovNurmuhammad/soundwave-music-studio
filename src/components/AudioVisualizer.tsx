import React, { useEffect, useRef } from 'react';
import type { VisualizerMode } from '../types';

interface AudioVisualizerProps {
  isPlaying: boolean;
  mode: VisualizerMode;
  isDark: boolean;
  colorScheme?: 'neon' | 'cyan' | 'purple';
}

export default function AudioVisualizer({ isPlaying, mode, isDark }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = canvas.parentElement?.clientHeight || 180;
    };
    resize();
    window.addEventListener('resize', resize);

    const barCount = 48;
    const barHeights = Array(barCount).fill(10);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      phase += isPlaying ? 0.08 : 0.02;

      if (mode === 'bars') {
        const barWidth = (w / barCount) * 0.75;
        const gap = (w / barCount) * 0.25;

        for (let i = 0; i < barCount; i++) {
          const targetHeight = isPlaying
            ? Math.sin(phase + i * 0.3) * (h * 0.38) + Math.cos(phase * 1.5 + i * 0.2) * (h * 0.25) + (h * 0.2)
            : Math.sin(phase + i * 0.2) * 8 + 12;

          barHeights[i] += (targetHeight - barHeights[i]) * 0.2;
          const currentH = Math.max(6, barHeights[i]);

          const x = i * (barWidth + gap) + gap / 2;
          const y = h - currentH;

          // Gradient
          const grad = ctx.createLinearGradient(0, y, 0, h);
          grad.addColorStop(0, '#ec4899');
          grad.addColorStop(0.5, '#a855f7');
          grad.addColorStop(1, '#38bdf8');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, currentH, [4, 4, 0, 0]);
          ctx.fill();
        }
      } else if (mode === 'wave') {
        ctx.beginPath();
        ctx.moveTo(0, h / 2);

        for (let x = 0; x < w; x++) {
          const amp = isPlaying ? Math.sin(phase * 0.5) * 35 + 40 : 10;
          const y = (h / 2) + Math.sin(x * 0.02 + phase) * amp + Math.cos(x * 0.035 - phase) * (amp * 0.5);
          ctx.lineTo(x, y);
        }

        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(0.5, '#ec4899');
        grad.addColorStop(1, '#a855f7');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.shadowBlur = isPlaying ? 16 : 4;
        ctx.shadowColor = '#ec4899';
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (mode === 'pulse') {
        const centerX = w / 2;
        const centerY = h / 2;
        const baseRadius = Math.min(w, h) * 0.25;

        for (let ring = 1; ring <= 3; ring++) {
          const radius = baseRadius * ring * 0.6 + (isPlaying ? Math.sin(phase * 2 - ring) * 16 : 4);
          ctx.beginPath();
          ctx.arc(centerX, centerY, Math.max(10, radius), 0, Math.PI * 2);
          ctx.strokeStyle = ring === 1 ? '#ec4899' : ring === 2 ? '#a855f7' : '#38bdf8';
          ctx.lineWidth = 3;
          ctx.globalAlpha = isPlaying ? 0.7 / ring : 0.2;
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [isPlaying, mode, isDark]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
