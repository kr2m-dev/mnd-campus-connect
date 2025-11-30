-- Permettre l'accès public aux produits actifs (lecture seule)
DROP POLICY IF EXISTS "Products are publicly readable when active" ON public.products;

CREATE POLICY "Public can view active products"
ON public.products
FOR SELECT
USING (is_active = true);

-- Ajouter le champ contact_whatsapp aux fournisseurs
ALTER TABLE public.suppliers
ADD COLUMN IF NOT EXISTS contact_whatsapp text;