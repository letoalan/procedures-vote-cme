/**
 * @module ui/pv
 * Rôle : point d'entrée du procès-verbal officiel et fenêtre modale d'impression.
 * Dépend de : core/types, ui/pv/pvView, ui/pv/tieBreaker.
 */

import { ResultatsCalcul, Scrutin } from '../../core/types.js';
import { buildPvHeaderHtml, buildPvTableHtml } from './pvView.js';
import { extractProclaimedElected, getModeLabel } from './tieBreaker.js';

export function renderPVModal(container: HTMLElement, scrutin: Scrutin, results: ResultatsCalcul, onClose: () => void): () => void {
  const { config } = scrutin;
  const { tally } = results;

  const dateFmt = config.dateScrutin
    ? new Date(config.dateScrutin).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const hDebut = scrutin.debut ? new Date(scrutin.debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '09:00';
  const hFin = scrutin.fin ? new Date(scrutin.fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const modeLabel = getModeLabel(config);
  const elusList = extractProclaimedElected(config, results);

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'pv-modal-overlay';

  modal.innerHTML = `
    <div class="modal-card" style="max-width: 900px; max-height: 92vh; overflow-y: auto; text-align: left; padding: 2rem;">
      <div class="no-print" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border); padding-bottom: 1rem; margin-bottom: 1.5rem;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;"><span>📜</span> Procès-Verbal Officiel d'Élection (PV)</h3>
          <span style="font-size: 0.85rem; color: var(--text-muted);">Document officiel à imprimer pour la mairie et la classe</span>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button type="button" class="btn btn-primary" id="btn-print-pv-action"><span>🖨️</span> Imprimer le PV (Format A4)</button>
          <button type="button" class="btn btn-secondary" id="btn-close-pv-modal"><span>✕</span> Fermer</button>
        </div>
      </div>
      <div class="pv-document" id="printable-pv-content">
        ${buildPvHeaderHtml(scrutin, modeLabel, dateFmt, hDebut, hFin)}
        <div class="pv-section-title">1. Résultats du recensement des votes</div>
        <div class="pv-chiffres-grid">
          <div class="pv-chiffre-cell"><div class="pv-chiffre-val">${tally.inscrits}</div><div class="pv-chiffre-lbl">Inscrits</div></div>
          <div class="pv-chiffre-cell"><div class="pv-chiffre-val">${tally.votants}</div><div class="pv-chiffre-lbl">Votants</div></div>
          <div class="pv-chiffre-cell"><div class="pv-chiffre-val">${tally.blancs}</div><div class="pv-chiffre-lbl">Blancs</div></div>
          <div class="pv-chiffre-cell"><div class="pv-chiffre-val">${tally.nuls}</div><div class="pv-chiffre-lbl">Nuls</div></div>
          <div class="pv-chiffre-cell"><div class="pv-chiffre-val">${tally.exprimes}</div><div class="pv-chiffre-lbl">Exprimés</div></div>
          <div class="pv-chiffre-cell"><div class="pv-chiffre-val">${tally.majoriteAbsolue}</div><div class="pv-chiffre-lbl">Majorité absolue</div></div>
        </div>
        <div class="pv-section-title">2. Suffrages obtenus par les candidats</div>
        <table class="pv-table">
          <thead>
            <tr><th style="width: 50px;" class="text-center">Rang</th><th>Candidat(e)s / Binôme</th><th style="width: 70px;" class="text-center">Sexe</th><th style="width: 100px;" class="text-right">Voix / Pts</th><th style="width: 90px;" class="text-right">% Exprimés</th><th>Mention & Décision</th></tr>
          </thead>
          <tbody>${buildPvTableHtml(scrutin, results)}</tbody>
        </table>
        <div class="pv-section-title">3. Proclamation des délégués titulaires au CME</div>
        <div class="pv-elus-box">
          <h3>Sont officiellement proclamés Conseillers Municipaux Juniors :</h3>
          <div class="pv-elus-list">${elusList.length > 0 ? elusList.map(e => `<div>${e}</div>`).join('') : '<div>Aucun délégué proclamé.</div>'}</div>
          ${results.explicationCorrection ? `<div class="pv-rule-explanation"><strong>Motif de la régulation paritaire :</strong> ${results.explicationCorrection}</div>` : ''}
          ${results.departageInfo.applique ? `<div class="pv-rule-explanation"><strong>Départage d'égalité :</strong> ${results.departageInfo.explication || results.departageInfo.motif}</div>` : ''}
        </div>
        <div class="pv-section-title">4. Authentification et signatures du bureau de vote</div>
        <div class="pv-signatures-grid">
          <div class="pv-signature-box"><div class="pv-signature-title">Le Président du Bureau (Élève)</div><div class="pv-signature-mention">« Lu et certifié conforme »<br>Date et signature :</div></div>
          <div class="pv-signature-box"><div class="pv-signature-title">Les Assesseurs (Élèves)</div><div class="pv-signature-mention">« Vu pour contrôle des émargements »<br>Signatures :</div></div>
          <div class="pv-signature-box"><div class="pv-signature-title">L'Élu(e) Référent(e) / L'Enseignant(e)</div><div class="pv-signature-mention">« Vu pour validation municipale »<br>Signature et cachet :</div></div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(modal);

  const cleanup = () => { modal.remove(); onClose(); };
  const closeBtn = modal.querySelector<HTMLButtonElement>('#btn-close-pv-modal');
  if (closeBtn) closeBtn.addEventListener('click', cleanup);
  const clickOverlay = (e: MouseEvent) => { if (e.target === modal) cleanup(); };
  modal.addEventListener('click', clickOverlay);

  const printBtn = modal.querySelector<HTMLButtonElement>('#btn-print-pv-action');
  const onPrint = () => { window.print(); };
  if (printBtn) printBtn.addEventListener('click', onPrint);

  return () => {
    if (closeBtn) closeBtn.removeEventListener('click', cleanup);
    modal.removeEventListener('click', clickOverlay);
    if (printBtn) printBtn.removeEventListener('click', onPrint);
    modal.remove();
  };
}

export * from './pvView.js';
export * from './tieBreaker.js';
