-- Atomic customer-return RPC.
-- Replaces the previous multi-step client-side logic (insert returns -> restore
-- stock -> adjust order totals -> adjust order items -> maybe cancel order),
-- which had no rollback on partial failure. Everything now runs in a single
-- transaction; any error rolls the whole thing back.
--
-- p_items: jsonb array of
--   { item_id uuid, product_id uuid, quantity int, unit_price_usd numeric, unit_price_syp numeric }

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

    -- Record the return
    INSERT INTO returns (so_id, product_id, quantity, unit_price_usd, unit_price_syp, reason)
    VALUES (p_so_id, v_item.product_id, v_item.quantity, v_item.unit_price_usd, v_item.unit_price_syp, COALESCE(p_reason, ''));

    -- Restore stock (lock the row first)
    UPDATE products
    SET quantity = quantity + v_item.quantity
    WHERE id = v_item.product_id;

    -- Reduce the matching order line, never below zero
    UPDATE sales_order_items
    SET quantity = GREATEST(0, quantity - v_item.quantity)
    WHERE id = v_item.item_id;

    v_returned_usd := v_returned_usd + v_item.unit_price_usd * v_item.quantity;
    v_returned_syp := v_returned_syp + v_item.unit_price_syp * v_item.quantity;
  END LOOP;

  -- Reduce the order totals, never below zero
  SELECT total_usd, total_syp INTO v_order FROM sales_orders WHERE id = p_so_id FOR UPDATE;
  IF v_order IS NOT NULL THEN
    UPDATE sales_orders
    SET total_usd = GREATEST(0, v_order.total_usd - v_returned_usd),
        total_syp = GREATEST(0, v_order.total_syp - v_returned_syp)
    WHERE id = p_so_id;
  END IF;

  -- Cancel the order if nothing is left on it
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
