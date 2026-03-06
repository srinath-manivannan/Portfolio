import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Moon, Sun, Search, ArrowRight, Home, User, Briefcase, FolderKanban, Wrench, Award, BookOpen, Image, Mail, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'About', path: '/about', icon: User },
  { name: 'Experience', path: '/experience', icon: Briefcase },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Skills', path: '/skills', icon: Wrench },
  { name: 'Certifications', path: '/certifications', icon: Award },
  { name: 'Blog', path: '/blog', icon: BookOpen },
  { name: 'Gallery', path: '/gallery', icon: Image },
  { name: 'Contact', path: '/contact', icon: Mail },
];

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const filtered = navLinks.filter(
    (l) =>
      l.name.toLowerCase().includes(query.toLowerCase()) ||
      l.path.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback(
    (path: string) => {
      navigate(path);
      onClose();
    },
    [navigate, onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex].path);
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [filtered, selectedIndex, handleSelect, onClose]
  );

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[18%] left-1/2 -translate-x-1/2 z-[61] w-[90vw] max-w-lg"
          >
            <div className="rounded-2xl shadow-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'hsl(228 60% 6% / 0.95)', backdropFilter: 'blur(32px) saturate(1.5)' }}>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
                <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Where do you want to go?"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-muted-foreground/60 bg-white/[0.04] rounded-md border border-white/[0.06]">
                  ESC
                </kbd>
              </div>

              <div className="max-h-64 overflow-y-auto custom-scrollbar py-1">
                {filtered.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-muted-foreground/60">
                    No results found
                  </div>
                ) : (
                  filtered.map((link, i) => (
                    <button
                      key={link.path}
                      onClick={() => handleSelect(link.path)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-all duration-150 ${
                        i === selectedIndex
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground/90 hover:bg-white/[0.03]'
                      }`}
                    >
                      <link.icon className="w-4 h-4 flex-shrink-0 opacity-60" />
                      <span className="flex-1 text-left font-medium">{link.name}</span>
                      {i === selectedIndex && (
                        <ArrowRight className="w-4 h-4 text-primary/70" />
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="px-5 py-2.5 border-t border-white/[0.04] flex items-center gap-4 text-[10px] text-muted-foreground/70">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white/[0.04] rounded border border-white/[0.06] font-mono">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white/[0.04] rounded border border-white/[0.06] font-mono">↵</kbd>
                  Select
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const statusMessages = ['AVAILABLE', 'AI-POWERED', 'OPEN TO WORK', 'FULL-STACK'];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const id = setInterval(() => setStatusIndex(i => (i + 1) % statusMessages.length), 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setIsScrolled(y > 20);
      setScrollProgress(h > 0 ? Math.min(100, Math.max(0, (y / h) * 100)) : 0);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'dark';
    setIsDark(theme === 'dark');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'border-b border-white/[0.04]'
            : 'bg-transparent'
        }`}
        style={isScrolled ? {
          background: 'hsl(228 84% 3% / 0.7)',
          backdropFilter: 'blur(24px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
        } : undefined}
      >
        {/* Scroll progress — ultra-thin premium line */}
        <div
          className="absolute bottom-0 left-0 h-[1px]"
          style={{
            width: `${scrollProgress}%`,
            background: 'linear-gradient(90deg, hsl(220 90% 56%), hsl(262 83% 58%), hsl(45 93% 58%))',
            opacity: scrollProgress > 0 ? 0.6 : 0,
            transition: 'opacity 0.3s',
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg group-hover:shadow-primary/20 transition-shadow">
                  <span className="text-white font-bold text-sm font-display">SM</span>
                </div>
              </div>
              <span className="font-display font-bold text-lg hidden sm:block">
                <span className="gradient-text-premium">Srinath</span>
                <span className="text-muted-foreground/70 font-normal">.dev</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-0.5">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="relative px-3 py-2 rounded-lg text-[13px] font-medium transition-all group"
                  >
                    <span className={`relative z-10 ${isActive ? 'text-primary' : 'text-foreground/50 group-hover:text-foreground/90'}`}>
                      {link.name}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-lg bg-primary/[0.08]"
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-1.5">
              {/* Animated status badge */}
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/[0.06] border border-green-500/10 mr-1 overflow-hidden">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={statusIndex}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-[10px] font-medium text-green-400/80 tracking-wide block"
                  >
                    {statusMessages[statusIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCmdOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 rounded-lg text-xs text-muted-foreground/70 hover:text-foreground/90 hover:bg-white/[0.04]"
              >
                <Search className="w-3.5 h-3.5" />
                <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/70 bg-white/[0.04] rounded border border-white/[0.06]">
                  ⌘K
                </kbd>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-lg w-8 h-8 hover:bg-white/[0.04]"
              >
                <AnimatePresence mode="wait">
                  {isDark ? (
                    <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Sun className="w-4 h-4 text-muted-foreground/60" />
                    </motion.div>
                  ) : (
                    <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Moon className="w-4 h-4 text-muted-foreground/60" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>

              <Link to="/admin/login" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="rounded-lg text-[11px] text-muted-foreground/70 hover:text-foreground/80 hover:bg-white/[0.04]">
                  Admin
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-lg w-8 h-8 hover:bg-white/[0.04]"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                      <X className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                      <Menu className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden border-t border-white/[0.04] overflow-hidden"
              style={{ background: 'hsl(228 84% 3% / 0.95)', backdropFilter: 'blur(32px)' }}
            >
              <div className="px-4 py-3 space-y-0.5">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        location.pathname === link.path
                          ? 'text-primary bg-primary/[0.08]'
                          : 'text-foreground/50 hover:text-foreground/90 hover:bg-white/[0.03]'
                      }`}
                    >
                      <link.icon className="w-4 h-4 opacity-60" />
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

                <div className="pt-2 border-t border-white/[0.04] mt-2">
                  <Link to="/admin/login" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full rounded-lg text-xs text-muted-foreground/70">
                      Admin Login
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
