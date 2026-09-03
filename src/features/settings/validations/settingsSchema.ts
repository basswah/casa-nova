import { z } from 'zod';

/** Runtime validation for rows returned from the `settings` table. */
export const settingSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
  updated_at: z.string(),
});

export const settingsSchema = z.array(settingSchema);

export type SettingRow = z.infer<typeof settingSchema>;
