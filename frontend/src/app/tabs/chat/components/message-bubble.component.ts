import { Component, computed, input } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';
import { HoldingLinkComponent } from '../../../components/holding-link/holding-link.component';
import { ChatMessage } from '../../../models/chat.model';

export interface MessageSegment {
  type: 'text' | 'holding';
  value: string;
}

@Component({
  selector: 'app-message-bubble',
  template: `
    <div class="bubble" [class.user]="message().role === 'user'" [class.assistant]="message().role === 'assistant'" [class.has-holdings]="hasHoldings()">
      @for (segment of segments(); track $index) {
        @if (segment.type === 'text') {
          <markdown [data]="segment.value" />
        } @else {
          <app-holding-link [ticker]="segment.value" />
        }
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
    }
    .bubble {
      max-width: 80%;
      padding: var(--spacing-3) var(--spacing-4);
      word-break: break-word;
    }
    .bubble.user {
      margin-left: auto;
      background: var(--ion-color-primary);
      color: white;
      border-radius: var(--radius-lg);
      border-bottom-right-radius: var(--spacing-1);
    }
    .bubble.assistant {
      margin-right: auto;
      background: var(--app-surface-container);
      color: var(--ion-text-color);
      border-radius: var(--radius-lg);
      border-bottom-left-radius: var(--spacing-1);
    }
    /* Inline flow when holding links are present */
    .bubble.has-holdings > markdown,
    .bubble.has-holdings > app-holding-link {
      display: inline;
    }
    .bubble.has-holdings ::ng-deep p {
      display: inline;
      margin: 0;
    }
    /* Markdown styling inside bubbles */
    .bubble:not(.has-holdings) ::ng-deep p {
      margin: 0 0 0.5em;
    }
    .bubble:not(.has-holdings) ::ng-deep p:last-child {
      margin-bottom: 0;
    }
    .bubble ::ng-deep ul,
    .bubble ::ng-deep ol {
      margin: 0.25em 0;
      padding-left: 1.25em;
    }
    .bubble ::ng-deep table {
      border-collapse: collapse;
      font-size: 0.85em;
      overflow-x: auto;
      display: block;
    }
    .bubble ::ng-deep th,
    .bubble ::ng-deep td {
      border: 1px solid var(--app-outline-variant);
      padding: 4px 8px;
    }
    .bubble ::ng-deep code {
      font-size: 0.85em;
      background: var(--app-surface-low);
      padding: 2px 4px;
      border-radius: var(--radius-sm);
    }
    .bubble ::ng-deep pre {
      background: var(--app-surface-low);
      padding: var(--spacing-2);
      border-radius: var(--radius-sm);
      overflow-x: auto;
    }
    .bubble ::ng-deep pre code {
      background: none;
      padding: 0;
    }
    .bubble.user ::ng-deep code,
    .bubble.user ::ng-deep pre {
      background: rgba(255, 255, 255, 0.15);
    }
    /* Holding chips need stronger contrast inside assistant bubbles */
    .bubble.assistant ::ng-deep .holding-chip {
      --background: white;
    }
  `],
  imports: [MarkdownComponent, HoldingLinkComponent],
})
export class MessageBubbleComponent {
  readonly message = input.required<ChatMessage>();

  readonly segments = computed<MessageSegment[]>(() => {
    return MessageBubbleComponent.splitIntoSegments(this.message().content);
  });

  readonly hasHoldings = computed(() => this.segments().some(s => s.type === 'holding'));

  static splitIntoSegments(text: string): MessageSegment[] {
    const regex = /\*{0,2}\[HOLDING:([A-Z]{1,5})\]\*{0,2}/g;
    const segments: MessageSegment[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
      }
      segments.push({ type: 'holding', value: match[1] });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      segments.push({ type: 'text', value: text.slice(lastIndex) });
    }

    return segments;
  }
}
