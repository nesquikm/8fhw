import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMarkdown } from 'ngx-markdown';
import { MessageListComponent } from './message-list.component';
import { ChatMessage } from '../../../models/chat.model';

describe('MessageListComponent', () => {
  let component: MessageListComponent;
  let fixture: ComponentFixture<MessageListComponent>;

  const mockMessages: ChatMessage[] = [
    { id: 1, role: 'user', content: 'Hello', createdAt: '2026-03-31T10:00:00Z' },
    { id: 2, role: 'assistant', content: 'Hi there', createdAt: '2026-03-31T10:00:05Z' },
    { id: 3, role: 'user', content: 'Follow up', createdAt: '2026-03-31T10:01:00Z' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageListComponent],
      providers: [provideRouter([]), provideMarkdown()],
    }).compileComponents();

    fixture = TestBed.createComponent(MessageListComponent);
    fixture.componentRef.setInput('messages', mockMessages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render message bubbles for each message', () => {
    const bubbles = fixture.nativeElement.querySelectorAll('app-message-bubble');
    expect(bubbles.length).toBe(3);
  });

  it('should apply new-sender class when sender changes', () => {
    const wrappers = fixture.nativeElement.querySelectorAll('.message-wrapper');
    // First message (user) → new-sender
    expect(wrappers[0].classList.contains('new-sender')).toBeTrue();
    // Second message (assistant, different from user) → new-sender
    expect(wrappers[1].classList.contains('new-sender')).toBeTrue();
    // Third message (user, different from assistant) → new-sender
    expect(wrappers[2].classList.contains('new-sender')).toBeTrue();
  });

  it('should apply same-sender class for consecutive same-sender messages', () => {
    const sameSenderMessages: ChatMessage[] = [
      { id: 1, role: 'user', content: 'Hi', createdAt: '2026-03-31T10:00:00Z' },
      { id: 2, role: 'user', content: 'Another', createdAt: '2026-03-31T10:00:01Z' },
    ];
    fixture.componentRef.setInput('messages', sameSenderMessages);
    fixture.detectChanges();

    const wrappers = fixture.nativeElement.querySelectorAll('.message-wrapper');
    expect(wrappers[1].classList.contains('same-sender')).toBeTrue();
  });

  it('should have a scrollable container', () => {
    const container = fixture.nativeElement.querySelector('.messages');
    expect(container).toBeTruthy();
  });
});
