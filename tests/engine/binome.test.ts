import { describe, it, expect } from 'vitest';
import { computeBinomeResults } from '../../src/engine/binome.js';
import { Bulletin, Scrutin } from '../../src/core/types.js';

describe('Binome Engine (Mode 1)', () => {
  const candidats = [
    { id: 'f1', prenom: 'Léa', sexe: 'F' as const },
    { id: 'g1', prenom: 'Hugo', sexe: 'G' as const },
    { id: 'f2', prenom: 'Emma', sexe: 'F' as const },
    { id: 'g2', prenom: 'Tom', sexe: 'G' as const }
  ];
  const binomes = [
    { id: 'b1', fille: 'f1', garcon: 'g1', nom: 'Léa & Hugo' },
    { id: 'b2', fille: 'f2', garcon: 'g2', nom: 'Emma & Tom' }
  ];

  it('elects binome on round 1 with absolute majority', () => {
    const bulletins: Bulletin[] = [
      ...Array(12).fill({ type: 'choix', cible: 'b1', t: 1 }),
      ...Array(8).fill({ type: 'choix', cible: 'b2', t: 2 })
    ];

    const scrutin: Scrutin = {
      id: 's-binome',
      config: {
        mode: 'binome',
        inscrits: 20,
        sieges: 2,
        candidats,
        binomes,
        departage: 'tirage'
      },
      bulletins,
      numeroTour: 1
    };

    const res = computeBinomeResults(scrutin);
    expect(res.elusIds).toEqual(['b1']);
    expect(res.secondTourRequis).toBe(false);
  });

  it('triggers second tour if no binome reaches absolute majority in round 1', () => {
    const binomes3 = [
      ...binomes,
      { id: 'b3', fille: 'f1', garcon: 'g2', nom: 'Léa & Tom' }
    ];
    const bulletins: Bulletin[] = [
      ...Array(9).fill({ type: 'choix', cible: 'b1', t: 1 }),
      ...Array(8).fill({ type: 'choix', cible: 'b2', t: 2 }),
      ...Array(3).fill({ type: 'choix', cible: 'b3', t: 3 })
    ];

    const scrutin: Scrutin = {
      id: 's-binome-2',
      config: {
        mode: 'binome',
        inscrits: 20,
        sieges: 2,
        candidats,
        binomes: binomes3,
        departage: 'tour'
      },
      bulletins,
      numeroTour: 1
    };

    const res = computeBinomeResults(scrutin);
    expect(res.secondTourRequis).toBe(true);
    expect(res.binomesSecondTour).toEqual(['b1', 'b2']);
  });
});
