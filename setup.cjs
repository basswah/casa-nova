const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const url = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
const serviceKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1];

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const s = createClient(url, serviceKey);

(async () => {
  console.log('🔧 Setting up database...\n');

  // Disable RLS on all tables
  const tables = ['products', 'categories', 'suppliers', 'settings', 'sales_orders', 'sales_order_items', 'purchase_orders', 'purchase_order_items'];
  for (const t of tables) {
    const { error } = await s.rpc('exec_sql', { sql: `ALTER TABLE ${t} DISABLE ROW LEVEL SECURITY;` });
    // RPC might not exist, try direct approach
  }

  // Disable RLS via raw SQL using the service_role client
  // The service_role bypasses RLS so operations work directly
  console.log('1. Inserting default exchange rate...');
  const { error: e1 } = await s.from('settings').insert({ key: 'exchange_rate', value: '12500' });
  if (e1 && e1.code !== '23505') console.log('   Settings error:', e1.message);
  else console.log('   ✅ Done');

  console.log('2. Inserting categories...');
  const { data: cats, error: e2 } = await s.from('categories').insert([
    { name: 'Beverages' }, { name: 'Snacks' }, { name: 'Dairy' }, { name: 'Cleaning' }
  ]).select();
  if (e2) console.log('   Categories error:', e2.message);
  else console.log('   ✅ 4 categories inserted');

  console.log('3. Inserting sample products...');
  const products = [
    { name: 'Cola Can', sku: 'BEV001', category_id: cats?.[0]?.id || null, price_usd: 1.00, price_syp: 12500, cost_usd: 0.70, cost_syp: 8750, quantity: 100 },
    { name: 'Water 1.5L', sku: 'BEV002', category_id: cats?.[0]?.id || null, price_usd: 0.75, price_syp: 9375, cost_usd: 0.50, cost_syp: 6250, quantity: 150 },
    { name: 'Potato Chips', sku: 'SNK001', category_id: cats?.[1]?.id || null, price_usd: 1.25, price_syp: 15625, cost_usd: 0.80, cost_syp: 10000, quantity: 80 },
    { name: 'Milk 1L', sku: 'DRY001', category_id: cats?.[2]?.id || null, price_usd: 1.50, price_syp: 18750, cost_usd: 1.10, cost_syp: 13750, quantity: 40 },
    { name: 'Bread White', sku: 'BAK001', category_id: null, price_usd: 0.50, price_syp: 6250, cost_usd: 0.30, cost_syp: 3750, quantity: 200 },
    { name: 'Dish Soap', sku: 'CLN001', category_id: cats?.[3]?.id || null, price_usd: 2.00, price_syp: 25000, cost_usd: 1.40, cost_syp: 17500, quantity: 60 },
  ];
  const { error: e3 } = await s.from('products').insert(products);
  if (e3) console.log('   Products error:', e3.message);
  else console.log('   ✅ 6 products inserted');

  console.log('\n✅ Database setup complete!');
  console.log('📊 Verify: Open http://localhost:5173/inventory');
})();
