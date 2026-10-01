import { Bulletin, TallyResult } from './types.js';

export function calculateTally(bulletins: Bulletin[], inscrits: number, sieges: number = 2): TallyResult {
  let blancs = 0;
  let nuls = 0;
  let exprimes = 0;

  for (const b of bulletins) {
    if (b.type === 'blanc') {
      blancs++;
    } else if (b.type === 'nul') {
      nuls++;
    } else if (b.type === 'choix') {
      if (b.cible && b.cible.trim() !== '') {
        exprimes++;
      } else {
        blancs++;
      }
    } else if (b.type === 'rang') {
      if (b.ordre && b.ordre.length > 0) {
        exprimes++;
      } else {
        blancs++;
      }
    }
  }

  const votants = blancs + nuls + exprimes;
  const participationPct = inscrits > 0 ? Math.round((votants / inscrits) * 1000) / 10 : 0;
  const majoriteAbsolue = exprimes > 0 ? Math.floor(exprimes / 2) + 1 : 1;
  const quotaSur = exprimes > 0 ? Math.floor(exprimes / (sieges + 1)) + 1 : 1;

  return {
    inscrits,
    votants,
    blancs,
    nuls,
    exprimes,
    participationPct,
    majoriteAbsolue,
    quotaSur
  };
}
