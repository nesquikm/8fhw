import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMarkdown } from 'ngx-markdown';
import { MessageBubbleComponent } from './message-bubble.component';
import { ChatMessage } from '../../../models/chat.model';

describe('MessageBubbleComponent', () => {
  let component: MessageBubbleComponent;
  let fixture: ComponentFixture<MessageBubbleComponent>;

  function createMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
    return {
      id: 1,
      role: 'user',
      content: 'Hello',
      createdAt: '2026-03-31T10:00:00Z',
      ...overrides,
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageBubbleComponent],
      providers: [provideRouter([]), provideMarkdown()],
    }).compileComponents();

    fixture = TestBed.createComponent(MessageBubbleComponent);
  });

  it('should create', () => {
    fixture.componentRef.setInput('message', createMessage());
    fixture.detectChanges();
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should apply user class for user messages', () => {
    fixture.componentRef.setInput('message', createMessage({ role: 'user' }));
    fixture.detectChanges();
    const bubble = fixture.nativeElement.querySelector('.bubble');
    expect(bubble.classList.contains('user')).toBeTrue();
    expect(bubble.classList.contains('assistant')).toBeFalse();
  });

  it('should apply assistant class for assistant messages', () => {
    fixture.componentRef.setInput('message', createMessage({ role: 'assistant' }));
    fixture.detectChanges();
    const bubble = fixture.nativeElement.querySelector('.bubble');
    expect(bubble.classList.contains('assistant')).toBeTrue();
    expect(bubble.classList.contains('user')).toBeFalse();
  });

  it('should render markdown in assistant messages', () => {
    fixture.componentRef.setInput('message', createMessage({
      role: 'assistant',
      content: '**bold text**',
    }));
    fixture.detectChanges();
    const markdown = fixture.nativeElement.querySelector('markdown');
    expect(markdown).toBeTruthy();
  });

  it('should render holding link chips for [HOLDING:TICKER] patterns', () => {
    fixture.componentRef.setInput('message', createMessage({
      role: 'assistant',
      content: 'Check [HOLDING:AAPL] now',
    }));
    fixture.detectChanges();
    const holdingLink = fixture.nativeElement.querySelector('app-holding-link');
    expect(holdingLink).toBeTruthy();
  });

  describe('splitIntoSegments', () => {
    it('should return plain text as single text segment', () => {
      const segments = MessageBubbleComponent.splitIntoSegments('Hello world');
      expect(segments).toEqual([{ type: 'text', value: 'Hello world' }]);
    });

    it('should split text with holding ticker', () => {
      const segments = MessageBubbleComponent.splitIntoSegments('Check [HOLDING:AAPL] now');
      expect(segments).toEqual([
        { type: 'text', value: 'Check ' },
        { type: 'holding', value: 'AAPL' },
        { type: 'text', value: ' now' },
      ]);
    });

    it('should handle multiple holding tickers', () => {
      const segments = MessageBubbleComponent.splitIntoSegments(
        '[HOLDING:AAPL] and [HOLDING:BTC] are great',
      );
      expect(segments).toEqual([
        { type: 'holding', value: 'AAPL' },
        { type: 'text', value: ' and ' },
        { type: 'holding', value: 'BTC' },
        { type: 'text', value: ' are great' },
      ]);
    });

    it('should handle text starting with holding ticker', () => {
      const segments = MessageBubbleComponent.splitIntoSegments('[HOLDING:TSLA] is volatile');
      expect(segments).toEqual([
        { type: 'holding', value: 'TSLA' },
        { type: 'text', value: ' is volatile' },
      ]);
    });

    it('should handle text ending with holding ticker', () => {
      const segments = MessageBubbleComponent.splitIntoSegments('Look at [HOLDING:ETH]');
      expect(segments).toEqual([
        { type: 'text', value: 'Look at ' },
        { type: 'holding', value: 'ETH' },
      ]);
    });

    it('should return empty array for empty string', () => {
      const segments = MessageBubbleComponent.splitIntoSegments('');
      expect(segments).toEqual([]);
    });
  });
});
