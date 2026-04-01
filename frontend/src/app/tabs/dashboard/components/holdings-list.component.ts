import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonItem } from '@ionic/angular/standalone';
import { GroupedHoldings } from '../../../models/portfolio.model';
import { formatCurrency, formatSignedCurrency, formatPercent, formatQuantity } from '../../../services/format.utils';

@Component({
  selector: 'app-holdings-list',
  template: `
    @if (groupedHoldings().stocks.length) {
      <div class="holdings-section">
        <h2 class="section-header">Stocks</h2>
        @for (holding of groupedHoldings().stocks; track holding.ticker) {
          <ion-item lines="none" [routerLink]="['/holding', holding.ticker]" routerDirection="forward" detail="false">
            <div class="holding-row">
              <div class="left">
                <span class="ticker-badge">{{ holding.ticker }}</span>
                <div class="info">
                  <span class="name">{{ holding.name }}</span>
                  <span class="secondary">{{ fmtQty(holding.quantity) }} SHARES · {{ fmtPct2(holding.portfolioPercent) }}</span>
                </div>
              </div>
              <div class="right">
                <span class="value">{{ fmtCur(holding.currentValue) }}</span>
                <span class="gain-loss" [class.gain]="holding.gainLoss >= 0" [class.loss]="holding.gainLoss < 0">
                  {{ fmtSignedCur(holding.gainLoss) }} ({{ fmtPct(holding.gainLossPercent) }})
                </span>
              </div>
            </div>
          </ion-item>
        }
      </div>
    }
    @if (groupedHoldings().crypto.length) {
      <div class="holdings-section">
        <h2 class="section-header">Crypto</h2>
        @for (holding of groupedHoldings().crypto; track holding.ticker) {
          <ion-item lines="none" [routerLink]="['/holding', holding.ticker]" routerDirection="forward" detail="false">
            <div class="holding-row">
              <div class="left">
                <span class="ticker-badge">{{ holding.ticker }}</span>
                <div class="info">
                  <span class="name">{{ holding.name }}</span>
                  <span class="secondary">{{ fmtQty(holding.quantity) }} {{ holding.ticker }} · {{ fmtPct2(holding.portfolioPercent) }}</span>
                </div>
              </div>
              <div class="right">
                <span class="value">{{ fmtCur(holding.currentValue) }}</span>
                <span class="gain-loss" [class.gain]="holding.gainLoss >= 0" [class.loss]="holding.gainLoss < 0">
                  {{ fmtSignedCur(holding.gainLoss) }} ({{ fmtPct(holding.gainLossPercent) }})
                </span>
              </div>
            </div>
          </ion-item>
        }
      </div>
    }
  `,
  styles: [`
    .holdings-section {
      padding: 0 var(--spacing-5);
    }
    .section-header {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--ion-text-color);
      margin: 0 0 var(--spacing-3) 0;
    }
    ion-item {
      --padding-start: 0;
      --inner-padding-end: 0;
      --background: transparent;
      margin-bottom: var(--spacing-3);
    }
    .holding-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .left {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }
    .ticker-badge {
      background: var(--ion-color-primary);
      color: var(--ion-color-primary-contrast);
      border-radius: var(--radius-sm);
      font-size: 0.625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03rem;
      padding: var(--spacing-1) var(--spacing-1);
      width: 48px;
      text-align: center;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .info {
      display: flex;
      flex-direction: column;
    }
    .name {
      font-size: 1rem;
      font-weight: 500;
      color: var(--ion-text-color);
    }
    .secondary {
      font-size: 0.875rem;
      color: var(--ion-color-medium);
    }
    .right {
      text-align: right;
      display: flex;
      flex-direction: column;
    }
    .value {
      font-size: 1rem;
      font-weight: 700;
      color: var(--ion-text-color);
    }
    .gain-loss {
      font-size: 0.875rem;
    }
    .gain {
      color: var(--app-gain);
    }
    .loss {
      color: var(--app-loss);
    }
  `],
  imports: [IonItem, RouterLink],
})
export class HoldingsListComponent {
  readonly groupedHoldings = input.required<GroupedHoldings>();

  fmtCur = formatCurrency;
  fmtSignedCur = formatSignedCurrency;
  fmtPct = formatPercent;
  fmtQty = formatQuantity;
  fmtPct2(value: number): string { return `${value.toFixed(2)}%`; }
}
