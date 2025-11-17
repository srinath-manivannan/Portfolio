import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, ExternalLink, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileUpload } from '@/components/admin/FileUpload';

interface Project {
  id: string;
  title: string;
  description: string;
  short_description: string | null;
  category: string;
  tech_stack: string[] | null;
  github_url: string | null;
  live_url: string | null;
  video_url: string | null;
  images: string[] | null;
  certificate_urls: string[] | null;
  featured: boolean | null;
  display_order: number | null;
}

export default function AdminProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    category: 'MERN',
    tech_stack: '',
    github_url: '',
    live_url: '',
    video_url: '',
    images: [] as string[],
    certificate_urls: [] as string[],
    featured: false,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast.error('Failed to fetch projects');
      return;
    }

    setProjects(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    const projectData = {
      ...formData,
      tech_stack: formData.tech_stack.split(',').map(s => s.trim()).filter(Boolean),
    };

    try {
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);

        if (error) {
          console.error('Project update error:', error);
          toast.error(`Failed to update project: ${error.message}`);
          return;
        }
        toast.success('Project updated successfully');
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);

        if (error) {
          console.error('Project creation error:', error);
          toast.error(`Failed to create project: ${error.message}`);
          return;
        }
        toast.success('Project created successfully');
      }

      setIsOpen(false);
      resetForm();
      fetchProjects();
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete project');
      return;
    }

    toast.success('Project deleted successfully');
    fetchProjects();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      short_description: project.short_description || '',
      category: project.category,
      tech_stack: project.tech_stack?.join(', ') || '',
      github_url: project.github_url || '',
      live_url: project.live_url || '',
      video_url: project.video_url || '',
      images: project.images || [],
      certificate_urls: project.certificate_urls || [],
      featured: project.featured || false,
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      short_description: '',
      category: 'MERN',
      tech_stack: '',
      github_url: '',
      live_url: '',
      video_url: '',
      images: [],
      certificate_urls: [],
      featured: false,
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Button variant="outline" size="sm" className="mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Projects Management</h1>
              <p className="text-muted-foreground">Manage your portfolio projects</p>
            </div>

            <Dialog open={isOpen} onOpenChange={(open) => {
              setIsOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? 'Edit Project' : 'Add New Project'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Title*</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Short Description*</Label>
                  <Input
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    placeholder="Brief one-line description"
                    required
                  />
                </div>

                <div>
                  <Label>Full Description*</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category*</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MERN">MERN</SelectItem>
                        <SelectItem value="Full-Stack">Full-Stack</SelectItem>
                        <SelectItem value="Frontend">Frontend</SelectItem>
                        <SelectItem value="n8n">n8n</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tech Stack (comma separated)</Label>
                    <Input
                      value={formData.tech_stack}
                      onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>GitHub URL</Label>
                    <Input
                      value={formData.github_url}
                      onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                      placeholder="https://github.com/..."
                    />
                  </div>

                  <div>
                    <Label>Live Demo URL</Label>
                    <Input
                      value={formData.live_url}
                      onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <Label>Video Demo URL</Label>
                  <Input
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://youtube.com/... or video URL"
                  />
                </div>

                <div>
                  <Label>Project Images</Label>
                  <FileUpload
                    bucket="project-images"
                    accept="image/*"
                    multiple
                    value={formData.images}
                    onChange={(urls) => setFormData({ ...formData, images: urls })}
                    label="Upload project screenshots"
                  />
                </div>

                <div>
                  <Label>Certificates / Documents</Label>
                  <FileUpload
                    bucket="project-certificates"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    value={formData.certificate_urls}
                    onChange={(urls) => setFormData({ ...formData, certificate_urls: urls })}
                    label="Upload certificates or related documents"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="featured">Featured Project</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProject ? 'Update' : 'Create'} Project
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glassmorphic rounded-2xl overflow-hidden hover-lift"
            >
              <div className="aspect-video bg-muted flex items-center justify-center text-4xl font-bold text-primary/20">
                {project.images && project.images[0] ? (
                  <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  project.title.charAt(0)
                )}
              </div>

              <div className="p-6">
                {project.featured && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold bg-primary/10 text-primary rounded mb-2">
                    Featured
                  </span>
                )}
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.short_description || project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech_stack?.slice(0, 3).map((tech, i) => (
                    <span key={i} className="px-2 py-1 text-xs bg-accent rounded">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(project)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(project.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  {project.live_url && (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
