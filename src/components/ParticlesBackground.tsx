import { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

export default function ParticlesBackground({ className = '' }: { className?: string }) {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: false,
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      particles: {
        number: { value: 40, density: { enable: true } },
        color: { value: ['#3b82f6', '#06b6d4', '#8b5cf6'] },
        shape: { type: 'circle' },
        opacity: {
          value: { min: 0.1, max: 0.3 },
          animation: { enable: true, speed: 0.5, sync: false },
        },
        size: {
          value: { min: 1, max: 3 },
          animation: { enable: true, speed: 1, sync: false },
        },
        move: {
          enable: true,
          speed: 0.5,
          direction: 'none' as const,
          random: true,
          straight: false,
          outModes: { default: 'bounce' as const },
        },
        links: {
          enable: true,
          distance: 150,
          color: '#3b82f6',
          opacity: 0.1,
          width: 1,
        },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: 'grab' as const },
          onClick: { enable: true, mode: 'push' as const },
        },
        modes: {
          grab: { distance: 140, links: { opacity: 0.3 } },
          push: { quantity: 2 },
        },
      },
      detectRetina: true,
    }),
    []
  );

  if (!init) return null;

  return (
    <Particles
      className={`absolute inset-0 ${className}`}
      options={options}
    />
  );
}
