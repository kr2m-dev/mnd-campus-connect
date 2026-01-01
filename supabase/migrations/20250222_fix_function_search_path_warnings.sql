-- ============================================
-- FIX FUNCTION SEARCH_PATH WARNINGS
-- ============================================
-- Created: 2025-02-22
-- Purpose: Fix mutable search_path warnings on functions
-- Issue: Functions without SET search_path are vulnerable to search_path injection attacks
-- Fix: Add SET search_path = public to all affected functions
-- ============================================

-- ============================================
-- WARNING 1: Fix user_has_order_with_supplier
-- ============================================

CREATE OR REPLACE FUNCTION public.user_has_order_with_supplier(supplier_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders o
    INNER JOIN public.order_items oi ON oi.order_id = o.id
    INNER JOIN public.products p ON p.id = oi.product_id
    WHERE p.supplier_id = supplier_id_param
      AND o.user_id = auth.uid()
      AND o.status IN ('confirmed', 'preparing', 'ready', 'completed')
  );
$$;

COMMENT ON FUNCTION public.user_has_order_with_supplier IS
'Vérifie si l''utilisateur a une commande active avec ce fournisseur - search_path sécurisé';

-- ============================================
-- WARNING 2: Fix get_unread_messages_count
-- ============================================

CREATE OR REPLACE FUNCTION public.get_unread_messages_count()
RETURNS INTEGER
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

COMMENT ON FUNCTION public.get_unread_messages_count IS
'Retourne le nombre de messages non lus pour l''utilisateur connecté - search_path sécurisé';

-- ============================================
-- WARNING 3: Fix mark_message_as_read
-- ============================================

CREATE OR REPLACE FUNCTION public.mark_message_as_read(message_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier que l'utilisateur est le destinataire
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

COMMENT ON FUNCTION public.mark_message_as_read IS
'Marque un message comme lu (uniquement si destinataire) - search_path sécurisé';

-- ============================================
-- VERIFICATION QUERIES (for testing)
-- ============================================

-- Run this query to verify all functions have search_path set:
--
-- SELECT
--   n.nspname as schema,
--   p.proname as function_name,
--   pg_get_function_arguments(p.oid) as arguments,
--   CASE
--     WHEN p.proconfig IS NULL THEN 'NO search_path set ⚠️'
--     WHEN array_to_string(p.proconfig, ', ') LIKE '%search_path%' THEN 'search_path set ✅'
--     ELSE 'NO search_path set ⚠️'
--   END as search_path_status,
--   array_to_string(p.proconfig, ', ') as config
-- FROM pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE n.nspname = 'public'
--   AND p.proname IN ('user_has_order_with_supplier', 'get_unread_messages_count', 'mark_message_as_read')
-- ORDER BY p.proname;

-- ============================================
-- ABOUT LEAKED PASSWORD PROTECTION WARNING
-- ============================================

-- The "Leaked Password Protection" warning cannot be fixed via SQL migration.
-- This setting must be enabled in the Supabase Dashboard:
--
-- 1. Go to: Authentication > Passwords
-- 2. Enable: "Check against leaked passwords (HaveIBeenPwned)"
--
-- This feature prevents users from using passwords that have been
-- compromised in known data breaches.

-- ============================================
-- SUMMARY
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================================';
  RAISE NOTICE '🔒 FUNCTION SEARCH_PATH WARNINGS FIXED';
  RAISE NOTICE '================================================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Fixed user_has_order_with_supplier - added SET search_path = public';
  RAISE NOTICE '✅ Fixed get_unread_messages_count - added SET search_path = public';
  RAISE NOTICE '✅ Fixed mark_message_as_read - added SET search_path = public';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 All functions now have immutable search_path';
  RAISE NOTICE '🎯 Protection against search_path injection attacks';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  REMAINING WARNING: "Leaked Password Protection"';
  RAISE NOTICE '   This must be enabled manually in Supabase Dashboard:';
  RAISE NOTICE '   Authentication > Passwords > Enable leaked password check';
  RAISE NOTICE '';
  RAISE NOTICE '================================================================';
  RAISE NOTICE '🎉 ALL SQL WARNINGS FIXED';
  RAISE NOTICE '================================================================';
  RAISE NOTICE '';
END $$;
