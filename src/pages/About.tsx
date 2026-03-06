/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Github, Linkedin, Trophy, Tv, Award as AwardIcon, GraduationCap, Sparkles, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import GitHubHeatmap from '@/components/GitHubHeatmap';
import LinkedInQR from '@/components/LinkedInQR';

const iconMap: Record<string, any> = {
  trophy: Trophy,
  tv: Tv,
  award: AwardIcon,
  graduation: GraduationCap,
};

export default function About() {
  const [profile, setProfile] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: profileData } = await supabase.from('profiles').select('*').limit(1).maybeSingle();
    if (profileData) setProfile(profileData);

    const { data: achievementsData } = await supabase.from('achievements').select('*').order('display_order');
    if (achievementsData) setAchievements(achievementsData);

    const { data: educationData } = await supabase.from('education').select('*').order('display_order');
    if (educationData) setEducation(educationData);
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-muted-foreground/50 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-24 px-4 overflow-hidden">
      <div className="absolute inset-0 aurora opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-dots opacity-[0.02] pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="premium-badge mb-4">
            <Sparkles className="w-3 h-3" />
            ABOUT
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-display tracking-tight">
            <span className="gradient-text-premium">About Me</span>
          </h1>
          <p className="text-muted-foreground/50">Get to know the person behind the code</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="premium-card p-8 md:p-12 mb-12"
        >
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden ring-2 ring-primary/15 ring-offset-4 ring-offset-background relative">
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
                  <div className="w-full h-full gradient-primary flex items-center justify-center text-5xl font-bold text-white">
                    {profile.name.charAt(0)}
                  </div>
                )}
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-white" />
              </motion.div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold mb-1 font-display">{profile.name}</h2>
              <p className="text-lg gradient-text-premium font-semibold mb-4 font-display">{profile.title}</p>

              <div className="space-y-2 mb-5">
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-2 justify-center md:justify-start text-sm text-muted-foreground/50 hover:text-primary transition-colors">
                    <Mail className="w-3.5 h-3.5 text-primary/70" />
                    {profile.email}
                  </a>
                )}
                {profile.phone && (
                  <a href={`tel:${profile.phone}`} className="flex items-center gap-2 justify-center md:justify-start text-sm text-muted-foreground/50 hover:text-primary transition-colors">
                    <Phone className="w-3.5 h-3.5 text-primary/70" />
                    {profile.phone}
                  </a>
                )}
                {profile.location && (
                  <div className="flex items-center gap-2 justify-center md:justify-start text-sm text-muted-foreground/50">
                    <MapPin className="w-3.5 h-3.5 text-primary/70" />
                    {profile.location}
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-center md:justify-start mb-5">
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="rounded-xl border-white/[0.06] hover:border-primary/30 bg-white/[0.02]"><Github className="w-4 h-4" /></Button>
                  </a>
                )}
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="rounded-xl border-white/[0.06] hover:border-primary/30 bg-white/[0.02]"><Linkedin className="w-4 h-4" /></Button>
                  </a>
                )}
                {profile.resume_url && (
                  <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="rounded-xl border-white/[0.06] hover:border-primary/30 bg-white/[0.02]">
                      <Download className="w-4 h-4 mr-1.5" /> Resume
                    </Button>
                  </a>
                )}
              </div>

              {profile.tagline && (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {profile.tagline.split('|').map((item: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-primary/[0.06] text-primary/80 text-xs font-medium border border-primary/10">
                      {item.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/[0.04]">
            <h3 className="text-base font-semibold mb-3 font-display">About</h3>
            <p className="text-muted-foreground/60 leading-relaxed">{profile.bio}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {['Reliability', 'Performance', 'Safety', 'Privacy', 'Clean Code'].map((p) => (
                <span key={p} className="px-3 py-1 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs text-foreground/60 font-medium">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-8 justify-center">
              <Trophy className="w-5 h-5 text-amber-400/70" />
              <h2 className="text-2xl md:text-3xl font-bold gradient-text-premium font-display">Key Achievements</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => {
                const Icon = iconMap[achievement.icon] || AwardIcon;
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    className="premium-card group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-base font-bold mb-2 font-display group-hover:text-primary transition-colors">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground/50 mb-3 leading-relaxed">{achievement.description}</p>
                    {achievement.institution && (
                      <p className="text-sm text-primary/70 font-medium">{achievement.institution}</p>
                    )}
                    {achievement.date && (
                      <p className="text-xs text-muted-foreground/30 mt-2">{new Date(achievement.date).getFullYear()}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="premium-card p-8 mb-12"
          >
            <div className="flex items-center gap-2 mb-8 justify-center">
              <GraduationCap className="w-5 h-5 text-primary/70" />
              <h2 className="text-2xl md:text-3xl font-bold gradient-text-premium font-display">Education</h2>
            </div>

            <div className="relative pl-4 md:pl-6">
              <div className="absolute top-0 bottom-0 left-1 md:left-2 w-[1px]" style={{ background: 'linear-gradient(to bottom, hsl(220 90% 56% / 0.3), hsl(262 83% 58% / 0.2), transparent)' }} />
              <div className="space-y-8">
                {education.map((edu) => (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative pl-6"
                  >
                    <div className="absolute left-[-4px] md:left-[-6px] top-2 w-3 h-3 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]" />
                    <h3 className="text-lg font-bold mb-1 font-display">{edu.degree}</h3>
                    <p className="text-base text-primary/80 font-semibold mb-1">{edu.institution}</p>
                    {edu.university && <p className="text-sm text-muted-foreground/40 mb-2">{edu.university}</p>}
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground/40 mb-3">
                      <span>{edu.duration}</span>
                      {edu.cgpa && <span className="text-primary/70 font-medium">CGPA: {edu.cgpa}</span>}
                      {edu.grade && <span className="text-primary/70 font-medium">{edu.grade}</span>}
                    </div>
                    {edu.achievements?.length > 0 && (
                      <ul className="space-y-1.5 text-sm text-muted-foreground/50">
                        {edu.achievements.map((a: string, i: number) => (
                          <li key={i} className="flex gap-2 items-start">
                            <span className="w-1 h-1 rounded-full bg-primary/50 flex-shrink-0 mt-2" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div className="mb-12">
          <GitHubHeatmap />
        </div>

        <div className="mb-12">
          <LinkedInQR variant="card" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button asChild className="gradient-primary text-white rounded-xl font-semibold group">
            <Link to="/projects">
              Explore Projects
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="animated-border rounded-xl border-white/[0.06]">
            <Link to="/contact">Work Together</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
