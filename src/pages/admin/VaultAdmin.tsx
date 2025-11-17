import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Edit, Trash2, FileText } from 'lucide-react';
import { FileUpload } from '@/components/admin/FileUpload';
import { z } from 'zod';

const documentSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  file_url: z.string().url("Invalid file URL"),
  document_number: z.string().trim().max(100, "Document number must be less than 100 characters"),
  issuing_authority: z.string().trim().max(200, "Issuing authority must be less than 200 characters"),
  tags: z.string().max(500, "Tags must be less than 500 characters"),
});

interface Document {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
  category: string;
  document_number: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  issuing_authority: string | null;
  tags: string[];
}

const categories = ['Education', 'Professional', 'ID_Proof', 'Financial', 'Work', 'Personal'];

export default function VaultAdmin() {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    file_url: '',
    category: 'Personal',
    document_number: '',
    issue_date: '',
    expiry_date: '',
    issuing_authority: '',
    tags: '',
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDocuments(data);
    }
  };

  const handleSubmit = async () => {
    try {
      documentSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

    const payload = {
      user_id: user!.id,
      title: formData.title,
      file_url: formData.file_url,
      file_type: formData.file_url.split('.').pop() || 'pdf',
      category: formData.category,
      document_number: formData.document_number || null,
      issue_date: formData.issue_date || null,
      expiry_date: formData.expiry_date || null,
      issuing_authority: formData.issuing_authority || null,
      tags: tagsArray,
    };

    if (editingDoc) {
      const { error } = await supabase
        .from('documents')
        .update(payload)
        .eq('id', editingDoc.id);

      if (error) {
        toast.error('Failed to update document');
        return;
      }
      toast.success('Document updated successfully');
    } else {
      const { error } = await supabase.from('documents').insert(payload);

      if (error) {
        toast.error('Failed to add document');
        return;
      }
      toast.success('Document added successfully');
    }

    resetForm();
    fetchDocuments();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    const { error } = await supabase.from('documents').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete document');
      return;
    }
    toast.success('Document deleted successfully');
    fetchDocuments();
  };

  const handleEdit = (doc: Document) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      file_url: doc.file_url,
      category: doc.category,
      document_number: doc.document_number || '',
      issue_date: doc.issue_date || '',
      expiry_date: doc.expiry_date || '',
      issuing_authority: doc.issuing_authority || '',
      tags: doc.tags.join(', '),
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      file_url: '',
      category: 'Personal',
      document_number: '',
      issue_date: '',
      expiry_date: '',
      issuing_authority: '',
      tags: '',
    });
    setEditingDoc(null);
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
            <h1 className="text-3xl font-bold">Document Vault</h1>
            <p className="text-muted-foreground mt-1">Manage your documents securely</p>
          </div>
          <Button onClick={() => setShowDialog(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Document
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <FileText className="h-8 w-8 text-primary" />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(doc)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(doc.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <h3 className="font-semibold mb-1 line-clamp-2">{doc.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{doc.category.replace('_', ' ')}</p>
            {doc.expiry_date && (
              <p className="text-xs text-muted-foreground">
                Expires: {new Date(doc.expiry_date).toLocaleDateString()}
              </p>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDoc ? 'Edit Document' : 'Add Document'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Document title"
              />
            </div>

            <div>
              <Label>File * (PDF, Images)</Label>
              <FileUpload
                bucket="documents"
                onChange={(urls) => setFormData({ ...formData, file_url: urls[0] || '' })}
                value={formData.file_url ? [formData.file_url] : []}
                accept=".pdf,.jpg,.jpeg,.png"
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
                      {cat.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issue-date">Issue Date</Label>
                <Input
                  id="issue-date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expiry-date">Expiry Date</Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="doc-number">Document Number</Label>
              <Input
                id="doc-number"
                value={formData.document_number}
                onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                placeholder="e.g., Passport number, Certificate number"
              />
            </div>

            <div>
              <Label htmlFor="authority">Issuing Authority</Label>
              <Input
                id="authority"
                value={formData.issuing_authority}
                onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })}
                placeholder="e.g., Government of India, University"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="important, id, education"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="flex-1">
                {editingDoc ? 'Update Document' : 'Add Document'}
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
