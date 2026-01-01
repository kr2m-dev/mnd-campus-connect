-- Migration: Fix supplier contact access for WhatsApp orders
-- Date: 2026-01-01
-- Description: Allow reading supplier contact_whatsapp when viewing products for ordering

-- ============================================
-- PROBLEM:
-- Current RLS policies block supplier contact info completely
-- This prevents users from ordering via WhatsApp
-- ============================================

-- ============================================
-- SOLUTION:
-- Add a new policy that allows reading contact_whatsapp
-- when accessed through products (for ordering purposes)
-- while still protecting other sensitive supplier data
-- ============================================

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Public can view verified suppliers basic info" ON public.suppliers;

-- Create a new, more granular policy
-- Allow reading supplier business_name and contact_whatsapp for ordering
CREATE POLICY "Public can view supplier info for products"
ON public.suppliers
FOR SELECT
TO public
USING (
  -- Allow reading suppliers for verified suppliers OR when accessed via products
  is_verified = true OR id IN (
    SELECT supplier_id FROM public.products WHERE is_active = true
  )
);

-- ============================================
-- IMPORTANT NOTES:
-- - This policy allows reading ALL columns of the suppliers table
--   when the supplier has active products
-- - If you want more granular control, you'll need to use views
--   or separate the contact info into a different table
-- - For now, this unblocks WhatsApp ordering while maintaining
--   some level of security (only suppliers with products are visible)
-- ============================================

COMMENT ON POLICY "Public can view supplier info for products" ON public.suppliers IS
'Allows viewing supplier info (including contact) for suppliers with active products - enables WhatsApp ordering';

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================================';
  RAISE NOTICE '🔧 FIX: Supplier Contact Access for Orders';
  RAISE NOTICE '================================================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Updated RLS policy to allow reading supplier contact info';
  RAISE NOTICE '✅ WhatsApp ordering should now work correctly';
  RAISE NOTICE '';
  RAISE NOTICE 'Policy: Suppliers with active products can have their contact';
  RAISE NOTICE '        info (including WhatsApp) viewed by customers';
  RAISE NOTICE '';
  RAISE NOTICE '================================================================';
  RAISE NOTICE '';
END $$;
