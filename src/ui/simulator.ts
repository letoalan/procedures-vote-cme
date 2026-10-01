/**
 * @module ui/simulator
 * Rôle : affichage de l'outil pédagogique « Et si... ? » comparant les 4 modes de scrutin.
 * Dépend de : core/types, engine, ui/simulatorScenarios.
 */

import { computeScenarioComparison, simulatorPresets } from './simulatorScenarios.js';

export function renderSimulatorTab(container: HTMLElement): () => void {
  let activeScenarioIndex = 0;

  function update() {
    const sc = simulatorPresets[activeScenarioIndex];
    const { elusUni, elusCorr, elusBorda, elusBin } = computeScenarioComparison(sc);

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div class="presentation-hero" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);">
          <h2>🔮 Le Simulateur « Et si... ? »</h2>
          <p>Sur une <strong>même classe</strong> avec les <strong>mêmes bulletins</strong>, découvrez comment la règle du jeu change les élus !</p>
        </div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          ${simulatorPresets.map((preset, idx) => `
            <button type="button" class="btn ${idx === activeScenarioIndex ? 'btn-primary' : 'btn-secondary'} btn-scenario" data-index="${idx}">
              <span>${idx === 0 ? '⚖️' : '🤝'}</span> ${preset.name}
            </button>
          `).join('')}
        </div>
        <div class="notice-box"><strong>Description du cas :</strong> ${sc.desc}</div>
        <div class="simulator-comparison-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
          <div class="simu-card" style="border-top: 4px solid #3b82f6; background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
            <h4>1. Binômes paritaires</h4>
            <div style="margin: 0.5rem 0; font-size: 0.85rem; color: var(--text-muted);">Ticket mixte fille-garçon</div>
            <div style="font-size: 1.05rem; font-weight: 800; color: var(--primary);">${elusBin.join('<br>') || 'Aucun'}</div>
            <p style="font-size: 0.8rem; margin-top: 0.5rem;">Parité 100% garantie dès le dépôt de candidature.</p>
          </div>
          <div class="simu-card" style="border-top: 4px solid #10b981; background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
            <h4>2. Uninominal (2 sièges)</h4>
            <div style="margin: 0.5rem 0; font-size: 0.85rem; color: var(--text-muted);">2 premiers élus sans filtre</div>
            <div style="font-size: 1.05rem; font-weight: 800; color: #10b981;">${elusUni.join('<br>') || 'Aucun'}</div>
            <p style="font-size: 0.8rem; margin-top: 0.5rem;">Reflète les voix individuelles directes, sans filtre paritaire.</p>
          </div>
          <div class="simu-card" style="border-top: 4px solid #f59e0b; background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
            <h4>3. Classement Borda</h4>
            <div style="margin: 0.5rem 0; font-size: 0.85rem; color: var(--text-muted);">5 choix pondérés (5 à 1 pts)</div>
            <div style="font-size: 1.05rem; font-weight: 800; color: #f59e0b;">${elusBorda.join('<br>') || 'Aucun'}</div>
            <p style="font-size: 0.8rem; margin-top: 0.5rem;">Favorise le compromis et les candidats largement acceptés.</p>
          </div>
          <div class="simu-card" style="border-top: 4px solid #ec4899; background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
            <h4>4. Classement corrigé</h4>
            <div style="margin: 0.5rem 0; font-size: 0.85rem; color: var(--text-muted);">Parité au 2e siège (seuil 25%)</div>
            <div style="font-size: 1.05rem; font-weight: 800; color: #ec4899;">${elusCorr.join('<br>') || 'Aucun'}</div>
            <p style="font-size: 0.8rem; margin-top: 0.5rem;">Assure la parité F+G si la candidate atteint 25% des voix.</p>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll<HTMLButtonElement>('.btn-scenario').forEach(btn => {
      btn.addEventListener('click', () => {
        activeScenarioIndex = parseInt(btn.dataset.index || '0', 10);
        update();
      });
    });
  }

  update();
  return () => {};
}
