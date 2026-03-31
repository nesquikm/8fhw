import { Component, input, output, signal } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowUp } from 'ionicons/icons';

@Component({
  selector: 'app-chat-input',
  template: `
    <div class="input-container">
      <input
        type="text"
        class="chat-input"
        placeholder="Ask about your portfolio..."
        [value]="inputValue()"
        (input)="onInput($event)"
        (keydown.enter)="send()"
        [disabled]="!canSend()"
      />
      <button
        class="send-button"
        [disabled]="!inputValue().trim() || !canSend()"
        (click)="send()"
      >
        <ion-icon name="arrow-up"></ion-icon>
      </button>
    </div>
  `,
  styles: [`
    .input-container {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-4);
      padding-bottom: calc(var(--spacing-4) + env(safe-area-inset-bottom));
      background: white;
      border-top: 1px solid rgba(195, 198, 209, 0.15);
    }
    .chat-input {
      flex: 1;
      border: none;
      outline: none;
      background: var(--app-surface-low);
      border-radius: var(--radius-md);
      padding: var(--spacing-3) var(--spacing-4);
      font-family: var(--ion-font-family);
      font-size: 1rem;
      color: var(--ion-text-color);
    }
    .chat-input::placeholder {
      color: var(--ion-color-medium);
    }
    .chat-input:disabled {
      opacity: 0.6;
    }
    .send-button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: var(--ion-color-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
    }
    .send-button:disabled {
      opacity: 0.4;
      cursor: default;
    }
    .send-button ion-icon {
      font-size: 1.25rem;
    }
  `],
  imports: [IonIcon],
})
export class ChatInputComponent {
  readonly canSend = input<boolean>(true);
  readonly messageSent = output<string>();

  readonly inputValue = signal('');

  constructor() {
    addIcons({ arrowUp });
  }

  onInput(event: Event): void {
    this.inputValue.set((event.target as HTMLInputElement).value);
  }

  prefill(prompt: string): void {
    this.inputValue.set(prompt);
  }

  send(): void {
    const value = this.inputValue().trim();
    if (!value || !this.canSend()) return;
    this.messageSent.emit(value);
    this.inputValue.set('');
  }
}
