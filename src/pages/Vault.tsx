import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, AlertCircle, Folder } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Document {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  category: string;
  document_number: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  issuing_authority: string | null;
  tags: string[];
  created_at: string;
}

const categories = [
  { value: 'All', label: 'All Documents', icon: Folder },
  { value: 'Education', label: 'Education', icon: FileText },
  { value: 'Professional', label: 'Professional', icon: FileText },
  { value: 'ID_Proof', label: 'ID Proof', icon: FileText },
  { value: 'Financial', label: 'Financial', icon: FileText },
  { value: 'Work', label: 'Work', icon: FileText },
  { value: 'Personal', label: 'Personal', icon: FileText },
];

export default function Vault() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to access the vault');
      navigate('/admin/login');
      return;
    }
    fetchDocuments();
  }, [user, navigate]);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDocuments(data);
      checkExpiringDocuments(data);
    }
    setLoading(false);
  };

  const checkExpiringDocuments = (docs: Document[]) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    docs.forEach(doc => {
      if (doc.expiry_date) {
        const expiryDate = new Date(doc.expiry_date);
        if (expiryDate < now) {
          toast.error(`${doc.title} has expired!`);
        } else if (expiryDate < thirtyDaysFromNow) {
          toast.warning(`${doc.title} expires soon!`);
        }
      }
    });
  };

  const handleDownload = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_url);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await supabase.from('document_access_logs').insert({
        document_id: doc.id,
        accessed_by: user?.id,
      });

      toast.success('Document downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const filteredDocuments = selectedCategory === 'All'
    ? documents
    : documents.filter(doc => doc.category === selectedCategory);

  const isExpiring = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry < thirtyDaysFromNow;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary"></div>
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
          className="mb-12"
        >
          <span className="premium-badge mb-4"><FileText className="w-3 h-3" />DOCUMENT VAULT</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display tracking-tight gradient-text-premium">Document Vault</h1>
          <p className="text-muted-foreground">
            Securely store and manage all your important documents in one place.
          </p>
        </motion.div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="surface-subtle border border-subtle rounded-xl w-full justify-start overflow-x-auto flex-wrap h-auto mb-6">
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value} className="gap-2">
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory}>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground/80 mb-4" />
                <p className="text-muted-foreground text-lg">No documents in this category yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="premium-card p-4 cursor-pointer"
                          onClick={() => setSelectedDoc(doc)}>
                      <div className="flex items-start justify-between mb-3">
                        <FileText className="h-8 w-8 text-primary" />
                        {doc.expiry_date && isExpiring(doc.expiry_date) && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Expiring Soon
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold mb-2 line-clamp-2">{doc.title}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {doc.issue_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Issued: {new Date(doc.issue_date).toLocaleDateString()}
                          </div>
                        )}
                        {doc.expiry_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Expires: {new Date(doc.expiry_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {doc.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
          <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-xl">
            {selectedDoc && (
              <div>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display">{selectedDoc.title}</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{selectedDoc.category.replace('_', ' ')}</p>
                    </div>
                    {selectedDoc.document_number && (
                      <div>
                        <p className="text-sm text-muted-foreground">Document Number</p>
                        <p className="font-medium">{selectedDoc.document_number}</p>
                      </div>
                    )}
                    {selectedDoc.issue_date && (
                      <div>
                        <p className="text-sm text-muted-foreground">Issue Date</p>
                        <p className="font-medium">
                          {new Date(selectedDoc.issue_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedDoc.expiry_date && (
                      <div>
                        <p className="text-sm text-muted-foreground">Expiry Date</p>
                        <p className="font-medium">
                          {new Date(selectedDoc.expiry_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedDoc.issuing_authority && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Issuing Authority</p>
                        <p className="font-medium">{selectedDoc.issuing_authority}</p>
                      </div>
                    )}
                  </div>
                  {selectedDoc.tags.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedDoc.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button onClick={() => handleDownload(selectedDoc)} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Document
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
