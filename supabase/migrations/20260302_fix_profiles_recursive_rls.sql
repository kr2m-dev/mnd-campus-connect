-- ============================================================
-- FIX: Recursive RLS policy on profiles table → 500 errors
-- ============================================================
-- Problem: "Users can view profiles through orders" joins
--   public.profiles inside a policy ON public.profiles
--   → infinite recursion → PostgreSQL 500 Internal Server Error
-- Solution:
--   1. Drop recursive policy, rewrite without self-join
--   2. Add SECURITY DEFINER function for public platform stats
-- ============================================================

-- 1. Drop the recursive policy
DROP POLICY IF EXISTS "Users can view profiles through orders" ON public.profiles;

-- 2. Recreate WITHOUT the self-referencing profiles join
--    Original had: INNER JOIN public.profiles p ON p.user_id = s.user_id
--    Fix: use s.user_id directly (already the value we need)
CREATE POLICY "Users can view profiles through orders"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  user_id IN (
    -- Supplier user IDs for orders placed by the current user
    SELECT s.user_id
    FROM public.orders o
    INNER JOIN public.order_items oi ON oi.order_id = o.id
    INNER JOIN public.products prod ON prod.id = oi.product_id
    INNER JOIN public.suppliers s ON s.id = prod.supplier_id
    WHERE o.user_id = (SELECT auth.uid())

    UNION

    -- Customer user IDs who ordered from the current user's supplier
    SELECT o.user_id
    FROM public.orders o
    INNER JOIN public.order_items oi ON oi.order_id = o.id
    INNER JOIN public.products prod ON prod.id = oi.product_id
    INNER JOIN public.suppliers s ON s.id = prod.supplier_id
    WHERE s.user_id = (SELECT auth.uid())
  )
);

-- 3. Create a SECURITY DEFINER function for platform-wide stats
--    This safely bypasses RLS for counting, accessible by anon + authenticated
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS TABLE(
  universities_count bigint,
  students_count bigint,
  active_listings_count bigint,
  average_rating numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*) FROM public.universities)::bigint,
    (SELECT COUNT(*) FROM public.profiles)::bigint,
    (SELECT COUNT(*) FROM public.student_listings WHERE is_active = true)::bigint,
    COALESCE(
      (SELECT ROUND(AVG(rating)::numeric, 1) FROM public.products WHERE rating > 0),
      4.8
    );
$$;

GRANT EXECUTE ON FUNCTION public.get_platform_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.get_platform_stats() TO authenticated;

-- Summary
DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'FIX: profiles recursive RLS policy resolved';
  RAISE NOTICE '  - Dropped self-referencing policy on profiles';
  RAISE NOTICE '  - Recreated without INNER JOIN public.profiles';
  RAISE NOTICE '  - Added get_platform_stats() SECURITY DEFINER';
  RAISE NOTICE '=================================================';
END $$;
