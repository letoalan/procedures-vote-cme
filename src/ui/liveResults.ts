import { ResultatsCalcul, Scrutin } from '../engine/types.js';
import { store } from '../store.js';

export function renderLiveResults(
  container: HTMLElement,
  scrutin: Scrutin,
  results: ResultatsCalcul,
  onOpenPV: () => void,
  onToggleProjection: () => void
) {
  const { tally } = results;
  const config = scrutin.config;
  const isClosed = !!scrutin.cloture;

  container.innerHTML = `
    <div class="live-results-panel">
      <!-- En-tête statut et métriques -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem;">
        <div>
          <h4 style="font-size: 1.25rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <span>📊</span> Résultats en direct
            <span class="badge ${scrutin.numeroTour === 2 ? 'badge-warning' : 'badge-primary'}">
              Tour n°${scrutin.numeroTour || 1}
            </span>
            ${isClosed
              ? '<span class="badge badge-accent">Scrutin Clôturé</span>'
              : '<span class="badge badge-secondary">Dépouillement en cours</span>'}
          </h4>
          <span style="font-size: 0.85rem; color: var(--text-muted);">
            ${config.ecole || 'École'} — Classe ${config.classe || 'CM1-CM2'} — ${config.sieges} siège(s)
          </span>
        </div>

        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          ${!isClosed ? `
            <button type="button" class="btn btn-accent" id="btn-close-depouillement" ${tally.votants === 0 ? 'disabled' : ''}>
              <span>🏁</span> Clore le dépouillement
            </button>
          ` : `
            <button type="button" class="btn btn-primary" id="btn-view-pv">
              <span>📜</span> Voir le Procès-Verbal (PV)
            </button>
          `}
          <button type="button" class="btn btn-secondary" id="btn-projection-mode" title="Projection plein écran pour la classe">
            <span>📺</span> Mode Projection
          </button>
        </div>
      </div>

      <!-- Compteurs en cartes -->
      <div class="metrics-row">
        <div class="metric-card">
          <span class="metric-val">${tally.inscrits}</span>
          <span class="metric-label">Inscrits</span>
        </div>
        <div class="metric-card highlight">
          <span class="metric-val">${tally.votants}</span>
          <span class="metric-label">Votants (${tally.participationPct}%)</span>
        </div>
        <div class="metric-card success">
          <span class="metric-val">${tally.exprimes}</span>
          <span class="metric-label">Exprimés</span>
        </div>
        <div class="metric-card">
          <span class="metric-val">${tally.blancs}</span>
          <span class="metric-label">Blancs</span>
        </div>
        <div class="metric-card">
          <span class="metric-val">${tally.nuls}</span>
          <span class="metric-label">Nuls</span>
        </div>
        <div class="metric-card">
          <span class="metric-val">${tally.quotaSur}</span>
          <span class="metric-label" title="Nombre de voix assurant l'élection mathématique">Quota sûr (2 sièges)</span>
        </div>
      </div>

      <!-- Barre de progression -->
      <div class="progress-container">
        <div class="progress-labels">
          <span>Avancement du dépouillement</span>
          <span>${tally.votants} / ${tally.inscrits} votants (${tally.participationPct}%)</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${Math.min(100, tally.participationPct)}%;"></div>
        </div>
      </div>

      <!-- Alerte Second Tour / Ballottage en direct -->
      ${results.secondTourRequis && !isClosed ? `
        <div style="background: var(--warning-subtle); border-left: 4px solid var(--warning); border-radius: 0 var(--radius-md) var(--radius-md) 0; padding: 0.85rem 1.15rem; font-size: 0.92rem;">
          <strong style="color: #92400e; display: flex; align-items: center; gap: 0.4rem;">
            <span>⏳</span> Ballottage / Second tour nécessaire
          </strong>
          <p style="margin-top: 0.25rem; color: var(--text-main); line-height: 1.5;">
            Pour être élu au 1er tour, la majorité absolue est requise (${tally.majoriteAbsolue} voix).
            Une fois le dépouillement clos, vous pourrez ouvrir directement le <strong>2nd tour</strong> avec les binômes qualifiés !
          </p>
        </div>
      ` : ''}

      <!-- Proclamation si clôturé -->
      ${isClosed ? renderProclamationBanner(scrutin, results) : ''}

      <!-- Alerte Départage si besoin -->
      ${results.departageInfo.besoinDepartage ? renderTieBreakerAlert(scrutin, results) : ''}

      <!-- Tableau des résultats selon la modalité -->
      ${config.mode === 'corrige'
        ? renderCorrigeDoubleColumn(results)
        : config.mode === 'binome'
        ? renderBinomesTable(results)
        : config.mode === 'classement'
        ? renderClassementTable(scrutin, results)
        : renderUninominalTable(results)}

      <!-- Barre d'outils secondaire (Export / PV) -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 1rem; flex-wrap: wrap; gap: 0.75rem;">
        <div style="font-size: 0.85rem; color: var(--text-muted);">
          <span>Majorité absolue requise au 1er tour : <strong>${tally.majoriteAbsolue} voix</strong></span>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button type="button" class="btn btn-secondary" id="btn-export-csv" style="font-size: 0.85rem; padding: 0.4rem 0.75rem;">
            <span>📥</span> Export CSV
          </button>
          <button type="button" class="btn btn-secondary" id="btn-export-json" style="font-size: 0.85rem; padding: 0.4rem 0.75rem;">
            <span>💾</span> Sauvegarde JSON
          </button>
          <button type="button" class="btn btn-secondary" id="btn-import-json" style="font-size: 0.85rem; padding: 0.4rem 0.75rem;">
            <span>📂</span> Importer JSON
          </button>
          <input type="file" id="file-import-json" accept=".json" style="display: none;">
        </div>
      </div>
    </div>
  `;

  attachLiveResultsEvents(container, scrutin, results, onOpenPV, onToggleProjection);
}

