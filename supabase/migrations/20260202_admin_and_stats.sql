-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

-- Add RLS to admins table
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Only admins can read the admins table (recursive check, but for bootstrap we might need a simpler policy)
CREATE POLICY "Admins can read admins table" ON public.admins
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- Extend suppliers table
ALTER TABLE IF EXISTS public.suppliers ADD COLUMN IF NOT EXISTS genre text;

-- Create interactions table
CREATE TABLE IF NOT EXISTS public.interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type text NOT NULL, -- 'view', 'click', 'like', 'message', etc.
  target_id uuid,
  target_type text, -- 'product', 'supplier', 'listing', etc.
  created_at timestamp with time zone DEFAULT now()
);

-- Add RLS to interactions
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can create interactions" ON public.interactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read interactions" ON public.interactions FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- Create site_visits table
CREATE TABLE IF NOT EXISTS public.site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  page_url text,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Add RLS to site_visits
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can create site_visits" ON public.site_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read site_visits" ON public.site_visits FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.admins));
