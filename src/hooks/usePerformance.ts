import { useEffect, useRef, useState, useCallback } from 'react';

export function useVisibility(ref: React.RefObject<HTMLElement | null>) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05, rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return isVisible;
}

export function usePageVisible() {
  const [visible, setVisible] = useState(!document.hidden);

  useEffect(() => {
    const handler = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  return visible;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

export function useIsMobile() {
  const [mobile, setMobile] = useState(
    () => window.innerWidth < 768 || ('ontouchstart' in window && navigator.maxTouchPoints > 0)
  );

  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, []);

  return mobile;
}

export function useThrottledCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0);
  const rafRef = useRef<number>();

  return useCallback(
    ((...args: any[]) => {
      const now = performance.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      } else {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          lastCall.current = performance.now();
          callback(...args);
        });
      }
    }) as T,
    [callback, delay]
  );
}

export function useFPSThrottle(targetFPS = 30) {
  const interval = 1000 / targetFPS;
  const lastFrame = useRef(0);

  const shouldRender = useCallback(() => {
    const now = performance.now();
    if (now - lastFrame.current >= interval) {
      lastFrame.current = now;
      return true;
    }
    return false;
  }, [interval]);

  return shouldRender;
}