function renderProclamationBanner(scrutin: Scrutin, results: ResultatsCalcul): string {
  const elusNames: string[] = [];
  const config = scrutin.config;

  if (config.mode === 'binome' && results.binomesResultats) {
    const elus = results.binomesResultats.filter(b => b.elu);
    for (const b of elus) {
      elusNames.push(`Binôme ${b.binome.nom || b.id} (${b.candidatFille.prenom} & ${b.candidatGarcon.prenom})`);
    }
  } else if (results.candidatsResultats) {
    const elus = results.candidatsResultats.filter(c => c.elu);
    for (const c of elus) {
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

function renderTieBreakerAlert(scrutin: Scrutin, results: ResultatsCalcul): string {
  const dep = results.departageInfo;
  return `
    <div style="background: var(--warning-subtle); border: 2px solid var(--warning); border-radius: var(--radius-md); padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
      <div>
        <strong style="color: #92400e; font-size: 1.05rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>⚖️</span> Égalité détectée pour l'attribution d'un siège !
        </strong>
        <p style="font-size: 0.9rem; color: var(--text-main); margin-top: 0.25rem;">
          ${dep.motif || ''}
        </p>
        ${dep.explication ? `
          <p style="font-size: 0.85rem; color: var(--accent); font-weight: 700; margin-top: 0.25rem;">
            ${dep.explication}
          </p>
        ` : ''}
      </div>
      <div>
        ${dep.methode === 'tirage' && !scrutin.tirageEffectue ? `
          <button type="button" class="btn btn-primary" id="btn-trigger-lottery">
            <span>🎲</span> Lancer le tirage au sort officiel
          </button>
        ` : dep.methode === 'tour' && !scrutin.cloture ? `
          <button type="button" class="btn btn-primary" id="btn-trigger-second-tour">
            <span>🗳️</span> Organiser le second tour
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

function renderCorrigeDoubleColumn(results: ResultatsCalcul): string {
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
        <!-- Colonne 1 : Classement Brut -->
        <div class="ranking-column-box">
          <div class="ranking-column-header">
            <span>1. Classement brut (sans filtre)</span>
            <span class="badge badge-secondary">Voix directes</span>
          </div>
          <table class="results-table">
            <thead>
              <tr>
                <th>Rang</th>
                <th>Candidat(e)</th>
                <th>Voix</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              ${raw.map((c, idx) => `
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
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Colonne 2 : Classement Corrigé -->
        <div class="ranking-column-box corrected">
          <div class="ranking-column-header">
            <span>2. Classement corrigé officiel</span>
            <span class="badge badge-accent">Parité 1F + 1G</span>
          </div>
          <table class="results-table">
            <thead>
              <tr>
                <th>Rang</th>
                <th>Candidat(e)</th>
                <th>Statut</th>
                <th>Voix</th>
              </tr>
            </thead>
            <tbody>
              ${corr.map((c, idx) => `
                <tr class="${c.elu ? 'elected-row' : ''}">
                  <td><span class="rank-badge rank-${idx + 1}">${idx + 1}</span></td>
                  <td>
                    <div class="cand-name-cell">
                      <span class="sexe-icon ${c.candidat.sexe === 'F' ? 'sexe-f' : 'sexe-g'}">${c.candidat.sexe}</span>
                      <span>${c.candidat.prenom}</span>
                    </div>
                  </td>
                  <td>
                    ${c.elu
                      ? `<span class="badge badge-accent">🏆 ${c.mentionElu || 'Élu(e)'}</span>`
                      : '<span style="color: var(--text-muted); font-size: 0.85rem;">Non retenu(e)</span>'}
                  </td>
                  <td><strong>${c.voix}</strong> (${c.pct}%)</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Encadré explicatif -->
      <div class="correction-explanation-card" style="margin-top: 1rem;">
        <strong>💡 Explication de l'attribution paritaire :</strong>
        <p style="margin-top: 0.25rem;">${results.explicationCorrection || 'Le dépouillement déterminera la règle appliquée.'}</p>
      </div>
    </div>
  `;
}

function renderBinomesTable(results: ResultatsCalcul): string {
  const items = results.binomesResultats || [];
  const maxVoix = Math.max(...items.map(it => it.voix), 1);

  return `
    <div class="results-table-container">
      <table class="results-table">
        <thead>
          <tr>
            <th>Rang</th>
            <th>Binôme paritaire</th>
            <th>Voix</th>
            <th>Progression</th>
            <th>% Exprimés</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((b, idx) => {
            const barPct = Math.round((b.voix / maxVoix) * 100);
            return `
              <tr class="${b.elu ? 'elected-row' : ''}">
                <td><span class="rank-badge rank-${idx + 1}">${idx + 1}</span></td>
                <td>
                  <div class="cand-name-cell">
                    <span style="font-size: 1.1rem;">👫</span>
                    <span>${b.binome.nom || b.id}</span>
                  </div>
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-left: 1.7rem; display: flex; align-items: center; gap: 0.4rem; margin-top: 0.2rem;">
                    <span class="sexe-icon sexe-f" style="font-size: 0.7rem; padding: 0.05rem 0.35rem;">F</span> ${b.candidatFille.prenom} & 
                    <span class="sexe-icon sexe-g" style="font-size: 0.7rem; padding: 0.05rem 0.35rem;">G</span> ${b.candidatGarcon.prenom}
                  </div>
                </td>
                <td><strong style="font-size: 1.15rem;">${b.voix}</strong></td>
                <td>
                  <div class="score-bar-wrapper">
                    <div class="score-bar-track">
                      <div class="score-bar-fill" style="width: ${barPct}%;"></div>
                    </div>
                  </div>
                </td>
                <td><strong>${b.pct}%</strong></td>
                <td>
                  ${b.elu
                    ? `<span class="badge badge-accent">🏆 ${b.mentionElu || 'Élu'}</span>`
                    : results.secondTourRequis && (results.candidatsSecondTour || []).includes(b.id)
                    ? '<span class="badge badge-warning">⏳ Qualifié 2nd tour</span>'
                    : '<span style="color: var(--text-muted); font-size: 0.85rem;">En attente</span>'}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderUninominalTable(results: ResultatsCalcul): string {
  const items = results.candidatsResultats || [];
  const maxVoix = Math.max(...items.map(it => it.voix), 1);

  return `
    <div class="results-table-container">
      <table class="results-table">
        <thead>
          <tr>
            <th>Rang</th>
            <th>Candidat(e)</th>
            <th>Voix</th>
            <th>Progression</th>
            <th>% Exprimés</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((c, idx) => {
            const barPct = Math.round((c.voix / maxVoix) * 100);
            return `
              <tr class="${c.elu ? 'elected-row' : ''}">
                <td><span class="rank-badge rank-${idx + 1}">${idx + 1}</span></td>
                <td>
                  <div class="cand-name-cell">
                    <span class="sexe-icon ${c.candidat.sexe === 'F' ? 'sexe-f' : 'sexe-g'}">${c.candidat.sexe}</span>
                    <span>${c.candidat.prenom}</span>
                  </div>
                </td>
                <td><strong style="font-size: 1.15rem;">${c.voix}</strong></td>
                <td>
                  <div class="score-bar-wrapper">
                    <div class="score-bar-track">
                      <div class="score-bar-fill" style="width: ${barPct}%;"></div>
                    </div>
                  </div>
                </td>
                <td><strong>${c.pct}%</strong></td>
                <td>
                  ${c.elu
                    ? `<span class="badge badge-accent">🏆 ${c.mentionElu || 'Élu(e)'}</span>`
                    : results.secondTourRequis && (results.candidatsSecondTour || []).includes(c.id)
                    ? '<span class="badge badge-warning">⏳ Qualifié(e) 2nd tour</span>'
                    : '<span style="color: var(--text-muted); font-size: 0.85rem;">En attente</span>'}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderClassementTable(scrutin: Scrutin, results: ResultatsCalcul): string {
  const items = results.candidatsResultats || [];
  const isSTV = scrutin.config.sousMode === 'stv';

  return `
    <div>
      ${!isSTV ? `
        <div style="background: var(--primary-subtle); border-left: 4px solid var(--primary); border-radius: 0 var(--radius-md) var(--radius-md) 0; padding: 0.85rem 1.15rem; margin-bottom: 1.25rem;">
          <strong style="color: var(--primary); font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem;">
            <span>⚖️</span> Règle Borda : Vote pour ses 5 candidats préférés
          </strong>
          <p style="font-size: 0.88rem; color: var(--text-main); margin-top: 0.35rem; line-height: 1.5;">
            D'après la <a href="https://fr.wikipedia.org/wiki/M%C3%A9thode_Borda" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: underline; font-weight: 700;">méthode de Jean-Charles de Borda</a>, chaque électeur ordonne jusqu'à 5 candidats. Le barème accorde :
            <strong>1er = 5 pts</strong> • <strong>2e = 4 pts</strong> • <strong>3e = 3 pts</strong> • <strong>4e = 2 pts</strong> • <strong>5e = 1 pt</strong> (0 pt pour les non classés).
            Les points de tous les élèves sont additionnés pour désigner les vainqueurs du consensus.
          </p>
        </div>
      ` : ''}

      <div class="results-table-container">
        <table class="results-table">
          <thead>
            <tr>
              <th>Rang</th>
              <th>Candidat(e)</th>
              <th>${isSTV ? 'Voix finales' : 'Total Points Borda'}</th>
              <th>${isSTV ? '1ères préférences' : 'Détail des choix (1er à 5e)'}</th>
              <th>% des points</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((c, idx) => {
              const r = (results.matriceRangs && results.matriceRangs[c.id]) ? results.matriceRangs[c.id] : [0, 0, 0, 0, 0];
              const detailCalcul = !isSTV
                ? `${r[0] || 0}×5p + ${r[1] || 0}×4p + ${r[2] || 0}×3p + ${r[3] || 0}×2p + ${r[4] || 0}×1p`
                : `${c.voix} voix`;

              return `
                <tr class="${c.elu ? 'elected-row' : ''}">
                  <td><span class="rank-badge rank-${idx + 1}">${idx + 1}</span></td>
                  <td>
                    <div class="cand-name-cell">
                      <span class="sexe-icon ${c.candidat.sexe === 'F' ? 'sexe-f' : 'sexe-g'}">${c.candidat.sexe}</span>
                      <span>${c.candidat.prenom}</span>
                    </div>
                  </td>
                  <td>
                    <strong style="font-size: 1.2rem; color: var(--primary);">
                      ${isSTV ? c.voix : (c.points || 0) + ' pts'}
                    </strong>
                  </td>
                  <td>
                    <span style="font-size: 0.82rem; font-family: monospace; background: var(--bg-app); padding: 0.2rem 0.45rem; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                      ${detailCalcul}
                    </span>
                  </td>
                  <td><strong>${c.pct}%</strong></td>
                  <td>
                    ${c.elu
                      ? `<span class="badge badge-accent">🏆 ${c.mentionElu || 'Élu(e)'}</span>`
                      : '<span style="color: var(--text-muted); font-size: 0.85rem;">Non élu(e)</span>'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      ${!isSTV && results.matriceRangs ? `
        <div style="margin-top: 1.5rem; background: var(--bg-app); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <strong style="font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
              <span>📊</span> Matrice de décompte des 5 choix Borda
            </strong>
            <span style="font-size: 0.82rem; color: var(--text-muted);">
              Nombre de fois où chaque candidat a reçu chaque rang
            </span>
          </div>
          <table class="rank-matrix-table">
            <thead>
              <tr>
                <th style="text-align: left;">Candidat(e)</th>
                <th>1er choix<br><small style="color: var(--primary); font-weight: 700;">(× 5 pts)</small></th>
                <th>2e choix<br><small style="color: var(--primary); font-weight: 700;">(× 4 pts)</small></th>
                <th>3e choix<br><small style="color: var(--primary); font-weight: 700;">(× 3 pts)</small></th>
                <th>4e choix<br><small style="color: var(--primary); font-weight: 700;">(× 2 pts)</small></th>
                <th>5e choix<br><small style="color: var(--primary); font-weight: 700;">(× 1 pt)</small></th>
                <th style="background: var(--primary-subtle); color: var(--primary);">Total Points</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => {
                const ranks = results.matriceRangs![item.id] || [0, 0, 0, 0, 0];
                return `
                  <tr>
                    <td style="font-weight: 700; text-align: left;">
                      <span class="sexe-icon ${item.candidat.sexe === 'F' ? 'sexe-f' : 'sexe-g'}" style="margin-right: 0.35rem;">${item.candidat.sexe}</span>
                      ${item.candidat.prenom}
                    </td>
                    <td><strong>${ranks[0] || 0}</strong></td>
                    <td>${ranks[1] || 0}</td>
                    <td>${ranks[2] || 0}</td>
                    <td>${ranks[3] || 0}</td>
                    <td>${ranks[4] || 0}</td>
                    <td style="background: var(--primary-subtle); font-weight: 800; font-size: 1.05rem; color: var(--primary);">
                      ${item.points} pts
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      ${isSTV && results.stvDetails ? `
        <div style="margin-top: 1.5rem; background: var(--bg-app); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem;">
          <strong style="font-size: 0.95rem; display: block; margin-bottom: 0.5rem;">
            🔄 Déroulement des transferts STV (Quota de Droop : ${results.stvDetails.quota} voix)
          </strong>
          <div class="stv-step-timeline">
            ${results.stvDetails.etapes.map(step => `
              <div class="stv-step-card">
                <strong>Étape ${step.numero} (${step.action.toUpperCase()}) :</strong>
                <span>${step.description}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function attachLiveResultsEvents(
  container: HTMLElement,
  scrutin: Scrutin,
  _results: ResultatsCalcul,
  onOpenPV: () => void,
  onToggleProjection: () => void
) {
  const closeBtn = container.querySelector<HTMLButtonElement>('#btn-close-depouillement');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (confirm('Confirmez-vous la clôture du dépouillement et la proclamation des résultats ?')) {
        store.clotureDepouillement();
      }
    });
  }

  const viewPvBtn = container.querySelector<HTMLButtonElement>('#btn-view-pv');
  if (viewPvBtn) viewPvBtn.addEventListener('click', onOpenPV);

  const bannerPvBtn = container.querySelector<HTMLButtonElement>('#btn-banner-pv');
  if (bannerPvBtn) bannerPvBtn.addEventListener('click', onOpenPV);

  const projBtn = container.querySelector<HTMLButtonElement>('#btn-projection-mode');
  if (projBtn) projBtn.addEventListener('click', onToggleProjection);

  const launchTour2Btn = container.querySelector<HTMLButtonElement>('#btn-launch-tour-2');
  if (launchTour2Btn) {
    launchTour2Btn.addEventListener('click', () => {
      if (confirm('Voulez-vous créer le scrutin du second tour avec les candidats qualifiés ?')) {
        store.lancerSecondTour();
      }
    });
  }

  const triggerTourBtn = container.querySelector<HTMLButtonElement>('#btn-trigger-second-tour');
  if (triggerTourBtn) {
    triggerTourBtn.addEventListener('click', () => {
      store.lancerSecondTour();
    });
  }

  const lotteryBtn = container.querySelector<HTMLButtonElement>('#btn-trigger-lottery');
  if (lotteryBtn) {
    lotteryBtn.addEventListener('click', () => {
      // Déclenche le tirage avec animation
      store.executeTirageAuSort();
    });
  }

  // Export CSV
  const csvBtn = container.querySelector<HTMLButtonElement>('#btn-export-csv');
  if (csvBtn) {
    csvBtn.addEventListener('click', () => {
      const csv = store.exportCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `elections-cme-${scrutin.config.mode}-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Export JSON
  const jsonBtn = container.querySelector<HTMLButtonElement>('#btn-export-json');
  if (jsonBtn) {
    jsonBtn.addEventListener('click', () => {
      const json = store.exportJSON();
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scrutin-cme-${scrutin.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Import JSON
  const importBtn = container.querySelector<HTMLButtonElement>('#btn-import-json');
  const fileInput = container.querySelector<HTMLInputElement>('#file-import-json');
  if (importBtn && fileInput) {
    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            store.importJSON(content);
            alert('Scrutin importé avec succès !');
          } catch (err: any) {
            alert(err.message);
          }
        };
        reader.readAsText(file);
      }
    });
  }
}
