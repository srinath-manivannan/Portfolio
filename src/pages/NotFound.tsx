import { useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, FolderKanban, User, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const suggestions = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: User, label: 'About', path: '/about' },
  { icon: Mail, label: 'Contact', path: '/contact' },
];

export default function NotFound() {
  const location = useLocation();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    console.error('404: Route not found:', location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 aurora opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-dots opacity-[0.02] pointer-events-none" />

      {/* Floating 404 background */}
      <motion.div
        animate={{ x: mousePos.x, y: mousePos.y }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <span className="text-[20rem] md:text-[30rem] font-black text-primary/[0.03] leading-none">
          404
        </span>
      </motion.div>

      <div className="relative z-10 text-center px-4 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Glitch text */}
          <motion.h1
            className="text-8xl md:text-9xl font-black font-display tracking-tight gradient-text-premium mb-4"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            404
          </motion.h1>

          <h2 className="text-2xl md:text-3xl font-bold font-display mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-2">
            The page <code className="px-2 py-0.5 rounded bg-white/[0.04] text-sm font-mono">{location.pathname}</code> doesn't exist.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            It might have been moved, deleted, or you may have mistyped the URL.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            <Button asChild className="gradient-primary text-white rounded-xl">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" /> Go Home
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} className="rounded-xl border-white/[0.06] hover:bg-white/[0.04]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
            </Button>
          </div>

          {/* Quick links */}
          <div className="premium-card rounded-xl p-6">
            <p className="text-sm font-medium mb-4">Maybe you were looking for:</p>
            <div className="grid grid-cols-2 gap-2">
              {suggestions.map((s) => (
                <Link
                  key={s.path}
                  to={s.path}
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-white/[0.04] transition-colors text-sm"
                >
                  <s.icon className="w-4 h-4 text-primary" />
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
