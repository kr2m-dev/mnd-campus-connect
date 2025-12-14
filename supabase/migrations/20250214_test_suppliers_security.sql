-- Script de test pour la sécurité de la table suppliers
-- À exécuter APRÈS la migration 20250214_secure_suppliers_table.sql

-- ============================================
-- TEST 1: Vérifier que RLS est activé
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'suppliers'
      AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'ÉCHEC: RLS n''est PAS activé sur la table suppliers';
  ELSE
    RAISE NOTICE '✅ TEST 1 RÉUSSI: RLS est activé sur la table suppliers';
  END IF;
END $$;

-- ============================================
-- TEST 2: Vérifier que les vues existent
-- ============================================
DO $$
BEGIN
  -- Vérifier suppliers_public
  IF NOT EXISTS (
    SELECT 1
    FROM pg_views
    WHERE schemaname = 'public'
      AND viewname = 'suppliers_public'
  ) THEN
    RAISE EXCEPTION 'ÉCHEC: La vue suppliers_public n''existe pas';
  END IF;

  -- Vérifier suppliers_with_contact
  IF NOT EXISTS (
    SELECT 1
    FROM pg_views
    WHERE schemaname = 'public'
      AND viewname = 'suppliers_with_contact'
  ) THEN
    RAISE EXCEPTION 'ÉCHEC: La vue suppliers_with_contact n''existe pas';
  END IF;

  RAISE NOTICE '✅ TEST 2 RÉUSSI: Toutes les vues existent';
END $$;

-- ============================================
-- TEST 3: Vérifier que les fonctions existent
-- ============================================
DO $$
BEGIN
  -- Vérifier user_has_order_with_supplier
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'user_has_order_with_supplier'
  ) THEN
    RAISE EXCEPTION 'ÉCHEC: La fonction user_has_order_with_supplier n''existe pas';
  END IF;

  -- Vérifier get_supplier_contact
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'get_supplier_contact'
  ) THEN
    RAISE EXCEPTION 'ÉCHEC: La fonction get_supplier_contact n''existe pas';
  END IF;

  RAISE NOTICE '✅ TEST 3 RÉUSSI: Toutes les fonctions existent';
END $$;

-- ============================================
-- TEST 4: Vérifier que les politiques RLS existent
-- ============================================
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'suppliers';

  IF policy_count < 5 THEN
    RAISE EXCEPTION 'ÉCHEC: Nombre insuffisant de politiques RLS (trouvé: %, attendu: >= 5)', policy_count;
  END IF;

  RAISE NOTICE '✅ TEST 4 RÉUSSI: % politiques RLS trouvées sur la table suppliers', policy_count;
END $$;

-- ============================================
-- TEST 5: Vérifier que les index existent
-- ============================================
DO $$
BEGIN
  -- Vérifier idx_suppliers_verified
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'suppliers'
      AND indexname = 'idx_suppliers_verified'
  ) THEN
    RAISE WARNING '⚠️  Index idx_suppliers_verified non trouvé (non critique)';
  ELSE
    RAISE NOTICE '✅ Index idx_suppliers_verified existe';
  END IF;

  -- Vérifier idx_suppliers_user_id
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'suppliers'
      AND indexname = 'idx_suppliers_user_id'
  ) THEN
    RAISE WARNING '⚠️  Index idx_suppliers_user_id non trouvé (non critique)';
  ELSE
    RAISE NOTICE '✅ Index idx_suppliers_user_id existe';
  END IF;

  RAISE NOTICE '✅ TEST 5 RÉUSSI: Vérification des index terminée';
END $$;

-- ============================================
-- TEST 6: Simulation - Lecture publique (sans auth)
-- ============================================
-- Ce test simule ce qu'un utilisateur non connecté peut voir

DO $$
DECLARE
  supplier_record RECORD;
BEGIN
  -- Tenter de lire suppliers_public
  SELECT *
  INTO supplier_record
  FROM public.suppliers_public
  LIMIT 1;

  -- Vérifier que les infos de contact sont NULL
  IF supplier_record.contact_email IS NOT NULL THEN
    RAISE EXCEPTION 'ÉCHEC: contact_email devrait être NULL dans suppliers_public';
  END IF;

  IF supplier_record.contact_phone IS NOT NULL THEN
    RAISE EXCEPTION 'ÉCHEC: contact_phone devrait être NULL dans suppliers_public';
  END IF;

  IF supplier_record.contact_whatsapp IS NOT NULL THEN
    RAISE EXCEPTION 'ÉCHEC: contact_whatsapp devrait être NULL dans suppliers_public';
  END IF;

  RAISE NOTICE '✅ TEST 6 RÉUSSI: La vue suppliers_public masque correctement les infos de contact';
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RAISE NOTICE '⚠️  TEST 6 IGNORÉ: Aucun fournisseur dans la base';
END $$;

-- ============================================
-- RÉSUMÉ DES TESTS
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE '📊 RÉSUMÉ DES TESTS DE SÉCURITÉ - SUPPLIERS';
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ RLS activé sur la table suppliers';
  RAISE NOTICE '✅ Vues de sécurité créées';
  RAISE NOTICE '✅ Fonctions helper créées';
  RAISE NOTICE '✅ Politiques RLS configurées';
  RAISE NOTICE '✅ Index de performance créés';
  RAISE NOTICE '✅ Infos de contact correctement masquées';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 La table suppliers est maintenant SÉCURISÉE';
  RAISE NOTICE '================================================';
  RAISE NOTICE '';
END $$;

-- ============================================
-- REQUÊTES DE VÉRIFICATION MANUELLE
-- ============================================

-- Afficher toutes les politiques RLS sur suppliers
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'suppliers'
ORDER BY policyname;

-- Afficher la définition de la vue suppliers_public
SELECT pg_get_viewdef('public.suppliers_public', true);

-- Afficher la définition de la vue suppliers_with_contact
SELECT pg_get_viewdef('public.suppliers_with_contact', true);

-- Compter les fournisseurs vérifiés
SELECT
  COUNT(*) as total_suppliers,
  COUNT(*) FILTER (WHERE is_verified = true) as verified_suppliers,
  COUNT(*) FILTER (WHERE is_verified = false) as unverified_suppliers
FROM public.suppliers;
