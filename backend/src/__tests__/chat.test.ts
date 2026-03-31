import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { createDatabase } from '../db/sqlite.js';
import { createChatService } from '../services/chat.service.js';
import { buildSystemPrompt } from '../services/ai.service.js';
import type Database from 'better-sqlite3';
import type express from 'express';

// --- Helpers ---

function mockLLMResponse(tokens: string[]): Response {
  const encoder = new TextEncoder();
  const parts = tokens.map(
    (t) =>
      `data: ${JSON.stringify({ choices: [{ delta: { content: t } }] })}\n\n`,
  );
  parts.push('data: [DONE]\n\n');

  const stream = new ReadableStream({
    start(controller) {
      for (const part of parts) {
        controller.enqueue(encoder.encode(part));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

function mockLLMError(): Response {
  return new Response('Internal Server Error', { status: 500 });
}

function mockLLMBrokenStream(tokens: string[]): Response {
  const encoder = new TextEncoder();
  const parts = tokens.map(
    (t) =>
      `data: ${JSON.stringify({ choices: [{ delta: { content: t } }] })}\n\n`,
  );
  // No [DONE] — stream just closes

  const stream = new ReadableStream({
    start(controller) {
      for (const part of parts) {
        controller.enqueue(encoder.encode(part));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

const TEST_AI_CONFIG = {
  apiUrl: 'http://mock-llm-api',
  apiKey: 'test-key',
  model: 'test-model',
};

// --- Tests ---

describe('Chat Feature', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createDatabase(':memory:');
  });

  afterEach(() => {
    db.close();
    vi.restoreAllMocks();
  });

  // ========== Chat Service ==========

  describe('Chat Service', () => {
    it('returns empty messages initially', () => {
      const svc = createChatService(db);
      expect(svc.getMessages()).toEqual([]);
    });

    it('stores and returns a user message with id and createdAt', () => {
      const svc = createChatService(db);
      const msg = svc.addMessage('user', 'Hello');
      expect(msg.id).toBe(1);
      expect(msg.role).toBe('user');
      expect(msg.content).toBe('Hello');
      expect(msg.createdAt).toBeTruthy();
      expect(msg.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('stores assistant messages', () => {
      const svc = createChatService(db);
      const msg = svc.addMessage('assistant', 'Hi there');
      expect(msg.role).toBe('assistant');
      expect(msg.content).toBe('Hi there');
    });

    it('returns messages in chronological order', () => {
      const svc = createChatService(db);
      svc.addMessage('user', 'First');
      svc.addMessage('assistant', 'Second');
      svc.addMessage('user', 'Third');

      const messages = svc.getMessages();
      expect(messages).toHaveLength(3);
      expect(messages[0].content).toBe('First');
      expect(messages[1].content).toBe('Second');
      expect(messages[2].content).toBe('Third');
    });

    it('getContextMessages returns last N messages in chronological order', () => {
      const svc = createChatService(db, 2);
      svc.addMessage('user', 'First');
      svc.addMessage('assistant', 'Second');
      svc.addMessage('user', 'Third');

      const context = svc.getContextMessages();
      expect(context).toHaveLength(2);
      expect(context[0].content).toBe('Second');
      expect(context[1].content).toBe('Third');
    });

    it('getContextMessages respects maxHistoryMessages limit', () => {
      const svc = createChatService(db, 3);
      for (let i = 0; i < 10; i++) {
        svc.addMessage('user', `Message ${i}`);
      }

      const context = svc.getContextMessages();
      expect(context).toHaveLength(3);
      expect(context[0].content).toBe('Message 7');
      expect(context[2].content).toBe('Message 9');
    });

    it('getMessages returns full history regardless of maxHistoryMessages', () => {
      const svc = createChatService(db, 2);
      for (let i = 0; i < 5; i++) {
        svc.addMessage('user', `Message ${i}`);
      }

      expect(svc.getMessages()).toHaveLength(5);
      expect(svc.getContextMessages()).toHaveLength(2);
    });
  });

  // ========== AI Service ==========

  describe('AI Service', () => {
    it('buildSystemPrompt includes portfolio total value', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('Total Value: $');
    });

    it('buildSystemPrompt includes holdings with tickers', () => {
      const prompt = buildSystemPrompt();
      // Should contain at least one known ticker
      expect(prompt).toMatch(/\((?:AAPL|GOOGL|MSFT|TSLA|AMZN|NVDA|META|JPM|V|BTC|ETH|SOL)\)/);
    });

    it('buildSystemPrompt includes [HOLDING:TICKER] instruction', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('[HOLDING:TICKER]');
      expect(prompt).toContain('[HOLDING:AAPL]');
    });

    it('buildSystemPrompt includes portfolio assistant role', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('helpful portfolio assistant');
    });

    it('buildSystemPrompt includes financial advice disclaimer', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('not a financial advisor');
    });
  });

  // ========== Chat Routes ==========

  describe('Chat Routes', () => {
    let app: express.Express;

    beforeEach(() => {
      app = createApp({ db, aiConfig: TEST_AI_CONFIG });
    });

    describe('GET /api/chat/messages', () => {
      it('returns 200 with empty messages array initially', async () => {
        const res = await request(app).get('/api/chat/messages');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ messages: [] });
      });

      it('returns messages after adding some', async () => {
        const svc = createChatService(db);
        svc.addMessage('user', 'Hello');
        svc.addMessage('assistant', 'Hi');

        const res = await request(app).get('/api/chat/messages');
        expect(res.status).toBe(200);
        expect(res.body.messages).toHaveLength(2);
      });

      it('returns messages with id, role, content, createdAt', async () => {
        const svc = createChatService(db);
        svc.addMessage('user', 'Test message');

        const res = await request(app).get('/api/chat/messages');
        const msg = res.body.messages[0];
        expect(msg).toHaveProperty('id');
        expect(msg).toHaveProperty('role', 'user');
        expect(msg).toHaveProperty('content', 'Test message');
        expect(msg).toHaveProperty('createdAt');
        expect(msg.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      });

      it('returns messages in chronological order', async () => {
        const svc = createChatService(db);
        svc.addMessage('user', 'First');
        svc.addMessage('assistant', 'Second');
        svc.addMessage('user', 'Third');

        const res = await request(app).get('/api/chat/messages');
        expect(res.body.messages[0].content).toBe('First');
        expect(res.body.messages[1].content).toBe('Second');
        expect(res.body.messages[2].content).toBe('Third');
      });
    });

    describe('POST /api/chat/messages', () => {
      it('returns 400 if body is empty', async () => {
        const res = await request(app)
          .post('/api/chat/messages')
          .send({});
        expect(res.status).toBe(400);
        expect(res.body.error).toBeTruthy();
      });

      it('returns 400 if content is missing', async () => {
        const res = await request(app)
          .post('/api/chat/messages')
          .send({ message: 'wrong field' });
        expect(res.status).toBe(400);
      });

      it('returns 400 if content is empty string', async () => {
        const res = await request(app)
          .post('/api/chat/messages')
          .send({ content: '' });
        expect(res.status).toBe(400);
      });

      it('returns 400 if content is whitespace only', async () => {
        const res = await request(app)
          .post('/api/chat/messages')
          .send({ content: '   ' });
        expect(res.status).toBe(400);
      });

      it('returns 400 if content is a number', async () => {
        const res = await request(app)
          .post('/api/chat/messages')
          .send({ content: 123 });
        expect(res.status).toBe(400);
      });

      it('sets correct SSE headers', async () => {
        vi.stubGlobal(
          'fetch',
          vi.fn().mockResolvedValue(mockLLMResponse(['Hi'])),
        );

        const res = await request(app)
          .post('/api/chat/messages')
          .send({ content: 'Hello' });

        expect(res.headers['content-type']).toContain('text/event-stream');
        expect(res.headers['cache-control']).toContain('no-cache');
      });

      it('streams content tokens as SSE events', async () => {
        vi.stubGlobal(
          'fetch',
          vi.fn().mockResolvedValue(mockLLMResponse(['Hello', ' world'])),
        );

        const res = await request(app)
          .post('/api/chat/messages')
          .send({ content: 'Hi' });

        expect(res.text).toContain('data: {"content":"Hello"}');
        expect(res.text).toContain('data: {"content":" world"}');
      });

      it('ends stream with data: [DONE]', async () => {
        vi.stubGlobal(
          'fetch',
          vi.fn().mockResolvedValue(mockLLMResponse(['test'])),
        );

        const res = await request(app)
          .post('/api/chat/messages')
          .send({ content: 'Hello' });

        expect(res.text).toContain('data: [DONE]');
      });

      it('stores user message before LLM call', async () => {
        let messagesAtFetchTime: number = 0;

        vi.stubGlobal(
          'fetch',
          vi.fn().mockImplementation(() => {
            // Check DB state at time of fetch call
            const rows = db
              .prepare('SELECT * FROM messages')
              .all() as Array<{ role: string }>;
            messagesAtFetchTime = rows.filter(
              (r) => r.role === 'user',
            ).length;
            return Promise.resolve(mockLLMResponse(['reply']));
          }),
        );

        await request(app)
          .post('/api/chat/messages')
          .send({ content: 'Hello' });

        expect(messagesAtFetchTime).toBe(1);
      });

      it('stores assistant message after streaming completes', async () => {
        vi.stubGlobal(
          'fetch',
          vi.fn().mockResolvedValue(mockLLMResponse(['Hello', ' world'])),
        );

        await request(app)
          .post('/api/chat/messages')
          .send({ content: 'Hi' });

        const messages = db
          .prepare('SELECT role, content FROM messages ORDER BY id')
          .all() as Array<{ role: string; content: string }>;

        expect(messages).toHaveLength(2);
        expect(messages[0]).toEqual({ role: 'user', content: 'Hi' });
        expect(messages[1]).toEqual({
          role: 'assistant',
          content: 'Hello world',
        });
      });

      it('does NOT store assistant message if LLM API errors', async () => {
        vi.stubGlobal(
          'fetch',
          vi.fn().mockResolvedValue(mockLLMError()),
        );

        await request(app)
          .post('/api/chat/messages')
          .send({ content: 'Hi' });

        const messages = db
          .prepare('SELECT role FROM messages')
          .all() as Array<{ role: string }>;

        expect(messages).toHaveLength(1);
        expect(messages[0].role).toBe('user');
      });

      it('does NOT send [DONE] if stream fails', async () => {
        vi.stubGlobal(
          'fetch',
          vi.fn().mockResolvedValue(mockLLMError()),
        );

        const res = await request(app)
          .post('/api/chat/messages')
          .send({ content: 'Hi' });

        expect(res.text).not.toContain('[DONE]');
      });

      it('calls AI API with correct URL and auth', async () => {
        const fetchMock = vi
          .fn()
          .mockResolvedValue(mockLLMResponse(['ok']));
        vi.stubGlobal('fetch', fetchMock);

        await request(app)
          .post('/api/chat/messages')
          .send({ content: 'Hi' });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe('http://mock-llm-api/chat/completions');
        expect(options.headers['Authorization']).toBe('Bearer test-key');
        expect(options.headers['Content-Type']).toBe('application/json');
      });

      it('sends system prompt with portfolio data to LLM', async () => {
        const fetchMock = vi
          .fn()
          .mockResolvedValue(mockLLMResponse(['ok']));
        vi.stubGlobal('fetch', fetchMock);

        await request(app)
          .post('/api/chat/messages')
          .send({ content: 'Hello' });

        const body = JSON.parse(fetchMock.mock.calls[0][1].body);
        expect(body.model).toBe('test-model');
        expect(body.stream).toBe(true);
        expect(body.messages[0].role).toBe('system');
        expect(body.messages[0].content).toContain('portfolio assistant');
        expect(body.messages[0].content).toContain('[HOLDING:TICKER]');
        expect(body.messages[0].content).toContain('Total Value');
      });

      it('includes conversation context in LLM request', async () => {
        const svc = createChatService(db);
        svc.addMessage('user', 'Previous question');
        svc.addMessage('assistant', 'Previous answer');

        const fetchMock = vi
          .fn()
          .mockResolvedValue(mockLLMResponse(['ok']));
        vi.stubGlobal('fetch', fetchMock);

        await request(app)
          .post('/api/chat/messages')
          .send({ content: 'Follow up' });

        const body = JSON.parse(fetchMock.mock.calls[0][1].body);
        // system + previous user + previous assistant + new user = 4
        expect(body.messages).toHaveLength(4);
        expect(body.messages[1]).toEqual({
          role: 'user',
          content: 'Previous question',
        });
        expect(body.messages[2]).toEqual({
          role: 'assistant',
          content: 'Previous answer',
        });
        expect(body.messages[3]).toEqual({
          role: 'user',
          content: 'Follow up',
        });
      });

      it('discards partial assistant message if stream ends without [DONE]', async () => {
        vi.stubGlobal(
          'fetch',
          vi.fn().mockResolvedValue(mockLLMBrokenStream(['partial'])),
        );

        const res = await request(app)
          .post('/api/chat/messages')
          .send({ content: 'Hi' });

        // Partial tokens were written before the error was detected
        expect(res.text).toContain('data: {"content":"partial"}');
        // No [DONE] sent to client
        expect(res.text).not.toContain('[DONE]');

        const messages = db
          .prepare('SELECT role FROM messages')
          .all() as Array<{ role: string }>;

        // Only user message — partial assistant message discarded
        expect(messages).toHaveLength(1);
        expect(messages[0].role).toBe('user');
      });
    });
  });
});
