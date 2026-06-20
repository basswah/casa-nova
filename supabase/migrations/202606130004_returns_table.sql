CREATE TABLE IF NOT EXISTS returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    so_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    unit_price_syp NUMERIC(10,2) NOT NULL DEFAULT 0,
    reason TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all_returns" ON returns
  FOR ALL USING (auth.role() = 'authenticated');
