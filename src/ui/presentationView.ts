import { presentationContent } from '../content/presentation.js';
import { store } from '../store.js';

export function renderPresentationView(container: HTMLElement, onSelectTab: (tabId: string) => void) {
  const audience = store.getAudience();
  const p = presentationContent[audience];

  container.innerHTML = `
    <div class="presentation-container">
      <div class="presentation-hero">
        <h2>${p.heroTitle}</h2>
        <p>${p.heroSubtitle}</p>
      </div>

      <!-- Cadre Civique / CME -->
      <div class="pedago-card">
        <div class="pedago-card-header">
          <div class="pedago-card-icon">🏛️</div>
          <h3>${p.missionTitle}</h3>
        </div>
        <div class="pedago-card-body">
          ${p.missionHtml}
        </div>
      </div>

      <!-- Les 4 étapes du vote -->
      <div>
        <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>🗳️</span> ${p.stepsTitle}
        </h3>
        <div class="steps-cards-grid">
          ${p.steps.map(step => `
            <div class="step-card">
              <div class="step-number">${step.num}</div>
              <div class="step-content">
                <h4>${step.title}</h4>
                <p>${step.text}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Résumé des 4 modalités avec boutons d'accès direct -->
      <div>
        <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>⚖️</span> ${p.modalitiesIntro}
        </h3>
        <div class="modalities-summary-grid">
          ${p.modalitiesSummary.map(m => `
            <div class="modality-summary-card">
              <div>
                <h4>${m.name}</h4>
                <p style="margin-top: 0.5rem;">${m.desc}</p>
              </div>
              <button type="button" class="btn btn-secondary btn-goto-tab" data-tab="${m.id}" style="width: 100%;">
                <span>🔍</span> Découvrir cette règle
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Bannière d'accès direct au dépouillement -->
      <div style="background: linear-gradient(135deg, var(--bg-surface), var(--primary-subtle)); border: 2px solid var(--primary-light); border-radius: var(--radius-lg); padding: 1.5rem 2rem; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap;">
        <div>
          <h4 style="font-size: 1.25rem; font-weight: 800;">Prêt à compter les voix du bureau de vote ?</h4>
          <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.25rem;">
            Ouvrez l'outil de dépouillement interactif : grand affichage TNI, saisie tactile des bulletins, et impression immédiate du PV officiel.
          </p>
        </div>
        <button type="button" class="btn btn-primary btn-lg" id="btn-goto-depouillement">
          <span>🗳️</span> Ouvrir le Dépouillement
        </button>
      </div>
    </div>
  `;

  // Attach button events
  container.querySelectorAll<HTMLButtonElement>('.btn-goto-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      if (targetTab) onSelectTab(targetTab);
    });
  });

  const depouillementBtn = container.querySelector<HTMLButtonElement>('#btn-goto-depouillement');
  if (depouillementBtn) {
    depouillementBtn.addEventListener('click', () => {
      onSelectTab('tab-depouillement');
    });
  }
}
