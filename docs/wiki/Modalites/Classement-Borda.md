# Vote préférentiel par classement de Borda (Mode 3)

## Règle (énoncé formel)

Méthode inspirée du chevalier Jean-Charles de Borda (1770). Sur un bulletin unique, chaque électeur classe librement jusqu'à 5 candidats par ordre de préférence :
- **Rang 1** : 5 points
- **Rang 2** : 4 points
- **Rang 3** : 3 points
- **Rang 4** : 2 points
- **Rang 5** : 1 point
- **Candidats non classés** : 0 point

Le vote partiel (1 à 4 candidats ordonnés) est pleinement valide. Les points de tous les bulletins exprimés sont agrégés. Les 2 candidats cumulant le plus grand total de points sont élus.

## Exemple chiffré (6 votants, 6 candidats)

- 4 électeurs classent `[Alice, Bob, Charlie, David, Emma]`
- 2 électeurs classent `[Farid, Emma, David]` (vote partiel)

Totaux de points :
- Alice : 4 × 5 pts = 20 pts (Élue)
- Bob : 4 × 4 pts = 16 pts (Élu)
- David : (4 × 2) + (2 × 3) = 14 pts
- Charlie : 4 × 3 = 12 pts
- Emma : (4 × 1) + (2 × 4) = 12 pts
- Farid : 2 × 5 = 10 pts

Alice et Bob sont élus grâce à une large assise préférentielle.

## Cas limites

- **Égalité de points** : départage hiérarchique grâce à la matrice des rangs (celui qui a le plus de 1ers choix, puis de 2es choix, etc.). Si l'égalité subsiste sur tous les rangs : tirage au sort certifié.
- **Vote partiel** : aucun point n'est attribué aux rangs laissés vacants.

## Implémentation

- Fichier source : [`src/engine/borda.ts`](../../src/engine/borda.ts)
- Matrice des rangs : `matriceRangs[candidatId]`
- API TypeDoc : `computeBordaResults`

## Tests

- Tests miroirs : [`tests/engine/borda.test.ts`](../../tests/engine/borda.test.ts)
