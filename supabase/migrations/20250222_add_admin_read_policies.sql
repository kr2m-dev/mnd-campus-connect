-- ============================================
-- ADD ADMIN READ POLICIES
-- ============================================
-- Created: 2025-02-22
-- Purpose: Allow admins to SELECT from profiles, suppliers, and products tables
-- Issue: Admin panel queries fail because RLS blocks them (no admin SELECT policies)
-- Solution: Add policies allowing admins to read all data from these tables
-- ============================================

-- Background:
-- Admin RPC functions (admin_ban_user, admin_verify_supplier, etc.) work fine
-- because they use SECURITY DEFINER and bypass RLS. However, the read queries
-- in use-admin.ts (lines 38-46, 54-65, 73-89, 127-131) run with user permissions
-- and need explicit RLS policies to allow admin access.

-- ============================================
-- 1. ADD ADMIN READ POLICY FOR SUPPLIERS TABLE
-- ============================================

-- Drop if exists (in case it was partially created)
DROP POLICY IF EXISTS "Admins can view all suppliers" ON public.suppliers;

-- Create admin read policy
CREATE POLICY "Admins can view all suppliers"
ON public.suppliers
FOR SELECT
TO authenticated
USING ((SELECT is_admin(auth.uid())));

COMMENT ON POLICY "Admins can view all suppliers" ON public.suppliers IS
'Allows admins to SELECT all supplier records for admin panel management';

-- ============================================
-- 2. ADD ADMIN READ POLICY FOR PRODUCTS TABLE
-- ============================================

-- Drop if exists
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;

-- Create admin read policy
CREATE POLICY "Admins can view all products"
ON public.products
FOR SELECT
TO authenticated
USING ((SELECT is_admin(auth.uid())));

COMMENT ON POLICY "Admins can view all products" ON public.products IS
'Allows admins to SELECT all product records for admin panel management';

-- ============================================
-- 3. VERIFY PROFILES TABLE HAS ADMIN POLICY
-- ============================================

-- This should already exist from 20250222_optimize_rls_performance.sql
-- but we'll ensure it's there

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING ((SELECT is_admin(auth.uid())));

COMMENT ON POLICY "Admins can view all profiles" ON public.profiles IS
'Allows admins to SELECT all profile records for admin panel user management';

-- ============================================
-- 4. ADD ADMIN FULL ACCESS TO ORDERS (optional but useful)
-- ============================================

-- Admins may need to view all orders for support/debugging
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;

CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING ((SELECT is_admin(auth.uid())));

COMMENT ON POLICY "Admins can view all orders" ON public.orders IS
'Allows admins to view all orders for support and monitoring';

-- ============================================
-- 5. ADD ADMIN READ ACCESS TO REVIEWS (for moderation)
-- ============================================

-- Admins need to see all reviews for moderation
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;

CREATE POLICY "Admins can view all reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING ((SELECT is_admin(auth.uid())));

COMMENT ON POLICY "Admins can view all reviews" ON public.reviews IS
'Allows admins to view all reviews for moderation purposes';

-- Note: DELETE policy for reviews already exists from previous migrations

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- Run this to verify admin can access all required tables:
--
-- SELECT
--   schemaname,
--   tablename,
--   policyname,
--   cmd as command,
--   qual as using_clause
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND policyname LIKE '%Admin%'
-- ORDER BY tablename, policyname;

-- ============================================
-- SUMMARY
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================================';
  RAISE NOTICE '🔑 ADMIN READ POLICIES ADDED';
  RAISE NOTICE '================================================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Added admin SELECT policies for:';
  RAISE NOTICE '   • suppliers - Admins can view all suppliers';
  RAISE NOTICE '   • products - Admins can view all products';
  RAISE NOTICE '   • profiles - Admins can view all profiles (verified)';
  RAISE NOTICE '   • orders - Admins can view all orders';
  RAISE NOTICE '   • reviews - Admins can view all reviews';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Admin panel queries in use-admin.ts will now work';
  RAISE NOTICE '🎯 Admins can read all data for management and moderation';
  RAISE NOTICE '🎯 Admin RPC functions continue to work via SECURITY DEFINER';
  RAISE NOTICE '';
  RAISE NOTICE '================================================================';
  RAISE NOTICE '🎉 ADMIN READ ACCESS CONFIGURED';
  RAISE NOTICE '================================================================';
  RAISE NOTICE '';
END $$;
