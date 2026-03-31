import { createGenerator, type GeneratorOptions } from '../data/generator.js';
import { getPortfolio, ALL_ASSETS } from './portfolio.service.js';
import type { HoldingDetail, HoldingHistory, PricePoint } from '../models/holding.model.js';

const VALID_RANGES = ['1w', '1m', '3m', '1y', 'all'] as const;

function rangeToDays(range: string): number {
  switch (range.toLowerCase()) {
    case '1w': return 7;
    case '1m': return 30;
    case '3m': return 90;
    case '1y': return 365;
    case 'all': return 365 * 5;
    default: return 0;
  }
}

export function getHoldingDetail(
  ticker: string,
  options?: GeneratorOptions
): HoldingDetail | null {
  const normalizedTicker = ticker.toUpperCase();
  const portfolio = getPortfolio(options);
  const holding = portfolio.holdings.find((h) => h.ticker === normalizedTicker);
  if (!holding) return null;

  const assetDef = ALL_ASSETS.find((a) => a.ticker === normalizedTicker);
  if (!assetDef) return null;

  return {
    ticker: holding.ticker,
    name: holding.name,
    type: holding.type,
    sector: assetDef.sector,
    description: assetDef.description,
    quantity: holding.quantity,
    currentPrice: holding.currentPrice,
    currentValue: holding.currentValue,
    avgBuyPrice: holding.avgBuyPrice,
    gainLoss: holding.gainLoss,
    gainLossPercent: holding.gainLossPercent,
    portfolioPercent: holding.portfolioPercent,
  };
}

export function getHoldingHistory(
  ticker: string,
  range: string,
  options?: GeneratorOptions
): HoldingHistory | null {
  const normalizedTicker = ticker.toUpperCase();
  const normalizedRange = range.toLowerCase();

  if (!VALID_RANGES.includes(normalizedRange as typeof VALID_RANGES[number])) {
    return null;
  }

  const portfolio = getPortfolio(options);
  const holding = portfolio.holdings.find((h) => h.ticker === normalizedTicker);
  if (!holding) return null;

  const days = rangeToDays(normalizedRange);
  const data = generatePriceHistory(
    normalizedTicker,
    holding.currentPrice,
    days,
    options
  );

  const displayRange = normalizedRange === 'all' ? 'All'
    : normalizedRange === '1w' ? '1W'
    : normalizedRange === '1m' ? '1M'
    : normalizedRange === '3m' ? '3M'
    : '1Y';

  return {
    ticker: normalizedTicker,
    range: displayRange,
    data,
  };
}

function generatePriceHistory(
  ticker: string,
  currentPrice: number,
  days: number,
  options?: GeneratorOptions
): PricePoint[] {
  // Use a separate generator seeded for price history to not affect portfolio generation
  const gen = createGenerator({
    seed: (options?.seed ?? 'ai-portfolio-companion') + ':history:' + ticker,
    date: options?.date,
  });

  const data: PricePoint[] = [];
  const today = options?.date ? new Date(options.date) : new Date();

  // Generate backwards from current price using random walk
  let price = currentPrice;
  const prices: { date: Date; price: number }[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    prices.push({ date, price: round2(price) });

    // Random walk step (backwards)
    const change = gen.floatRange(-0.03, 0.03);
    price = price / (1 + change);
  }

  // Reverse to chronological order
  prices.reverse();

  for (const p of prices) {
    data.push({
      date: formatDate(p.date),
      price: p.price,
    });
  }

  return data;
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
