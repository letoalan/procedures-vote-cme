# ADR 0001 – Choix de TypeScript Vanilla et CSS natif

**Statut** : accepté · **Date** : 2026-10-01

---

## Contexte

Le projet cible un usage dans des écoles primaires et mairies sur une durée de vie prévisionnelle de plusieurs années, souvent sur du matériel informatique modeste (PC d'école reconditionnés, tablettes).

L'utilisation de frameworks JavaScript lourds (React, Angular, Next.js) pose plusieurs écueils majeurs :
1. **Obsolescence rapide** : churn élevé de dépendances, ruptures d'API régulières (breaking changes majeurs tous les 18 mois).
2. **Poids et temps de chargement** : surcoût inutile de bundle JS et impact négatif sur les machines peu véloces.
3. **Complexité inutile** : l'application manipule des formulaires, des tableaux et des boutons dont l'état se gère facilement de façon native.

---

## Décision

Nous adoptons **TypeScript Vanilla** couplé à **CSS moderne natif** et bundlé par **Vite** :
- Manipulation directe et performante du DOM via des composants modulaires.
- CSS natif avec variables (`var(--accent)`), CSS Grid et Flexbox sans framework utilitaire encombrant (Tailwind ou Bootstrap).
- Gestion d'état interne minimaliste avec un Store réactif de 70 lignes.

---

## Conséquences

### Positives
- **Pérennité exceptionnelle** : le code écrit continuera de tourner sans retouche dans 10 ans sur n'importe quel navigateur standard.
- **Taille de bundle minime** : l'application complète pèse moins de 50 Ko gzippé, s'ouvrant instantanément même hors ligne.
- **Zéro barrière d'entrée** : n'importe quel développeur maîtrisant JavaScript/TypeScript standard peut contribuer immédiatement.

### Négatives
- Écriture manuelle de la réactivité UI (création des éléments DOM, `addEventListener`, rafraîchissement ciblé).
- Nécessite une discipline rigoureuse de structuration pour éviter le code spaghetti (résolue par l'architecture en 4 couches et la limite de 200 lignes).
