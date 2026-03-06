/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { ArrowRight, Github, Linkedin, Mail, Code2, Database, Cloud, Sparkles, Download, ChevronDown, Terminal, Zap, Layers, Cpu, Globe, Braces, Brain, Wand2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import TechMarquee from '@/components/TechMarquee';
import NeuralNetwork from '@/components/NeuralNetwork';
import CodeShowcase from '@/components/CodeShowcase';
import MatrixRain from '@/components/MatrixRain';
import MagneticButton from '@/components/MagneticButton';
import LinkedInQR from '@/components/LinkedInQR';
import AIProjectRecommender from '@/components/AIProjectRecommender';
import AISkillAnalyzer from '@/components/AISkillAnalyzer';

const FloatingGradientSphere = lazy(() => import('@/components/FloatingGradientSphere'));

function useCountUp(target: number | string, duration = 1200) {
  const { prefersReducedMotion } = useTheme();
  const [val, setVal] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof target === 'string') {
      setVal(Number.parseInt(target as string, 10) || 0);
      return;
    }
    if (prefersReducedMotion) {
      setVal(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * ease));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, prefersReducedMotion]);

  return val;
}

function useTypingEffect(texts: string[], speed = 80, pause = 2000) {
  const [display, setDisplay] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex] || '';
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < current.length) {
          setDisplay(current.slice(0, charIndex + 1));
          setCharIndex(c => c + 1);
        } else {
          setTimeout(() => setIsDeleting(true), pause);
        }
      } else {
        if (charIndex > 0) {
          setDisplay(current.slice(0, charIndex - 1));
          setCharIndex(c => c - 1);
        } else {
          setIsDeleting(false);
          setTextIndex(i => (i + 1) % texts.length);
        }
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts, speed, pause]);

  return display;
}

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    let animationId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    const count = 40;
    const frameInterval = 1000 / 30;
    let lastFrame = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.05,
      });
    }

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener('mousemove', onMove, { passive: true });

    const animate = (now: number) => {
      animationId = requestAnimationFrame(animate);
      if (now - lastFrame < frameInterval) return;
      lastFrame = now;

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

        const dx = mx - p.x;
        const dy = my - p.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 14400) {
          p.vx -= dx * 0.0001;
          p.vy -= dy * 0.0001;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(220, 90%, 65%, ${p.opacity})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 10000) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(220, 90%, 65%, ${0.04 * (1 - Math.sqrt(distSq) / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-auto" />;
}

function TechOrbit() {
  const techs = [
    { name: 'React', icon: Braces, angle: 0 },
    { name: 'Node.js', icon: Terminal, angle: 45 },
    { name: 'TypeScript', icon: Code2, angle: 90 },
    { name: 'Next.js', icon: Globe, angle: 135 },
    { name: 'AWS', icon: Cloud, angle: 180 },
    { name: 'AI/ML', icon: Cpu, angle: 225 },
    { name: 'MongoDB', icon: Database, angle: 270 },
    { name: 'n8n', icon: Zap, angle: 315 },
  ];

  return (
    <div className="relative w-72 h-72 md:w-80 md:h-80 mx-auto">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0"
      >
        <div className="absolute inset-4 rounded-full border border-primary/10" />
        <div className="absolute inset-10 rounded-full border border-primary/5" />
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-[0_0_40px_hsl(var(--primary)/0.4)]"
        >
          <Layers className="w-10 h-10 text-white" />
        </motion.div>
      </div>

      {techs.map((tech, i) => {
        const radius = 120;
        const rad = (tech.angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;

        return (
          <motion.div
            key={tech.name}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
            className="absolute top-1/2 left-1/2"
            style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
          >
            <motion.div
              whileHover={{ scale: 1.2, zIndex: 10 }}
              className="group relative"
            >
              <div className="w-11 h-11 rounded-xl bg-card border border-border/50 flex items-center justify-center shadow-lg hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-all cursor-default">
                <tech.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap bg-card/90 px-2 py-0.5 rounded border border-border/50">
                  {tech.name}
                </span>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

function TerminalBlock() {
  const lines = [
    { prompt: true, text: 'npx create-next-app@latest portfolio' },
    { prompt: false, text: '✓ Installing dependencies...' },
    { prompt: false, text: '✓ Setting up TypeScript...' },
    { prompt: false, text: '✓ Configuring Tailwind CSS...' },
    { prompt: true, text: 'npm run deploy' },
    { prompt: false, text: '🚀 Deployed to production!' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="premium-card p-1 max-w-lg mx-auto overflow-hidden"
    >
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.04]">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-[11px] text-muted-foreground/50 font-mono">terminal</span>
      </div>
      <div className="p-5 font-mono text-sm space-y-1.5">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className={line.prompt ? 'text-primary' : 'text-muted-foreground/60'}
          >
            {line.prompt && <span className="text-green-400/80 mr-2">❯</span>}
            {line.text}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    certifications: 0,
    experience: '3+' as string | number,
  });

  const years = useMemo(() => (typeof stats.experience === 'string' ? stats.experience : `${stats.experience}`), [stats.experience]);
  const cProjects = useCountUp(stats.projects);
  const cSkills = useCountUp(stats.skills);
  const cCerts = useCountUp(stats.certifications);

  const typingText = useTypingEffect([
    'Full-Stack Software Engineer',
    'AI & Automation Specialist',
    'MERN Stack Developer',
    'Cloud Architecture Enthusiast',
  ], 70, 2500);

  const heroRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const isStatsInView = useInView(statsRef, { once: true });
  const isFeaturedInView = useInView(featuredRef, { once: true });

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.97]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (profileData) setProfile(profileData);

    const [projects, skills, certs] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('skills').select('*', { count: 'exact', head: true }),
      supabase.from('certifications').select('*', { count: 'exact', head: true }),
    ]);

    setStats({
      projects: projects.count || 0,
      skills: skills.count || 0,
      certifications: certs.count || 0,
      experience: '3+',
    });
  };

  const scrollToContent = useCallback(() => {
    featuredRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-muted-foreground/50 text-sm">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ── Hero Section ─────────────────────────────────────── */}
      <motion.div ref={heroRef} style={{ opacity: heroOpacity, scale: heroScale }} className="relative min-h-[calc(100vh-4rem)] flex items-center">
        {/* Background layers */}
        <div className="absolute inset-0 aurora opacity-50" />
        <div className="absolute inset-0 bg-dots opacity-[0.03]" />
        <ParticleField />

        {/* Ambient gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />
          <div className="absolute -bottom-[200px] -left-[200px] w-[500px] h-[500px] rounded-full bg-secondary/[0.03] blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent/[0.02] blur-[100px]" />
        </div>

        <div className="relative container mx-auto px-4 pt-24 pb-12 md:pt-28 md:pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left — Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
              >
                {/* Status badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/[0.06] border border-green-500/10 text-green-400 text-[11px] font-medium tracking-wide mb-8"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  OPEN TO OPPORTUNITIES
                </motion.div>

                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="mb-8"
                >
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/[0.08] ring-2 ring-primary/20 ring-offset-4 ring-offset-background relative">
                      {profile.profile_image ? (
                        <img
                          src={profile.profile_image}
                          alt={profile.name}
                          className="absolute w-full h-full object-cover"
                          style={{
                            objectPosition: profile.image_position
                              ? `${profile.image_position.x}% ${profile.image_position.y}%`
                              : 'center',
                            transform: profile.image_scale ? `scale(${profile.image_scale})` : 'scale(1)',
                          }}
                        />
                      ) : (
                        <div className="w-full h-full gradient-primary flex items-center justify-center text-2xl font-bold text-white">
                          {profile.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-[2.5px] border-background" />
                  </div>
                </motion.div>

                {/* Name — BIG and premium */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-[1.05] tracking-tight font-display"
                >
                  <span className="text-foreground">I'm </span>
                  <span className="gradient-text-premium">{profile.name}</span>
                </motion.h1>

                {/* Typing subtitle */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-base md:text-xl text-muted-foreground mb-6 h-8 font-display font-medium"
                >
                  <span>{typingText}</span>
                  <span className="typing-cursor" />
                </motion.div>

                {/* Bio */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-base text-muted-foreground/70 mb-8 leading-relaxed max-w-lg"
                >
                  {profile.bio}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-wrap gap-3 mb-8"
                >
                  <Button asChild size="lg" className="group rounded-xl text-sm font-semibold px-6 relative overflow-hidden">
                    <Link to="/projects" className="gradient-primary text-white">
                      View My Work
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-xl text-sm font-semibold px-6 animated-border border-white/[0.06]">
                    <Link to="/contact">Let's Talk</Link>
                  </Button>
                  {profile.resume_url && (
                    <Button
                      size="lg"
                      variant="ghost"
                      className="rounded-xl text-sm font-medium px-5 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        window.open(profile.resume_url, '_blank');
                        toast.success('Resume opened');
                      }}
                    >
                      <Download className="mr-2 w-4 h-4" />
                      Resume
                    </Button>
                  )}
                </motion.div>

                {/* Social links */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="flex gap-2"
                >
                  {profile.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] flex items-center justify-center transition-all group hover:border-white/[0.1]"
                    >
                      <Github className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] flex items-center justify-center transition-all group hover:border-white/[0.1]"
                    >
                      <Linkedin className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </a>
                  )}
                  {profile.email && (
                    <a href={`mailto:${profile.email}`}
                      className="w-9 h-9 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] flex items-center justify-center transition-all group hover:border-white/[0.1]"
                    >
                      <Mail className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </a>
                  )}
                </motion.div>
              </motion.div>

              {/* Right — 3D Sphere */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="hidden lg:flex items-center justify-center relative"
              >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[350px] h-[350px] rounded-full bg-primary/[0.03] blur-[80px]" />
                </div>
                <div className="w-80 h-80 relative">
                  <Suspense fallback={<TechOrbit />}>
                    <FloatingGradientSphere />
                  </Suspense>
                </div>
              </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <motion.button
                onClick={scrollToContent}
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex flex-col items-center gap-2 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
              >
                <span className="text-[10px] font-medium tracking-[0.2em] uppercase">Explore</span>
                <ChevronDown className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Counter Section ───────────────────────────── */}
      <div ref={statsRef} className="relative py-16 md:py-24 overflow-hidden">
        <div className="premium-glow-line" />
        <div className="container mx-auto px-4 mt-8 md:mt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
            {[
              { label: 'Years Experience', value: years, icon: Code2, gradient: 'from-blue-500 to-cyan-400' },
              { label: 'Projects Built', value: cProjects, icon: Database, gradient: 'from-violet-500 to-purple-400' },
              { label: 'Technologies', value: cSkills, icon: Cloud, gradient: 'from-emerald-500 to-green-400' },
              { label: 'Certifications', value: cCerts, icon: Sparkles, gradient: 'from-amber-500 to-yellow-400' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="premium-card p-6 text-center group"
              >
                <div className="relative">
                  <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold gradient-text-premium mb-1 select-none font-display">
                    {typeof stat.value === 'string' ? stat.value : stat.value}
                  </div>
                  <div className="text-[11px] text-muted-foreground/50 font-medium tracking-wide uppercase">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── What I Build Section ────────────────────────────── */}
      <div ref={featuredRef} className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 aurora opacity-20 pointer-events-none" />
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={isFeaturedInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-16"
            >
              <span className="premium-badge mb-4">
                <Sparkles className="w-3 h-3" />
                EXPERTISE
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display tracking-tight">
                What I <span className="gradient-text-premium">Build</span>
              </h2>
              <p className="text-muted-foreground/60 max-w-xl mx-auto text-balance">
                Crafting scalable applications with modern technologies and best practices
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[
                {
                  title: 'Full-Stack Applications',
                  description: 'Building end-to-end solutions with MERN, Next.js, and TypeScript. From responsive UIs to robust APIs.',
                  icon: Code2,
                  gradient: 'from-blue-500 to-cyan-400',
                  features: ['React / Next.js', 'Node.js / Express', 'MongoDB / PostgreSQL'],
                },
                {
                  title: 'AI & Automation',
                  description: 'Implementing AI-powered features and agentic workflows using n8n, LangChain, and custom pipelines.',
                  icon: Brain,
                  gradient: 'from-violet-500 to-purple-400',
                  features: ['n8n Workflows', 'LLM Integration', 'Smart Automation'],
                },
                {
                  title: 'Cloud Architecture',
                  description: 'Designing scalable infrastructure with AWS, CI/CD pipelines, and containerized deployments.',
                  icon: Cloud,
                  gradient: 'from-emerald-500 to-green-400',
                  features: ['AWS Services', 'Docker / CI/CD', 'Serverless'],
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 24 }}
                  animate={isFeaturedInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.15 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="premium-card group"
                >
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-3 font-display group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-sm text-muted-foreground/60 mb-6 leading-relaxed">{item.description}</p>

                    <div className="space-y-2.5">
                      {item.features.map((f) => (
                        <div key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground/50">
                          <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${item.gradient}`} />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Terminal Section ─────────────────────────────────── */}
      <div className="relative py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="premium-badge mb-4">
                  <Terminal className="w-3 h-3" />
                  DEVELOPER
                </span>
                <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display tracking-tight">
                  Built with <span className="gradient-text-premium">Modern Tools</span>
                </h2>
                <p className="text-muted-foreground/60 mb-8 leading-relaxed">
                  I write clean, maintainable code using the latest frameworks and best practices.
                  Every project is built with performance, accessibility, and scalability in mind.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Clean Code', icon: Code2 },
                    { label: 'Type Safe', icon: Braces },
                    { label: 'Performant', icon: Zap },
                    { label: 'Scalable', icon: Layers },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                      <item.icon className="w-4 h-4 text-primary/70 flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground/80">{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <TerminalBlock />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tech Stack Marquee ──────────────────────────────── */}
      <div className="relative py-14 md:py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <span className="premium-badge mb-4">
                <Layers className="w-3 h-3" />
                TECH STACK
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-3 font-display tracking-tight">
                Technologies I <span className="gradient-text-premium">Work With</span>
              </h2>
              <p className="text-muted-foreground/50">The tools and frameworks powering my projects</p>
            </motion.div>
            <TechMarquee />
          </div>
        </div>
      </div>

      {/* ── Code Showcase Section ─────────────────────────── */}
      <div className="relative py-16 md:py-24 overflow-hidden">
        <NeuralNetwork className="opacity-20" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="premium-badge mb-4">
                  <Braces className="w-3 h-3" />
                  CODE QUALITY
                </span>
                <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display tracking-tight">
                  Writing <span className="gradient-text-premium">Production-Grade</span> Code
                </h2>
                <p className="text-muted-foreground/60 mb-8 leading-relaxed">
                  From AI agent pipelines to real-time APIs, I write clean, type-safe, and thoroughly tested code.
                  Every line is crafted for readability, performance, and maintainability.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: 'AI Pipelines', icon: Brain },
                    { label: 'Type Safe', icon: Braces },
                    { label: 'Real-time APIs', icon: Zap },
                    { label: 'CI/CD Ready', icon: Layers },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <item.icon className="w-4 h-4 text-primary/70 flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground/80">{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <CodeShowcase />
            </div>
          </div>
        </div>
      </div>

      {/* ── AI & Innovation Section ──────────────────────── */}
      <div className="relative py-16 md:py-24 overflow-hidden">
        <MatrixRain opacity={0.02} />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="premium-badge mb-4" style={{ background: 'linear-gradient(135deg, hsl(262 83% 58% / 0.12), hsl(262 83% 58% / 0.04))', borderColor: 'hsl(262 83% 58% / 0.15)', color: 'hsl(262 83% 70%)' }}>
                <Brain className="w-3 h-3" />
                AI & INNOVATION
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display tracking-tight">
                Powered by <span className="gradient-text-premium">Artificial Intelligence</span>
              </h2>
              <p className="text-muted-foreground/50 max-w-xl mx-auto text-balance">
                Leveraging cutting-edge AI and machine learning to build intelligent, adaptive applications
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'LLM Integration', desc: 'GPT-4, Claude, Gemini integration for intelligent features', icon: Brain, gradient: 'from-violet-500 to-purple-400' },
                { title: 'Agentic Workflows', desc: 'n8n & LangChain for autonomous task execution', icon: Wand2, gradient: 'from-blue-500 to-cyan-400' },
                { title: 'Smart Automation', desc: 'AI-powered CI/CD, code review, and deployment', icon: Cpu, gradient: 'from-emerald-500 to-green-400' },
                { title: 'Neural Networks', desc: 'TensorFlow & PyTorch for custom ML models', icon: Sparkles, gradient: 'from-amber-500 to-yellow-400' },
              ].map((item, i) => (
                <MagneticButton key={item.title} strength={0.15}>
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="premium-card h-full group"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold mb-2 font-display group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-sm text-muted-foreground/50 leading-relaxed">{item.desc}</p>
                  </motion.div>
                </MagneticButton>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <AISkillAnalyzer />
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA Section ──────────────────────────────────── */}
      <div className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 aurora opacity-30 pointer-events-none" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />
        </div>
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 font-display tracking-tight leading-tight">
              Let's Build Something{' '}
              <span className="gradient-text-premium">Extraordinary</span>
            </h2>
            <p className="text-lg text-muted-foreground/50 mb-10 max-w-lg mx-auto text-balance">
              Have a project in mind? I'd love to hear about it. Let's connect and create something remarkable together.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              <MagneticButton>
                <Button asChild size="lg" className="rounded-xl text-sm font-semibold px-8 gradient-primary text-white group">
                  <Link to="/contact">
                    Start a Conversation
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button asChild size="lg" variant="outline" className="rounded-xl text-sm font-semibold px-8 animated-border border-white/[0.06]">
                  <Link to="/projects">
                    Explore My Work
                    <ExternalLink className="ml-2 w-3.5 h-3.5" />
                  </Link>
                </Button>
              </MagneticButton>
            </div>

            <LinkedInQR variant="card" />
          </motion.div>
        </div>
      </div>

      {/* ── AI Project Recommender Section ────────────────── */}
      <div className="relative py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <AIProjectRecommender />
          </div>
        </div>
      </div>
    </div>
  );
}
