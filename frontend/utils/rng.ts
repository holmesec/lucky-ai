// Simple seeded random number generator (Linear Congruential Generator)
export class SeededRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Returns float between 0 and 1
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // Returns float between min and max
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}