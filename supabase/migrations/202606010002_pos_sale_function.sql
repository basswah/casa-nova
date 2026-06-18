-- Function to complete a sale atomically
CREATE OR REPLACE FUNCTION complete_sale(
  p_total_usd numeric,
  p_total_syp numeric,
  p_items jsonb
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
  -- Create the sales order
  INSERT INTO sales_orders (total_usd, total_syp, payment_method, status)
  VALUES (p_total_usd, p_total_syp, 'cash', 'completed')
  RETURNING id INTO v_order_id;

  -- Process each item
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    product_id uuid,
    quantity integer,
    unit_price_usd numeric,
    unit_price_syp numeric
  ) LOOP
    -- Check stock availability
    SELECT * INTO v_product FROM products WHERE id = v_item.product_id FOR UPDATE;
    
    IF v_product IS NULL THEN
      RAISE EXCEPTION 'Product % not found', v_item.product_id;
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

    -- Deduct stock
    v_new_quantity := v_product.quantity - v_item.quantity;
    UPDATE products SET quantity = v_new_quantity WHERE id = v_item.product_id;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;