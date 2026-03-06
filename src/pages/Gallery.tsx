import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, MapPin, Image as ImageIcon, Award, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .order('order_index', { ascending: true })
      .order('date', { ascending: false });
    if (!error && data) setItems(data);
    setLoading(false);
  };

  const filteredItems = selectedCategory === 'All' ? items : items.filter(item => item.category === selectedCategory);
  const featuredItems = items.filter(item => item.is_featured);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-12 w-64 bg-white/[0.03] rounded-lg mx-auto mb-4 animate-pulse" />
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-white/[0.03] rounded-xl animate-pulse" />
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
          <span className="premium-badge mb-4"><ImageIcon className="w-3 h-3" />GALLERY</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display tracking-tight gradient-text-premium">
            Achievement Gallery
          </h1>
          <p className="text-muted-foreground/70 max-w-2xl mx-auto mb-4">
            A visual showcase of achievements, recognitions, and memorable moments.
          </p>
          <p className="text-sm text-muted-foreground/70">{items.length} moments captured</p>
        </motion.div>

        {/* Featured */}
        {featuredItems.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold font-display gradient-text-premium">Featured</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GalleryCard item={item} onClick={setSelectedItem} featured />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Category tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="bg-white/[0.02] border border-white/[0.06] w-full justify-start overflow-x-auto flex-wrap h-auto">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs">
                {category}
                {category !== 'All' && (
                  <span className="ml-1 opacity-50 text-[10px]">
                    {items.filter(i => i.category === category).length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-8">
            {filteredItems.length === 0 ? (
              <div className="text-center py-20">
                <ImageIcon className="w-12 h-12 text-muted-foreground/60 mx-auto mb-4" />
                <p className="text-muted-foreground/70 text-lg">No items in this category yet.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <AnimatePresence>
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.03 }}
                      layout
                    >
                      <GalleryCard item={item} onClick={setSelectedItem} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Lightbox */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar" style={{ background: 'hsl(228 60% 6% / 0.95)', backdropFilter: 'blur(32px)' }}>
            {selectedItem && (
              <div>
                {selectedItem.image_url && (
                  <img src={selectedItem.image_url} alt={selectedItem.title} className="w-full rounded-lg mb-6" />
                )}
                {selectedItem.video_url && (
                  <video src={selectedItem.video_url} controls className="w-full rounded-lg mb-6" />
                )}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/20 text-primary border-primary/30">{selectedItem.category}</Badge>
                    {selectedItem.is_featured && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="w-3 h-3" /> Featured
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold font-display">{selectedItem.title}</h2>
                  {selectedItem.description && (
                    <p className="text-muted-foreground/70 leading-relaxed">{selectedItem.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground/70">
                    {selectedItem.date && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedItem.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                    {selectedItem.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {selectedItem.location}
                      </span>
                    )}
                    {selectedItem.source && (
                      <span><strong>Source:</strong> {selectedItem.source}</span>
                    )}
                  </div>
                  {selectedItem.external_link && (
                    <Button asChild className="gradient-primary text-white">
                      <a href={selectedItem.external_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" /> View Original
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

function GalleryCard({ item, onClick, featured }: { item: GalleryItem; onClick: (item: GalleryItem) => void; featured?: boolean }) {
  return (
    <div
      onClick={() => onClick(item)}
      className={`group relative overflow-hidden rounded-xl cursor-pointer bg-white/[0.02] border border-white/[0.06] ${featured ? 'aspect-video' : 'aspect-square'}`}
    >
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
          <Award className="w-12 h-12 text-primary/20" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <Badge className="mb-2 text-[10px] bg-white/20 border-white/20">{item.category}</Badge>
          <h3 className="font-bold text-sm line-clamp-2">{item.title}</h3>
          {item.date && (
            <p className="text-xs text-gray-300 mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      {item.is_featured && (
        <div className="absolute top-2 right-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        </div>
      )}
    </div>
  );
}
