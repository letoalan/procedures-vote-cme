import { describe, it, expect } from 'vitest';
import { resolveTie } from '../../src/engine/ties.js';

describe('Tie-breaking', () => {
  const cands = new Map([
    ['c1', { id: 'c1', prenom: 'Luc', sexe: 'G' as const, naissance: '2014-05-12' }],
    ['c2', { id: 'c2', prenom: 'Manon', sexe: 'F' as const, naissance: '2014-09-20' }]
  ]);

  it('favors younger candidate when age criterion is chosen', () => {
    const tie = resolveTie(['c1', 'c2'], 1, 'age', cands);
    expect(tie.vainqueursTirage).toEqual(['c2']);
    expect(tie.explication).toContain('plus jeune');
  });

  it('uses reproducible seed for deterministic random draw', () => {
    const tie1 = resolveTie(['c1', 'c2', 'c3'], 1, 'tirage', new Map(), 4242);
    const tie2 = resolveTie(['c1', 'c2', 'c3'], 1, 'tirage', new Map(), 4242);
    expect(tie1.vainqueursTirage).toEqual(tie2.vainqueursTirage);
    expect(tie1.seed).toBe(4242);
  });
});
