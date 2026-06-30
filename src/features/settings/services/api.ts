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

export const updateAllProductPricesSyp = async (newRate: number): Promise<number> => {
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id, price_usd, cost_usd');

  if (fetchError) throw new Error(fetchError.message);
  if (!products || products.length === 0) return 0;

  const updates = products.map((p) =>
    supabase
      .from('products')
      .update({
        price_syp: Math.round((p.price_usd || 0) * newRate),
        cost_syp: Math.round((p.cost_usd || 0) * newRate),
      })
      .eq('id', p.id)
  );

  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    throw new Error(errors[0].error!.message);
  }
  return products.length;
};
