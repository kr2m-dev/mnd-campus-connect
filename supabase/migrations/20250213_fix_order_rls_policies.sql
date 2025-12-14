-- Supprimer les anciennes politiques de mise à jour qui pourraient être incorrectes
DROP POLICY IF EXISTS "Users can update their own pending orders" ON public.orders;
DROP POLICY IF EXISTS "Suppliers can update status of their orders" ON public.orders;
DROP POLICY IF EXISTS "Suppliers can update their orders" ON public.orders;

-- Recréer la politique pour que les utilisateurs puissent modifier leurs commandes en attente
CREATE POLICY "Users can update their own pending orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

-- Recréer la politique pour que les fournisseurs puissent modifier le statut de TOUTES leurs commandes
-- (pas seulement pending, car ils doivent pouvoir passer de confirmed à preparing, etc.)
CREATE POLICY "Suppliers can update their orders"
ON public.orders
FOR UPDATE
TO authenticated
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
