import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

export default function Skills() {
  const [skills, setSkills] = useState<any[]>([]);
  const [groupedSkills, setGroupedSkills] = useState<Record<string, any[]>>({});

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    const { data } = await supabase
      .from('skills')
      .select('*')
      .order('display_order');
    
    if (data) {
      setSkills(data);
      
      // Group by category
      const grouped = data.reduce((acc: Record<string, any[]>, skill) => {
        if (!acc[skill.category]) {
          acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
      }, {});
      
      setGroupedSkills(grouped);
    }
  };

  const getColorForProficiency = (proficiency: number) => {
    if (proficiency >= 85) return 'from-green-500 to-emerald-500';
    if (proficiency >= 70) return 'from-blue-500 to-cyan-500';
    if (proficiency >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  return (
    <div className="min-h-screen pt-20 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
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

        {/* Skills by Category */}
        <div className="space-y-12">
          {Object.entries(groupedSkills).map(([category, categorySkills], catIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: catIndex * 0.1 }}
              className="glassmorphic rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold mb-6 gradient-text">{category}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categorySkills.map((skill, index) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-sm text-muted-foreground">{skill.proficiency}%</span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.proficiency}%` }}
                        transition={{ duration: 1, delay: catIndex * 0.1 + index * 0.05 }}
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getColorForProficiency(skill.proficiency)} rounded-full`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 glassmorphic rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Proficiency Levels</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
              <span className="text-sm">Expert (85%+)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
              <span className="text-sm">Advanced (70-84%)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" />
              <span className="text-sm">Intermediate (50-69%)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
              <span className="text-sm">Beginner (&lt;50%)</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
