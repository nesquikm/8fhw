import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InsightCardsComponent } from './insight-cards.component';
import { Insight } from '../../../models/insight.model';

describe('InsightCardsComponent', () => {
  let component: InsightCardsComponent;
  let fixture: ComponentFixture<InsightCardsComponent>;

  const mockInsights: Insight[] = [
    { id: '1', title: 'High Tech Concentration', summary: '70% of your portfolio is in tech stocks.', prompt: 'Tell me about my tech allocation' },
    { id: '2', title: 'Performance Leader', summary: 'NVDA is up 25% this week.', prompt: 'Why is NVDA performing well?' },
    { id: '3', title: 'Crypto Exposure', summary: 'Your crypto allocation is 15%.', prompt: 'Should I increase crypto?' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsightCardsComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(InsightCardsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('insights', []);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display Portfolio Insights header', () => {
    fixture.componentRef.setInput('insights', mockInsights);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Portfolio Insights');
  });

  it('should render all insight cards', () => {
    fixture.componentRef.setInput('insights', mockInsights);
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.insight-card');
    expect(cards.length).toBe(3);
  });

  it('should display title and summary on each card', () => {
    fixture.componentRef.setInput('insights', mockInsights);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('High Tech Concentration');
    expect(el.textContent).toContain('70% of your portfolio is in tech stocks.');
  });

  it('should emit prompt when card is tapped', () => {
    fixture.componentRef.setInput('insights', mockInsights);
    fixture.detectChanges();
    const emitted: string[] = [];
    component.promptSelected.subscribe((p: string) => emitted.push(p));
    const card = fixture.nativeElement.querySelector('.insight-card') as HTMLElement;
    card.click();
    expect(emitted.length).toBe(1);
    expect(emitted[0]).toBe('Tell me about my tech allocation');
  });

  it('should render dot indicators matching card count', () => {
    fixture.componentRef.setInput('insights', mockInsights);
    fixture.detectChanges();
    const dots = fixture.nativeElement.querySelectorAll('.dot');
    expect(dots.length).toBe(3);
  });
});
