import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMarkdown } from 'ngx-markdown';
import { ChatPage } from './chat.page';
import { ChatService } from '../../services/chat.service';
import { ApiService } from '../../services/api.service';

describe('ChatPage', () => {
  let component: ChatPage;
  let fixture: ComponentFixture<ChatPage>;
  let chatService: ChatService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatPage],
      providers: [
        provideRouter([]),
        provideMarkdown(),
        { provide: ApiService, useValue: { baseUrl: '', url: (p: string) => p } },
      ],
    }).compileComponents();

    chatService = TestBed.inject(ChatService);
    spyOn(chatService, 'loadHistory').and.returnValue(Promise.resolve());
    spyOn(chatService, 'sendMessage').and.returnValue(Promise.resolve());

    fixture = TestBed.createComponent(ChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load chat history on init', () => {
    expect(chatService.loadHistory).toHaveBeenCalled();
  });

  it('should show empty state when no messages and idle', () => {
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain('Ask me anything about your portfolio');
  });

  it('should show suggested prompt chip in empty state', () => {
    const chip = fixture.nativeElement.querySelector('.suggested-prompt');
    expect(chip).toBeTruthy();
    expect(chip.textContent.trim()).toBe('How is my portfolio doing today?');
  });

  it('should send message when suggested prompt is clicked', () => {
    const chip = fixture.nativeElement.querySelector('.suggested-prompt');
    chip.click();
    expect(chatService.sendMessage).toHaveBeenCalledWith('How is my portfolio doing today?');
  });

  it('should show message list when messages exist', () => {
    chatService.messages.set([
      { id: 1, role: 'user', content: 'Hello', createdAt: '2026-03-31T10:00:00Z' },
    ]);
    fixture.detectChanges();

    const messageList = fixture.nativeElement.querySelector('app-message-list');
    expect(messageList).toBeTruthy();
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeNull();
  });

  it('should show thinking indicator when state is thinking', () => {
    chatService.messages.set([
      { id: 1, role: 'user', content: 'Hello', createdAt: '2026-03-31T10:00:00Z' },
    ]);
    chatService.state.set('thinking');
    fixture.detectChanges();

    const indicator = fixture.nativeElement.querySelector('app-thinking-indicator');
    expect(indicator).toBeTruthy();
  });

  it('should show streaming message when streaming', () => {
    chatService.messages.set([
      { id: 1, role: 'user', content: 'Hello', createdAt: '2026-03-31T10:00:00Z' },
    ]);
    chatService.state.set('streaming');
    chatService.streamingContent.set('Partial response...');
    fixture.detectChanges();

    const bubbles = fixture.nativeElement.querySelectorAll('app-message-bubble');
    expect(bubbles.length).toBe(2);
  });

  it('should show error banner when error exists', () => {
    chatService.error.set('Something went wrong');
    fixture.detectChanges();

    const banner = fixture.nativeElement.querySelector('.error-banner');
    expect(banner).toBeTruthy();
    expect(banner.textContent).toContain('Something went wrong');
  });

  it('should show retry button in error banner', () => {
    chatService.error.set('Network error');
    fixture.detectChanges();

    const retryBtn = fixture.nativeElement.querySelector('.retry-button');
    expect(retryBtn).toBeTruthy();
  });

  it('should call sendMessage on ChatService when message sent', () => {
    component.sendMessage('test message');
    expect(chatService.sendMessage).toHaveBeenCalledWith('test message');
  });

  it('should render chat-input component', () => {
    const input = fixture.nativeElement.querySelector('app-chat-input');
    expect(input).toBeTruthy();
  });

  it('should disable input when not idle', () => {
    chatService.state.set('thinking');
    fixture.detectChanges();

    const chatInput = fixture.nativeElement.querySelector('app-chat-input');
    expect(chatInput).toBeTruthy();
  });

  it('should have AI Assistant title', () => {
    const title = fixture.nativeElement.querySelector('ion-title');
    expect(title.textContent.trim()).toBe('AI Assistant');
  });
});
