/**
 * @module ui/setup/setupForm
 * Rôle : formulaire de paramétrage général du scrutin (modalité, classe, règles).
 * Dépend de : core/types, app/store, ui/setup/candidateList, ui/setup/binomeBuilder.
 */

import { Mode } from '../../core/types.js';
import { getDefaultConfig, store } from '../../store.js';
import { renderCandidatsList } from './candidateList.js';
import { renderBinomesList } from './binomeBuilder.js';

export function renderSetupForm(container: HTMLElement, onStartDepouillement: () => void): () => void {
  const scrutin = store.getScrutin();
  const config = scrutin.config;
  const isLocked = !!scrutin.debut && scrutin.bulletins.length > 0;

  const modeLabels: Record<Mode, string> = {
    binome: '1. Binômes paritaires (F+G)',
    uninominal: '2. Scrutin uninominal (2 sièges)',
    classement: '3. Vote par classement préférentiel',
    corrige: '4. Vote unique avec classement corrigé (Parité)'
  };

  container.innerHTML = `
    <div class="setup-form-wrapper" style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm);">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;"><span>⚙️</span> Paramètres de l'élection</h3>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 0.2rem;">
            ${isLocked
              ? `<span class="badge badge-warning">🔒 Paramètres verrouillés</span> (${scrutin.bulletins.length} bulletin(s) dépouillé(s))`
              : 'Configurez la classe, les candidats et les règles avant d\'ouvrir le dépouillement.'}
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          ${!isLocked ? `
            <button type="button" class="btn btn-secondary" id="btn-load-demo" style="font-size: 0.85rem; padding: 0.45rem 0.85rem;"><span>🎲</span> Exemple classe</button>
            <button type="button" class="btn btn-primary" id="btn-start-count"><span>🚀</span> Commencer le dépouillement</button>
          ` : `
            <button type="button" class="btn btn-danger" id="btn-reset-election" style="font-size: 0.85rem; padding: 0.45rem 0.85rem;"><span>🔄</span> Réinitialiser le scrutin</button>
          `}
        </div>
      </div>
      <form id="election-setup-form" style="${isLocked ? 'pointer-events: none; opacity: 0.7;' : ''}">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 1.25rem;">
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.4rem;">Modalité de scrutin</label>
            <select id="setup-mode" class="form-control" style="width: 100%; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 0.95rem; font-weight: 600;">
              ${Object.entries(modeLabels).map(([m, label]) => `<option value="${m}" ${config.mode === m ? 'selected' : ''}>${label}</option>`).join('')}
            </select>
          </div>
          <div id="submode-container"></div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.25rem; background: var(--bg-app); padding: 1rem; border-radius: var(--radius-md);">
          <div><label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.3rem;">École</label><input type="text" id="setup-ecole" value="${config.ecole || ''}" class="form-control"></div>
          <div><label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.3rem;">Classe</label><input type="text" id="setup-classe" value="${config.classe || ''}" class="form-control"></div>
          <div><label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.3rem;">Inscrits</label><input type="number" id="setup-inscrits" value="${config.inscrits}" min="1" max="100" class="form-control"></div>
          <div><label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.3rem;">Départage</label>
            <select id="setup-departage" class="form-control">
              <option value="tirage" ${config.departage === 'tirage' ? 'selected' : ''}>Tirage au sort (scellé)</option>
              <option value="age" ${config.departage === 'age' ? 'selected' : ''}>Au plus jeune</option>
              <option value="tour" ${config.departage === 'tour' ? 'selected' : ''}>Second tour</option>
            </select>
          </div>
        </div>
        <div style="margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <label style="font-size: 1rem; font-weight: 800;"><span>👥</span> Liste des candidats (${config.candidats.length})</label>
            ${!isLocked ? `<button type="button" class="btn btn-secondary" id="btn-add-candidat" style="font-size: 0.85rem; padding: 0.35rem 0.75rem;"><span>➕</span> Ajouter un candidat</button>` : ''}
          </div>
          <div id="candidats-list-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.75rem;"></div>
        </div>
        <div id="binomes-section" style="${config.mode === 'binome' ? 'display: block;' : 'display: none;'} margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <label style="font-size: 1rem; font-weight: 800;"><span>👫</span> Constitution des binômes paritaires F+G</label>
            ${!isLocked ? `<button type="button" class="btn btn-secondary" id="btn-add-binome" style="font-size: 0.85rem; padding: 0.35rem 0.75rem;"><span>➕</span> Créer un binôme</button>` : ''}
          </div>
          <div id="binomes-list-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 0.75rem;"></div>
        </div>
      </form>
    </div>
  `;

  renderCandidatsList(container, config, isLocked);
  if (config.mode === 'binome') renderBinomesList(container, config, isLocked);

  const startBtn = container.querySelector<HTMLButtonElement>('#btn-start-count');
  if (startBtn) startBtn.addEventListener('click', () => { store.startDepouillement(); onStartDepouillement(); });

  const resetBtn = container.querySelector<HTMLButtonElement>('#btn-reset-election');
  if (resetBtn) resetBtn.addEventListener('click', () => { if (confirm('Réinitialiser l\'élection ?')) store.resetScrutin(); });

  const demoBtn = container.querySelector<HTMLButtonElement>('#btn-load-demo');
  if (demoBtn) demoBtn.addEventListener('click', () => { store.resetScrutin(getDefaultConfig()); });

  const modeSelect = container.querySelector<HTMLSelectElement>('#setup-mode');
  if (modeSelect) modeSelect.addEventListener('change', () => { store.updateConfig({ mode: modeSelect.value as Mode }); });

  const inscritsInput = container.querySelector<HTMLInputElement>('#setup-inscrits');
  if (inscritsInput) inscritsInput.addEventListener('change', () => { store.updateConfig({ inscrits: parseInt(inscritsInput.value, 10) || 23 }); });

  const addCandBtn = container.querySelector<HTMLButtonElement>('#btn-add-candidat');
  if (addCandBtn) addCandBtn.addEventListener('click', () => {
    const newCand = { id: `c-${Date.now()}`, prenom: `Candidat ${config.candidats.length + 1}`, sexe: 'F' as const };
    store.updateConfig({ candidats: [...config.candidats, newCand] });
  });

  return () => {};
}
