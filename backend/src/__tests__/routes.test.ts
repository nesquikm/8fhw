import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

const app = createApp();

describe('GET /api/portfolio', () => {
  it('returns 200 with portfolio data', async () => {
    const res = await request(app).get('/api/portfolio');
    expect(res.status).toBe(200);
    expect(res.body.totalValue).toBeTypeOf('number');
    expect(res.body.dailyChange).toBeTypeOf('number');
    expect(res.body.dailyChangePercent).toBeTypeOf('number');
    expect(Array.isArray(res.body.holdings)).toBe(true);
    expect(res.body.holdings.length).toBeGreaterThanOrEqual(8);
  });

  it('each holding has required fields', async () => {
    const res = await request(app).get('/api/portfolio');
    const h = res.body.holdings[0];
    expect(h.ticker).toBeTypeOf('string');
    expect(h.name).toBeTypeOf('string');
    expect(['stock', 'crypto']).toContain(h.type);
    expect(h.quantity).toBeTypeOf('number');
    expect(h.currentPrice).toBeTypeOf('number');
    expect(h.currentValue).toBeTypeOf('number');
    expect(h.avgBuyPrice).toBeTypeOf('number');
    expect(h.gainLoss).toBeTypeOf('number');
    expect(h.gainLossPercent).toBeTypeOf('number');
    expect(h.portfolioPercent).toBeTypeOf('number');
  });

  it('returns identical data on repeated requests (same day determinism)', async () => {
    const res1 = await request(app).get('/api/portfolio');
    const res2 = await request(app).get('/api/portfolio');
    expect(res1.body).toEqual(res2.body);
  });
});

describe('GET /api/holdings/:ticker', () => {
  it('returns 200 with holding detail including sector and description', async () => {
    // First get a valid ticker
    const portfolioRes = await request(app).get('/api/portfolio');
    const ticker = portfolioRes.body.holdings[0].ticker;

    const res = await request(app).get(`/api/holdings/${ticker}`);
    expect(res.status).toBe(200);
    expect(res.body.ticker).toBe(ticker);
    expect(res.body.sector).toBeTypeOf('string');
    expect(res.body.description).toBeTypeOf('string');
  });

  it('is case-insensitive', async () => {
    const portfolioRes = await request(app).get('/api/portfolio');
    const ticker = portfolioRes.body.holdings[0].ticker;

    const upper = await request(app).get(`/api/holdings/${ticker.toUpperCase()}`);
    const lower = await request(app).get(`/api/holdings/${ticker.toLowerCase()}`);
    expect(upper.body).toEqual(lower.body);
  });

  it('always returns uppercase ticker in response', async () => {
    const portfolioRes = await request(app).get('/api/portfolio');
    const ticker = portfolioRes.body.holdings[0].ticker;

    const res = await request(app).get(`/api/holdings/${ticker.toLowerCase()}`);
    expect(res.body.ticker).toBe(ticker.toUpperCase());
  });

  it('returns 404 for unknown ticker', async () => {
    const res = await request(app).get('/api/holdings/UNKNOWN');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/holdings/:ticker/history', () => {
  it('returns date-sorted price data for 1M', async () => {
    const portfolioRes = await request(app).get('/api/portfolio');
    const ticker = portfolioRes.body.holdings[0].ticker;

    const res = await request(app).get(`/api/holdings/${ticker}/history?range=1M`);
    expect(res.status).toBe(200);
    expect(res.body.ticker).toBe(ticker);
    expect(res.body.range).toBe('1M');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    // Verify sorted
    for (let i = 1; i < res.body.data.length; i++) {
      expect(res.body.data[i].date >= res.body.data[i - 1].date).toBe(true);
    }
  });

  it('returns ~5 years of data for All range', async () => {
    const portfolioRes = await request(app).get('/api/portfolio');
    const ticker = portfolioRes.body.holdings[0].ticker;

    const res = await request(app).get(`/api/holdings/${ticker}/history?range=All`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(1000);
  });

  it('supports all valid ranges', async () => {
    const portfolioRes = await request(app).get('/api/portfolio');
    const ticker = portfolioRes.body.holdings[0].ticker;

    for (const range of ['1W', '1M', '3M', '1Y', 'All']) {
      const res = await request(app).get(`/api/holdings/${ticker}/history?range=${range}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    }
  });

  it('range is case-insensitive', async () => {
    const portfolioRes = await request(app).get('/api/portfolio');
    const ticker = portfolioRes.body.holdings[0].ticker;

    const res1 = await request(app).get(`/api/holdings/${ticker}/history?range=all`);
    const res2 = await request(app).get(`/api/holdings/${ticker}/history?range=ALL`);
    expect(res1.body).toEqual(res2.body);
  });

  it('returns 400 for invalid range', async () => {
    const portfolioRes = await request(app).get('/api/portfolio');
    const ticker = portfolioRes.body.holdings[0].ticker;

    const res = await request(app).get(`/api/holdings/${ticker}/history?range=INVALID`);
    expect(res.status).toBe(400);
  });

  it('returns 400 when range parameter is missing', async () => {
    const portfolioRes = await request(app).get('/api/portfolio');
    const ticker = portfolioRes.body.holdings[0].ticker;

    const res = await request(app).get(`/api/holdings/${ticker}/history`);
    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown ticker', async () => {
    const res = await request(app).get('/api/holdings/UNKNOWN/history?range=1M');
    expect(res.status).toBe(404);
  });

  it('each data point has date and price', async () => {
    const portfolioRes = await request(app).get('/api/portfolio');
    const ticker = portfolioRes.body.holdings[0].ticker;

    const res = await request(app).get(`/api/holdings/${ticker}/history?range=1W`);
    for (const point of res.body.data) {
      expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(point.price).toBeTypeOf('number');
      expect(point.price).toBeGreaterThan(0);
    }
  });
});

describe('GET /api/insights', () => {
  it('returns 200 with insight cards', async () => {
    const res = await request(app).get('/api/insights');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.insights)).toBe(true);
    expect(res.body.insights.length).toBeGreaterThan(0);
  });

  it('each insight has id, title, summary, prompt', async () => {
    const res = await request(app).get('/api/insights');
    for (const insight of res.body.insights) {
      expect(insight.id).toBeTypeOf('string');
      expect(insight.title).toBeTypeOf('string');
      expect(insight.summary).toBeTypeOf('string');
      expect(insight.prompt).toBeTypeOf('string');
    }
  });

  it('insights reference actual portfolio data (dynamic, not static)', async () => {
    const portfolioRes = await request(app).get('/api/portfolio');
    const tickers = portfolioRes.body.holdings.map((h: { ticker: string }) => h.ticker);

    const insightsRes = await request(app).get('/api/insights');
    const insights = insightsRes.body.insights;

    // At least one insight should reference a real ticker or percentage
    const hasReference = insights.some((insight: { summary: string; prompt: string }) =>
      tickers.some((t: string) => insight.summary.includes(t) || insight.prompt.includes(t)) ||
      /\d+\.?\d*%/.test(insight.summary)
    );
    expect(hasReference).toBe(true);
  });
});
