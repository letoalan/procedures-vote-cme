import { describe, it, expect } from 'vitest';
import { computeSTVResults } from '../../src/engine/stv/index.js';
import { Bulletin, Scrutin } from '../../src/core/types.js';

describe('STV Engine (Mode 3 STV)', () => {
  const candidats = [
    { id: 'c1', prenom: 'Alice', sexe: 'F' as const },
    { id: 'c2', prenom: 'Bob', sexe: 'G' as const },
    { id: 'c3', prenom: 'Charlie', sexe: 'G' as const }
  ];

  it('runs STV transfer correctly with quota', () => {
    const bulletins: Bulletin[] = [
      ...Array(6).fill({ type: 'rang', ordre: ['c1', 'c2', 'c3'], t: 1 }),
      ...Array(4).fill({ type: 'rang', ordre: ['c3', 'c2', 'c1'], t: 2 })
    ];

    const scrutin: Scrutin = {
      id: 's-stv',
      config: {
        mode: 'classement',
        sousMode: 'stv',
        inscrits: 10,
        sieges: 2,
        candidats,
        departage: 'tirage'
      },
      bulletins
    };

    const res = computeSTVResults(scrutin);
    expect(res.stvDetails.quota).toBe(4);
    expect(res.elusIds).toContain('c1');
    expect(res.elusIds).toContain('c3');
  });
});
