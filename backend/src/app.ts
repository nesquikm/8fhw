import express from 'express';
import cors from 'cors';
import type Database from 'better-sqlite3';
import portfolioRoutes from './routes/portfolio.routes.js';
import holdingsRoutes from './routes/holdings.routes.js';
import insightsRoutes from './routes/insights.routes.js';
import { createChatRouter } from './routes/chat.routes.js';
import { createChatService } from './services/chat.service.js';
import { createDatabase } from './db/sqlite.js';
import type { AiServiceConfig } from './services/ai.service.js';

export interface AppOptions {
  db?: Database.Database;
  aiConfig?: AiServiceConfig;
}

export function createApp(options?: AppOptions): express.Express {
  const app = express();

  // CORS
  const allowedOrigins = [
    'http://localhost:4200',
    'capacitor://localhost',
    'http://localhost',
  ];
  const extraOrigin = process.env.CORS_ORIGIN;
  if (extraOrigin) {
    allowedOrigins.push(extraOrigin);
  }
  app.use(cors({ origin: allowedOrigins }));

  app.use(express.json());

  // Health check
  app.get('/', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // API routes
  app.use('/api/portfolio', portfolioRoutes);
  app.use('/api/holdings', holdingsRoutes);
  app.use('/api/insights', insightsRoutes);

  // Chat routes
  const db = options?.db ?? createDatabase(':memory:');
  const aiConfig = options?.aiConfig ?? {
    apiUrl: process.env.AI_API_URL ?? '',
    apiKey: process.env.AI_API_KEY ?? '',
    model: process.env.AI_MODEL ?? 'gpt-4o',
  };
  const maxHistory = parseInt(process.env.MAX_HISTORY_MESSAGES ?? '50', 10);
  const chatService = createChatService(db, maxHistory);
  app.use('/api/chat', createChatRouter(chatService, aiConfig));

  return app;
}
