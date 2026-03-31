import { Component, input, output, signal } from '@angular/core';
import { Insight } from '../../../models/insight.model';

@Component({
  selector: 'app-insight-cards',
  template: `
    <div class="insight-section">
      <h2 class="section-title">Portfolio Insights</h2>
      <div class="scroll-container" (scroll)="onScroll($event)">
        @for (insight of insights(); track insight.id) {
          <div class="insight-card" (click)="onCardTap(insight)">
            <div class="card-title">{{ insight.title }}</div>
            <div class="card-summary">{{ insight.summary }}</div>
          </div>
        }
      </div>
      <div class="dots">
        @for (insight of insights(); track insight.id; let i = $index) {
          <span class="dot" [class.active]="i === activeIndex()"></span>
        }
      </div>
    </div>
  `,
  styles: [`
    .insight-section {
      padding: 0 var(--spacing-5);
    }
    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 var(--spacing-4) 0;
      color: var(--ion-text-color);
    }
    .scroll-container {
      display: flex;
      gap: var(--spacing-2);
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding-bottom: var(--spacing-2);
    }
    .scroll-container::-webkit-scrollbar {
      display: none;
    }
    .insight-card {
      min-width: 280px;
      flex-shrink: 0;
      background: #ffffff;
      border-radius: var(--radius-xl);
      padding: var(--spacing-4);
      scroll-snap-align: start;
      cursor: pointer;
    }
    .card-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--ion-text-color);
      margin-bottom: var(--spacing-2);
    }
    .card-summary {
      font-size: 0.875rem;
      color: var(--ion-color-medium);
      line-height: 1.4;
    }
    .dots {
      display: flex;
      justify-content: center;
      gap: var(--spacing-1);
      margin-top: var(--spacing-3);
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--app-outline-variant);
      transition: background 0.2s;
    }
    .dot.active {
      background: var(--ion-color-primary);
    }
  `],
})
export class InsightCardsComponent {
  readonly insights = input<Insight[]>([]);
  readonly promptSelected = output<string>();
  readonly activeIndex = signal(0);

  onCardTap(insight: Insight): void {
    this.promptSelected.emit(insight.prompt);
  }

  onScroll(event: Event): void {
    const el = event.target as HTMLElement;
    const cardWidth = 280 + 8; // min-width + gap
    const index = Math.round(el.scrollLeft / cardWidth);
    this.activeIndex.set(index);
  }
}
