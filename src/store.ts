import { Audience } from './content/types.js';
import { Bulletin, Config, NewBulletin, ResultatsCalcul, Scrutin } from './engine/types.js';
import { calculateElectionResults } from './engine/index.js';

const STORAGE_KEY_AUDIENCE = 'cme_audience';
const STORAGE_KEY_SCRUTIN = 'cme_scrutin_v1';
const STORAGE_KEY_HISTORY = 'cme_scrutin_history_v1';

export function getDefaultConfig(): Config {
  return {
    mode: 'corrige',
    sousMode: undefined,
    inscrits: 23,
    sieges: 2,
    ecole: 'École Élémentaire Jean Moulin',
    classe: 'CM1-CM2 B',
    commune: 'Saint-Junien',
    dateScrutin: new Date().toISOString().split('T')[0],
    seuilRepechage: 25,
    departage: 'tirage',
    candidats: [
      { id: 'c-1', prenom: 'Léa', sexe: 'F', naissance: '2014-04-12' },
      { id: 'c-2', prenom: 'Hugo', sexe: 'G', naissance: '2014-09-18' },
      { id: 'c-3', prenom: 'Emma', sexe: 'F', naissance: '2014-01-25' },
      { id: 'c-4', prenom: 'Tom', sexe: 'G', naissance: '2014-11-03' },
      { id: 'c-5', prenom: 'Chloé', sexe: 'F', naissance: '2014-07-15' },
      { id: 'c-6', prenom: 'Gaspard', sexe: 'G', naissance: '2014-05-30' }
    ],
    binomes: [
      { id: 'b-1', fille: 'c-1', garcon: 'c-2', nom: 'Léa & Hugo' },
      { id: 'b-2', fille: 'c-3', garcon: 'c-4', nom: 'Emma & Tom' },
      { id: 'b-3', fille: 'c-5', garcon: 'c-6', nom: 'Chloé & Gaspard' }
    ]
  };
}

export function createNewScrutin(config?: Partial<Config>): Scrutin {
  const mergedConfig: Config = {
    ...getDefaultConfig(),
    ...config
  };

  return {
    id: 'scrutin-' + Date.now(),
    config: mergedConfig,
    bulletins: [],
    cloture: false,
    numeroTour: 1
  };
}

export type StoreListener = (scrutin: Scrutin, results: ResultatsCalcul) => void;

class ElectionStore {
  private audience: Audience = 'kids';
  private scrutin: Scrutin;
  private listeners: Set<StoreListener> = new Set();

  constructor() {
    this.audience = this.loadAudience();
    this.scrutin = this.loadScrutin();
  }

  // --- Audience ---
  public getAudience(): Audience {
    return this.audience;
  }

  public setAudience(audience: Audience) {
    this.audience = audience;
    try {
      localStorage.setItem(STORAGE_KEY_AUDIENCE, audience);
    } catch {
      // Ignorer si localStorage non disponible
    }
    this.notify();
  }

