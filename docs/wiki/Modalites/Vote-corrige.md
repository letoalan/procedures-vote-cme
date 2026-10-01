# Vote unique avec classement corrigé

Le vote unique avec classement corrigé permet à chaque électeur d'attribuer une voix à un seul candidat, tout en garantissant la parité fille-garçon parmi les deux premiers élus grâce à une règle de repêchage conditionnelle.

## Règle (énoncé formel)

1. **Scrutin à un tour** : chaque électeur vote pour un candidat unique de son choix.
2. **Dépouillement brut** : les candidats sont ordonnés par nombre décroissant de voix.
3. **Premier siège attribué** : le candidat arrivant en tête (1er rang) est déclaré élu d'office, quel que soit son sexe.
4. **Second siège attribué** :
   - On recherche le candidat le mieux placé du sexe opposé au premier élu.
   - Si ce candidat atteint ou dépasse le **seuil de repêchage** fixé (par défaut 25 % des suffrages exprimés), il est déclaré élu au second siège.
   - Si le seuil n'est pas atteint ou si aucun candidat du sexe opposé n'est présent, le second élu est simplement le deuxième au classement brut (même si c'est le même sexe).
   - Si le seuil est désactivé (`seuil: null`), le repêchage paritaire s'applique sans condition de score minimal.

## Exemple chiffré (23 votants, 3 candidats)

Soit une élection avec 23 votants (23 suffrages exprimés) et un seuil de 25 % (soit 5,75 voix nécessaires) :

| Candidat | Sexe | Voix | % Exprimés | Rang brut | Résultat |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Alexandre** | M | 10 | 43,5 % | 1er | **Élu (1er siège)** |
| **Maxime** | M | 7 | 30,4 % | 2e | Non élu (non repêché) |
| **Camille** | F | 6 | 26,1 % | 3e | **Élue (2e siège, repêchée)** |

- Alexandre (Garçon) a le plus grand nombre de voix : il est élu au premier siège.
- Le second au classement brut est Maxime (Garçon, 7 voix).
- Camille est la fille la mieux classée (6 voix).
- Seuil de 25 % de 23 voix = 5,75 voix. Comme 6 ≥ 5,75, Camille satisfait le seuil.
- **Résultat final** : Alexandre et Camille sont élus, assurant la parité.

Si Camille n'avait obtenu que 5 voix (21,7 % < 25 %), Maxime aurait été élu au second siège.

## Cas limites

### Égalité de voix
En cas d'égalité de voix au seuil ou pour la sélection du premier candidat de l'autre sexe, une situation de départage (`TieSituation`) est détectée et soumise au tirage au sort certifié ou au départage à l'âge selon le règlement.

### Seuil non atteint
Si aucun candidat du sexe opposé n'atteint le seuil requis, le deuxième siège revient au 2e du classement brut. La démocratie directe prévaut sur l'obligation paritaire stricte.

### Candidats d'un seul sexe
Si l'ensemble des candidats déclarés sont du même sexe, le scrutin se transforme automatiquement en scrutin majoritaire plurinominal simple pour les 2 sièges.

## Implémentation

La fonction pure est implémentée dans [src/engine/corrige.ts](file:///c:/Users/alano/OneDrive/Documents/GitHub/procedures-vote-cme/src/engine/corrige.ts).

```ts
import { corrige } from '../engine/corrige.js';

const result = corrige(
  { 'cand-1': 10, 'cand-2': 7, 'cand-3': 6 },
  candidats,
  25 // Seuil en %
);
console.log(result.elus); // IDs des deux élus
```

Documentation API complète : consulter le portail TypeDoc (`docs/api/`).

## Tests

La conformité de la règle et des seuils est validée par la suite miroir [tests/engine/corrige.test.ts](file:///c:/Users/alano/OneDrive/Documents/GitHub/procedures-vote-cme/tests/engine/corrige.test.ts).

```bash
npm test tests/engine/corrige.test.ts
```
