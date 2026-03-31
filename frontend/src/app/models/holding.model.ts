export interface HoldingDetail {
  ticker: string;
  name: string;
  type: 'stock' | 'crypto';
  sector: string;
  description: string;
  quantity: number;
  currentPrice: number;
  currentValue: number;
  avgBuyPrice: number;
  gainLoss: number;
  gainLossPercent: number;
  portfolioPercent: number;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface HoldingHistory {
  ticker: string;
  range: string;
  data: PricePoint[];
}
