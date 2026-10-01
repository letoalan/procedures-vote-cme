/**
 * @module ui/pv/tieBreaker
 * Rôle : mise en forme des mentions d'élus, du mode et des motifs de départage.
 * Dépend de : core/types.
 */

import { Config, ResultatsCalcul } from '../../core/types.js';

export function getModeLabel(config: Config): string {
  switch (config.mode) {
    case 'binome':
      return 'Scrutin de binômes paritaires (1 Fille + 1 Garçon indissociables)';
    case 'uninominal':
      return `Scrutin uninominal majoritaire à 2 sièges (${config.sousMode === 'A' ? 'Majoritaire à deux tours' : 'Plurinominal à 1 tour'})`;
    case 'classement':
      return config.sousMode === 'stv'
        ? 'Scrutin à Vote Unique Transférable (STV / Droop)'
        : 'Scrutin préférentiel de Borda (5 candidats préférés — Barème : 5, 4, 3, 2, 1 pts)';
    case 'corrige':
      return `Scrutin uninominal avec correction paritaire conditionnelle (Seuil : ${config.seuilRepechage || 25}%)`;
    default:
      return config.mode;
  }
}

export function extractProclaimedElected(config: Config, results: ResultatsCalcul): string[] {
  const elusList: string[] = [];
  if (config.mode === 'binome' && results.binomesResultats) {
    results.binomesResultats.filter(b => b.elu).forEach(b => {
      elusList.push(`• Binôme ${b.binome.nom || b.id} : ${b.candidatFille.prenom} (Fille) et ${b.candidatGarcon.prenom} (Garçon) — ${b.mentionElu || 'Élus'}`);
    });
  } else if (results.candidatsResultats) {
    results.candidatsResultats.filter(c => c.elu).forEach(c => {
      elusList.push(`• ${c.candidat.prenom} (${c.candidat.sexe === 'F' ? 'Fille' : 'Garçon'}) — ${c.mentionElu || 'Élu(e)'}`);
    });
  }
  return elusList;
}
