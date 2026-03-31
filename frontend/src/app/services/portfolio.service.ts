import { Injectable, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { Portfolio, Holding, GroupedHoldings } from '../models/portfolio.model';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly api: ApiService;

  readonly portfolio = signal<Portfolio | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly groupedHoldings = computed<GroupedHoldings>(() => {
    const p = this.portfolio();
    if (!p) return { stocks: [], crypto: [] };
    return {
      stocks: p.holdings.filter((h: Holding) => h.type === 'stock'),
      crypto: p.holdings.filter((h: Holding) => h.type === 'crypto'),
    };
  });

  constructor(api: ApiService) {
    this.api = api;
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await fetch(this.api.url('/api/portfolio'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Portfolio = await res.json();
      this.portfolio.set(data);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      this.loading.set(false);
    }
  }
}
