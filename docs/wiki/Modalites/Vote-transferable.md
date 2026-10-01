# Vote Unique Transférable / STV (Option Mode 3)

## Règle (énoncé formel)

Système proportionnel préférentiel (méthode de Hare-Clark / STV) :
1. Calcul du **Quota de Droop** : `floor(exprimés / (sièges + 1)) + 1`.
2. Tout candidat atteignant le quota est immédiatement élu.
3. Son **surplus de voix** (`voix - quota`) est transféré aux candidats suivants selon la méthode de Gregory (pondération des bulletins : `surplus / totalScore`).
4. Si aucun candidat n'atteint le quota, le candidat ayant le moins de voix est éliminé et ses bulletins sont reportés à pleine valeur sur les préférences suivantes.
5. Le processus itère jusqu'à ce que tous les sièges soient pourvus.

## Exemple chiffré (10 votants, 2 sièges)

- Quota de Droop = `floor(10 / 3) + 1 = 4 voix`.
- 6 bulletins classent `[Alice, Bob, Charlie]`
- 4 bulletins classent `[Charlie, Bob, Alice]`

Tour 1 :
- Alice obtient 6 voix (>= 4) : **Alice est élue**. Surplus = 2 voix.
- Charlie obtient 4 voix (>= 4) : **Charlie est élu**.
Les deux sièges sont pourvus directement dès le 1er décompte.

## Cas limites

- **Éliminations successives** : élimination du candidat ayant le plus faible score lorsque aucun candidat n'atteint le quota.
- **Bulletins épuisés** : si les préférences suivantes sont déjà élues ou éliminées, le bulletin devient inactif.

## Implémentation

- Fichiers sources : [`src/engine/stv/quota.ts`](../../src/engine/stv/quota.ts), [`src/engine/stv/transfer.ts`](../../src/engine/stv/transfer.ts), [`src/engine/stv/run.ts`](../../src/engine/stv/run.ts)
- Journal détaillé : `stvDetails.etapes`

## Tests

- Tests miroirs : [`tests/engine/stv.test.ts`](../../tests/engine/stv.test.ts)
