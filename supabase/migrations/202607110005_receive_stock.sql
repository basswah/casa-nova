-- Atomic stock adjustment with weighted-average cost recompute.
-- Replaces the previous read-then-write (racy, non-atomic) flow.
-- Locks the product row (FOR UPDATE):
--   * p_quantity > 0  => stock receipt (recompute weighted-average cost)
--   * p_quantity < 0  => stock deduction (e.g. supplier returns), keeps cost
-- Never lets stock drop below zero.

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

  -- Recompute weighted-average cost only on receipts with a cost supplied.
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
