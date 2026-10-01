/**
 * @module engine/stv/quota
 * Rôle : calcul du quota de Droop pour le scrutin à vote transférable.
 * Dépend de : aucun.
 */

/**
 * Calcule le quota de Droop pour le vote unique transférable.
 * Formule : floor(exprimes / (sieges + 1)) + 1
 * @param exprimes Nombre de suffrages exprimés
 * @param sieges Nombre de sièges à pourvoir
 * @returns Quota de Droop
 */
export function calculateDroopQuota(exprimes: number, sieges: number): number {
  if (exprimes <= 0) return 1;
  return Math.floor(exprimes / (sieges + 1)) + 1;
}
