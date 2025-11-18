import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

export default function Skills() {
  const [skills, setSkills] = useState<any[]>([]);
  const [groupedSkills, setGroupedSkills] = useState<Record<string, any[]>>({});

  useEffect(() => {
    fetchSkills();
  }, []);

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

  const colorFor = (p: number) => {
    if (p >= 85) return 'from-green-500 to-emerald-500';
    if (p >= 70) return 'from-blue-500 to-cyan-500';
    if (p >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  const Legend = useMemo(
    () => (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="fixed bottom-6 right-6 glassmorphic rounded-xl p-4 shadow-xl hidden md:block"
      >
        <h4 className="text-sm font-semibold mb-2">Proficiency Legend</h4>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-12 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" /> Expert (85%+)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-12 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" /> Advanced (70-84%)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-12 h-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500" /> Intermediate (50-69%)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-12 h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500" /> Beginner (&lt;50%)
          </div>
        </div>
      </motion.div>
    ),
    []
  );

  return (
    <div className="relative min-h-screen pt-20 pb-20 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 aurora opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-[0.05] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Skills & Technologies</h1>
          <p className="text-lg text-muted-foreground">My technical expertise</p>
        </motion.div>

        {/* Capability Matrix */}
        <div className="space-y-12">
          {Object.entries(groupedSkills).map(([category, items], catIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.05 * catIndex }}
              className="glassmorphic rounded-2xl p-8 glow-soft"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold gradient-text">{category}</h2>
                <div className="text-xs text-muted-foreground">{items.length} items</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map((skill: any, index: number) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.04 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-end">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-sm text-muted-foreground">{skill.proficiency}%</span>
                    </div>

                    {/* Capsule bar with animated marker */}
                    <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.proficiency}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: catIndex * 0.05 + index * 0.03 }}
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colorFor(skill.proficiency)} rounded-full`}
                      />
                      {/* moving marker */}
                      <motion.span
                        initial={{ x: 0, opacity: 0 }}
                        whileInView={{ x: `${skill.proficiency}%`, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.15 + catIndex * 0.05 + index * 0.03 }}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_0_3px_hsl(var(--primary)/0.25)]"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Floating Legend (desktop) */}
        {Legend}
      </div>
    </div>
  );
}
