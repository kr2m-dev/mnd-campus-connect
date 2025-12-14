-- Corriger le trigger notify_order_status_change pour utiliser first_name et last_name au lieu de full_name

CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
    status_label TEXT;
    user_first_name TEXT;
    user_last_name TEXT;
BEGIN
    -- Convertir le statut en label français
    status_label := CASE NEW.status::TEXT
        WHEN 'pending' THEN 'En attente'
        WHEN 'confirmed' THEN 'Confirmée'
        WHEN 'preparing' THEN 'En préparation'
        WHEN 'ready' THEN 'Prête'
        WHEN 'completed' THEN 'Terminée'
        WHEN 'cancelled' THEN 'Annulée'
        ELSE NEW.status::TEXT
    END;

    -- Récupérer le nom de l'utilisateur (first_name et last_name séparés)
    SELECT first_name, last_name INTO user_first_name, user_last_name
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
