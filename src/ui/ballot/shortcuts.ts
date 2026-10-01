/**
 * @module ui/ballot/shortcuts
 * Rôle : raccourcis clavier pour le dépouillement rapide sur TNI ou ordinateur.
 * Dépend de : core/types, app/store.
 */

import { Scrutin } from '../../core/types.js';
import { store } from '../../store.js';

export function setupKeyboardShortcuts(
  scrutin: Scrutin,
  disabled: boolean,
  onUndo: () => void
): () => void {
  if (disabled) return () => {};

  const handler = (e: KeyboardEvent) => {
    // Ne pas intercepter si focus dans un champ texte
    const tag = (document.activeElement?.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      onUndo();
      return;
    }

    const key = e.key.toUpperCase();
    if (key === 'B') {
      e.preventDefault();
      store.addBulletin({ type: 'blanc' });
      return;
    }
    if (key === 'N') {
      e.preventDefault();
      store.addBulletin({ type: 'nul' });
      return;
    }

    const num = parseInt(e.key, 10);
    if (!isNaN(num) && num >= 1 && num <= 9) {
      const idx = num - 1;
      const { config } = scrutin;
      if (config.mode === 'binome') {
        const bin = config.binomes?.[idx];
        if (bin) {
          e.preventDefault();
          store.addBulletin({ type: 'choix', cible: bin.id });
        }
      } else if (config.mode === 'uninominal' || config.mode === 'corrige') {
        const cand = config.candidats[idx];
        if (cand) {
          e.preventDefault();
          store.addBulletin({ type: 'choix', cible: cand.id });
        }
      }
    }
  };

  window.addEventListener('keydown', handler);
  return () => { window.removeEventListener('keydown', handler); };
}
