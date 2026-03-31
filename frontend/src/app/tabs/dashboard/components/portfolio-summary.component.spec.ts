import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioSummaryComponent } from './portfolio-summary.component';

describe('PortfolioSummaryComponent', () => {
  let component: PortfolioSummaryComponent;
  let fixture: ComponentFixture<PortfolioSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioSummaryComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(PortfolioSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display total value formatted as currency', () => {
    fixture.componentRef.setInput('totalValue', 125430.5);
    fixture.componentRef.setInput('dailyChange', 1250.3);
    fixture.componentRef.setInput('dailyChangePercent', 1.01);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('$125,430.50');
  });

  it('should display daily change with sign and percent', () => {
    fixture.componentRef.setInput('totalValue', 125430.5);
    fixture.componentRef.setInput('dailyChange', 1250.3);
    fixture.componentRef.setInput('dailyChangePercent', 1.01);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('+$1,250.30');
    expect(el.textContent).toContain('+1.01%');
  });

  it('should apply gain styling for positive change', () => {
    fixture.componentRef.setInput('totalValue', 100000);
    fixture.componentRef.setInput('dailyChange', 500);
    fixture.componentRef.setInput('dailyChangePercent', 0.5);
    fixture.detectChanges();
    const chip = fixture.nativeElement.querySelector('.change-chip');
    expect(chip).toBeTruthy();
    expect(chip.classList).toContain('chip-gain');
  });

  it('should apply loss styling for negative change', () => {
    fixture.componentRef.setInput('totalValue', 100000);
    fixture.componentRef.setInput('dailyChange', -500);
    fixture.componentRef.setInput('dailyChangePercent', -0.5);
    fixture.detectChanges();
    const chip = fixture.nativeElement.querySelector('.change-chip');
    expect(chip).toBeTruthy();
    expect(chip.classList).toContain('chip-loss');
  });

  it('should show TOTAL BALANCE label', () => {
    fixture.componentRef.setInput('totalValue', 0);
    fixture.componentRef.setInput('dailyChange', 0);
    fixture.componentRef.setInput('dailyChangePercent', 0);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent?.toUpperCase()).toContain('TOTAL BALANCE');
  });
});
