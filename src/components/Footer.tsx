import { Github, Linkedin, Mail, ArrowUp, Heart, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LinkedInQR from '@/components/LinkedInQR';

const socialLinks = [
  { icon: Github, href: 'https://github.com/srinath-manivannan', label: 'GitHub' },
  { icon: Linkedin, href: 'http://linkedin.com/in/srinath-manivannan-57a751197', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:srinathmpro2001@gmail.com', label: 'Email' },
];

const footerLinks = [
  {
    title: 'Navigation',
    links: [
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
      { name: 'Projects', path: '/projects' },
      { name: 'Contact', path: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Experience', path: '/experience' },
      { name: 'Skills', path: '/skills' },
      { name: 'Certifications', path: '/certifications' },
      { name: 'Blog', path: '/blog' },
    ],
  },
];

function useSessionDuration() {
  const start = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function useKonamiCode(callback: () => void) {
  const sequence = useRef<string[]>([]);
  const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      sequence.current.push(e.key);
      sequence.current = sequence.current.slice(-code.length);
      if (sequence.current.join(',') === code.join(',')) callback();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [callback]);
}

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [easterEgg, setEasterEgg] = useState(false);
  const sessionDuration = useSessionDuration();

  useKonamiCode(useCallback(() => setEasterEgg(true), []));

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-6 z-40 w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.06] transition-colors group backdrop-blur-xl"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>

      <footer className="relative border-t border-white/[0.04] overflow-hidden" style={{ background: 'hsl(228 84% 3% / 0.5)' }}>
        <div className="premium-glow-line" />
        <div className="pointer-events-none absolute inset-0 aurora opacity-[0.03]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
                  <span className="text-white font-bold text-[10px] font-display">SM</span>
                </div>
                <h3 className="text-lg font-bold font-display">
                  <span className="gradient-text-premium">Srinath Manivannan</span>
                </h3>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md text-sm leading-relaxed">
                AI Full-Stack Software Engineer specializing in MERN, Next.js, TypeScript, and automation.
                Building scalable applications with modern technologies.
              </p>

              <div className="flex gap-2 items-center">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center hover:bg-white/[0.06] hover:border-white/[0.08] transition-all"
                    aria-label={social.label}
                  >
                    <social.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                ))}
                <LinkedInQR variant="modal" />
              </div>
            </div>

            {/* Links */}
            {footerLinks.map((section) => (
              <div key={section.title} className="md:col-span-2">
                <h4 className="font-semibold text-[11px] mb-4 text-muted-foreground tracking-wider uppercase">{section.title}</h4>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Status */}
            <div className="md:col-span-3">
              <h4 className="font-semibold text-[11px] mb-4 text-muted-foreground tracking-wider uppercase">Status</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm text-muted-foreground">Available for hire</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="text-sm text-muted-foreground">Based in India (IST)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <span className="text-sm text-muted-foreground">Open to remote</span>
                </div>
              </div>
            </div>
          </div>

          <div className="premium-glow-line mb-6" />

          {/* Easter Egg */}
          <AnimatePresence>
            {easterEgg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-white/[0.08]">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium gradient-text-premium">You found the secret! You're a true developer.</span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground/80 text-xs">
              © {new Date().getFullYear()} Srinath Manivannan. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground/20 text-[10px] font-mono tabular-nums">
                Session: {sessionDuration}
              </span>
              <p className="text-muted-foreground/80 text-xs flex items-center gap-1">
                Crafted with <Heart className="w-3 h-3 text-red-400/60 inline" /> using React, Vite & Supabase
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
