import { getPortfolio } from './portfolio.service.js';
import type { GeneratorOptions } from '../data/generator.js';
import type { Insight } from '../models/insight.model.js';

export function getInsights(options?: GeneratorOptions): Insight[] {
  const portfolio = getPortfolio(options);
  const { holdings } = portfolio;
  const insights: Insight[] = [];

  // 1. Asset allocation insight
  const stocks = holdings.filter((h) => h.type === 'stock');
  const crypto = holdings.filter((h) => h.type === 'crypto');
  const stockPct = round1(stocks.reduce((sum, h) => sum + h.portfolioPercent, 0));
  const cryptoPct = round1(crypto.reduce((sum, h) => sum + h.portfolioPercent, 0));

  insights.push({
    id: 'allocation-breakdown',
    title: 'Asset Allocation',
    summary: `Your portfolio is ${stockPct}% stocks and ${cryptoPct}% crypto. ${stockPct > 70 ? 'Consider diversifying into crypto.' : cryptoPct > 40 ? 'High crypto exposure — consider rebalancing.' : 'A balanced mix of traditional and digital assets.'}`,
    prompt: 'Analyze my portfolio allocation between stocks and crypto. Should I rebalance?',
  });

  // 2. Top performer insight
  const sorted = [...holdings].sort((a, b) => b.gainLossPercent - a.gainLossPercent);
  const topPerformer = sorted[0];
  insights.push({
    id: 'top-performer',
    title: 'Top Performer',
    summary: `${topPerformer.name} (${topPerformer.ticker}) is up ${topPerformer.gainLossPercent > 0 ? '+' : ''}${topPerformer.gainLossPercent}% from your buy price.`,
    prompt: `Tell me more about my ${topPerformer.ticker} position and whether I should take profits.`,
  });

  // 3. Worst performer insight
  const worstPerformer = sorted[sorted.length - 1];
  if (worstPerformer.gainLossPercent < 0) {
    insights.push({
      id: 'underperformer',
      title: 'Underperforming Holding',
      summary: `${worstPerformer.name} (${worstPerformer.ticker}) is down ${worstPerformer.gainLossPercent}% from your buy price.`,
      prompt: `Analyze my ${worstPerformer.ticker} position. Should I hold, sell, or buy more?`,
    });
  }

  // 4. Concentration risk
  const topHolding = [...holdings].sort((a, b) => b.portfolioPercent - a.portfolioPercent)[0];
  if (topHolding.portfolioPercent > 15) {
    insights.push({
      id: 'concentration-risk',
      title: 'Concentration Risk',
      summary: `${topHolding.ticker} represents ${topHolding.portfolioPercent}% of your portfolio — consider whether this concentration aligns with your risk tolerance.`,
      prompt: `My largest position is ${topHolding.ticker} at ${topHolding.portfolioPercent}% of my portfolio. Analyze the concentration risk.`,
    });
  }

  // 5. Daily movers
  const dailyChange = portfolio.dailyChange;
  const dailyPct = portfolio.dailyChangePercent;
  insights.push({
    id: 'daily-summary',
    title: 'Today\'s Performance',
    summary: `Your portfolio ${dailyPct >= 0 ? 'gained' : 'lost'} ${dailyPct >= 0 ? '+' : ''}${dailyPct}% ($${Math.abs(dailyChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) today.`,
    prompt: 'Give me a detailed breakdown of today\'s portfolio performance. Which holdings moved the most?',
  });

  return insights;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
