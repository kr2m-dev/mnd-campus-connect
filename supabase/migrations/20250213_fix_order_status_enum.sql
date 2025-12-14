-- Vérifier l'enum order_status existant
-- Si l'enum contient des valeurs françaises, il faut le recréer

-- 1. Créer un nouveau type enum avec les bonnes valeurs (en anglais)
DO $$
BEGIN
    -- Supprimer l'ancien type s'il existe
    DROP TYPE IF EXISTS order_status_new CASCADE;

    -- Créer le nouveau type avec les valeurs correctes
    CREATE TYPE order_status_new AS ENUM (
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'completed',
        'cancelled'
    );
END $$;

-- 2. Créer une fonction de conversion pour mapper les anciennes valeurs françaises aux nouvelles valeurs anglaises
CREATE OR REPLACE FUNCTION convert_french_status_to_english(french_status TEXT)
RETURNS order_status_new AS $$
BEGIN
    RETURN CASE french_status
        WHEN 'En attente' THEN 'pending'::order_status_new
        WHEN 'pending' THEN 'pending'::order_status_new
        WHEN 'Confirmée' THEN 'confirmed'::order_status_new
        WHEN 'confirmed' THEN 'confirmed'::order_status_new
        WHEN 'En préparation' THEN 'preparing'::order_status_new
        WHEN 'preparing' THEN 'preparing'::order_status_new
        WHEN 'Prête' THEN 'ready'::order_status_new
        WHEN 'ready' THEN 'ready'::order_status_new
        WHEN 'Complétée' THEN 'completed'::order_status_new
        WHEN 'completed' THEN 'completed'::order_status_new
        WHEN 'Annulée' THEN 'cancelled'::order_status_new
        WHEN 'cancelled' THEN 'cancelled'::order_status_new
        ELSE 'pending'::order_status_new
    END;
END;
$$ LANGUAGE plpgsql;

-- 3. Modifier la colonne status de la table orders pour utiliser le nouveau type
ALTER TABLE public.orders
    ALTER COLUMN status TYPE order_status_new
    USING convert_french_status_to_english(status::TEXT);

-- 4. Supprimer l'ancien type et renommer le nouveau
DROP TYPE IF EXISTS order_status CASCADE;
ALTER TYPE order_status_new RENAME TO order_status;

-- 5. Remettre la valeur par défaut
ALTER TABLE public.orders
    ALTER COLUMN status SET DEFAULT 'pending'::order_status;

-- 6. Nettoyer la fonction de conversion (plus nécessaire)
DROP FUNCTION IF EXISTS convert_french_status_to_english(TEXT);

-- Vérification : afficher toutes les commandes avec leur nouveau statut
-- SELECT id, status FROM public.orders;
