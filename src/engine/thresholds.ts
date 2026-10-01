/**
 * @module engine/thresholds
 * Rôle : calcul des seuils électoraux (majorité absolue, quota d'élection sûre, seuil de repêchage).
 * Dépend de : aucun.
 */

/**
 * Calcule la majorité absolue (moitié des suffrages exprimés plus un).
 * @param exprimes Nombre de suffrages valablement exprimés
 * @returns Nombre minimal de voix requis pour la majorité absolue
 */
export function majoriteAbsolue(exprimes: number): number {
  if (exprimes <= 0) return 1;
  return Math.floor(exprimes / 2) + 1;
}

/**
 * Calcule le quota d'élection certaine (formule de Droop / quota certain).
 * Garantit mathématiquement l'obtention d'un des sièges quel que soit le comportement des autres voix.
 * @param exprimes Nombre de suffrages exprimés
 * @param sieges Nombre de sièges à pourvoir
 * @returns Quota de voix suffisant pour être élu
 */
export function quotaSur(exprimes: number, sieges = 2): number {
  if (exprimes <= 0) return 1;
  return Math.floor(exprimes / (sieges + 1)) + 1;
}

/**
 * Calcule le nombre minimal de voix correspondant à un seuil en pourcentage.
 * @param exprimes Nombre total de suffrages exprimés
 * @param seuilPct Pourcentage requis (ex: 25 pour 25%) ou null
 * @returns Nombre de voix minimal (arrondi supérieur)
 */
export function seuilVoix(exprimes: number, seuilPct: number | null): number {
  if (!seuilPct || seuilPct <= 0 || exprimes <= 0) return 0;
  return Math.ceil((exprimes * seuilPct) / 100);
}

/**
 * Vérifie si un nombre de voix atteint le seuil exigé.
 * @param voix Voix obtenues
 * @param exprimes Total des suffrages exprimés
 * @param seuilPct Pourcentage requis
 */
export function estSeuilAtteint(voix: number, exprimes: number, seuilPct: number | null): boolean {
  if (!seuilPct) return true;
  return voix >= seuilVoix(exprimes, seuilPct);
}
