/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Github, Linkedin, Trophy, Tv, Award as AwardIcon, GraduationCap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

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

    const { data: achievementsData } = await supabase
      .from('achievements')
      .select('*')
      .order('display_order');

    if (achievementsData) setAchievements(achievementsData);

    const { data: educationData } = await supabase
      .from('education')
      .select('*')
      .order('display_order');

    if (educationData) setEducation(educationData);
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-20 pb-20 px-4 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 aurora opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-[0.05] pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">About Me</span>
          </h1>
          <p className="text-lg text-muted-foreground">Get to know me better</p>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glassmorphic rounded-2xl p-8 md:p-12 mb-12 glow-soft"
        >
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-48 h-48 rounded-full overflow-hidden ring-4 ring-primary/30 relative noise-overlay sheen">
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
                  <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--gradient-from))] to-[hsl(var(--gradient-to))] flex items-center justify-center text-6xl font-bold text-white">
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

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">{profile.name}</h2>
              <p className="text-xl gradient-text font-semibold mb-4">{profile.title}</p>
              <p className="text-muted-foreground mb-6">{profile.tagline}</p>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                {profile.email && (
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <Mail className="w-5 h-5 text-primary" />
                    <a href={`mailto:${profile.email}`} className="hover:text-primary transition-colors">
                      {profile.email}
                    </a>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <Phone className="w-5 h-5 text-primary" />
                    <a href={`tel:${profile.phone}`} className="hover:text-primary transition-colors">
                      {profile.phone}
                    </a>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="flex gap-4 justify-center md:justify-start mb-6">
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="rounded-full hover-lift sheen">
                      <Github className="w-5 h-5" />
                    </Button>
                  </a>
                )}
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="rounded-full hover-lift sheen">
                      <Linkedin className="w-5 h-5" />
                    </Button>
                  </a>
                )}
              </div>

              {/* Core Stack from tagline */}
              {profile.tagline && (
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {profile.tagline.split('|').map((item: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs border border-primary/20"
                    >
                      {item.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-xl font-semibold mb-4">About</h3>
            <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>

            {/* Operating principles */}
            <div className="mt-6 flex flex-wrap gap-3">
              {['Reliability', 'Performance', 'Safety', 'Privacy'].map((p, i) => (
                <span
                  key={p}
                  className="px-3 py-1 rounded-full bg-[hsl(var(--card))]/70 border border-[hsl(var(--border))] text-foreground/80 text-xs"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Achievements Section */}
        {achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">
              <span className="gradient-text">Key Achievements</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => {
                const Icon = iconMap[achievement.icon] || AwardIcon;
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.08 }}
                    whileHover={{ y: -6 }}
                    className="glassmorphic rounded-2xl p-6 hover-lift tilt-hover sheen glow-soft"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--gradient-from))] to-[hsl(var(--gradient-to))] flex items-center justify-center mb-4 shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.55)]">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                    {achievement.institution && (
                      <p className="text-sm text-primary font-medium">{achievement.institution}</p>
                    )}
                    {achievement.date && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(achievement.date).getFullYear()}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Education Section */}
        {education.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glassmorphic rounded-2xl p-8 glow-soft"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">
              <span className="gradient-text">Education</span>
            </h2>
            <div className="relative pl-3 md:pl-6">
              {/* Vertical rail */}
              <div className="absolute top-0 bottom-0 left-1.5 md:left-2 w-[2px] bg-gradient-to-b from-[hsl(var(--gradient-from))] via-[hsl(var(--gradient-via))] to-[hsl(var(--gradient-to))] opacity-40" />
              <div className="space-y-8">
                {education.map((edu, idx) => (
                  <div key={edu.id} className="relative pl-6">
                    {/* Node */}
                    <div className="absolute left-[-2px] md:left-[-4px] top-2 w-3 h-3 rounded-full bg-[hsl(var(--primary))] shadow-[0_0_0_3px_hsl(var(--primary)/0.2)]" />
                    <h3 className="text-2xl font-bold mb-1">{edu.degree}</h3>
                    <p className="text-lg text-primary font-semibold mb-2">{edu.institution}</p>
                    {edu.university && <p className="text-muted-foreground mb-2">{edu.university}</p>}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <span>{edu.duration}</span>
                      {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
                      {edu.grade && <span className="text-primary font-medium">{edu.grade}</span>}
                    </div>
                    {edu.achievements && edu.achievements.length > 0 && (
                      <div className="mt-3">
                        <p className="font-semibold mb-2">Key Achievements:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {edu.achievements.map((achievement: string, i: number) => (
                            <li key={i}>{achievement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <a href="/projects">
            <Button className="gradient-primary text-white sheen glow-soft">Explore Projects</Button>
          </a>
          <a href="/contact">
            <Button variant="outline" className="animated-border">Work Together</Button>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
