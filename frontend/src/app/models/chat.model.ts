export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export type ChatState = 'idle' | 'thinking' | 'streaming' | 'error';
