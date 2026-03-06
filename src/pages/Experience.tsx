/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Briefcase, ChevronDown, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

export default function Experience() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { fetchExperiences(); }, []);

  const fetchExperiences = async () => {
    const { data } = await supabase.from('experiences').select('*').order('display_order');
    if (data) setExperiences(data);
  };

  const totalMonths = experiences.reduce((acc, exp) => {
    if (!exp.duration) return acc;
    const match = exp.duration.match(/(\d+)/g);
    if (match) return acc + (match.length > 1 ? parseInt(match[0]) * 12 + parseInt(match[1]) : parseInt(match[0]));
    return acc;
  }, 0);

  return (
    <div className="relative min-h-screen pt-24 pb-24 px-4 overflow-hidden">
      <div className="absolute inset-0 aurora opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-dots opacity-[0.02] pointer-events-none" />

      <div className="container mx-auto max-w-4xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="premium-badge mb-4 inline-flex items-center gap-1.5">
            <Briefcase className="w-3 h-3" />
            CAREER
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display tracking-tight gradient-text-premium">Work Experience</h1>
          <p className="text-muted-foreground/50 mb-6">My professional journey</p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-3 justify-center">
            <div className="premium-card rounded-xl px-4 py-2 text-sm whitespace-nowrap">
              <span className="text-primary font-bold">{experiences.length}</span>
              <span className="text-muted-foreground/50 ml-1">Positions</span>
            </div>
            <div className="premium-card rounded-xl px-4 py-2 text-sm whitespace-nowrap">
              <span className="text-primary font-bold">3+</span>
              <span className="text-muted-foreground/50 ml-1">Years</span>
            </div>
            <div className="premium-card rounded-xl px-4 py-2 text-sm whitespace-nowrap">
              <span className="text-primary font-bold">
                {new Set(experiences.flatMap((e: any) => e.technologies || [])).size}
              </span>
              <span className="text-muted-foreground/50 ml-1">Technologies Used</span>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative pl-0 md:pl-0">
          <div className="absolute left-[0.55rem] md:left-8 top-0 bottom-0 w-[2px]" style={{ background: 'linear-gradient(to bottom, hsl(220 90% 56% / 0.2), hsl(262 83% 58% / 0.15), transparent)' }} />

          {experiences.map((exp, index) => {
            const isExpanded = expandedId === exp.id;

            return (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative mb-8 ml-8 md:ml-20"
              >
                {/* Timeline node */}
                <div className="absolute -left-[1.65rem] md:-left-[4.25rem] top-6 z-10">
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="w-3.5 h-3.5 md:w-5 md:h-5 rounded-full bg-primary border-[3px] md:border-4 border-background shadow-[0_0_0_3px_hsl(var(--primary)/0.2),0_0_15px_hsl(var(--primary)/0.3)]"
                  />
                </div>

                {/* Year label — desktop only, beside timeline */}
                {(index === 0 || experiences[index - 1]?.duration?.split(' ')[0] !== exp.duration?.split(' ')[0]) && (
                  <div className="absolute -left-[7.5rem] top-5 text-xs font-mono text-muted-foreground/40 hidden md:block w-16 text-right">
                    {exp.duration?.split('–')[0]?.trim() || ''}
                  </div>
                )}

                {/* Card */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                  className="premium-card rounded-xl md:rounded-2xl p-4 md:p-8 cursor-pointer hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg md:text-2xl font-bold font-display mb-1 group-hover:text-primary transition-colors">
                        {exp.role}
                      </h3>
                      <p className="text-lg gradient-text-premium font-semibold mb-3">{exp.company}</p>

                      <div className="flex flex-wrap gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground/50">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{exp.duration}</span>
                        </div>
                        {exp.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{exp.location}</span>
                          </div>
                        )}
                        {exp.work_type && (
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>{exp.work_type}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 mt-1"
                    >
                      <ChevronDown className="w-5 h-5 text-muted-foreground/50" />
                    </motion.div>
                  </div>

                  {/* Expandable content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 pt-6 border-t border-white/[0.04]">
                          {Array.isArray(exp.description) && exp.description.length > 0 && (
                            <ul className="space-y-3 mb-6">
                              {exp.description.map((item: string, i: number) => (
                                <motion.li
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="flex gap-3 items-start text-muted-foreground/50"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                                  <span className="flex-1 leading-relaxed">{item}</span>
                                </motion.li>
                              ))}
                            </ul>
                          )}

                          {Array.isArray(exp.technologies) && exp.technologies.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">Technologies</p>
                              <div className="flex flex-wrap gap-2">
                                {exp.technologies.map((tech: string) => (
                                  <Badge key={tech} variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
