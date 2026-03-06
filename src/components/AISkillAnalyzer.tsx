/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, BarChart3, Target, Zap, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const marketDemand: Record<string, { label: string; level: number }> = {
  'React': { label: 'Very High', level: 95 },
  'TypeScript': { label: 'Very High', level: 93 },
  'Python': { label: 'Very High', level: 96 },
  'Node.js': { label: 'High', level: 88 },
  'Next.js': { label: 'High', level: 85 },
  'AWS': { label: 'Very High', level: 92 },
  'Docker': { label: 'High', level: 87 },
  'MongoDB': { label: 'High', level: 82 },
  'PostgreSQL': { label: 'High', level: 86 },
  'TailwindCSS': { label: 'High', level: 80 },
  'GraphQL': { label: 'Medium', level: 72 },
  'Redis': { label: 'Medium', level: 70 },
  'LangChain': { label: 'Rising', level: 78 },
  'OpenAI': { label: 'Rising', level: 90 },
};

function generateInsight(skills: any[]): string {
  const avgProf = skills.reduce((a: number, s: any) => a + (s.proficiency || 0), 0) / (skills.length || 1);
  const topSkill = skills.sort((a: any, b: any) => (b.proficiency || 0) - (a.proficiency || 0))[0];

  if (avgProf > 85) return `Exceptional skill profile with ${Math.round(avgProf)}% average proficiency. Your expertise in ${topSkill?.name || 'development'} positions you for senior/lead roles. Consider specializing in AI/ML to maximize market value.`;
  if (avgProf > 70) return `Strong skill profile with ${Math.round(avgProf)}% average proficiency. Focus on deepening ${topSkill?.name || 'core'} expertise and explore cloud-native architectures to stand out in the market.`;
  return `Growing skill profile with ${Math.round(avgProf)}% average proficiency. Prioritize mastering ${topSkill?.name || 'key technologies'} and build projects that showcase practical application.`;
}

export default function AISkillAnalyzer() {
  const [skills, setSkills] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    topSkills: any[];
    focusAreas: any[];
    insight: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('skills').select('*').order('proficiency', { ascending: false });
      if (data) setSkills(data);
    })();
  }, []);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 1500));

    const sorted = [...skills].sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));
    setResult({
      topSkills: sorted.slice(0, 5),
      focusAreas: skills.filter(s => (s.proficiency || 0) < 70).slice(0, 3),
      insight: generateInsight([...skills]),
    });
    setAnalyzing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="premium-card p-5 md:p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg font-display flex items-center gap-2 gradient-text-premium">
            AI Skill Analyzer
            <Sparkles className="w-4 h-4 text-primary" />
          </h3>
          <p className="text-xs text-muted-foreground">Deep analysis of skill distribution & market fit</p>
        </div>
      </div>

      {!result && !analyzing && (
        <Button onClick={runAnalysis} className="w-full gradient-primary text-white rounded-xl font-semibold">
          <Brain className="w-4 h-4 mr-2" />
          Run AI Analysis
        </Button>
      )}

      <AnimatePresence mode="wait">
        {analyzing && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground animate-pulse">Analyzing {skills.length} skills across {new Set(skills.map(s => s.category)).size} categories...</p>
            <div className="flex justify-center gap-1 mt-3">
              {['Proficiency', 'Market Fit', 'Growth'].map((step, i) => (
                <motion.span
                  key={step}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ delay: i * 0.4, duration: 1.2, repeat: Infinity }}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                >
                  {step}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* AI Insight */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/[0.06] to-secondary/[0.04] border border-primary/10">
              <div className="flex items-start gap-2">
                <Brain className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground leading-relaxed">{result.insight}</p>
              </div>
            </div>

            {/* Top Skills */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" /> Top Skills
              </h4>
              <div className="space-y-3">
                {result.topSkills.map((skill, i) => {
                  const demand = marketDemand[skill.name];
                  return (
                    <motion.div
                      key={skill.id || i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <div className="flex items-center gap-2">
                          {demand && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              demand.level > 90 ? 'bg-green-500/10 text-green-400' :
                              demand.level > 80 ? 'bg-blue-500/10 text-blue-400' :
                              'bg-amber-500/10 text-amber-400'
                            }`}>
                              {demand.label}
                            </span>
                          )}
                          <span className="text-xs font-mono text-muted-foreground">{skill.proficiency}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.proficiency}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Focus Areas */}
            {result.focusAreas.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Target className="w-3 h-3" /> Suggested Focus Areas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.focusAreas.map((skill) => (
                    <span key={skill.id || skill.name} className="px-3 py-1.5 rounded-lg bg-amber-500/[0.06] border border-amber-500/10 text-amber-400/90 text-xs font-medium flex items-center gap-1.5">
                      <Zap className="w-3 h-3" />
                      {skill.name} ({skill.proficiency}%)
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={runAnalysis} variant="outline" size="sm" className="w-full text-xs rounded-xl border-white/[0.06]">
              <RefreshCw className="w-3 h-3 mr-1.5" /> Re-analyze
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
