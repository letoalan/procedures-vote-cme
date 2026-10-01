/**
 * @module ui/simulatorScenarios
 * Rôle : scénarios comparatifs pour le simulateur « Et si... ? ».
 * Dépend de : core/types, engine.
 */

import { Bulletin, Candidat } from '../core/types.js';
import { calculateElectionResults } from '../engine/index.js';

export interface ScenarioPreset {
  name: string;
  desc: string;
  candidats: Candidat[];
  bulletins: Bulletin[];
}

export const simulatorPresets: ScenarioPreset[] = [
  {
    name: 'Scénario 1 : Deux garçons en tête et une fille forte (23 élèves)',
    desc: '10 voix Hugo, 8 voix Tom, 5 voix Léa. Montre le contraste uninominal vs correction.',
    candidats: [
      { id: 'g1', prenom: 'Hugo', sexe: 'G' },
      { id: 'g2', prenom: 'Tom', sexe: 'G' },
      { id: 'f1', prenom: 'Léa', sexe: 'F' },
      { id: 'f2', prenom: 'Emma', sexe: 'F' }
    ],
    bulletins: [
      ...Array(10).fill({ type: 'rang' as const, ordre: ['g1', 'f1', 'g2', 'f2'], t: 1 }),
      ...Array(8).fill({ type: 'rang' as const, ordre: ['g2', 'g1', 'f1', 'f2'], t: 2 }),
      ...Array(5).fill({ type: 'rang' as const, ordre: ['f1', 'g1', 'f2', 'g2'], t: 3 })
    ]
  },
  {
    name: 'Scénario 2 : Le candidat de consensus contre le candidat clivant (25 élèves)',
    desc: 'Alice 1er choix minoritaire (8). Bob 2e choix de presque tous. Borda révèle le consensus.',
    candidats: [
      { id: 'c1', prenom: 'Alice', sexe: 'F' },
      { id: 'c2', prenom: 'Bob', sexe: 'G' },
      { id: 'c3', prenom: 'Chloé', sexe: 'F' },
      { id: 'c4', prenom: 'David', sexe: 'G' }
    ],
    bulletins: [
      ...Array(8).fill({ type: 'rang' as const, ordre: ['c1', 'c2', 'c3', 'c4'], t: 1 }),
      ...Array(9).fill({ type: 'rang' as const, ordre: ['c3', 'c2', 'c4', 'c1'], t: 2 }),
      ...Array(8).fill({ type: 'rang' as const, ordre: ['c4', 'c2', 'c3', 'c1'], t: 3 })
    ]
  }
];

export function computeScenarioComparison(sc: ScenarioPreset) {
  const uninominalBulletins: Bulletin[] = sc.bulletins.map(b => ({
    type: 'choix',
    cible: (b as { ordre: string[] }).ordre[0],
    t: b.t
  }));

  // 1. Uninominal B
  const resUni = calculateElectionResults({
    id: 'sc-uni',
    config: { mode: 'uninominal', sousMode: 'B', inscrits: sc.bulletins.length, sieges: 2, candidats: sc.candidats, departage: 'tirage' },
    bulletins: uninominalBulletins
  });
  const elusUni = (resUni.candidatsResultats || []).filter(c => c.elu).map(c => `${c.candidat.prenom} (${c.candidat.sexe})`);

  // 2. Corrigé
  const resCorr = calculateElectionResults({
    id: 'sc-corr',
    config: { mode: 'corrige', inscrits: sc.bulletins.length, sieges: 2, candidats: sc.candidats, departage: 'tirage', seuilRepechage: 25 },
    bulletins: uninominalBulletins
  });
  const elusCorr = (resCorr.classementCorrige || []).filter(c => c.elu).map(c => `${c.candidat.prenom} (${c.candidat.sexe})`);

  // 3. Borda
  const resBorda = calculateElectionResults({
    id: 'sc-borda',
    config: { mode: 'classement', sousMode: 'borda', inscrits: sc.bulletins.length, sieges: 2, candidats: sc.candidats, departage: 'tirage' },
    bulletins: sc.bulletins
  });
  const elusBorda = (resBorda.candidatsResultats || []).filter(c => c.elu).map(c => `${c.candidat.prenom} (${c.candidat.sexe})`);

  // 4. Binômes
  const filles = sc.candidats.filter(c => c.sexe === 'F');
  const garcons = sc.candidats.filter(c => c.sexe === 'G');
  const binomes = [
    { id: 'b1', fille: filles[0].id, garcon: garcons[0].id, nom: `${filles[0].prenom} & ${garcons[0].prenom}` },
    { id: 'b2', fille: filles[1]?.id || filles[0].id, garcon: garcons[1]?.id || garcons[0].id, nom: `${filles[1]?.prenom || 'F'} & ${garcons[1]?.prenom || 'G'}` }
  ];
  const binomeBulletins: Bulletin[] = sc.bulletins.map(b => {
    const topId = (b as { ordre: string[] }).ordre[0];
    const targetBin = binomes.find(bn => bn.fille === topId || bn.garcon === topId) || binomes[0];
    return { type: 'choix', cible: targetBin.id, t: b.t };
  });
  const resBin = calculateElectionResults({
    id: 'sc-bin',
    config: { mode: 'binome', inscrits: sc.bulletins.length, sieges: 2, candidats: sc.candidats, binomes, departage: 'tirage' },
    bulletins: binomeBulletins,
    numeroTour: 2
  });
  const elusBin = (resBin.binomesResultats || []).filter(b => b.elu).map(b => `${b.binome.nom}`);

  return { elusUni, elusCorr, elusBorda, elusBin, resUni, resCorr, resBorda, resBin };
}
