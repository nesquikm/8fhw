import { describe, it, expect } from 'vitest';
import { getPortfolio } from '../services/portfolio.service.js';
import { getHoldingDetail, getHoldingHistory } from '../services/holdings.service.js';
import { getInsights } from '../services/insights.service.js';

const TEST_SEED = 'test-seed';
const TEST_DATE = '2026-03-31';

describe('Portfolio Service', () => {
  it('returns a portfolio with 8-12 holdings', () => {
    const portfolio = getPortfolio({ seed: TEST_SEED, date: TEST_DATE });
    expect(portfolio.holdings.length).toBeGreaterThanOrEqual(8);
    expect(portfolio.holdings.length).toBeLessThanOrEqual(12);
  });

  it('returns totalValue, dailyChange, dailyChangePercent', () => {
    const portfolio = getPortfolio({ seed: TEST_SEED, date: TEST_DATE });
    expect(portfolio.totalValue).toBeTypeOf('number');
    expect(portfolio.dailyChange).toBeTypeOf('number');
    expect(portfolio.dailyChangePercent).toBeTypeOf('number');
    expect(portfolio.totalValue).toBeGreaterThan(0);
  });

  it('each holding has all required fields', () => {
    const portfolio = getPortfolio({ seed: TEST_SEED, date: TEST_DATE });
    for (const h of portfolio.holdings) {
      expect(h.ticker).toBeTypeOf('string');
      expect(h.ticker).toMatch(/^[A-Z]{1,5}$/);
      expect(h.name).toBeTypeOf('string');
      expect(['stock', 'crypto']).toContain(h.type);
      expect(h.quantity).toBeTypeOf('number');
      expect(h.currentPrice).toBeTypeOf('number');
      expect(h.currentValue).toBeTypeOf('number');
      expect(h.avgBuyPrice).toBeTypeOf('number');
      expect(h.gainLoss).toBeTypeOf('number');
      expect(h.gainLossPercent).toBeTypeOf('number');
      expect(h.portfolioPercent).toBeTypeOf('number');
    }
  });

  it('totalValue equals sum of holding currentValues', () => {
    const portfolio = getPortfolio({ seed: TEST_SEED, date: TEST_DATE });
    const sumValues = portfolio.holdings.reduce((sum, h) => sum + h.currentValue, 0);
    expect(portfolio.totalValue).toBeCloseTo(sumValues, 2);
  });

  it('portfolioPercent values sum to ~100', () => {
    const portfolio = getPortfolio({ seed: TEST_SEED, date: TEST_DATE });
    const sumPct = portfolio.holdings.reduce((sum, h) => sum + h.portfolioPercent, 0);
    expect(sumPct).toBeCloseTo(100, 0);
  });

  it('includes both stocks and crypto', () => {
    const portfolio = getPortfolio({ seed: TEST_SEED, date: TEST_DATE });
    const types = new Set(portfolio.holdings.map((h) => h.type));
    expect(types.has('stock')).toBe(true);
    expect(types.has('crypto')).toBe(true);
  });

  it('returns identical data for same seed and date (determinism)', () => {
    const p1 = getPortfolio({ seed: TEST_SEED, date: TEST_DATE });
    const p2 = getPortfolio({ seed: TEST_SEED, date: TEST_DATE });
    expect(p1).toEqual(p2);
  });

  it('returns different data for different dates', () => {
    const p1 = getPortfolio({ seed: TEST_SEED, date: '2026-03-31' });
    const p2 = getPortfolio({ seed: TEST_SEED, date: '2026-04-01' });
    expect(p1.totalValue).not.toEqual(p2.totalValue);
  });

  it('tickers are uppercase', () => {
    const portfolio = getPortfolio({ seed: TEST_SEED, date: TEST_DATE });
    for (const h of portfolio.holdings) {
      expect(h.ticker).toBe(h.ticker.toUpperCase());
    }
  });
});

