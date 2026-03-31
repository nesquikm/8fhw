import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { ChatMessage, ChatState } from '../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly api: ApiService;

  readonly messages = signal<ChatMessage[]>([]);
  readonly state = signal<ChatState>('idle');
  readonly streamingContent = signal<string>('');
  readonly error = signal<string | null>(null);

  constructor(api: ApiService) {
    this.api = api;
  }

  static extractHoldingTickers(text: string): string[] {
    const matches = text.matchAll(/\[HOLDING:([A-Z]{1,5})\]/g);
    return [...new Set([...matches].map(m => m[1]))];
  }

  async loadHistory(): Promise<void> {
    try {
      const res = await fetch(this.api.url('/api/chat/messages'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.messages.set(data.messages);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async sendMessage(content: string): Promise<void> {
    this.state.set('thinking');
    this.error.set(null);
    this.streamingContent.set('');

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    this.messages.update(msgs => [...msgs, userMessage]);

    try {
      const res = await fetch(this.api.url('/api/chat/messages'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';
      let receivedDone = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop()!;

          for (const part of parts) {
            const line = part.trim();
            if (!line) continue;

            if (line === 'data: [DONE]') {
              receivedDone = true;
              continue;
            }

            if (line.startsWith('data: ')) {
              try {
                const { content: token } = JSON.parse(line.slice(6));
                accumulated += token;
                this.streamingContent.set(accumulated);
                if (this.state() === 'thinking') {
                  this.state.set('streaming');
                }
              } catch {
                // skip malformed JSON
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      if (!receivedDone) {
        throw new Error('Stream ended without completion signal');
      }

      if (accumulated) {
        const assistantMessage: ChatMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: accumulated,
          createdAt: new Date().toISOString(),
        };
        this.messages.update(msgs => [...msgs, assistantMessage]);
      }

      this.streamingContent.set('');
      this.state.set('idle');
    } catch (e) {
      this.state.set('error');
      this.error.set(e instanceof Error ? e.message : 'Unknown error');
      this.streamingContent.set('');
    }
  }

  dismissError(): void {
    this.state.set('idle');
    this.error.set(null);
  }
}
