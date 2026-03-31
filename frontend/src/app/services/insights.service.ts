import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Insight } from '../models/insight.model';

@Injectable({ providedIn: 'root' })
export class InsightsService {
  private readonly api: ApiService;

  readonly insights = signal<Insight[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(api: ApiService) {
    this.api = api;
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await fetch(this.api.url('/api/insights'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.insights.set(data.insights);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      this.loading.set(false);
    }
  }
}
