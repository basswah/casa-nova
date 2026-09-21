import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  sku: z.string().trim().optional().or(z.literal('')),
  image_url: z.string().nullable().optional(),
  category_id: z.string().uuid().nullable().optional().or(z.literal('')),
  price_usd: z.number({ invalid_type_error: 'Must be a number' }).min(0, 'Must be >= 0'),
  price_syp: z.number().min(0).optional(),
  cost_usd: z.number({ invalid_type_error: 'Must be a number' }).min(0, 'Must be >= 0'),
  cost_syp: z.number().min(0).optional(),
  quantity: z.number({ invalid_type_error: 'Must be a number' }).int().min(0, 'Must be >= 0'),
  is_consignment: z.boolean().optional().default(false),
  supplier_id: z.string().uuid().nullable().optional().or(z.literal('')),
});

export type ProductFormData = z.infer<typeof productSchema>;
