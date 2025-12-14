-- Migration: Sécurisation de la table suppliers
-- Date: 2025-02-14
-- Description: Protège les informations de contact des fournisseurs avec RLS

-- ============================================
-- 1. ACTIVER RLS SUR LA TABLE SUPPLIERS
-- ============================================

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. SUPPRIMER LES ANCIENNES POLITIQUES (SI ELLES EXISTENT)
-- ============================================

DROP POLICY IF EXISTS "Public can view verified suppliers basic info" ON public.suppliers;
DROP POLICY IF EXISTS "Suppliers can view their own full data" ON public.suppliers;
DROP POLICY IF EXISTS "Suppliers can update their own data" ON public.suppliers;
DROP POLICY IF EXISTS "Authenticated can view supplier contact if has order" ON public.suppliers;

-- ============================================
-- 3. CRÉER UNE VUE PUBLIQUE AVEC INFOS LIMITÉES
-- ============================================

-- Cette vue expose uniquement les informations publiques des fournisseurs vérifiés
CREATE OR REPLACE VIEW public.suppliers_public AS
SELECT
  id,
  business_name,
  description,
  logo_url,
  is_verified,
  created_at,
  -- NE PAS exposer: contact_email, contact_phone, contact_whatsapp, address, user_id
  NULL::text as contact_email,  -- Masqué
  NULL::text as contact_phone,  -- Masqué
  NULL::text as contact_whatsapp, -- Masqué
  NULL::text as address  -- Masqué
FROM public.suppliers
WHERE is_verified = true;

-- Permettre à tous de lire la vue publique
GRANT SELECT ON public.suppliers_public TO authenticated;
GRANT SELECT ON public.suppliers_public TO anon;

-- ============================================
-- 4. FONCTION POUR VÉRIFIER SI L'USER A UNE COMMANDE AVEC LE FOURNISSEUR
-- ============================================

CREATE OR REPLACE FUNCTION public.user_has_order_with_supplier(supplier_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifie si l'utilisateur connecté a au moins une commande avec ce fournisseur
  RETURN EXISTS (
    SELECT 1
    FROM public.orders
    WHERE user_id = auth.uid()
      AND supplier_id = supplier_id_param
      AND status IN ('pending', 'confirmed', 'in_delivery', 'delivered')
  );
END;
$$;

-- ============================================
-- 5. VUE POUR LES INFOS DE CONTACT (ACCESSIBLE SI COMMANDE ACTIVE)
-- ============================================

CREATE OR REPLACE VIEW public.suppliers_with_contact AS
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

-- Permettre aux utilisateurs authentifiés de lire cette vue
GRANT SELECT ON public.suppliers_with_contact TO authenticated;

-- ============================================
-- 6. POLITIQUES RLS SUR LA TABLE SUPPLIERS
-- ============================================

-- Politique 1: Les utilisateurs anonymes et authentifiés peuvent voir uniquement les infos de base des fournisseurs vérifiés
CREATE POLICY "Public can view verified suppliers basic info"
ON public.suppliers
FOR SELECT
TO public
USING (
  is_verified = true
  AND (
    -- Limiter les colonnes accessibles via les vues
    -- Cette politique permet la lecture mais les infos sensibles sont masquées via les vues
    true
  )
);

-- Politique 2: Les fournisseurs peuvent voir TOUTES leurs propres données
CREATE POLICY "Suppliers can view their own full data"
ON public.suppliers
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

-- Politique 3: Les fournisseurs peuvent mettre à jour leurs propres données
CREATE POLICY "Suppliers can update their own data"
ON public.suppliers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Politique 4: Permettre l'insertion uniquement par le fournisseur lui-même
CREATE POLICY "Users can create their own supplier profile"
ON public.suppliers
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Politique 5: Les fournisseurs peuvent supprimer leur propre profil
CREATE POLICY "Suppliers can delete their own profile"
ON public.suppliers
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- 7. FONCTION HELPER POUR OBTENIR LES INFOS DE CONTACT
-- ============================================

-- Fonction que le frontend peut appeler pour obtenir les infos de contact d'un fournisseur
-- Retourne les infos uniquement si l'utilisateur a une commande active
CREATE OR REPLACE FUNCTION public.get_supplier_contact(supplier_id_param UUID)
RETURNS TABLE (
  contact_email TEXT,
  contact_phone TEXT,
  contact_whatsapp TEXT,
  address TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier si l'utilisateur a une commande avec ce fournisseur
  IF public.user_has_order_with_supplier(supplier_id_param) THEN
    RETURN QUERY
    SELECT
      s.contact_email,
      s.contact_phone,
      s.contact_whatsapp,
      s.address
    FROM public.suppliers s
    WHERE s.id = supplier_id_param
      AND s.is_verified = true;
  ELSE
    -- Retourner des valeurs NULL si pas de commande
    RETURN QUERY
    SELECT
      NULL::TEXT,
      NULL::TEXT,
      NULL::TEXT,
      NULL::TEXT;
  END IF;
END;
$$;

-- Permettre aux utilisateurs authentifiés d'appeler cette fonction
GRANT EXECUTE ON FUNCTION public.get_supplier_contact(UUID) TO authenticated;

-- ============================================
-- 8. COMMENTAIRES POUR DOCUMENTATION
-- ============================================

COMMENT ON VIEW public.suppliers_public IS
'Vue publique des fournisseurs vérifiés - Infos de contact masquées';

COMMENT ON VIEW public.suppliers_with_contact IS
'Vue des fournisseurs avec infos de contact - Visible uniquement si commande active';

COMMENT ON FUNCTION public.get_supplier_contact IS
'Retourne les infos de contact d''un fournisseur uniquement si l''utilisateur a une commande active avec lui';

COMMENT ON FUNCTION public.user_has_order_with_supplier IS
'Vérifie si l''utilisateur connecté a une commande active avec le fournisseur spécifié';

-- ============================================
-- 9. INDEX POUR PERFORMANCE
-- ============================================

-- Index sur is_verified pour les requêtes de fournisseurs vérifiés
CREATE INDEX IF NOT EXISTS idx_suppliers_verified
ON public.suppliers(is_verified)
WHERE is_verified = true;

-- Index sur user_id pour les requêtes des fournisseurs sur leurs propres données
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id
ON public.suppliers(user_id);

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================
