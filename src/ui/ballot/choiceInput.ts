/**
 * @module ui/ballot/choiceInput
 * Rôle : boutons tactiles grand format (TNI) pour le vote uninominal, binôme ou corrigé.
 * Dépend de : core/types.
 */

import { Config } from '../../core/types.js';

export function renderChoiceButtonsHtml(config: Config, disabled: boolean): string {
  if (config.mode === 'binome') {
    const binomes = config.binomes || [];
    return binomes.map((b, idx) => `
      <button type="button" class="tni-vote-btn" data-cible="${b.id}" data-type="choix" ${disabled ? 'disabled' : ''}>
        <span class="shortcut-key">${idx + 1}</span>
        <span style="font-size: 1.15rem; font-weight: 800;">${b.nom || b.id}</span>
        <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">Binôme paritaire F+G</span>
      </button>
    `).join('');
  }

  return config.candidats.map((c, idx) => `
    <button type="button" class="tni-vote-btn ${c.sexe === 'F' ? 'tni-btn-sexe-f' : 'tni-btn-sexe-g'}" data-cible="${c.id}" data-type="choix" ${disabled ? 'disabled' : ''}>
      <span class="shortcut-key">${idx + 1}</span>
      <span style="font-size: 1.25rem; font-weight: 800;">${c.prenom}</span>
      <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; display: inline-flex; align-items: center; gap: 0.35rem;">
        <span class="sexe-icon ${c.sexe === 'F' ? 'sexe-f' : 'sexe-g'}" style="font-size: 0.72rem; padding: 0.1rem 0.4rem;">${c.sexe}</span>
        ${c.sexe === 'F' ? 'Fille' : 'Garçon'}
      </span>
    </button>
  `).join('');
}

export function renderWhiteAndNullButtonsHtml(disabled: boolean): string {
  return `
    <div style="grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.5rem;">
      <button type="button" class="tni-vote-btn tni-btn-blanc" data-type="blanc" ${disabled ? 'disabled' : ''}>
        <span class="shortcut-key">B</span>
        <span style="font-size: 1.1rem; font-weight: 800;">⚪ Bulletin Blanc</span>
      </button>
      <button type="button" class="tni-vote-btn tni-btn-nul" data-type="nul" ${disabled ? 'disabled' : ''}>
        <span class="shortcut-key">N</span>
        <span style="font-size: 1.1rem; font-weight: 800;">❌ Bulletin Nul</span>
      </button>
    </div>
  `;
}
