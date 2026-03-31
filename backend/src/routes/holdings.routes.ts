import { Router } from 'express';
import { getHoldingDetail, getHoldingHistory } from '../services/holdings.service.js';

const router = Router();

router.get('/:ticker', (req, res) => {
  const detail = getHoldingDetail(req.params.ticker);
  if (!detail) {
    res.status(404).json({ error: 'Holding not found' });
    return;
  }
  res.json(detail);
});

router.get('/:ticker/history', (req, res) => {
  const { ticker } = req.params;
  const range = req.query.range as string | undefined;

  if (!range) {
    res.status(400).json({ error: 'range query parameter is required' });
    return;
  }

  const detail = getHoldingDetail(ticker);
  if (!detail) {
    res.status(404).json({ error: 'Holding not found' });
    return;
  }

  const history = getHoldingHistory(ticker, range);
  if (!history) {
    res.status(400).json({ error: 'Invalid range. Valid ranges: 1W, 1M, 3M, 1Y, All' });
    return;
  }

  res.json(history);
});

export default router;
