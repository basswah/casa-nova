export interface SalesSummary {
  totalSalesUsd: number;
  transactionCount: number;
}

export interface ProfitSummary {
  profitUsd: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  sku: string | null;
  quantitySold: number;
  totalUsd: number;
  totalSyp: number;
  profitUsd: number;
}

export interface DateRange {
  start: string;
  end: string;
}