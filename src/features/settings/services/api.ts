import { supabase } from '@/lib/supabase';
import { toArray, toSingle } from '@/lib/supabase-utils';
import type { Setting } from '@/types/settings';

export const fetchAllSettings = async (): Promise<Setting[]> => {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) throw new Error(error.message);
  return toArray<Setting>(data);
};

export const upsertSetting = async (key: string, value: string): Promise<Setting> => {
  const { data, error } = await supabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toSingle<Setting>(data);
};
