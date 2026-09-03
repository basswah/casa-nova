-- Add consignment settlement tracking to sales_order_items
-- This allows tracking which consignment sales have been settled with the supplier

ALTER TABLE sales_order_items
ADD COLUMN IF NOT EXISTS is_settled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS settled_by UUID REFERENCES auth.users(id);

COMMENT ON COLUMN sales_order_items.is_settled IS 'Whether this consignment sale has been settled with the supplier';
COMMENT ON COLUMN sales_order_items.settled_at IS 'When the consignment sale was settled with the supplier';
COMMENT ON COLUMN sales_order_items.settled_by IS 'Who settled this consignment sale';

-- Create index for faster queries on consignment settlement status
CREATE INDEX IF NOT EXISTS idx_sales_order_items_consignment_settled
ON sales_order_items(product_id)
WHERE is_settled = false;
