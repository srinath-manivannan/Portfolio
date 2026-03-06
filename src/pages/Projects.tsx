/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ExternalLink, Github, Star, Radar, X, ChevronLeft, ChevronRight, Eye, Layers } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeContext';

interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  short_description: string;
  tech_stack: string[];
  category: string;
  live_url: string | null;
  github_url: string | null;
  images: string[];
  video_url: string | null;
  featured: boolean;
  display_order: number;
}

function ProjectModal({ project, onClose }: { project: ProjectDetail; onClose: () => void }) {
  const [imgIndex, setImgIndex] = useState(0);
  const images = project.images || [];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && images.length > 1) setImgIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight' && images.length > 1) setImgIndex((i) => (i + 1) % images.length);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose, images.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl"
        style={{ background: 'hsl(228 60% 6% / 0.95)', backdropFilter: 'blur(32px)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image carousel */}
        {(images.length > 0 || project.video_url) && (
          <div className="relative aspect-video bg-white/[0.03] overflow-hidden rounded-t-2xl">
            {project.video_url ? (
              <video src={project.video_url} controls muted className="w-full h-full object-cover" />
            ) : images.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={imgIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    src={images[imgIndex]}
                    alt={`${project.title} screenshot ${imgIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setImgIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? 'bg-white w-6' : 'bg-white/40'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Content */}
        <div className="p-8">
          <div className="flex items-start gap-3 mb-4">
            <Badge variant="outline" className="text-xs flex-shrink-0">{project.category}</Badge>
            {project.featured && (
              <Badge className="bg-primary/20 text-primary border-primary/30 flex items-center gap-1 text-xs">
                <Star className="w-3 h-3" /> Featured
              </Badge>
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-bold font-display mb-4">{project.title}</h2>
          <p className="text-muted-foreground/70 leading-relaxed mb-6 whitespace-pre-line">
            {project.description || project.short_description}
          </p>

          {/* Tech Stack */}
          {project.tech_stack?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground/70 uppercase tracking-wider">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack.map((tech: string) => (
                  <Badge key={tech} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {project.live_url && (
              <Button asChild className="gradient-primary text-white sheen">
                <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" /> Live Demo
                </a>
              </Button>
            )}
            {project.github_url && (
              <Button variant="outline" asChild>
                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" /> Source Code
                </a>
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Projects() {
  const { prefersReducedMotion } = useTheme();
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null);

  const categories = ['All', 'MERN', 'n8n', 'Frontend', 'Full-Stack'];

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => { filterProjects(); }, [projects, searchQuery, selectedCategory]);

  const fetchProjects = async () => {
    setLoading(true);
    const { data } = await supabase.from('projects').select('*').order('display_order');
    if (data) setProjects(data);
    setLoading(false);
  };

  const filterProjects = () => {
    let filtered = projects;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.short_description?.toLowerCase().includes(q) ||
          p.tech_stack?.some((t: string) => t.toLowerCase().includes(q))
      );
    }
    setFilteredProjects(filtered);
  };

  const isAIProject = (p: any) => {
    const hay = [p.title, p.short_description, p.description, ...(p.tech_stack || [])]
      .filter(Boolean).join(' ');
    return /\b(ai|ml|machine learning|gpt|transformer|vision|llm|rag|agent|n8n|automation|langchain|openai|claude)\b/i.test(hay);
  };

  return (
    <div className="relative min-h-screen pt-24 pb-24 px-4 overflow-hidden">
      <div className="absolute inset-0 aurora opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-dots opacity-[0.02] pointer-events-none" />

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </AnimatePresence>

      <div className="container mx-auto max-w-7xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
          className="text-center mb-12"
        >
          <span className="premium-badge mb-4 inline-flex items-center gap-1.5">
            <Layers className="w-3 h-3" />PORTFOLIO
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">
            <span className="gradient-text-premium">Projects</span>
          </h1>
          <p className="text-muted-foreground/70 mb-4">
            {projects.length} projects built with passion and precision
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/70" />
              <Input
                type="text"
                placeholder="Search projects or technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/[0.02] border-white/[0.06] rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="bg-white/[0.02] border border-white/[0.06]">
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat}>
                  {cat}
                  {cat !== 'All' && (
                    <span className="ml-1.5 text-[10px] opacity-60">
                      {projects.filter((p) => p.category === cat).length}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Results count */}
        {searchQuery && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground/70 mb-6 text-center"
          >
            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
          </motion.p>
        )}

        {/* Loading skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="premium-card rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-white/[0.03]" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-white/[0.04] rounded w-3/4" />
                  <div className="h-4 bg-white/[0.03] rounded w-full" />
                  <div className="h-4 bg-white/[0.03] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: prefersReducedMotion ? 0 : index * 0.05 }}
                  onClick={() => setSelectedProject(project)}
                  className="premium-card rounded-2xl overflow-hidden group cursor-pointer hover:border-primary/30 transition-all hover:shadow-[0_0_40px_hsl(var(--primary)/0.08)] relative"
                >
                  {/* Badges */}
                  <div className="absolute top-3 right-3 z-10 flex gap-2">
                    {project.featured && (
                      <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm flex items-center gap-1 text-[10px]">
                        <Star className="w-3 h-3" /> Featured
                      </Badge>
                    )}
                    {isAIProject(project) && (
                      <Badge variant="secondary" className="flex items-center gap-1 text-[10px] backdrop-blur-sm">
                        <Radar className="w-3 h-3" /> AI
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-3 left-3 z-10">
                    <Badge variant="outline" className="bg-white/[0.04] backdrop-blur-sm text-[10px]">
                      {project.category}
                    </Badge>
                  </div>

                  {/* Media */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
                    {project.images?.length > 0 ? (
                      <img
                        src={project.images[0]}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Layers className="w-16 h-16 text-primary/10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/90 text-white text-xs font-medium">
                        <Eye className="w-3 h-3" /> View Details
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold font-display mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                    <p className="text-muted-foreground/70 text-sm mb-4 line-clamp-2">
                      {project.short_description || project.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.tech_stack?.slice(0, 4).map((tech: string) => (
                        <span key={tech} className="px-2 py-0.5 rounded-md bg-white/[0.03] text-[11px] font-medium text-muted-foreground">
                          {tech}
                        </span>
                      ))}
                      {project.tech_stack?.length > 4 && (
                        <span className="px-2 py-0.5 rounded-md bg-white/[0.03] text-[11px] font-medium text-primary">
                          +{project.tech_stack.length - 4}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {project.live_url && (
                        <Button size="sm" variant="outline" className="flex-1 text-xs h-8" asChild>
                          <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1.5" /> Live
                          </a>
                        </Button>
                      )}
                      {project.github_url && (
                        <Button size="sm" variant="outline" className="flex-1 text-xs h-8" asChild>
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                            <Github className="w-3 h-3 mr-1.5" /> Code
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredProjects.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Search className="w-12 h-12 text-muted-foreground/60 mx-auto mb-4" />
            <p className="text-muted-foreground/70 text-lg mb-2">No projects found</p>
            <p className="text-sm text-muted-foreground/70">Try adjusting your search or filter</p>
            <Button variant="ghost" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="mt-4">
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
