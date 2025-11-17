import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Edit, Trash2, Star } from 'lucide-react';
import { FileUpload } from '@/components/admin/FileUpload';
import { motion } from 'framer-motion';
import { z } from 'zod';

const galleryItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().trim().max(1000, "Description must be less than 1000 characters"),
  image_url: z.string().url("Invalid image URL").optional().or(z.literal('')),
  video_url: z.string().url("Invalid video URL").optional().or(z.literal('')),
  location: z.string().trim().max(200, "Location must be less than 200 characters"),
  source: z.string().trim().max(200, "Source must be less than 200 characters"),
  external_link: z.string().url("Invalid external link URL").optional().or(z.literal('')),
}).refine(data => data.image_url || data.video_url, {
  message: "Either image or video is required",
});

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  category: string;
  date: string | null;
  location: string | null;
  source: string | null;
  external_link: string | null;
  order_index: number;
  is_featured: boolean;
}

const categories = ['TV', 'Newspaper', 'Magazine', 'Award', 'College', 'School'];

export default function GalleryAdmin() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    video_url: '',
    category: 'Award',
    date: '',
    location: '',
    source: '',
    external_link: '',
    order_index: 0,
    is_featured: false,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .order('order_index')
      .order('date', { ascending: false });

    if (!error && data) {
      setItems(data);
    }
  };

  const handleSubmit = async () => {
    try {
      galleryItemSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    const payload = {
      ...formData,
      description: formData.description || null,
      date: formData.date || null,
      location: formData.location || null,
      source: formData.source || null,
      external_link: formData.external_link || null,
    };

    if (editingItem) {
      const { error } = await supabase
        .from('gallery_items')
        .update(payload)
        .eq('id', editingItem.id);

      if (error) {
        toast.error('Failed to update item');
        return;
      }
      toast.success('Item updated successfully');
    } else {
      const { error } = await supabase.from('gallery_items').insert(payload);

      if (error) {
        toast.error('Failed to create item');
        return;
      }
      toast.success('Item created successfully');
    }

    resetForm();
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const { error } = await supabase.from('gallery_items').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete item');
      return;
    }
    toast.success('Item deleted successfully');
    fetchItems();
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      image_url: item.image_url || '',
      video_url: item.video_url || '',
      category: item.category,
      date: item.date || '',
      location: item.location || '',
      source: item.source || '',
      external_link: item.external_link || '',
      order_index: item.order_index,
      is_featured: item.is_featured,
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      video_url: '',
      category: 'Award',
      date: '',
      location: '',
      source: '',
      external_link: '',
      order_index: 0,
      is_featured: false,
    });
    setEditingItem(null);
    setShowDialog(false);
  };

  return (
    <div className="container mx-auto p-6 pt-24">
      <div className="mb-8">
        <Link 
          to="/admin/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gallery Management</h1>
            <p className="text-muted-foreground mt-1">Manage your achievement gallery</p>
          </div>
          <Button onClick={() => setShowDialog(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="overflow-hidden group">
              {item.image_url && (
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  {item.is_featured && (
                    <div className="absolute top-2 right-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    </div>
                  )}
                </div>
              )}
              <div className="p-3">
                <h3 className="font-semibold line-clamp-1 mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)} className="flex-1">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)} className="flex-1">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Gallery Item' : 'Add Gallery Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Achievement title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this achievement"
                rows={3}
              />
            </div>

            <div>
              <Label>Image *</Label>
              <FileUpload
                bucket="gallery-media"
                onChange={(urls) => setFormData({ ...formData, image_url: urls[0] || '' })}
                value={formData.image_url ? [formData.image_url] : []}
                accept="image/*"
              />
            </div>

            <div>
              <Label>Video (optional)</Label>
              <FileUpload
                bucket="gallery-media"
                onChange={(urls) => setFormData({ ...formData, video_url: urls[0] || '' })}
                value={formData.video_url ? [formData.video_url] : []}
                accept="video/*"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Event location"
              />
            </div>

            <div>
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="Source (e.g., Times of India, Star TV)"
              />
            </div>

            <div>
              <Label htmlFor="link">External Link</Label>
              <Input
                id="link"
                value={formData.external_link}
                onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
              <Label htmlFor="featured">Featured item</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="flex-1">
                {editingItem ? 'Update Item' : 'Add Item'}
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
