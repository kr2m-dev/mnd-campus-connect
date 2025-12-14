-- Supprimer et recréer la fonction notify_order_status_change avec le bon type

-- 1. Supprimer tous les triggers qui pourraient exister
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
DROP TRIGGER IF EXISTS notify_on_order_status_change ON public.orders;

-- 2. Supprimer la fonction existante avec CASCADE pour supprimer les dépendances
DROP FUNCTION IF EXISTS notify_order_status_change() CASCADE;

-- 3. Recréer la fonction avec le bon type pour status_label (TEXT au lieu d'order_status)
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
    status_label TEXT;  -- Important : TEXT, pas order_status !
    user_full_name TEXT;
BEGIN
    -- Convertir le statut en label français
    status_label := CASE NEW.status::TEXT  -- Cast explicite vers TEXT
        WHEN 'pending' THEN 'En attente'
        WHEN 'confirmed' THEN 'Confirmée'
        WHEN 'preparing' THEN 'En préparation'
        WHEN 'ready' THEN 'Prête'
        WHEN 'completed' THEN 'Terminée'
        WHEN 'cancelled' THEN 'Annulée'
        ELSE NEW.status::TEXT
    END;

    -- Récupérer le nom de l'utilisateur
    SELECT full_name INTO user_full_name
    FROM public.profiles
    WHERE user_id = NEW.user_id;

    -- Créer une notification pour l'utilisateur
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
        NEW.user_id,
        'Mise à jour de commande',
        format('Votre commande #%s est maintenant : %s', LEFT(NEW.id::TEXT, 8), status_label),
        'order',
        format('/orders/%s', NEW.id)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Recréer le trigger
CREATE TRIGGER on_order_status_change
    AFTER UPDATE OF status ON public.orders
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION notify_order_status_change();

-- Test : essayer de mettre à jour une commande
UPDATE public.orders
SET status = 'confirmed'::order_status
WHERE id = 'b1eb024b-cd5d-4c40-b4cc-b8f2d16a1f72'
RETURNING id, status;
