-- Supprimer la politique problématique qui cause la récursion infinie
DROP POLICY IF EXISTS "Users can view suppliers of active products" ON public.suppliers;

-- Créer une fonction SECURITY DEFINER pour vérifier si un fournisseur a des produits actifs
-- Cela évite la récursion car la fonction s'exécute avec les privilèges du propriétaire
CREATE OR REPLACE FUNCTION public.supplier_has_active_products(_supplier_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.products
    WHERE supplier_id = _supplier_id
      AND is_active = true
  )
$$;

-- Recréer la politique en utilisant la fonction SECURITY DEFINER
CREATE POLICY "Users can view suppliers of active products"
ON public.suppliers
FOR SELECT
USING (
  public.supplier_has_active_products(id)
);