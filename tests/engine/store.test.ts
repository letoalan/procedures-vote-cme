import { describe, it, expect } from 'vitest';
import { calculateElectionResults } from '../../src/engine/index.js';
import { Bulletin, Scrutin } from '../../src/core/types.js';

describe('Store Guard-rails & Data integrity', () => {
  it('prevents adding more ballots than registered voters', () => {
    const inscrits = 3;
    const bulletins: Bulletin[] = [];
    const addBulletinSafe = (b: Bulletin) => {
      if (bulletins.length >= inscrits) {
        throw new Error('Plafond atteint');
      }
      bulletins.push(b);
    };

    addBulletinSafe({ type: 'choix', cible: 'c1', t: 1 });
    addBulletinSafe({ type: 'choix', cible: 'c2', t: 2 });
    addBulletinSafe({ type: 'blanc', t: 3 });

    expect(bulletins.length).toBe(3);
    expect(() => addBulletinSafe({ type: 'nul', t: 4 })).toThrow('Plafond atteint');
  });

  it('serializes and deserializes scrutin accurately', () => {
    const original: Scrutin = {
      id: 'test-123',
      config: {
        mode: 'corrige',
        inscrits: 23,
        sieges: 2,
        candidats: [{ id: 'c1', prenom: 'Léa', sexe: 'F' }],
        departage: 'tirage',
        seuilRepechage: 25
      },
      bulletins: [{ type: 'choix', cible: 'c1', t: 100 }],
      cloture: true
    };

    const json = JSON.stringify(original);
    const parsed = JSON.parse(json) as Scrutin;

    expect(parsed.id).toBe(original.id);
    expect(parsed.config.mode).toBe('corrige');
    expect(parsed.bulletins.length).toBe(1);
    expect(parsed.cloture).toBe(true);
  });

  it('runs unified calculateElectionResults for any mode', () => {
    const scrutin: Scrutin = {
      id: 'test-unified',
      config: {
        mode: 'corrige',
        inscrits: 23,
        sieges: 2,
        candidats: [
          { id: 'c1', prenom: 'Léa', sexe: 'F' },
          { id: 'c2', prenom: 'Hugo', sexe: 'G' }
        ],
        departage: 'tirage'
      },
      bulletins: [{ type: 'choix', cible: 'c1', t: 1 }]
    };
    const res = calculateElectionResults(scrutin);
    expect(res.mode).toBe('corrige');
    expect(res.elusIds).toContain('c1');
  });
});
