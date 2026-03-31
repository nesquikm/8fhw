import { Component, input, computed } from '@angular/core';
import { formatCurrency, formatSignedCurrency, formatPercent } from '../../../services/format.utils';

@Component({
  selector: 'app-portfolio-summary',
  template: `
    <div class="portfolio-summary">
      <span class="label">Total Balance</span>
      <span class="total-value">{{ formattedTotal() }}</span>
      <span class="change-chip" [class.chip-gain]="dailyChange() >= 0" [class.chip-loss]="dailyChange() < 0">
        {{ formattedChange() }} ({{ formattedPercent() }})
      </span>
    </div>
  `,
  styles: [`
    .portfolio-summary {
      background: var(--app-primary-gradient);
      color: #ffffff;
      padding: var(--spacing-16) var(--spacing-5) var(--spacing-6);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .label {
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05rem;
      opacity: 0.6;
      margin-bottom: var(--spacing-2);
    }
    .total-value {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: var(--spacing-3);
    }
    .change-chip {
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
  `],
})
export class PortfolioSummaryComponent {
  readonly totalValue = input(0);
  readonly dailyChange = input(0);
  readonly dailyChangePercent = input(0);

  readonly formattedTotal = computed(() => formatCurrency(this.totalValue()));
  readonly formattedChange = computed(() => formatSignedCurrency(this.dailyChange()));
  readonly formattedPercent = computed(() => formatPercent(this.dailyChangePercent()));
}
