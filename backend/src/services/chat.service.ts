import type Database from 'better-sqlite3';
import type { ChatMessage } from '../models/chat.model.js';

export interface ChatService {
  getMessages(): ChatMessage[];
  addMessage(role: 'user' | 'assistant', content: string): ChatMessage;
  getContextMessages(): Array<{ role: string; content: string }>;
}

export function createChatService(
  db: Database.Database,
  maxHistoryMessages: number = 50,
): ChatService {
  const insertStmt = db.prepare(
    'INSERT INTO messages (role, content) VALUES (?, ?)',
  );
  const selectAllStmt = db.prepare(
    'SELECT id, role, content, created_at as createdAt FROM messages ORDER BY id ASC',
  );
  const selectByIdStmt = db.prepare(
    'SELECT id, role, content, created_at as createdAt FROM messages WHERE id = ?',
  );

  return {
    getMessages(): ChatMessage[] {
      return selectAllStmt.all() as ChatMessage[];
    },

    addMessage(role: 'user' | 'assistant', content: string): ChatMessage {
      const info = insertStmt.run(role, content);
      return selectByIdStmt.get(info.lastInsertRowid) as ChatMessage;
    },

    getContextMessages(): Array<{ role: string; content: string }> {
      const limit = Math.max(maxHistoryMessages, 1);
      const rows = db
        .prepare('SELECT role, content FROM messages ORDER BY id DESC LIMIT ?')
        .all(limit) as Array<{ role: string; content: string }>;
      return rows.reverse();
    },
  };
}
