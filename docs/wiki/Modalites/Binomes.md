# Scrutin de binômes paritaires (Mode 1)

## Règle (énoncé formel)

Inspiré du scrutin départemental français (loi du 17 mai 2013), ce mode impose une candidature sous forme de ticket indissociable composé obligatoirement d'une fille et d'un garçon. L'électeur dispose d'un suffrage unique pour choisir un binôme complet.
- **Au 1er tour** : la majorité absolue des suffrages exprimés est requise (`floor(exprimés / 2) + 1`). Si un binôme l'obtient, il est proclamé élu.
- **Au 2nd tour (ballottage)** : si aucun binôme n'atteint la majorité absolue, un second tour est organisé entre les deux premiers binômes. La majorité relative suffit alors.

## Exemple chiffré (23 votants, 3 binômes)

Sur 23 élèves votants (23 exprimés) :
- Binôme A (Léa & Hugo) : 12 voix (52.2 %)
- Binôme B (Emma & Tom) : 8 voix (34.8 %)
- Binôme C (Chloé & Gaspard) : 3 voix (13.0 %)

La majorité absolue est de `floor(23 / 2) + 1 = 12 voix`. Le Binôme A atteint exactement 12 voix et est élu dès le premier tour.

## Cas limites

- **Absence de majorité absolue** : si A obtient 10 voix, B 8 voix et C 5 voix, aucun n'atteint 12 voix. Le système déclenche automatiquement un second tour opposant A et B.
- **Égalité pour la 2e place** : si B et C ont tous deux 6 voix au premier tour, application de la règle de départage (tirage au sort certifié ou règle du plus jeune âge moyen).

## Implémentation

- Fichier source : [`src/engine/binome.ts`](../../src/engine/binome.ts)
- Types : `Binome`, `BinomeResultat` dans [`src/core/types.ts`](../../src/core/types.ts)
- API TypeDoc : documentation générée sous `docs/api/`

## Tests

- Tests miroirs : [`tests/engine/binome.test.ts`](../../tests/engine/binome.test.ts)
- Couverture : élection dès le 1er tour à la majorité absolue, déclenchement du second tour en cas de ballottage.
