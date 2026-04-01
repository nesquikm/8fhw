import { Component, computed, effect, inject, OnInit, untracked, viewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFooter } from '@ionic/angular/standalone';
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

    <ion-content class="chat-content" #chatContent>
      @if (chatService.messages().length === 0 && chatService.state() === 'idle' && !chatService.error()) {
        <div class="empty-state">
          <p class="empty-text">Ask me anything about your portfolio</p>
          <button class="suggested-prompt" (click)="sendMessage('How is my portfolio doing today?')">
            How is my portfolio doing today?
          </button>
        </div>
      } @else {
        <app-message-list [messages]="chatService.messages()" [scrollTrigger]="chatService.streamingContent()">
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
    </ion-content>

    <ion-footer class="chat-footer">
      <app-chat-input
        [canSend]="chatService.state() === 'idle'"
        (messageSent)="sendMessage($event)"
      />
    </ion-footer>
  `,
  styles: [`
    ion-toolbar {
      --background: var(--ion-toolbar-background);
      --color: var(--ion-toolbar-color);
    }
    ion-title {
      font-size: 1.25rem;
      font-weight: 600;
    }
    .chat-content {
      --background: var(--app-surface);
    }
    .chat-footer {
      background: transparent;
      box-shadow: none;
    }
    .empty-state {
      height: 100%;
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
    IonContent,
    IonFooter,
    MessageListComponent,
    ChatInputComponent,
    ThinkingIndicatorComponent,
    MessageBubbleComponent,
  ],
})
export class ChatPage implements OnInit {
  readonly chatService = inject(ChatService);
  private lastSentContent = '';
  private readonly contentEl = viewChild<IonContent>('chatContent');

  readonly streamingMessage = computed<ChatMessage>(() => ({
    id: -1,
    role: 'assistant',
    content: this.chatService.streamingContent(),
    createdAt: new Date().toISOString(),
  }));

  constructor() {
    effect(() => {
      const prompt = this.chatService.pendingPrompt();
      if (prompt) {
        untracked(() => {
          this.chatService.pendingPrompt.set(null);
          this.sendMessage(prompt);
        });
      }
    });

    // Scroll to bottom when messages change or streaming updates
    effect(() => {
      this.chatService.messages();
      this.chatService.streamingContent();
      this.scrollToBottom();
    });
  }

  private scrollToBottom(): void {
    requestAnimationFrame(() => {
      this.contentEl()?.scrollToBottom(100);
    });
  }

  // Ionic lifecycle: fires each time this tab becomes active (after transition)
  ionViewDidEnter(): void {
    this.scrollToBottom();
  }

  ngOnInit(): void {
    this.chatService.loadHistory();
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
