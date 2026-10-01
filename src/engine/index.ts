import { ResultatsCalcul, Scrutin } from './types.js';
import { computeBinomeResults } from './binome.js';
import { computeUninominalResults } from './uninominal.js';
import { computeBordaResults } from './borda.js';
import { computeSTVResults } from './stv.js';
import { computeCorrigeResults } from './corrige.js';

export function calculateElectionResults(scrutin: Scrutin): ResultatsCalcul {
  const mode = scrutin.config.mode;
  const sousMode = scrutin.config.sousMode;

  switch (mode) {
    case 'binome': {
      const res = computeBinomeResults(scrutin);
      return {
        tally: res.tally,
        mode: 'binome',
        sousMode,
        sieges: scrutin.config.sieges || 2,
        binomesResultats: res.binomesResultats,
        elusIds: res.elusIds,
        secondTourRequis: res.secondTourRequis,
        candidatsSecondTour: res.binomesSecondTour,
        departageInfo: res.departageInfo
      };
    }

    case 'uninominal': {
      const res = computeUninominalResults(scrutin);
      return {
        tally: res.tally,
        mode: 'uninominal',
        sousMode,
        sieges: scrutin.config.sieges || 2,
        candidatsResultats: res.candidatsResultats,
        elusIds: res.elusIds,
        secondTourRequis: res.secondTourRequis,
        candidatsSecondTour: res.candidatsSecondTour,
        departageInfo: res.departageInfo
      };
    }

    case 'classement': {
      if (sousMode === 'stv') {
        const res = computeSTVResults(scrutin);
        return {
          tally: res.tally,
          mode: 'classement',
          sousMode: 'stv',
          sieges: scrutin.config.sieges || 2,
          candidatsResultats: res.candidatsResultats,
          stvDetails: res.stvDetails,
          elusIds: res.elusIds,
          departageInfo: res.departageInfo
        };
      } else {
        const res = computeBordaResults(scrutin);
        return {
          tally: res.tally,
          mode: 'classement',
          sousMode: 'borda',
          sieges: scrutin.config.sieges || 2,
          candidatsResultats: res.candidatsResultats,
          matriceRangs: res.matriceRangs,
          elusIds: res.elusIds,
          departageInfo: res.departageInfo
        };
      }
    }

    case 'corrige': {
      const res = computeCorrigeResults(scrutin);
      return {
        tally: res.tally,
        mode: 'corrige',
        sousMode,
        sieges: 2,
        candidatsResultats: res.classementCorrige,
        classementBrut: res.classementBrut,
        classementCorrige: res.classementCorrige,
        explicationCorrection: res.explicationCorrection,
        elusIds: res.elusIds,
        departageInfo: res.departageInfo
      };
    }

    default:
      throw new Error(`Mode inconnu: ${mode}`);
  }
}

export * from './types.js';
export * from './tally.js';
export * from './ties.js';
export * from './binome.js';
export * from './uninominal.js';
export * from './borda.js';
export * from './stv.js';
export * from './corrige.js';
