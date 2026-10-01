# Scrutin uninominal à deux sièges (Mode 2)

## Règle (énoncé formel)

Chaque élève se présente individuellement sans filtre préalable. L'électeur dispose d'un suffrage unique pour choisir un candidat. Deux options sont disponibles :
- **Option B (Plurinominal à 1 tour - défaut)** : Les 2 candidats recueillant le plus grand nombre de suffrages exprimés sont proclamés élus à la majorité relative.
- **Option A (Majoritaire à 2 tours)** : Au 1er tour, seuls les candidats franchissant la majorité absolue (`floor(exprimés / 2) + 1`) sont élus. Si un siège reste vacant, un second tour est organisé entre les meilleurs candidats restants.

## Exemple chiffré (23 votants, 4 candidats, Option B)

Sur 23 exprimés :
- Hugo (G) : 10 voix (43.5 %) -> 1er
- Tom (G) : 8 voix (34.8 %) -> 2e
- Léa (F) : 4 voix (17.4 %) -> 3e
- Emma (F) : 1 voix (4.3 %) -> 4e

Hugo et Tom sont proclamés élus titulaires. La délégation est exclusivement masculine (absence de mécanisme paritaire).

## Cas limites

- **Égalité pour le 2e siège** : si Tom et Léa ont tous deux 6 voix, application de la règle prédéterminée (tirage au sort certifié ou règle républicaine de l'âge le plus jeune).
- **Majorité absolue au 1er tour (Option A)** : si Hugo a 12 voix et Tom 6 voix, seul Hugo est élu au tour 1 ; un second tour est ouvert entre Tom et les suivants pour pourvoir le second siège.

## Implémentation

- Fichier source : [`src/engine/uninominal.ts`](../../src/engine/uninominal.ts)
- Types : `Candidat`, `CandidatResultat` dans [`src/core/types.ts`](../../src/core/types.ts)
- API TypeDoc : `computeUninominalResults`

## Tests

- Tests miroirs : [`tests/engine/uninominal.test.ts`](../../tests/engine/uninominal.test.ts)
- Couverture : élection directe en Option B, gestion du second tour en Option A.
