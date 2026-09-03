-- Add consignment goods columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_consignment BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL;

-- Index for faster filtering by consignment status
CREATE INDEX IF NOT EXISTS idx_products_is_consignment ON products(is_consignment);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
