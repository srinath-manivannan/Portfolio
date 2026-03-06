import { useEffect, useRef } from 'react';
import { useVisibility, usePageVisible, useReducedMotion, useIsMobile } from '@/hooks/usePerformance';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  layer: number;
  pulsePhase: number;
  connections: number[];
}

export default function NeuralNetwork({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useVisibility(containerRef);
  const pageVisible = usePageVisible();
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (reduced || !isVisible || !pageVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const nodes: Node[] = [];
    const layers = isMobile ? 3 : 5;
    const nodesPerLayer = isMobile ? 3 : 5;
    const frameInterval = isMobile ? 1000 / 20 : 1000 / 30;
    let lastFrame = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    for (let layer = 0; layer < layers; layer++) {
      const count = layer === 0 || layer === layers - 1 ? 2 : nodesPerLayer;
      for (let i = 0; i < count; i++) {
        const lx = (w / (layers + 1)) * (layer + 1);
        const ly = (h / (count + 1)) * (i + 1);
        nodes.push({
          x: lx + (Math.random() - 0.5) * 20,
          y: ly + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          layer,
          pulsePhase: Math.random() * Math.PI * 2,
          connections: [],
        });
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        if (nodes[j].layer === nodes[i].layer + 1) {
          nodes[i].connections.push(j);
        }
      }
    }

    let time = 0;
    const animate = (now: number) => {
      animationId = requestAnimationFrame(animate);
      if (now - lastFrame < frameInterval) return;
      lastFrame = now;

      ctx.clearRect(0, 0, w, h);
      time += 0.01;

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        const lx = (w / (layers + 1)) * (node.layer + 1);
        node.vx += (lx - node.x) * 0.001;
        node.vy += (h / 2 + (node.y - h / 2) * 0.99 - node.y) * 0.0001;
        node.vx *= 0.99;
        node.vy *= 0.99;
      }

      for (const node of nodes) {
        for (const connIdx of node.connections) {
          const target = nodes[connIdx];
          const pulse = Math.sin(time * 2 + node.pulsePhase) * 0.5 + 0.5;

          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = `hsla(217, 91%, 70%, ${0.05 + pulse * 0.06})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();

          const signalPos = (time * 0.5 + node.pulsePhase / (Math.PI * 2)) % 1;
          const sx = node.x + (target.x - node.x) * signalPos;
          const sy = node.y + (target.y - node.y) * signalPos;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(217, 91%, 70%, ${0.25 * pulse})`;
          ctx.fill();
        }
      }

      for (const node of nodes) {
        const glow = Math.sin(time * 2 + node.pulsePhase) * 0.5 + 0.5;
        const radius = 2.5 + glow * 1.5;

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(217, 91%, 70%, ${0.25 + glow * 0.35})`;
        ctx.fill();
      }
    };
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [isVisible, pageVisible, reduced, isMobile]);

  if (reduced) return null;

  return (
    <div ref={containerRef} className={`absolute inset-0 ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />
    </div>
  );
}
