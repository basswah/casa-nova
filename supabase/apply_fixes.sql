-- ============================================================
-- Casa Nova POS — إصلاحات جاهزة للتطبيق على قاعدة البيانات
-- انسخ هذا الملف كاملاً في: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- (1) إصلاح recursion في RLS للـ profiles + دالة is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

DROP POLICY IF EXISTS "profiles_read_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

CREATE POLICY "profiles_read_admin" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- (2) RPC البيع الذرّي (complete_sale v2)
CREATE OR REPLACE FUNCTION complete_sale(
  p_total_usd numeric,
  p_total_syp numeric,
  p_items jsonb,
  p_payment_method text DEFAULT 'cash'
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_id uuid;
  v_item record;
  v_product record;
  v_new_quantity integer;
BEGIN
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cannot complete a sale with no items';
  END IF;

  INSERT INTO sales_orders (total_usd, total_syp, payment_method, status, created_by)
  VALUES (p_total_usd, p_total_syp, COALESCE(p_payment_method, 'cash'), 'completed', auth.uid())
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    product_id uuid,
    quantity integer,
    unit_price_usd numeric,
    unit_price_syp numeric
  ) LOOP
    SELECT * INTO v_product FROM products WHERE id = v_item.product_id FOR UPDATE;

    IF v_product IS NULL THEN
      RAISE EXCEPTION 'Product % not found', v_item.product_id;
    END IF;

    IF v_item.quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity for product %', v_product.name;
    END IF;

    IF v_product.quantity < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_product.name;
    END IF;

    INSERT INTO sales_order_items (
      so_id, product_id, quantity, unit_price_usd, unit_price_syp
    ) VALUES (
      v_order_id, v_item.product_id, v_item.quantity, v_item.unit_price_usd, v_item.unit_price_syp
    );

    v_new_quantity := v_product.quantity - v_item.quantity;
    UPDATE products SET quantity = v_new_quantity WHERE id = v_item.product_id;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'order_id', v_order_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- (3) RPC المرتجعات الذرّي (create_return)
CREATE OR REPLACE FUNCTION create_return(
  p_so_id uuid,
  p_reason text,
  p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_item record;
  v_returned_usd numeric := 0;
  v_returned_syp numeric := 0;
  v_order record;
  v_active_count integer;
BEGIN
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'No items to return';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    item_id uuid,
    product_id uuid,
    quantity integer,
    unit_price_usd numeric,
    unit_price_syp numeric
  ) LOOP
    IF v_item.quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid return quantity';
    END IF;

    INSERT INTO returns (so_id, product_id, quantity, unit_price_usd, unit_price_syp, reason)
    VALUES (p_so_id, v_item.product_id, v_item.quantity, v_item.unit_price_usd, v_item.unit_price_syp, COALESCE(p_reason, ''));

    UPDATE products
    SET quantity = quantity + v_item.quantity
    WHERE id = v_item.product_id;

    UPDATE sales_order_items
    SET quantity = GREATEST(0, quantity - v_item.quantity)
    WHERE id = v_item.item_id;

    v_returned_usd := v_returned_usd + v_item.unit_price_usd * v_item.quantity;
    v_returned_syp := v_returned_syp + v_item.unit_price_syp * v_item.quantity;
  END LOOP;

  SELECT total_usd, total_syp INTO v_order FROM sales_orders WHERE id = p_so_id FOR UPDATE;
  IF v_order IS NOT NULL THEN
    UPDATE sales_orders
    SET total_usd = GREATEST(0, v_order.total_usd - v_returned_usd),
        total_syp = GREATEST(0, v_order.total_syp - v_returned_syp)
    WHERE id = p_so_id;
  END IF;

  SELECT COUNT(*) INTO v_active_count
  FROM sales_order_items
  WHERE so_id = p_so_id AND quantity > 0;

  IF v_active_count = 0 THEN
    UPDATE sales_orders
    SET status = 'cancelled', total_usd = 0, total_syp = 0
    WHERE id = p_so_id;
  END IF;

  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- (4) RPC تحديث أسعار SYP الجماعي (bulk_update_syp_prices) — خطأ سعر الصرف
CREATE OR REPLACE FUNCTION bulk_update_syp_prices(p_rate numeric)
RETURNS integer
LANGUAGE sql
AS $$
  UPDATE products
  SET
    price_syp = ROUND(COALESCE(price_usd, 0) * p_rate),
    cost_syp  = ROUND(COALESCE(cost_usd, 0) * p_rate);
  SELECT count(*)::integer FROM products;
$$;

-- (5) RPC استلام/خصم المخزون الذرّي (receive_stock)
CREATE OR REPLACE FUNCTION receive_stock(
  p_product_id uuid,
  p_quantity integer,
  p_unit_cost_usd numeric,
  p_unit_cost_syp numeric
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_product record;
  v_total_qty integer;
  v_new_cost_usd numeric;
  v_new_cost_syp numeric;
BEGIN
  IF p_quantity = 0 THEN
    RAISE EXCEPTION 'Quantity must be non-zero';
  END IF;

  SELECT * INTO v_product FROM products WHERE id = p_product_id FOR UPDATE;
  IF v_product IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  v_total_qty := GREATEST(0, v_product.quantity + p_quantity);

  IF p_quantity > 0 AND (p_unit_cost_usd > 0 OR p_unit_cost_syp > 0) AND v_total_qty > 0 THEN
    v_new_cost_usd := (COALESCE(v_product.cost_usd, 0) * GREATEST(0, v_product.quantity)
                       + p_unit_cost_usd * p_quantity) / v_total_qty;
    v_new_cost_syp := (COALESCE(v_product.cost_syp, 0) * GREATEST(0, v_product.quantity)
                       + p_unit_cost_syp * p_quantity) / v_total_qty;
  ELSE
    v_new_cost_usd := COALESCE(v_product.cost_usd, 0);
    v_new_cost_syp := COALESCE(v_product.cost_syp, 0);
  END IF;

  UPDATE products
  SET
    quantity  = v_total_qty,
    cost_usd  = ROUND(v_new_cost_usd, 2),
    cost_syp  = ROUND(v_new_cost_syp, 0)
  WHERE id = p_product_id;

  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
