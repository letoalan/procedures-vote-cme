/**
 * @module ui/pv/pvView
 * Rôle : affichage et impression du procès-verbal officiel d'élection au CME.
 * Dépend de : core/types.
 */

import { ResultatsCalcul, Scrutin } from '../../core/types.js';

export function buildPvTableHtml(scrutin: Scrutin, results: ResultatsCalcul): string {
  const { config } = scrutin;
  if (config.mode === 'binome' && results.binomesResultats) {
    return results.binomesResultats.map(b => `
      <tr>
        <td class="text-center">${b.rangBrut}</td>
        <td><strong>${b.binome.nom || b.id}</strong> (${b.candidatFille.prenom} & ${b.candidatGarcon.prenom})</td>
        <td class="text-center">F + G</td>
        <td class="text-right"><strong>${b.voix}</strong></td>
        <td class="text-right">${b.pct}%</td>
        <td><strong>${b.elu ? 'ÉLU (Parité respectée)' : 'Non élu'}</strong></td>
      </tr>
    `).join('');
  }
  return (results.candidatsResultats || []).map(c => `
    <tr>
      <td class="text-center">${c.rangBrut}</td>
      <td><strong>${c.candidat.prenom}</strong></td>
      <td class="text-center">${c.candidat.sexe === 'F' ? 'Fille' : 'Garçon'}</td>
      <td class="text-right"><strong>${c.points !== undefined ? c.points + ' pts' : c.voix}</strong></td>
      <td class="text-right">${c.pct}%</td>
      <td><strong>${c.elu ? 'ÉLU(E) — ' + (c.mentionElu || '') : 'Non élu(e)'}</strong></td>
    </tr>
  `).join('');
}

export function buildPvHeaderHtml(scrutin: Scrutin, modeLabel: string, dateFmt: string, hDebut: string, hFin: string): string {
  const { config } = scrutin;
  return `
    <div class="pv-header">
      <div class="pv-republic-marianne">
        <div>RÉPUBLIQUE FRANÇAISE</div>
        <div style="font-size: 8.5pt; font-weight: normal; color: #475569;">Liberté • Égalité • Fraternité</div>
        <div style="font-size: 9pt; margin-top: 4px; font-weight: bold;">VILLE DE ${config.commune?.toUpperCase() || 'LA COMMUNE'}</div>
      </div>
      <div class="pv-cme-title">
        <h2>CONSEIL MUNICIPAL DES ENFANTS</h2>
        <div style="font-size: 10pt; font-weight: bold; color: #1e3a8a;">PROCÈS-VERBAL DES OPÉRATIONS DE VOTE</div>
        <div style="font-size: 8.5pt; color: #475569;">Tour n° ${scrutin.numeroTour || 1}</div>
      </div>
    </div>
    <div class="pv-meta-grid">
      <div><strong>École :</strong> ${config.ecole || 'École élémentaire'}</div>
      <div><strong>Date du scrutin :</strong> ${dateFmt}</div>
      <div><strong>Classe :</strong> ${config.classe || 'CM1-CM2'}</div>
      <div><strong>Horaires :</strong> De ${hDebut} à ${hFin}</div>
      <div style="grid-column: span 2;"><strong>Modalité retenue :</strong> ${modeLabel}</div>
    </div>
  `;
}
