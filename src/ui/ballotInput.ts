import { Bulletin, Scrutin } from '../engine/types.js';
import { store } from '../store.js';

export class BallotInputManager {
  private container: HTMLElement;
  private currentRanking: string[] = []; // Pour le mode classement
  private isTotalsMode: boolean = false;
  private keydownListener?: (e: KeyboardEvent) => void;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public render(scrutin: Scrutin) {
    const config = scrutin.config;
    const isClosed = !!scrutin.cloture;
    const totalCount = scrutin.bulletins.length;
    const isFull = totalCount >= config.inscrits;

    this.container.innerHTML = `
      <div class="input-ballot-panel">
        <div class="panel-header">
          <h4>
            <span>📥</span> Saisie des bulletins en direct
          </h4>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <button type="button" class="btn btn-secondary" id="btn-toggle-totals" style="font-size: 0.8rem; padding: 0.35rem 0.65rem;">
              <span>🔢</span> ${this.isTotalsMode ? 'Mode Clic par clic' : 'Saisie directe des totaux'}
            </button>
            <button type="button" class="btn btn-secondary" id="btn-undo-ballot" ${totalCount === 0 || isClosed ? 'disabled' : ''} title="Annuler le dernier bulletin (Ctrl+Z)" style="font-size: 0.85rem; padding: 0.35rem 0.75rem;">
              <span>↩️</span> Annuler (Ctrl+Z)
            </button>
          </div>
        </div>

        ${isClosed ? `
          <div style="background: var(--accent-subtle); border: 1px solid var(--accent); border-radius: var(--radius-md); padding: 1rem; text-align: center; color: var(--accent);">
            <strong>🔒 Dépouillement clôturé.</strong> Les résultats finaux sont proclamés.
            <div style="margin-top: 0.5rem;">
              <button type="button" class="btn btn-secondary" id="btn-reopen-election" style="font-size: 0.85rem;">
                🔓 Rouvrir la saisie
              </button>
            </div>
          </div>
        ` : isFull ? `
          <div style="background: var(--warning-subtle); border: 1px solid var(--warning); border-radius: var(--radius-md); padding: 0.85rem 1rem; color: #92400e; font-size: 0.92rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>⚠️</span>
            <div>
              <strong>Tous les élèves ont voté !</strong> (${totalCount} / ${config.inscrits} inscrits). Le plafond légal d'inscrits est atteint.
            </div>
          </div>
        ` : ''}

        ${this.isTotalsMode ? this.renderTotalsForm(scrutin) : this.renderClickInterface(scrutin, isClosed || isFull)}

        <!-- Historique récent -->
        <div class="recent-ballots-log">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>Journal d'émargement (${totalCount} bulletin${totalCount > 1 ? 's' : ''})</strong>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Derniers bulletins saisis</span>
          </div>
          <ul class="recent-ballots-list">
            ${scrutin.bulletins.length === 0 ? `
              <li style="color: var(--text-muted); font-style: italic;">Aucun bulletin dépouillé pour le moment.</li>
            ` : scrutin.bulletins.slice(-5).reverse().map((b, idx) => {
              const timeStr = new Date(b.t).toLocaleTimeString();
              let label = '';
              if (b.type === 'blanc') label = '⚪ Bulletin Blanc';
              else if (b.type === 'nul') label = '❌ Bulletin Nul';
              else if (b.type === 'choix') {
                if (config.mode === 'binome') {
                  const bin = (config.binomes || []).find(it => it.id === b.cible);
                  label = `👫 Binôme ${bin?.nom || b.cible}`;
                } else {
                  const cand = config.candidats.find(c => c.id === b.cible);
                  label = `👤 ${cand?.prenom || b.cible} (${cand?.sexe === 'F' ? 'F' : 'G'})`;
                }
              } else if (b.type === 'rang') {
                const names = b.ordre.map(id => config.candidats.find(c => c.id === id)?.prenom || id).join(' > ');
                label = `📊 ${names}`;
              }
              return `
                <li>
                  <span>#${totalCount - idx} — ${label}</span>
                  <span style="color: var(--text-muted);">${timeStr}</span>
                </li>
              `;
            }).join('')}
          </ul>
        </div>
      </div>
    `;

    this.attachEvents(scrutin, isClosed || isFull);
    this.setupKeyboardShortcuts(scrutin, isClosed || isFull);
  }

