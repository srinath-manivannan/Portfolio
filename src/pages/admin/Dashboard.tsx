import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Briefcase, Award, Code2, LogOut, Settings, Sparkles, Mail, Clock, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => raf.current && cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

export default function Dashboard() {
  const { signOut } = useAuth();
  const [stats, setStats] = useState({ projects: 0, experiences: 0, skills: 0, certifications: 0 });
  const [inbox, setInbox] = useState<any[]>([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    fetchInbox();
  }, []);

  const fetchStats = async () => {
    const [projects, experiences, skills, certifications] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('experiences').select('*', { count: 'exact', head: true }),
      supabase.from('skills').select('*', { count: 'exact', head: true }),
      supabase.from('certifications').select('*', { count: 'exact', head: true }),
    ]);

    setStats({
      projects: projects.count || 0,
      experiences: experiences.count || 0,
      skills: skills.count || 0,
      certifications: certifications.count || 0,
    });
  };

  const fetchInbox = async () => {
    setInboxLoading(true);
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('id, created_at, name, email, subject, category, message')
      .order('created_at', { ascending: false })
      .limit(20);
    if (!error && data) setInbox(data);
    setInboxLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Move this message to trash? This will delete the record.')) return;
    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);
      if (!error) {
        setInbox(prev => prev.filter(m => m.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  };

  const counters = {
    projects: useCountUp(stats.projects),
    experiences: useCountUp(stats.experiences),
    skills: useCountUp(stats.skills),
    certifications: useCountUp(stats.certifications),
  };

  const quickLinks = useMemo(
    () => [
      { name: 'Profile', path: '/admin/profile', icon: Settings, color: 'from-blue-500 to-cyan-500' },
      { name: 'Themes', path: '/admin/themes', icon: Settings, color: 'from-indigo-500 to-purple-500' },
      { name: 'Projects', path: '/admin/projects', icon: Code2, color: 'from-green-500 to-emerald-500' },
      { name: 'Experience', path: '/admin/experience', icon: Briefcase, color: 'from-purple-500 to-pink-500' },
      { name: 'Skills', path: '/admin/skills', icon: FileText, color: 'from-orange-500 to-red-500' },
      { name: 'Certifications', path: '/admin/certifications', icon: Award, color: 'from-yellow-500 to-orange-500' },
      { name: 'Achievements', path: '/admin/achievements', icon: Award, color: 'from-pink-500 to-rose-500' },
      { name: 'Education', path: '/admin/education', icon: Award, color: 'from-teal-500 to-cyan-500' },
      { name: 'Blog', path: '/admin/blog', icon: FileText, color: 'from-blue-500 to-indigo-500' },
      { name: 'Gallery', path: '/admin/gallery', icon: Award, color: 'from-purple-500 to-violet-500' },
      { name: 'Vault', path: '/admin/vault', icon: FileText, color: 'from-red-500 to-pink-500' },
      { name: 'AI Settings', path: '/admin/ai-settings', icon: Settings, color: 'from-violet-500 to-purple-500' },
      { name: 'Automation', path: '/admin/automation', icon: Settings, color: 'from-cyan-500 to-blue-500' },
    ],
    []
  );

  return (
    <div className="relative min-h-screen pt-20 pb-20 px-4 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 aurora opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-[0.05] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-2">
              Admin Dashboard <Sparkles className="w-5 h-5 text-[hsl(var(--gradient-to))]" />
            </h1>
            <p className="text-muted-foreground">Manage your portfolio content</p>
          </motion.div>

          <div className="flex gap-3">
            <Button variant="outline" asChild className="animated-border">
              <Link to="/">Back to Site</Link>
            </Button>
            <Button variant="outline" onClick={signOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Projects', value: counters.projects, icon: Code2, color: 'from-green-500 to-emerald-500' },
            { label: 'Experiences', value: counters.experiences, icon: Briefcase, color: 'from-purple-500 to-pink-500' },
            { label: 'Skills', value: counters.skills, icon: FileText, color: 'from-orange-500 to-red-500' },
            { label: 'Certifications', value: counters.certifications, icon: Award, color: 'from-blue-500 to-cyan-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glassmorphic rounded-2xl p-6 hover-lift tilt-hover glow-soft relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 hover:opacity-10 transition-opacity`} />
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold gradient-text select-none">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Inbox */}
        {/* <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Inbox</h2>
              {inbox.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {inbox.length} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {inbox.length > 5 && (
                <Button variant="outline" size="sm" onClick={() => setExpanded(e => !e)} className="gap-1">
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {expanded ? 'Show less' : `Show more (${inbox.length - 5})`}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={fetchInbox}>Refresh</Button>
            </div>
          </div>
          <div className="glassmorphic rounded-2xl p-0 mb-12 overflow-hidden">
            <ul className="divide-y divide-[hsl(var(--border))]">
              {inboxLoading && (
                <li className="p-4 animate-pulse text-muted-foreground">Loading messages…</li>
              )}
              {!inboxLoading && inbox.length === 0 && (
                <li className="p-4 text-muted-foreground">No new messages.</li>
              )}
              {!inboxLoading && (expanded ? inbox : inbox.slice(0,5)).map((m) => (
                <li key={m.id} className="p-4 hover:bg-[hsl(var(--card))/0.6] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        <span className="font-medium truncate max-w-[14rem]">{m.name}</span>
                        {m.category && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{m.category}</span>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-1">{m.subject || '(No subject)'}</div>
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{m.message}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5" />
                        {m.created_at ? new Date(m.created_at).toLocaleString() : ''}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleDelete(m.id)}
                        disabled={deletingId === m.id}
                        title="Move to trash"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deletingId === m.id ? 'Removing...' : 'Trash'}
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </motion.div> */}

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickLinks.map((link, i) => (
              <Link key={link.path} to={link.path}>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * i }}
                  className="glassmorphic rounded-2xl p-6 hover-lift group tilt-hover sheen glow-soft"
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${link.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <link.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">{link.name}</h3>
                  <p className="text-sm text-muted-foreground">Manage {link.name.toLowerCase()}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
