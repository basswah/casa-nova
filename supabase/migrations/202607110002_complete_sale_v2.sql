-- Improved atomic sale RPC.
-- Adds payment_method parameter and records created_by (auth.uid()).
-- Runs as SECURITY INVOKER (default) so auth.uid() resolves to the caller and
-- RLS still applies. The EXCEPTION block guarantees the whole operation is
-- rolled back on any failure (fully atomic).

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

  -- Create the sales order (attributed to the current user)
  INSERT INTO sales_orders (total_usd, total_syp, payment_method, status, created_by)
  VALUES (p_total_usd, p_total_syp, COALESCE(p_payment_method, 'cash'), 'completed', auth.uid())
  RETURNING id INTO v_order_id;

  -- Process each item
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    product_id uuid,
    quantity integer,
    unit_price_usd numeric,
    unit_price_syp numeric
  ) LOOP
    -- Lock the product row to prevent concurrent oversell
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

    -- Create sales order item
    INSERT INTO sales_order_items (
      so_id, product_id, quantity, unit_price_usd, unit_price_syp
    ) VALUES (
      v_order_id, v_item.product_id, v_item.quantity, v_item.unit_price_usd, v_item.unit_price_syp
    );

    -- Atomic stock deduction
    v_new_quantity := v_product.quantity - v_item.quantity;
    UPDATE products SET quantity = v_new_quantity WHERE id = v_item.product_id;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'order_id', v_order_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
