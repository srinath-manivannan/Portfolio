import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Briefcase, Award, Code2, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const { signOut } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    experiences: 0,
    skills: 0,
    certifications: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [projects, experiences, skills, certifications] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('experiences').select('*', { count: 'exact', head: true }),
      supabase.from('skills').select('*', { count: 'exact', head: true }),
      supabase.from('certifications').select('*', { count: 'exact', head: true })
    ]);

    setStats({
      projects: projects.count || 0,
      experiences: experiences.count || 0,
      skills: skills.count || 0,
      certifications: certifications.count || 0
    });
  };

  const quickLinks = [
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
    { name: 'Automation', path: '/admin/automation', icon: Settings, color: 'from-cyan-500 to-blue-500' }
  ];

  return (
    <div className="min-h-screen pt-20 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold gradient-text mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your portfolio content</p>
          </motion.div>

          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/">
                Back to Site
              </Link>
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
            { label: 'Projects', value: stats.projects, icon: Code2 },
            { label: 'Experiences', value: stats.experiences, icon: Briefcase },
            { label: 'Skills', value: stats.skills, icon: FileText },
            { label: 'Certifications', value: stats.certifications, icon: Award }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glassmorphic rounded-2xl p-6 hover-lift"
            >
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
              <p className="text-3xl font-bold gradient-text">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <div className="glassmorphic rounded-2xl p-6 hover-lift group">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${link.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <link.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">{link.name}</h3>
                  <p className="text-sm text-muted-foreground">Manage {link.name.toLowerCase()}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
