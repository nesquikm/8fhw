import { getPortfolio } from './portfolio.service.js';

export interface AiServiceConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
}

export function buildSystemPrompt(): string {
  const portfolio = getPortfolio();

  const holdingLines = portfolio.holdings
    .map(
      (h) =>
        `- ${h.name} (${h.ticker}): ${h.quantity} units @ $${h.currentPrice} = $${h.currentValue} (${h.gainLossPercent >= 0 ? '+' : ''}${h.gainLossPercent}%, ${h.portfolioPercent}% of portfolio)`,
    )
    .join('\n');

  return `You are a helpful portfolio assistant for an investment tracking app.

The user's current portfolio:
Total Value: $${portfolio.totalValue}
Daily Change: $${portfolio.dailyChange} (${portfolio.dailyChangePercent >= 0 ? '+' : ''}${portfolio.dailyChangePercent}%)

Holdings:
${holdingLines}

Rules:
- When referencing a specific holding from the portfolio, always use the format [HOLDING:TICKER] (e.g., [HOLDING:AAPL], [HOLDING:BTC]).
- Provide concise, actionable financial insights.
- You are not a financial advisor — always note that your analysis is informational, not financial advice.
- Reference specific numbers from the portfolio data when relevant.`;
}

export async function* streamCompletion(
  messages: Array<{ role: string; content: string }>,
  config: AiServiceConfig,
): AsyncGenerator<string> {
  const response = await fetch(`${config.apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body from AI API');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const data = trimmed.slice(6);
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          // Skip unparseable lines
        }
      }
    }
    // Stream ended without [DONE] — treat as error
    throw new Error('Stream ended without [DONE]');
  } finally {
    reader.releaseLock();
  }
}
