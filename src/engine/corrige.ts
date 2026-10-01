import { CandidatResultat, DepartageInfo, Scrutin, TallyResult } from './types.js';
import { calculateTally } from './tally.js';
import { resolveTie } from './ties.js';

export interface CorrigeCalculationOutput {
  tally: TallyResult;
  classementBrut: CandidatResultat[];
  classementCorrige: CandidatResultat[];
  explicationCorrection: string;
  seuilPct: number | null;
  elusIds: string[];
  departageInfo: DepartageInfo;
}

export function computeCorrigeResults(scrutin: Scrutin): CorrigeCalculationOutput {
  const { config, bulletins, seedTirage, tirageEffectue, vainqueursTirage } = scrutin;
  const tally = calculateTally(bulletins, config.inscrits, 2);
  const seuilPct = config.seuilRepechage !== undefined ? config.seuilRepechage : 25; // 25% par défaut

  const candMap = new Map(config.candidats.map(c => [c.id, c]));
  const counts = new Map<string, number>();
  for (const c of config.candidats) counts.set(c.id, 0);

  for (const bull of bulletins) {
    if (bull.type === 'choix' && bull.cible && counts.has(bull.cible)) {
      counts.set(bull.cible, (counts.get(bull.cible) || 0) + 1);
    }
  }

  // Raw list
  const rawItems: CandidatResultat[] = config.candidats.map(c => {
    const voix = counts.get(c.id) || 0;
    const pct = tally.exprimes > 0 ? Math.round((voix / tally.exprimes) * 1000) / 10 : 0;
    const seuilAtteint = seuilPct === null || pct >= seuilPct;

    return {
      id: c.id,
      candidat: c,
      voix,
      pct,
      rangBrut: 0,
      elu: false,
      seuilAtteint
    };
  });

  rawItems.sort((a, b) => b.voix - a.voix);

  let currentRank = 1;
  for (let i = 0; i < rawItems.length; i++) {
    if (i > 0 && rawItems[i].voix < rawItems[i - 1].voix) {
      currentRank = i + 1;
    }
    rawItems[i].rangBrut = currentRank;
  }

  let departageInfo: DepartageInfo = {
    besoinDepartage: false,
    methode: config.departage,
    applique: false
  };

  const elusIds: string[] = [];
  let explicationCorrection = '';

  // Deep copy for corrected ranking
  const correctedItems: CandidatResultat[] = rawItems.map(it => ({ ...it }));

  if (rawItems.length === 0 || tally.exprimes === 0) {
    explicationCorrection = 'Aucun bulletin exprimé pour le moment.';
    return {
      tally,
      classementBrut: rawItems,
      classementCorrige: correctedItems,
      explicationCorrection,
      seuilPct,
      elusIds,
      departageInfo
    };
  }

  // 1er siège : le 1er du classement brut
  // Gestion d'égalité pour la 1ère place
  const topVotes = rawItems[0].voix;
  const topTied = rawItems.filter(it => it.voix === topVotes);

  let firstId = rawItems[0].id;
  if (topTied.length > 1) {
    departageInfo = resolveTie(
      topTied.map(c => c.id),
      1,
      config.departage,
      candMap,
      seedTirage
    );
    const winnerId = (tirageEffectue && vainqueursTirage && vainqueursTirage.length > 0)
      ? vainqueursTirage[0]
      : (departageInfo.vainqueursTirage ? departageInfo.vainqueursTirage[0] : topTied[0].id);
    firstId = winnerId;
  }

  const firstCand = candMap.get(firstId)!;
  elusIds.push(firstId);

  // Mark first in raw and corrected
  const firstRaw = rawItems.find(it => it.id === firstId)!;
  firstRaw.elu = true;
  firstRaw.mentionElu = 'Élu(e) (1er rang)';

  const firstCorr = correctedItems.find(it => it.id === firstId)!;
  firstCorr.elu = true;
  firstCorr.mentionElu = 'Élu(e) (1er rang)';

  // Si un seul candidat au total
  if (rawItems.length === 1) {
    explicationCorrection = 'Un seul candidat en lice.';
    return {
      tally,
      classementBrut: rawItems,
      classementCorrige: correctedItems,
      explicationCorrection,
      seuilPct,
      elusIds,
      departageInfo
    };
  }

  // Candidats restants classés
  const remainingRaw = rawItems.filter(it => it.id !== firstId);
  const secondRaw = remainingRaw[0];

  const firstSexe = firstCand.sexe;
  const otherSexe = firstSexe === 'F' ? 'G' : 'F';
  const otherSexeLabel = otherSexe === 'F' ? 'fille' : 'garçon';
  const firstSexePluriel = firstSexe === 'F' ? 'filles' : 'garçons';

  // Cas 1 : Le 2e brut est déjà du sexe opposé -> Parité naturelle
  if (secondRaw.candidat.sexe === otherSexe) {
    secondRaw.elu = true;
    secondRaw.mentionElu = 'Élu(e) (parité naturelle)';
    elusIds.push(secondRaw.id);

    const secondCorr = correctedItems.find(it => it.id === secondRaw.id)!;
    secondCorr.elu = true;
    secondCorr.mentionElu = 'Élu(e) (parité naturelle)';

    explicationCorrection = `La parité naturelle est respectée : le 1er (${firstCand.prenom}, ${firstSexe === 'F' ? 'fille' : 'garçon'}) et le 2e (${secondRaw.candidat.prenom}, ${otherSexeLabel}) sont de sexes différents. Aucune correction n'est requise.`;
  } else {
    // Cas 2 : Le 1er et le 2e sont du même sexe
    // Recherche du meilleur candidat du sexe opposé
    const otherSexeCandidates = remainingRaw.filter(it => it.candidat.sexe === otherSexe);

    if (otherSexeCandidates.length === 0) {
      // Aucun candidat de l'autre sexe
      secondRaw.elu = true;
      secondRaw.mentionElu = 'Élu(e) (aucun candidat du sexe opposé)';
      elusIds.push(secondRaw.id);

      const secondCorr = correctedItems.find(it => it.id === secondRaw.id)!;
      secondCorr.elu = true;
      secondCorr.mentionElu = 'Élu(e) (aucun candidat du sexe opposé)';

      explicationCorrection = `Les deux premiers sont deux ${firstSexePluriel}, mais aucune candidature du sexe opposé n'était déposée. Le 2e brut (${secondRaw.candidat.prenom}) est donc élu.`;
    } else {
      // Vérification du seuil
      const bestOther = otherSexeCandidates[0];
      const thresholdReached = (seuilPct === null) || (bestOther.pct >= seuilPct);

      if (thresholdReached) {
        // Correction paritaire appliquée ! bestOther prend le 2e siège
        bestOther.elu = true;
        bestOther.mentionElu = 'Élu(e) (correction paritaire)';
        elusIds.push(bestOther.id);

        // Réorganisation du classement corrigé :
        // 1er : firstCand
        // 2e : bestOther (promu)
        // puis les autres dans l'ordre de leurs voix
        const newCorrectedList: CandidatResultat[] = [];
        newCorrectedList.push({
          ...firstCorr,
          rangBrut: 1
        });

        const promotedItem: CandidatResultat = {
          ...correctedItems.find(it => it.id === bestOther.id)!,
          elu: true,
          mentionElu: 'Élu(e) (correction paritaire)',
          rangBrut: 2
        };
        newCorrectedList.push(promotedItem);

        let nextRank = 3;
        for (const item of rawItems) {
          if (item.id !== firstId && item.id !== bestOther.id) {
            newCorrectedList.push({
              ...item,
              elu: false,
              mentionElu: undefined,
              rangBrut: nextRank++
            });
          }
        }

        // Remplacer correctedItems
        correctedItems.length = 0;
        correctedItems.push(...newCorrectedList);

        const seuilTxt = seuilPct !== null ? `le seuil de ${seuilPct}%` : 'la règle';
        explicationCorrection = `Les deux premiers bruts étaient deux ${firstSexePluriel} (${firstCand.prenom} et ${secondRaw.candidat.prenom}). La correction paritaire s'applique : ${bestOther.candidat.prenom} (${bestOther.voix} voix, ${bestOther.pct}%) franchit ${seuilTxt} et est élue/élu au 2nd siège pour garantir la parité (1 fille et 1 garçon).`;
      } else {
        // Seuil NON atteint : la correction échoue et le 2e brut est élu
        secondRaw.elu = true;
        secondRaw.mentionElu = 'Élu(e) (seuil de repêchage non atteint)';
        elusIds.push(secondRaw.id);

        const secondCorr = correctedItems.find(it => it.id === secondRaw.id)!;
        secondCorr.elu = true;
        secondCorr.mentionElu = 'Élu(e) (seuil de repêchage non atteint)';

        const bestPct = bestOther.pct;
        explicationCorrection = `Les deux premiers bruts sont deux ${firstSexePluriel}. La meilleure candidature du sexe opposé (${bestOther.candidat.prenom}) n'obtient que ${bestPct}%, ce qui est inférieur au seuil de repêchage requis de ${seuilPct}%. Le 2e du classement brut (${secondRaw.candidat.prenom}) est donc élu.`;
      }
    }
  }

  return {
    tally,
    classementBrut: rawItems,
    classementCorrige: correctedItems,
    explicationCorrection,
    seuilPct,
    elusIds,
    departageInfo
  };
}
