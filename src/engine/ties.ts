import { Candidat, Departage, DepartageInfo } from './types.js';

/**
 * Simple Linear Congruential Generator (LCG) for reproducible pseudo-random draws
 */
export function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Shuffle an array deterministically given a seed
 */
export function seededShuffle<T>(array: T[], seed: number): T[] {
  const copy = [...array];
  const rand = seededRandom(seed);
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Resolves a tie for a specific number of seats to fill among tied candidate IDs.
 */
export function resolveTie(
  exAequoIds: string[],
  seatsToFill: number,
  methode: Departage,
  allCandidates: Map<string, Candidat>,
  existingSeed?: number
): DepartageInfo {
  if (exAequoIds.length <= seatsToFill) {
    return {
      besoinDepartage: false,
      methode,
      applique: false,
      candidatsExAequo: exAequoIds
    };
  }

  if (methode === 'tour') {
    return {
      besoinDepartage: true,
      motif: `Égalité parfaite entre ${exAequoIds.length} candidats pour ${seatsToFill} siège(s) restant(s). Un second tour est requis.`,
      candidatsExAequo: exAequoIds,
      methode: 'tour',
      applique: false,
      explication: 'Un second tour doit être organisé pour départager les ex æquo.'
    };
  }

  if (methode === 'age') {
    // Sort by birth date descending (youngest first). If birth date is missing, fallback to tie
    const candidatesWithBirth = exAequoIds.map(id => ({
      id,
      cand: allCandidates.get(id),
      birth: allCandidates.get(id)?.naissance || ''
    }));

    candidatesWithBirth.sort((a, b) => {
      if (!a.birth && !b.birth) return 0;
      if (!a.birth) return 1;
      if (!b.birth) return -1;
      // YYYY-MM-DD: b > a means b is younger (born later)
      return b.birth.localeCompare(a.birth);
    });

    const winners = candidatesWithBirth.slice(0, seatsToFill).map(c => c.id);
    const names = winners.map(id => allCandidates.get(id)?.prenom || id).join(', ');

    return {
      besoinDepartage: true,
      motif: `Égalité départagée selon le critère du plus jeune candidat.`,
      candidatsExAequo: exAequoIds,
      methode: 'age',
      applique: true,
      vainqueursTirage: winners,
      explication: `Candidat(s) retenu(s) au bénéfice du plus jeune âge : ${names}.`
    };
  }

  // Tirage au sort
  const seed = existingSeed ?? Math.floor(Math.random() * 1000000) + 1;
  const shuffled = seededShuffle(exAequoIds, seed);
  const winners = shuffled.slice(0, seatsToFill);
  const names = winners.map(id => allCandidates.get(id)?.prenom || id).join(', ');

  return {
    besoinDepartage: true,
    motif: `Égalité départagée par tirage au sort (graine n°${seed}).`,
    candidatsExAequo: exAequoIds,
    methode: 'tirage',
    applique: true,
    vainqueursTirage: winners,
    seed,
    explication: `Tirage au sort effectué (graine : ${seed}). Candidat(s) désigné(s) par le sort : ${names}.`
  };
}
