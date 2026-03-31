import { describe, it, expect } from 'vitest';
import { createGenerator } from '../data/generator.js';

describe('Seeded PRNG Generator', () => {
  it('produces deterministic output for the same seed and date', () => {
    const gen1 = createGenerator({ seed: 'test-seed', date: '2026-03-31' });
    const gen2 = createGenerator({ seed: 'test-seed', date: '2026-03-31' });

    const values1 = Array.from({ length: 10 }, () => gen1.next());
    const values2 = Array.from({ length: 10 }, () => gen2.next());

    expect(values1).toEqual(values2);
  });

  it('produces different output for different seeds', () => {
    const gen1 = createGenerator({ seed: 'seed-a', date: '2026-03-31' });
    const gen2 = createGenerator({ seed: 'seed-b', date: '2026-03-31' });

    const values1 = Array.from({ length: 10 }, () => gen1.next());
    const values2 = Array.from({ length: 10 }, () => gen2.next());

    expect(values1).not.toEqual(values2);
  });

  it('produces different output for different dates with same seed', () => {
    const gen1 = createGenerator({ seed: 'test-seed', date: '2026-03-31' });
    const gen2 = createGenerator({ seed: 'test-seed', date: '2026-04-01' });

    const values1 = Array.from({ length: 10 }, () => gen1.next());
    const values2 = Array.from({ length: 10 }, () => gen2.next());

    expect(values1).not.toEqual(values2);
  });

  it('next() returns values between 0 and 1', () => {
    const gen = createGenerator({ seed: 'range-test', date: '2026-03-31' });

    for (let i = 0; i < 100; i++) {
      const val = gen.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('intRange returns integers within the specified range (inclusive)', () => {
    const gen = createGenerator({ seed: 'int-test', date: '2026-03-31' });

    for (let i = 0; i < 100; i++) {
      const val = gen.intRange(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it('floatRange returns floats within the specified range', () => {
    const gen = createGenerator({ seed: 'float-test', date: '2026-03-31' });

    for (let i = 0; i < 100; i++) {
      const val = gen.floatRange(10.0, 20.0);
      expect(val).toBeGreaterThanOrEqual(10.0);
      expect(val).toBeLessThan(20.0);
    }
  });

  it('pick selects an element from the array', () => {
    const gen = createGenerator({ seed: 'pick-test', date: '2026-03-31' });
    const items = ['a', 'b', 'c', 'd', 'e'];

    for (let i = 0; i < 20; i++) {
      const picked = gen.pick(items);
      expect(items).toContain(picked);
    }
  });

  it('shuffle returns a permutation of the array', () => {
    const gen = createGenerator({ seed: 'shuffle-test', date: '2026-03-31' });
    const items = [1, 2, 3, 4, 5, 6, 7, 8];

    const shuffled = gen.shuffle([...items]);
    expect(shuffled).toHaveLength(items.length);
    expect(shuffled.sort((a, b) => a - b)).toEqual(items);
  });

  it('uses default seed and today date when no options provided', () => {
    const gen1 = createGenerator();
    const gen2 = createGenerator();

    const values1 = Array.from({ length: 5 }, () => gen1.next());
    const values2 = Array.from({ length: 5 }, () => gen2.next());

    expect(values1).toEqual(values2);
  });
});
