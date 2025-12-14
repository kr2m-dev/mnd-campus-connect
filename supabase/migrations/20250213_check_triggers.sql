-- Vérifier les triggers sur la table orders
SELECT
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'orders'
  AND event_object_schema = 'public';

-- Vérifier la valeur actuelle du statut de cette commande spécifique
SELECT id, status, status::TEXT as status_text, user_id, supplier_id, created_at
FROM public.orders
WHERE id = 'b1eb024b-cd5d-4c40-b4cc-b8f2d16a1f72';

-- Vérifier tous les statuts dans la table orders
SELECT DISTINCT status, status::TEXT as status_text, COUNT(*) as count
FROM public.orders
GROUP BY status, status::TEXT;

-- Essayer de mettre à jour directement avec SQL
UPDATE public.orders
SET status = 'preparing'::order_status
WHERE id = 'b1eb024b-cd5d-4c40-b4cc-b8f2d16a1f72'
RETURNING id, status, status::TEXT as status_text;
