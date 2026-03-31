import { Component, input, computed } from '@angular/core';
import { HoldingDetail } from '../../models/holding.model';
import { formatCurrency, formatSignedCurrency, formatPercent, formatQuantity } from '../../services/format.utils';

@Component({
  selector: 'app-position-summary',
  template: `
    <div class="position-card">
      <h3 class="position-header">YOUR POSITION</h3>
      <div class="top-row">
        <div class="stat">
          <span class="stat-label">Current Value</span>
          <span class="stat-value">{{ formattedValue() }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Total Gain/Loss</span>
          <span class="stat-value" [class.gain]="holding().gainLoss >= 0" [class.loss]="holding().gainLoss < 0">
            {{ formattedGainLoss() }}
          </span>
          <span class="stat-sub" [class.gain]="holding().gainLoss >= 0" [class.loss]="holding().gainLoss < 0">
            {{ formattedGainLossPercent() }}
          </span>
        </div>
      </div>
      <div class="detail-rows">
        <div class="detail-row">
          <span class="detail-label">Quantity</span>
          <span class="detail-value">{{ formattedQuantity() }} {{ holding().type === 'stock' ? 'SHARES' : holding().ticker }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Avg Buy Price</span>
          <span class="detail-value">{{ formattedAvgBuyPrice() }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Portfolio Weight</span>
          <span class="detail-value">{{ formattedPortfolioPercent() }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Sector</span>
          <span class="detail-value sector-value">{{ holding().sector }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .position-card {
      background: #ffffff;
      border-radius: var(--radius-xl);
      padding: var(--spacing-4);
      margin: 0 var(--spacing-5);
    }
    .position-header {
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05rem;
      color: var(--ion-color-medium);
      margin: 0 0 var(--spacing-4) 0;
    }
    .top-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-4);
      margin-bottom: var(--spacing-4);
    }
    .stat {
      display: flex;
      flex-direction: column;
    }
    .stat-label {
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05rem;
      color: var(--ion-color-medium);
      margin-bottom: var(--spacing-1);
    }
    .stat-value {
      font-size: 1rem;
      font-weight: 700;
      color: var(--ion-text-color);
    }
    .stat-sub {
      font-size: 0.875rem;
      font-weight: 600;
    }
    .gain {
      color: var(--app-gain);
    }
    .loss {
      color: var(--app-loss);
    }
    .detail-rows {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .detail-label {
      font-size: 0.875rem;
      color: var(--ion-color-medium);
    }
    .detail-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--ion-text-color);
    }
    .sector-value {
      background: var(--app-surface-low);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radius-sm);
    }
  `],
})
export class PositionSummaryComponent {
  readonly holding = input.required<HoldingDetail>();

  readonly formattedValue = computed(() => formatCurrency(this.holding().currentValue));
  readonly formattedGainLoss = computed(() => formatSignedCurrency(this.holding().gainLoss));
  readonly formattedGainLossPercent = computed(() => formatPercent(this.holding().gainLossPercent));
  readonly formattedQuantity = computed(() => formatQuantity(this.holding().quantity));
  readonly formattedAvgBuyPrice = computed(() => formatCurrency(this.holding().avgBuyPrice));
  readonly formattedPortfolioPercent = computed(() => `${this.holding().portfolioPercent.toFixed(2)}%`);
}
