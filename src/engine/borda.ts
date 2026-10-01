import { CandidatResultat, DepartageInfo, Scrutin, TallyResult } from './types.js';
import { calculateTally } from './tally.js';
import { resolveTie } from './ties.js';

export interface BordaCalculationOutput {
  tally: TallyResult;
  candidatsResultats: CandidatResultat[];
  matriceRangs: Record<string, number[]>; // candidatId -> [nb 1ers, nb 2es, nb 3es, nb 4es, nb 5es]
  baremeUtilise: number[];
  elusIds: string[];
  departageInfo: DepartageInfo;
}

/**
 * Standard Borda count engine with top 5 preferred candidates rule:
 * 1st preference -> 5 points
 * 2nd preference -> 4 points
 * 3rd preference -> 3 points
 * 4th preference -> 2 points
 * 5th preference -> 1 point
 * Unranked candidates -> 0 points
 */
export function computeBordaResults(scrutin: Scrutin): BordaCalculationOutput {
  const { config, bulletins, seedTirage, tirageEffectue, vainqueursTirage } = scrutin;
  const sieges = config.sieges || 2;
  const tally = calculateTally(bulletins, config.inscrits, sieges);

  // Barème par défaut pour les 5 candidats préférés : [5, 4, 3, 2, 1]
  const defaultBareme = [5, 4, 3, 2, 1];
  const bareme = (config.bareme && config.bareme.length > 0) ? config.bareme : defaultBareme;
  const nbRangsComptes = bareme.length; // 5 par défaut

  const candMap = new Map(config.candidats.map(c => [c.id, c]));
  const pointsMap = new Map<string, number>();
  const firstPrefsMap = new Map<string, number>();
  const matriceRangs: Record<string, number[]> = {};

  for (const c of config.candidats) {
    pointsMap.set(c.id, 0);
    firstPrefsMap.set(c.id, 0);
    matriceRangs[c.id] = new Array(nbRangsComptes).fill(0);
  }

  for (const bull of bulletins) {
    if (bull.type === 'rang' && bull.ordre && bull.ordre.length > 0) {
      // Un électeur vote pour jusqu'à 5 candidats par ordre de préférence
      const ordreTronque = bull.ordre.slice(0, nbRangsComptes);

      ordreTronque.forEach((candId, idx) => {
        if (candMap.has(candId)) {
          // Points attribués selon le barème (ex: idx 0 -> 5 pts, idx 1 -> 4 pts...)
          const pts = idx < bareme.length ? bareme[idx] : 0;
          pointsMap.set(candId, (pointsMap.get(candId) || 0) + pts);

          // Enregistrement dans la matrice des rangs
          if (idx < nbRangsComptes) {
            matriceRangs[candId][idx] = (matriceRangs[candId][idx] || 0) + 1;
          }

          // 1ère préférence
          if (idx === 0) {
            firstPrefsMap.set(candId, (firstPrefsMap.get(candId) || 0) + 1);
          }
        }
      });
    }
  }

  const totalPoints = Array.from(pointsMap.values()).reduce((sum, p) => sum + p, 0);

  const items: CandidatResultat[] = config.candidats.map(c => {
    const pts = pointsMap.get(c.id) || 0;
    const firstPrefs = firstPrefsMap.get(c.id) || 0;
    const pct = totalPoints > 0 ? Math.round((pts / totalPoints) * 1000) / 10 : 0;

    return {
      id: c.id,
      candidat: c,
      voix: firstPrefs, // 1ères préférences (rang 1 à 5 pts)
      points: pts,      // Total des points Borda
      pct,
      rangBrut: 0,
      elu: false
    };
  });

  // Tri décroissant par points, puis par rang 1 (5 pts), puis rang 2 (4 pts)...
  items.sort((a, b) => {
    const diffPts = (b.points || 0) - (a.points || 0);
    if (diffPts !== 0) return diffPts;

    // Départage naturel par les rangs de la matrice
    const ranksA = matriceRangs[a.id];
    const ranksB = matriceRangs[b.id];
    for (let i = 0; i < nbRangsComptes; i++) {
      const diffRank = (ranksB[i] || 0) - (ranksA[i] || 0);
      if (diffRank !== 0) return diffRank;
    }

    return 0;
  });

  let currentRank = 1;
  for (let i = 0; i < items.length; i++) {
    if (i > 0 && (items[i].points || 0) < (items[i - 1].points || 0)) {
      currentRank = i + 1;
    }
    items[i].rangBrut = currentRank;
  }

  let departageInfo: DepartageInfo = {
    besoinDepartage: false,
    methode: config.departage,
    applique: false
  };

  const elusIds: string[] = [];

  if (items.length > 0 && tally.exprimes > 0) {
    if (items.length <= sieges) {
      for (const c of items) {
        c.elu = true;
        c.mentionElu = 'Élu(e) au classement Borda';
        elusIds.push(c.id);
      }
    } else {
      const cutoffPoints = items[sieges - 1].points || 0;
      const strictlyAbove = items.filter(it => (it.points || 0) > cutoffPoints);
      const tiedAtCutoff = items.filter(it => (it.points || 0) === cutoffPoints);

      for (const c of strictlyAbove) {
        c.elu = true;
        c.mentionElu = 'Élu(e) au classement Borda';
        elusIds.push(c.id);
      }

      const remainingSeats = sieges - strictlyAbove.length;
      if (tiedAtCutoff.length === remainingSeats) {
        for (const c of tiedAtCutoff) {
          c.elu = true;
          c.mentionElu = 'Élu(e) au classement Borda';
          elusIds.push(c.id);
        }
      } else {
        departageInfo = resolveTie(
          tiedAtCutoff.map(c => c.id),
          remainingSeats,
          config.departage,
          candMap,
          seedTirage
        );
        const winners = (tirageEffectue && vainqueursTirage) ? vainqueursTirage : departageInfo.vainqueursTirage;
        if (winners) {
          for (const wId of winners) {
            const c = items.find(it => it.id === wId);
            if (c) {
              c.elu = true;
              c.mentionElu = `Élu(e) au classement Borda (${departageInfo.motif || 'départage'})`;
              elusIds.push(c.id);
            }
          }
        }
      }
    }
  }

  return {
    tally,
    candidatsResultats: items,
    matriceRangs,
    baremeUtilise: bareme,
    elusIds,
    departageInfo
  };
}
