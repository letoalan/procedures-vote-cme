/**
 * @module app/exports
 * Rôle : exports JSON / CSV et import des données de scrutin.
 * Dépend de : core/types.
 */

import { ResultatsCalcul, Scrutin } from '../core/types.js';

export function exportScrutinJSON(scrutin: Scrutin): string {
  return JSON.stringify(scrutin, null, 2);
}

export function importScrutinJSON(jsonStr: string): Scrutin {
  try {
    const parsed = JSON.parse(jsonStr) as Scrutin;
    if (!parsed || !parsed.config || !Array.isArray(parsed.bulletins)) {
      throw new Error('Format de fichier JSON invalide pour une élection CME.');
    }
    return parsed;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error('Erreur de lecture du fichier : ' + msg, { cause: err });
  }
}

export function exportResultsCSV(scrutin: Scrutin, results: ResultatsCalcul): string {
  const cfg = scrutin.config;
  const lines: string[] = [
    `"Élections CME - Procès-Verbal et Résultats"`,
    `"Date";"${cfg.dateScrutin || ''}"`,
    `"École";"${cfg.ecole || ''}"`,
    `"Classe";"${cfg.classe || ''}"`,
    `"Commune";"${cfg.commune || ''}"`,
    `"Mode de scrutin";"${cfg.mode}"`,
    `"Tour";"${scrutin.numeroTour || 1}"`,
    '',
    `"Inscrits";${results.tally.inscrits}`,
    `"Votants";${results.tally.votants}`,
    `"Exprimés";${results.tally.exprimes}`,
    `"Blancs";${results.tally.blancs}`,
    `"Nuls";${results.tally.nuls}`,
    `"Taux de participation (%)";${results.tally.participationPct}`,
    ''
  ];

  if (cfg.mode === 'binome' && results.binomesResultats) {
    lines.push(`"Rang";"Binôme";"Fille";"Garçon";"Voix";"% Exprimés";"Élu"`);
    for (const b of results.binomesResultats) {
      lines.push(`${b.rangBrut};"${b.binome.nom || b.id}";"${b.candidatFille.prenom}";"${b.candidatGarcon.prenom}";${b.voix};${b.pct}%;"${b.elu ? 'OUI (' + (b.mentionElu || '') + ')' : 'NON'}"`);
    }
  } else if (results.candidatsResultats) {
    lines.push(`"Rang";"Candidat(e)";"Sexe";"Voix/Points";"% Exprimés";"Élu"`);
    for (const c of results.candidatsResultats) {
      const score = c.points !== undefined ? `${c.points} pts (${c.voix} rangs 1)` : `${c.voix}`;
      lines.push(`${c.rangBrut};"${c.candidat.prenom}";"${c.candidat.sexe}";${score};${c.pct}%;"${c.elu ? 'OUI (' + (c.mentionElu || '') + ')' : 'NON'}"`);
    }
  }

  return lines.join('\r\n');
}
