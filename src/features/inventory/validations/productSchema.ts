import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category_id: z.string().nullable().optional(),
  price_usd: z.number().min(0, 'Must be >= 0'),
  cost_usd: z.number().min(0, 'Must be >= 0'),
  quantity: z.number().int().min(0, 'Must be >= 0'),
});

export type ProductFormData = z.infer<typeof productSchema>;
