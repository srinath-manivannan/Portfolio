import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, Github, Star, Radar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeContext';

export default function Projects() {
  const { prefersReducedMotion } = useTheme();
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'MERN', 'n8n', 'Frontend', 'Full-Stack'];

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, selectedCategory]);

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
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  };

  const isAIProject = (p: any) => {
    const hay = [p.title, p.short_description, p.description, ...(p.tech_stack || [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return /\b(ai|ml|machine learning|gpt|transformer|vision|llm|rag|agent|n8n|automation|langchain|openai|claude)\b/i.test(
      hay
    );
  };

  const underlineRef = useRef<HTMLDivElement | null>(null);
  const tabsListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Animated underline for filters
    const list = tabsListRef.current;
    const underline = underlineRef.current;
    if (!list || !underline) return;

    const active = list.querySelector(`[data-value="${selectedCategory}"]`) as HTMLElement | null;
    if (!active) return;

    const rect = active.getBoundingClientRect();
    const host = list.getBoundingClientRect();
    underline.style.width = `${rect.width}px`;
    underline.style.transform = `translateX(${rect.left - host.left}px)`;
  }, [selectedCategory]);

  const header = useMemo(
    () => (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">Projects</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8">Explore my work</p>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glassmorphic border-border/50"
            />
          </div>
        </div>

        {/* Filters with animated underline */}
        <div className="relative inline-block">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList ref={tabsListRef as any} className="glassmorphic relative">
              <div
                ref={underlineRef}
                className="absolute bottom-0 h-[2px] bg-gradient-to-r from-[hsl(var(--gradient-from))] to-[hsl(var(--gradient-to))] transition-transform duration-300"
                style={{ width: 0 }}
              />
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat} data-value={cat}>
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </motion.div>
    ),
    [prefersReducedMotion, searchQuery, selectedCategory]
  );

  return (
    <div className="relative min-h-screen pt-20 pb-20 px-4 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 aurora opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-[0.05] pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative">
        {header}

        {/* Skeletons while loading */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glassmorphic rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : index * 0.08 }}
                className="glassmorphic rounded-2xl overflow-hidden hover-lift group tilt-hover glow-soft relative"
              >
                {/* Badges */}
                <div className="absolute top-3 right-3 z-10 flex gap-2">
                  {project.featured && (
                    <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm flex items-center gap-1">
                      <Star className="w-3 h-3" /> Featured
                    </Badge>
                  )}
                  {isAIProject(project) && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Radar className="w-3 h-3" /> AI Ready
                    </Badge>
                  )}
                </div>
                <div className="absolute top-3 left-3 z-10">
                  <Badge variant="outline" className="bg-[hsl(var(--card))]/80 backdrop-blur-sm text-xs">
                    {project.category}
                  </Badge>
                </div>

                {/* Media with sheen and optional video hover */}
                <div className="relative h-48 bg-gradient-to-br from-[hsl(var(--gradient-from))/0.2] to-[hsl(var(--gradient-to))/0.2] overflow-hidden">
                  {project.video_url ? (
                    <video
                      src={project.video_url}
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                  ) : project.images && project.images.length > 0 ? (
                    <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
                      {project.title.charAt(0)}
                    </div>
                  )}
                  {/* sheen sweep */}
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {project.short_description || project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech_stack?.slice(0, 3).map((tech: string) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.tech_stack?.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.tech_stack.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Links and Live indicator */}
                  <div className="flex items-center gap-2">
                    {project.live_url && (
                      <Button size="sm" variant="outline" className="flex-1" asChild>
                        <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live
                        </a>
                      </Button>
                    )}
                    {project.github_url && (
                      <Button size="sm" variant="outline" className="flex-1" asChild>
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-2" />
                          Code
                        </a>
                      </Button>
                    )}
                  </div>

                  {project.live_url && (
                    <div className="mt-3 inline-flex items-center gap-2 text-xs text-green-500">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Live preview available
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredProjects.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
}
