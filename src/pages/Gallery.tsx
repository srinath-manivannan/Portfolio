import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

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
  is_featured: boolean;
}

const categories = ['All', 'TV', 'Newspaper', 'Magazine', 'Award', 'College', 'School'];

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .order('order_index', { ascending: true })
      .order('date', { ascending: false });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter(item => item.category === selectedCategory);

  const featuredItems = items.filter(item => item.is_featured);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Achievement Gallery</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A visual showcase of achievements, recognitions, and memorable moments.
          </p>
        </motion.div>

        {featuredItems.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map((item) => (
                <GalleryCard key={item.id} item={item} onClick={setSelectedItem} featured />
              ))}
            </div>
          </div>
        )}

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No items in this category yet.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GalleryCard item={item} onClick={setSelectedItem} />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedItem && (
              <div>
                {selectedItem.image_url && (
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.title}
                    className="w-full rounded-lg mb-4"
                  />
                )}
                {selectedItem.video_url && (
                  <video
                    src={selectedItem.video_url}
                    controls
                    className="w-full rounded-lg mb-4"
                  />
                )}
                <div className="space-y-4">
                  <div>
                    <Badge className="mb-2">{selectedItem.category}</Badge>
                    <h2 className="text-2xl font-bold">{selectedItem.title}</h2>
                  </div>
                  {selectedItem.description && (
                    <p className="text-muted-foreground">{selectedItem.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {selectedItem.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedItem.date).toLocaleDateString()}
                      </div>
                    )}
                    {selectedItem.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {selectedItem.location}
                      </div>
                    )}
                    {selectedItem.source && (
                      <div>
                        <strong>Source:</strong> {selectedItem.source}
                      </div>
                    )}
                  </div>
                  {selectedItem.external_link && (
                    <Button asChild>
                      <a href={selectedItem.external_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Original
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

interface GalleryCardProps {
  item: GalleryItem;
  onClick: (item: GalleryItem) => void;
  featured?: boolean;
}

function GalleryCard({ item, onClick, featured }: GalleryCardProps) {
  return (
    <div
      onClick={() => onClick(item)}
      className={`group relative overflow-hidden rounded-lg cursor-pointer ${
        featured ? 'aspect-video' : 'aspect-square'
      }`}
    >
      {item.image_url && (
        <img
          src={item.image_url}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <Badge className="mb-2">{item.category}</Badge>
          <h3 className="font-semibold text-lg">{item.title}</h3>
          {item.date && (
            <p className="text-sm text-gray-300 mt-1">
              {new Date(item.date).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
