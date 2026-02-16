
-- Drop the recursive policies
DROP POLICY IF EXISTS "Suppliers can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Suppliers can update their orders" ON public.orders;

-- Recreate without self-referencing orders table
CREATE POLICY "Suppliers can view their orders"
ON public.orders
FOR SELECT
USING (
  supplier_id IN (
    SELECT id FROM public.suppliers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Suppliers can update their orders"
ON public.orders
FOR UPDATE
USING (
  supplier_id IN (
    SELECT id FROM public.suppliers WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  supplier_id IN (
    SELECT id FROM public.suppliers WHERE user_id = auth.uid()
  )
);
