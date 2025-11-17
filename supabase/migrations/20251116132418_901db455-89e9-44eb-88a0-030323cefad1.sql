-- Blog Posts Tables
CREATE TABLE public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  featured_image text,
  category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  author_id uuid NOT NULL,
  published boolean DEFAULT false,
  published_at timestamptz,
  views_count integer DEFAULT 0,
  seo_title text,
  seo_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Achievement Gallery
CREATE TABLE public.gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  video_url text,
  category text NOT NULL CHECK (category IN ('TV', 'Newspaper', 'Magazine', 'Award', 'College', 'School')),
  date date,
  location text,
  source text,
  external_link text,
  order_index integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Document Vault
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size bigint,
  category text NOT NULL CHECK (category IN ('Education', 'Professional', 'ID_Proof', 'Financial', 'Work', 'Personal')),
  document_number text,
  issue_date date,
  expiry_date date,
  issuing_authority text,
  tags text[] DEFAULT '{}',
  is_encrypted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Resume Templates
CREATE TABLE public.resume_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  thumbnail_url text,
  html_template text NOT NULL,
  category text NOT NULL CHECK (category IN ('minimal', 'modern', 'traditional', 'ats', 'creative')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Resume Versions
CREATE TABLE public.resume_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  template_id uuid REFERENCES public.resume_templates(id) ON DELETE SET NULL,
  generated_data jsonb NOT NULL,
  pdf_url text,
  version_number integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Analytics Events
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  page_url text,
  user_ip text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Document Access Logs
CREATE TABLE public.document_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  accessed_by uuid,
  accessed_at timestamptz DEFAULT now(),
  ip_address text
);

-- Enable RLS on all tables
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Blog Categories
CREATE POLICY "Anyone can view blog categories"
  ON public.blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage blog categories"
  ON public.blog_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for Blog Posts
CREATE POLICY "Anyone can view published blog posts"
  ON public.blog_posts FOR SELECT
  USING (published = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage blog posts"
  ON public.blog_posts FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for Gallery Items
CREATE POLICY "Anyone can view gallery items"
  ON public.gallery_items FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage gallery items"
  ON public.gallery_items FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for Documents (SECURE - Only owner can access)
CREATE POLICY "Users can view their own documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own documents"
  ON public.documents FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own documents"
  ON public.documents FOR DELETE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- RLS Policies for Resume Templates
CREATE POLICY "Anyone can view active resume templates"
  ON public.resume_templates FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage resume templates"
  ON public.resume_templates FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for Resume Versions
CREATE POLICY "Users can view their own resume versions"
  ON public.resume_versions FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own resume versions"
  ON public.resume_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own resume versions"
  ON public.resume_versions FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- RLS Policies for Analytics Events
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view analytics events"
  ON public.analytics_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for Document Access Logs
CREATE POLICY "Users can view their own access logs"
  ON public.document_access_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE documents.id = document_access_logs.document_id
      AND documents.user_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "System can insert access logs"
  ON public.document_access_logs FOR INSERT
  WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gallery_items_updated_at
  BEFORE UPDATE ON public.gallery_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('blog-images', 'blog-images', true),
  ('gallery-media', 'gallery-media', true),
  ('documents', 'documents', false),
  ('resume-pdfs', 'resume-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for blog images
CREATE POLICY "Anyone can view blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'));

-- Storage policies for gallery media
CREATE POLICY "Anyone can view gallery media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-media');

CREATE POLICY "Admins can upload gallery media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery-media' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update gallery media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'gallery-media' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gallery media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery-media' AND has_role(auth.uid(), 'admin'));

-- Storage policies for documents (SECURE - user's own files only)
CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for resume PDFs
CREATE POLICY "Users can view their own resumes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resume-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own resumes"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'resume-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own resumes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'resume-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);