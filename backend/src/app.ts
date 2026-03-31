import express from 'express';
import cors from 'cors';
import portfolioRoutes from './routes/portfolio.routes.js';
import holdingsRoutes from './routes/holdings.routes.js';
import insightsRoutes from './routes/insights.routes.js';

export function createApp(): express.Express {
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

  return app;
}
