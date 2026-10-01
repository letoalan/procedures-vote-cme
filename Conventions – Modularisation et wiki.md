# Conventions de code : modularisation (200 lignes max) et wiki

## 1. Règle des 200 lignes

- **Aucun fichier source ne dépasse 200 lignes** (TS, CSS, HTML, tests), commentaires compris.
- Au-delà de 150 lignes, on prévoit le découpage ; à 200, on découpe obligatoirement.
- Une fonction ne dépasse pas 40 lignes ; un fichier = une responsabilité.
- Contrôle automatique : ESLint `max-lines` (erreur à 200) et `max-lines-per-function` (40).
- Exceptions : aucune pour le code ; seuls les fichiers de contenu textuel (`content/*.ts`) peuvent être scindés par public (`kids` / `adults`).

```js
// eslint.config.js (extrait)
rules: {
  'max-lines': ['error', { max: 200, skipBlankLines: false, skipComments: false }],
  'max-lines-per-function': ['warn', { max: 40 }],
  'max-depth': ['warn', 3],
  'complexity': ['warn', 10]
}
```

Script de vérification (CI et pré-commit) :

```json
"scripts": {
  "lint": "eslint src tests",
  "check:lines": "node scripts/check-lines.mjs",
  "docs": "typedoc",
  "test": "vitest run"
}
```

`scripts/check-lines.mjs` : parcourt `src/` et `tests/`, liste les fichiers > 200 lignes et renvoie un code d'erreur.

## 2. Arborescence modulaire

Les modules sont organisés **en couches**. Une couche ne dépend que des couches inférieures :
`ui → app → engine → core`.

```
src/
├─ core/                  # types et utilitaires, sans dépendance
│  ├─ types.ts            # Candidat, Bulletin, Config, Scrutin (~80)
│  ├─ ids.ts              # génération d'identifiants (~20)
│  └─ random.ts           # tirage au sort à graine (~40)
├─ engine/                # logique pure, 100 % testée
│  ├─ tally.ts            # comptage, blancs, nuls (~60)
│  ├─ thresholds.ts       # majorité absolue, quota, seuil (~40)
│  ├─ uninominal.ts       # variantes A et B (~90)
│  ├─ binome.ts           # 1er et 2nd tour (~70)
│  ├─ borda.ts            # barème et totaux (~60)
│  ├─ stv/
│  │  ├─ quota.ts         # (~30)
│  │  ├─ transfer.ts      # transferts de surplus (~90)
│  │  └─ run.ts           # boucle et journal (~90)
│  ├─ corrige.ts          # classement corrigé et seuil (~70)
│  ├─ ties.ts             # détection et départage (~70)
│  └─ index.ts            # computeResult(scrutin) (~40)
├─ app/                   # état et orchestration
│  ├─ store.ts            # état et abonnements (~90)
│  ├─ persistence.ts      # localStorage (~50)
│  ├─ actions.ts          # addBallot, undo, close… (~100)
│  └─ exports.ts          # JSON / CSV (~70)
├─ content/               # textes, sans logique
│  ├─ presentation.kids.ts / presentation.adults.ts
│  ├─ binome.kids.ts / binome.adults.ts
│  └─ … (un fichier par modalité et par public)
├─ ui/
│  ├─ tabs.ts             # onglets ARIA (~80)
│  ├─ audienceToggle.ts   # (~40)
│  ├─ modalityCard.ts     # rendu d'une fiche (~90)
│  ├─ setup/
│  │  ├─ setupForm.ts     # (~120)
│  │  ├─ candidateList.ts # (~100)
│  │  └─ binomeBuilder.ts # (~90)
│  ├─ ballot/
│  │  ├─ choiceInput.ts   # boutons candidat / binôme (~90)
│  │  ├─ rankInput.ts     # bulletin classé (~110)
│  │  └─ shortcuts.ts     # raccourcis clavier (~50)
│  ├─ results/
│  │  ├─ table.ts         # (~90)
│  │  ├─ bars.ts          # (~60)
│  │  ├─ indicators.ts    # (~60)
│  │  └─ correctedView.ts # brut vs corrigé (~80)
│  └─ pv/
│     ├─ pvView.ts        # procès-verbal (~120)
│     └─ tieBreaker.ts    # tirage, 2nd tour (~90)
├─ styles/  base.css · tabs.css · ballot.css · results.css · print.css
└─ main.ts                # point d'entrée (~40)
```

## 3. Règles de modularisation

