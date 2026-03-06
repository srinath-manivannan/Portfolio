/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, ArrowRight, RefreshCw, ExternalLink, Github, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const interests = [
  { id: 'ai', label: 'AI & Machine Learning', keywords: ['ai', 'ml', 'machine', 'learning', 'neural', 'nlp', 'gpt', 'langchain', 'automation'] },
  { id: 'fullstack', label: 'Full-Stack Apps', keywords: ['react', 'next', 'node', 'express', 'mern', 'typescript', 'fullstack', 'full-stack'] },
  { id: 'cloud', label: 'Cloud & DevOps', keywords: ['aws', 'docker', 'kubernetes', 'ci/cd', 'cloud', 'serverless', 'devops', 'deploy'] },
  { id: 'mobile', label: 'Mobile & Cross-Platform', keywords: ['mobile', 'react native', 'flutter', 'ios', 'android', 'app'] },
  { id: 'data', label: 'Data & Analytics', keywords: ['data', 'analytics', 'dashboard', 'visualization', 'chart', 'database', 'mongodb', 'postgresql'] },
];

export default function AIProjectRecommender() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('projects').select('*').order('display_order');
      if (data) setProjects(data);
    })();
  }, []);

  const recommend = async (interestId: string) => {
    setSelectedInterest(interestId);
    setAnalyzing(true);

    await new Promise(r => setTimeout(r, 800));

    const interest = interests.find(i => i.id === interestId);
    if (!interest) return;

    const scored = projects.map(p => {
      const text = `${p.title} ${p.short_description} ${p.description} ${(p.tech_stack || []).join(' ')}`.toLowerCase();
      let score = 0;
      for (const kw of interest.keywords) {
        if (text.includes(kw)) score += 2;
      }
      if (p.featured) score += 1;
      return { ...p, score };
    }).filter(p => p.score > 0).sort((a, b) => b.score - a.score);

    setRecommendations(scored.length > 0 ? scored.slice(0, 3) : projects.slice(0, 3));
    setAnalyzing(false);
  };

  const reset = () => {
    setSelectedInterest(null);
    setRecommendations([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="premium-card p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold font-display text-lg flex items-center gap-2">
            AI Project Recommender
            <Sparkles className="w-4 h-4 text-primary" />
          </h3>
          <p className="text-xs text-muted-foreground/50">Select your interest to get personalized recommendations</p>
        </div>
      </div>

      {!selectedInterest ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {interests.map((interest, i) => (
            <motion.button
              key={interest.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => recommend(interest.id)}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-primary/20 transition-all text-left group"
            >
              <p className="text-sm font-medium group-hover:text-primary transition-colors">{interest.label}</p>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 mt-2 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </motion.button>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                {interests.find(i => i.id === selectedInterest)?.label}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={reset} className="text-xs">
              <RefreshCw className="w-3 h-3 mr-1" /> Change Interest
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {analyzing ? (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground/50 animate-pulse">AI is analyzing projects...</p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <p className="text-xs text-muted-foreground/50 mb-3">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Found {recommendations.length} relevant project{recommendations.length !== 1 ? 's' : ''} for you
                </p>

                {recommendations.map((proj, i) => (
                  <motion.div
                    key={proj.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="premium-card rounded-xl !p-4 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm group-hover:text-primary transition-colors truncate">
                          {proj.title}
                        </h4>
                        <p className="text-xs text-muted-foreground/50 mt-1 line-clamp-2">
                          {proj.short_description || proj.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(proj.tech_stack || []).slice(0, 4).map((tech: string) => (
                            <span key={tech} className="px-1.5 py-0.5 text-[10px] rounded bg-white/[0.03] text-muted-foreground/50">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        {proj.live_url && (
                          <a href={proj.live_url} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-center hover:bg-primary/10 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {proj.github_url && (
                          <a href={proj.github_url} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-center hover:bg-primary/10 transition-colors"
                          >
                            <Github className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                <Button asChild variant="outline" size="sm" className="w-full mt-4 text-xs">
                  <Link to="/projects">
                    View All Projects <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
