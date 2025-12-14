-- =====================================================
-- SECURITY FIXES: Warn-level Issues
-- =====================================================

-- 1. Create user_roles table for proper role management
-- This follows best practices for role-based access control

CREATE TYPE public.app_role AS ENUM ('admin', 'super_admin', 'moderator', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can view/modify user_roles table
CREATE POLICY "User can view own roles" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());

-- 2. Create SECURITY DEFINER function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 3. Create SECURITY DEFINER function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'super_admin')
  ) OR EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND admin_role IN ('admin', 'super_admin')
  )
$$;

-- 4. Migrate existing admin roles from profiles to user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 
  CASE 
    WHEN admin_role = 'super_admin' THEN 'super_admin'::app_role
    WHEN admin_role = 'admin' THEN 'admin'::app_role
    ELSE 'user'::app_role
  END
FROM public.profiles
WHERE admin_role IS NOT NULL AND admin_role IN ('admin', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Update handle_new_user function with input validation and fixed search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_first_name text;
  v_last_name text;
  v_phone text;
  v_university text;
BEGIN
  -- Validate and sanitize first_name (max 100 chars, trim whitespace)
  v_first_name := NULLIF(TRIM(LEFT(NEW.raw_user_meta_data->>'first_name', 100)), '');
  
  -- Validate and sanitize last_name (max 100 chars, trim whitespace)
  v_last_name := NULLIF(TRIM(LEFT(NEW.raw_user_meta_data->>'last_name', 100)), '');
  
  -- Validate phone (max 20 chars, only allow digits, spaces, +, -)
  v_phone := NULLIF(TRIM(LEFT(regexp_replace(NEW.raw_user_meta_data->>'phone', '[^0-9\s\+\-]', '', 'g'), 20)), '');
  
  -- Validate university_name (max 200 chars)
  v_university := NULLIF(TRIM(LEFT(NEW.raw_user_meta_data->>'university_name', 200)), '');

  INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    phone,
    university,
    is_active
  )
  VALUES (
    NEW.id,
    v_first_name,
    v_last_name,
    v_phone,
    v_university,
    true
  );
  
  -- Add default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 6. Fix search_path on existing functions
