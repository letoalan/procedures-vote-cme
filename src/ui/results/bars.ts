/**
 * @module ui/results/bars
 * Rôle : affichage des compteurs de participation, majorités et de la barre de progression.
 * Dépend de : core/types.
 */

import { TallyResult } from '../../core/types.js';

export function renderMetricsRowHtml(tally: TallyResult): string {
  return `
    <div class="metrics-row">
      <div class="metric-card"><span class="metric-val">${tally.inscrits}</span><span class="metric-label">Inscrits</span></div>
      <div class="metric-card highlight"><span class="metric-val">${tally.votants}</span><span class="metric-label">Votants (${tally.participationPct}%)</span></div>
      <div class="metric-card success"><span class="metric-val">${tally.exprimes}</span><span class="metric-label">Exprimés</span></div>
      <div class="metric-card"><span class="metric-val">${tally.blancs}</span><span class="metric-label">Blancs</span></div>
      <div class="metric-card"><span class="metric-val">${tally.nuls}</span><span class="metric-label">Nuls</span></div>
      <div class="metric-card"><span class="metric-val">${tally.quotaSur}</span><span class="metric-label" title="Nombre de voix assurant l'élection mathématique">Quota sûr (2 sièges)</span></div>
    </div>
  `;
}

export function renderProgressBarHtml(tally: TallyResult): string {
  const pct = Math.min(100, tally.participationPct);
  return `
    <div class="progress-container">
      <div class="progress-labels">
        <span>Avancement du dépouillement</span>
        <span>${tally.votants} / ${tally.inscrits} votants (${tally.participationPct}%)</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${pct}%;"></div>
      </div>
    </div>
  `;
}
