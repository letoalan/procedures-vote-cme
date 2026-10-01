# Stratégie de tests et assurance qualité

Le projet applique une couverture de tests automatisée rigoureuse, garantissant la justesse civique et légale de chaque mode de scrutin.

---

## Architecture des tests

Les tests sont exécutés avec [Vitest](https://vitest.dev/) et se trouvent dans le répertoire `tests/`.

### Organisation miroir
Chaque fichier algorithmique de `src/engine/` dispose d'un fichier miroir dans `tests/engine/` :

```
src/engine/                tests/engine/
├── thresholds.ts   --->   ├── thresholds.test.ts
├── tally.ts        --->   ├── tally.test.ts
├── uninominal.ts   --->   ├── uninominal.test.ts
├── binome.ts       --->   ├── binome.test.ts
├── borda.ts        --->   ├── borda.test.ts
├── stv/            --->   ├── stv.test.ts
├── corrige.ts      --->   ├── corrige.test.ts
└── ties.ts         --->   ├── ties.test.ts
```

---

## Catégories de cas testés

Pour chaque modalité, la suite de tests couvre obligatoirement :

1. **Cas nominaux** : distribution claire des voix, attribution attendue des sièges.
2. **Majorités et quorums** :
   - Élection au premier tour avec majorité absolue atteinte ($> 50\%$).
   - Ballotages et second tour nécessaire.
3. **Parité fille-garçon** :
   - Respect strict de la parité dans les binômes.
   - Repêchage du sexe opposé dans le classement corrigé.
   - Non-repêchage si le seuil minimal n'est pas atteint.
4. **Cas limites et pathologies électorales** :
   - Égalité parfaite de voix (déclenchement des règles de départage par tirage ou âge).
   - $100\%$ de votes blancs ou nuls.
   - Aucun candidat déclaré du sexe opposé.
   - Nombre de candidats inférieur au nombre de sièges.

---

## Commandes utiles

```bash
# Exécution unique de tous les tests
npm test

# Mode surveillance interactif (watch)
npm run test:watch

# Génération du rapport de couverture de code
npm run test:coverage
```

Tous les tests doivent s'exécuter en moins de 2 secondes, sans dépendance réseau ni accès aux fichiers du disque.