-- Update admin functions to use proper search_path
CREATE OR REPLACE FUNCTION public.admin_update_user_profile(
  target_user_id uuid, 
  new_full_name text DEFAULT NULL::text, 
  new_phone text DEFAULT NULL::text, 
  new_university text DEFAULT NULL::text, 
  new_is_active boolean DEFAULT NULL::boolean, 
  new_admin_role text DEFAULT NULL::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requesting_user_id UUID;
BEGIN
  requesting_user_id := auth.uid();

  -- Check if requesting user is admin using secure function
  IF NOT public.is_admin(requesting_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Update the target user's profile
  UPDATE profiles
  SET
    first_name = COALESCE(
      CASE WHEN new_full_name IS NOT NULL 
        THEN split_part(new_full_name, ' ', 1) 
        ELSE NULL 
      END, 
      first_name
    ),
    last_name = COALESCE(
      CASE WHEN new_full_name IS NOT NULL 
        THEN substring(new_full_name from position(' ' in new_full_name) + 1)
        ELSE NULL 
      END,
      last_name
    ),
    phone = COALESCE(new_phone, phone),
    university = COALESCE(new_university, university),
    is_active = COALESCE(new_is_active, is_active),
    admin_role = COALESCE(new_admin_role, admin_role),
    updated_at = NOW()
  WHERE user_id = target_user_id;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_ban_user(target_user_id uuid, ban_reason text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requesting_user_id UUID;
BEGIN
  requesting_user_id := auth.uid();

  -- Check if requesting user is admin using secure function
  IF NOT public.is_admin(requesting_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Ban the user
  UPDATE profiles
  SET
    is_active = FALSE,
    banned_at = NOW(),
    banned_reason = ban_reason,
    updated_at = NOW()
  WHERE user_id = target_user_id;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_unban_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requesting_user_id UUID;
BEGIN
  requesting_user_id := auth.uid();

  -- Check if requesting user is admin using secure function
  IF NOT public.is_admin(requesting_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Unban the user
  UPDATE profiles
  SET
    is_active = TRUE,
    banned_at = NULL,
    banned_reason = NULL,
    updated_at = NOW()
  WHERE user_id = target_user_id;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_users_admin()
RETURNS TABLE(
  user_id uuid, 
  email text, 
  created_at timestamp with time zone, 
  full_name text, 
  phone text, 
  university text, 
  is_active boolean, 
  banned_at timestamp with time zone, 
  admin_role text, 
  is_supplier boolean, 
  supplier_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requesting_user_id UUID;
BEGIN
  requesting_user_id := auth.uid();

  -- Check if requesting user is admin using secure function
  IF NOT public.is_admin(requesting_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    p.user_id,
    au.email::TEXT,
    au.created_at,
    COALESCE(p.first_name || ' ' || p.last_name, '') as full_name,
    p.phone,
    p.university,
    p.is_active,
    p.banned_at,
    p.admin_role,
    (s.id IS NOT NULL) as is_supplier,
    s.business_name as supplier_name
  FROM profiles p
  LEFT JOIN auth.users au ON au.id = p.user_id
  LEFT JOIN suppliers s ON s.user_id = p.user_id
  ORDER BY au.created_at DESC;
END;
$$;

-- 7. Fix search_path on other functions
CREATE OR REPLACE FUNCTION public.trigger_update_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    status_label TEXT;
    user_first_name TEXT;
    user_last_name TEXT;
BEGIN
    status_label := CASE NEW.status::TEXT
        WHEN 'pending' THEN 'En attente'
        WHEN 'confirmed' THEN 'Confirmée'
        WHEN 'preparing' THEN 'En préparation'
        WHEN 'ready' THEN 'Prête'
        WHEN 'completed' THEN 'Terminée'
        WHEN 'cancelled' THEN 'Annulée'
        ELSE NEW.status::TEXT
    END;

    SELECT first_name, last_name INTO user_first_name, user_last_name
    FROM public.profiles
    WHERE user_id = NEW.user_id;

    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
        NEW.user_id,
        'Mise à jour de commande',
        format('Votre commande #%s est maintenant : %s', LEFT(NEW.id::TEXT, 8), status_label),
        'order',
        format('/orders/%s', NEW.id)
    );

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_unread_messages_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM public.messages
  WHERE recipient_id = auth.uid()
    AND is_read = false;

  RETURN unread_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_message_as_read(message_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.messages
    WHERE id = message_id_param
      AND recipient_id = auth.uid()
  ) THEN
    UPDATE public.messages
    SET is_read = true
    WHERE id = message_id_param
      AND recipient_id = auth.uid();

    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.user_has_order_with_supplier(supplier_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.orders
    WHERE user_id = auth.uid()
      AND supplier_id = supplier_id_param
      AND status IN ('pending', 'confirmed', 'in_delivery', 'delivered')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_supplier_contact(supplier_id_param uuid)
RETURNS TABLE(contact_email text, contact_phone text, contact_whatsapp text, address text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.user_has_order_with_supplier(supplier_id_param) THEN
    RETURN QUERY
    SELECT
      s.contact_email,
      s.contact_phone,
      s.contact_whatsapp,
      s.address
    FROM public.suppliers s
    WHERE s.id = supplier_id_param
      AND s.is_verified = true;
  ELSE
    RETURN QUERY
    SELECT
      NULL::TEXT,
      NULL::TEXT,
      NULL::TEXT,
      NULL::TEXT;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_order_with_profile(order_user_id uuid)
RETURNS TABLE(full_name text, phone text)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT 
    COALESCE(first_name || ' ' || last_name, '') as full_name, 
    phone
  FROM public.profiles
  WHERE user_id = order_user_id;
$$;

CREATE OR REPLACE FUNCTION public.clear_cart_after_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM cart_items
  WHERE user_id = NEW.user_id
  AND product_id IN (
    SELECT product_id FROM order_items WHERE order_id = NEW.id
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET rating = (
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM reviews
    WHERE product_id = NEW.product_id
  )
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;