-- Purchase Needs (Shortages / النواقص)
-- Manual shopping list — no inventory impact

CREATE TABLE IF NOT EXISTS purchase_needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ordered')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE purchase_needs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
CREATE POLICY "Authenticated users can manage purchase_needs"
  ON purchase_needs
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Index for faster queries
CREATE INDEX idx_purchase_needs_status ON purchase_needs(status);
CREATE INDEX idx_purchase_needs_created_at ON purchase_needs(created_at DESC);
