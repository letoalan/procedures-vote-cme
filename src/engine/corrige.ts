/**
 * @module engine/corrige
 * Rôle : règle du vote unique avec classement corrigé (parité au 2e siège).
 * Dépend de : core/types, engine/thresholds, engine/tally, engine/ties.
 */

import { Candidat, CandidatResultat, DepartageInfo, Scrutin, TallyResult } from '../core/types.js';
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

/**
 * Calcule le classement corrigé et applique la parité pour le 2e siège.
 * @param scrutin Objet scrutin complet
 * @returns Résultats bruts, corrigés et explications
 */
export function computeCorrigeResults(scrutin: Scrutin): CorrigeCalculationOutput {
  const { config, bulletins, seedTirage, tirageEffectue, vainqueursTirage } = scrutin;
  const tally = calculateTally(bulletins, config.inscrits, 2);
  const seuilPct = config.seuilRepechage !== undefined ? config.seuilRepechage : 25;

  const candMap = new Map(config.candidats.map(c => [c.id, c]));
  const counts = new Map<string, number>();
  for (const c of config.candidats) counts.set(c.id, 0);
  for (const b of bulletins) {
    if (b.type === 'choix' && b.cible && counts.has(b.cible)) {
      counts.set(b.cible, (counts.get(b.cible) || 0) + 1);
    }
  }

  const raw: CandidatResultat[] = config.candidats.map(c => {
    const voix = counts.get(c.id) || 0;
    const pct = tally.exprimes > 0 ? Math.round((voix / tally.exprimes) * 1000) / 10 : 0;
    return {
      id: c.id,
      candidat: c,
      voix,
      pct,
      rangBrut: 0,
      elu: false,
      seuilAtteint: seuilPct === null || pct >= seuilPct
    };
  }).sort((a, b) => b.voix - a.voix);

  let currentRank = 1;
  for (let i = 0; i < raw.length; i++) {
    if (i > 0 && raw[i].voix < raw[i - 1].voix) currentRank = i + 1;
    raw[i].rangBrut = currentRank;
  }

  let departageInfo: DepartageInfo = { besoinDepartage: false, methode: config.departage, applique: false };
  const elusIds: string[] = [];
  const corr: CandidatResultat[] = raw.map(it => ({ ...it }));

  if (raw.length === 0 || tally.exprimes === 0) {
    return {
      tally,
      classementBrut: raw,
      classementCorrige: corr,
      explicationCorrection: 'Aucun bulletin exprimé pour le moment.',
      seuilPct,
      elusIds,
      departageInfo
    };
  }

  // 1er siège
  const topVoix = raw[0].voix;
  const topTied = raw.filter(c => c.voix === topVoix);
  let firstId = raw[0].id;
  if (topTied.length > 1) {
    departageInfo = resolveTie(topTied.map(c => c.id), 1, config.departage, candMap, seedTirage);
    firstId = (tirageEffectue && vainqueursTirage?.[0]) || departageInfo.vainqueursTirage?.[0] || topTied[0].id;
  }

  const firstCand = candMap.get(firstId)!;
  elusIds.push(firstId);
  const rawFirst = raw.find(c => c.id === firstId)!;
  rawFirst.elu = true;
  rawFirst.mentionElu = 'Élu(e) (1er rang)';
  const corrFirst = corr.find(c => c.id === firstId)!;
  corrFirst.elu = true;
  corrFirst.mentionElu = 'Élu(e) (1er rang)';

  if (raw.length === 1) {
    return {
      tally,
      classementBrut: raw,
      classementCorrige: corr,
      explicationCorrection: 'Un seul candidat en lice.',
      seuilPct,
      elusIds,
      departageInfo
    };
  }

  // 2e siège
  const firstSexe = firstCand.sexe;
  const otherSexe = firstSexe === 'F' ? 'G' : 'F';
  const otherSexeLabel = otherSexe === 'F' ? 'fille' : 'garçon';
  const firstSexePluriel = firstSexe === 'F' ? 'filles' : 'garçons';
  const remainingRaw = raw.filter(c => c.id !== firstId);
  const secondRaw = remainingRaw[0];
  let explication: string;

  if (secondRaw.candidat.sexe === otherSexe) {
    secondRaw.elu = true;
    secondRaw.mentionElu = 'Élu(e) (parité naturelle)';
    const secondCorr = corr.find(c => c.id === secondRaw.id)!;
    secondCorr.elu = true;
    secondCorr.mentionElu = 'Élu(e) (parité naturelle)';
    elusIds.push(secondRaw.id);
    explication = `La parité naturelle est respectée : le 1er (${firstCand.prenom}, ${firstSexe === 'F' ? 'fille' : 'garçon'}) et le 2e (${secondRaw.candidat.prenom}, ${otherSexeLabel}) sont de sexes différents. Aucune correction n'est requise.`;
  } else {
    const oppCands = remainingRaw.filter(c => c.candidat.sexe === otherSexe);
    if (oppCands.length === 0) {
      secondRaw.elu = true;
      secondRaw.mentionElu = 'Élu(e) (aucun candidat du sexe opposé)';
      const secondCorr = corr.find(c => c.id === secondRaw.id)!;
      secondCorr.elu = true;
      secondCorr.mentionElu = 'Élu(e) (aucun candidat du sexe opposé)';
      elusIds.push(secondRaw.id);
      explication = `Les deux premiers sont deux ${firstSexePluriel}, mais aucune candidature du sexe opposé n'était déposée. Le 2e brut (${secondRaw.candidat.prenom}) est donc élu.`;
    } else {
      const bestOpp = oppCands[0];
      const qualifies = (seuilPct === null) || (bestOpp.pct >= seuilPct);
      if (qualifies) {
        bestOpp.elu = true;
        bestOpp.mentionElu = 'Élu(e) (correction paritaire)';
        elusIds.push(bestOpp.id);
        corr.length = 0;
        corr.push(
          { ...corrFirst, rangBrut: 1 },
          { ...bestOpp, rangBrut: 2, elu: true, mentionElu: 'Élu(e) (correction paritaire)' },
          ...raw.filter(c => c.id !== firstId && c.id !== bestOpp.id).map((c, idx) => ({
            ...c,
            elu: false,
            mentionElu: undefined,
            rangBrut: idx + 3
          }))
        );
        const seuilTxt = seuilPct !== null ? `le seuil de ${seuilPct}%` : 'la règle';
        explication = `Les deux premiers bruts étaient deux ${firstSexePluriel} (${firstCand.prenom} et ${secondRaw.candidat.prenom}). La correction paritaire s'applique : ${bestOpp.candidat.prenom} (${bestOpp.voix} voix, ${bestOpp.pct}%) franchit ${seuilTxt} et est élue/élu au 2nd siège pour garantir la parité (1 fille et 1 garçon).`;
      } else {
        secondRaw.elu = true;
        secondRaw.mentionElu = 'Élu(e) (seuil de repêchage non atteint)';
        const secondCorr = corr.find(c => c.id === secondRaw.id)!;
        secondCorr.elu = true;
        secondCorr.mentionElu = 'Élu(e) (seuil de repêchage non atteint)';
        elusIds.push(secondRaw.id);
        explication = `Les deux premiers bruts sont deux ${firstSexePluriel}. La meilleure candidature du sexe opposé (${bestOpp.candidat.prenom}) n'obtient que ${bestOpp.pct}%, ce qui est inférieur au seuil de repêchage requis de ${seuilPct}%. Le 2e du classement brut (${secondRaw.candidat.prenom}) est donc élu.`;
      }
    }
  }

  return {
    tally,
    classementBrut: raw,
    classementCorrige: corr,
    explicationCorrection: explication,
    seuilPct,
    elusIds,
    departageInfo
  };
}

/**
 * Fonction pure de calcul du classement corrigé (selon convention).
 * @param tallyMap Voix par id candidat
 * @param cands Liste des candidats
 * @param seuil Seuil de repêchage en % des exprimés ou null
 */
export function corrige(tallyMap: Record<string, number>, cands: Candidat[], seuil: number | null) {
  const bulletins = Object.entries(tallyMap).flatMap(([cid, v]) =>
    Array.from({ length: v }, () => ({ type: 'choix' as const, cible: cid, t: 1 }))
  );
  return computeCorrigeResults({
    id: 'test',
    config: {
      mode: 'corrige',
      inscrits: Object.values(tallyMap).reduce((a, b) => a + b, 0),
      sieges: 2,
      candidats: cands,
      departage: 'tour',
      seuilRepechage: seuil
    },
    bulletins
  });
}
