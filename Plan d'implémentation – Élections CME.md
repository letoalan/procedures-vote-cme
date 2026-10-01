# Plan d'implémentation : page web « Élire ses délégués au CME »

## 1. Objectifs

- Informer sur les 4 modalités de vote, avec deux niveaux de lecture : **élèves (CM1-CM2)** et **adultes (professeur / élu)**.
- Fournir un **outil de dépouillement** qui compte les voix en direct, applique la règle choisie et produit un **procès-verbal** imprimable certifiable par l'élu.
- Fonctionner **hors ligne**, sans serveur, sans collecte de données (statique, GitHub Pages).

## 2. Choix techniques

| Élément | Choix | Raison |
|---|---|---|
| Build | Vite + TypeScript (vanilla) | Léger, pas de framework nécessaire |
| Style | CSS natif (variables, grid) | Contrôle total, impression facile |
| État | Un store TS simple + `localStorage` | Reprise après fermeture accidentelle |
| Tests | Vitest | Tests des algorithmes de comptage |
| Hébergement | GitHub Pages (ou fichier local) | Gratuit, utilisable en classe sans réseau après chargement |
| Option | PWA (service worker) | Usage 100 % hors ligne sur TNI/tablette |

## 3. Arborescence

```
cme-elections/
├─ index.html
├─ src/
│  ├─ main.ts               # routage des onglets
│  ├─ store.ts              # état global + persistance
│  ├─ content/
│  │  ├─ presentation.ts    # textes élèves / adultes
│  │  ├─ binome.ts
│  │  ├─ uninominal.ts
│  │  ├─ classement.ts
│  │  └─ corrige.ts
│  ├─ engine/               # logique pure, testée
│  │  ├─ types.ts
│  │  ├─ binome.ts
│  │  ├─ uninominal.ts
│  │  ├─ borda.ts
│  │  ├─ stv.ts             # option vote transférable
│  │  ├─ corrige.ts
│  │  └─ ties.ts            # départage
│  ├─ ui/
│  │  ├─ tabs.ts
│  │  ├─ audienceToggle.ts
│  │  ├─ setupForm.ts       # paramètres de l'élection
│  │  ├─ ballotInput.ts     # saisie des bulletins
│  │  ├─ liveResults.ts     # tableau + barres
│  │  └─ pv.ts              # procès-verbal
│  └─ styles/{base,tabs,print}.css
└─ tests/engine.test.ts
```

## 4. Structure de la page (6 onglets)

1. **Présentation**
2. **Binômes paritaires**
3. **Scrutin uninominal (2 sièges)**
4. **Vote par classement**
5. **Vote unique avec classement corrigé**
6. **Résultats / dépouillement**

En haut, un **interrupteur de public** : `Élèves` / `Adultes (professeur, élu)`. Il est mémorisé et s'applique aux onglets 1 à 5.

### Contenu des onglets 1 à 5 selon le public

| Bloc | Version élèves | Version adultes |
|---|---|---|
| Principe | Phrases courtes, exemple Léa/Tom/Hugo | Définition précise |
| Comment voter | Étapes illustrées (isoloir, urne, signature) | Forme du bulletin, causes de nullité |
| Qui gagne | Exemple chiffré simple | Règle formelle (majorités, quota, seuils) |
| Égalité | « On revote ou on tire au sort » | Règle de départage à annoncer |
| Pour / attention | 2 puces | Atouts, limites, effet sur la parité |
| Check-list du jour J | — | Préparation du bureau, PV, rôle de l'élu |
| Bouton | « Essayer » → onglet Résultats préréglé | idem |

Composant commun : `ModalityCard { principe, voter, gagner, egalite, plus, attention, checklist }`, avec deux jeux de textes (`kids`, `adults`).

## 5. Onglet Résultats

### 5.1 Paramétrage (verrouillé au début du dépouillement)

- **Procédure** : sélecteur parmi les 4 modalités (+ sous-option : uninominal A « deux scrutins » / B « deux premiers élus » ; classement : Borda / vote transférable).
- **Nombre d'inscrits** (élèves de la classe), par exemple 23.
- **Nombre de sièges** : 2 par défaut.
- **Candidats** : liste dynamique (ajouter / supprimer), avec pour chacun le **prénom** et le **sexe (F/G)**. Le sexe est obligatoire pour les modes binôme et corrigé.
- **Binômes** (mode 1) : constitution des paires F+G avec contrôle de mixité.
- **Barème Borda** : par défaut n-1, …, 0 (modifiable).
- **Seuil de repêchage** (mode 4) : désactivé, ou en % des exprimés (25 % par défaut).
- **Règle de départage** : nouveau tour / tirage au sort / plus jeune.
- **Bouton « Commencer le dépouillement »** : fige les paramètres et horodate le début.

### 5.2 Saisie des bulletins (au fil du dépouillement)

Un bulletin est saisi par clic : c'est la matérialisation du dépouillement.

| Mode | Interface de saisie |
|---|---|
| Binômes | Un grand bouton par binôme, + `Blanc`, + `Nul` |
| Uninominal | Un grand bouton par candidat, + `Blanc`, + `Nul` |
| Classement | Bulletin virtuel : clic successif sur les candidats → rang 1, 2, 3… ; `Valider` / `Effacer` ; `Nul` |
| Corrigé | Comme l'uninominal |

Fonctions communes :
- **Annuler le dernier bulletin**, et historique horodaté des bulletins.
- **Compteurs** : bulletins dépouillés / inscrits, exprimés, blancs, nuls, abstentions.
- **Garde-fou** : impossible de dépasser le nombre d'inscrits, avec alerte.
- **Raccourcis clavier** (1, 2, 3…, B, N, Ctrl+Z) pour aller vite au TNI.
- Option **« Saisie de totaux »** : entrer directement les résultats d'un comptage papier.

