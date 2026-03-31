import { Component, computed, inject, OnInit, viewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { ChatService } from '../../services/chat.service';
import { MessageListComponent } from './components/message-list.component';
import { ChatInputComponent } from './components/chat-input.component';
import { ThinkingIndicatorComponent } from './components/thinking-indicator.component';
import { MessageBubbleComponent } from './components/message-bubble.component';
import { ChatMessage } from '../../models/chat.model';

@Component({
  selector: 'app-chat',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>AI Assistant</ion-title>
      </ion-toolbar>
    </ion-header>

    <div class="chat-body">
      @if (chatService.messages().length === 0 && chatService.state() === 'idle' && !chatService.error()) {
        <div class="empty-state">
          <p class="empty-text">Ask me anything about your portfolio</p>
          <button class="suggested-prompt" (click)="sendMessage('How is my portfolio doing today?')">
            How is my portfolio doing today?
          </button>
        </div>
      } @else {
        <app-message-list [messages]="chatService.messages()">
          @if (chatService.state() === 'streaming' && chatService.streamingContent()) {
            <div class="message-wrapper new-sender" style="margin-top: var(--spacing-4)">
              <app-message-bubble [message]="streamingMessage()" />
            </div>
          }
          @if (chatService.state() === 'thinking') {
            <div class="message-wrapper new-sender" style="margin-top: var(--spacing-4)">
              <app-thinking-indicator />
            </div>
          }
        </app-message-list>
      }

      @if (chatService.error()) {
        <div class="error-banner">
          <span>{{ chatService.error() }}</span>
          <button class="retry-button" (click)="retry()">Retry</button>
        </div>
      }

      <app-chat-input
        [canSend]="chatService.state() === 'idle'"
        (messageSent)="sendMessage($event)"
      />
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    ion-toolbar {
      --background: var(--ion-toolbar-background);
      --color: var(--ion-toolbar-color);
    }
    ion-title {
      font-size: 1.25rem;
      font-weight: 600;
    }
    .chat-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--app-surface);
    }
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-4);
      padding: var(--spacing-5);
    }
    .empty-text {
      color: var(--ion-color-medium);
      font-size: 1rem;
      text-align: center;
    }
    .suggested-prompt {
      background: var(--app-surface-low);
      border: none;
      border-radius: var(--radius-md);
      padding: var(--spacing-3) var(--spacing-4);
      color: var(--ion-color-primary);
      font-family: var(--ion-font-family);
      font-size: 0.875rem;
      cursor: pointer;
    }
    .error-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-3) var(--spacing-5);
      background: var(--app-loss-bg);
      color: var(--app-loss);
      font-size: 0.875rem;
    }
    .retry-button {
      background: none;
      border: 1px solid var(--app-loss);
      border-radius: var(--radius-sm);
      color: var(--app-loss);
      padding: var(--spacing-1) var(--spacing-3);
      font-family: var(--ion-font-family);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
    }
    .message-wrapper {
      margin-top: var(--spacing-4);
    }
  `],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    MessageListComponent,
    ChatInputComponent,
    ThinkingIndicatorComponent,
    MessageBubbleComponent,
  ],
})
export class ChatPage implements OnInit {
  readonly chatService = inject(ChatService);
  private readonly chatInput = viewChild(ChatInputComponent);
  private lastSentContent = '';

  readonly streamingMessage = computed<ChatMessage>(() => ({
    id: -1,
    role: 'assistant',
    content: this.chatService.streamingContent(),
    createdAt: new Date().toISOString(),
  }));

  ngOnInit(): void {
    this.chatService.loadHistory();

    const state = history.state;
    if (state?.prefillPrompt) {
      setTimeout(() => {
        this.chatInput()?.prefill(state.prefillPrompt);
      });
    }
  }

  sendMessage(content: string): void {
    this.lastSentContent = content;
    this.chatService.sendMessage(content);
  }

  retry(): void {
    this.chatService.dismissError();
    if (this.lastSentContent) {
      // Remove the duplicate user message that was added on the failed attempt
      const msgs = this.chatService.messages();
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg?.role === 'user' && lastMsg.content === this.lastSentContent) {
        this.chatService.messages.set(msgs.slice(0, -1));
      }
      this.chatService.sendMessage(this.lastSentContent);
    }
  }
}
