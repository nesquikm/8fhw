import { Router } from 'express';
import { getPortfolio } from '../services/portfolio.service.js';

const router = Router();

router.get('/', (_req, res) => {
  const portfolio = getPortfolio();
  res.json(portfolio);
});

export default router;
