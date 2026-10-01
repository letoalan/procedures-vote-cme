/**
 * @module ui/modalityView
 * Rôle : affichage de la fiche pédagogique d'une modalité de vote.
 * Dépend de : content/types, app/store, ui/modalityCard.
 */

import { ModalityContent } from '../content/types.js';
import { store } from '../store.js';
import { renderAdultsHtml, renderKidsHtml } from './modalityCard.js';

export function renderModalityView(
  container: HTMLElement,
  data: ModalityContent,
  onTryMode: (mode: string, sousMode?: string) => void
): () => void {
  const audience = store.getAudience();
  const btnLabel = audience === 'kids' ? '<span>🚀</span> Essayer ce mode' : '<span>⚙️</span> Régler l\'élection avec ce mode';
  const bodyHtml = audience === 'kids' ? renderKidsHtml(data) : renderAdultsHtml(data);

  container.innerHTML = `
    <div class="modality-view-container">
      <div class="modality-hero">
        <div class="modality-hero-text">
          <span class="badge badge-primary">${data.tag}</span>
          <h2>${data.title}</h2>
          <p>${data.subtitle}</p>
        </div>
        <div class="modality-hero-actions">
          <button type="button" class="btn btn-primary btn-lg try-mode-btn">${btnLabel}</button>
        </div>
      </div>
      ${bodyHtml}
    </div>
  `;

  const tryBtn = container.querySelector('.try-mode-btn') as HTMLButtonElement | null;
  const handler = () => { onTryMode(data.mode, data.sousModeDefaut); };
  if (tryBtn) tryBtn.addEventListener('click', handler);

  return () => {
    if (tryBtn) tryBtn.removeEventListener('click', handler);
  };
}
