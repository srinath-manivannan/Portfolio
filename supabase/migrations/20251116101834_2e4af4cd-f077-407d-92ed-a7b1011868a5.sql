-- Add achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  institution TEXT,
  date DATE NOT NULL,
  icon TEXT DEFAULT 'trophy',
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
ON public.achievements FOR SELECT
USING (true);

CREATE POLICY "Admins can insert achievements"
ON public.achievements FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update achievements"
ON public.achievements FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete achievements"
ON public.achievements FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add education table
CREATE TABLE public.education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  university TEXT,
  duration TEXT NOT NULL,
  cgpa TEXT,
  grade TEXT,
  achievements TEXT[],
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view education"
ON public.education FOR SELECT
USING (true);

CREATE POLICY "Admins can insert education"
ON public.education FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update education"
ON public.education FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete education"
ON public.education FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add user_settings table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_theme TEXT DEFAULT 'professional',
  seo_title TEXT,
  seo_description TEXT,
  analytics_id TEXT,
  webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings"
ON public.user_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage settings"
ON public.user_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add missing fields to existing tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_theme TEXT DEFAULT 'professional';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitter_url TEXT;

-- Add triggers for updated_at
CREATE TRIGGER update_achievements_updated_at
BEFORE UPDATE ON public.achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_education_updated_at
BEFORE UPDATE ON public.education
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();