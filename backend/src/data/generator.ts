import seedrandom from 'seedrandom';

const DEFAULT_SEED = 'ai-portfolio-companion';

export interface Generator {
  next(): number;
  intRange(min: number, max: number): number;
  floatRange(min: number, max: number): number;
  pick<T>(items: T[]): T;
  shuffle<T>(items: T[]): T[];
}

export interface GeneratorOptions {
  seed?: string;
  date?: string;
}

function todayString(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function createGenerator(options?: GeneratorOptions): Generator {
  const seed = options?.seed ?? DEFAULT_SEED;
  const date = options?.date ?? todayString();
  const rng = seedrandom(`${seed}:${date}`);

  return {
    next(): number {
      return rng();
    },

    intRange(min: number, max: number): number {
      return Math.floor(rng() * (max - min + 1)) + min;
    },

    floatRange(min: number, max: number): number {
      return rng() * (max - min) + min;
    },

    pick<T>(items: T[]): T {
      return items[Math.floor(rng() * items.length)];
    },

    shuffle<T>(items: T[]): T[] {
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      return items;
    },
  };
}
