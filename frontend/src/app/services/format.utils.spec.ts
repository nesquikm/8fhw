import {
  formatCurrency,
  formatSignedCurrency,
  formatPercent,
  formatQuantity,
} from './format.utils';

describe('format.utils', () => {
  describe('formatCurrency', () => {
    it('should format positive values with dollar sign and commas', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format large values with commas', () => {
      expect(formatCurrency(125430.5)).toBe('$125,430.50');
    });

    it('should format zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should format negative values', () => {
      expect(formatCurrency(-500.1)).toBe('-$500.10');
    });

    it('should always show 2 decimal places', () => {
      expect(formatCurrency(100)).toBe('$100.00');
    });
  });

  describe('formatSignedCurrency', () => {
    it('should prefix positive values with +$', () => {
      expect(formatSignedCurrency(1175)).toBe('+$1,175.00');
    });

    it('should prefix negative values with -$', () => {
      expect(formatSignedCurrency(-500.1)).toBe('-$500.10');
    });

    it('should format zero as +$0.00', () => {
      expect(formatSignedCurrency(0)).toBe('+$0.00');
    });

    it('should handle large values', () => {
      expect(formatSignedCurrency(1250.3)).toBe('+$1,250.30');
    });
  });

  describe('formatPercent', () => {
    it('should format positive with + sign', () => {
      expect(formatPercent(1.01)).toBe('+1.01%');
    });

    it('should format negative with - sign', () => {
      expect(formatPercent(-2.34)).toBe('-2.34%');
    });

    it('should format zero as +0.00%', () => {
      expect(formatPercent(0)).toBe('+0.00%');
    });

    it('should always show 2 decimal places', () => {
      expect(formatPercent(15)).toBe('+15.00%');
    });
  });

  describe('formatQuantity', () => {
    it('should format with 2 decimal places', () => {
      expect(formatQuantity(50)).toBe('50.00');
    });

    it('should format fractional quantities', () => {
      expect(formatQuantity(0.5)).toBe('0.50');
    });

    it('should format zero', () => {
      expect(formatQuantity(0)).toBe('0.00');
    });
  });
});
