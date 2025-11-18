/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Github, Linkedin, Mail, Code2, Database, Cloud, Sparkles, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';

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
    const from = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (target - from) * ease);
      setVal(current);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, prefersReducedMotion]);

  return val;
}

// Lightweight interactive network reacting to mouse movement
function CognitiveGraph() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMouse({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  // Predefined nodes for deterministic layout
  const nodes = [
    { id: 1, x: 0.15, y: 0.2 },
    { id: 2, x: 0.4, y: 0.1 },
    { id: 3, x: 0.7, y: 0.2 },
    { id: 4, x: 0.2, y: 0.55 },
    { id: 5, x: 0.5, y: 0.5 },
    { id: 6, x: 0.8, y: 0.55 },
    { id: 7, x: 0.3, y: 0.85 },
    { id: 8, x: 0.65, y: 0.8 },
  ];
  const links = [
    [1, 2],
    [2, 3],
    [1, 4],
    [2, 5],
    [3, 6],
    [4, 5],
    [5, 6],
    [4, 7],
    [5, 8],
    [6, 8],
  ];

  const getOffset = (x: number, y: number) => {
    const dx = (mouse.x - 0.5) * 10; // subtle parallax
    const dy = (mouse.y - 0.5) * 10;
    return { x: x + dx, y: y + dy };
  };

  return (
    <div ref={containerRef} className="relative w-full h-64 md:h-72 rounded-2xl overflow-hidden bg-[hsl(var(--card))]/60 border border-[hsl(var(--border))] aurora">
      <svg className="absolute inset-0 w-full h-full" aria-hidden>
        <defs>
          <linearGradient id="edge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--gradient-from))" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(var(--gradient-to))" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {links.map(([a, b], i) => {
          const A = nodes.find((n) => n.id === a)!;
          const B = nodes.find((n) => n.id === b)!;
          const Aoff = getOffset(A.x * 100, A.y * 100);
          const Boff = getOffset(B.x * 100, B.y * 100);
          return (
            <line
              key={i}
              x1={`${Aoff.x}%`}
              y1={`${Aoff.y}%`}
              x2={`${Boff.x}%`}
              y2={`${Boff.y}%`}
              stroke="url(#edge)"
              strokeWidth={1}
            />
          );
        })}
        {nodes.map((n) => {
          const P = getOffset(n.x * 100, n.y * 100);
          return (
            <circle
              key={n.id}
              cx={`${P.x}%`}
              cy={`${P.y}%`}
              r={3.5}
              fill="hsl(var(--primary))"
              opacity={0.7}
            />
          );
        })}
      </svg>
      {/* glow edges */}
      <div className="absolute inset-0 pointer-events-none" style={{
        boxShadow: 'inset 0 0 60px hsl(var(--primary) / 0.08)'
      }} />
      {/* overlay label */}
      <div className="absolute bottom-2 left-3 text-xs text-muted-foreground">Cognitive Graph</div>
    </div>
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

  useEffect(() => {
    fetchData();
  }, []);

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

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background layers: aurora + grid + vignette */}
      <div className="absolute inset-0 aurora opacity-70" />
      <div className="absolute inset-0 bg-grid opacity-[0.06]" />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(60% 50% at 50% 0%, hsl(var(--primary) / 0.08), transparent 60%)',
      }} />

      {/* Floating ambient sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, -30, 0], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-10 text-primary/30 font-mono text-xs"
        >
          {"const ai = { stack: ['React', 'Node', 'TypeScript', 'AWS'] }"}
        </motion.div>
        <motion.div
          animate={{ x: [0, -60, 0], y: [0, 40, 0], opacity: [0.08, 0.22, 0.08] }}
          transition={{ duration: 16, repeat: Infinity, delay: 2 }}
          className="absolute top-32 right-10 text-accent/40 font-mono text-xs"
        >
          {"// agentic.workflows()"}
        </motion.div>
      </div>

      <div className="relative container mx-auto px-4 pt-32 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {/* Avatar + halo */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <div className="relative inline-block">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border border-[hsl(var(--border))] ring-2 ring-primary/30 ring-offset-4 ring-offset-background noise-overlay sheen">
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
                      <div className="w-full h-full gradient-primary flex items-center justify-center text-3xl font-bold text-white">
                        {profile.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute -bottom-1 -right-1 w-9 h-9 bg-gradient-to-br from-[hsl(var(--gradient-from))] to-[hsl(var(--gradient-to))] rounded-full flex items-center justify-center shadow-[0_0_25px_hsl(var(--primary)/0.35)]"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Text content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
                  Hi, I'm <span className="gradient-text">{profile.name}</span>
                </h1>

                <h2 className="text-2xl md:text-3xl font-semibold text-muted-foreground mb-6">
                  {profile.title}
                </h2>

                <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
                  {profile.bio}
                </p>

                {/* Tech stack pills */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {profile.tagline?.split('|').map((tech: string, index: number) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.08 }}
                      className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
                    >
                      {tech.trim()}
                    </motion.span>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4 mb-8">
                  <Button asChild size="lg" className="group gradient-primary text-white sheen glow-soft">
                    <Link to="/projects">
                      View Projects
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>

                  <Button asChild size="lg" variant="outline" className="animated-border">
                    <Link to="/contact">Get In Touch</Link>
                  </Button>

                  {profile.resume_url && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="sheen"
                      onClick={() => {
                        window.open(profile.resume_url, '_blank');
                        toast.success('Resume opened');
                      }}
                    >
                      <Download className="mr-2 w-4 h-4" />
                      Download Resume
                    </Button>
                  )}
                </div>

                {/* Social links */}
                <div className="flex gap-4">
                  {profile.github_url && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors group"
                    >
                      <Github className="w-5 h-5 group-hover:text-primary transition-colors" />
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors group"
                    >
                      <Linkedin className="w-5 h-5 group-hover:text-primary transition-colors" />
                    </a>
                  )}
                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="w-10 h-10 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors group"
                    >
                      <Mail className="w-5 h-5 group-hover:text-primary transition-colors" />
                    </a>
                  )}
                </div>
              </motion.div>
            </motion.div>

            {/* Right side - Cognitive graph + Stats */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <CognitiveGraph />

              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Years Experience', value: years, icon: Code2, color: 'from-blue-500 to-cyan-500' },
                  { label: 'Projects Built', value: cProjects, icon: Database, color: 'from-purple-500 to-pink-500' },
                  { label: 'Technologies', value: cSkills, icon: Cloud, color: 'from-green-500 to-emerald-500' },
                  { label: 'Certifications', value: cCerts, icon: Sparkles, color: 'from-orange-500 to-yellow-500' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.08 }}
                    whileHover={{ y: -6 }}
                    className="glassmorphic rounded-2xl p-6 relative overflow-hidden group tilt-hover glow-soft"
                  >
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className={`absolute -inset-1 bg-gradient-to-br ${stat.color} opacity-10`} />
                    </div>

                    <div className="relative">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)]`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>

                      <div className="text-3xl font-bold gradient-text mb-1 select-none">
                        {typeof stat.value === 'string' ? stat.value : stat.value}
                      </div>

                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Featured work section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-24"
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">
                What I <span className="gradient-text">Build</span>
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Crafting scalable applications with modern technologies and best practices
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Full-Stack Applications',
                  description: 'Building end-to-end solutions with MERN, Next.js, and TypeScript',
                  icon: Code2,
                },
                {
                  title: 'AI Integration',
                  description: 'Implementing AI-powered features and agentic workflows',
                  icon: Sparkles,
                },
                {
                  title: 'Cloud Architecture',
                  description: 'Designing scalable infrastructure with AWS and automation',
                  icon: Cloud,
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="glassmorphic rounded-2xl p-6 hover:border-primary/50 transition-colors tilt-hover sheen"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(var(--gradient-from))] to-[hsl(var(--gradient-to))] flex items-center justify-center mb-4 shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.55)]">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                  <p className="text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
