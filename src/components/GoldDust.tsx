import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/site';

/** Slow-rising gold dust on a canvas. Pauses when off screen; off for reduced motion. */
export default function GoldDust({ density = 1, className = '' }: { density?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || prefersReducedMotion()) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, raf = 0, running = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    type P = { x: number; y: number; r: number; vy: number; vx: number; a: number; t: number; s: number };
    let parts: P[] = [];

    const spawn = (anywhere: boolean): P => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 8,
      r: 0.5 + Math.random() * 1.5,
      vy: 0.12 + Math.random() * 0.35,
      vx: (Math.random() - 0.5) * 0.16,
      a: 0.25 + Math.random() * 0.6,
      t: Math.random() * Math.PI * 2,
      s: 0.008 + Math.random() * 0.02,
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(90, (w * h) / 16000) * density);
      parts = Array.from({ length: count }, () => spawn(true));
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.y -= p.vy; p.x += p.vx + Math.sin(p.t) * 0.12; p.t += p.s;
        if (p.y < -8 || p.x < -8 || p.x > w + 8) Object.assign(p, spawn(false));
        const alpha = p.a * (0.55 + 0.45 * Math.sin(p.t * 2.3));
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = p.r > 1.4 ? '#F2D58A' : '#C9A24B';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!running) { running = true; raf = requestAnimationFrame(tick); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    let onScreen = false;
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen) start(); else stop();
    });
    io.observe(canvas);
    const vis = () => { if (document.hidden) stop(); else if (onScreen) start(); };
    document.addEventListener('visibilitychange', vis);
    return () => { stop(); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', vis); };
  }, [density]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
