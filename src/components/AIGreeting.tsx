import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, X } from 'lucide-react';
import { getSmartGreeting } from '@/lib/aiEngine';

export default function AIGreeting() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const greeting = useMemo(() => getSmartGreeting(), []);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('ai_greeting_shown');
    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem('ai_greeting_shown', 'true');
    }, 3000);

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="fixed bottom-20 right-6 z-[45] max-w-xs"
        >
          <div
            className="rounded-2xl p-4 shadow-xl"
            style={{ background: 'hsl(228 60% 6% / 0.9)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <button
              onClick={() => { setDismissed(true); setVisible(false); }}
              className="absolute top-2 right-2 p-1 rounded-md hover:bg-white/[0.04] transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground/50" />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1 flex items-center gap-1.5">
                  AI Assistant
                  <Sparkles className="w-3 h-3 text-primary" />
                </p>
                <p className="text-xs text-muted-foreground/50 leading-relaxed">{greeting}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
