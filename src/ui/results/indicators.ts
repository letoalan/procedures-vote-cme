/**
 * @module ui/results/indicators
 * Rôle : bandeaux d'alerte, de proclamation des élus et de départage.
 * Dépend de : core/types.
 */

import { ResultatsCalcul, Scrutin } from '../../core/types.js';

export function renderProclamationBanner(scrutin: Scrutin, results: ResultatsCalcul): string {
  const elusNames: string[] = [];
  const { config } = scrutin;

  if (config.mode === 'binome' && results.binomesResultats) {
    for (const b of results.binomesResultats.filter(it => it.elu)) {
      elusNames.push(`Binôme ${b.binome.nom || b.id} (${b.candidatFille.prenom} & ${b.candidatGarcon.prenom})`);
    }
  } else if (results.candidatsResultats) {
    for (const c of results.candidatsResultats.filter(it => it.elu)) {
      elusNames.push(`${c.candidat.prenom} (${c.candidat.sexe === 'F' ? 'Fille' : 'Garçon'})`);
    }
  }

  return `
    <div class="proclamation-banner">
      <div class="proclamation-text">
        <h3>🎉 Proclamation officielle des résultats</h3>
        <div class="proclamation-elected-list">
          ${elusNames.length > 0
            ? 'Élu(e)s au Conseil Municipal des Enfants : ' + elusNames.join(' et ')
            : 'Aucun élu proclamé pour le moment (consultez les règles de départage ou second tour).'}
        </div>
        ${results.secondTourRequis ? `
          <div style="margin-top: 0.5rem; background: rgba(0,0,0,0.15); padding: 0.4rem 0.8rem; border-radius: var(--radius-sm); font-size: 0.95rem;">
            ⚠️ Un second tour de scrutin est requis pour désigner l'ensemble des délégués.
          </div>
        ` : ''}
      </div>
      <div class="proclamation-actions">
        ${results.secondTourRequis ? `
          <button type="button" class="btn btn-secondary" id="btn-launch-tour-2" style="background: #fff; color: var(--text-main);">
            <span>🗳️</span> Ouvrir le 2nd tour
          </button>
        ` : ''}
        <button type="button" class="btn btn-secondary" id="btn-banner-pv" style="background: #fff; color: var(--text-main);">
          <span>📜</span> Imprimer le PV
        </button>
      </div>
    </div>
  `;
}

export function renderTieBreakerAlert(scrutin: Scrutin, results: ResultatsCalcul): string {
  const dep = results.departageInfo;
  return `
    <div style="background: var(--warning-subtle); border: 2px solid var(--warning); border-radius: var(--radius-md); padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
      <div>
        <strong style="color: #92400e; font-size: 1.05rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>⚖️</span> Égalité détectée pour l'attribution d'un siège !
        </strong>
        <p style="font-size: 0.9rem; color: var(--text-main); margin-top: 0.25rem;">${dep.motif || ''}</p>
        ${dep.explication ? `<p style="font-size: 0.85rem; color: var(--accent); font-weight: 700; margin-top: 0.25rem;">${dep.explication}</p>` : ''}
      </div>
      <div>
        ${dep.methode === 'tirage' && !scrutin.tirageEffectue ? `
          <button type="button" class="btn btn-primary" id="btn-trigger-lottery"><span>🎲</span> Lancer le tirage au sort officiel</button>
        ` : dep.methode === 'tour' && !scrutin.cloture ? `
          <button type="button" class="btn btn-primary" id="btn-trigger-second-tour"><span>🗳️</span> Organiser le second tour</button>
        ` : ''}
      </div>
    </div>
  `;
}
