import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

export default function Experience() {
  const [experiences, setExperiences] = useState<any[]>([]);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    const { data } = await supabase.from('experiences').select('*').order('display_order');
    if (data) setExperiences(data);
  };

  return (
    <div className="relative min-h-screen pt-20 pb-20 px-4 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 aurora opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-[0.05] pointer-events-none" />

      <div className="container mx-auto max-w-4xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Work Experience</h1>
          <p className="text-lg text-muted-foreground">My professional journey</p>
        </motion.div>

        {/* System Log Timeline */}
        <div className="relative">
          {/* Glowing vertical rail */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[hsl(var(--gradient-from))] via-[hsl(var(--gradient-via))] to-[hsl(var(--gradient-to))] opacity-40" />

          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={`relative mb-12 md:mb-16 ${index % 2 === 0 ? 'md:pr-1/2' : 'md:pl-1/2 md:ml-auto'}`}
            >
              {/* Timeline node */}
              <div className="absolute left-8 md:left-1/2 w-4 h-4 -translate-x-1/2 rounded-full bg-[hsl(var(--primary))] border-4 border-background shadow-[0_0_0_4px_hsl(var(--primary)/0.15)]" />

              {/* Content Card */}
              <div className="ml-16 md:ml-0 glassmorphic rounded-2xl p-6 md:p-8 hover-lift text-left tilt-hover sheen glow-soft">
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold mb-1">{exp.role}</h3>
                  <p className="text-xl gradient-text font-semibold">{exp.company}</p>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{exp.duration}</span>
                  </div>
                  {exp.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{exp.location}</span>
                    </div>
                  )}
                  {exp.work_type && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{exp.work_type}</span>
                    </div>
                  )}
                </div>

                {/* Description - Staggered bullets */}
                {Array.isArray(exp.description) && exp.description.length > 0 && (
                  <ul className="space-y-2 mb-6 text-muted-foreground">
                    {exp.description.map((item: string, i: number) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: 0.05 * i }}
                        className="flex gap-2 items-start"
                      >
                        <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                        <span className="flex-1">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}

                {/* Technologies */}
                {Array.isArray(exp.technologies) && exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech: string) => (
                      <Badge key={tech} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
