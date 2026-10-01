import { ModalityContent } from '../content/types.js';
import { store } from '../store.js';

export function renderModalityView(
  container: HTMLElement,
  data: ModalityContent,
  onTryMode: (mode: string, sousMode?: string) => void
) {
  const audience = store.getAudience();

  if (audience === 'kids') {
    const k = data.kids;
    container.innerHTML = `
      <div class="modality-view-container">
        <div class="modality-hero">
          <div class="modality-hero-text">
            <span class="badge badge-primary">${data.tag}</span>
            <h2>${data.title}</h2>
            <p>${data.subtitle}</p>
          </div>
          <div class="modality-hero-actions">
            <button type="button" class="btn btn-primary btn-lg try-mode-btn">
              <span>🚀</span> Essayer ce mode
            </button>
          </div>
        </div>

        <div class="modality-grid">
          <!-- Principe -->
          <div class="pedago-card">
            <div class="pedago-card-header">
              <div class="pedago-card-icon">💡</div>
              <h3>Le principe en classe</h3>
            </div>
            <div class="pedago-card-body">
              <p>${k.principe.trim()}</p>
            </div>
          </div>

          <!-- Comment voter -->
          <div class="pedago-card">
            <div class="pedago-card-header">
              <div class="pedago-card-icon">🗳️</div>
              <h3>Comment voter dans l’isoloir</h3>
            </div>
            <div class="pedago-card-body">
              <ul class="pedago-list steps">
                ${k.commentVoter.map(step => `<li>${step}</li>`).join('')}
              </ul>
            </div>
          </div>

          <!-- Qui gagne -->
          <div class="pedago-card">
            <div class="pedago-card-header">
              <div class="pedago-card-icon">🏆</div>
              <h3>Qui gagne l’élection ?</h3>
            </div>
            <div class="pedago-card-body">
              <p>${k.quiGagne.trim()}</p>
              <div class="example-highlight-box" style="margin-top: 0.75rem;">
                <strong>⚖️ En cas d'égalité :</strong>
                <p>${k.egalite.trim()}</p>
              </div>
            </div>
          </div>

          <!-- Pour et Attention -->
          <div class="pedago-card">
            <div class="pedago-card-header">
              <div class="pedago-card-icon">⭐</div>
              <h3>Ce qu'on aime / À quoi faire attention</h3>
            </div>
            <div class="pedago-card-body">
              <strong style="color: var(--accent); font-size: 0.9rem;">Ce qui est super :</strong>
              <ul class="pedago-list" style="margin: 0.35rem 0 0.85rem 0;">
                ${k.pointsForts.map(pt => `<li>${pt}</li>`).join('')}
              </ul>
              <strong style="color: var(--warning); font-size: 0.9rem;">À ne pas oublier :</strong>
              <ul class="pedago-list warning" style="margin-top: 0.35rem;">
                ${k.pointsAttention.map(pt => `<li>${pt}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>

        <!-- Exemple concret -->
        <div class="pedago-card" style="border-left: 5px solid var(--primary-light);">
          <div class="pedago-card-header">
            <div class="pedago-card-icon">📝</div>
            <h3>Exemple en direct pour bien comprendre</h3>
          </div>
          <div class="pedago-card-body">
            <p style="font-size: 1.05rem; font-weight: 500;">${k.exempleSimple}</p>
          </div>
        </div>
      </div>
    `;
  } else {
    // Audience === 'adults'
    const a = data.adults;
    container.innerHTML = `
      <div class="modality-view-container">
        <div class="modality-hero">
          <div class="modality-hero-text">
            <span class="badge badge-primary">${data.tag}</span>
            <h2>${data.title}</h2>
            <p>${data.subtitle}</p>
          </div>
          <div class="modality-hero-actions">
            <button type="button" class="btn btn-primary btn-lg try-mode-btn">
              <span>⚙️</span> Régler l'élection avec ce mode
            </button>
          </div>
        </div>

        <div class="modality-grid">
          <!-- Définition institutionnelle -->
          <div class="pedago-card">
            <div class="pedago-card-header">
              <div class="pedago-card-icon">📜</div>
              <h3>Cadre électoral & Principe juridique</h3>
            </div>
            <div class="pedago-card-body">
              <p>${a.principe.trim()}</p>
            </div>
          </div>

          <!-- Modalités de vote & Nullité -->
          <div class="pedago-card">
            <div class="pedago-card-header">
              <div class="pedago-card-icon">🗳️</div>
              <h3>Forme du bulletin & Validité du vote</h3>
            </div>
            <div class="pedago-card-body">
              <ul class="pedago-list steps">
                ${a.commentVoter.map(step => `<li>${step}</li>`).join('')}
              </ul>
              <strong style="color: var(--secondary); font-size: 0.85rem; display: block; margin-top: 0.75rem;">Causes de nullité :</strong>
              <ul class="pedago-list warning" style="margin-top: 0.35rem;">
                ${a.causesNullite.map(cause => `<li>${cause}</li>`).join('')}
              </ul>
            </div>
          </div>

          <!-- Règles de majorité & Départage -->
          <div class="pedago-card">
            <div class="pedago-card-header">
              <div class="pedago-card-icon">📊</div>
              <h3>Attribution des sièges & Majorités</h3>
            </div>
            <div class="pedago-card-body">
              <p>${a.quiGagne.trim()}</p>
              <div class="example-highlight-box" style="margin-top: 0.75rem;">
                <strong>Règle formelle :</strong> ${a.reglesMajorite}<br>
                <strong>Départage :</strong> ${a.egalite.trim()}
              </div>
            </div>
          </div>

          <!-- Analyse comparative & Parité -->
          <div class="pedago-card">
            <div class="pedago-card-header">
              <div class="pedago-card-icon">⚖️</div>
              <h3>Atouts, Limites & Effet sur la Parité</h3>
            </div>
            <div class="pedago-card-body">
              <strong style="color: var(--accent); font-size: 0.85rem;">Points forts :</strong>
              <ul class="pedago-list" style="margin: 0.25rem 0 0.65rem 0;">
                ${a.atouts.map(pt => `<li>${pt}</li>`).join('')}
              </ul>
              <strong style="color: var(--warning); font-size: 0.85rem;">Limites / Vigilances :</strong>
              <ul class="pedago-list warning" style="margin: 0.25rem 0 0.65rem 0;">
                ${a.limites.map(pt => `<li>${pt}</li>`).join('')}
              </ul>
              <div class="example-highlight-box" style="margin-top: 0.5rem;">
                <strong>Impact paritaire :</strong> ${a.impactParite}
              </div>
            </div>
          </div>
        </div>

        <!-- Checklist Jour J -->
        <div class="pedago-card" style="border-left: 5px solid var(--primary);">
          <div class="pedago-card-header">
            <div class="pedago-card-icon">📋</div>
            <h3>Check-list du jour J (Organisation du bureau de vote)</h3>
          </div>
          <div class="pedago-card-body">
            <ul class="pedago-list">
              ${a.checklistJourJ.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // Action du bouton "Essayer ce mode"
  const tryBtn = container.querySelector<HTMLButtonElement>('.try-mode-btn');
  if (tryBtn) {
    tryBtn.addEventListener('click', () => {
      onTryMode(data.mode, data.sousModeDefaut);
    });
  }
}
