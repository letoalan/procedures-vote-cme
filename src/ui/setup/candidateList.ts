/**
 * @module ui/setup/candidateList
 * Rôle : affichage et édition dynamique de la liste des candidats de la classe.
 * Dépend de : core/types, app/store.
 */

import { Config, Sexe } from '../../core/types.js';
import { store } from '../../store.js';

export function renderCandidatsList(container: HTMLElement, config: Config, isLocked: boolean): void {
  const listContainer = container.querySelector<HTMLElement>('#candidats-list-container');
  if (!listContainer) return;

  listContainer.innerHTML = config.candidats.map((c, idx) => `
    <div class="candidat-edit-card" style="background: var(--bg-surface); border: 1px solid var(--border); border-left: 4px solid ${c.sexe === 'F' ? '#9333ea' : '#0d9488'}; border-radius: var(--radius-md); padding: 0.75rem; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; box-shadow: var(--shadow-sm);">
      <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1;">
        <span style="font-size: 0.8rem; font-weight: 800; color: var(--text-muted); width: 18px;">${idx + 1}.</span>
        <input type="text" class="cand-name-input" data-id="${c.id}" value="${c.prenom}" ${isLocked ? 'disabled' : ''} style="flex: 1; padding: 0.35rem 0.55rem; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.95rem; font-weight: 700;">
        <select class="cand-sexe-select" data-id="${c.id}" ${isLocked ? 'disabled' : ''} style="padding: 0.35rem; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 700;">
          <option value="F" ${c.sexe === 'F' ? 'selected' : ''}>Fille (F)</option>
          <option value="G" ${c.sexe === 'G' ? 'selected' : ''}>Garçon (G)</option>
        </select>
      </div>
      ${!isLocked && config.candidats.length > 2 ? `
        <button type="button" class="btn-remove-cand" data-id="${c.id}" title="Supprimer" style="border: none; background: transparent; color: var(--secondary); cursor: pointer; font-size: 1.1rem; padding: 0.2rem 0.4rem;">✕</button>
      ` : ''}
    </div>
  `).join('');

  listContainer.querySelectorAll<HTMLInputElement>('.cand-name-input').forEach(input => {
    input.addEventListener('change', () => {
      const cand = config.candidats.find(c => c.id === input.dataset.id);
      if (cand && input.value.trim()) {
        cand.prenom = input.value.trim();
        store.updateConfig({ candidats: [...config.candidats] });
      }
    });
  });

  listContainer.querySelectorAll<HTMLSelectElement>('.cand-sexe-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const cand = config.candidats.find(c => c.id === sel.dataset.id);
      if (cand) {
        cand.sexe = sel.value as Sexe;
        store.updateConfig({ candidats: [...config.candidats] });
      }
    });
  });

  listContainer.querySelectorAll<HTMLButtonElement>('.btn-remove-cand').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const updated = config.candidats.filter(c => c.id !== id);
      const updatedBinomes = (config.binomes || []).filter(b => b.fille !== id && b.garcon !== id);
      store.updateConfig({ candidats: updated, binomes: updatedBinomes });
      renderCandidatsList(container, store.getScrutin().config, isLocked);
    });
  });
}
