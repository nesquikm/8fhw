import { createGenerator, type GeneratorOptions } from '../data/generator.js';
import type { Portfolio, Holding } from '../models/portfolio.model.js';

interface AssetDef {
  ticker: string;
  name: string;
  type: 'stock' | 'crypto';
  sector: string;
  description: string;
  basePrice: number;
}

const STOCKS: AssetDef[] = [
  { ticker: 'AAPL', name: 'Apple Inc.', type: 'stock', sector: 'Technology', description: 'Consumer electronics, software, and services', basePrice: 178 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', sector: 'Technology', description: 'Internet services, cloud computing, and advertising', basePrice: 141 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', type: 'stock', sector: 'Technology', description: 'Software, cloud services, and enterprise solutions', basePrice: 378 },
  { ticker: 'TSLA', name: 'Tesla Inc.', type: 'stock', sector: 'Automotive', description: 'Electric vehicles, energy storage, and solar', basePrice: 245 },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', sector: 'Consumer Cyclical', description: 'E-commerce, cloud computing, and digital streaming', basePrice: 178 },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', type: 'stock', sector: 'Technology', description: 'GPUs, AI computing, and data center solutions', basePrice: 480 },
  { ticker: 'META', name: 'Meta Platforms Inc.', type: 'stock', sector: 'Technology', description: 'Social media, virtual reality, and digital advertising', basePrice: 390 },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', type: 'stock', sector: 'Financial Services', description: 'Banking, financial services, and asset management', basePrice: 195 },
  { ticker: 'V', name: 'Visa Inc.', type: 'stock', sector: 'Financial Services', description: 'Digital payments and financial technology', basePrice: 275 },
];

const CRYPTO: AssetDef[] = [
  { ticker: 'BTC', name: 'Bitcoin', type: 'crypto', sector: 'Cryptocurrency', description: 'Decentralized digital currency and store of value', basePrice: 62000 },
  { ticker: 'ETH', name: 'Ethereum', type: 'crypto', sector: 'Cryptocurrency', description: 'Smart contract platform and decentralized applications', basePrice: 3400 },
  { ticker: 'SOL', name: 'Solana', type: 'crypto', sector: 'Cryptocurrency', description: 'High-performance blockchain for decentralized applications', basePrice: 145 },
];

export const ALL_ASSETS = [...STOCKS, ...CRYPTO];

export function getPortfolio(options?: GeneratorOptions): Portfolio {
  const gen = createGenerator(options);

  // Pick 6-8 stocks and 2-3 crypto
  const numStocks = gen.intRange(6, 8);
  const numCrypto = gen.intRange(2, 3);

  const selectedStocks = gen.shuffle([...STOCKS]).slice(0, numStocks);
  const selectedCrypto = gen.shuffle([...CRYPTO]).slice(0, numCrypto);
  const selected = [...selectedStocks, ...selectedCrypto];

  let previousTotalValue = 0;
  const holdings: Holding[] = selected.map((asset) => {
    const priceVariance = gen.floatRange(-0.15, 0.25);
    const currentPrice = round2(asset.basePrice * (1 + priceVariance));

    const quantity = asset.type === 'crypto'
      ? round2(gen.floatRange(0.5, 10))
      : gen.intRange(10, 200);

    const currentValue = round2(currentPrice * quantity);

    const buyVariance = gen.floatRange(-0.3, 0.1);
    const avgBuyPrice = round2(currentPrice * (1 + buyVariance));

    const gainLoss = round2(currentValue - avgBuyPrice * quantity);
    const gainLossPercent = round2(((currentPrice - avgBuyPrice) / avgBuyPrice) * 100);

    const dailyChangePercent = gen.floatRange(-0.03, 0.04);
    const previousPrice = currentPrice / (1 + dailyChangePercent);
    previousTotalValue += round2(previousPrice * quantity);

    return {
      ticker: asset.ticker,
      name: asset.name,
      type: asset.type,
      quantity,
      currentPrice,
      currentValue,
      avgBuyPrice,
      gainLoss,
      gainLossPercent,
      portfolioPercent: 0, // computed after totals known
    };
  });

  const totalValue = round2(holdings.reduce((sum, h) => sum + h.currentValue, 0));

  // Compute portfolioPercent
  for (const h of holdings) {
    h.portfolioPercent = round2((h.currentValue / totalValue) * 100);
  }

  const dailyChange = round2(totalValue - previousTotalValue);
  const dailyChangePercent = round2((dailyChange / previousTotalValue) * 100);

  return { totalValue, dailyChange, dailyChangePercent, holdings };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
