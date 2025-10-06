-- Create student_listings table for student-to-student marketplace
CREATE TABLE public.student_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'exchange', 'free')),
  category TEXT NOT NULL,
  condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  image_urls TEXT[],
  university TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  is_sold BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on student_listings
ALTER TABLE public.student_listings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active listings
CREATE POLICY "Everyone can view active student listings"
ON public.student_listings
FOR SELECT
USING (is_active = true);

-- Policy: Users can create their own listings
CREATE POLICY "Users can create their own listings"
ON public.student_listings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own listings
CREATE POLICY "Users can update their own listings"
ON public.student_listings
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own listings
CREATE POLICY "Users can delete their own listings"
ON public.student_listings
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_student_listings_updated_at
BEFORE UPDATE ON public.student_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_student_listings_user_id ON public.student_listings(user_id);
CREATE INDEX idx_student_listings_university ON public.student_listings(university);
CREATE INDEX idx_student_listings_category ON public.student_listings(category);
CREATE INDEX idx_student_listings_created_at ON public.student_listings(created_at DESC);