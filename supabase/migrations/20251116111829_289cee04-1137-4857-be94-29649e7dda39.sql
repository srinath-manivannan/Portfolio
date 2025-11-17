-- Fix PUBLIC_DATA_EXPOSURE: Restrict profiles table and create public view

-- Drop the existing public SELECT policy
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Create admin-only SELECT policy for full profiles access
CREATE POLICY "Admins can view full profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a public view that only exposes safe, non-sensitive fields
CREATE OR REPLACE VIEW public.public_profiles AS
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
  created_at,
  updated_at
FROM public.profiles;

-- Grant SELECT on the public view to anon and authenticated users
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Add comment explaining the security model
COMMENT ON VIEW public.public_profiles IS 'Public view of profiles exposing only non-sensitive fields. Sensitive fields (email, phone, location, user_id) are restricted to admin access only.';