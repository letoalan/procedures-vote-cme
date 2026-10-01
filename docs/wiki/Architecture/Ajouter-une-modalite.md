# Procédure : Ajouter une nouvelle modalité de scrutin

Ce guide détaille pas à pas l'intégration d'un nouveau système électoral dans l'application, en respectant les conventions de modularité et la limite stricte de 200 lignes par fichier.

---

## 1. Moteur algorithmique pur (`src/engine/`)

Créez le fichier `src/engine/maModalite.ts` contenant les calculs sans aucun effet de bord :

```ts
/**
 * @module engine/maModalite
 * Rôle : algorithme de calcul pour la modalité X.
 * Dépend de : core/types.
 */
import { Bulletin, Candidat, ResultatsCalcul } from '../core/types.js';

export function calculerMaModalite(
  bulletins: Bulletin[],
  candidats: Candidat[],
  sieges: number
): ResultatsCalcul {
  // Implémentation pure...
}
```

Créez immédiatement son test miroir `tests/engine/maModalite.test.ts` validant les cas nominaux et les cas limites (égalités, bulletins blancs, quorum).

Exposez la nouvelle fonction dans [src/engine/index.ts](file:///c:/Users/alano/OneDrive/Documents/GitHub/procedures-vote-cme/src/engine/index.ts).

---

## 2. Textes pédagogiques bilingues (`src/content/`)

Créez les deux versions du contenu explicatif :
1. `src/content/maModalite.kids.ts` : explications visuelles, vocabulaire accessible dès le CE2/CM1.
2. `src/content/maModalite.adults.ts` : fondements juridiques, code électoral de référence, analyse sociologique.

Enregistrez ces contenus dans `src/content/index.ts`.

---

## 3. Interface de saisie (`src/ui/ballot/`)

Si la modalité nécessite une forme de bulletin spécifique (ex: curseurs, attribution de notes, classement par glisser-déposer) :
1. Créez le composant dans `src/ui/ballot/monInput.ts`.
2. Connectez-le dans le gestionnaire principal [src/ui/ballotInput.ts](file:///c:/Users/alano/OneDrive/Documents/GitHub/procedures-vote-cme/src/ui/ballotInput.ts).

---

## 4. Documentation Wiki

1. Créez la fiche technique `docs/wiki/Modalites/Ma-modalite.md` en suivant le modèle standard :
   - Règle (énoncé formel)
   - Exemple chiffré
   - Cas limites
   - Liens vers le code et l'API TypeDoc
   - Lien vers la suite de tests
2. Ajoutez le lien dans [docs/wiki/_Sidebar.md](file:///c:/Users/alano/OneDrive/Documents/GitHub/procedures-vote-cme/docs/wiki/_Sidebar.md).

---

## 5. Contrôle qualité et validation

Exécutez la suite de vérifications obligatoires :

```bash
# Vérification du respect des 200 lignes
npm run check:lines

# Linter TypeScript
npm run lint

# Tests unitaires Vitest
npm test

# Build de production et documentation
npm run build
npm run docs
```

Tout test en échec ou fichier dépassant 200 lignes bloquera l'intégration continue.
