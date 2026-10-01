/**
 * @module core/types
 * Rôle : définitions des types et structures de données de l'application.
 * Dépend de : aucun (module de base).
 */

export type Sexe = 'F' | 'G';
export type Mode = 'binome' | 'uninominal' | 'classement' | 'corrige';
export type SousModeBinome = 'deux_tours' | 'un_tour';
export type SousModeUninominal = 'A' | 'B';
export type SousModeClassement = 'borda' | 'stv';
export type Departage = 'tour' | 'tirage' | 'age';

/** Représente un élève candidat */
export interface Candidat {
  id: string;
  prenom: string;
  nom?: string;
  sexe: Sexe;
  naissance?: string; // YYYY-MM-DD pour départage à l'âge
}

/** Représente un binôme paritaire fille-garçon */
export interface Binome {
  id: string;
  fille: string;    // id candidat fille
  garcon: string;   // id candidat garçon
  nom?: string;
}

/** Configuration complète d'une élection */
export interface Config {
  mode: Mode;
  sousMode?: SousModeBinome | SousModeUninominal | SousModeClassement;
  inscrits: number;
  sieges: number;
  candidats: Candidat[];
  binomes?: Binome[];
  bareme?: number[];
  seuilRepechage?: number | null; // % des exprimés (défaut 25)
  departage: Departage;
  ecole?: string;
  classe?: string;
  commune?: string;
  dateScrutin?: string;
}

export type NewBulletin =
  | { type: 'choix'; cible: string; id?: string }
  | { type: 'rang'; ordre: string[]; id?: string }
  | { type: 'blanc'; id?: string }
  | { type: 'nul'; id?: string };

/** Bulletin horodaté déposé dans l'urne */
export type Bulletin = NewBulletin & { t: number };

/** Synthèse de dépouillement et majorités */
export interface TallyResult {
  inscrits: number;
  votants: number;
  blancs: number;
  nuls: number;
  exprimes: number;
  participationPct: number;
  majoriteAbsolue: number; // floor(exprimes / 2) + 1
  quotaSur: number;       // floor(exprimes / (sieges + 1)) + 1
}

/** Score et statut d'un candidat */
export interface CandidatResultat {
  id: string;
  candidat: Candidat;
  voix: number;
  points?: number;
  pct: number;
  rangBrut: number;
  elu: boolean;
  mentionElu?: string;
  seuilAtteint?: boolean;
}

/** Score et statut d'un binôme */
export interface BinomeResultat {
  id: string;
  binome: Binome;
  candidatFille: Candidat;
  candidatGarcon: Candidat;
  voix: number;
  pct: number;
  rangBrut: number;
  elu: boolean;
  mentionElu?: string;
}

/** Informations de départage en cas d'égalité */
export interface DepartageInfo {
  besoinDepartage: boolean;
  motif?: string;
  candidatsExAequo?: string[];
  methode: Departage;
  applique: boolean;
  vainqueursTirage?: string[];
  seed?: number;
  explication?: string;
}

export interface STVEtape {
  numero: number;
  action: 'quota' | 'surplus' | 'elimination' | 'fin';
  description: string;
  etatVoix: Record<string, number>;
  elusActuels: string[];
  eliminesActuels: string[];
}

export interface STVResultat {
  quota: number;
  etapes: STVEtape[];
  elus: string[];
  scoresFinaux: Record<string, number>;
}

/** Résultat global calculé d'un scrutin */
export interface ResultatsCalcul {
  tally: TallyResult;
  mode: Mode;
  sousMode?: string;
  sieges: number;
  candidatsResultats?: CandidatResultat[];
  binomesResultats?: BinomeResultat[];
  classementBrut?: CandidatResultat[];
  classementCorrige?: CandidatResultat[];
  explicationCorrection?: string;
  matriceRangs?: Record<string, number[]>;
  stvDetails?: STVResultat;
  departageInfo: DepartageInfo;
  elusIds: string[];
  secondTourRequis?: boolean;
  candidatsSecondTour?: string[];
}

/** État complet persistant d'un scrutin */
export interface Scrutin {
  id: string;
  config: Config;
  bulletins: Bulletin[];
  debut?: number;
  fin?: number;
  cloture?: boolean;
  tourPrecedentId?: string;
  numeroTour?: number;
  seedTirage?: number;
  tirageEffectue?: boolean;
  vainqueursTirage?: string[];
}
