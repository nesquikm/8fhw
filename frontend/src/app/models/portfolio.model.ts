export interface Holding {
  ticker: string;
  name: string;
  type: 'stock' | 'crypto';
  quantity: number;
  currentPrice: number;
  currentValue: number;
  avgBuyPrice: number;
  gainLoss: number;
  gainLossPercent: number;
  portfolioPercent: number;
}

export interface Portfolio {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  holdings: Holding[];
}

export interface GroupedHoldings {
  stocks: Holding[];
  crypto: Holding[];
}