### 5.3 Affichage en direct

- Tableau : candidat, voix ou points, % des exprimés, rang.
- Barres horizontales animées.
- Indicateurs selon le mode : majorité absolue atteinte, quota de 8 voix atteint (« élu à coup sûr »), seuil de repêchage atteint.
- Mode classement : matrice des rangs (combien de fois chaque candidat est 1er, 2e, 3e) et total Borda.
- Mode corrigé : **deux colonnes** côte à côte, classement brut et classement corrigé, avec explication de la correction.

### 5.4 Clôture

- Bouton **« Clore le dépouillement »** : calcul final, détection d'égalité, puis proposition de départage :
  - tirage au sort intégré, avec affichage animé et graine notée au PV ;
  - ou lancement d'un **second tour**, qui crée un nouveau scrutin lié au premier.
- **Procès-verbal** (vue imprimable, `print.css`) : école, classe, date, heures, modalité et règles, chiffres (inscrits, votants, blancs, nuls, exprimés), résultats bruts et corrigés, élus, signatures (président, assesseurs, élu municipal).
- Export **JSON** (archivage, réimport) et **CSV** des résultats.

## 6. Modèle de données (TypeScript)

```ts
type Sexe = 'F' | 'G';
type Mode = 'binome' | 'uninominal' | 'classement' | 'corrige';

interface Candidat { id: string; prenom: string; sexe: Sexe; }
interface Binome { id: string; fille: string; garcon: string; } // ids candidats

interface Config {
  mode: Mode;
  sousMode?: 'A' | 'B' | 'borda' | 'stv';
  inscrits: number;
  sieges: number;
  candidats: Candidat[];
  binomes?: Binome[];
  bareme?: number[];
  seuilRepechage?: number | null;  // en % des exprimés
  departage: 'tour' | 'tirage' | 'age';
}

type Bulletin =
  | { type: 'choix'; cible: string; t: number }        // candidat ou binôme
  | { type: 'rang'; ordre: string[]; t: number }       // classement
  | { type: 'blanc' | 'nul'; t: number };

interface Scrutin {
  id: string; config: Config; bulletins: Bulletin[];
  debut?: number; fin?: number; tourPrecedent?: string;
}
```

Principe : **on ne stocke que les bulletins** ; tous les résultats sont recalculés à chaque saisie par des fonctions pures. Annuler et rejouer devient alors trivial.

## 7. Algorithmes (dossier `engine/`)

- **Comptage simple** : `tally(bulletins) → Map<id, voix>`, avec blancs et nuls à part.
- **Majorité absolue** : `floor(exprimés / 2) + 1`.
- **Quota d'élection sûre (2 sièges)** : `floor(exprimés / (sieges + 1)) + 1` (8 pour 23 votants).
- **Uninominal A** : siège 1 (majorité absolue, sinon 2e tour), puis siège 2 parmi les candidats restants.
- **Uninominal B** : tri décroissant, les `sieges` premiers sont élus.
- **Borda** : somme des points par rang ; un classement partiel donne 0 point aux non-classés.
- **Vote transférable (option)** : quota de Droop, transferts du surplus en méthode de Gregory simplifiée, éliminations successives ; journal des étapes affiché.
- **Corrigé** : élu 1 = premier du classement ; élu 2 = meilleur candidat de l'autre sexe qui atteint le seuil, sinon le deuxième du classement brut.
- **Binôme** : comptage par binôme ; majorité absolue au 1er tour, sinon second tour entre les deux premiers.
- **Égalités** : détection en bordure de siège, puis application de la règle choisie.

## 8. Accessibilité et ergonomie

- Gros boutons (au moins 64 px) pour le TNI, contraste AA, police lisible (Luciole ou Atkinson Hyperlegible).
- Onglets ARIA (`role="tablist"`), navigation au clavier.
- Mode « projection » plein écran pour le dépouillement devant la classe.
- Pas de dépendance réseau, pas de cookies, aucune donnée transmise (conforme RGPD pour des mineurs).

## 9. Tests

- Tests unitaires de chaque moteur avec des jeux connus, par exemple 23 votants : F = 8, G1 = 10, G2 = 5 ; cas d'égalité ; seuil non atteint ; classement partiel.
- Test de non-dépassement du nombre d'inscrits.
- Test de persistance (rechargement de la page en cours de dépouillement).
- Vérification visuelle du PV imprimé sur une page A4.

## 10. Feuille de route

| Étape | Contenu | Livrable |
|---|---|---|
| 1 | Squelette Vite, onglets, interrupteur de public | Navigation fonctionnelle |
| 2 | Rédaction des contenus élèves et adultes | Onglets 1 à 5 complets |
| 3 | Moteurs de calcul et tests Vitest | `engine/` testé |
| 4 | Paramétrage et saisie des bulletins | Dépouillement opérationnel |
| 5 | Résultats en direct, départage, second tour | Onglet Résultats complet |
| 6 | PV imprimable, exports JSON/CSV, persistance | Version utilisable en classe |
| 7 | PWA hors ligne, accessibilité, déploiement GitHub Pages | Version 1.0 |
| 8 (option) | Mode « simulation » : comparer les 4 modes sur les mêmes bulletins | Outil pédagogique |

## 11. Idée pédagogique bonus

Un mode **« Et si… ? »** : après un vote par classement, les bulletins classés contiennent assez d'information pour recalculer les résultats selon les 4 modalités. On affiche côte à côte qui aurait été élu dans chaque cas. C'est le meilleur moyen de montrer aux élèves que **la règle du jeu change le résultat**.
