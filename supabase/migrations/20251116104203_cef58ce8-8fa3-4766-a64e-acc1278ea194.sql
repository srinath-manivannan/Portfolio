-- Remove foreign key constraint from profiles table
-- This allows profiles to exist independently of auth users
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Make user_id nullable since this is public portfolio data
ALTER TABLE public.profiles 
ALTER COLUMN user_id DROP NOT NULL;

-- Set a default value for user_id
ALTER TABLE public.profiles
ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000';