/**
 * @module ui/results/correctedView
 * Rôle : affichage comparatif en double colonne (classement brut vs classement corrigé).
 * Dépend de : core/types.
 */

import { ResultatsCalcul } from '../../core/types.js';

export function renderCorrigeDoubleColumn(results: ResultatsCalcul): string {
  const raw = results.classementBrut || [];
  const corr = results.classementCorrige || [];

  return `
    <div>
      <div style="margin-bottom: 1rem;">
        <span class="badge badge-primary">Mode 4 : Parité par correction</span>
        <h4 style="font-size: 1.15rem; font-weight: 800; margin-top: 0.25rem;">
          Double lecture transparente : Classement brut & Classement corrigé
        </h4>
      </div>

      <div class="double-column-comparison">
        <div class="ranking-column-box">
          <div class="ranking-column-header">
            <span>1. Classement brut (sans filtre)</span>
            <span class="badge badge-secondary">Voix directes</span>
          </div>
          <table class="results-table">
            <thead><tr><th>Rang</th><th>Candidat(e)</th><th>Voix</th><th>%</th></tr></thead>
            <tbody>
              ${raw.map((c, idx) => `
                <tr class="${c.elu ? 'elected-row' : ''}">
                  <td><span class="rank-badge rank-${idx + 1}">${idx + 1}</span></td>
                  <td><div class="cand-name-cell"><span class="sexe-icon ${c.candidat.sexe === 'F' ? 'sexe-f' : 'sexe-g'}">${c.candidat.sexe}</span><span>${c.candidat.prenom}</span></div></td>
                  <td><strong>${c.voix}</strong></td>
                  <td>${c.pct}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="ranking-column-box corrected">
          <div class="ranking-column-header">
            <span>2. Classement corrigé officiel</span>
            <span class="badge badge-accent">Parité 1F + 1G</span>
          </div>
          <table class="results-table">
            <thead><tr><th>Rang</th><th>Candidat(e)</th><th>Statut</th><th>Voix</th></tr></thead>
            <tbody>
              ${corr.map((c, idx) => `
                <tr class="${c.elu ? 'elected-row' : ''}">
                  <td><span class="rank-badge rank-${idx + 1}">${idx + 1}</span></td>
                  <td><div class="cand-name-cell"><span class="sexe-icon ${c.candidat.sexe === 'F' ? 'sexe-f' : 'sexe-g'}">${c.candidat.sexe}</span><span>${c.candidat.prenom}</span></div></td>
                  <td>${c.elu ? `<span class="badge badge-accent">🏆 ${c.mentionElu || 'Élu(e)'}</span>` : '<span style="color: var(--text-muted); font-size: 0.85rem;">Non retenu(e)</span>'}</td>
                  <td><strong>${c.voix}</strong> (${c.pct}%)</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      ${results.explicationCorrection ? `
        <div class="correction-notice-card" style="margin-top: 1rem; background: var(--bg-surface); border: 1px solid var(--accent); border-left: 5px solid var(--accent); border-radius: var(--radius-md); padding: 1rem;">
          <strong style="color: var(--accent); font-size: 0.95rem;">💡 Explication de la régulation paritaire :</strong>
          <p style="margin-top: 0.35rem; line-height: 1.5; font-size: 0.9rem;">${results.explicationCorrection}</p>
        </div>
      ` : ''}
    </div>
  `;
}