  private renderClickInterface(scrutin: Scrutin, disabled: boolean): string {
    const config = scrutin.config;

    if (config.mode === 'classement') {
      return this.renderRankingInterface(scrutin, disabled);
    }

    // Modes : Binôme, Uninominal ou Corrigé
    let itemsHtml = '';

    if (config.mode === 'binome') {
      const binomes = config.binomes || [];
      itemsHtml = binomes.map((b, idx) => `
        <button
          type="button"
          class="tni-vote-btn"
          data-cible="${b.id}"
          data-type="choix"
          ${disabled ? 'disabled' : ''}
        >
          <span class="shortcut-key">${idx + 1}</span>
          <span style="font-size: 1.15rem; font-weight: 800;">${b.nom || b.id}</span>
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">Binôme paritaire F+G</span>
        </button>
      `).join('');
    } else {
      // Uninominal ou Corrigé : un bouton par candidat
      itemsHtml = config.candidats.map((c, idx) => `
        <button
          type="button"
          class="tni-vote-btn ${c.sexe === 'F' ? 'tni-btn-sexe-f' : 'tni-btn-sexe-g'}"
          data-cible="${c.id}"
          data-type="choix"
          ${disabled ? 'disabled' : ''}
        >
          <span class="shortcut-key">${idx + 1}</span>
          <span style="font-size: 1.25rem; font-weight: 800;">${c.prenom}</span>
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; display: inline-flex; align-items: center; gap: 0.35rem;">
            <span class="sexe-icon ${c.sexe === 'F' ? 'sexe-f' : 'sexe-g'}" style="font-size: 0.72rem; padding: 0.1rem 0.4rem;">${c.sexe}</span>
            ${c.sexe === 'F' ? 'Fille' : 'Garçon'}
          </span>
        </button>
      `).join('');
    }

    return `
      <div class="tni-buttons-grid">
        ${itemsHtml}
        <button
          type="button"
          class="tni-vote-btn btn-blanc"
          data-type="blanc"
          ${disabled ? 'disabled' : ''}
        >
          <span class="shortcut-key">B</span>
          <span style="font-size: 1.1rem; font-weight: 800;">⚪ Blanc</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Enveloppe vide</span>
        </button>
        <button
          type="button"
          class="tni-vote-btn btn-nul"
          data-type="nul"
          ${disabled ? 'disabled' : ''}
        >
          <span class="shortcut-key">N</span>
          <span style="font-size: 1.1rem; font-weight: 800;">❌ Nul</span>
          <span style="font-size: 0.75rem; color: var(--secondary);">Raturé / Non conforme</span>
        </button>
      </div>
    `;
  }

