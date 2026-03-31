import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PriceChartComponent } from './price-chart.component';
import { ApiService } from '../../services/api.service';

describe('PriceChartComponent', () => {
  let component: PriceChartComponent;
  let fixture: ComponentFixture<PriceChartComponent>;
  let apiService: ApiService;

  const mockHistory = {
    ticker: 'AAPL',
    range: '1M',
    data: [
      { date: '2026-03-01', price: 172.3 },
      { date: '2026-03-02', price: 173.1 },
      { date: '2026-03-15', price: 175.5 },
      { date: '2026-03-31', price: 178.5 },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceChartComponent],
      providers: [ApiService],
    }).compileComponents();
    apiService = TestBed.inject(ApiService);
    fixture = TestBed.createComponent(PriceChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('ticker', 'AAPL');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should default to 1M range', () => {
    fixture.detectChanges();
    expect(component.selectedRange()).toBe('1M');
  });

  it('should render all 5 range toggle buttons', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const buttons = el.querySelectorAll('.range-btn');
    expect(buttons.length).toBe(5);
    const labels = Array.from(buttons).map(b => b.textContent?.trim());
    expect(labels).toEqual(['1W', '1M', '3M', '1Y', 'All']);
  });

  it('should mark active range button', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const activeBtn = el.querySelector('.range-btn.active');
    expect(activeBtn?.textContent?.trim()).toBe('1M');
  });

  it('should have a chart container element', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const container = el.querySelector('.chart-container');
    expect(container).toBeTruthy();
  });

  it('should change selected range when selectRange is called', () => {
    fixture.detectChanges();
    component.selectRange('1W');
    fixture.detectChanges();
    expect(component.selectedRange()).toBe('1W');
    const el: HTMLElement = fixture.nativeElement;
    const activeBtn = el.querySelector('.range-btn.active');
    expect(activeBtn?.textContent?.trim()).toBe('1W');
  });

  it('should fetch history data on range change', fakeAsync(() => {
    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(new Response(JSON.stringify(mockHistory), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
    );
    fixture.detectChanges();
    tick();

    // Initial fetch for default 1M
    expect(window.fetch).toHaveBeenCalledWith(
      jasmine.stringContaining('/api/holdings/AAPL/history?range=1M')
    );

    (window.fetch as jasmine.Spy).calls.reset();

    component.selectRange('1Y');
    tick();

    expect(window.fetch).toHaveBeenCalledWith(
      jasmine.stringContaining('/api/holdings/AAPL/history?range=1Y')
    );
  }));

  it('should show loading state while fetching', () => {
    fixture.detectChanges();
    // Before fetch resolves, loading should be true
    expect(component.loading()).toBeTrue();
  });

  it('should disable range buttons while loading', () => {
    component.loading.set(true);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const buttons = el.querySelectorAll('.range-btn[disabled]');
    expect(buttons.length).toBe(5);
  });
});
