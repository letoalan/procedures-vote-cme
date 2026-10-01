# Modèle de données

Le modèle de données de l'application est centralisé dans [src/core/types.ts](file:///c:/Users/alano/OneDrive/Documents/GitHub/procedures-vote-cme/src/core/types.ts). Il formalise les entités électorales, les bulletins enregistrés et les résultats calculés.

## Entités fondamentales

### 1. `Candidat`
Représente un élève se présentant à l'élection.

```ts
export interface Candidat {
  id: string;        // UUID unique (ex: "cand-1")
  prenom: string;    // Prénom de l'élève
  nom?: string;      // Nom ou initiale (facultatif)
  sexe: 'F' | 'G';   // Fille ou Garçon (pour les règles paritaires)
  naissance?: string;// Date ISO (YYYY-MM-DD) pour le départage à l'âge
}
```

### 2. `Binome`
Associe deux candidats de sexes opposés pour le scrutin paritaire.

```ts
export interface Binome {
  id: string;        // UUID unique
  fille: string;     // Identifiant du candidat F
  garcon: string;    // Identifiant du candidat G
  nom?: string;      // Nom d'équipe ou désignation personnalisée
}
```

### 3. `Bulletin`
Tout vote déposé dans l'urne virtuelle est un bulletin typé et immuable.

```ts
export type NewBulletin =
  | { type: 'choix'; cible: string; id?: string }  // Vote uninominal / binôme
  | { type: 'rang'; ordre: string[]; id?: string } // Borda / STV
  | { type: 'blanc'; id?: string }                 // Vote blanc
  | { type: 'nul'; id?: string };                  // Vote nul

export type Bulletin = NewBulletin & { t: number }; // t = timestamp millisecondes
```

> [!NOTE]
> Le stockage des bulletins est l'unique source de vérité. Les totaux de voix et listes d'élus ne sont pas stockés tels quels mais recalculés à la volée.

---

## Configuration de scrutin (`Config`)

La configuration regroupe tous les paramètres définis lors de la phase de préparation :

```ts
export interface Config {
  mode: 'binome' | 'uninominal' | 'classement' | 'corrige';
  sousMode?: 'deux_tours' | 'un_tour' | 'A' | 'B' | 'borda' | 'stv';
  inscrits: number;           // Nombre d'élèves sur la liste électorale
  sieges: number;             // Nombre de conseillers à élire
  candidats: Candidat[];      // Liste des candidats
  binomes?: Binome[];         // Liste des binômes si mode binôme
  bareme?: number[];          // Barème de points Borda (ex: [5, 3, 2, 1])
  seuilRepechage?: number | null; // % exprimés (défaut 25%) pour classement corrigé
  departage: 'tour' | 'tirage' | 'age'; // Règle en cas d'ex aequo
  ecole?: string;
  classe?: string;
  commune?: string;
  dateScrutin?: string;
}
```

---

## Synthèse et Résultats (`ResultatsCalcul`)

Les moteurs de calcul (`engine/`) produisent une structure unifiée `ResultatsCalcul` :

```ts
export interface ResultatsCalcul {
  tally: TallyResult;                   // Synthèse globale (inscrits, votants, exprimés)
  mode: Mode;
  sieges: number;
  candidatsResultats?: CandidatResultat[];
  binomesResultats?: BinomeResultat[];
  classementBrut?: CandidatResultat[];
  classementCorrige?: CandidatResultat[];
  matriceRangs?: Record<string, number[]>; // Pour Borda
  stvDetails?: STVResultat;                // Étapes et transferts pour STV
  departageInfo: DepartageInfo;            // Gestion des égalités et tirages
  elusIds: string[];                       // Candidats définitivement élus
  secondTourRequis?: boolean;              // Si ballotage (majorité absolue non atteinte)
  candidatsSecondTour?: string[];
}
```

---
*Lien connexe : [Couches logicielles](Couches.md) · [État et persistance](Etat-et-persistance.md)*
