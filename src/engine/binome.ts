import { BinomeResultat, DepartageInfo, Scrutin, TallyResult } from './types.js';
import { calculateTally } from './tally.js';
import { resolveTie } from './ties.js';

export interface BinomeCalculationOutput {
  tally: TallyResult;
  binomesResultats: BinomeResultat[];
  elusIds: string[]; // binôme IDs
  secondTourRequis: boolean;
  binomesSecondTour?: string[];
  departageInfo: DepartageInfo;
}

export function computeBinomeResults(scrutin: Scrutin): BinomeCalculationOutput {
  const { config, bulletins, seedTirage, tirageEffectue, vainqueursTirage } = scrutin;
  const tally = calculateTally(bulletins, config.inscrits, config.sieges);

  const binomes = config.binomes || [];
  const candMap = new Map(config.candidats.map(c => [c.id, c]));

  // Count votes per binome
  const counts = new Map<string, number>();
  for (const b of binomes) counts.set(b.id, 0);

  for (const bull of bulletins) {
    if (bull.type === 'choix' && bull.cible && counts.has(bull.cible)) {
      counts.set(bull.cible, (counts.get(bull.cible) || 0) + 1);
    }
  }

  // Build raw results
  const items = binomes.map(bin => {
    const voix = counts.get(bin.id) || 0;
    const pct = tally.exprimes > 0 ? Math.round((voix / tally.exprimes) * 1000) / 10 : 0;
    const fCand = candMap.get(bin.fille) || { id: bin.fille, prenom: 'Fille', sexe: 'F' as const };
    const gCand = candMap.get(bin.garcon) || { id: bin.garcon, prenom: 'Garçon', sexe: 'G' as const };

    return {
      id: bin.id,
      binome: bin,
      candidatFille: fCand,
      candidatGarcon: gCand,
      voix,
      pct,
      rangBrut: 0,
      elu: false,
      mentionElu: undefined as string | undefined
    };
  });

  // Sort descending by votes
  items.sort((a, b) => b.voix - a.voix);

  // Assign raw rank
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
  let binomesSecondTour: string[] | undefined = undefined;

  // Un binôme pourvoit 2 sièges (1 fille + 1 garçon)
  if (items.length > 0 && tally.exprimes > 0) {
    const isSingleTour = config.sousMode === 'un_tour';
    const isTour2 = isSingleTour || scrutin.numeroTour === 2;

    if (!isTour2) {
      // 1er tour : majorité absolue requise
      const first = items[0];
      const hasMajority = first.voix >= tally.majoriteAbsolue;

      if (hasMajority) {
        // Vérifier si égalité pour la majorité absolue (ex: 2 binômes à égalité exacte)
        const topTied = items.filter(it => it.voix === first.voix);
        if (topTied.length === 1) {
          first.elu = true;
          first.mentionElu = 'Élu au 1er tour (majorité absolue)';
          elusIds.push(first.id);
        } else {
          // Égalité pour la 1ère place à la majorité absolue
          departageInfo = resolveTie(
            topTied.map(t => t.id),
            1,
            config.departage,
            new Map(config.candidats.map(c => [c.id, c])),
            seedTirage
          );
          if (tirageEffectue && vainqueursTirage && vainqueursTirage.length > 0) {
            const winnerId = vainqueursTirage[0];
            const winner = items.find(it => it.id === winnerId);
            if (winner) {
              winner.elu = true;
              winner.mentionElu = 'Élu au 1er tour (départage)';
              elusIds.push(winner.id);
            }
          } else if (config.departage === 'tour' || !departageInfo.applique) {
            secondTourRequis = true;
            binomesSecondTour = topTied.map(t => t.id);
          } else if (departageInfo.vainqueursTirage) {
            const winnerId = departageInfo.vainqueursTirage[0];
            const winner = items.find(it => it.id === winnerId);
            if (winner) {
              winner.elu = true;
              winner.mentionElu = `Élu au 1er tour (${departageInfo.motif})`;
              elusIds.push(winner.id);
            }
          }
        }
      } else {
        // Pas de majorité absolue au 1er tour -> second tour
        secondTourRequis = true;
        // Les deux premiers binômes qualifiés
        const qualified = items.slice(0, 2).map(it => it.id);
        // Si égalité pour la 2e place (ex: 2e et 3e ex-aequo)
        if (items.length > 2 && items[1].voix === items[2].voix) {
          const tied2nd = items.filter(it => it.voix === items[1].voix).map(it => it.id);
          departageInfo = resolveTie(
            tied2nd,
            1,
            config.departage,
            new Map(config.candidats.map(c => [c.id, c])),
            seedTirage
          );
          binomesSecondTour = [items[0].id, ...(departageInfo.vainqueursTirage || tied2nd)];
        } else {
          binomesSecondTour = qualified;
        }
      }
    } else {
      // 2nd tour : majorité relative
      const topVotes = items[0].voix;
      const topTied = items.filter(it => it.voix === topVotes);

      if (topTied.length === 1) {
        items[0].elu = true;
        items[0].mentionElu = 'Élu au 2nd tour (majorité relative)';
        elusIds.push(items[0].id);
      } else {
        // Égalité au second tour
        departageInfo = resolveTie(
          topTied.map(t => t.id),
          1,
          config.departage,
          new Map(config.candidats.map(c => [c.id, c])),
          seedTirage
        );
        if (tirageEffectue && vainqueursTirage && vainqueursTirage.length > 0) {
          const winner = items.find(it => it.id === vainqueursTirage[0]);
          if (winner) {
            winner.elu = true;
            winner.mentionElu = 'Élu au 2nd tour (départage)';
            elusIds.push(winner.id);
          }
        } else if (departageInfo.applique && departageInfo.vainqueursTirage) {
          const winner = items.find(it => it.id === departageInfo.vainqueursTirage![0]);
          if (winner) {
            winner.elu = true;
            winner.mentionElu = `Élu au 2nd tour (${departageInfo.motif})`;
            elusIds.push(winner.id);
          }
        }
      }
    }
  }

  return {
    tally,
    binomesResultats: items,
    elusIds,
    secondTourRequis,
    binomesSecondTour,
    departageInfo
  };
}
