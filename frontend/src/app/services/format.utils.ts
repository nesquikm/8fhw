/**
 * Number formatting utilities for the portfolio app.
 * Currency, percentages, quantities, and gain/loss values.
 */

/** Format as USD currency: $1,234.56 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Format as signed currency: +$1,234.56 or -$1,234.56 */
export function formatSignedCurrency(value: number): string {
  const formatted = formatCurrency(Math.abs(value));
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

/** Format as signed percentage: +1.01% or -2.34% */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/** Format quantity with 2 decimal places */
export function formatQuantity(value: number): string {
  return value.toFixed(2);
}
