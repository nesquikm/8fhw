import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThinkingIndicatorComponent } from './thinking-indicator.component';

describe('ThinkingIndicatorComponent', () => {
  let component: ThinkingIndicatorComponent;
  let fixture: ComponentFixture<ThinkingIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThinkingIndicatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ThinkingIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render three animated dots', () => {
    const dots = fixture.nativeElement.querySelectorAll('.dot');
    expect(dots.length).toBe(3);
  });

  it('should have assistant bubble styling', () => {
    const bubble = fixture.nativeElement.querySelector('.bubble.assistant');
    expect(bubble).toBeTruthy();
  });
});
