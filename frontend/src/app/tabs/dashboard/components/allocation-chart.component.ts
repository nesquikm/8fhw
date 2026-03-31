import { Component, input, computed } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartData, ChartOptions, ArcElement, DoughnutController, Tooltip, Legend } from 'chart.js';
import { GroupedHoldings } from '../../../models/portfolio.model';

Chart.register(ArcElement, DoughnutController, Tooltip, Legend);

@Component({
  selector: 'app-allocation-chart',
  template: `
    <div class="allocation-card">
      <h2 class="section-title">Asset Allocation</h2>
      <div class="chart-row">
        <div class="chart-container">
          <canvas baseChart
            [data]="chartData()"
            [options]="chartOptions"
            type="doughnut">
          </canvas>
        </div>
        <div class="legend">
          @for (item of legendItems(); track item.label) {
            <div class="legend-item">
              <span class="legend-dot" [style.background]="item.color"></span>
              <span class="legend-label">{{ item.label }}</span>
              <span class="legend-value">{{ item.percent }}%</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .allocation-card {
      background: #ffffff;
      border-radius: var(--radius-xl);
      padding: var(--spacing-4);
      margin: 0 var(--spacing-5);
    }
    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 var(--spacing-4) 0;
      color: var(--ion-text-color);
    }
    .chart-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
    }
    .chart-container {
      width: 120px;
      height: 120px;
      flex-shrink: 0;
    }
    .legend {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .legend-label {
      font-size: 0.875rem;
      color: var(--ion-text-color);
    }
    .legend-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--ion-text-color);
      margin-left: auto;
    }
  `],
  imports: [BaseChartDirective],
})
export class AllocationChartComponent {
  readonly groupedHoldings = input.required<GroupedHoldings>();

  readonly chartData = computed<ChartData<'doughnut'>>(() => {
    const gh = this.groupedHoldings();
    const stocksValue = gh.stocks.reduce((sum, h) => sum + h.currentValue, 0);
    const cryptoValue = gh.crypto.reduce((sum, h) => sum + h.currentValue, 0);
    return {
      labels: ['Stocks', 'Crypto'],
      datasets: [{
        data: [stocksValue, cryptoValue],
        backgroundColor: ['#003366', '#78dc77'],
        borderWidth: 0,
      }],
    };
  });

  readonly legendItems = computed(() => {
    const gh = this.groupedHoldings();
    const stocksValue = gh.stocks.reduce((sum, h) => sum + h.currentValue, 0);
    const cryptoValue = gh.crypto.reduce((sum, h) => sum + h.currentValue, 0);
    const total = stocksValue + cryptoValue;
    if (total === 0) return [];
    return [
      { label: 'Stocks', color: '#003366', percent: Math.round((stocksValue / total) * 100) },
      { label: 'Crypto', color: '#78dc77', percent: Math.round((cryptoValue / total) * 100) },
    ];
  });

  readonly chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };
}
