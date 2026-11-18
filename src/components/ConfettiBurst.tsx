import React, { useEffect, useRef } from 'react';

export interface ConfettiTrigger {
  id: number;
  x?: number;
  y?: number;
}

interface ConfettiBurstProps {
  trigger: ConfettiTrigger | null;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  isCircle: boolean;
  alpha: number;
}

const BLUSH_MAUVE_CONFETTI_COLORS = [
  '#F0C9D3',
  '#E0A0B2',
  '#7B5A66',
  '#F6E6EA',
  '#D48AA0',
  '#A64D79',
];

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({ trigger }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trigger) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const originX = trigger.x ?? width / 2;
    const originY = trigger.y ?? height * 0.38;

    const count = 36;
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.15;
      const speed = 2.6 + Math.random() * 5.2;
      particlesRef.current.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: 4 + Math.random() * 4.5,
        color:
          BLUSH_MAUVE_CONFETTI_COLORS[
            Math.floor(Math.random() * BLUSH_MAUVE_CONFETTI_COLORS.length)
          ],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.24,
        isCircle: Math.random() > 0.65,
        alpha: 1,
      });
    }

    const animate = () => {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const active: Particle[] = [];
      for (const p of particlesRef.current) {
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 + 0.2;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.alpha -= 0.015;

        if (p.alpha > 0.02 && p.y < height + 20) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;

          if (p.isCircle) {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.48, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size / 2, -p.size * 0.32, p.size, p.size * 0.64);
          }
          ctx.restore();
          active.push(p);
        }
      }

      ctx.restore();
      particlesRef.current = active;

      if (active.length > 0) {
        rafRef.current = window.requestAnimationFrame(animate);
      } else {
        rafRef.current = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    if (rafRef.current === null) {
      rafRef.current = window.requestAnimationFrame(animate);
    }
  }, [trigger]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-50"
    />
  );
};
