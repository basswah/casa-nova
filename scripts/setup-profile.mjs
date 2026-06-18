import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zhdvyvazcatflllvvwno.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceKey, {
  db: { schema: 'public' },
});

async function run() {
  // Check if profiles table exists
  const { data: tables, error: tableError } = await supabase
    .from('pg_catalog.pg_tables')
    .select('tablename')
    .eq('schemaname', 'public')
    .eq('tablename', 'profiles');

  if (tableError) {
    console.log('Table check error:', tableError.message);
    console.log('Trying direct profile insert...');
  }

  // Try to upsert the admin profile
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: '1474626c-5abb-454e-a915-530b7a675ef9',
      email: 'bassel@casanova.com',
      display_name: 'bassel',
      role: 'admin',
      is_active: true,
    }, { onConflict: 'id' })
    .select();

  if (error) {
    console.log('❌ Profile insert failed:', error.message);
    console.log('\nYou need to run the SQL migration first in Supabase Dashboard:');
    console.log('Open https://supabase.com → Your Project → SQL Editor');
    console.log('Then paste the contents of: supabase/migrations/202606130002_profiles.sql');
    console.log('\nAfter running the migration, run this script again.');
  } else {
    console.log('✅ Admin profile created successfully:', JSON.stringify(data, null, 2));
  }
}

run();
