import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { HoldingLinkComponent } from './holding-link.component';

describe('HoldingLinkComponent', () => {
  let component: HoldingLinkComponent;
  let fixture: ComponentFixture<HoldingLinkComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoldingLinkComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(HoldingLinkComponent);
    fixture.componentRef.setInput('ticker', 'AAPL');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display ticker text in uppercase', () => {
    const chipEl = fixture.nativeElement.querySelector('ion-chip');
    expect(chipEl.textContent.trim()).toBe('AAPL');
  });

  it('should navigate to holding detail on click', () => {
    const spy = spyOn(router, 'navigate');
    component.navigate();
    expect(spy).toHaveBeenCalledWith(['/holding', 'AAPL']);
  });

  it('should have holding-chip class for styling', () => {
    const chipEl = fixture.nativeElement.querySelector('.holding-chip');
    expect(chipEl).toBeTruthy();
  });
});
