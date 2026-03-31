import { TestBed } from '@angular/core/testing';
import { PortfolioService } from './portfolio.service';
import { ApiService } from './api.service';

describe('PortfolioService', () => {
  let service: PortfolioService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: { baseUrl: '', url: (p: string) => p } }],
    });
    service = TestBed.inject(PortfolioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with null portfolio', () => {
    expect(service.portfolio()).toBeNull();
  });

  it('should start with empty grouped holdings', () => {
    const grouped = service.groupedHoldings();
    expect(grouped.stocks).toEqual([]);
    expect(grouped.crypto).toEqual([]);
  });

  describe('load()', () => {
    it('should fetch portfolio data from backend', async () => {
      await service.load();
      expect(service.error()).toBeNull();
      const portfolio = service.portfolio();
      expect(portfolio).toBeTruthy();
      expect(portfolio!.totalValue).toBeGreaterThan(0);
      expect(portfolio!.holdings.length).toBeGreaterThan(0);
    });

    it('should expose totalValue, dailyChange, dailyChangePercent', async () => {
      await service.load();
      const p = service.portfolio()!;
      expect(typeof p.totalValue).toBe('number');
      expect(typeof p.dailyChange).toBe('number');
      expect(typeof p.dailyChangePercent).toBe('number');
    });

    it('should expose holdings with all required fields', async () => {
      await service.load();
      const holding = service.portfolio()!.holdings[0];
      expect(holding.ticker).toBeTruthy();
      expect(holding.name).toBeTruthy();
      expect(['stock', 'crypto']).toContain(holding.type);
      expect(typeof holding.quantity).toBe('number');
      expect(typeof holding.currentPrice).toBe('number');
      expect(typeof holding.currentValue).toBe('number');
      expect(typeof holding.avgBuyPrice).toBe('number');
      expect(typeof holding.gainLoss).toBe('number');
      expect(typeof holding.gainLossPercent).toBe('number');
      expect(typeof holding.portfolioPercent).toBe('number');
    });

    it('should group holdings by type', async () => {
      await service.load();
      const grouped = service.groupedHoldings();
      expect(grouped.stocks.length).toBeGreaterThan(0);
      expect(grouped.crypto.length).toBeGreaterThan(0);
      grouped.stocks.forEach((h) => expect(h.type).toBe('stock'));
      grouped.crypto.forEach((h) => expect(h.type).toBe('crypto'));
    });

    it('should set loading flag during fetch', async () => {
      const promise = service.load();
      expect(service.loading()).toBeTrue();
      await promise;
      expect(service.loading()).toBeFalse();
    });
  });
});
