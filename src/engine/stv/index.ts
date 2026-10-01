/**
 * @module engine/stv
 * Rôle : point d'entrée du scrutin à vote unique transférable (STV / Hare-Clark).
 * Dépend de : core/types, engine/tally, engine/stv/run.
 */

import { CandidatResultat, DepartageInfo, Scrutin, STVResultat, TallyResult } from '../../core/types.js';
import { calculateTally } from '../tally.js';
import { runSTV } from './run.js';

export interface STVCalculationOutput {
  tally: TallyResult;
  candidatsResultats: CandidatResultat[];
  stvDetails: STVResultat;
  elusIds: string[];
  departageInfo: DepartageInfo;
}

/**
 * Calcule les résultats complets d'un scrutin selon le mode STV.
 * @param scrutin Scrutin avec bulletins classés
 * @returns Sortie de calcul STV
 */
export function computeSTVResults(scrutin: Scrutin): STVCalculationOutput {
  const { config, bulletins } = scrutin;
  const sieges = config.sieges || 2;
  const tally = calculateTally(bulletins, config.inscrits, sieges);
  const stvDetails = runSTV(bulletins, config.candidats, sieges, tally.exprimes);

  const items: CandidatResultat[] = config.candidats.map(c => {
    const isElu = stvDetails.elus.includes(c.id);
    const score = stvDetails.scoresFinaux[c.id] || 0;
    const pct = tally.exprimes > 0 ? Math.round((score / tally.exprimes) * 1000) / 10 : 0;
    return {
      id: c.id,
      candidat: c,
      voix: Math.round(score),
      pct,
      rangBrut: 0,
      elu: isElu,
      mentionElu: isElu ? 'Élu(e) au scrutin transférable (STV)' : undefined
    };
  });

  items.sort((a, b) => {
    if (a.elu && !b.elu) return -1;
    if (!a.elu && b.elu) return 1;
    return (b.voix || 0) - (a.voix || 0);
  });
  items.forEach((it, idx) => { it.rangBrut = idx + 1; });

  return {
    tally,
    candidatsResultats: items,
    stvDetails,
    elusIds: stvDetails.elus,
    departageInfo: {
      besoinDepartage: false,
      methode: config.departage,
      applique: false
    }
  };
}

export * from './quota.js';
export * from './transfer.js';
export * from './run.js';
