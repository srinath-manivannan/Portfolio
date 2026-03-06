import { useEffect, useState, useCallback, useRef } from 'react';
import { useReducedMotion, useIsMobile } from '@/hooks/usePerformance';

export default function CursorGlow() {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const [visible, setVisible] = useState(false);
  const glowRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -200, y: -200 });
  const rafRef = useRef<number>();

  useEffect(() => {
    if (reduced || isMobile) return;

    const update = () => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${posRef.current.x - 150}px, ${posRef.current.y - 150}px)`;
      }
      rafRef.current = requestAnimationFrame(update);
    };

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    rafRef.current = requestAnimationFrame(update);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reduced, isMobile, visible]);

  if (reduced || isMobile || !visible) return null;

  return (
    <div
      ref={glowRef}
      className="fixed top-0 left-0 pointer-events-none z-[9998] will-change-transform"
      style={{ width: 300, height: 300 }}
    >
      <div
        className="w-full h-full rounded-full opacity-[0.06]"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary)), transparent 70%)',
        }}
      />
    </div>
  );
}
