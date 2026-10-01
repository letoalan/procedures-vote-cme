/**
 * @module app/actions
 * Rôle : fonctions pures de transition d'état d'un scrutin.
 * Dépend de : core/types.
 */

import { Bulletin, Config, NewBulletin, ResultatsCalcul, Scrutin } from '../core/types.js';

export function startDepouillementAction(scrutin: Scrutin): Scrutin {
  if (scrutin.debut) return scrutin;
  return { ...scrutin, debut: Date.now() };
}

export function addBulletinAction(scrutin: Scrutin, bulletin: NewBulletin): Scrutin {
  if (scrutin.cloture) return scrutin;
  if (scrutin.bulletins.length >= scrutin.config.inscrits) {
    throw new Error(`Nombre maximal de bulletins atteint (${scrutin.config.inscrits} inscrits). Impossible de dépasser le nombre d'inscrits.`);
  }

  const fullBulletin: Bulletin = { ...bulletin, t: Date.now() } as Bulletin;
  return {
    ...scrutin,
    debut: scrutin.debut || Date.now(),
    bulletins: [...scrutin.bulletins, fullBulletin]
  };
}

export function undoLastBulletinAction(scrutin: Scrutin): { nextScrutin: Scrutin; removed: Bulletin | null } {
  if (scrutin.cloture || scrutin.bulletins.length === 0) {
    return { nextScrutin: scrutin, removed: null };
  }
  const newBulletins = [...scrutin.bulletins];
  const removed = newBulletins.pop() || null;
  return {
    nextScrutin: { ...scrutin, bulletins: newBulletins },
    removed
  };
}

export function clotureDepouillementAction(scrutin: Scrutin): Scrutin {
  return { ...scrutin, fin: Date.now(), cloture: true };
}

export function rouvrirDepouillementAction(scrutin: Scrutin): Scrutin {
  return { ...scrutin, fin: undefined, cloture: false };
}

export function executeTirageAction(scrutin: Scrutin, seed?: number): Scrutin {
  const s = seed ?? (Math.floor(Math.random() * 900000) + 100000);
  return { ...scrutin, seedTirage: s, tirageEffectue: true };
}

export function prepareSecondTourAction(scrutin: Scrutin, results: ResultatsCalcul): Scrutin | null {
  if (!results.secondTourRequis || !results.candidatsSecondTour) return null;

  const qualifiedIds = results.candidatsSecondTour;
  const mode = scrutin.config.mode;
  let newCandidats;
  let newBinomes = scrutin.config.binomes;

  if (mode === 'binome') {
    newBinomes = (scrutin.config.binomes || []).filter(b => qualifiedIds.includes(b.id));
    const candIds = new Set<string>();
    newBinomes.forEach(b => { candIds.add(b.fille); candIds.add(b.garcon); });
    newCandidats = scrutin.config.candidats.filter(c => candIds.has(c.id));
  } else {
    newCandidats = scrutin.config.candidats.filter(c => qualifiedIds.includes(c.id));
  }

  return {
    id: 'scrutin-' + Date.now(),
    config: { ...scrutin.config, candidats: newCandidats, binomes: newBinomes },
    bulletins: [],
    cloture: false,
    tourPrecedentId: scrutin.id,
    numeroTour: 2
  };
}

export function updateConfigAction(scrutin: Scrutin, newConfig: Partial<Config>): Scrutin {
  return { ...scrutin, config: { ...scrutin.config, ...newConfig } };
}
