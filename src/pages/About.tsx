import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Github, Linkedin, Trophy, Tv, Award as AwardIcon, GraduationCap } from 'lucide-react';
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
      .from('public_profiles')
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
    <div className="min-h-screen pt-20 pb-20 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">About Me</h1>
          <p className="text-lg text-muted-foreground">Get to know me better</p>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glassmorphic rounded-2xl p-8 md:p-12 mb-12"
        >
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-48 h-48 rounded-full overflow-hidden ring-4 ring-primary/30">
                {profile.profile_image ? (
                  <img 
                    src={profile.profile_image} 
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-6xl font-bold text-white">
                    {profile.name.charAt(0)}
                  </div>
                )}
              </div>
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
              <div className="flex gap-4 justify-center md:justify-start">
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="rounded-full hover-lift">
                      <Github className="w-5 h-5" />
                    </Button>
                  </a>
                )}
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="rounded-full hover-lift">
                      <Linkedin className="w-5 h-5" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-xl font-semibold mb-4">About</h3>
            <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
          </div>
        </motion.div>

        {/* Achievements Section */}
        {achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-8 gradient-text text-center">Key Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => {
                const Icon = iconMap[achievement.icon] || AwardIcon;
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    className="glassmorphic rounded-2xl p-6 hover-lift"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
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
            transition={{ duration: 0.6, delay: 0.6 }}
            className="glassmorphic rounded-2xl p-8"
          >
            <h2 className="text-3xl font-bold mb-8 gradient-text text-center">Education</h2>
            <div className="space-y-6">
              {education.map((edu) => (
                <div key={edu.id} className="border-l-4 border-primary pl-6">
                  <h3 className="text-2xl font-bold mb-1">{edu.degree}</h3>
                  <p className="text-lg text-primary font-semibold mb-2">{edu.institution}</p>
                  {edu.university && (
                    <p className="text-muted-foreground mb-2">{edu.university}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <span>{edu.duration}</span>
                    {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
                    {edu.grade && <span className="text-primary font-medium">{edu.grade}</span>}
                  </div>
                  {edu.achievements && edu.achievements.length > 0 && (
                    <div className="mt-3">
                      <p className="font-semibold mb-2">Key Achievements:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {edu.achievements.map((achievement: string, idx: number) => (
                          <li key={idx}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
