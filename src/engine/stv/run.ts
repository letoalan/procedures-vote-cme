/**
 * @module engine/stv/run
 * Rôle : boucle itérative d'attribution des sièges STV et journal des étapes.
 * Dépend de : core/types, engine/stv/quota, engine/stv/transfer.
 */

import { Candidat, STVEtape, STVResultat } from '../../core/types.js';
import { calculateDroopQuota } from './quota.js';
import { applySurplusTransfer, initPapers, tallyPapers } from './transfer.js';
import { Bulletin } from '../../core/types.js';

/**
 * Exécute l'algorithme STV étape par étape et produit le journal détaillé.
 * @param bulletins Liste des bulletins de vote classés
 * @param candidats Liste des candidats
 * @param sieges Nombre de sièges à pourvoir
 * @param exprimes Nombre total de suffrages exprimés
 * @returns Résultat STV avec quota, étapes et élus
 */
export function runSTV(
  bulletins: Bulletin[],
  candidats: Candidat[],
  sieges: number,
  exprimes: number
): STVResultat {
  const quota = calculateDroopQuota(exprimes, sieges);
  const papers = initPapers(bulletins);
  const allIds = candidats.map(c => c.id);
  const elected: string[] = [];
  const eliminated: string[] = [];
  const etapes: STVEtape[] = [];
  const candName = (id: string) => candidats.find(c => c.id === id)?.prenom || id;

  let stepNum = 1;
  let finalScores: Record<string, number> = {};

  while (stepNum <= 50) {
    const activeSet = new Set(allIds.filter(id => !elected.includes(id) && !eliminated.includes(id)));
    const scores = tallyPapers(papers, allIds, activeSet);
    finalScores = { ...scores };

    const seatsLeft = sieges - elected.length;
    const remaining = allIds.filter(id => activeSet.has(id));

    if (seatsLeft <= 0 || remaining.length <= seatsLeft) {
      for (const id of remaining) {
        if (!elected.includes(id)) elected.push(id);
      }
      etapes.push({
        numero: stepNum,
        action: 'fin',
        description: seatsLeft <= 0 ? `Les ${sieges} sièges sont pourvus.` : `Candidats restants (${remaining.length}) élus directement.`,
        etatVoix: scores,
        elusActuels: [...elected],
        eliminesActuels: [...eliminated]
      });
      break;
    }

    const atQuota = remaining.filter(id => scores[id] >= quota).sort((a, b) => scores[b] - scores[a]);
    if (atQuota.length > 0) {
      const winner = atQuota[0];
      elected.push(winner);
      const surplus = scores[winner] - quota;
      etapes.push({
        numero: stepNum++,
        action: 'quota',
        description: `${candName(winner)} atteint le quota (${quota}) avec ${scores[winner]} voix et est élu(e).`,
        etatVoix: { ...scores },
        elusActuels: [...elected],
        eliminesActuels: [...eliminated]
      });

      if (surplus > 0.01 && elected.length < sieges) {
        const factor = applySurplusTransfer(papers, winner, surplus, scores[winner], activeSet);
        const newScores = tallyPapers(papers, allIds, new Set(allIds.filter(id => !elected.includes(id) && !eliminated.includes(id))));
        etapes.push({
          numero: stepNum++,
          action: 'surplus',
          description: `Transfert du surplus (${Math.round(surplus * 100) / 100} voix) de ${candName(winner)} (taux : ${(factor * 100).toFixed(1)}%).`,
          etatVoix: newScores,
          elusActuels: [...elected],
          eliminesActuels: [...eliminated]
        });
      }
      continue;
    }

    // Élimination du dernier
    remaining.sort((a, b) => scores[a] - scores[b]);
    const toEliminate = remaining[0];
    eliminated.push(toEliminate);
    etapes.push({
      numero: stepNum++,
      action: 'elimination',
      description: `Aucun quota. Élimination de ${candName(toEliminate)} (${scores[toEliminate]} voix), report des bulletins.`,
      etatVoix: { ...scores },
      elusActuels: [...elected],
      eliminesActuels: [...eliminated]
    });
  }

  return { quota, etapes, elus: elected, scoresFinaux: finalScores };
}
