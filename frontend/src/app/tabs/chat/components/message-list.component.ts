import { Component, ElementRef, effect, input, viewChild } from '@angular/core';
import { ChatMessage } from '../../../models/chat.model';
import { MessageBubbleComponent } from './message-bubble.component';

@Component({
  selector: 'app-message-list',
  template: `
    <div class="messages" #scrollContainer>
      @for (message of messages(); track message.id; let i = $index) {
        <div
          class="message-wrapper"
          [class.same-sender]="i > 0 && messages()[i - 1].role === message.role"
          [class.new-sender]="i === 0 || messages()[i - 1].role !== message.role"
        >
          <app-message-bubble [message]="message" />
        </div>
      }
      <ng-content />
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }
    .messages {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-4) var(--spacing-5);
      display: flex;
      flex-direction: column;
    }
    .message-wrapper.same-sender {
      margin-top: var(--spacing-2);
    }
    .message-wrapper.new-sender {
      margin-top: var(--spacing-4);
    }
    .message-wrapper:first-child {
      margin-top: auto;
    }
  `],
  imports: [MessageBubbleComponent],
})
export class MessageListComponent {
  readonly messages = input.required<ChatMessage[]>();
  readonly scrollTrigger = input<unknown>(undefined);

  private readonly scrollContainer = viewChild<ElementRef>('scrollContainer');

  constructor() {
    effect(() => {
      this.messages();
      this.scrollTrigger();
      this.scrollToBottom();
    });
  }

  scrollToBottom(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = this.scrollContainer()?.nativeElement;
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      });
    });
  }
}
