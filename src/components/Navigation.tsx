import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun, Code2, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Experience', path: '/experience' },
  { name: 'Projects', path: '/projects' },
  { name: 'Skills', path: '/skills' },
  { name: 'Certifications', path: '/certifications' },
  { name: 'Blog', path: '/blog' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Contact', path: '/contact' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setIsScrolled(y > 20);
      setScrollProgress(h > 0 ? Math.min(100, Math.max(0, (y / h) * 100)) : 0);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'dark';
    setIsDark(theme === 'dark');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glassmorphic shadow-lg animated-border' : 'bg-transparent'
      }`}
    >
      {/* Scroll progress indicator */}
      <div
        className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-[hsl(var(--gradient-from))] via-[hsl(var(--gradient-via))] to-[hsl(var(--gradient-to))]"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Code2 className="w-8 h-8 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/40 transition-all" />
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[hsl(var(--gradient-from))] animate-ping" />
            </div>
            <span className="font-bold text-xl gradient-text hidden sm:block">Console</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.path
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Command">
              <Command className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <Link to="/admin/login" className="hidden sm:block">
              <Button variant="outline" size="sm" className="rounded-full">
                Admin
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
            className="md:hidden glassmorphic border-t border-border/50"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.path
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/admin/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" size="sm" className="w-full rounded-full">
                  Admin Login
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
