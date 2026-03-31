import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllocationChartComponent } from './allocation-chart.component';
import { GroupedHoldings } from '../../../models/portfolio.model';

describe('AllocationChartComponent', () => {
  let component: AllocationChartComponent;
  let fixture: ComponentFixture<AllocationChartComponent>;

  const mockGrouped: GroupedHoldings = {
    stocks: [
      { ticker: 'AAPL', name: 'Apple', type: 'stock', quantity: 50, currentPrice: 178, currentValue: 8900, avgBuyPrice: 155, gainLoss: 1150, gainLossPercent: 14.84, portfolioPercent: 60 },
    ],
    crypto: [
      { ticker: 'BTC', name: 'Bitcoin', type: 'crypto', quantity: 0.5, currentPrice: 45000, currentValue: 22500, avgBuyPrice: 30000, gainLoss: 7500, gainLossPercent: 50, portfolioPercent: 40 },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllocationChartComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AllocationChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('groupedHoldings', { stocks: [], crypto: [] });
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display Asset Allocation header', () => {
    fixture.componentRef.setInput('groupedHoldings', mockGrouped);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Asset Allocation');
  });

  it('should compute chart data from grouped holdings', () => {
    fixture.componentRef.setInput('groupedHoldings', mockGrouped);
    fixture.detectChanges();
    // Should have 2 data points: stocks total value and crypto total value
    expect(component.chartData().datasets[0].data.length).toBe(2);
    expect(component.chartData().datasets[0].data[0]).toBe(8900);  // stocks value
    expect(component.chartData().datasets[0].data[1]).toBe(22500); // crypto value
  });

  it('should use correct colors for stocks and crypto segments', () => {
    fixture.componentRef.setInput('groupedHoldings', mockGrouped);
    fixture.detectChanges();
    const colors = component.chartData().datasets[0].backgroundColor as string[];
    expect(colors[0]).toBe('#003366'); // stocks
    expect(colors[1]).toBe('#78dc77'); // crypto
  });

  it('should show legend with percentages', () => {
    fixture.componentRef.setInput('groupedHoldings', mockGrouped);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Stocks');
    expect(el.textContent).toContain('Crypto');
    // Percentages: stocks = 8900/(8900+22500) ~28%, crypto ~72%
    expect(el.textContent).toMatch(/\d+%/);
  });
});
