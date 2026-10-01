/**
 * @module ui/setup/binomeBuilder
 * Rôle : constitution et contrôle de mixité des binômes paritaires (Fille + Garçon).
 * Dépend de : core/types, app/store.
 */

import { Config } from '../../core/types.js';
import { store } from '../../store.js';

export function renderBinomesList(container: HTMLElement, config: Config, isLocked: boolean): void {
  const binomesContainer = container.querySelector<HTMLElement>('#binomes-list-container');
  if (!binomesContainer) return;

  const filles = config.candidats.filter(c => c.sexe === 'F');
  const garcons = config.candidats.filter(c => c.sexe === 'G');
  const binomes = config.binomes || [];

  binomesContainer.innerHTML = binomes.map((b, idx) => `
    <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 0.85rem; display: flex; flex-direction: column; gap: 0.5rem; box-shadow: var(--shadow-sm);">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 700; font-size: 0.9rem;">Binôme n°${idx + 1}</span>
        ${!isLocked && binomes.length > 1 ? `
          <button type="button" class="btn-remove-binome" data-id="${b.id}" style="border: none; background: transparent; color: var(--secondary); cursor: pointer; font-size: 1rem;">✕</button>
        ` : ''}
      </div>
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <select class="binome-fille-select" data-id="${b.id}" ${isLocked ? 'disabled' : ''} style="flex: 1; padding: 0.4rem; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem;">
          ${filles.map(f => `<option value="${f.id}" ${b.fille === f.id ? 'selected' : ''}>Fille : ${f.prenom}</option>`).join('')}
        </select>
        <span style="font-weight: 800; color: var(--text-muted);">&</span>
        <select class="binome-garcon-select" data-id="${b.id}" ${isLocked ? 'disabled' : ''} style="flex: 1; padding: 0.4rem; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem;">
          ${garcons.map(g => `<option value="${g.id}" ${b.garcon === g.id ? 'selected' : ''}>Garçon : ${g.prenom}</option>`).join('')}
        </select>
      </div>
    </div>
  `).join('');

  binomesContainer.querySelectorAll<HTMLSelectElement>('.binome-fille-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const b = (config.binomes || []).find(it => it.id === sel.dataset.id);
      if (b) {
        b.fille = sel.value;
        const fCand = config.candidats.find(c => c.id === b.fille);
        const gCand = config.candidats.find(c => c.id === b.garcon);
        b.nom = `${fCand?.prenom || 'Fille'} & ${gCand?.prenom || 'Garçon'}`;
        store.updateConfig({ binomes: [...(config.binomes || [])] });
      }
    });
  });

  binomesContainer.querySelectorAll<HTMLSelectElement>('.binome-garcon-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const b = (config.binomes || []).find(it => it.id === sel.dataset.id);
      if (b) {
        b.garcon = sel.value;
        const fCand = config.candidats.find(c => c.id === b.fille);
        const gCand = config.candidats.find(c => c.id === b.garcon);
        b.nom = `${fCand?.prenom || 'Fille'} & ${gCand?.prenom || 'Garçon'}`;
        store.updateConfig({ binomes: [...(config.binomes || [])] });
      }
    });
  });

  binomesContainer.querySelectorAll<HTMLButtonElement>('.btn-remove-binome').forEach(btn => {
    btn.addEventListener('click', () => {
      const updated = (config.binomes || []).filter(b => b.id !== btn.dataset.id);
      store.updateConfig({ binomes: updated });
      renderBinomesList(container, store.getScrutin().config, isLocked);
    });
  });
}
