import { useEffect, useRef } from 'react';
import { useVisibility, usePageVisible, useReducedMotion, useIsMobile } from '@/hooks/usePerformance';

export default function MatrixRain({ className = '', opacity = 0.04 }: { className?: string; opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useVisibility(containerRef);
  const pageVisible = usePageVisible();
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (reduced || isMobile || !isVisible || !pageVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const chars = 'アイウエオカキクケコ01{}[]<>/=+';
    const fontSize = 14;
    let columns: number;
    let drops: number[];
    const frameInterval = 1000 / 20;
    let lastFrame = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.floor(canvas.offsetWidth / (fontSize * 2));
      drops = Array(columns).fill(1).map(() => Math.random() * -50);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = (now: number) => {
      animationId = requestAnimationFrame(draw);
      if (now - lastFrame < frameInterval) return;
      lastFrame = now;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < columns; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize * 2;
        const y = drops[i] * fontSize;

        ctx.fillStyle = Math.random() > 0.5
          ? `hsla(217, 91%, 70%, 0.7)`
          : `hsla(185, 100%, 50%, 0.35)`;
        ctx.fillText(char, x, y);

        if (y > canvas.offsetHeight && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.5;
      }
    };

    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [isVisible, pageVisible, reduced, isMobile]);

  if (reduced || isMobile) return null;

  return (
    <div ref={containerRef} className={`absolute inset-0 dark:block hidden ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full pointer-events-none" style={{ opacity }} />
    </div>
  );
}
