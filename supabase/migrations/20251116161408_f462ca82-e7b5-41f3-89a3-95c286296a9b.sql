-- Add resume_url to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resume_url text;