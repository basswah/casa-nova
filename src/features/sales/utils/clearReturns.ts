import { supabase } from '@/lib/supabase';

export const clearAllReturns = async () => {
  const { error } = await supabase.from('returns').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw new Error(error.message);
  return true;
};
