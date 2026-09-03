import { supabase } from '@/lib/supabase';
import { toSingle, withTimeout, DEFAULT_TIMEOUT_MS, HEAVY_TIMEOUT_MS } from '@/lib/supabase-utils';
import { settingsSchema, settingSchema } from '@/features/settings/validations/settingsSchema';
import type { Setting } from '@/types/settings';

export const fetchAllSettings = async (): Promise<Setting[]> => {
  const { data, error } = await withTimeout(
    supabase.from('settings').select('*'),
    DEFAULT_TIMEOUT_MS,
    'Fetch settings',
  );
  if (error) throw new Error(error.message);
  const parsed = settingsSchema.safeParse(data);
  if (!parsed.success) throw new Error('Malformed settings data');
  return parsed.data as Setting[];
};

export const upsertSetting = async (key: string, value: string): Promise<Setting> => {
  const { data, error } = await withTimeout(
    supabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      .select()
      .single(),
    DEFAULT_TIMEOUT_MS,
    'Upsert setting',
  );
  if (error) throw new Error(error.message);
  return toSingle(data, settingSchema);
};

export const updateAllProductPricesSyp = async (newRate: number): Promise<number> => {
  // Single atomic UPDATE — no partial updates on failure.
  const { data, error } = await withTimeout(
    supabase.rpc('bulk_update_syp_prices', { p_rate: newRate }),
    HEAVY_TIMEOUT_MS,
    'Bulk update SYP prices',
  );
  if (error) throw new Error(error.message);
  return (data as number) ?? 0;
};
