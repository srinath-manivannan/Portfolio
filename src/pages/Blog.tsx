import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Eye, Search, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  published_at: string;
  views_count: number;
  tags: string[];
  blog_categories: { name: string; color: string } | null;
}

function estimateReadTime(excerpt: string): string {
  const words = (excerpt || '').split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

export default function Blog() {
  const [posts, setposts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`id, title, slug, excerpt, featured_image, published_at, views_count, tags, blog_categories (name, color)`)
      .eq('published', true)
      .order('published_at', { ascending: false });
    if (!error && data) setposts(data);
    setLoading(false);
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-12 w-48 bg-white/[0.03] rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-80 bg-white/[0.03] rounded-lg mx-auto animate-pulse" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="premium-card rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-white/[0.03]" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-white/[0.03] rounded w-3/4" />
                  <div className="h-4 bg-white/[0.03] rounded" />
                  <div className="h-4 bg-white/[0.03] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-24 px-4 overflow-hidden">
      <div className="absolute inset-0 aurora opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-dots opacity-[0.02] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="premium-badge mb-4"><BookOpen className="w-3 h-3" />BLOG</span>
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">
            <span className="gradient-text-premium">Learning Hub</span>
          </h1>
          <p className="text-muted-foreground/50 max-w-2xl mx-auto mb-4">
            Explore tutorials, insights, and deep dives into React, JavaScript, Full-Stack Development, and more.
          </p>
          <p className="text-sm text-muted-foreground/50">{posts.length} articles published</p>
        </motion.div>

        {/* Search */}
        <div className="mb-10 relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search posts by title, content, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/[0.02] border-white/[0.06] rounded-xl"
          />
        </div>

        {filteredPosts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground/50 text-lg mb-2">
              {searchTerm ? 'No posts found matching your search.' : 'No blog posts yet. Check back soon!'}
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Link to={`/blog/${post.slug}`} className="group block h-full">
                    <div className="premium-card rounded-2xl overflow-hidden h-full transition-all">
                      {post.featured_image ? (
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-primary/20" />
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          {post.blog_categories && (
                            <Badge className="text-[10px]" style={{ backgroundColor: post.blog_categories.color }}>
                              {post.blog_categories.name}
                            </Badge>
                          )}
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
                            <Clock className="w-3 h-3" />
                            {estimateReadTime(post.excerpt)}
                          </span>
                        </div>

                        <h2 className="text-lg font-bold font-display mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h2>

                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground/50 mb-4 line-clamp-2 leading-relaxed">
                            {post.excerpt}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground/50">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.views_count}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="px-2 py-0.5 rounded-md bg-white/[0.03] text-[10px] text-muted-foreground/50">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
