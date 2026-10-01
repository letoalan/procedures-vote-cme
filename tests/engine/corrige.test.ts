import { describe, it, expect } from 'vitest';
import { computeCorrigeResults } from '../../src/engine/corrige.js';
import { Bulletin, Config } from '../../src/core/types.js';

describe('Parity Corrected Engine (Mode 4)', () => {
  const candidats = [
    { id: 'g1', prenom: 'Gaspard', sexe: 'G' as const },
    { id: 'g2', prenom: 'Gabriel', sexe: 'G' as const },
    { id: 'f1', prenom: 'Fatou', sexe: 'F' as const }
  ];

  it('promotes female candidate when threshold 25% is reached: G1=10, F=8, G2=5', () => {
    const bulletins: Bulletin[] = [
      ...Array(10).fill({ type: 'choix', cible: 'g1', t: 1 }),
      ...Array(8).fill({ type: 'choix', cible: 'f1', t: 2 }),
      ...Array(5).fill({ type: 'choix', cible: 'g2', t: 3 })
    ];

    const config: Config = {
      mode: 'corrige',
      inscrits: 23,
      sieges: 2,
      candidats,
      departage: 'tirage',
      seuilRepechage: 25
    };

    const res = computeCorrigeResults({ id: 's1', config, bulletins });
    expect(res.tally.exprimes).toBe(23);
    expect(res.elusIds).toEqual(['g1', 'f1']);
    expect(res.classementCorrige[0].id).toBe('g1');
    expect(res.classementCorrige[1].id).toBe('f1');
    expect(res.classementCorrige[1].mentionElu).toContain('parité');
  });

  it('corrects ranking when top 2 are both boys and female fails threshold: G1=10, G2=8, F=5', () => {
    const bulletins: Bulletin[] = [
      ...Array(10).fill({ type: 'choix', cible: 'g1', t: 1 }),
      ...Array(8).fill({ type: 'choix', cible: 'g2', t: 2 }),
      ...Array(5).fill({ type: 'choix', cible: 'f1', t: 3 })
    ];

    const config: Config = {
      mode: 'corrige',
      inscrits: 23,
      sieges: 2,
      candidats,
      departage: 'tirage',
      seuilRepechage: 25
    };

    const res = computeCorrigeResults({ id: 's1', config, bulletins });
    expect(res.elusIds).toEqual(['g1', 'g2']);
    expect(res.explicationCorrection).toContain('inférieur au seuil de repêchage');
  });

  it('corrects ranking when female reaches threshold: G1=10, G2=7, F=6', () => {
    const bulletins: Bulletin[] = [
      ...Array(10).fill({ type: 'choix', cible: 'g1', t: 1 }),
      ...Array(7).fill({ type: 'choix', cible: 'g2', t: 2 }),
      ...Array(6).fill({ type: 'choix', cible: 'f1', t: 3 })
    ];

    const config: Config = {
      mode: 'corrige',
      inscrits: 23,
      sieges: 2,
      candidats,
      departage: 'tirage',
      seuilRepechage: 25
    };

    const res = computeCorrigeResults({ id: 's1', config, bulletins });
    expect(res.elusIds).toEqual(['g1', 'f1']);
    expect(res.classementCorrige[0].id).toBe('g1');
    expect(res.classementCorrige[1].id).toBe('f1');
    expect(res.classementCorrige[2].id).toBe('g2');
    expect(res.explicationCorrection).toContain('correction paritaire s\'applique');
  });
});
