import { TestBed } from '@angular/core/testing';
import { InsightsService } from './insights.service';
import { ApiService } from './api.service';

describe('InsightsService', () => {
  let service: InsightsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: { baseUrl: '', url: (p: string) => p } }],
    });
    service = TestBed.inject(InsightsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty insights', () => {
    expect(service.insights()).toEqual([]);
  });

  describe('load()', () => {
    it('should fetch insight cards from backend', async () => {
      await service.load();
      expect(service.error()).toBeNull();
      const insights = service.insights();
      expect(insights.length).toBeGreaterThan(0);
    });

    it('should expose insights with all required fields', async () => {
      await service.load();
      const insight = service.insights()[0];
      expect(insight.id).toBeTruthy();
      expect(insight.title).toBeTruthy();
      expect(insight.summary).toBeTruthy();
      expect(insight.prompt).toBeTruthy();
    });

    it('should set loading flag during fetch', async () => {
      const promise = service.load();
      expect(service.loading()).toBeTrue();
      await promise;
      expect(service.loading()).toBeFalse();
    });
  });
});
