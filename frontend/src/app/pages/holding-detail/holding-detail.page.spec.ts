import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { HoldingDetailPage } from './holding-detail.page';

describe('HoldingDetailPage', () => {
  let component: HoldingDetailPage;
  let fixture: ComponentFixture<HoldingDetailPage>;

  beforeEach(async () => {
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should extract and uppercase ticker from route', () => {
    expect(component.ticker).toBe('AAPL');
  });
});
