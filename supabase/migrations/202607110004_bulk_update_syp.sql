-- Atomic bulk recompute of SYP prices/costs from USD using the new exchange rate.
-- Replaces N individual client-side UPDATEs (which left prices half-updated on
-- partial failure) with a single atomic UPDATE statement.

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
