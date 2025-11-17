-- Drop and recreate public_profiles view to include resume_url
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT 
  id,
  name,
  title,
  tagline,
  bio,
  profile_image,
  github_url,
  linkedin_url,
  twitter_url,
  availability_status,
  current_theme,
  resume_url,
  created_at,
  updated_at
FROM public.profiles;