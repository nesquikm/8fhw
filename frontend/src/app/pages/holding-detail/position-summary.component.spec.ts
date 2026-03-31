import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PositionSummaryComponent } from './position-summary.component';
import { HoldingDetail } from '../../models/holding.model';

describe('PositionSummaryComponent', () => {
  let component: PositionSummaryComponent;
  let fixture: ComponentFixture<PositionSummaryComponent>;

  const mockHolding: HoldingDetail = {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    sector: 'Technology',
    description: 'Consumer electronics and software',
    quantity: 50,
    currentPrice: 178.5,
    currentValue: 8925,
    avgBuyPrice: 155,
    gainLoss: 1175,
    gainLossPercent: 15.16,
    portfolioPercent: 7.12,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PositionSummaryComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(PositionSummaryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('holding', mockHolding);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display YOUR POSITION header', () => {
    const el: HTMLElement = fixture.nativeElement;
    const header = el.querySelector('.position-header');
    expect(header?.textContent?.trim()).toBe('YOUR POSITION');
  });

  it('should display current value', () => {
    const el: HTMLElement = fixture.nativeElement;
    const text = el.textContent ?? '';
    expect(text).toContain('$8,925.00');
  });

  it('should display gain/loss with sign', () => {
    const el: HTMLElement = fixture.nativeElement;
    const text = el.textContent ?? '';
    expect(text).toContain('+$1,175.00');
    expect(text).toContain('+15.16%');
  });

  it('should display quantity', () => {
    const el: HTMLElement = fixture.nativeElement;
    const text = el.textContent ?? '';
    expect(text).toContain('50.00');
  });

  it('should display avg buy price', () => {
    const el: HTMLElement = fixture.nativeElement;
    const text = el.textContent ?? '';
    expect(text).toContain('$155.00');
  });

  it('should display portfolio weight', () => {
    const el: HTMLElement = fixture.nativeElement;
    const text = el.textContent ?? '';
    expect(text).toContain('7.12%');
  });

  it('should display sector', () => {
    const el: HTMLElement = fixture.nativeElement;
    const text = el.textContent ?? '';
    expect(text).toContain('Technology');
  });

  it('should apply gain class for positive gain/loss', () => {
    const el: HTMLElement = fixture.nativeElement;
    const gainEl = el.querySelector('.gain');
    expect(gainEl).toBeTruthy();
  });

  it('should apply loss class for negative gain/loss', () => {
    fixture.componentRef.setInput('holding', { ...mockHolding, gainLoss: -500, gainLossPercent: -5.5 });
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const lossEl = el.querySelector('.loss');
    expect(lossEl).toBeTruthy();
  });
});
