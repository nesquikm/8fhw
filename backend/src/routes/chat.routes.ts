import { Router } from 'express';
import type { ChatService } from '../services/chat.service.js';
import {
  buildSystemPrompt,
  streamCompletion,
  type AiServiceConfig,
} from '../services/ai.service.js';

export function createChatRouter(
  chatService: ChatService,
  aiConfig: AiServiceConfig,
): Router {
  const router = Router();

  router.get('/messages', (_req, res) => {
    const messages = chatService.getMessages();
    res.json({ messages });
  });

  router.post('/messages', async (req, res) => {
    const { content } = req.body ?? {};

    if (!content || typeof content !== 'string' || content.trim() === '') {
      res.status(400).json({
        error: 'content is required and must be a non-empty string',
      });
      return;
    }

    chatService.addMessage('user', content);

    const systemPrompt = buildSystemPrompt();
    const contextMessages = chatService.getContextMessages();
    const llmMessages = [
      { role: 'system', content: systemPrompt },
      ...contextMessages,
    ];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let accumulated = '';

    try {
      for await (const token of streamCompletion(llmMessages, aiConfig)) {
        accumulated += token;
        res.write(`data: ${JSON.stringify({ content: token })}\n\n`);
      }

      if (accumulated) {
        chatService.addMessage('assistant', accumulated);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch {
      res.end();
    }
  });

  return router;
}
