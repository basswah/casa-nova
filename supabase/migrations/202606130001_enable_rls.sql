-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read and write
CREATE POLICY "authenticated_all_settings" ON settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all_products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all_categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all_suppliers" ON suppliers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all_sales_orders" ON sales_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all_sales_order_items" ON sales_order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all_purchase_orders" ON purchase_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all_purchase_order_items" ON purchase_order_items FOR ALL USING (auth.role() = 'authenticated');
