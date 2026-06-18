-- Add created_by to sales_orders
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add created_by to purchase_orders
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
