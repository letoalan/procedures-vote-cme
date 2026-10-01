/**
 * @module ui/results
 * Rôle : point d'entrée des résultats en direct, indicateurs et actions de clôture.
 * Dépend de : core/types, app/store, ui/results/bars, ui/results/indicators, ui/results/table, ui/results/correctedView.
 */

import { ResultatsCalcul, Scrutin } from '../../core/types.js';
import { store } from '../../store.js';
import { renderMetricsRowHtml, renderProgressBarHtml } from './bars.js';
import { renderProclamationBanner, renderTieBreakerAlert } from './indicators.js';
import { renderBinomesTable, renderClassementTable, renderUninominalTable } from './table.js';
import { renderCorrigeDoubleColumn } from './correctedView.js';

export function renderLiveResults(
  container: HTMLElement,
  scrutin: Scrutin,
  results: ResultatsCalcul,
  onOpenPV: () => void,
  onToggleProjection: () => void
): () => void {
  const { tally } = results;
  const { config } = scrutin;
  const isClosed = !!scrutin.cloture;

  container.innerHTML = `
    <div class="live-results-panel">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem;">
        <div>
          <h4 style="font-size: 1.25rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <span>📊</span> Résultats en direct
            <span class="badge ${scrutin.numeroTour === 2 ? 'badge-warning' : 'badge-primary'}">Tour n°${scrutin.numeroTour || 1}</span>
            ${isClosed ? '<span class="badge badge-accent">Scrutin Clôturé</span>' : '<span class="badge badge-secondary">Dépouillement en cours</span>'}
          </h4>
          <span style="font-size: 0.85rem; color: var(--text-muted);">${config.ecole || 'École'} — Classe ${config.classe || 'CM1-CM2'} — ${config.sieges} siège(s)</span>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          ${!isClosed
            ? `<button type="button" class="btn btn-accent" id="btn-close-depouillement" ${tally.votants === 0 ? 'disabled' : ''}><span>🏁</span> Clore le dépouillement</button>`
            : `<button type="button" class="btn btn-primary" id="btn-view-pv"><span>📜</span> Voir le Procès-Verbal (PV)</button>`}
          <button type="button" class="btn btn-secondary" id="btn-projection-mode" title="Projection plein écran pour la classe"><span>📺</span> Mode Projection</button>
        </div>
      </div>

      ${renderMetricsRowHtml(tally)}
      ${renderProgressBarHtml(tally)}
      ${isClosed ? renderProclamationBanner(scrutin, results) : ''}
      ${results.departageInfo.besoinDepartage ? renderTieBreakerAlert(scrutin, results) : ''}

      ${config.mode === 'corrige'
        ? renderCorrigeDoubleColumn(results)
        : config.mode === 'binome'
        ? renderBinomesTable(results)
        : config.mode === 'classement'
        ? renderClassementTable(scrutin, results)
        : renderUninominalTable(results)}

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 1rem; flex-wrap: wrap; gap: 0.75rem;">
        <div style="font-size: 0.85rem; color: var(--text-muted);">
          <span>Majorité absolue requise : <strong>${tally.majoriteAbsolue} voix</strong></span>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button type="button" class="btn btn-secondary" id="btn-export-csv" style="font-size: 0.85rem; padding: 0.4rem 0.75rem;"><span>📥</span> Export CSV</button>
          <button type="button" class="btn btn-secondary" id="btn-export-json" style="font-size: 0.85rem; padding: 0.4rem 0.75rem;"><span>💾</span> Sauvegarde JSON</button>
        </div>
      </div>
    </div>
  `;

  const closeBtn = container.querySelector<HTMLButtonElement>('#btn-close-depouillement');
  if (closeBtn) closeBtn.addEventListener('click', () => { store.clotureDepouillement(); });

  const viewPvBtn = container.querySelector<HTMLButtonElement>('#btn-view-pv');
  if (viewPvBtn) viewPvBtn.addEventListener('click', onOpenPV);

  const bannerPvBtn = container.querySelector<HTMLButtonElement>('#btn-banner-pv');
  if (bannerPvBtn) bannerPvBtn.addEventListener('click', onOpenPV);

  const projBtn = container.querySelector<HTMLButtonElement>('#btn-projection-mode');
  if (projBtn) projBtn.addEventListener('click', onToggleProjection);

  const tour2Btn = container.querySelector<HTMLButtonElement>('#btn-launch-tour-2');
  if (tour2Btn) tour2Btn.addEventListener('click', () => { store.lancerSecondTour(); });

  const csvBtn = container.querySelector<HTMLButtonElement>('#btn-export-csv');
  if (csvBtn) csvBtn.addEventListener('click', () => {
    const csv = store.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultats-cme-${config.mode}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  const jsonBtn = container.querySelector<HTMLButtonElement>('#btn-export-json');
  if (jsonBtn) jsonBtn.addEventListener('click', () => {
    const json = store.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scrutin-cme-${scrutin.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  return () => {};
}

export * from './bars.js';
export * from './table.js';
export * from './indicators.js';
export * from './correctedView.js';
