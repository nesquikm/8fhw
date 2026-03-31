import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardPage } from './dashboard.page';
import { PortfolioService } from '../../services/portfolio.service';
import { InsightsService } from '../../services/insights.service';
import { Portfolio } from '../../models/portfolio.model';
import { Insight } from '../../models/insight.model';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let portfolioService: PortfolioService;
  let insightsService: InsightsService;

  const mockPortfolio: Portfolio = {
    totalValue: 125430.50,
    dailyChange: 1250.30,
    dailyChangePercent: 1.01,
    holdings: [
      { ticker: 'AAPL', name: 'Apple Inc.', type: 'stock', quantity: 50, currentPrice: 178.5, currentValue: 8925, avgBuyPrice: 155, gainLoss: 1175, gainLossPercent: 15.16, portfolioPercent: 60 },
      { ticker: 'BTC', name: 'Bitcoin', type: 'crypto', quantity: 0.5, currentPrice: 45000, currentValue: 22500, avgBuyPrice: 30000, gainLoss: 7500, gainLossPercent: 50, portfolioPercent: 40 },
    ],
  };

  const mockInsights: Insight[] = [
    { id: '1', title: 'High Tech', summary: 'Tech heavy', prompt: 'Tell me about tech' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [provideRouter([])],
    }).compileComponents();

    portfolioService = TestBed.inject(PortfolioService);
    insightsService = TestBed.inject(InsightsService);

    // Pre-set service state instead of making HTTP calls
    spyOn(portfolioService, 'load').and.callFake(async () => {
      portfolioService.portfolio.set(mockPortfolio);
    });
    spyOn(insightsService, 'load').and.callFake(async () => {
      insightsService.insights.set(mockInsights);
    });

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // Wait for async ngOnInit
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load portfolio and insights on init', () => {
    expect(portfolioService.load).toHaveBeenCalled();
    expect(insightsService.load).toHaveBeenCalled();
  });

  it('should render portfolio summary with total value', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('$125,430.50');
  });

  it('should render allocation chart', () => {
    const chart = fixture.nativeElement.querySelector('app-allocation-chart');
    expect(chart).toBeTruthy();
  });

  it('should render insight cards', () => {
    const cards = fixture.nativeElement.querySelector('app-insight-cards');
    expect(cards).toBeTruthy();
  });

  it('should render holdings list', () => {
    const list = fixture.nativeElement.querySelector('app-holdings-list');
    expect(list).toBeTruthy();
  });

  it('should show skeleton when loading with no data', () => {
    portfolioService.portfolio.set(null);
    portfolioService.loading.set(true);
    fixture.detectChanges();
    const skeleton = fixture.nativeElement.querySelector('.skeleton-hero');
    expect(skeleton).toBeTruthy();
  });

  it('should have ion-refresher for pull-to-refresh', () => {
    const refresher = fixture.nativeElement.querySelector('ion-refresher');
    expect(refresher).toBeTruthy();
  });
});
