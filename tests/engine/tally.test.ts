import { describe, it, expect } from 'vitest';
import { calculateTally } from '../../src/engine/tally.js';
import { Bulletin } from '../../src/core/types.js';

describe('Tally calculation', () => {
  it('correctly calculates counts and quotas for 23 voters', () => {
    const bulletins: Bulletin[] = [
      ...Array(20).fill({ type: 'choix', cible: 'c1', t: 1 }),
      { type: 'blanc', t: 2 },
      { type: 'nul', t: 3 },
      { type: 'choix', cible: '', t: 4 }
    ];
    const tally = calculateTally(bulletins, 25, 2);

    expect(tally.inscrits).toBe(25);
    expect(tally.votants).toBe(23);
    expect(tally.exprimes).toBe(20);
    expect(tally.blancs).toBe(2);
    expect(tally.nuls).toBe(1);
    expect(tally.majoriteAbsolue).toBe(11);
    expect(tally.quotaSur).toBe(7);
    expect(tally.participationPct).toBe(92);
  });
});
