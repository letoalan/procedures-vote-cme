import { describe, it, expect } from 'vitest';
import { computeUninominalResults } from '../../src/engine/uninominal.js';
import { Bulletin, Scrutin } from '../../src/core/types.js';

describe('Uninominal Engine (Mode 2)', () => {
  const candidats = [
    { id: 'c1', prenom: 'Léa', sexe: 'F' as const },
    { id: 'c2', prenom: 'Hugo', sexe: 'G' as const },
    { id: 'c3', prenom: 'Emma', sexe: 'F' as const }
  ];

  it('Mode B (2 premiers élus) elects top 2 vote getters directly', () => {
    const bulletins: Bulletin[] = [
      ...Array(10).fill({ type: 'choix', cible: 'c1', t: 1 }),
      ...Array(7).fill({ type: 'choix', cible: 'c2', t: 2 }),
      ...Array(3).fill({ type: 'choix', cible: 'c3', t: 3 })
    ];
    const scrutin: Scrutin = {
      id: 's-uni-b',
      config: {
        mode: 'uninominal',
        sousMode: 'B',
        inscrits: 20,
        sieges: 2,
        candidats,
        departage: 'tirage'
      },
      bulletins
    };

    const res = computeUninominalResults(scrutin);
    expect(res.elusIds).toEqual(['c1', 'c2']);
    expect(res.secondTourRequis).toBe(false);
  });

  it('Mode A (Majoritaire 2 tours) elects on 1st round if majority reached, requests 2nd tour otherwise', () => {
    const bulletins: Bulletin[] = [
      ...Array(12).fill({ type: 'choix', cible: 'c1', t: 1 }),
      ...Array(5).fill({ type: 'choix', cible: 'c2', t: 2 }),
      ...Array(3).fill({ type: 'choix', cible: 'c3', t: 3 })
    ];
    const scrutin: Scrutin = {
      id: 's-uni-a',
      config: {
        mode: 'uninominal',
        sousMode: 'A',
        inscrits: 20,
        sieges: 2,
        candidats,
        departage: 'tour'
      },
      bulletins,
      numeroTour: 1
    };

    const res = computeUninominalResults(scrutin);
    expect(res.elusIds).toEqual(['c1']);
    expect(res.secondTourRequis).toBe(true);
    expect(res.candidatsSecondTour).toEqual(['c2', 'c3']);
  });
});
