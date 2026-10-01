import { CandidatResultat, DepartageInfo, Scrutin, TallyResult } from './types.js';
import { calculateTally } from './tally.js';
import { resolveTie } from './ties.js';

export interface UninominalCalculationOutput {
  tally: TallyResult;
  candidatsResultats: CandidatResultat[];
  elusIds: string[];
  secondTourRequis: boolean;
  candidatsSecondTour?: string[];
  departageInfo: DepartageInfo;
}

export function computeUninominalResults(scrutin: Scrutin): UninominalCalculationOutput {
  const { config, bulletins, seedTirage, tirageEffectue, vainqueursTirage } = scrutin;
  const sieges = config.sieges || 2;
  const tally = calculateTally(bulletins, config.inscrits, sieges);
  const sousMode = config.sousMode || 'B'; // 'A' (majoritaire) ou 'B' (deux premiers élus)

  const candMap = new Map(config.candidats.map(c => [c.id, c]));
  const counts = new Map<string, number>();
  for (const c of config.candidats) counts.set(c.id, 0);

  for (const bull of bulletins) {
    if (bull.type === 'choix' && bull.cible && counts.has(bull.cible)) {
      counts.set(bull.cible, (counts.get(bull.cible) || 0) + 1);
    }
  }

  const items: CandidatResultat[] = config.candidats.map(c => {
    const voix = counts.get(c.id) || 0;
    const pct = tally.exprimes > 0 ? Math.round((voix / tally.exprimes) * 1000) / 10 : 0;
    return {
      id: c.id,
      candidat: c,
      voix,
      pct,
      rangBrut: 0,
      elu: false,
      seuilAtteint: false
    };
  });

  items.sort((a, b) => b.voix - a.voix);

  let currentRank = 1;
  for (let i = 0; i < items.length; i++) {
    if (i > 0 && items[i].voix < items[i - 1].voix) {
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
  let secondTourRequis = false;
  let candidatsSecondTour: string[] | undefined = undefined;

  if (items.length > 0 && tally.exprimes > 0) {
    if (sousMode === 'A' && scrutin.numeroTour !== 2) {
      // Sous-mode A : Scrutin majoritaire à 2 tours
      // Au 1er tour, élection à la majorité absolue
      const elusMajorite = items.filter(it => it.voix >= tally.majoriteAbsolue);

      if (elusMajorite.length >= sieges) {
        // Assez d'élus à la majorité absolue
        // Vérifier s'il y a égalité sur le dernier siège
        const cutoffVotes = elusMajorite[sieges - 1].voix;
        const tiedAtCutoff = elusMajorite.filter(it => it.voix === cutoffVotes);
        const strictlyAbove = elusMajorite.filter(it => it.voix > cutoffVotes);

        for (const c of strictlyAbove) {
          c.elu = true;
          c.mentionElu = 'Élu(e) au 1er tour (majorité absolue)';
          elusIds.push(c.id);
        }

        const remainingSeats = sieges - strictlyAbove.length;
        if (tiedAtCutoff.length === remainingSeats) {
          for (const c of tiedAtCutoff) {
            c.elu = true;
            c.mentionElu = 'Élu(e) au 1er tour (majorité absolue)';
            elusIds.push(c.id);
          }
        } else {
          // Égalité parmi ceux à la majorité absolue
          departageInfo = resolveTie(
            tiedAtCutoff.map(c => c.id),
            remainingSeats,
            config.departage,
            candMap,
            seedTirage
          );
          applyResolvedTie(departageInfo, items, elusIds, 'au 1er tour', tirageEffectue, vainqueursTirage);
        }
      } else {
        // Moins de `sieges` élus à la majorité absolue
        for (const c of elusMajorite) {
          c.elu = true;
          c.mentionElu = 'Élu(e) au 1er tour (majorité absolue)';
          elusIds.push(c.id);
        }
        secondTourRequis = true;
        const remainingSeats = sieges - elusMajorite.length;
        const nonElus = items.filter(it => !it.elu);
        // Qualifiés pour le 2nd tour : au moins les 2 ou 3 premiers par siège restant
        const nbQualifies = Math.min(nonElus.length, remainingSeats * 2);
        candidatsSecondTour = nonElus.slice(0, nbQualifies).map(c => c.id);
      }
    } else {
      // Sous-mode B (Deux premiers élus / majorité relative) ou second tour de A
      // Les `sieges` premiers sont élus
      if (items.length <= sieges) {
        for (const c of items) {
          if (c.voix > 0) {
            c.elu = true;
            c.mentionElu = 'Élu(e)';
            elusIds.push(c.id);
          }
        }
      } else {
        const cutoffVotes = items[sieges - 1].voix;
        const strictlyAbove = items.filter(it => it.voix > cutoffVotes);
        const tiedAtCutoff = items.filter(it => it.voix === cutoffVotes);

        for (const c of strictlyAbove) {
          c.elu = true;
          c.mentionElu = 'Élu(e)';
          elusIds.push(c.id);
        }

        const remainingSeats = sieges - strictlyAbove.length;
        if (tiedAtCutoff.length === remainingSeats) {
          for (const c of tiedAtCutoff) {
            c.elu = true;
            c.mentionElu = 'Élu(e)';
            elusIds.push(c.id);
          }
        } else {
          // Égalité sur la frontière des sièges
          departageInfo = resolveTie(
            tiedAtCutoff.map(c => c.id),
            remainingSeats,
            config.departage,
            candMap,
            seedTirage
          );
          if (config.departage === 'tour' && !tirageEffectue) {
            secondTourRequis = true;
            candidatsSecondTour = tiedAtCutoff.map(c => c.id);
          } else {
            applyResolvedTie(departageInfo, items, elusIds, '', tirageEffectue, vainqueursTirage);
          }
        }
      }
    }
  }

  return {
    tally,
    candidatsResultats: items,
    elusIds,
    secondTourRequis,
    candidatsSecondTour,
    departageInfo
  };
}

function applyResolvedTie(
  dep: DepartageInfo,
  items: CandidatResultat[],
  elusIds: string[],
  contextSuffix: string,
  tirageEffectue?: boolean,
  vainqueursTirage?: string[]
) {
  const winners = (tirageEffectue && vainqueursTirage) ? vainqueursTirage : dep.vainqueursTirage;
  if (winners) {
    for (const wId of winners) {
      const c = items.find(it => it.id === wId);
      if (c) {
        c.elu = true;
        c.mentionElu = `Élu(e) ${contextSuffix} (${dep.motif || 'départage'})`.trim();
        elusIds.push(c.id);
      }
    }
  }
}
