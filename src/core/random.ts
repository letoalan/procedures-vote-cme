/**
 * @module core/random
 * Rôle : générateur pseudo-aléatoire à graine pour tirage au sort reproductible.
 * Dépend de : aucun.
 */

/**
 * Générateur pseudo-aléatoire 32-bit (Mulberry32).
 * Permet un tirage au sort certifié et vérifiable au procès-verbal.
 * @param seed Graine numérique entière
 * @returns Fonction retournant un nombre pseudo-aléatoire dans [0, 1[
 */
export function createRNG(seed: number): () => number {
  let s = Math.floor(seed) >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Mélange un tableau de façon déterministe avec une graine (Fisher-Yates).
 * @param array Tableau d'éléments à mélanger
 * @param seed Graine de tirage
 * @returns Nouveau tableau mélangé
 */
export function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const copy = [...array];
  const rng = createRNG(seed);
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}
