-- ============================================================
-- Table : commandes_whatsapp
-- Enregistre chaque commande passée via le bouton WhatsApp
-- ============================================================

CREATE TABLE IF NOT EXISTS public.commandes_whatsapp (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id     uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  product_id      uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name    text NOT NULL,
  product_price   numeric(10,2) NOT NULL,
  quantity        integer NOT NULL DEFAULT 1,
  customer_name   text NOT NULL,
  customer_phone  text NOT NULL,
  customer_location text NOT NULL,
  statut          text NOT NULL DEFAULT 'en_cours'
                    CHECK (statut IN ('en_cours', 'complet', 'annule')),
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Index pour les requêtes fournisseur
CREATE INDEX IF NOT EXISTS commandes_whatsapp_supplier_id_idx
  ON public.commandes_whatsapp(supplier_id);

CREATE INDEX IF NOT EXISTS commandes_whatsapp_created_at_idx
  ON public.commandes_whatsapp(created_at DESC);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.commandes_whatsapp ENABLE ROW LEVEL SECURITY;

-- N'importe qui peut créer une commande (même non connecté → user_id NULL)
CREATE POLICY "Tout le monde peut créer une commande whatsapp"
  ON public.commandes_whatsapp
  FOR INSERT
  WITH CHECK (true);

-- Le fournisseur voit uniquement ses propres commandes
CREATE POLICY "Fournisseur voit ses commandes whatsapp"
  ON public.commandes_whatsapp
  FOR SELECT
  USING (
    supplier_id IN (
      SELECT id FROM public.suppliers WHERE user_id = auth.uid()
    )
  );

-- Le fournisseur peut mettre à jour le statut de ses commandes
CREATE POLICY "Fournisseur met à jour le statut de ses commandes"
  ON public.commandes_whatsapp
  FOR UPDATE
  USING (
    supplier_id IN (
      SELECT id FROM public.suppliers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    supplier_id IN (
      SELECT id FROM public.suppliers WHERE user_id = auth.uid()
    )
  );
