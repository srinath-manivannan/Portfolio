/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Briefcase, ChevronRight, ExternalLink, Layers, Clock, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function Experience() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => { fetchExperiences(); }, []);

  const fetchExperiences = async () => {
    const { data } = await supabase.from('experiences').select('*').order('display_order');
    if (data) {
      setExperiences(data);
      if (data.length > 0) setActiveId(data[0].id);
    }
  };

  const totalTech = new Set(experiences.flatMap((e: any) => e.technologies || [])).size;

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 overflow-x-hidden">
      <div className="absolute inset-0 aurora opacity-30 pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 md:mb-16"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span className="premium-badge mb-3 inline-flex items-center gap-1.5">
                <Briefcase className="w-3 h-3" />
                CAREER JOURNEY
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tight gradient-text-premium mb-2">
                Work Experience
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-lg">
                Building products and leading engineering teams across startups and enterprises.
              </p>
            </div>

            {/* Stats row */}
            <div className="flex gap-5 md:gap-6">
              {[
                { value: `${experiences.length}`, label: 'Roles', icon: Briefcase },
                { value: '3+', label: 'Years', icon: Clock },
                { value: `${totalTech}`, label: 'Tech', icon: Layers },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 mx-auto mb-1.5">
                    <stat.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-lg font-bold font-display text-foreground">{stat.value}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Experience cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {experiences.map((exp, index) => {
            const isActive = activeId === exp.id;
            const isFirst = index === 0;

            return (
              <motion.div key={exp.id} variants={cardVariants} layout>
                <div
                  onClick={() => setActiveId(isActive ? null : exp.id)}
                  className={`group relative rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                    isActive
                      ? 'border-primary/30 shadow-[0_0_0_1px_hsl(var(--primary)/0.1),0_8px_40px_-12px_hsl(var(--primary)/0.15)]'
                      : 'border-border hover:border-primary/20 hover:shadow-[0_4px_20px_-8px_hsl(var(--primary)/0.1)]'
                  }`}
                >
                  {/* Gradient accent line at top */}
                  <div
                    className={`h-[2px] transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}
                    style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)))' }}
                  />

                  <div className="bg-card p-5 sm:p-6 md:p-8">
                    {/* Top row: duration + status */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {exp.duration}
                        </div>
                        {exp.location && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            {exp.location}
                          </div>
                        )}
                        {exp.work_type && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/15">
                            {exp.work_type}
                          </span>
                        )}
                      </div>

                      {isFirst && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/15">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          CURRENT
                        </span>
                      )}
                    </div>

                    {/* Title + Company */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-display mb-1 group-hover:text-primary transition-colors leading-tight">
                          {exp.role}
                        </h3>
                        <p className="text-sm sm:text-base gradient-text-premium font-semibold">{exp.company}</p>
                      </div>

                      <motion.div
                        animate={{ rotate: isActive ? 90 : 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-shrink-0 w-8 h-8 rounded-lg surface-subtle flex items-center justify-center"
                      >
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                    </div>

                    {/* Tech preview — always visible */}
                    {Array.isArray(exp.technologies) && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {exp.technologies.slice(0, isActive ? undefined : 5).map((tech: string) => (
                          <span
                            key={tech}
                            className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md surface-subtle text-muted-foreground"
                          >
                            {tech}
                          </span>
                        ))}
                        {!isActive && exp.technologies.length > 5 && (
                          <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md text-primary/60">
                            +{exp.technologies.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="mt-6 pt-6 border-t border-border/60">
                            {Array.isArray(exp.description) && exp.description.length > 0 && (
                              <div className="space-y-3">
                                {exp.description.map((item: string, i: number) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04, duration: 0.3 }}
                                    className="flex gap-3 items-start group/item"
                                  >
                                    <div className="mt-1.5 flex-shrink-0">
                                      <Zap className="w-3.5 h-3.5 text-primary/60" />
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item}</p>
                                  </motion.div>
                                ))}
                              </div>
                            )}

                            {/* Technologies full list */}
                            {Array.isArray(exp.technologies) && exp.technologies.length > 0 && (
                              <div className="mt-6">
                                <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-3">
                                  TECH STACK
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {exp.technologies.map((tech: string) => (
                                    <Badge
                                      key={tech}
                                      variant="secondary"
                                      className="bg-primary/8 text-primary border border-primary/15 text-[11px] px-2.5 py-1 font-medium"
                                    >
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
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-px w-8 bg-border" />
            Want to know more?
            <a
              href="https://linkedin.com/in/srinath-manivannan-57a751197"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
            >
              View LinkedIn <ExternalLink className="w-3 h-3" />
            </a>
            <div className="h-px w-8 bg-border" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