describe('Holdings Service', () => {
  it('getHoldingDetail returns holding with sector and description', () => {
    const detail = getHoldingDetail('AAPL', { seed: TEST_SEED, date: TEST_DATE });
    expect(detail).not.toBeNull();
    expect(detail!.ticker).toBe('AAPL');
    expect(detail!.sector).toBeTypeOf('string');
    expect(detail!.sector.length).toBeGreaterThan(0);
    expect(detail!.description).toBeTypeOf('string');
    expect(detail!.description.length).toBeGreaterThan(0);
  });

  it('getHoldingDetail is case-insensitive', () => {
    const upper = getHoldingDetail('AAPL', { seed: TEST_SEED, date: TEST_DATE });
    const lower = getHoldingDetail('aapl', { seed: TEST_SEED, date: TEST_DATE });
    expect(upper).toEqual(lower);
  });

  it('getHoldingDetail returns null for unknown ticker', () => {
    const detail = getHoldingDetail('UNKNOWN', { seed: TEST_SEED, date: TEST_DATE });
    expect(detail).toBeNull();
  });

  it('getHoldingDetail response has all required fields', () => {
    const detail = getHoldingDetail('AAPL', { seed: TEST_SEED, date: TEST_DATE });
    expect(detail).not.toBeNull();
    expect(detail!.ticker).toBe('AAPL');
    expect(detail!.name).toBeTypeOf('string');
    expect(['stock', 'crypto']).toContain(detail!.type);
    expect(detail!.quantity).toBeTypeOf('number');
    expect(detail!.currentPrice).toBeTypeOf('number');
    expect(detail!.currentValue).toBeTypeOf('number');
    expect(detail!.avgBuyPrice).toBeTypeOf('number');
    expect(detail!.gainLoss).toBeTypeOf('number');
    expect(detail!.gainLossPercent).toBeTypeOf('number');
    expect(detail!.portfolioPercent).toBeTypeOf('number');
  });

  it('getHoldingHistory returns date-sorted price data for 1M', () => {
    const history = getHoldingHistory('AAPL', '1M', { seed: TEST_SEED, date: TEST_DATE });
    expect(history).not.toBeNull();
    expect(history!.ticker).toBe('AAPL');
    expect(history!.range).toBe('1M');
    expect(history!.data.length).toBeGreaterThan(0);

    // Verify date-sorted
    for (let i = 1; i < history!.data.length; i++) {
      expect(history!.data[i].date >= history!.data[i - 1].date).toBe(true);
    }
  });

  it('getHoldingHistory returns ~5 years of daily data for All', () => {
    const history = getHoldingHistory('AAPL', 'All', { seed: TEST_SEED, date: TEST_DATE });
    expect(history).not.toBeNull();
    // ~5 years * 365 = ~1825 data points (minus weekends for stocks, but crypto is daily)
    expect(history!.data.length).toBeGreaterThan(1000);
  });

  it('getHoldingHistory supports all valid ranges', () => {
    const ranges = ['1W', '1M', '3M', '1Y', 'All'];
    for (const range of ranges) {
      const history = getHoldingHistory('AAPL', range, { seed: TEST_SEED, date: TEST_DATE });
      expect(history).not.toBeNull();
      expect(history!.data.length).toBeGreaterThan(0);
    }
  });

  it('getHoldingHistory is case-insensitive for range', () => {
    const h1 = getHoldingHistory('AAPL', 'all', { seed: TEST_SEED, date: TEST_DATE });
    const h2 = getHoldingHistory('AAPL', 'ALL', { seed: TEST_SEED, date: TEST_DATE });
    const h3 = getHoldingHistory('AAPL', 'All', { seed: TEST_SEED, date: TEST_DATE });
    expect(h1).toEqual(h2);
    expect(h2).toEqual(h3);
  });

  it('getHoldingHistory returns null for invalid range', () => {
    const history = getHoldingHistory('AAPL', 'INVALID', { seed: TEST_SEED, date: TEST_DATE });
    expect(history).toBeNull();
  });

  it('getHoldingHistory returns null for unknown ticker', () => {
    const history = getHoldingHistory('UNKNOWN', '1M', { seed: TEST_SEED, date: TEST_DATE });
    expect(history).toBeNull();
  });

  it('getHoldingHistory data has correct shape', () => {
    const history = getHoldingHistory('AAPL', '1M', { seed: TEST_SEED, date: TEST_DATE });
    expect(history).not.toBeNull();
    for (const point of history!.data) {
      expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(point.price).toBeTypeOf('number');
      expect(point.price).toBeGreaterThan(0);
    }
  });

  it('1W has fewer data points than 1M', () => {
    const w = getHoldingHistory('AAPL', '1W', { seed: TEST_SEED, date: TEST_DATE });
    const m = getHoldingHistory('AAPL', '1M', { seed: TEST_SEED, date: TEST_DATE });
    expect(w!.data.length).toBeLessThan(m!.data.length);
  });
});

describe('Insights Service', () => {
  it('returns insight cards', () => {
    const insights = getInsights({ seed: TEST_SEED, date: TEST_DATE });
    expect(insights.length).toBeGreaterThan(0);
  });

  it('each insight has id, title, summary, prompt', () => {
    const insights = getInsights({ seed: TEST_SEED, date: TEST_DATE });
    for (const insight of insights) {
      expect(insight.id).toBeTypeOf('string');
      expect(insight.title).toBeTypeOf('string');
      expect(insight.summary).toBeTypeOf('string');
      expect(insight.prompt).toBeTypeOf('string');
      expect(insight.id.length).toBeGreaterThan(0);
      expect(insight.title.length).toBeGreaterThan(0);
      expect(insight.summary.length).toBeGreaterThan(0);
      expect(insight.prompt.length).toBeGreaterThan(0);
    }
  });

  it('summaries reference actual portfolio values (not static text)', () => {
    const portfolio = getPortfolio({ seed: TEST_SEED, date: TEST_DATE });
    const insights = getInsights({ seed: TEST_SEED, date: TEST_DATE });

    // At least one insight should reference a real ticker or a real number from the portfolio
    const tickers = portfolio.holdings.map((h) => h.ticker);
    const hasTickerReference = insights.some((insight) =>
      tickers.some(
        (t) => insight.summary.includes(t) || insight.prompt.includes(t)
      )
    );
    const hasNumberReference = insights.some((insight) =>
      /\d+\.?\d*%/.test(insight.summary)
    );
    expect(hasTickerReference || hasNumberReference).toBe(true);
  });

  it('returns deterministic insights for same seed and date', () => {
    const i1 = getInsights({ seed: TEST_SEED, date: TEST_DATE });
    const i2 = getInsights({ seed: TEST_SEED, date: TEST_DATE });
    expect(i1).toEqual(i2);
  });
});
