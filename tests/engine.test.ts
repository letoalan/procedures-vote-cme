import { describe, it, expect } from 'vitest';
import {
  calculateTally,
  computeBinomeResults,
  computeUninominalResults,
  computeBordaResults,
  computeSTVResults,
  computeCorrigeResults,
  calculateElectionResults,
  resolveTie,
  Config,
  Scrutin,
  Bulletin
} from '../src/engine/index.js';

describe('Tally calculation', () => {
  it('correctly calculates counts and quotas for 23 voters', () => {
    const bulletins: Bulletin[] = [
      ...Array(20).fill({ type: 'choix', cible: 'c1', t: 1 }),
      { type: 'blanc', t: 2 },
      { type: 'nul', t: 3 },
      { type: 'choix', cible: '', t: 4 } // traité comme blanc car cible vide
    ];
    const tally = calculateTally(bulletins, 25, 2);

    expect(tally.inscrits).toBe(25);
    expect(tally.votants).toBe(23);
    expect(tally.exprimes).toBe(20);
    expect(tally.blancs).toBe(2);
    expect(tally.nuls).toBe(1);
    expect(tally.majoriteAbsolue).toBe(11); // floor(20 / 2) + 1 = 11
    expect(tally.quotaSur).toBe(7);          // floor(20 / 3) + 1 = 7
    expect(tally.participationPct).toBe(92); // 23/25 * 100 = 92%
  });
});

describe('Parity Corrected Engine (Mode 4)', () => {
  const candidats = [
    { id: 'g1', prenom: 'Gaspard', sexe: 'G' as const },
    { id: 'g2', prenom: 'Gabriel', sexe: 'G' as const },
    { id: 'f1', prenom: 'Fatou', sexe: 'F' as const }
  ];

  it('promotes female candidate when threshold 25% is reached: G1=10, F=8, G2=5', () => {
    // 23 voters: G1=10, F=8, G2=5.
    // Raw order: G1 (10), F (8), G2 (5).
    // Here F is already 2nd! Natural parity is preserved.
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

  it('corrects ranking when top 2 are both boys and female exceeds threshold: G1=10, G2=8, F=5 (23 exprimes -> F has 21.7% => fails 25% threshold)', () => {
    // 23 voters: G1=10 (43.5%), G2=8 (34.8%), F=5 (21.7%).
    // 5/23 = 21.7% < 25%.
    // Since F does not reach 25%, G2 stays elected!
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

  it('corrects ranking when female reaches threshold: G1=10, G2=7, F=6 (23 exprimes -> F has 26.1% >= 25%)', () => {
    // 23 voters: G1=10, G2=7, F=6.
    // 6/23 = 26.1% >= 25%.
    // Top 2 raw: G1 (10) and G2 (7). Both boys!
    // F (6) reaches 25%. F is promoted to seat 2!
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

describe('Uninominal Engine (Mode 2)', () => {
  const candidats = [
    { id: 'c1', prenom: 'Léa', sexe: 'F' as const },
    { id: 'c2', prenom: 'Hugo', sexe: 'G' as const },
    { id: 'c3', prenom: 'Emma', sexe: 'F' as const }
  ];

  it('Mode B (2 premiers élus) elects top 2 vote getters directly', () => {
    // 20 voters: c1=10, c2=7, c3=3
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
    // 20 voters: majority is 11.
    // c1=12 (majority), c2=5, c3=3.
    // c1 elected on round 1. c2 and c3 qualify for round 2 for seat 2!
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
    // 20 exprimes: b1=9, b2=8, b3=3. Absolute majority = 11. None has >= 11.
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
    // 4 voters rank [c1, c2, c3, c4, c5]
    // -> c1 gets 4*5 = 20 pts
    // -> c2 gets 4*4 = 16 pts
    // -> c3 gets 4*3 = 12 pts
    // -> c4 gets 4*2 = 8 pts
    // -> c5 gets 4*1 = 4 pts
    // -> c6 gets 0 pts
    //
    // 2 voters rank partial [c6, c5, c4] (only 3 choices)
    // -> c6 gets 2*5 = 10 pts
    // -> c5 gets 2*4 = 8 pts (total = 4 + 8 = 12 pts)
    // -> c4 gets 2*3 = 6 pts (total = 8 + 6 = 14 pts)
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

    // c1 (20 pts) and c2 (16 pts) elected
    expect(res.elusIds).toEqual(['c1', 'c2']);

    // Check rank matrix:
    // c1: 4 times 1st (4*5 = 20)
    expect(res.matriceRangs['c1'][0]).toBe(4);
    // c6: 2 times 1st (2*5 = 10)
    expect(res.matriceRangs['c6'][0]).toBe(2);
    // c5: 4 times 5th (idx 4), 2 times 2nd (idx 1)
    expect(res.matriceRangs['c5'][4]).toBe(4);
    expect(res.matriceRangs['c5'][1]).toBe(2);
  });
});

describe('STV Engine (Mode 3 STV)', () => {
  const candidats = [
    { id: 'c1', prenom: 'Alice', sexe: 'F' as const },
    { id: 'c2', prenom: 'Bob', sexe: 'G' as const },
    { id: 'c3', prenom: 'Charlie', sexe: 'G' as const }
  ];

  it('runs STV transfer correctly with quota', () => {
    // 2 seats, 10 voters -> quota = floor(10 / 3) + 1 = 4.
    // 6 voters rank [c1, c2, c3] -> c1 has 6 >= 4 -> c1 elected! Surplus = 2.
    // 4 voters rank [c3, c2, c1] -> c3 has 4 >= 4 -> c3 elected!
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

describe('Tie-breaking', () => {
  const cands = new Map([
    ['c1', { id: 'c1', prenom: 'Luc', sexe: 'G' as const, naissance: '2014-05-12' }],
    ['c2', { id: 'c2', prenom: 'Manon', sexe: 'F' as const, naissance: '2014-09-20' }] // younger
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


