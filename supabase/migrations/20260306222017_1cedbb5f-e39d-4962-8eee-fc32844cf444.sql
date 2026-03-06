
-- Add shop_slug column to suppliers for unique storefront URLs
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS shop_slug text UNIQUE;

-- Generate slugs for existing suppliers using business_name + short id suffix
UPDATE public.suppliers
SET shop_slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      TRANSLATE(
        LOWER(business_name),
        'àáâãäåèéêëìíîïòóôõöùúûüýÿñç',
        'aaaaaaeeeeiiiioooooouuuuyync'
      ),
      '[^a-z0-9\s-]', '', 'g'
    ),
    '\s+', '-', 'g'
  )
) || '-' || LEFT(id::text, 4)
WHERE shop_slug IS NULL;

-- Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_suppliers_shop_slug ON public.suppliers(shop_slug);

-- Function to auto-generate slug on insert
CREATE OR REPLACE FUNCTION public.generate_supplier_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.shop_slug IS NULL OR NEW.shop_slug = '' THEN
    NEW.shop_slug := LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          TRANSLATE(
            LOWER(NEW.business_name),
            'àáâãäåèéêëìíîïòóôõöùúûüýÿñç',
            'aaaaaaeeeeiiiioooooouuuuyync'
          ),
          '[^a-z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      )
    ) || '-' || LEFT(NEW.id::text, 4);
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger
DROP TRIGGER IF EXISTS trg_generate_supplier_slug ON public.suppliers;
CREATE TRIGGER trg_generate_supplier_slug
  BEFORE INSERT ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_supplier_slug();
