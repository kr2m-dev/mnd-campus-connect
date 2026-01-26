-- Ajouter une politique RLS pour permettre aux utilisateurs de voir les fournisseurs
-- des produits actifs (nécessaire pour le panier et l'affichage des produits)

CREATE POLICY "Users can view suppliers of active products"
ON public.suppliers
FOR SELECT
USING (
  id IN (
    SELECT supplier_id 
    FROM public.products 
    WHERE is_active = true
  )
);
