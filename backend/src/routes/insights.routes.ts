import { Router } from 'express';
import { getInsights } from '../services/insights.service.js';

const router = Router();

router.get('/', (_req, res) => {
  const insights = getInsights();
  res.json({ insights });
});

export default router;
