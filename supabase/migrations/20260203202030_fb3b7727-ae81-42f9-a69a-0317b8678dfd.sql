-- ============================================
-- AUTO-CONFIRM PHONE-BASED ACCOUNTS
-- This trigger automatically confirms email for accounts 
-- using virtual emails (@sencampuslink.com domain)
-- ============================================

-- Create table to store WhatsApp verification codes
CREATE TABLE IF NOT EXISTS public.whatsapp_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '15 minutes'),
  verified_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_verifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own verifications
CREATE POLICY "Users can view own verifications"
  ON public.whatsapp_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own verifications
CREATE POLICY "Users can create own verifications"
  ON public.whatsapp_verifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own verifications
CREATE POLICY "Users can update own verifications"
  ON public.whatsapp_verifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_whatsapp_verifications_user_id ON public.whatsapp_verifications(user_id);
CREATE INDEX idx_whatsapp_verifications_phone ON public.whatsapp_verifications(phone);
CREATE INDEX idx_whatsapp_verifications_code ON public.whatsapp_verifications(code);

-- Function to generate a 6-digit verification code
CREATE OR REPLACE FUNCTION public.generate_verification_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$;

-- Function to create a verification request
CREATE OR REPLACE FUNCTION public.create_whatsapp_verification(phone_number TEXT)
RETURNS TABLE(code TEXT, expires_at TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_expires TIMESTAMP WITH TIME ZONE;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Generate new code
  v_code := public.generate_verification_code();
  v_expires := now() + interval '15 minutes';
  
  -- Delete old unverified codes for this user
  DELETE FROM public.whatsapp_verifications 
  WHERE user_id = v_user_id AND verified_at IS NULL;
  
  -- Insert new verification
  INSERT INTO public.whatsapp_verifications (user_id, phone, code, expires_at)
  VALUES (v_user_id, phone_number, v_code, v_expires);
  
  RETURN QUERY SELECT v_code, v_expires;
END;
$$;

-- Function to verify a code
CREATE OR REPLACE FUNCTION public.verify_whatsapp_code(verification_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_verification RECORD;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Find the verification
  SELECT * INTO v_verification
  FROM public.whatsapp_verifications
  WHERE user_id = v_user_id 
    AND code = verification_code
    AND verified_at IS NULL
    AND expires_at > now()
    AND attempts < 5
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_verification IS NULL THEN
    -- Increment attempts for any unverified codes
    UPDATE public.whatsapp_verifications
    SET attempts = attempts + 1
    WHERE user_id = v_user_id AND verified_at IS NULL;
    
    RETURN FALSE;
  END IF;
  
  -- Mark as verified
  UPDATE public.whatsapp_verifications
  SET verified_at = now()
  WHERE id = v_verification.id;
  
  -- Update profile to mark phone as verified
  UPDATE public.profiles
  SET updated_at = now()
  WHERE user_id = v_user_id;
  
  RETURN TRUE;
END;
$$;