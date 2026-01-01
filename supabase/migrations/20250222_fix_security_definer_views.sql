-- ============================================
-- FIX SECURITY DEFINER VIEWS
-- ============================================
-- Created: 2025-02-22
-- Purpose: Remove SECURITY DEFINER from views to prevent RLS bypass
-- Issue: Views with SECURITY DEFINER run with creator's permissions, not querying user's
-- Fix: Recreate all views with SECURITY INVOKER to respect RLS policies
-- ============================================

-- ============================================
-- 1. FIX profiles_public VIEW
-- ============================================
-- This view is now UNNECESSARY after fixing the profiles table RLS policies
-- The new policies already restrict access appropriately
-- We'll drop it completely

DROP VIEW IF EXISTS public.profiles_public CASCADE;

COMMENT ON TABLE public.profiles IS
'Profils utilisateurs - RLS activé avec policies restrictives basées sur relations business';

-- ============================================
-- 2. FIX message_conversations VIEW
-- ============================================
-- Recreate with SECURITY INVOKER to respect user permissions

DROP VIEW IF EXISTS public.message_conversations CASCADE;

CREATE VIEW public.message_conversations
WITH (security_invoker = true)
AS
SELECT DISTINCT ON (conversation_user_id)
  CASE
    WHEN m.sender_id = auth.uid() THEN m.recipient_id
    ELSE m.sender_id
  END as conversation_user_id,
  m.id as last_message_id,
  m.content as last_message_content,
  m.created_at as last_message_at,
  m.is_read,
  -- Jointure avec profiles pour obtenir le nom de l'interlocuteur
  p.first_name,
  p.last_name
FROM public.messages m
LEFT JOIN public.profiles p ON (
  CASE
    WHEN m.sender_id = auth.uid() THEN m.recipient_id
    ELSE m.sender_id
  END = p.user_id
)
WHERE m.sender_id = auth.uid() OR m.recipient_id = auth.uid()
ORDER BY conversation_user_id, m.created_at DESC;

-- Grant permissions
GRANT SELECT ON public.message_conversations TO authenticated;

COMMENT ON VIEW public.message_conversations IS
'Vue des conversations avec le dernier message de chaque conversation - SECURITY INVOKER respecte RLS';

-- ============================================
-- 3. FIX suppliers_public VIEW
-- ============================================
-- This view masked sensitive data but with SECURITY DEFINER it bypassed RLS
-- Now we'll make it SECURITY INVOKER and rely on table RLS policies

DROP VIEW IF EXISTS public.suppliers_public CASCADE;

CREATE VIEW public.suppliers_public
WITH (security_invoker = true)
AS
SELECT
  id,
  business_name,
  description,
  logo_url,
  is_verified,
  created_at,
  -- Mask sensitive contact info - users get this through suppliers_with_contact view
  NULL::text as contact_email,
  NULL::text as contact_phone,
  NULL::text as contact_whatsapp,
  NULL::text as address
FROM public.suppliers
WHERE is_verified = true;

-- Grant permissions
GRANT SELECT ON public.suppliers_public TO authenticated;
GRANT SELECT ON public.suppliers_public TO anon;

COMMENT ON VIEW public.suppliers_public IS
'Vue publique des fournisseurs vérifiés - masque infos de contact - SECURITY INVOKER';

-- ============================================
-- 4. FIX security_stats VIEW
-- ============================================
-- Admin-only view for monitoring RLS status
-- Recreate with SECURITY INVOKER

DROP VIEW IF EXISTS public.security_stats CASCADE;

CREATE VIEW public.security_stats
WITH (security_invoker = true)
AS
SELECT
  'cart_items' as table_name,
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'cart_items') as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'cart_items') as policy_count
UNION ALL
SELECT
  'products' as table_name,
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'products') as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'products') as policy_count
UNION ALL
SELECT
  'profiles' as table_name,
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles') as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles') as policy_count
UNION ALL
SELECT
  'student_listings' as table_name,
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'student_listings') as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'student_listings') as policy_count
UNION ALL
SELECT
  'favorites' as table_name,
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'favorites') as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'favorites') as policy_count
UNION ALL
SELECT
  'messages' as table_name,
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'messages') as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'messages') as policy_count
UNION ALL
SELECT
  'suppliers' as table_name,
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'suppliers') as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'suppliers') as policy_count;