  private renderRankingInterface(scrutin: Scrutin, disabled: boolean): string {
    const config = scrutin.config;
    const candidates = config.candidats;

    const pickedCandidates = this.currentRanking.map(id => candidates.find(c => c.id === id)!);
    const unpickedCandidates = candidates.filter(c => !this.currentRanking.includes(c.id));

    const pointsLabels = ['+5 pts (1er)', '+4 pts (2e)', '+3 pts (3e)', '+2 pts (4e)', '+1 pt (5e)'];
    const maxChoices = 5;
    const isMaxReached = pickedCandidates.length >= maxChoices;

    return `
      <div class="ranking-ballot-builder">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <strong style="font-size: 0.95rem;">🗳️ Bulletin virtuel : 5 candidats préférés</strong>
            <div style="font-size: 0.8rem; color: var(--text-muted);">
              Barème : 1er = <strong>5 pts</strong> • 2e = <strong>4 pts</strong> • 3e = <strong>3 pts</strong> • 4e = <strong>2 pts</strong> • 5e = <strong>1 pt</strong>
            </div>
          </div>
          <span class="badge ${isMaxReached ? 'badge-accent' : 'badge-primary'}">
            ${pickedCandidates.length} / ${maxChoices} choix
          </span>
        </div>

        <!-- Emplacements de rangs choisis avec points -->
        <div class="ranking-slots-list">
          ${pickedCandidates.length === 0 ? `
            <div style="text-align: center; color: var(--text-muted); font-size: 0.88rem; padding: 1.25rem; background: var(--bg-surface); border-radius: var(--radius-sm); border: 1px dashed var(--border);">
              Cliquez ci-dessous sur votre <strong>1er choix (5 pts)</strong>, puis 2e (4 pts), etc.
            </div>
          ` : pickedCandidates.map((c, idx) => {
            const ptsText = idx < pointsLabels.length ? pointsLabels[idx] : `0 pt`;
            return `
              <div class="ranking-slot-item">
                <div style="display: flex; align-items: center;">
                  <span class="ranking-slot-order">${idx + 1}</span>
                  <span style="font-weight: 700; font-size: 1rem;">${c.prenom}</span>
                  <span class="sexe-icon ${c.sexe === 'F' ? 'sexe-f' : 'sexe-g'}" style="margin-left: 0.5rem;">${c.sexe}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <span class="badge badge-primary" style="font-size: 0.8rem; font-weight: 800;">
                    ${ptsText}
                  </span>
                  <button type="button" class="btn-remove-rank-slot" data-index="${idx}" title="Retirer" style="border: none; background: transparent; color: var(--text-muted); cursor: pointer; font-size: 1.1rem;">
                    ✕
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Candidats restants à choisir -->
        <div>
          ${isMaxReached ? `
            <div style="background: var(--accent-subtle); border: 1px solid var(--accent-light); border-radius: var(--radius-sm); padding: 0.6rem 0.85rem; font-size: 0.85rem; color: var(--accent); font-weight: 700; text-align: center;">
              ✨ Vos 5 candidats préférés sont sélectionnés (barème 5, 4, 3, 2, 1 pts). Cliquez sur « Valider » pour enregistrer le bulletin.
            </div>
          ` : `
            <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 0.4rem;">
              Ajouter le choix n°${pickedCandidates.length + 1} (${pointsLabels[pickedCandidates.length] || '0 pt'}) :
            </span>
            <div class="ranking-candidate-pickers">
              ${unpickedCandidates.map(c => `
                <button type="button" class="rank-picker-chip" data-id="${c.id}" ${disabled ? 'disabled' : ''}>
                  + ${c.prenom} (${c.sexe === 'F' ? 'Fille' : 'Garçon'})
                </button>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Validation du bulletin -->
        <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 0.5rem; flex-wrap: wrap;">
          <button type="button" class="btn btn-secondary" id="btn-clear-ranking" ${pickedCandidates.length === 0 || disabled ? 'disabled' : ''}>
            <span>🧹</span> Effacer (Échap)
          </button>
          <button type="button" class="btn btn-secondary" id="btn-ranking-blanc" ${disabled ? 'disabled' : ''}>
            <span>⚪</span> Blanc
          </button>
          <button type="button" class="btn btn-secondary" id="btn-ranking-nul" ${disabled ? 'disabled' : ''}>
            <span>❌</span> Nul
          </button>
          <button type="button" class="btn btn-primary" id="btn-submit-ranking" ${pickedCandidates.length === 0 || disabled ? 'disabled' : ''}>
            <span>✅</span> Valider ce bulletin (Entrée)
          </button>
        </div>
      </div>
    `;
  }

  private renderTotalsForm(scrutin: Scrutin): string {
    const config = scrutin.config;

    return `
      <div style="background: var(--bg-app); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.25rem;">
        <h5 style="font-size: 1rem; font-weight: 800; margin-bottom: 0.5rem;">
          🔢 Saisie directe des totaux du comptage papier
        </h5>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
          Entrez le nombre de voix pour chaque candidat ou binôme issu du tableau de comptage de la classe.
        </p>

        <form id="form-direct-totals" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
          ${config.mode === 'binome' ? (config.binomes || []).map(b => `
            <div style="background: var(--bg-surface); padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: space-between;">
              <label style="font-weight: 700; font-size: 0.9rem;">${b.nom || b.id}</label>
              <input type="number" min="0" max="${config.inscrits}" value="0" class="input-total-val form-control" data-cible="${b.id}" style="width: 70px; text-align: center; padding: 0.35rem; font-weight: 700;">
            </div>
          `).join('') : config.candidats.map(c => `
            <div style="background: var(--bg-surface); padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: space-between;">
              <label style="font-weight: 700; font-size: 0.9rem;">${c.prenom} (${c.sexe})</label>
              <input type="number" min="0" max="${config.inscrits}" value="0" class="input-total-val form-control" data-cible="${c.id}" style="width: 70px; text-align: center; padding: 0.35rem; font-weight: 700;">
            </div>
          `).join('')}

          <div style="background: var(--bg-surface); padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: space-between;">
            <label style="font-weight: 700; font-size: 0.9rem;">⚪ Blancs</label>
            <input type="number" min="0" max="${config.inscrits}" value="0" class="form-control" id="input-total-blancs" style="width: 70px; text-align: center; padding: 0.35rem; font-weight: 700;">
          </div>
          <div style="background: var(--bg-surface); padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: space-between;">
            <label style="font-weight: 700; font-size: 0.9rem;">❌ Nuls</label>
            <input type="number" min="0" max="${config.inscrits}" value="0" class="form-control" id="input-total-nuls" style="width: 70px; text-align: center; padding: 0.35rem; font-weight: 700;">
          </div>
        </form>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
          <button type="button" class="btn btn-primary" id="btn-save-totals">
            <span>💾</span> Enregistrer ces totaux
          </button>
        </div>
      </div>
    `;
  }

  private attachEvents(scrutin: Scrutin, disabled: boolean) {
    // Bouton Toggle Mode Totaux
    const toggleTotalsBtn = this.container.querySelector<HTMLButtonElement>('#btn-toggle-totals');
    if (toggleTotalsBtn) {
      toggleTotalsBtn.addEventListener('click', () => {
        this.isTotalsMode = !this.isTotalsMode;
        this.render(store.getScrutin());
      });
    }

    // Bouton Annuler (Undo)
    const undoBtn = this.container.querySelector<HTMLButtonElement>('#btn-undo-ballot');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => {
        store.undoLastBulletin();
      });
    }

    // Bouton Rouvrir élection
    const reopenBtn = this.container.querySelector<HTMLButtonElement>('#btn-reopen-election');
    if (reopenBtn) {
      reopenBtn.addEventListener('click', () => {
        store.rouvrirDepouillement();
      });
    }

    if (disabled) return;

    // Clics sur boutons de vote directs
    const voteBtns = this.container.querySelectorAll<HTMLButtonElement>('.tni-vote-btn');
    voteBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type as any;
        const cible = btn.dataset.cible || '';

        try {
          if (type === 'blanc') {
            store.addBulletin({ type: 'blanc' });
          } else if (type === 'nul') {
            store.addBulletin({ type: 'nul' });
          } else if (type === 'choix') {
            store.addBulletin({ type: 'choix', cible });
          }
        } catch (err: any) {
          alert(err.message);
        }
      });
    });

    // Événements pour le mode classement
    if (scrutin.config.mode === 'classement') {
      const pickerChips = this.container.querySelectorAll<HTMLButtonElement>('.rank-picker-chip');
      pickerChips.forEach(chip => {
        chip.addEventListener('click', () => {
          const id = chip.dataset.id;
          if (id && !this.currentRanking.includes(id) && this.currentRanking.length < 5) {
            this.currentRanking.push(id);
            this.render(store.getScrutin());
          }
        });
      });

      const removeSlotBtns = this.container.querySelectorAll<HTMLButtonElement>('.btn-remove-rank-slot');
      removeSlotBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index || '0', 10);
          this.currentRanking.splice(idx, 1);
          this.render(store.getScrutin());
        });
      });

      const clearBtn = this.container.querySelector<HTMLButtonElement>('#btn-clear-ranking');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          this.currentRanking = [];
          this.render(store.getScrutin());
        });
      }

      const submitRankBtn = this.container.querySelector<HTMLButtonElement>('#btn-submit-ranking');
      if (submitRankBtn) {
        submitRankBtn.addEventListener('click', () => {
          if (this.currentRanking.length > 0) {
            try {
              store.addBulletin({ type: 'rang', ordre: [...this.currentRanking] });
              this.currentRanking = [];
              this.render(store.getScrutin());
            } catch (err: any) {
              alert(err.message);
            }
          }
        });
      }

      const blancRankBtn = this.container.querySelector<HTMLButtonElement>('#btn-ranking-blanc');
      if (blancRankBtn) {
        blancRankBtn.addEventListener('click', () => {
          store.addBulletin({ type: 'blanc' });
          this.currentRanking = [];
          this.render(store.getScrutin());
        });
      }

      const nulRankBtn = this.container.querySelector<HTMLButtonElement>('#btn-ranking-nul');
      if (nulRankBtn) {
        nulRankBtn.addEventListener('click', () => {
          store.addBulletin({ type: 'nul' });
          this.currentRanking = [];
          this.render(store.getScrutin());
        });
      }
    }

    // Événement pour la saisie des totaux directs
    const saveTotalsBtn = this.container.querySelector<HTMLButtonElement>('#btn-save-totals');
    if (saveTotalsBtn) {
      saveTotalsBtn.addEventListener('click', () => {
        const inputs = this.container.querySelectorAll<HTMLInputElement>('.input-total-val');
        const blancsInp = this.container.querySelector<HTMLInputElement>('#input-total-blancs');
        const nulsInp = this.container.querySelector<HTMLInputElement>('#input-total-nuls');

        const bulletins: Bulletin[] = [];
        let total = 0;

        inputs.forEach(inp => {
          const count = parseInt(inp.value, 10) || 0;
          const cible = inp.dataset.cible || '';
          for (let i = 0; i < count; i++) {
            bulletins.push({ type: 'choix', cible, t: Date.now() + i });
          }
          total += count;
        });

        const blancsCount = parseInt(blancsInp?.value || '0', 10) || 0;
        for (let i = 0; i < blancsCount; i++) {
          bulletins.push({ type: 'blanc', t: Date.now() + total + i });
        }
        total += blancsCount;

        const nulsCount = parseInt(nulsInp?.value || '0', 10) || 0;
        for (let i = 0; i < nulsCount; i++) {
          bulletins.push({ type: 'nul', t: Date.now() + total + i });
        }
        total += nulsCount;

        if (total > scrutin.config.inscrits) {
          alert(`Erreur : Le total saisi (${total}) dépasse le nombre d'inscrits (${scrutin.config.inscrits}).`);
          return;
        }

        store.setBulletinsBatch(bulletins);
        this.isTotalsMode = false;
        this.render(store.getScrutin());
      });
    }
  }

  private setupKeyboardShortcuts(scrutin: Scrutin, disabled: boolean) {
    if (this.keydownListener) {
      window.removeEventListener('keydown', this.keydownListener);
    }

    this.keydownListener = (e: KeyboardEvent) => {
      // Ignorer si on tape dans un champ input/textarea
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
        return;
      }

      // Ctrl+Z pour annuler
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        store.undoLastBulletin();
        return;
      }

      if (disabled) return;

      const config = scrutin.config;

      // Mode classement
      if (config.mode === 'classement') {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (this.currentRanking.length > 0) {
            store.addBulletin({ type: 'rang', ordre: [...this.currentRanking] });
            this.currentRanking = [];
            this.render(store.getScrutin());
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.currentRanking = [];
          this.render(store.getScrutin());
        }
        return;
      }

      // Raccourci Blanc (B) ou Nul (N)
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        store.addBulletin({ type: 'blanc' });
        return;
      }
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        store.addBulletin({ type: 'nul' });
        return;
      }

      // Raccourcis numériques 1, 2, 3...
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1) {
        if (config.mode === 'binome') {
          const binomes = config.binomes || [];
          if (num <= binomes.length) {
            e.preventDefault();
            store.addBulletin({ type: 'choix', cible: binomes[num - 1].id });
          }
        } else {
          if (num <= config.candidats.length) {
            e.preventDefault();
            store.addBulletin({ type: 'choix', cible: config.candidats[num - 1].id });
          }
        }
      }
    };

    window.addEventListener('keydown', this.keydownListener);
  }

  public destroy() {
    if (this.keydownListener) {
      window.removeEventListener('keydown', this.keydownListener);
    }
  }
}
