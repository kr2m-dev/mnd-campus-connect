-- Convertir les données existantes de français vers anglais
-- Ce script met à jour toutes les commandes avec des statuts en français

-- 1. D'abord, désactiver temporairement le RLS pour pouvoir tout mettre à jour
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- 2. Ajouter une colonne temporaire de type text
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status_temp TEXT;

-- 3. Copier les valeurs converties dans la colonne temporaire
UPDATE public.orders
SET status_temp = CASE status::TEXT
    WHEN 'En attente' THEN 'pending'
    WHEN 'pending' THEN 'pending'
    WHEN 'Confirmée' THEN 'confirmed'
    WHEN 'confirmed' THEN 'confirmed'
    WHEN 'En préparation' THEN 'preparing'
    WHEN 'preparing' THEN 'preparing'
    WHEN 'Prête' THEN 'ready'
    WHEN 'ready' THEN 'ready'
    WHEN 'Complétée' THEN 'completed'
    WHEN 'completed' THEN 'completed'
    WHEN 'Annulée' THEN 'cancelled'
    WHEN 'cancelled' THEN 'cancelled'
    ELSE 'pending'
END;

-- 4. Supprimer l'ancienne colonne status
ALTER TABLE public.orders DROP COLUMN status;

-- 5. Renommer la colonne temporaire en status
ALTER TABLE public.orders RENAME COLUMN status_temp TO status;

-- 6. Convertir la colonne en type order_status avec la valeur par défaut
ALTER TABLE public.orders
    ALTER COLUMN status TYPE order_status USING status::order_status,
    ALTER COLUMN status SET DEFAULT 'pending'::order_status,
    ALTER COLUMN status SET NOT NULL;

-- 7. Réactiver le RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Vérification : afficher toutes les commandes avec leur nouveau statut
SELECT id, status, created_at FROM public.orders ORDER BY created_at DESC LIMIT 10;
