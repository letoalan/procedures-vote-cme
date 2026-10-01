/**
 * @module app/store
 * Rôle : gestionnaire réactif de l'état global de l'application et abonnements.
 * Dépend de : core/types, content/types, engine, app/persistence, app/actions, app/exports.
 */

import { Audience } from '../content/types.js';
import { Bulletin, Config, NewBulletin, ResultatsCalcul, Scrutin } from '../core/types.js';
import { calculateElectionResults } from '../engine/index.js';
import {
  archiveScrutinToStorage,
  createNewScrutin,
  loadAudienceFromStorage,
  loadScrutinFromStorage,
  saveAudienceToStorage,
  saveScrutinToStorage
} from './persistence.js';
import {
  addBulletinAction,
  clotureDepouillementAction,
  executeTirageAction,
  prepareSecondTourAction,
  rouvrirDepouillementAction,
  startDepouillementAction,
  undoLastBulletinAction,
  updateConfigAction
} from './actions.js';
import { exportResultsCSV, exportScrutinJSON, importScrutinJSON } from './exports.js';

export type StoreListener = (scrutin: Scrutin, results: ResultatsCalcul) => void;

export class ElectionStore {
  private audience: Audience;
  private scrutin: Scrutin;
  private listeners: Set<StoreListener> = new Set();

  constructor() {
    this.audience = loadAudienceFromStorage();
    this.scrutin = loadScrutinFromStorage() || createNewScrutin();
  }

  public getAudience(): Audience { return this.audience; }
  public setAudience(audience: Audience): void {
    this.audience = audience;
    saveAudienceToStorage(audience);
    this.notify();
  }

  public getScrutin(): Scrutin { return this.scrutin; }
  public getResults(): ResultatsCalcul { return calculateElectionResults(this.scrutin); }

  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    listener(this.scrutin, this.getResults());
    return () => { this.listeners.delete(listener); };
  }

  private notify(): void {
    const results = this.getResults();
    saveScrutinToStorage(this.scrutin);
    for (const l of this.listeners) l(this.scrutin, results);
  }

  public updateConfig(newConfig: Partial<Config>): void {
    this.scrutin = updateConfigAction(this.scrutin, newConfig);
    this.notify();
  }

  public startDepouillement(): void {
    this.scrutin = startDepouillementAction(this.scrutin);
    this.notify();
  }

  public addBulletin(bulletin: NewBulletin): void {
    this.scrutin = addBulletinAction(this.scrutin, bulletin);
    this.notify();
  }

  public undoLastBulletin(): Bulletin | null {
    const { nextScrutin, removed } = undoLastBulletinAction(this.scrutin);
    this.scrutin = nextScrutin;
    this.notify();
    return removed;
  }

  public setBulletinsBatch(bulletins: Bulletin[]): void {
    if (this.scrutin.cloture) return;
    this.scrutin = { ...this.scrutin, debut: this.scrutin.debut || Date.now(), bulletins: [...bulletins] };
    this.notify();
  }

  public clotureDepouillement(): void {
    this.scrutin = clotureDepouillementAction(this.scrutin);
    this.notify();
  }

  public rouvrirDepouillement(): void {
    this.scrutin = rouvrirDepouillementAction(this.scrutin);
    this.notify();
  }

  public executeTirageAuSort(seed?: number): void {
    this.scrutin = executeTirageAction(this.scrutin, seed);
    this.notify();
  }

  public lancerSecondTour(): Scrutin | null {
    const results = this.getResults();
    const nextScrutin = prepareSecondTourAction(this.scrutin, results);
    if (!nextScrutin) return null;

    archiveScrutinToStorage(this.scrutin);
    this.scrutin = nextScrutin;
    this.notify();
    return this.scrutin;
  }

  public resetScrutin(newConfig?: Partial<Config>): void {
    this.scrutin = createNewScrutin(newConfig || this.scrutin.config);
    this.notify();
  }

  public exportJSON(): string { return exportScrutinJSON(this.scrutin); }
  public importJSON(jsonStr: string): void {
    this.scrutin = importScrutinJSON(jsonStr);
    this.notify();
  }
  public exportCSV(): string { return exportResultsCSV(this.scrutin, this.getResults()); }
}

export const store = new ElectionStore();
