import { Component, inject, OnInit } from '@angular/core';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { PortfolioService } from '../../services/portfolio.service';
import { InsightsService } from '../../services/insights.service';
import { ChatService } from '../../services/chat.service';
import { PortfolioSummaryComponent } from './components/portfolio-summary.component';
import { AllocationChartComponent } from './components/allocation-chart.component';
import { InsightCardsComponent } from './components/insight-cards.component';
import { HoldingsListComponent } from './components/holdings-list.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  template: `
    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="onRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      @if (portfolioService.loading() && !portfolioService.portfolio()) {
        <!-- Skeleton loading state -->
        <div class="skeleton-hero">
          <ion-skeleton-text [animated]="true" style="width: 120px; height: 14px; margin-bottom: 8px"></ion-skeleton-text>
          <ion-skeleton-text [animated]="true" style="width: 200px; height: 36px; margin-bottom: 12px"></ion-skeleton-text>
          <ion-skeleton-text [animated]="true" style="width: 160px; height: 28px"></ion-skeleton-text>
        </div>
        <div class="skeleton-section">
          <ion-skeleton-text [animated]="true" style="width: 100%; height: 150px; border-radius: var(--radius-xl)"></ion-skeleton-text>
        </div>
        <div class="skeleton-section">
          <ion-skeleton-text [animated]="true" style="width: 140px; height: 20px; margin-bottom: 12px"></ion-skeleton-text>
          <div class="skeleton-cards">
            <ion-skeleton-text [animated]="true" style="min-width: 280px; height: 80px; border-radius: var(--radius-xl)"></ion-skeleton-text>
            <ion-skeleton-text [animated]="true" style="min-width: 280px; height: 80px; border-radius: var(--radius-xl)"></ion-skeleton-text>
          </div>
        </div>
        <div class="skeleton-section">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="skeleton-row">
              <ion-skeleton-text [animated]="true" style="width: 44px; height: 28px; border-radius: var(--radius-sm)"></ion-skeleton-text>
              <div class="skeleton-row-text">
                <ion-skeleton-text [animated]="true" style="width: 120px; height: 16px"></ion-skeleton-text>
                <ion-skeleton-text [animated]="true" style="width: 80px; height: 14px"></ion-skeleton-text>
              </div>
              <div class="skeleton-row-right">
                <ion-skeleton-text [animated]="true" style="width: 80px; height: 16px"></ion-skeleton-text>
                <ion-skeleton-text [animated]="true" style="width: 60px; height: 14px"></ion-skeleton-text>
              </div>
            </div>
          }
        </div>
      } @else if (portfolioService.portfolio(); as portfolio) {
        <app-portfolio-summary
          [totalValue]="portfolio.totalValue"
          [dailyChange]="portfolio.dailyChange"
          [dailyChangePercent]="portfolio.dailyChangePercent"
        />

        <div class="content-area">
          <app-allocation-chart
            [groupedHoldings]="portfolioService.groupedHoldings()"
          />

          <app-insight-cards
            [insights]="insightsService.insights()"
            (promptSelected)="onInsightTap($event)"
          />

          <app-holdings-list
            [groupedHoldings]="portfolioService.groupedHoldings()"
          />
        </div>
      }
    </ion-content>
  `,
  styles: [`
    ion-content {
      --background: var(--app-surface);
    }
    .content-area {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-8);
      padding: var(--spacing-6) 0 var(--spacing-8);
    }
    .skeleton-hero {
      background: var(--app-primary-gradient);
      padding: var(--spacing-16) var(--spacing-5) var(--spacing-6);
    }
    .skeleton-section {
      padding: var(--spacing-6) var(--spacing-5) 0;
    }
    .skeleton-cards {
      display: flex;
      gap: var(--spacing-2);
      overflow: hidden;
    }
    .skeleton-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      margin-bottom: var(--spacing-3);
    }
    .skeleton-row-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }
    .skeleton-row-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
  `],
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    PortfolioSummaryComponent,
    AllocationChartComponent,
    InsightCardsComponent,
    HoldingsListComponent,
  ],
})
export class DashboardPage implements OnInit {
  readonly portfolioService = inject(PortfolioService);
  readonly insightsService = inject(InsightsService);
  private readonly router = inject(Router);
  private readonly chatService = inject(ChatService);

  ngOnInit(): void {
    this.portfolioService.load();
    this.insightsService.load();
  }

  async onRefresh(event: CustomEvent): Promise<void> {
    await Promise.all([
      this.portfolioService.load(),
      this.insightsService.load(),
    ]);
    (event.target as HTMLIonRefresherElement).complete();
  }

  onInsightTap(prompt: string): void {
    this.chatService.pendingPrompt.set(prompt);
    this.router.navigate(['/chat']);
  }
}
