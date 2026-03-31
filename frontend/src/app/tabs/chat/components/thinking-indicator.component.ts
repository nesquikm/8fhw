import { Component } from '@angular/core';

@Component({
  selector: 'app-thinking-indicator',
  template: `
    <div class="bubble assistant">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
    }
    .bubble {
      margin-right: auto;
      background: var(--app-surface-container);
      border-radius: var(--radius-lg);
      border-bottom-left-radius: var(--spacing-1);
      padding: var(--spacing-3) var(--spacing-4);
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--ion-color-medium);
      animation: pulse 1.4s infinite ease-in-out;
    }
    .dot:nth-child(2) {
      animation-delay: 0.2s;
    }
    .dot:nth-child(3) {
      animation-delay: 0.4s;
    }
    @keyframes pulse {
      0%, 80%, 100% {
        opacity: 0.3;
        transform: scale(0.8);
      }
      40% {
        opacity: 1;
        transform: scale(1);
      }
    }
  `],
})
export class ThinkingIndicatorComponent {}
