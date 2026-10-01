import { Audience } from '../content/types.js';
import { store } from '../store.js';

export function renderAudienceToggle(container: HTMLElement) {
  const currentAudience = store.getAudience();

  container.innerHTML = `
    <div class="audience-toggle-container" role="radiogroup" aria-label="Choisir le niveau d'explication">
      <button type="button" class="audience-btn ${currentAudience === 'kids' ? 'active' : ''}" data-audience="kids" role="radio" aria-checked="${currentAudience === 'kids'}">
        <span>🎒</span> Élèves
      </button>
      <button type="button" class="audience-btn ${currentAudience === 'adults' ? 'active' : ''}" data-audience="adults" role="radio" aria-checked="${currentAudience === 'adults'}">
        <span>🎓</span> Adultes
      </button>
    </div>
  `;

  const buttons = container.querySelectorAll<HTMLButtonElement>('.audience-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetAudience = btn.dataset.audience as Audience;
      if (targetAudience && targetAudience !== store.getAudience()) {
        store.setAudience(targetAudience);
      }
    });
  });
}
