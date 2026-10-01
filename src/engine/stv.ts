import { CandidatResultat, DepartageInfo, Scrutin, STVEtape, STVResultat, TallyResult } from './types.js';
import { calculateTally } from './tally.js';

interface BallotPaper {
  id: string;
  ordre: string[];
  weight: number;
}

export interface STVCalculationOutput {
  tally: TallyResult;
  candidatsResultats: CandidatResultat[];
  stvDetails: STVResultat;
  elusIds: string[];
  departageInfo: DepartageInfo;
}

export function computeSTVResults(scrutin: Scrutin): STVCalculationOutput {
  const { config, bulletins } = scrutin;
  const sieges = config.sieges || 2;
  const tally = calculateTally(bulletins, config.inscrits, sieges);

  // Droop Quota = floor(exprimes / (sieges + 1)) + 1
  const quota = tally.exprimes > 0 ? Math.floor(tally.exprimes / (sieges + 1)) + 1 : 1;

  // Active ballots
  const papers: BallotPaper[] = [];
  let paperIdCounter = 1;
  for (const b of bulletins) {
    if (b.type === 'rang' && b.ordre && b.ordre.length > 0) {
      papers.push({
        id: `b-${paperIdCounter++}`,
        ordre: [...b.ordre],
        weight: 1.0
      });
    }
  }

  const allCandIds = config.candidats.map(c => c.id);
  const elected: string[] = [];
  const eliminated: string[] = [];
  const etapes: STVEtape[] = [];

  const roundVotes = (v: number) => Math.round(v * 100) / 100;

  // Helper to count current votes per candidate
  const getTallies = (): Record<string, number> => {
    const scores: Record<string, number> = {};
    for (const id of allCandIds) scores[id] = 0;

    for (const paper of papers) {
      // Find first preference among non-elected, non-eliminated candidates
      const topChoice = paper.ordre.find(id => !elected.includes(id) && !eliminated.includes(id));
      if (topChoice) {
        scores[topChoice] = (scores[topChoice] || 0) + paper.weight;
      }
    }
    for (const id of allCandIds) {
      scores[id] = roundVotes(scores[id]);
    }
    return scores;
  };

  let etapeNum = 1;
  let running = true;
  let finalScores: Record<string, number> = {};

  while (running && etapeNum <= 50) {
    const currentScores = getTallies();
    finalScores = { ...currentScores };

    // Check if remaining candidates equals seats left
    const seatsRemaining = sieges - elected.length;
    const remainingCandidates = allCandIds.filter(id => !elected.includes(id) && !eliminated.includes(id));

    if (seatsRemaining <= 0) {
      etapes.push({
        numero: etapeNum++,
        action: 'fin',
        description: `Tous les ${sieges} sièges ont été pourvus.`,
        etatVoix: currentScores,
        elusActuels: [...elected],
        eliminesActuels: [...eliminated]
      });
      break;
    }

    if (remainingCandidates.length <= seatsRemaining) {
      // All remaining candidates are elected
      for (const id of remainingCandidates) {
        if (!elected.includes(id)) elected.push(id);
      }
      etapes.push({
        numero: etapeNum++,
        action: 'fin',
        description: `Nombre de candidats restants (${remainingCandidates.length}) égal au nombre de sièges à pourvoir (${seatsRemaining}). Candidats restants élus.`,
        etatVoix: currentScores,
        elusActuels: [...elected],
        eliminesActuels: [...eliminated]
      });
      break;
    }

    // Check if someone reached or exceeded quota
    const candidatesAtQuota = remainingCandidates.filter(id => currentScores[id] >= quota);

    if (candidatesAtQuota.length > 0) {
      // Sort by score descending to handle the highest surplus first
      candidatesAtQuota.sort((a, b) => currentScores[b] - currentScores[a]);
      const electedCandidate = candidatesAtQuota[0];
      elected.push(electedCandidate);
      const candObj = config.candidats.find(c => c.id === electedCandidate);
      const candName = candObj ? candObj.prenom : electedCandidate;

      const surplus = currentScores[electedCandidate] - quota;

      etapes.push({
        numero: etapeNum++,
        action: 'quota',
        description: `${candName} atteint le quota de Droop (${quota} voix) avec ${currentScores[electedCandidate]} voix et est élu(e).`,
        etatVoix: { ...currentScores },
        elusActuels: [...elected],
        eliminesActuels: [...eliminated]
      });

      // Transfer surplus if any and if more seats remain
      if (surplus > 0.01 && elected.length < sieges) {
        // Gregory method: scale ballots where candidate was the active choice
        const transferFactor = surplus / currentScores[electedCandidate];
        for (const paper of papers) {
          // Identify the active choice for this paper before electedCandidate's election
          const activeChoice = paper.ordre.find(id => (!elected.includes(id) || id === electedCandidate) && !eliminated.includes(id));
          if (activeChoice === electedCandidate) {
            paper.weight = paper.weight * transferFactor;
          }
        }
        etapes.push({
          numero: etapeNum++,
          action: 'surplus',
          description: `Transfert du surplus de ${roundVotes(surplus)} voix de ${candName} (valeur de transfert : ${(transferFactor * 100).toFixed(1)}%).`,
          etatVoix: getTallies(),
          elusActuels: [...elected],
          eliminesActuels: [...eliminated]
        });
      }
      continue;
    }

    // If nobody reached quota, eliminate candidate with least votes
    remainingCandidates.sort((a, b) => currentScores[a] - currentScores[b]);
    const lowestScore = currentScores[remainingCandidates[0]];
    const lowestCandidates = remainingCandidates.filter(id => currentScores[id] === lowestScore);
    const toEliminate = lowestCandidates[0]; // If tie, take first
    eliminated.push(toEliminate);

    const candObj = config.candidats.find(c => c.id === toEliminate);
    const candName = candObj ? candObj.prenom : toEliminate;

    etapes.push({
      numero: etapeNum++,
      action: 'elimination',
      description: `Aucun candidat n'atteint le quota (${quota}). Élimination de ${candName} (${currentScores[toEliminate]} voix), ses bulletins sont reportés selon les préférences suivantes.`,
      etatVoix: { ...currentScores },
      elusActuels: [...elected],
      eliminesActuels: [...eliminated]
    });
  }

  const stvDetails: STVResultat = {
    quota,
    etapes,
    elus: elected,
    scoresFinaux: finalScores
  };

  const items: CandidatResultat[] = config.candidats.map(c => {
    const isElu = elected.includes(c.id);
    const score = finalScores[c.id] || 0;
    const pct = tally.exprimes > 0 ? Math.round((score / tally.exprimes) * 1000) / 10 : 0;
    return {
      id: c.id,
      candidat: c,
      voix: Math.round(score),
      pct,
      rangBrut: 0,
      elu: isElu,
      mentionElu: isElu ? 'Élu(e) au scrutin transférable (STV)' : undefined
    };
  });

  items.sort((a, b) => {
    if (a.elu && !b.elu) return -1;
    if (!a.elu && b.elu) return 1;
    return (b.voix || 0) - (a.voix || 0);
  });

  items.forEach((item, index) => {
    item.rangBrut = index + 1;
  });

  return {
    tally,
    candidatsResultats: items,
    stvDetails,
    elusIds: elected,
    departageInfo: {
      besoinDepartage: false,
      methode: config.departage,
      applique: false
    }
  };
}
