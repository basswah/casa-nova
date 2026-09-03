import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllSettings, upsertSetting, updateAllProductPricesSyp } from '@/features/settings/services/api';
import { withTimeout, DEFAULT_TIMEOUT_MS, HEAVY_TIMEOUT_MS } from '@/lib/supabase-utils';

interface SettingsMap {
  exchangeRate: number;
  storeName: string;
  storeAddress: string;
}

const toSettingsMap = (): Promise<SettingsMap> =>
  withTimeout(
    fetchAllSettings().then((settings) => {
      const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
      return {
        exchangeRate: parseFloat(map.exchange_rate ?? '0'),
        storeName: map.store_name ?? '',
        storeAddress: map.store_address ?? '',
      };
    }),
    DEFAULT_TIMEOUT_MS,
    'Settings fetch'
  );

export const useSettings = () =>
  useQuery<SettingsMap>({
    queryKey: ['settings'],
    queryFn: toSettingsMap,
  });

export const useUpdateExchangeRate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rate: number) => {
      await withTimeout(
        upsertSetting('exchange_rate', rate.toString()),
        DEFAULT_TIMEOUT_MS,
        'Update exchange rate'
      );
      await withTimeout(
        updateAllProductPricesSyp(rate),
        HEAVY_TIMEOUT_MS,
        'Update all product SYP prices'
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['pos-products'] });
    },
  });
};

export const useUpdateStoreName = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      await withTimeout(
        upsertSetting('store_name', name),
        DEFAULT_TIMEOUT_MS,
        'Update store name'
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
};

export const useUpdateStoreAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (address: string) => {
      await withTimeout(
        upsertSetting('store_address', address),
        DEFAULT_TIMEOUT_MS,
        'Update store address'
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
};
