import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, ExternalLink, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface Certification {
  id: string;
  title: string;
  issuer: string;
  issue_date: string | null;
  credential_url: string | null;
  image: string | null;
  pdf_url: string | null;
  display_order: number | null;
}

export default function CertificationsAdmin() {
  const navigate = useNavigate();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issue_date: '',
    credential_url: '',
    image: [] as string[],
    pdf_url: [] as string[],
  });

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast.error('Failed to fetch certifications');
      return;
    }

    setCertifications(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const certData = {
      title: formData.title,
      issuer: formData.issuer,
      issue_date: formData.issue_date || null,
      credential_url: formData.credential_url || null,
      image: formData.image[0] || null,
      pdf_url: formData.pdf_url[0] || null,
    };

    if (editingCert) {
      const { error } = await supabase
        .from('certifications')
        .update(certData)
        .eq('id', editingCert.id);

      if (error) {
        toast.error('Failed to update certification');
        return;
      }
      toast.success('Certification updated successfully');
    } else {
      const { error } = await supabase
        .from('certifications')
        .insert([certData]);

      if (error) {
        toast.error('Failed to create certification');
        return;
      }
      toast.success('Certification created successfully');
    }

    setIsOpen(false);
    resetForm();
    fetchCertifications();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;

    const { error } = await supabase
      .from('certifications')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete certification');
      return;
    }

    toast.success('Certification deleted successfully');
    fetchCertifications();
  };

  const handleEdit = (cert: Certification) => {
    setEditingCert(cert);
    setFormData({
      title: cert.title,
      issuer: cert.issuer,
      issue_date: cert.issue_date || '',
      credential_url: cert.credential_url || '',
      image: cert.image ? [cert.image] : [],
      pdf_url: cert.pdf_url ? [cert.pdf_url] : [],
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setEditingCert(null);
    setFormData({
      title: '',
      issuer: '',
      issue_date: '',
      credential_url: '',
      image: [],
      pdf_url: [],
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
              <h1 className="text-4xl font-bold gradient-text mb-2">Certifications Management</h1>
              <p className="text-muted-foreground">Manage your professional certifications</p>
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
                  Add Certification
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCert ? 'Edit Certification' : 'Add New Certification'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Certification Title*</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., AWS Certified Solutions Architect"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Issuer*</Label>
                    <Input
                      value={formData.issuer}
                      onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                      placeholder="e.g., Amazon Web Services"
                      required
                    />
                  </div>

                  <div>
                    <Label>Issue Date</Label>
                    <Input
                      type="date"
                      value={formData.issue_date}
                      onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Credential URL (LinkedIn, Issuer's website, etc.)</Label>
                  <Input
                    value={formData.credential_url}
                    onChange={(e) => setFormData({ ...formData, credential_url: e.target.value })}
                    placeholder="https://www.linkedin.com/..."
                  />
                </div>

                <div>
                  <Label>Certificate Image</Label>
                  <FileUpload
                    bucket="certificate-images"
                    accept="image/*"
                    value={formData.image}
                    onChange={(urls) => setFormData({ ...formData, image: urls })}
                    label="Upload certificate image"
                  />
                </div>

                <div>
                  <Label>Certificate PDF</Label>
                  <FileUpload
                    bucket="certificate-images"
                    accept=".pdf"
                    value={formData.pdf_url}
                    onChange={(urls) => setFormData({ ...formData, pdf_url: urls })}
                    label="Upload certificate PDF"
                    maxSize={10}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCert ? 'Update' : 'Create'} Certification
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glassmorphic rounded-2xl p-6 hover-lift"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {cert.image ? (
                  <img src={cert.image} alt={cert.title} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                )}
              </div>

              <h3 className="text-lg font-bold mb-2">{cert.title}</h3>
              <p className="text-muted-foreground mb-2">{cert.issuer}</p>
              {cert.issue_date && (
                <p className="text-sm text-muted-foreground mb-4">
                  {new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              )}

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(cert)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(cert.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
                {cert.credential_url && (
                  <Button size="sm" variant="ghost" asChild>
                    <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
