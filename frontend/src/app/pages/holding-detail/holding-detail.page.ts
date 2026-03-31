import { Component, signal, computed, OnInit } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { HoldingDetail } from '../../models/holding.model';
import { formatCurrency, formatSignedCurrency, formatPercent } from '../../services/format.utils';
import { PriceChartComponent } from './price-chart.component';
import { PositionSummaryComponent } from './position-summary.component';

@Component({
  selector: 'app-holding-detail',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>
          @if (holding()) {
            {{ holding()!.name }}
          } @else {
            {{ ticker }}
          }
        </ion-title>
        @if (holding()) {
          <span class="ticker-subtitle" slot="end">{{ ticker }}</span>
        }
      </ion-toolbar>
    </ion-header>
    <ion-content>
      @if (loading()) {
        <!-- Skeleton loading state -->
        <div class="price-section">
          <ion-skeleton-text [animated]="true" style="width: 40%; height: 1.75rem;"></ion-skeleton-text>
          <ion-skeleton-text [animated]="true" style="width: 30%; height: 1.5rem; margin-top: var(--spacing-2);"></ion-skeleton-text>
        </div>
        <div class="skeleton-chart">
          <ion-skeleton-text [animated]="true" style="width: 100%; height: 200px;"></ion-skeleton-text>
        </div>
        <div class="skeleton-position">
          <ion-skeleton-text [animated]="true" style="width: 60%; height: 1rem;"></ion-skeleton-text>
          <ion-skeleton-text [animated]="true" style="width: 80%; height: 1rem; margin-top: var(--spacing-3);"></ion-skeleton-text>
          <ion-skeleton-text [animated]="true" style="width: 70%; height: 1rem; margin-top: var(--spacing-3);"></ion-skeleton-text>
          <ion-skeleton-text [animated]="true" style="width: 50%; height: 1rem; margin-top: var(--spacing-3);"></ion-skeleton-text>
        </div>
      } @else if (holding()) {
        <!-- Price section -->
        <div class="price-section">
          <span class="current-price">{{ formattedPrice() }}</span>
          <div class="price-change-row">
            <span class="price-change-chip"
              [class.chip-gain]="holding()!.gainLoss >= 0"
              [class.chip-loss]="holding()!.gainLoss < 0">
              {{ formattedGainLoss() }} ({{ formattedGainLossPercent() }})
            </span>
            <span class="today-label">Today</span>
          </div>
        </div>

        <!-- Price chart -->
        <app-price-chart [ticker]="ticker"></app-price-chart>

        <!-- Position summary -->
        <div class="section-gap"></div>
        <app-position-summary [holding]="holding()!"></app-position-summary>

        <!-- About section -->
        <div class="section-gap"></div>
        <div class="about-card">
          <h3 class="about-header">ABOUT {{ holding()!.name | uppercase }}</h3>
          <p class="about-description">{{ holding()!.description }}</p>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    ion-toolbar {
      --background: var(--ion-toolbar-background);
      --color: var(--ion-toolbar-color);
    }
    .ticker-subtitle {
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05rem;
      color: rgba(255, 255, 255, 0.6);
      padding-right: var(--spacing-4);
    }
    .price-section {
      padding: var(--spacing-4) var(--spacing-5);
    }
    .current-price {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--ion-text-color);
    }
    .price-change-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      margin-top: var(--spacing-2);
    }
    .price-change-chip {
      display: inline-block;
      padding: var(--spacing-1) var(--spacing-3);
      border-radius: var(--radius-full);
      font-size: 0.875rem;
      font-weight: 600;
    }
    .chip-gain {
      background: var(--app-gain-bg);
      color: var(--app-gain);
    }
    .chip-loss {
      background: var(--app-loss-bg);
      color: var(--app-loss);
    }
    .today-label {
      font-size: 0.875rem;
      color: var(--ion-color-medium);
    }
    .section-gap {
      height: var(--spacing-6);
    }
    .about-card {
      background: #ffffff;
      border-radius: var(--radius-xl);
      padding: var(--spacing-4);
      margin: 0 var(--spacing-5) var(--spacing-8);
    }
    .about-header {
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05rem;
      color: var(--ion-color-medium);
      margin: 0 0 var(--spacing-3) 0;
    }
    .about-description {
      font-size: 1rem;
      color: var(--ion-color-medium);
      line-height: 1.5;
      margin: 0;
    }
    .skeleton-chart {
      padding: 0 var(--spacing-5);
    }
    .skeleton-position {
      padding: var(--spacing-6) var(--spacing-5);
    }
  `],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonSkeletonText,
    UpperCasePipe,
    PriceChartComponent,
    PositionSummaryComponent,
  ],
})
export class HoldingDetailPage implements OnInit {
  ticker = '';

  readonly holding = signal<HoldingDetail | null>(null);
  readonly loading = signal(true);

  readonly formattedPrice = computed(() => {
    const h = this.holding();
    return h ? formatCurrency(h.currentPrice) : '';
  });

  readonly formattedGainLoss = computed(() => {
    const h = this.holding();
    return h ? formatSignedCurrency(h.gainLoss) : '';
  });

  readonly formattedGainLossPercent = computed(() => {
    const h = this.holding();
    return h ? formatPercent(h.gainLossPercent) : '';
  });

  private readonly api: ApiService;

  constructor(route: ActivatedRoute, api: ApiService) {
    this.api = api;
    this.ticker = route.snapshot.paramMap.get('ticker')?.toUpperCase() ?? '';
  }

  ngOnInit(): void {
    this.fetchDetail();
  }

  private async fetchDetail(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await fetch(this.api.url(`/api/holdings/${this.ticker}`));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: HoldingDetail = await res.json();
      this.holding.set(data);
    } catch {
      this.holding.set(null);
    } finally {
      this.loading.set(false);
    }
  }
}
