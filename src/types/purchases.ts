export interface Supplier {
  id: string;
  name: string;
  contact_info: string | null;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  supplier_id: string | null;
  supplier?: Supplier;
  order_date: string;
  total_usd: number;
  total_syp: number;
  status: 'pending' | 'received' | 'cancelled';
  created_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  product_id: string | null;
  quantity: number;
  unit_price_usd: number;
  unit_price_syp: number;
  line_total_usd: number;
  line_total_syp: number;
  created_at: string;
}

export type NewPurchaseOrder = Omit<PurchaseOrder, 'id' | 'created_at'>;
export type UpdatePurchaseOrder = Partial<Omit<PurchaseOrder, 'id' | 'created_at'>>;

export type NewPurchaseOrderItem = Omit<PurchaseOrderItem, 'id' | 'created_at'>;
export type UpdatePurchaseOrderItem = Partial<Omit<PurchaseOrderItem, 'id' | 'created_at'>>;

export interface PurchaseNeed {
  id: string;
  name: string;
  quantity: number;
  notes: string | null;
  status: 'pending' | 'ordered';
  created_by: string | null;
  created_at: string;
}

export type NewPurchaseNeed = Omit<PurchaseNeed, 'id' | 'created_at'>;
export type UpdatePurchaseNeed = Partial<Omit<PurchaseNeed, 'id' | 'created_at'>>;

export interface PurchaseReturn {
  id: string;
  product_id: string | null;
  po_id: string | null;
  quantity: number;
  unit_price_usd: number;
  unit_price_syp: number;
  reason: string | null;
  created_by: string | null;
  created_at: string;
}

export type NewPurchaseReturn = Omit<PurchaseReturn, 'id' | 'created_at'>;