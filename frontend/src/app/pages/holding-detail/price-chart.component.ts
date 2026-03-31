import {
  Component,
  input,
  signal,
  effect,
  ElementRef,
  viewChild,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { ApiService } from '../../services/api.service';
import { PricePoint, HoldingHistory } from '../../models/holding.model';
import { createChart, IChartApi, ISeriesApi, AreaSeries, Time } from 'lightweight-charts';

const RANGES = ['1W', '1M', '3M', '1Y', 'All'] as const;
type Range = typeof RANGES[number];

@Component({
  selector: 'app-price-chart',
  template: `
    <div class="chart-wrapper">
      <div class="chart-container" #chartContainer>
        @if (loading()) {
          <div class="chart-skeleton"></div>
        }
      </div>
      <div class="range-toggles">
        @for (range of ranges; track range) {
          <button
            class="range-btn"
            [class.active]="selectedRange() === range"
            [disabled]="loading()"
            (click)="selectRange(range)">
            {{ range }}
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .chart-wrapper {
      margin: 0 var(--spacing-5);
    }
    .chart-container {
      width: 100%;
      height: 200px;
      position: relative;
    }
    .chart-skeleton {
      width: 100%;
      height: 100%;
      background: var(--app-surface-high);
      border-radius: var(--radius-md);
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .range-toggles {
      display: flex;
      gap: var(--spacing-1);
      justify-content: center;
      margin-top: var(--spacing-3);
    }
    .range-btn {
      background: transparent;
      border: none;
      color: var(--ion-color-medium);
      font-size: 0.875rem;
      font-weight: 600;
      padding: var(--spacing-1) var(--spacing-3);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .range-btn.active {
      background: var(--ion-color-primary);
      color: #ffffff;
    }
    .range-btn:disabled {
      opacity: 0.5;
      cursor: default;
    }
  `],
})
export class PriceChartComponent implements AfterViewInit, OnDestroy {
  readonly ticker = input.required<string>();
  readonly ranges = RANGES;
  readonly selectedRange = signal<Range>('1M');
  readonly loading = signal(true);
  readonly historyData = signal<PricePoint[]>([]);

  private readonly chartContainer = viewChild<ElementRef<HTMLElement>>('chartContainer');
  private chart: IChartApi | null = null;
  private areaSeries: ISeriesApi<'Area'> | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private viewReady = false;

  private readonly api: ApiService;

  constructor(api: ApiService) {
    this.api = api;

    effect(() => {
      const ticker = this.ticker();
      const range = this.selectedRange();
      if (ticker) {
        this.fetchHistory(ticker, range);
      }
    });

    effect(() => {
      const data = this.historyData();
      if (this.viewReady && data.length > 0) {
        this.renderChart(data);
      }
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.initChart();
    const data = this.historyData();
    if (data.length > 0) {
      this.renderChart(data);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (this.chart) {
      this.chart.remove();
      this.chart = null;
      this.areaSeries = null;
    }
  }

  selectRange(range: Range): void {
    if (range !== this.selectedRange()) {
      this.selectedRange.set(range);
    }
  }

  private async fetchHistory(ticker: string, range: string): Promise<void> {
    this.loading.set(true);
    try {
      const res = await fetch(this.api.url(`/api/holdings/${ticker}/history?range=${range}`));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: HoldingHistory = await res.json();
      this.historyData.set(data.data);
    } catch {
      this.historyData.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  private initChart(): void {
    const container = this.chartContainer()?.nativeElement;
    if (!container || this.chart) return;

    this.chart = createChart(container, {
      width: container.clientWidth,
      height: 200,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#43474f',
        fontFamily: 'Inter',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: '#f4f3f8' },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },
      handleScroll: false,
      handleScale: false,
      crosshair: {
        vertLine: {
          width: 1,
          color: 'rgba(0, 30, 64, 0.3)',
          labelVisible: false,
        },
        horzLine: {
          visible: true,
          labelVisible: true,
        },
      },
    });

    this.areaSeries = this.chart.addSeries(AreaSeries, {
      lineColor: '#003366',
      topColor: 'rgba(0, 51, 102, 0.2)',
      bottomColor: 'rgba(0, 51, 102, 0.0)',
      lineWidth: 2,
    });

    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (this.chart) {
          this.chart.applyOptions({ width: entry.contentRect.width });
        }
      }
    });
    this.resizeObserver.observe(container);
  }

  private renderChart(data: PricePoint[]): void {
    if (!this.areaSeries) {
      this.initChart();
    }
    if (this.areaSeries) {
      const chartData = data.map(p => ({
        time: p.date as Time,
        value: p.price,
      }));
      this.areaSeries.setData(chartData);
      this.chart?.timeScale().fitContent();
    }
  }
}
