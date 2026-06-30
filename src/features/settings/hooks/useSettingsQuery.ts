import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllSettings, upsertSetting, updateAllProductPricesSyp } from '@/features/settings/services/api';

interface SettingsMap {
  exchangeRate: number;
  storeName: string;
  storeAddress: string;
}

const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    )
  ]);
};

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
    15000,
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
        15000,
        'Update exchange rate'
      );
      await withTimeout(
        updateAllProductPricesSyp(rate),
        30000,
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
        15000,
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
        15000,
        'Update store address'
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
};
