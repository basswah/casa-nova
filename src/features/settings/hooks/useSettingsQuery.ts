import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllSettings, upsertSetting } from '@/features/settings/services/api';

interface SettingsMap {
  exchangeRate: number;
  storeName: string;
  storeAddress: string;
}

const toSettingsMap = (): Promise<SettingsMap> =>
  fetchAllSettings().then((settings) => {
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    return {
      exchangeRate: parseFloat(map.exchange_rate ?? '0'),
      storeName: map.store_name ?? '',
      storeAddress: map.store_address ?? '',
    };
  });

export const useSettings = () =>
  useQuery<SettingsMap>({
    queryKey: ['settings'],
    queryFn: toSettingsMap,
  });

export const useUpdateExchangeRate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rate: number) => {
      await upsertSetting('exchange_rate', rate.toString());
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
};

export const useUpdateStoreName = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      await upsertSetting('store_name', name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
};

export const useUpdateStoreAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (address: string) => {
      await upsertSetting('store_address', address);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
};
