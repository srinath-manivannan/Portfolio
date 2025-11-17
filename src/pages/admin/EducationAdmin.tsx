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

interface Education {
  id: string;
  degree: string;
  institution: string;
  university: string | null;
  duration: string;
  cgpa: string | null;
  grade: string | null;
  achievements: string[] | null;
  display_order: number | null;
}

export default function EducationAdmin() {
  const navigate = useNavigate();
  const [education, setEducation] = useState<Education[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [formData, setFormData] = useState({
    degree: '',
    institution: '',
    university: '',
    duration: '',
    cgpa: '',
    grade: '',
    achievements: '',
  });

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast.error('Failed to fetch education');
      return;
    }

    setEducation(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const eduData = {
      ...formData,
      achievements: formData.achievements.split('\n').map(s => s.trim()).filter(Boolean),
    };

    if (editingEdu) {
      const { error } = await supabase
        .from('education')
        .update(eduData)
        .eq('id', editingEdu.id);

      if (error) {
        toast.error('Failed to update education');
        return;
      }
      toast.success('Education updated successfully');
    } else {
      const { error } = await supabase
        .from('education')
        .insert([eduData]);

      if (error) {
        toast.error('Failed to create education');
        return;
      }
      toast.success('Education created successfully');
    }

    setIsOpen(false);
    resetForm();
    fetchEducation();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education entry?')) return;

    const { error } = await supabase
      .from('education')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete education');
      return;
    }

    toast.success('Education deleted successfully');
    fetchEducation();
  };

  const handleEdit = (edu: Education) => {
    setEditingEdu(edu);
    setFormData({
      degree: edu.degree,
      institution: edu.institution,
      university: edu.university || '',
      duration: edu.duration,
      cgpa: edu.cgpa || '',
      grade: edu.grade || '',
      achievements: edu.achievements?.join('\n') || '',
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setEditingEdu(null);
    setFormData({
      degree: '',
      institution: '',
      university: '',
      duration: '',
      cgpa: '',
      grade: '',
      achievements: '',
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
              <h1 className="text-4xl font-bold gradient-text mb-2">Education Management</h1>
              <p className="text-muted-foreground">Manage your educational background</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mb-8">
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Education
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEdu ? 'Edit Education' : 'Add New Education'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Degree*</Label>
                  <Input
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    placeholder="e.g., B.E. Electronics and Communication Engineering"
                    required
                  />
                </div>

                <div>
                  <Label>Institution*</Label>
                  <Input
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g., Mailam Engineering College"
                    required
                  />
                </div>

                <div>
                  <Label>University</Label>
                  <Input
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    placeholder="e.g., Anna University"
                  />
                </div>

                <div>
                  <Label>Duration*</Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 2019 - 2023"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>CGPA</Label>
                    <Input
                      value={formData.cgpa}
                      onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                      placeholder="e.g., 8.7"
                    />
                  </div>

                  <div>
                    <Label>Grade</Label>
                    <Input
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      placeholder="e.g., First Class with Distinction"
                    />
                  </div>
                </div>

                <div>
                  <Label>Achievements (one per line)</Label>
                  <Textarea
                    value={formData.achievements}
                    onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                    placeholder="Best Outgoing Student&#10;IoT Innovation Featured on TV&#10;Academic Excellence Award"
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingEdu ? 'Update' : 'Create'} Education
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          {education.map((edu, index) => (
            <motion.div
              key={edu.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glassmorphic rounded-2xl p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{edu.degree}</h3>
                  <p className="text-primary font-medium mb-1">{edu.institution}</p>
                  {edu.university && (
                    <p className="text-muted-foreground text-sm mb-2">{edu.university}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{edu.duration}</span>
                    {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
                    {edu.grade && <span className="text-primary">{edu.grade}</span>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(edu)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(edu.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {edu.achievements && edu.achievements.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Key Achievements:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {edu.achievements.map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
