export interface SalesOrder {
  id: string;
  order_date: string;
  total_usd: number;
  total_syp: number;
  payment_method: 'cash';
  status: 'completed' | 'cancelled';
  created_at: string;
}

export interface SalesOrderItem {
  id: string;
  so_id: string;
  product_id: string | null;
  quantity: number;
  unit_price_usd: number;
  unit_price_syp: number;
  line_total_usd: number;
  line_total_syp: number;
  created_at: string;
}

export type NewSalesOrder = Omit<SalesOrder, 'id' | 'created_at'>;
export type UpdateSalesOrder = Partial<Omit<SalesOrder, 'id' | 'created_at'>>;

export type NewSalesOrderItem = Omit<SalesOrderItem, 'id' | 'created_at' | 'line_total_usd' | 'line_total_syp'>;
export type UpdateSalesOrderItem = Partial<Omit<SalesOrderItem, 'id' | 'created_at'>>;

export interface ReturnItem {
  product_id: string;
  quantity: number;
  unit_price_usd: number;
  unit_price_syp: number;
}

export interface BatchReturnInput {
  so_id: string;
  reason: string;
  items: ReturnItem[];
}

export interface ReturnRecord {
  id: string;
  so_id: string;
  product_id: string;
  quantity: number;
  unit_price_usd: number;
  unit_price_syp: number;
  reason: string;
  created_at: string;
}

export type NewReturn = Omit<ReturnRecord, 'id' | 'created_at'>;