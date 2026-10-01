export type Sexe = 'F' | 'G';
export type Mode = 'binome' | 'uninominal' | 'classement' | 'corrige';
export type SousModeBinome = 'deux_tours' | 'un_tour';
export type SousModeUninominal = 'A' | 'B';
export type SousModeClassement = 'borda' | 'stv';
export type Departage = 'tour' | 'tirage' | 'age';

export interface Candidat {
  id: string;
  prenom: string;
  nom?: string;
  sexe: Sexe;
  naissance?: string; // YYYY-MM-DD optionnel pour critère de l'âge (plus jeune élu)
}

export interface Binome {
  id: string;
  fille: string;    // id candidat fille
  garcon: string;   // id candidat garçon
  nom?: string;     // Ex: "Léa MARTIN & Hugo DUPONT"
}

export interface Config {
  mode: Mode;
  sousMode?: SousModeBinome | SousModeUninominal | SousModeClassement;
  inscrits: number;
  sieges: number;
  candidats: Candidat[];
  binomes?: Binome[];
  bareme?: number[];
  seuilRepechage?: number | null; // en % des exprimés, défaut 25
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

export type Bulletin = NewBulletin & { t: number };

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

export interface CandidatResultat {
  id: string;
  candidat: Candidat;
  voix: number;
  points?: number; // Pour Borda
  pct: number;     // % des exprimés
  rangBrut: number;
  elu: boolean;
  mentionElu?: string; // ex: "Élu(e) au 1er tour (majorité absolue)", "Élu(e) (parité corrigée)"
  seuilAtteint?: boolean;
}

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

export interface DepartageInfo {
  besoinDepartage: boolean;
  motif?: string;
  candidatsExAequo?: string[]; // IDs
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

export interface ResultatsCalcul {
  tally: TallyResult;
  mode: Mode;
  sousMode?: string;
  sieges: number;
  candidatsResultats?: CandidatResultat[];
  binomesResultats?: BinomeResultat[];
  // Mode corrigé :
  classementBrut?: CandidatResultat[];
  classementCorrige?: CandidatResultat[];
  explicationCorrection?: string;
  // Mode classement Borda / STV :
  matriceRangs?: Record<string, number[]>; // candidatId -> [nb de fois 1er, 2e, 3e, etc.]
  stvDetails?: STVResultat;
  // Départage :
  departageInfo: DepartageInfo;
  elusIds: string[]; // Candidats ou binômes élus
  secondTourRequis?: boolean;
  candidatsSecondTour?: string[];
}

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
