/**
 * @module engine/stv/transfer
 * Rôle : gestion des bulletins pondérés et transferts de surplus (méthode de Gregory).
 * Dépend de : core/types.
 */

import { Bulletin } from '../../core/types.js';

export interface BallotPaper {
  id: string;
  ordre: string[];
  weight: number;
}

/**
 * Initialise les bulletins avec un poids de 1.0.
 * @param bulletins Liste des bulletins dépouillés
 * @returns Bulletins pondérés
 */
export function initPapers(bulletins: Bulletin[]): BallotPaper[] {
  const papers: BallotPaper[] = [];
  let counter = 1;
  for (const b of bulletins) {
    if (b.type === 'rang' && b.ordre && b.ordre.length > 0) {
      papers.push({
        id: `b-${counter++}`,
        ordre: [...b.ordre],
        weight: 1.0
      });
    }
  }
  return papers;
}

/**
 * Calcule les voix pondérées actuelles par candidat.
 * @param papers Liste des bulletins pondérés
 * @param candIds Identifiants des candidats
 * @param activeIds Candidats encore éligibles
 */
export function tallyPapers(
  papers: BallotPaper[],
  candIds: string[],
  activeIds: Set<string>
): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const id of candIds) scores[id] = 0;

  for (const p of papers) {
    const choice = p.ordre.find(id => activeIds.has(id));
    if (choice) {
      scores[choice] = (scores[choice] || 0) + p.weight;
    }
  }

  for (const id of candIds) {
    scores[id] = Math.round(scores[id] * 100) / 100;
  }
  return scores;
}

/**
 * Applique le facteur de transfert de Gregory aux bulletins concernés.
 * @param papers Liste des bulletins pondérés
 * @param candId Candidat élu avec surplus
 * @param surplus Surplus de voix (score - quota)
 * @param totalScore Score total du candidat
 * @param activeIds Candidats éligibles avant son élection
 * @returns Facteur de transfert appliqué
 */
export function applySurplusTransfer(
  papers: BallotPaper[],
  candId: string,
  surplus: number,
  totalScore: number,
  activeIds: Set<string>
): number {
  if (totalScore <= 0 || surplus <= 0) return 0;
  const factor = surplus / totalScore;

  for (const p of papers) {
    const active = p.ordre.find(id => activeIds.has(id) || id === candId);
    if (active === candId) {
      p.weight = p.weight * factor;
    }
  }
  return factor;
}
