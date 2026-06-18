export interface SalesSummary {
  totalSalesUsd: number;
  totalSalesSyp: number;
  transactionCount: number;
}

export interface ProfitSummary {
  profitUsd: number;
  profitSyp: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  sku: string | null;
  quantitySold: number;
  totalUsd: number;
  totalSyp: number;
}

export interface DateRange {
  start: string;
  end: string;
}