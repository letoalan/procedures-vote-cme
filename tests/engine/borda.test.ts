import { describe, it, expect } from 'vitest';
import { computeBordaResults } from '../../src/engine/borda.js';
import { Bulletin, Scrutin } from '../../src/core/types.js';

describe('Borda Count Engine (Mode 3 Borda - 5 candidats préférés)', () => {
  const candidats = [
    { id: 'c1', prenom: 'Alice', sexe: 'F' as const },
    { id: 'c2', prenom: 'Bob', sexe: 'G' as const },
    { id: 'c3', prenom: 'Charlie', sexe: 'G' as const },
    { id: 'c4', prenom: 'David', sexe: 'G' as const },
    { id: 'c5', prenom: 'Emma', sexe: 'F' as const },
    { id: 'c6', prenom: 'Farid', sexe: 'G' as const }
  ];

  it('computes correct Borda scores with 5 preferred candidates rule (5, 4, 3, 2, 1 points)', () => {
    const bulletins: Bulletin[] = [
      ...Array(4).fill({ type: 'rang', ordre: ['c1', 'c2', 'c3', 'c4', 'c5'], t: 1 }),
      ...Array(2).fill({ type: 'rang', ordre: ['c6', 'c5', 'c4'], t: 2 })
    ];

    const scrutin: Scrutin = {
      id: 's-borda-5',
      config: {
        mode: 'classement',
        sousMode: 'borda',
        inscrits: 10,
        sieges: 2,
        candidats,
        departage: 'tirage'
      },
      bulletins
    };

    const res = computeBordaResults(scrutin);
    expect(res.tally.exprimes).toBe(6);

    const c1 = res.candidatsResultats.find(c => c.id === 'c1');
    const c2 = res.candidatsResultats.find(c => c.id === 'c2');
    const c3 = res.candidatsResultats.find(c => c.id === 'c3');
    const c4 = res.candidatsResultats.find(c => c.id === 'c4');
    const c5 = res.candidatsResultats.find(c => c.id === 'c5');
    const c6 = res.candidatsResultats.find(c => c.id === 'c6');

    expect(c1?.points).toBe(20);
    expect(c2?.points).toBe(16);
    expect(c4?.points).toBe(14);
    expect(c3?.points).toBe(12);
    expect(c5?.points).toBe(12);
    expect(c6?.points).toBe(10);

    expect(res.elusIds).toEqual(['c1', 'c2']);
    expect(res.matriceRangs['c1'][0]).toBe(4);
    expect(res.matriceRangs['c6'][0]).toBe(2);
    expect(res.matriceRangs['c5'][4]).toBe(4);
    expect(res.matriceRangs['c5'][1]).toBe(2);
  });
});