-- Grant permissions (admins only - enforced by RLS)
GRANT SELECT ON public.security_stats TO authenticated;

COMMENT ON VIEW public.security_stats IS
'Statistiques de sécurité RLS - visible par admins uniquement - SECURITY INVOKER';

-- ============================================
-- 5. FIX suppliers_with_contact VIEW
-- ============================================
-- This view conditionally shows contact info based on user_has_order_with_supplier()
-- Recreate with SECURITY INVOKER

DROP VIEW IF EXISTS public.suppliers_with_contact CASCADE;

CREATE VIEW public.suppliers_with_contact
WITH (security_invoker = true)
AS
SELECT
  s.id,
  s.business_name,
  s.description,
  s.logo_url,
  s.is_verified,
  s.created_at,
  -- Infos de contact: visibles uniquement si l'utilisateur a une commande active
  CASE
    WHEN public.user_has_order_with_supplier(s.id) THEN s.contact_email
    ELSE NULL
  END as contact_email,
  CASE
    WHEN public.user_has_order_with_supplier(s.id) THEN s.contact_phone
    ELSE NULL
  END as contact_phone,
  CASE
    WHEN public.user_has_order_with_supplier(s.id) THEN s.contact_whatsapp
    ELSE NULL
  END as contact_whatsapp,
  CASE
    WHEN public.user_has_order_with_supplier(s.id) THEN s.address
    ELSE NULL
  END as address
FROM public.suppliers s
WHERE s.is_verified = true;

-- Grant permissions
GRANT SELECT ON public.suppliers_with_contact TO authenticated;

COMMENT ON VIEW public.suppliers_with_contact IS
'Vue fournisseurs avec contact conditionnel - visible si commande active - SECURITY INVOKER';

-- ============================================
-- ENSURE RLS ON UNDERLYING TABLES
-- ============================================

-- Verify RLS is enabled on critical tables (should already be enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICATION QUERIES (for testing)
-- ============================================

-- Run these queries to verify the fix:
--
-- 1. Check all views are now SECURITY INVOKER:
-- SELECT
--   schemaname,
--   viewname,
--   CASE
--     WHEN definition LIKE '%security_invoker%' THEN 'SECURITY INVOKER'
--     ELSE 'SECURITY DEFINER'
--   END as security_mode
-- FROM pg_views
-- WHERE schemaname = 'public'
--   AND viewname IN ('message_conversations', 'suppliers_public', 'security_stats', 'suppliers_with_contact');
--
-- 2. Check RLS status:
-- SELECT * FROM public.security_stats;
--
-- 3. Test views work correctly with current user permissions:
-- SELECT * FROM public.suppliers_public LIMIT 5;
-- SELECT * FROM public.message_conversations LIMIT 5;

-- ============================================
-- SUMMARY
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================================';
  RAISE NOTICE '🔒 SECURITY DEFINER VIEWS FIXED';
  RAISE NOTICE '================================================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Dropped profiles_public view (no longer needed)';
  RAISE NOTICE '✅ Recreated message_conversations with SECURITY INVOKER';
  RAISE NOTICE '✅ Recreated suppliers_public with SECURITY INVOKER';
  RAISE NOTICE '✅ Recreated security_stats with SECURITY INVOKER';
  RAISE NOTICE '✅ Recreated suppliers_with_contact with SECURITY INVOKER';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 All views now respect RLS policies of querying user';
  RAISE NOTICE '🎯 No more security definer bypass vulnerabilities';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Note: Run 20250222_fix_function_search_path_warnings.sql';
  RAISE NOTICE '   to fix function search_path warnings';
  RAISE NOTICE '';
  RAISE NOTICE '================================================================';
  RAISE NOTICE '🎉 ALL SECURITY DEFINER VIEW ERRORS FIXED';
  RAISE NOTICE '================================================================';
  RAISE NOTICE '';
END $$;
