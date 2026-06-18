export interface Setting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export type SettingKey = 'exchange_rate' | 'store_name' | 'store_address';

export type AppSettings = Record<SettingKey, string>;