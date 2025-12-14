-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Suppliers can view orders for their products
CREATE POLICY "Suppliers can view their orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  supplier_id IN (
    SELECT id FROM public.suppliers WHERE user_id = auth.uid()
  )
);

-- Policy: Users can create orders (automatically set user_id)
CREATE POLICY "Users can create orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own pending orders
CREATE POLICY "Users can update their own pending orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

-- Policy: Suppliers can update the status of their orders
CREATE POLICY "Suppliers can update status of their orders"
ON public.orders
FOR UPDATE
TO authenticated
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

-- Enable RLS on order_items table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view items from their own orders
CREATE POLICY "Users can view their own order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders WHERE user_id = auth.uid()
  )
);

-- Policy: Suppliers can view items from their orders
CREATE POLICY "Suppliers can view their order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders
    WHERE supplier_id IN (
      SELECT id FROM public.suppliers WHERE user_id = auth.uid()
    )
  )
);

-- Policy: Users can insert order items for their own orders
CREATE POLICY "Users can create order items for their orders"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (
  order_id IN (
    SELECT id FROM public.orders WHERE user_id = auth.uid()
  )
);
