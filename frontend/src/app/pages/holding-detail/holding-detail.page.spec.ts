import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { HoldingDetailPage } from './holding-detail.page';
import { HoldingDetail } from '../../models/holding.model';

describe('HoldingDetailPage', () => {
  let component: HoldingDetailPage;
  let fixture: ComponentFixture<HoldingDetailPage>;

  const mockDetail: HoldingDetail = {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    sector: 'Technology',
    description: 'Consumer electronics, software, and services',
    quantity: 50,
    currentPrice: 178.5,
    currentValue: 8925,
    avgBuyPrice: 155,
    gainLoss: 1175,
    gainLossPercent: 15.16,
    portfolioPercent: 7.12,
  };

  beforeEach(async () => {
    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(new Response(JSON.stringify(mockDetail), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
    );

    await TestBed.configureTestingModule({
      imports: [HoldingDetailPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'ticker' ? 'aapl' : null),
              },
            },
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HoldingDetailPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should extract and uppercase ticker from route', () => {
    fixture.detectChanges();
    expect(component.ticker).toBe('AAPL');
  });

  it('should start with loading true', () => {
    expect(component.loading()).toBeTrue();
  });

  it('should display holding name in header when loaded', () => {
    component.loading.set(false);
    component.holding.set(mockDetail);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const title = el.querySelector('ion-title');
    expect(title?.textContent).toContain('Apple Inc.');
  });

  it('should display ticker subtitle in header when loaded', () => {
    component.loading.set(false);
    component.holding.set(mockDetail);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const subtitle = el.querySelector('.ticker-subtitle');
    expect(subtitle?.textContent?.trim()).toBe('AAPL');
  });

  it('should have a back button', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const backBtn = el.querySelector('ion-back-button');
    expect(backBtn).toBeTruthy();
  });

  it('should compute formatted price from holding', () => {
    component.holding.set(mockDetail);
    expect(component.formattedPrice()).toBe('$178.50');
  });

  it('should compute formatted gain/loss with sign', () => {
    component.holding.set(mockDetail);
    expect(component.formattedGainLoss()).toContain('+$1,175.00');
  });

  it('should compute formatted gain/loss percent', () => {
    component.holding.set(mockDetail);
    expect(component.formattedGainLossPercent()).toBe('+15.16%');
  });

  it('should compute negative gain/loss percent for losses', () => {
    component.holding.set({ ...mockDetail, gainLoss: -500, gainLossPercent: -5.5 });
    expect(component.formattedGainLossPercent()).toBe('-5.50%');
  });

  it('should fetch holding detail on init', () => {
    fixture.detectChanges();
    expect(window.fetch).toHaveBeenCalledWith(
      jasmine.stringContaining('/api/holdings/AAPL')
    );
  });

  it('should expose holding data via signal', () => {
    component.holding.set(mockDetail);
    const h = component.holding();
    expect(h?.name).toBe('Apple Inc.');
    expect(h?.description).toBe('Consumer electronics, software, and services');
    expect(h?.sector).toBe('Technology');
    expect(h?.currentPrice).toBe(178.5);
  });
});
