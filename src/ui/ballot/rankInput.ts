/**
 * @module ui/ballot/rankInput
 * Rôle : saisie interactive des bulletins classés (Borda 5 choix et STV).
 * Dépend de : core/types.
 */

import { Config } from '../../core/types.js';

export function renderRankingHtml(config: Config, currentRanking: string[], disabled: boolean): string {
  const maxRank = Math.min(5, config.candidats.length);
  const remainingCandidates = config.candidats.filter(c => !currentRanking.includes(c.id));
  const pointsLabels = ['5 pts', '4 pts', '3 pts', '2 pts', '1 pt'];

  return `
    <div class="virtual-ranked-ballot">
      <div style="margin-bottom: 0.75rem;">
        <strong style="font-size: 0.95rem;">Bulletin virtuel classé (jusqu'à 5 candidats) :</strong>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.2rem;">
          Cliquez sur les candidats pour attribuer les rangs 1 à 5. Le vote partiel (1 à 4 candidats) est autorisé.
        </p>
      </div>

      <div class="ranked-slots-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.5rem; margin-bottom: 1rem;">
        ${Array.from({ length: maxRank }).map((_, idx) => {
          const candId = currentRanking[idx];
          const cand = candId ? config.candidats.find(c => c.id === candId) : null;
          return `
            <div class="ranked-slot-box" style="border: 2px dashed ${cand ? 'var(--primary)' : 'var(--border)'}; background: ${cand ? 'var(--primary-subtle)' : 'var(--bg-app)'}; border-radius: var(--radius-md); padding: 0.6rem; text-align: center;">
              <div style="font-size: 0.75rem; font-weight: 800; color: var(--primary-light);">
                Rang ${idx + 1} (${pointsLabels[idx] || ''})
              </div>
              <div style="font-size: 1rem; font-weight: 800; margin-top: 0.25rem;">
                ${cand ? cand.prenom : '<span style="color: var(--text-muted); font-size: 0.85rem;">[Vide]</span>'}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="margin-bottom: 1rem;">
        <label style="font-size: 0.85rem; font-weight: 700; display: block; margin-bottom: 0.4rem;">
          Sélectionner le prochain candidat :
        </label>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.5rem;">
          ${remainingCandidates.map(c => `
            <button type="button" class="btn btn-secondary btn-rank-pick" data-id="${c.id}" ${disabled || currentRanking.length >= maxRank ? 'disabled' : ''} style="padding: 0.5rem; font-weight: 700;">
              ➕ ${c.prenom}
            </button>
          `).join('')}
        </div>
      </div>

      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button type="button" class="btn btn-primary" id="btn-validate-rank" ${disabled || currentRanking.length === 0 ? 'disabled' : ''}>
          <span>✔️</span> Déposer ce bulletin (${currentRanking.length} classé${currentRanking.length > 1 ? 's' : ''})
        </button>
        <button type="button" class="btn btn-secondary" id="btn-clear-rank" ${currentRanking.length === 0 ? 'disabled' : ''}>
          <span>🔄</span> Effacer
        </button>
        <button type="button" class="btn btn-secondary" id="btn-rank-blanc" ${disabled ? 'disabled' : ''}>
          ⚪ Bulletin Blanc
        </button>
        <button type="button" class="btn btn-secondary" id="btn-rank-nul" ${disabled ? 'disabled' : ''}>
          ❌ Bulletin Nul
        </button>
      </div>
    </div>
  `;
}
