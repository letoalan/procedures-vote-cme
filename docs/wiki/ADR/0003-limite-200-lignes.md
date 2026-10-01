# ADR 0003 – Limite stricte de 200 lignes par fichier

**Statut** : accepté · **Date** : 2026-10-01

---

## Contexte

Les projets logiciels grandissent naturellement vers des fichiers « monstres » (plusieurs centaines, voire milliers de lignes) qui mélangent algorithmes, état, styles et interface.
Dans le contexte de ce projet :
1. Les fichiers volumineux dégradent drastiquement la lisibilité pour les enseignants et étudiants qui souhaitent auditer le code.
2. Les revues de code (PR) deviennent complexes et propices aux régressions.
3. L'utilisation d'assistants IA est considérablement plus efficace et précise sur des fichiers courts et ciblés avec des contextes bien délimités.

---

## Décision

Nous imposons une **limite absolue de 200 lignes par fichier** (commentaires et lignes vides inclus).
- Cette règle s'applique à tous les fichiers sources : TypeScript (`src/**/*.ts`, `tests/**/*.ts`), feuilles de style (`src/styles/*.css`), pages wiki (`docs/wiki/**/*.md`), et scripts utilitaires (`scripts/*.mjs`).
- La conformité est vérifiée automatiquement à deux niveaux :
  1. Le script dédié `scripts/check-lines.mjs` (exécuté par `npm run check:lines`).
  2. La règle ESLint `max-lines`.
- La CI bloque tout commit ou pull request comportant un fichier de plus de 200 lignes.

---

## Conséquences

### Positives
- **Architecture ultra-modulaire** : force à respecter le principe de responsabilité unique (SRP).
- **Facilité de navigation** : chaque fichier a un périmètre évident, documenté par son en-tête `@module`.
- **Tests unitaires ciblés** : corrélation 1:1 entre un module d'au plus 200 lignes et son fichier de test miroir.
- **Maintenance assistée facilitée** : traitement sans troncature ni oubli par les agents intelligents.

### Négatives
- Nombre accru de fichiers dans l'arborescence du projet (résolu par une hiérarchie de sous-dossiers claire et l'usage de barils d'exportation `index.ts`).
