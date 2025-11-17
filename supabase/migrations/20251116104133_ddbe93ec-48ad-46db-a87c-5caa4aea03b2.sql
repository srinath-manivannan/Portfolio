-- Make user_id nullable for profiles to allow a default public profile
ALTER TABLE profiles ALTER COLUMN user_id DROP NOT NULL;

-- Insert default profile data
INSERT INTO profiles (name, title, tagline, bio, email, phone, location, github_url, linkedin_url, availability_status)
VALUES (
  'Srinath Manivannan',
  'AI Full-Stack Software Engineer',
  'MERN | Next.js | TypeScript | Agentic AI | n8n Automation | Cloud',
  'Full-Stack Developer with 3 years of experience across MERN, Next.js, TypeScript, automation engineering, and AI-powered development.',
  'srinathmgr2001@gmail.com',
  '8144429317',
  'Tindivanam, Tamil Nadu, India',
  'https://github.com/srinath-manivannan',
  'https://linkedin.com/in/srinath-manivannan',
  true
)
ON CONFLICT DO NOTHING;