/**
 * @module ui/ballot
 * Rôle : gestionnaire principal de saisie des bulletins (clic TNI, virtuel classé, totaux).
 * Dépend de : core/types, app/store, ui/ballot/choiceInput, ui/ballot/rankInput, ui/ballot/shortcuts.
 */

import { Scrutin } from '../../core/types.js';
import { store } from '../../store.js';
import { renderChoiceButtonsHtml, renderWhiteAndNullButtonsHtml } from './choiceInput.js';
import { renderRankingHtml } from './rankInput.js';
import { setupKeyboardShortcuts } from './shortcuts.js';

export class BallotInputManager {
  private container: HTMLElement;
  private currentRanking: string[] = [];
  private isTotalsMode = false;
  private cleanupShortcuts?: () => void;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public render(scrutin: Scrutin): () => void {
    const { config } = scrutin;
    const isClosed = !!scrutin.cloture;
    const totalCount = scrutin.bulletins.length;
    const isFull = totalCount >= config.inscrits;
    const disabled = isClosed || isFull;

    this.container.innerHTML = `
      <div class="input-ballot-panel">
        <div class="panel-header">
          <h4><span>📥</span> Saisie des bulletins en direct</h4>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <button type="button" class="btn btn-secondary" id="btn-toggle-totals" style="font-size: 0.8rem; padding: 0.35rem 0.65rem;">
              <span>🔢</span> ${this.isTotalsMode ? 'Mode Clic par clic' : 'Saisie directe des totaux'}
            </button>
            <button type="button" class="btn btn-secondary" id="btn-undo-ballot" ${totalCount === 0 || isClosed ? 'disabled' : ''} style="font-size: 0.85rem; padding: 0.35rem 0.75rem;">
              <span>↩️</span> Annuler (Ctrl+Z)
            </button>
          </div>
        </div>
        ${isClosed ? `
          <div style="background: var(--accent-subtle); border: 1px solid var(--accent); border-radius: var(--radius-md); padding: 1rem; text-align: center; color: var(--accent);">
            <strong>🔒 Dépouillement clôturé.</strong> Les résultats finaux sont proclamés.
            <div style="margin-top: 0.5rem;"><button type="button" class="btn btn-secondary" id="btn-reopen-election" style="font-size: 0.85rem;">🔓 Rouvrir la saisie</button></div>
          </div>
        ` : isFull ? `
          <div style="background: var(--warning-subtle); border: 1px solid var(--warning); border-radius: var(--radius-md); padding: 0.85rem 1rem; color: #92400e; font-size: 0.92rem;">
            ⚠️ <strong>Tous les élèves ont voté !</strong> (${totalCount} / ${config.inscrits} inscrits). Plafond légal atteint.
          </div>
        ` : ''}

        ${config.mode === 'classement'
          ? renderRankingHtml(config, this.currentRanking, disabled)
          : `<div class="tni-buttons-grid">${renderChoiceButtonsHtml(config, disabled)}${renderWhiteAndNullButtonsHtml(disabled)}</div>`}

        <div class="recent-ballots-log">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>Journal d'émargement (${totalCount} bulletin${totalCount > 1 ? 's' : ''})</strong>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Derniers bulletins saisis</span>
          </div>
          <ul class="recent-ballots-list">
            ${scrutin.bulletins.length === 0 ? '<li style="color: var(--text-muted); font-style: italic;">Aucun bulletin dépouillé.</li>' : scrutin.bulletins.slice(-5).reverse().map((b, idx) => `
              <li><span>#${totalCount - idx} — ${b.type === 'blanc' ? '⚪ Blanc' : b.type === 'nul' ? '❌ Nul' : b.type === 'choix' ? (config.candidats.find(c => c.id === b.cible)?.prenom || b.cible) : b.ordre.join(' > ')}</span><span style="color: var(--text-muted);">${new Date(b.t).toLocaleTimeString()}</span></li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;

    this.attachEvents(scrutin, disabled);
    if (this.cleanupShortcuts) this.cleanupShortcuts();
    this.cleanupShortcuts = setupKeyboardShortcuts(scrutin, disabled, () => { store.undoLastBulletin(); });

    return () => {
      if (this.cleanupShortcuts) this.cleanupShortcuts();
    };
  }

  private attachEvents(scrutin: Scrutin, disabled: boolean): void {
    const undoBtn = this.container.querySelector<HTMLButtonElement>('#btn-undo-ballot');
    if (undoBtn) undoBtn.addEventListener('click', () => store.undoLastBulletin());

    const reopenBtn = this.container.querySelector<HTMLButtonElement>('#btn-reopen-election');
    if (reopenBtn) reopenBtn.addEventListener('click', () => store.rouvrirDepouillement());

    if (disabled) return;

    // Boutons de choix direct
    this.container.querySelectorAll<HTMLButtonElement>('.tni-vote-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        if (type === 'blanc') store.addBulletin({ type: 'blanc' });
        else if (type === 'nul') store.addBulletin({ type: 'nul' });
        else if (type === 'choix' && btn.dataset.cible) store.addBulletin({ type: 'choix', cible: btn.dataset.cible });
      });
    });

    // Classement
    this.container.querySelectorAll<HTMLButtonElement>('.btn-rank-pick').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (id && !this.currentRanking.includes(id)) {
          this.currentRanking.push(id);
          this.render(scrutin);
        }
      });
    });

    const validateRankBtn = this.container.querySelector<HTMLButtonElement>('#btn-validate-rank');
    if (validateRankBtn) {
      validateRankBtn.addEventListener('click', () => {
        if (this.currentRanking.length > 0) {
          store.addBulletin({ type: 'rang', ordre: [...this.currentRanking] });
          this.currentRanking = [];
          this.render(store.getScrutin());
        }
      });
    }

    const clearRankBtn = this.container.querySelector<HTMLButtonElement>('#btn-clear-rank');
    if (clearRankBtn) {
      clearRankBtn.addEventListener('click', () => {
        this.currentRanking = [];
        this.render(scrutin);
      });
    }

    const blancRankBtn = this.container.querySelector<HTMLButtonElement>('#btn-rank-blanc');
    if (blancRankBtn) blancRankBtn.addEventListener('click', () => { store.addBulletin({ type: 'blanc' }); });

    const nulRankBtn = this.container.querySelector<HTMLButtonElement>('#btn-rank-nul');
    if (nulRankBtn) nulRankBtn.addEventListener('click', () => { store.addBulletin({ type: 'nul' }); });
  }
}

export * from './choiceInput.js';
export * from './rankInput.js';
export * from './shortcuts.js';
