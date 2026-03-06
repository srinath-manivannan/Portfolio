/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SkillRadarChart from '@/components/SkillRadarChart';

export default function Skills() {
  const [skills, setSkills] = useState<any[]>([]);
  const [groupedSkills, setGroupedSkills] = useState<Record<string, any[]>>({});
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => { fetchSkills(); }, []);

  const fetchSkills = async () => {
    const { data } = await supabase.from('skills').select('*').order('display_order');
    if (data) {
      setSkills(data);
      const grouped = data.reduce((acc: Record<string, any[]>, skill) => {
        if (!acc[skill.category]) acc[skill.category] = [];
        acc[skill.category].push(skill);
        return acc;
      }, {});
      setGroupedSkills(grouped);
    }
  };

  const categories = useMemo(() => ['All', ...Object.keys(groupedSkills)], [groupedSkills]);
  const displaySkills = useMemo(() => {
    if (activeCategory === 'All') return groupedSkills;
    return { [activeCategory]: groupedSkills[activeCategory] || [] };
  }, [activeCategory, groupedSkills]);

  const colorFor = (p: number) => {
    if (p >= 85) return { bar: 'from-emerald-500 to-green-400', text: 'text-emerald-500', label: 'Expert' };
    if (p >= 70) return { bar: 'from-blue-500 to-cyan-400', text: 'text-blue-500', label: 'Advanced' };
    if (p >= 50) return { bar: 'from-amber-500 to-yellow-400', text: 'text-amber-500', label: 'Intermediate' };
    return { bar: 'from-orange-500 to-red-400', text: 'text-orange-500', label: 'Learning' };
  };

  const totalSkills = skills.length;
  const avgProficiency = skills.length > 0 ? Math.round(skills.reduce((s, sk) => s + (sk.proficiency || 0), 0) / skills.length) : 0;
  const expertSkills = skills.filter((s) => s.proficiency >= 85).length;

  return (
    <div className="relative min-h-screen pt-24 pb-24 px-4 overflow-hidden">
      <div className="absolute inset-0 aurora opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-dots opacity-[0.02] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="premium-badge mb-4">
            <Sparkles className="w-3 h-3" />
            TECHNICAL
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display tracking-tight gradient-text-premium">Skills & Technologies</h1>
          <p className="text-muted-foreground mb-8">My technical expertise at a glance</p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <div className="premium-card px-5 py-3">
              <div className="text-2xl font-bold gradient-text-premium">{totalSkills}</div>
              <div className="text-xs text-muted-foreground">Total Skills</div>
            </div>
            <div className="premium-card px-5 py-3">
              <div className="text-2xl font-bold gradient-text-premium">{avgProficiency}%</div>
              <div className="text-xs text-muted-foreground">Avg Proficiency</div>
            </div>
            <div className="premium-card px-5 py-3">
              <div className="text-2xl font-bold gradient-text-premium">{expertSkills}</div>
              <div className="text-xs text-muted-foreground">Expert Level</div>
            </div>
            <div className="premium-card px-5 py-3">
              <div className="text-2xl font-bold gradient-text-premium">{Object.keys(groupedSkills).length}</div>
              <div className="text-xs text-muted-foreground">Categories</div>
            </div>
          </div>

          {/* Category filter */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="premium-card flex-wrap h-auto">
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="text-xs text-muted-foreground/80">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Skills matrix */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-10"
          >
            {Object.entries(displaySkills).map(([category, items], catIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: catIndex * 0.1 }}
                className="premium-card p-6 md:p-8 glow-premium"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl md:text-2xl font-bold font-display gradient-text-premium">{category}</h2>
                  <span className="text-xs text-muted-foreground bg-white/[0.03] px-2.5 py-1 rounded-full">
                    {items.length} skills
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {items.map((skill: any, index: number) => {
                    const color = colorFor(skill.proficiency);
                    return (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, x: -15 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.03 }}
                        className="group"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{skill.name}</span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/[0.03] ${color.text}`}>
                              {color.label}
                            </span>
                          </div>
                          <span className="text-sm font-mono text-muted-foreground">{skill.proficiency}%</span>
                        </div>

                        <div className="relative h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.proficiency}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.1 + index * 0.03, ease: 'easeOut' }}
                            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${color.bar} rounded-full`}
                          />
                          <motion.div
                            initial={{ left: '0%', opacity: 0 }}
                            whileInView={{ left: `${skill.proficiency}%`, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2 + index * 0.03 }}
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_0_2px_hsl(var(--primary)/0.3)] opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Skill Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 premium-card p-8 glow-premium"
        >
          <h3 className="text-xl font-bold font-display gradient-text-premium text-center mb-6">Skill Distribution Radar</h3>
          <SkillRadarChart
            skills={Object.entries(groupedSkills).map(([name, items]) => ({
              name,
              value: Math.round(items.reduce((s: number, sk: any) => s + (sk.proficiency || 0), 0) / items.length),
            }))}
            size={320}
          />
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 premium-card p-6 max-w-lg mx-auto"
        >
          <h4 className="text-sm font-semibold font-display mb-3 text-center">Proficiency Legend</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
            {[
              { label: 'Expert (85%+)', color: 'from-emerald-500 to-green-400' },
              { label: 'Advanced (70-84%)', color: 'from-blue-500 to-cyan-400' },
              { label: 'Intermediate (50-69%)', color: 'from-amber-500 to-yellow-400' },
              { label: 'Learning (<50%)', color: 'from-orange-500 to-red-400' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`w-8 h-2 rounded-full bg-gradient-to-r ${item.color}`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
