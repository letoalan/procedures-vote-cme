/**
 * @module core/ids
 * Rôle : génération d'identifiants uniques pour scrutins, candidats et bulletins.
 * Dépend de : aucun.
 */

let counter = 0;

/**
 * Génère un identifiant unique compact.
 * @param prefix Préfixe optionnel (ex: 'cand', 'scrutin')
 * @returns Identifiant textuel unique
 */
export function generateId(prefix = 'id'): string {
  counter += 1;
  const rand = Math.random().toString(36).substring(2, 7);
  return `${prefix}_${Date.now().toString(36)}_${rand}_${counter}`;
}

/** Alias court pour génération d'id */
export const uid = generateId;
