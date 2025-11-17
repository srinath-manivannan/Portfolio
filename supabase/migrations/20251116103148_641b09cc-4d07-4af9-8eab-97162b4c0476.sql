-- Add video and certificate fields to projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS certificate_urls text[];

-- Add certificate and appreciation fields to experiences
ALTER TABLE public.experiences
ADD COLUMN IF NOT EXISTS certificate_urls text[],
ADD COLUMN IF NOT EXISTS appreciation_urls text[];

-- Add PDF support to certifications
ALTER TABLE public.certifications
ADD COLUMN IF NOT EXISTS pdf_url text;

-- Create storage buckets for certificates
INSERT INTO storage.buckets (id, name, public)
VALUES ('experience-certificates', 'experience-certificates', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-certificates', 'project-certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view experience certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload experience certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete experience certificates" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view project certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload project certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete project certificates" ON storage.objects;

-- Storage policies for experience certificates
CREATE POLICY "Anyone can view experience certificates"
ON storage.objects FOR SELECT
USING (bucket_id = 'experience-certificates');

CREATE POLICY "Admins can upload experience certificates"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'experience-certificates' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete experience certificates"
ON storage.objects FOR DELETE
USING (bucket_id = 'experience-certificates' AND has_role(auth.uid(), 'admin'));

-- Storage policies for project certificates
CREATE POLICY "Anyone can view project certificates"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-certificates');

CREATE POLICY "Admins can upload project certificates"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-certificates' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete project certificates"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-certificates' AND has_role(auth.uid(), 'admin'));