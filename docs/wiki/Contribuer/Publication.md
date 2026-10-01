# Publication et déploiement

Ce document décrit le cycle de vie de génération des livrables, la publication sur GitHub Pages et la gestion du fonctionnement hors ligne (PWA).

---

## 1. Processus de Build

L'application est compilée avec **Vite** et le compilateur TypeScript :

```bash
# Vérification des types TypeScript et compilation du bundle de production
npm run build
```

Le résultat est généré dans le répertoire `dist/` :
- `dist/index.html` : page principale avec styles et scripts minifiés.
- `dist/assets/` : scripts JS et styles CSS avec hachage de cache (ex: `index-a1b2c3d4.js`).

---

## 2. Génération de la documentation TypeDoc

La documentation technique de l'API est extraite automatiquement des commentaires TSDoc :

```bash
# Génération du site TypeDoc
npm run docs
```

Les pages HTML statiques sont générées dans `docs/api/`. Lors du déploiement GitHub Pages, ce dossier est intégré à l'URL `/api/` pour consultation directe.

---

## 3. Déploiement GitHub Pages

Le déploiement est entièrement automatisé par GitHub Actions dans le workflow `.github/workflows/ci.yml`.

### Étapes du pipeline CI/CD sur la branche `main` :
1. `npm ci` : installation déterministe des dépendances.
2. `npm run lint` : validation de la syntaxe et des règles ESLint.
3. `npm run check:lines` : contrôle de la limite des 200 lignes.
4. `npm test` : validation des 18+ tests unitaires Vitest.
5. `npm run build` : compilation Vite.
6. `npm run docs` : compilation de la documentation TypeDoc.
7. Publication de l'artefact combiné sur GitHub Pages.

---

## 4. Fonctionnement hors ligne (Offline-First)

L'application est conçue pour fonctionner dans les conditions réelles des écoles primaires :
- **Zéro appel API externe** : tout s'exécute dans le moteur JavaScript du navigateur.
- **Zéro télémétrie intrusive** : respect strict du RGPD pour les données des mineurs.
- **Portabilité** : l'archive `dist/` peut être hébergée sur une clé USB ou un serveur web local sans accès Internet.
