/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Github, Linkedin, Mail, Code2, Database, Cloud, Sparkles, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Home() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    certifications: 0,
    experience: '3+'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: profileData } = await supabase
      // .from('public_profiles')
      .from('profiles')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (profileData) setProfile(profileData);

    const [projects, skills, certs] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('skills').select('*', { count: 'exact', head: true }),
      supabase.from('certifications').select('*', { count: 'exact', head: true })
    ]);

    setStats({
      projects: projects.count || 0,
      skills: skills.count || 0,
      certifications: certs.count || 0,
      experience: '3+'
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
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Floating code snippets effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 left-10 text-primary/20 font-mono text-sm"
        >
          {"const dev = { skills: ['React', 'Node.js'] }"}
        </motion.div>
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, delay: 2 }}
          className="absolute top-40 right-20 text-primary/20 font-mono text-sm"
        >
          {"=> fullStack.build()"}
        </motion.div>
      </div>

      <div className="relative container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Avatar */}
              {/* <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-primary/30 ring-offset-4 ring-offset-background">
                    {profile.profile_image ? (
                      <img 
                        src={profile.profile_image} 
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-3xl font-bold text-white">
                        {profile.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>
                </div>
              </motion.div> */}
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.5 }}
  className="mb-8"
>
  <div className="relative inline-block">
    {/* <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-primary/30 ring-offset-4 ring-offset-background">
      {profile.profile_image ? (
        <img 
          src={profile.profile_image} 
          alt={profile.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-3xl font-bold text-white">
          {profile.name.charAt(0)}
        </div>
      )}
    </div> */}
<div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-primary/30 ring-offset-4 ring-offset-background relative">
  {profile.profile_image ? (
    <img 
      src={profile.profile_image} 
      alt={profile.name}
      className="absolute w-full h-full object-cover"
      style={{
        objectPosition: profile.image_position 
          ? `${profile.image_position.x}% ${profile.image_position.y}%` 
          : 'center',
        transform: profile.image_scale 
          ? `scale(${profile.image_scale})` 
          : 'scale(1)'
      }}
    />
  ) : (
    <div className="w-full h-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-3xl font-bold text-white">
      {profile.name.charAt(0)}
    </div>
  )}
</div>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center"
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
                  Hi, I'm{' '}
                  <span className="gradient-text">{profile.name}</span>
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
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
                    >
                      {tech.trim()}
                    </motion.span>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4 mb-8">
                  <Button asChild size="lg" className="group">
                    <Link to="/projects">
                      View Projects
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  
                  <Button asChild size="lg" variant="outline">
                    <Link to="/contact">
                      Get In Touch
                    </Link>
                  </Button>

                  {profile.resume_url && (
                    <Button
                      size="lg"
                      variant="outline"
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

            {/* Right side - Stats Grid */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-2 gap-6"
            >
              {[
                { label: 'Years Experience', value: stats.experience, icon: Code2, color: 'from-blue-500 to-cyan-500' },
                { label: 'Projects Built', value: stats.projects, icon: Database, color: 'from-purple-500 to-pink-500' },
                { label: 'Technologies', value: stats.skills, icon: Cloud, color: 'from-green-500 to-emerald-500' },
                { label: 'Certifications', value: stats.certifications, icon: Sparkles, color: 'from-orange-500 to-yellow-500' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="glassmorphic rounded-2xl p-6 relative overflow-hidden group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="text-3xl font-bold gradient-text mb-1">
                      {stat.value}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Featured work section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
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
                  icon: Code2
                },
                {
                  title: 'AI Integration',
                  description: 'Implementing AI-powered features and agentic workflows',
                  icon: Sparkles
                },
                {
                  title: 'Cloud Architecture',
                  description: 'Designing scalable infrastructure with AWS and automation',
                  icon: Cloud
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="glassmorphic rounded-2xl p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4">
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
