/**
 * @module app/persistence
 * Rôle : persistance locale du scrutin et de l'audience dans localStorage.
 * Dépend de : core/types, content/types.
 */

import { Audience } from '../content/types.js';
import { Config, Scrutin } from '../core/types.js';

export const STORAGE_KEY_AUDIENCE = 'cme_audience';
export const STORAGE_KEY_SCRUTIN = 'cme_scrutin_v1';
export const STORAGE_KEY_HISTORY = 'cme_scrutin_history_v1';

export function getDefaultConfig(): Config {
  return {
    mode: 'corrige',
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
  return {
    id: 'scrutin-' + Date.now(),
    config: { ...getDefaultConfig(), ...config },
    bulletins: [],
    cloture: false,
    numeroTour: 1
  };
}

export function saveScrutinToStorage(scrutin: Scrutin): void {
  try {
    localStorage.setItem(STORAGE_KEY_SCRUTIN, JSON.stringify(scrutin));
  } catch (e) {
    console.warn('Erreur sauvegarde localStorage:', e);
  }
}

export function loadScrutinFromStorage(): Scrutin | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SCRUTIN);
    if (data) {
      const parsed = JSON.parse(data) as Scrutin;
      if (parsed && parsed.config && Array.isArray(parsed.bulletins)) return parsed;
    }
  } catch { /* ignore */ }
  return null;
}

export function saveAudienceToStorage(audience: Audience): void {
  try { localStorage.setItem(STORAGE_KEY_AUDIENCE, audience); } catch { /* ignore */ }
}

export function loadAudienceFromStorage(): Audience {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_AUDIENCE);
    if (saved === 'adults' || saved === 'kids') return saved;
  } catch { /* ignore */ }
  return 'kids';
}

export function archiveScrutinToStorage(scrutin: Scrutin): void {
  try {
    const str = localStorage.getItem(STORAGE_KEY_HISTORY);
    const history: Scrutin[] = str ? JSON.parse(str) : [];
    history.push(scrutin);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history.slice(-10)));
  } catch { /* ignore */ }
}
