# Conventions de développement et qualité de code

Ce document résume les standards obligatoires pour toute contribution au projet.

---

## 1. Limite stricte de 200 lignes par fichier

- **Règle absolue** : aucun fichier de code source (`.ts`, `.css`, `.html`), script ou page de documentation ne doit dépasser **200 lignes** (commentaires et lignes vides inclus).
- **Vérification automatique** :
  - Script dédié : `npm run check:lines` (via `scripts/check-lines.mjs`).
  - Règle ESLint : `max-lines: ["error", { max: 200, skipBlankLines: false, skipComments: false }]`.
- **En cas de dépassement** : découper le fichier en modules cohésifs regroupés dans un sous-dossier avec un fichier `index.ts`.

---

## 2. Dépendances et flux des couches

Respecter scrupuleusement la hiérarchie des couches :
$$\text{ui} \longrightarrow \text{app} \longrightarrow \text{engine} \longrightarrow \text{core}$$

- **`core/`** : Aucun import depuis une autre couche.
- **`engine/`** : N'importe que `core/`. Doit rester **100 % pur** (aucun accès au DOM, aucun `localStorage`, aucune requête asynchrone).
- **`app/`** : N'importe que `engine/` et `core/`.
- **`ui/`** : Peut importer de toutes les couches sous-jacentes.

---

## 3. Documentation TSDoc et en-têtes

### En-tête obligatoire de fichier
Chaque fichier TypeScript commence par son en-tête `@module` :

```ts
/**
 * @module engine/tally
 * Rôle : calcul des suffrages exprimés, majorités et quorums.
 * Dépend de : core/types.
 */
```

### Documentation des fonctions exportées
Toute fonction publique doit être documentée avec ses paramètres, sa valeur de retour, un exemple et un lien vers le wiki :

```ts
/**
 * Calcule le dépouillement complet des bulletins.
 * @param bulletins Liste des bulletins exprimés ou blancs.
 * @param inscrits  Nombre d'électeurs sur la liste électorale.
 * @param sieges    Nombre de sièges à pourvoir.
 * @returns Synthèse de participation et des majorités.
 * @see wiki/Architecture/Couches.md
 */
```

---

## 4. Nommage et styles

- **Fichiers** : `camelCase.ts` pour les modules, `PascalCase.ts` pour les composants UI ou classes.
- **Fonctions & variables** : `camelCase`.
- **Types & Interfaces** : `PascalCase`.
- **Constantes globales** : `UPPER_SNAKE_CASE`.
- **Extensions d'import** : Toujours inclure `.js` dans les chemins relatifs TypeScript pour la compatibilité ESM native (ex: `from './types.js'`).
