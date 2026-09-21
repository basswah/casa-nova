import { z } from 'zod';

// ─── Helpers ────────────────────────────────────────────────
// Supabase/Postgrest returns NUMERIC columns as strings to preserve
// precision.  Use this helper so schemas accept both strings and numbers.
const numeric = z.union([z.string(), z.number()]).pipe(z.coerce.number());

// ─── Inventory ──────────────────────────────────────────────

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  created_at: z.string().optional(),
}).passthrough();

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
  category: categorySchema.nullable().optional(),
  price_usd: numeric,
  price_syp: numeric,
  cost_usd: numeric,
  cost_syp: numeric,
  quantity: z.number(),
  is_consignment: z.boolean().optional().default(false),
  supplier_id: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
}).passthrough();

// ─── POS ────────────────────────────────────────────────────

export const posProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  price_usd: numeric,
  price_syp: numeric,
  quantity: z.number(),
  is_consignment: z.boolean().optional().default(false),
}).passthrough();

// ─── Sales ──────────────────────────────────────────────────

export const salesOrderSchema = z.object({
  id: z.string(),
  order_date: z.string(),
  total_usd: numeric,
  total_syp: numeric,
  payment_method: z.string(),
  status: z.string(),
  created_at: z.string(),
}).passthrough();

export const salesOrderItemSchema = z.object({
  id: z.string(),
  so_id: z.string(),
  product_id: z.string().nullable(),
  quantity: z.number(),
  unit_price_usd: numeric,
  unit_price_syp: numeric,
  line_total_usd: numeric,
  line_total_syp: numeric,
  created_at: z.string(),
}).passthrough();

export const returnRecordSchema = z.object({
  id: z.string(),
  so_id: z.string(),
  product_id: z.string(),
  quantity: z.number(),
  unit_price_usd: numeric,
  unit_price_syp: numeric,
  reason: z.string(),
  created_at: z.string(),
}).passthrough();

// ─── Purchases ──────────────────────────────────────────────

export const supplierSchema = z.object({
  id: z.string(),
  name: z.string(),
  contact_info: z.string().nullable(),
  created_at: z.string(),
}).passthrough();

export const purchaseOrderSchema = z.object({
  id: z.string(),
  supplier_id: z.string().nullable(),
  supplier: supplierSchema.nullable().optional(),
  order_date: z.string(),
  total_usd: numeric,
  total_syp: numeric,
  status: z.string(),
  created_at: z.string(),
}).passthrough();

export const purchaseOrderItemSchema = z.object({
  id: z.string(),
  po_id: z.string(),
  product_id: z.string().nullable(),
  quantity: z.number(),
  unit_price_usd: numeric,
  unit_price_syp: numeric,
  line_total_usd: numeric,
  line_total_syp: numeric,
  created_at: z.string(),
}).passthrough();

export const purchaseNeedSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number(),
  notes: z.string().nullable(),
  status: z.string(),
  created_by: z.string().nullable(),
  created_at: z.string(),
}).passthrough();

export const purchaseReturnSchema = z.object({
  id: z.string(),
  product_id: z.string().nullable(),
  po_id: z.string().nullable(),
  quantity: z.number(),
  unit_price_usd: numeric,
  unit_price_syp: numeric,
  reason: z.string().nullable(),
  created_by: z.string().nullable(),
  created_at: z.string(),
}).passthrough();

// ─── Settings ───────────────────────────────────────────────

export const settingSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
  updated_at: z.string(),
}).passthrough();

// ─── User Management ────────────────────────────────────────

export const profileSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  display_name: z.string().nullable(),
  role: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
}).passthrough();
