import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { FileUpload } from '@/components/admin/FileUpload';
import { useAuthStore } from '@/lib/store';
import { z } from 'zod';

const blogPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  slug: z.string().trim().min(1, "Slug is required").max(200, "Slug must be less than 200 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  excerpt: z.string().trim().max(500, "Excerpt must be less than 500 characters"),
  content: z.string().trim().min(1, "Content is required").max(50000, "Content must be less than 50000 characters"),
  featured_image: z.string().url("Invalid image URL").optional().or(z.literal('')),
  tags: z.string().max(500, "Tags must be less than 500 characters"),
  seo_title: z.string().trim().max(200, "SEO title must be less than 200 characters"),
  seo_description: z.string().trim().max(500, "SEO description must be less than 500 characters"),
});

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  category_id: string | null;
  tags: string[];
  published: boolean;
  published_at: string | null;
  views_count: number;
  seo_title: string | null;
  seo_description: string | null;
  blog_categories: { name: string; color: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export default function BlogAdmin() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category_id: '',
    tags: '',
    published: false,
    seo_title: '',
    seo_description: '',
  });

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories (name, color)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name');

    if (!error && data) {
      setCategories(data);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async () => {
    try {
      blogPostSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    const slug = formData.slug || generateSlug(formData.title);
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

    const payload = {
      title: formData.title,
      slug,
      excerpt: formData.excerpt || null,
      content: formData.content,
      featured_image: formData.featured_image || null,
      category_id: formData.category_id || null,
      tags: tagsArray,
      published: formData.published,
      published_at: formData.published ? new Date().toISOString() : null,
      seo_title: formData.seo_title || null,
      seo_description: formData.seo_description || null,
      author_id: user!.id,
    };

    if (editingPost) {
      const { error } = await supabase
        .from('blog_posts')
        .update(payload)
        .eq('id', editingPost.id);

      if (error) {
        toast.error('Failed to update post');
        return;
      }
      toast.success('Post updated successfully');
    } else {
      const { error } = await supabase.from('blog_posts').insert(payload);

      if (error) {
        toast.error('Failed to create post');
        return;
      }
      toast.success('Post created successfully');
    }

    resetForm();
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    const { error } = await supabase.from('blog_posts').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete post');
      return;
    }
    toast.success('Post deleted successfully');
    fetchPosts();
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      featured_image: post.featured_image || '',
      category_id: post.category_id || '',
      tags: post.tags.join(', '),
      published: post.published,
      seo_title: post.seo_title || '',
      seo_description: post.seo_description || '',
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image: '',
      category_id: '',
      tags: '',
      published: false,
      seo_title: '',
      seo_description: '',
    });
    setEditingPost(null);
    setShowDialog(false);
  };

  return (
    <div className="container mx-auto p-6 pt-24">
      <div className="mb-6">
        <Link 
          to="/admin/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Blog Management</h1>
            <p className="text-muted-foreground">Create and manage blog posts</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">{post.title}</h3>
                  {post.published ? (
                    <Badge>Published</Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                  {post.blog_categories && (
                    <Badge style={{ backgroundColor: post.blog_categories.color }}>
                      {post.blog_categories.name}
                    </Badge>
                  )}
                </div>
                {post.excerpt && (
                  <p className="text-muted-foreground mb-2">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.views_count} views
                  </span>
                  {post.tags.length > 0 && (
                    <span>Tags: {post.tags.join(', ')}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Post title"
              />
            </div>
            
            <div>
              <Label htmlFor="slug">URL Slug (auto-generated if empty)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="post-url-slug"
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Short description of the post"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="content">Content * (Markdown supported)</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your post content in Markdown..."
                rows={12}
                className="font-mono"
              />
            </div>

            <div>
              <Label>Featured Image</Label>
              <FileUpload
                bucket="blog-images"
                onChange={(urls) => setFormData({ ...formData, featured_image: urls[0] || '' })}
                value={formData.featured_image ? [formData.featured_image] : []}
                accept="image/*"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="react, javascript, tutorial"
              />
            </div>

            <div>
              <Label htmlFor="seo-title">SEO Title</Label>
              <Input
                id="seo-title"
                value={formData.seo_title}
                onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                placeholder="SEO optimized title"
              />
            </div>

            <div>
              <Label htmlFor="seo-description">SEO Description</Label>
              <Textarea
                id="seo-description"
                value={formData.seo_description}
                onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                placeholder="SEO meta description"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
              />
              <Label htmlFor="published">Publish this post</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="flex-1">
                {editingPost ? 'Update Post' : 'Create Post'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
