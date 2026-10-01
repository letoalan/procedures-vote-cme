# Guide d'installation et fonctionnement hors-ligne

## Prérequis

- Node.js (version 18 ou supérieure recommandée)
- npm (version 9+)

## Installation locale

1. Cloner le dépôt Git :
```bash
git clone https://github.com/letoalan/procedures-vote-cme.git
cd procedures-vote-cme
```

2. Installer les dépendances :
```bash
npm install
```

## Commandes disponibles

| Commande | Rôle |
|---|---|
| `npm run dev` | Lance le serveur de développement local Vite (avec HMR) |
| `npm run build` | Valide les types TypeScript et compile le bundle de production dans `dist/` |
| `npm run preview` | Prévisualise localement le bundle compilé |
| `npm test` | Exécute la suite de tests unitaires Vitest |
| `npm run lint` | Lance le linter ESLint (règles de modularité) |
| `npm run check:lines` | Vérifie la conformité stricte de la règle des 200 lignes |
| `npm run docs` | Génère la documentation d'API complète avec TypeDoc |

## Fonctionnement hors-ligne et PWA

L'application est conçue pour fonctionner de manière totalement autonome sans accès Internet dans les salles de classe :
- Les polices et styles sont intégrés ou mis en cache.
- Un Service Worker (`sw.js`) met en cache les ressources de l'application.
- Les données de l'élection sont stockées exclusivement dans le `localStorage` du navigateur.
- Aucun cookie, traceur ou appel réseau n'est effectué : conformité stricte au RGPD pour les mineurs.
