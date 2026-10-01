/**
 * @module ui/results/table
 * Rôle : tableaux de résultats pour les modes binôme, uninominal et classement.
 * Dépend de : core/types.
 */

import { ResultatsCalcul, Scrutin } from '../../core/types.js';

export function renderBinomesTable(results: ResultatsCalcul): string {
  const binomes = results.binomesResultats || [];
  return `
    <table class="results-table">
      <thead>
        <tr><th>Rang</th><th>Binôme</th><th>Composition</th><th>Voix</th><th>% Exprimés</th><th>Statut</th></tr>
      </thead>
      <tbody>
        ${binomes.map((b, idx) => `
          <tr class="${b.elu ? 'elected-row' : ''}">
            <td><span class="rank-badge rank-${idx + 1}">${idx + 1}</span></td>
            <td><strong>${b.binome.nom || b.id}</strong></td>
            <td>${b.candidatFille.prenom} (F) & ${b.candidatGarcon.prenom} (G)</td>
            <td><strong>${b.voix}</strong></td>
            <td>${b.pct}%</td>
            <td>${b.elu ? `<span class="badge badge-accent">🏆 ${b.mentionElu || 'Élu'}</span>` : '<span style="color: var(--text-muted);">En attente</span>'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

export function renderUninominalTable(results: ResultatsCalcul): string {
  const cands = results.candidatsResultats || [];
  return `
    <table class="results-table">
      <thead>
        <tr><th>Rang</th><th>Candidat(e)</th><th>Voix</th><th>% Exprimés</th><th>Statut</th></tr>
      </thead>
      <tbody>
        ${cands.map((c, idx) => `
          <tr class="${c.elu ? 'elected-row' : ''}">
            <td><span class="rank-badge rank-${idx + 1}">${idx + 1}</span></td>
            <td>
              <div class="cand-name-cell">
                <span class="sexe-icon ${c.candidat.sexe === 'F' ? 'sexe-f' : 'sexe-g'}">${c.candidat.sexe}</span>
                <span>${c.candidat.prenom}</span>
              </div>
            </td>
            <td><strong>${c.voix}</strong></td>
            <td>${c.pct}%</td>
            <td>${c.elu ? `<span class="badge badge-accent">🏆 ${c.mentionElu || 'Élu(e)'}</span>` : '<span style="color: var(--text-muted);">En attente</span>'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

export function renderClassementTable(scrutin: Scrutin, results: ResultatsCalcul): string {
  const cands = results.candidatsResultats || [];
  const isSTV = scrutin.config.sousMode === 'stv';
  return `
    <table class="results-table">
      <thead>
        <tr><th>Rang</th><th>Candidat(e)</th><th>${isSTV ? 'Voix finales' : 'Points Borda'}</th><th>Statut</th></tr>
      </thead>
      <tbody>
        ${cands.map((c, idx) => `
          <tr class="${c.elu ? 'elected-row' : ''}">
            <td><span class="rank-badge rank-${idx + 1}">${idx + 1}</span></td>
            <td>
              <div class="cand-name-cell">
                <span class="sexe-icon ${c.candidat.sexe === 'F' ? 'sexe-f' : 'sexe-g'}">${c.candidat.sexe}</span>
                <span>${c.candidat.prenom}</span>
              </div>
            </td>
            <td><strong>${c.points !== undefined ? c.points + ' pts' : c.voix}</strong></td>
            <td>${c.elu ? `<span class="badge badge-accent">🏆 ${c.mentionElu || 'Élu(e)'}</span>` : '<span style="color: var(--text-muted);">En attente</span>'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}
