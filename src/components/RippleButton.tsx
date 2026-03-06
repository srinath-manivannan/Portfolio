import { useState, type ReactNode, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Ripple {
  x: number;
  y: number;
  id: number;
}

interface RippleButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

let rippleId = 0;

export default function RippleButton({ children, className = '', onClick }: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newRipple: Ripple = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      id: rippleId++,
    };
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 800);
    onClick?.();
  };

  return (
    <button className={`relative overflow-hidden ${className}`} onClick={handleClick}>
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute w-20 h-20 rounded-full bg-white/20 pointer-events-none"
            style={{
              left: ripple.x - 40,
              top: ripple.y - 40,
            }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
}
