-- Purchase Returns (المرتجعات)
-- Returns to suppliers with cash refund — deducted from inventory

CREATE TABLE IF NOT EXISTS purchase_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  po_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit_price_syp NUMERIC(15,0) NOT NULL DEFAULT 0,
  reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE purchase_returns ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
CREATE POLICY "Authenticated users can manage purchase_returns"
  ON purchase_returns
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX idx_purchase_returns_product ON purchase_returns(product_id);
CREATE INDEX idx_purchase_returns_po ON purchase_returns(po_id);
CREATE INDEX idx_purchase_returns_created_at ON purchase_returns(created_at DESC);
