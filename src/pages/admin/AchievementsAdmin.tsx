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

interface Achievement {
  id: string;
  title: string;
  description: string;
  institution: string | null;
  date: string;
  icon: string | null;
  image_url: string | null;
  display_order: number | null;
}

export default function AchievementsAdmin() {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    institution: '',
    date: '',
    icon: 'trophy',
    image_url: [] as string[],
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast.error('Failed to fetch achievements');
      return;
    }

    setAchievements(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const achievementData = {
      title: formData.title,
      description: formData.description,
      institution: formData.institution || null,
      date: formData.date,
      icon: formData.icon,
      image_url: formData.image_url[0] || null,
    };

    if (editingAchievement) {
      const { error } = await supabase
        .from('achievements')
        .update(achievementData)
        .eq('id', editingAchievement.id);

      if (error) {
        toast.error('Failed to update achievement');
        return;
      }
      toast.success('Achievement updated successfully');
    } else {
      const { error } = await supabase
        .from('achievements')
        .insert([achievementData]);

      if (error) {
        toast.error('Failed to create achievement');
        return;
      }
      toast.success('Achievement created successfully');
    }

    setIsOpen(false);
    resetForm();
    fetchAchievements();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;

    const { error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete achievement');
      return;
    }

    toast.success('Achievement deleted successfully');
    fetchAchievements();
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      title: achievement.title,
      description: achievement.description,
      institution: achievement.institution || '',
      date: achievement.date,
      icon: achievement.icon || 'trophy',
      image_url: achievement.image_url ? [achievement.image_url] : [],
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setEditingAchievement(null);
    setFormData({
      title: '',
      description: '',
      institution: '',
      date: '',
      icon: 'trophy',
      image_url: [],
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
              <h1 className="text-4xl font-bold gradient-text mb-2">Achievements Management</h1>
              <p className="text-muted-foreground">Manage your achievements and awards</p>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Achievement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Achievement Title*</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Best Outgoing Student"
                    required
                  />
                </div>

                <div>
                  <Label>Description*</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Brief description of the achievement"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Institution / Organization</Label>
                    <Input
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      placeholder="e.g., Mailam Engineering College"
                    />
                  </div>

                  <div>
                    <Label>Date Achieved*</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Icon</Label>
                  <Input
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="trophy, award, star, tv, etc."
                  />
                </div>

                <div>
                  <Label>Achievement Image/Certificate</Label>
                  <FileUpload
                    bucket="certificate-images"
                    accept="image/*"
                    value={formData.image_url}
                    onChange={(urls) => setFormData({ ...formData, image_url: urls })}
                    label="Upload achievement image or certificate"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingAchievement ? 'Update' : 'Create'} Achievement
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glassmorphic rounded-2xl p-6 hover-lift"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {achievement.image_url ? (
                    <img src={achievement.image_url} alt={achievement.title} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl">🏆</span>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                  {achievement.institution && (
                    <p className="text-sm text-primary mb-2">{achievement.institution}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(achievement.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(achievement)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(achievement.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
