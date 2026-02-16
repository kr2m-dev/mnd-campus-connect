
CREATE OR REPLACE FUNCTION public.admin_verify_supplier(target_supplier_id uuid, new_is_verified boolean)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id UUID;
  is_user_admin BOOLEAN;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT is_admin(current_user_id) INTO is_user_admin;

  IF NOT is_user_admin THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  UPDATE public.suppliers
  SET
    is_verified = new_is_verified,
    updated_at = NOW()
  WHERE id = target_supplier_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Supplier not found';
  END IF;

  INSERT INTO public.admin_audit_log (admin_user_id, action, target_type, target_id, details)
  VALUES (
    current_user_id,
    CASE WHEN new_is_verified THEN 'verify_supplier' ELSE 'unverify_supplier' END,
    'supplier',
    target_supplier_id,
    jsonb_build_object('is_verified', new_is_verified)
  );

  RETURN TRUE;
END;
$function$;
