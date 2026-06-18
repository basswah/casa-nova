-- Enable UUID extension if not already
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Settings table for manual configurations like exchange rate
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    price_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    price_syp NUMERIC(10,2) NOT NULL DEFAULT 0,
    cost_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    cost_syp NUMERIC(10,2) NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_syp NUMERIC(12,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, received, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase order items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    unit_price_syp NUMERIC(10,2) NOT NULL DEFAULT 0,
    line_total_usd NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price_usd) STORED,
    line_total_syp NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price_syp) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales orders table
CREATE TABLE IF NOT EXISTS sales_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_syp NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'cash', -- cash only for now
    status TEXT NOT NULL DEFAULT 'completed', -- completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales order items table
CREATE TABLE IF NOT EXISTS sales_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    so_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    unit_price_syp NUMERIC(10,2) NOT NULL DEFAULT 0,
    line_total_usd NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price_usd) STORED,
    line_total_syp NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price_syp) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a default exchange rate setting if not exists
INSERT INTO settings (key, value) VALUES ('exchange_rate', '12500') ON CONFLICT (key) DO NOTHING;
