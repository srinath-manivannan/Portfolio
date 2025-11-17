import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileUpload } from '@/components/admin/FileUpload';
import { z } from 'zod';

const experienceSchema = z.object({
  company: z.string().trim().min(1, "Company name is required").max(200, "Company name must be less than 200 characters"),
  role: z.string().trim().min(1, "Role is required").max(200, "Role must be less than 200 characters"),
  duration: z.string().trim().min(1, "Duration is required").max(100, "Duration must be less than 100 characters"),
  location: z.string().trim().max(200, "Location must be less than 200 characters"),
  description: z.string().max(5000, "Description must be less than 5000 characters"),
  technologies: z.string().max(1000, "Technologies must be less than 1000 characters"),
});

interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  location: string | null;
  work_type: string | null;
  description: string[] | null;
  technologies: string[] | null;
  company_logo: string | null;
  certificate_urls: string[] | null;
  appreciation_urls: string[] | null;
  display_order: number | null;
}

export default function ExperienceAdmin() {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    duration: '',
    location: '',
    work_type: 'Remote',
    description: '',
    technologies: '',
    company_logo: [] as string[],
    certificate_urls: [] as string[],
    appreciation_urls: [] as string[],
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast.error('Failed to fetch experiences');
      return;
    }

    setExperiences(data || []);
  };

  const experienceSchema = z.object({
    company: z.string().trim().min(1, 'Company is required').max(200, 'Company must be less than 200 characters'),
    role: z.string().trim().min(1, 'Role is required').max(200, 'Role must be less than 200 characters'),
    duration: z.string().trim().min(1, 'Duration is required').max(100, 'Duration must be less than 100 characters'),
    location: z.string().max(200, 'Location must be less than 200 characters').optional(),
    work_type: z.string().max(50, 'Work type must be less than 50 characters').optional(),
    description: z.string().max(5000, 'Description must be less than 5000 characters').optional(),
    technologies: z.string().max(1000, 'Technologies must be less than 1000 characters').optional(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      experienceSchema.parse({
        company: formData.company,
        role: formData.role,
        duration: formData.duration,
        location: formData.location || undefined,
        work_type: formData.work_type || undefined,
        description: formData.description || undefined,
        technologies: formData.technologies || undefined,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
      toast.error('Invalid input data');
      return;
    }

    try {
      experienceSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    const expData = {
      ...formData,
      description: formData.description.split('\n').filter(Boolean),
      technologies: formData.technologies.split(',').map(s => s.trim()).filter(Boolean),
      company_logo: formData.company_logo[0] || null,
    };

    if (editingExp) {
      const { error } = await supabase
        .from('experiences')
        .update(expData)
        .eq('id', editingExp.id);

      if (error) {
        toast.error('Failed to update experience');
        return;
      }
      toast.success('Experience updated successfully');
    } else {
      const { error } = await supabase
        .from('experiences')
        .insert([expData]);

      if (error) {
        toast.error('Failed to create experience');
        return;
      }
      toast.success('Experience created successfully');
    }

    setIsOpen(false);
    resetForm();
    fetchExperiences();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;

    const { error } = await supabase
      .from('experiences')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete experience');
      return;
    }

    toast.success('Experience deleted successfully');
    fetchExperiences();
  };

  const handleEdit = (exp: Experience) => {
    setEditingExp(exp);
    setFormData({
      company: exp.company,
      role: exp.role,
      duration: exp.duration,
      location: exp.location || '',
      work_type: exp.work_type || 'Remote',
      description: exp.description?.join('\n') || '',
      technologies: exp.technologies?.join(', ') || '',
      company_logo: exp.company_logo ? [exp.company_logo] : [],
      certificate_urls: exp.certificate_urls || [],
      appreciation_urls: exp.appreciation_urls || [],
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setEditingExp(null);
    setFormData({
      company: '',
      role: '',
      duration: '',
      location: '',
      work_type: 'Remote',
      description: '',
      technologies: '',
      company_logo: [],
      certificate_urls: [],
      appreciation_urls: [],
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <Button variant="outline" size="sm" className="mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Experience Management</h1>
              <p className="text-muted-foreground">Manage your work experience</p>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Experience
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingExp ? 'Edit Experience' : 'Add New Experience'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Company Name*</Label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label>Role / Position*</Label>
                    <Input
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Duration*</Label>
                    <Input
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="Jan 2023 - Present"
                      required
                    />
                  </div>

                  <div>
                    <Label>Location</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="New York, USA"
                    />
                  </div>

                  <div>
                    <Label>Work Type</Label>
                    <Input
                      value={formData.work_type}
                      onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                      placeholder="Remote / Hybrid / Onsite"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description (one point per line)*</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    placeholder="Built live task management system&#10;Reduced CPU/GPU usage by 85%&#10;Implemented role-based access control"
                    required
                  />
                </div>

                <div>
                  <Label>Technologies (comma separated)</Label>
                  <Input
                    value={formData.technologies}
                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                    placeholder="React, Node.js, MongoDB, AWS"
                  />
                </div>

                <div>
                  <Label>Company Logo</Label>
                  <FileUpload
                    bucket="profile-images"
                    accept="image/*"
                    value={formData.company_logo}
                    onChange={(urls) => setFormData({ ...formData, company_logo: urls })}
                    label="Upload company logo"
                  />
                </div>

                <div>
                  <Label>Experience Certificates</Label>
                  <FileUpload
                    bucket="experience-certificates"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    value={formData.certificate_urls}
                    onChange={(urls) => setFormData({ ...formData, certificate_urls: urls })}
                    label="Upload experience/completion certificates"
                  />
                </div>

                <div>
                  <Label>Appreciation Letters / Awards</Label>
                  <FileUpload
                    bucket="experience-certificates"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    value={formData.appreciation_urls}
                    onChange={(urls) => setFormData({ ...formData, appreciation_urls: urls })}
                    label="Upload appreciation letters or awards"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingExp ? 'Update' : 'Create'} Experience
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glassmorphic rounded-2xl p-6 hover-lift"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {exp.company_logo ? (
                      <img src={exp.company_logo} alt={exp.company} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold">{exp.company.charAt(0)}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">{exp.role}</h3>
                    <p className="text-lg text-primary mb-2">{exp.company}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <span>{exp.duration}</span>
                      {exp.location && <span>• {exp.location}</span>}
                      {exp.work_type && <span>• {exp.work_type}</span>}
                    </div>

                    {exp.description && exp.description.length > 0 && (
                      <ul className="list-disc list-inside space-y-2 mb-4">
                        {exp.description.map((desc, i) => (
                          <li key={i} className="text-sm">{desc}</li>
                        ))}
                      </ul>
                    )}

                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech, i) => (
                          <span key={i} className="px-3 py-1 text-xs bg-accent rounded-full">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(exp)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(exp.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
