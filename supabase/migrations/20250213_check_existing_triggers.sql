-- Script pour vérifier les triggers existants sur auth.users et les fonctions de création de profil

-- 1. Lister tous les triggers sur auth.users
SELECT
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- 2. Lister toutes les fonctions qui contiennent 'profile' ou 'user' dans leur nom
SELECT
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE (p.proname ILIKE '%profile%' OR p.proname ILIKE '%user%')
  AND n.nspname = 'public'
ORDER BY p.proname;

-- 3. Vérifier si la table profiles existe et sa structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Vérifier les triggers existants qui insèrent dans profiles
SELECT
    t.trigger_name,
    t.event_manipulation,
    t.action_timing,
    t.event_object_table,
    pg_get_triggerdef(tr.oid) as trigger_definition
FROM information_schema.triggers t
JOIN pg_trigger tr ON tr.tgname = t.trigger_name
WHERE t.action_statement LIKE '%profiles%'
   OR pg_get_triggerdef(tr.oid) LIKE '%profiles%'
ORDER BY t.trigger_name;
