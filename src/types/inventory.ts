export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string | null;
  image_url?: string | null;
  category_id: string | null;
  category?: Category;
  price_usd: number;
  price_syp: number;
  cost_usd: number;
  cost_syp: number;
  quantity: number;
  is_consignment: boolean;
  supplier_id: string | null;
  created_at: string;
  updated_at: string;
}

export type NewProduct = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>;
export type UpdateProduct = Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>>;