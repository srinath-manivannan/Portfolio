import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Eye, ArrowLeft, Share2, Clock, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  featured_image: string | null;
  published_at: string;
  views_count: number;
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  blog_categories: {
    name: string;
    color: string;
  } | null;
}

function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  const handleScroll = useCallback(() => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    setProgress(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);
  }, []);
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  return progress;
}

function estimateReadTime(content: string): number {
  return Math.max(1, Math.ceil((content || '').split(/\s+/).length / 200));
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const readingProgress = useReadingProgress();

  useEffect(() => {
    if (slug) {
      fetchPost();
      incrementViewCount();
    }
  }, [slug]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        id,
        title,
        content,
        featured_image,
        published_at,
        views_count,
        tags,
        seo_title,
        seo_description,
        blog_categories (name, color)
      `)
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (!error && data) {
      setPost(data);
      if (data.seo_title) document.title = data.seo_title;
    } else {
      toast.error('Post not found');
    }
    setLoading(false);
  };

  const incrementViewCount = async () => {
    if (slug) {
      const { error } = await supabase
        .from('blog_posts')
        .update({ views_count: (post?.views_count || 0) + 1 })
        .eq('slug', slug);
      if (error) console.error('Error incrementing views:', error);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold">Post not found</h1>
        <Link to="/blog">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  const readTime = estimateReadTime(post.content);

  return (
    <div className="relative min-h-screen pt-24 pb-24 px-4 overflow-hidden">
      {/* Reading progress bar */}
      <motion.div
        className="fixed top-16 left-0 right-0 z-40 h-[2px]"
        style={{
          width: `${readingProgress}%`,
          background: 'linear-gradient(90deg, hsl(220 90% 56%), hsl(262 83% 58%), hsl(45 93% 58%))',
          opacity: readingProgress > 0 ? 0.8 : 0,
          transition: 'opacity 0.3s',
        }}
      />

      <div className="absolute inset-0 aurora opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-dots opacity-[0.02] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative">
        <Link to="/blog" className="inline-flex items-center text-sm text-muted-foreground/50 hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all posts
        </Link>

        {post.featured_image && (
          <div className="aspect-video w-full rounded-2xl overflow-hidden mb-8">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            {post.blog_categories && (
              <Badge style={{ backgroundColor: post.blog_categories.color }}>
                {post.blog_categories.name}
              </Badge>
            )}
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground/40">
              <Clock className="w-3 h-3" />
              {readTime} min read
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground/50">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.views_count} views
            </div>
            <Button variant="ghost" size="sm" onClick={handleShare} className="text-muted-foreground/50">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="premium-card rounded-2xl p-6 md:p-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              code: ({ className, children }) => {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');
                
                if (match) {
                  return (
                    <SyntaxHighlighter
                      PreTag="div"
                      language={match[1]}
                      style={vscDarkPlus}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  );
                }
                return (
                  <code className={className}>
                    {children}
                  </code>
                );
              },
            } as Components}
          >
            {post.content}
          </ReactMarkdown>
          </div>

          {post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-white/[0.04]">
              <h3 className="text-sm font-semibold font-display mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-lg bg-white/[0.03] text-muted-foreground/60 text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
