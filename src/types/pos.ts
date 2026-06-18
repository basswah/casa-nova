export interface PosProduct {
  id: string;
  name: string;
  sku: string | null;
  price_usd: number;
  price_syp: number;
  cost_usd: number;
  cost_syp: number;
  quantity: number;
}

export interface CartItem {
  product: PosProduct;
  quantity: number;
  customPriceUsd?: number;
  customPriceSyp?: number;
}

export interface CheckoutPayload {
  total_usd: number;
  total_syp: number;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price_usd: number;
    unit_price_syp: number;
  }>;
}

export interface RpcSaleResponse {
  success: boolean;
  order_id?: string;
  error?: string;
}