-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Add resume_url to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resume_url text;

-- Storage policies for resumes bucket
CREATE POLICY "Anyone can view resumes"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes');

CREATE POLICY "Admins can upload resumes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resumes' 
  AND (auth.uid() IS NOT NULL)
);

CREATE POLICY "Admins can update resumes"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resumes' 
  AND (auth.uid() IS NOT NULL)
);

CREATE POLICY "Admins can delete resumes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resumes' 
  AND (auth.uid() IS NOT NULL)
);