  private loadAudience(): Audience {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUDIENCE);
      if (saved === 'adults' || saved === 'kids') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'kids';
  }

  // --- Scrutin ---
  public getScrutin(): Scrutin {
    return this.scrutin;
  }

  public getResults(): ResultatsCalcul {
    return calculateElectionResults(this.scrutin);
  }

  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    // Notifier immédiatement à l'abonnement
    listener(this.scrutin, this.getResults());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const results = this.getResults();
    this.saveScrutin();
    for (const listener of this.listeners) {
      listener(this.scrutin, results);
    }
  }

  private saveScrutin() {
    try {
      localStorage.setItem(STORAGE_KEY_SCRUTIN, JSON.stringify(this.scrutin));
    } catch (e) {
      console.warn('Erreur sauvegarde localStorage:', e);
    }
  }

  private loadScrutin(): Scrutin {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SCRUTIN);
      if (data) {
        const parsed = JSON.parse(data) as Scrutin;
        if (parsed && parsed.config && Array.isArray(parsed.bulletins)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return createNewScrutin();
  }

  // --- Mutations ---
  public updateConfig(newConfig: Partial<Config>) {
    // Si dépouillement en cours et bulletins existants, on ne modifie pas les paramètres structurels
    this.scrutin.config = {
      ...this.scrutin.config,
      ...newConfig
    };
    this.notify();
  }

  public startDepouillement() {
    if (!this.scrutin.debut) {
      this.scrutin.debut = Date.now();
      this.notify();
    }
  }

  public addBulletin(bulletin: NewBulletin) {
    if (this.scrutin.cloture) return;
    if (!this.scrutin.debut) {
      this.scrutin.debut = Date.now();
    }

    // Garde-fou : vérification dépassement des inscrits
    if (this.scrutin.bulletins.length >= this.scrutin.config.inscrits) {
      throw new Error(`Nombre maximal de bulletins atteint (${this.scrutin.config.inscrits} inscrits). Impossible de dépasser le nombre d'inscrits.`);
    }

    const fullBulletin: Bulletin = {
      ...bulletin,
      t: Date.now()
    } as Bulletin;

    this.scrutin.bulletins.push(fullBulletin);
    this.notify();
  }

  public undoLastBulletin(): Bulletin | null {
    if (this.scrutin.cloture) return null;
    if (this.scrutin.bulletins.length === 0) return null;

    const removed = this.scrutin.bulletins.pop() || null;
    this.notify();
    return removed;
  }

  public setBulletinsBatch(bulletins: Bulletin[]) {
    if (this.scrutin.cloture) return;
    if (!this.scrutin.debut) {
      this.scrutin.debut = Date.now();
    }
    this.scrutin.bulletins = [...bulletins];
    this.notify();
  }

  public clotureDepouillement() {
    this.scrutin.fin = Date.now();
    this.scrutin.cloture = true;
    this.notify();
  }

  public rouvrirDepouillement() {
    this.scrutin.cloture = false;
    this.scrutin.fin = undefined;
    this.notify();
  }

  public executeTirageAuSort(seed?: number) {
    const s = seed ?? (Math.floor(Math.random() * 900000) + 100000);
    this.scrutin.seedTirage = s;
    this.scrutin.tirageEffectue = true;
    this.notify();
  }

  public lancerSecondTour(): Scrutin | null {
    const results = this.getResults();
    if (!results.secondTourRequis || !results.candidatsSecondTour) {
      return null;
    }

    // Archiver le 1er tour
    this.archiveCurrentScrutin();

    // Qualifiés
    const qualifiedIds = results.candidatsSecondTour;
    const mode = this.scrutin.config.mode;

    let newCandidats = this.scrutin.config.candidats;
    let newBinomes = this.scrutin.config.binomes;

    if (mode === 'binome') {
      newBinomes = (this.scrutin.config.binomes || []).filter(b => qualifiedIds.includes(b.id));
      const candIds = new Set<string>();
      newBinomes.forEach(b => {
        candIds.add(b.fille);
        candIds.add(b.garcon);
      });
      newCandidats = this.scrutin.config.candidats.filter(c => candIds.has(c.id));
    } else {
      newCandidats = this.scrutin.config.candidats.filter(c => qualifiedIds.includes(c.id));
    }

    const tour2Scrutin: Scrutin = {
      id: 'scrutin-' + Date.now(),
      config: {
        ...this.scrutin.config,
        candidats: newCandidats,
        binomes: newBinomes
      },
      bulletins: [],
      cloture: false,
      tourPrecedentId: this.scrutin.id,
      numeroTour: 2
    };

    this.scrutin = tour2Scrutin;
    this.notify();
    return this.scrutin;
  }

  public resetScrutin(newConfig?: Partial<Config>) {
    this.scrutin = createNewScrutin(newConfig || this.scrutin.config);
    this.notify();
  }

  private archiveCurrentScrutin() {
    try {
      const historyStr = localStorage.getItem(STORAGE_KEY_HISTORY);
      const history: Scrutin[] = historyStr ? JSON.parse(historyStr) : [];
      history.push(this.scrutin);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history.slice(-10))); // max 10
    } catch {
      // ignore
    }
  }

  // --- Import / Export ---
  public exportJSON(): string {
    return JSON.stringify(this.scrutin, null, 2);
  }

  public importJSON(jsonStr: string) {
    try {
      const parsed = JSON.parse(jsonStr) as Scrutin;
      if (!parsed || !parsed.config || !Array.isArray(parsed.bulletins)) {
        throw new Error('Format de fichier JSON invalide pour une élection CME.');
      }
      this.scrutin = parsed;
      this.notify();
    } catch (err: any) {
      throw new Error('Erreur de lecture du fichier : ' + err.message);
    }
  }

  public exportCSV(): string {
    const results = this.getResults();
    const config = this.scrutin.config;
    const lines: string[] = [];

    lines.push(`"Élections CME - Procès-Verbal et Résultats"`);
    lines.push(`"Date";"${config.dateScrutin || ''}"`);
    lines.push(`"École";"${config.ecole || ''}"`);
    lines.push(`"Classe";"${config.classe || ''}"`);
    lines.push(`"Commune";"${config.commune || ''}"`);
    lines.push(`"Mode de scrutin";"${config.mode}"`);
    lines.push(`"Tour";"${this.scrutin.numeroTour || 1}"`);
    lines.push('');
    lines.push(`"Inscrits";${results.tally.inscrits}`);
    lines.push(`"Votants";${results.tally.votants}`);
    lines.push(`"Exprimés";${results.tally.exprimes}`);
    lines.push(`"Blancs";${results.tally.blancs}`);
    lines.push(`"Nuls";${results.tally.nuls}`);
    lines.push(`"Taux de participation (%)";${results.tally.participationPct}`);
    lines.push('');

    if (config.mode === 'binome' && results.binomesResultats) {
      lines.push(`"Rang";"Binôme";"Fille";"Garçon";"Voix";"% Exprimés";"Élu"`);
      for (const b of results.binomesResultats) {
        lines.push(`${b.rangBrut};"${b.binome.nom || b.id}";"${b.candidatFille.prenom}";"${b.candidatGarcon.prenom}";${b.voix};${b.pct}%;"${b.elu ? 'OUI (' + (b.mentionElu || '') + ')' : 'NON'}"`);
      }
    } else if (results.candidatsResultats) {
      lines.push(`"Rang";"Candidat(e)";"Sexe";"Voix/Points";"% Exprimés";"Élu"`);
      for (const c of results.candidatsResultats) {
        const score = c.points !== undefined ? `${c.points} pts (${c.voix} rangs 1)` : `${c.voix}`;
        lines.push(`${c.rangBrut};"${c.candidat.prenom}";"${c.candidat.sexe}";${score};${c.pct}%;"${c.elu ? 'OUI (' + (c.mentionElu || '') + ')' : 'NON'}"`);
      }
    }

    return lines.join('\r\n');
  }
}

export const store = new ElectionStore();
