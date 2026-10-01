/**
 * @module engine/tally
 * Rôle : dépouillement général des bulletins (votants, blancs, nuls, exprimés).
 * Dépend de : core/types, engine/thresholds.
 */

import { Bulletin, TallyResult } from '../core/types.js';
import { majoriteAbsolue, quotaSur } from './thresholds.js';

/**
 * Calcule la synthèse numérique de dépouillement (inscrits, votants, blancs, nuls, exprimés).
 * @param bulletins Liste des bulletins dépouillés
 * @param inscrits Nombre d'inscrits sur la liste électorale
 * @param sieges Nombre de sièges à pourvoir (défaut 2)
 * @returns Résultat chiffré du dépouillement
 */
export function calculateTally(bulletins: Bulletin[], inscrits: number, sieges = 2): TallyResult {
  let blancs = 0;
  let nuls = 0;
  let exprimes = 0;

  for (const b of bulletins) {
    if (b.type === 'blanc') {
      blancs++;
    } else if (b.type === 'nul') {
      nuls++;
    } else if (b.type === 'choix') {
      if (b.cible && b.cible.trim() !== '') {
        exprimes++;
      } else {
        blancs++;
      }
    } else if (b.type === 'rang') {
      if (b.ordre && b.ordre.length > 0) {
        exprimes++;
      } else {
        blancs++;
      }
    }
  }

  const votants = blancs + nuls + exprimes;
  const participationPct = inscrits > 0 ? Math.round((votants / inscrits) * 1000) / 10 : 0;

  return {
    inscrits,
    votants,
    blancs,
    nuls,
    exprimes,
    participationPct,
    majoriteAbsolue: majoriteAbsolue(exprimes),
    quotaSur: quotaSur(exprimes, sieges)
  };
}