1. **Fonctions pures** dans `engine/` : pas de DOM, pas de `localStorage`, pas de `Date.now()` (le temps est injecté).
2. **Un point d'entrée par dossier** (`index.ts`) qui expose l'API publique ; les autres fichiers sont internes.
3. **Imports** : uniquement vers le bas des couches ; dépendances circulaires interdites (`eslint-plugin-import/no-cycle`).
4. **Composants UI** : signature `render(root: HTMLElement, props): () => void` (la fonction retournée nettoie les écouteurs).
5. **Contenus** séparés du code : un texte se corrige sans toucher à la logique.
6. **Nommage** : fichiers en `camelCase.ts`, types en `PascalCase`, une exportation principale portant le nom du fichier.
7. **Tests miroirs** : `tests/engine/borda.test.ts` ↔ `src/engine/borda.ts`, eux aussi en dessous de 200 lignes.

## 4. Documentation dans le code (TSDoc)

Chaque fonction exportée est documentée. TypeDoc génère la référence d'API.

```ts
/**
 * Calcule les élus d'un vote unique avec classement corrigé.
 * @param tally   Voix par candidat (exprimés uniquement).
 * @param cands   Candidats avec leur sexe.
 * @param seuil   Seuil de repêchage en % des exprimés, ou null.
 * @returns       Classement brut, classement corrigé et élus.
 * @example
 * corrige({ g1: 10, g2: 7, f: 6 }, cands, 25) // élus : g1, f
 * @see wiki/Modalites/Vote-corrige.md
 */
export function corrige(tally: Tally, cands: Candidat[], seuil: number | null): CorrigeResult
```

En-tête obligatoire de chaque fichier :

```ts
/**
 * @module engine/corrige
 * Rôle : règle du classement corrigé (parité au 2e siège).
 * Dépend de : core/types, engine/thresholds.
 */
```

## 5. Wiki du projet

Le wiki est hébergé dans `docs/wiki/` (versionné avec le code) et synchronisé vers le wiki GitHub par une GitHub Action. Chaque page fait moins de 200 lignes.

```
docs/wiki/
├─ Home.md                 # présentation, liens rapides
├─ _Sidebar.md             # menu du wiki GitHub
├─ Guide/
│  ├─ Installation.md      # npm i, dev, build, hors ligne
│  ├─ Utilisation-prof.md  # déroulé d'une élection en classe
│  └─ Utilisation-elu.md   # vérification et certification du PV
├─ Modalites/
│  ├─ Binomes.md
│  ├─ Uninominal.md
│  ├─ Classement-Borda.md
│  ├─ Vote-transferable.md
│  └─ Vote-corrige.md
├─ Architecture/
│  ├─ Couches.md           # ui → app → engine → core (schéma)
│  ├─ Modele-de-donnees.md
│  ├─ Etat-et-persistance.md
│  └─ Ajouter-une-modalite.md
├─ Contribuer/
│  ├─ Conventions.md       # ce document, résumé
│  ├─ Tests.md
│  └─ Publication.md       # GitHub Pages, PWA
└─ ADR/                    # décisions d'architecture
   ├─ 0001-vanilla-ts.md
   ├─ 0002-stockage-bulletins-seuls.md
   └─ 0003-limite-200-lignes.md
```

### Modèle d'une page « Modalité »

```md
# Vote unique avec classement corrigé
## Règle            (énoncé formel)
## Exemple chiffré  (23 votants, 3 candidats)
## Cas limites      (égalité, seuil non atteint, un seul sexe)
## Implémentation   (lien vers src/engine/corrige.ts et l'API TypeDoc)
## Tests            (lien vers tests/engine/corrige.test.ts)
```

### Modèle d'ADR

```md
# ADR 0003 – Limite de 200 lignes par fichier
Statut : accepté · Date : 2026-10-01
Contexte : lisibilité, revue de code, usage d'assistants IA.
Décision : max-lines = 200, contrôlé en CI.
Conséquences : plus de fichiers, couplage réduit, tests ciblés.
```

### Synchronisation

- `typedoc` génère `docs/api/`, publié avec le site (`/api`).
- Action `wiki-sync.yml` : à chaque push sur `main`, copie `docs/wiki/` vers le dépôt `*.wiki.git`.
- Règle de PR : toute nouvelle fonction exportée ou modalité met à jour la page wiki correspondante (case à cocher dans le modèle de PR).

## 6. Intégration continue
Fichier `.github/workflows/ci.yml` : `npm ci` → `lint` → `check:lines` → `test` → `build` → `docs` → déploiement Pages (sur `main`).

## 7. Ajouter une modalité (procédure type)
1. `src/engine/maModalite.ts` + test miroir.
2. Enregistrer la modalité dans `engine/index.ts`.
3. Écrire les contenus `content/maModalite.kids.ts` et `.adults.ts`.
4. Si besoin, un composant de saisie dans `ui/ballot/`.
5. Créer la page `docs/wiki/Modalites/Ma-modalite.md` et la lier dans `_Sidebar.md`.
6. Vérifier : `npm run lint && npm run check:lines && npm test`.
