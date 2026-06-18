import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function runMigration(filePath) {
  const sql = readFileSync(resolve(__dirname, filePath), 'utf-8');
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const stmt of statements) {
    const { error } = await supabase.rpc('pg_query', { query: stmt + ';' }).single();
    if (error && !error.message.includes('already exists')) {
      console.error(`Error executing:\n${stmt}\n${error.message}`);
    } else {
      console.log('✓', stmt.slice(0, 60) + '...');
    }
  }
}

async function createAdminProfile() {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: '1474626c-5abb-454e-a915-530b7a675ef9',
      email: 'bassel@casanova.com',
      display_name: 'bassel',
      role: 'admin',
      is_active: true,
    }, { onConflict: 'id' });

  if (error) {
    console.error('Profile insert error:', error.message);
  } else {
    console.log('✓ Admin profile created with role=admin');
  }
}

// Try direct insert first (in case table already exists)
createAdminProfile();
