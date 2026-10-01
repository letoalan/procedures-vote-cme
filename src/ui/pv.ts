import { ResultatsCalcul, Scrutin } from '../engine/types.js';

export function renderPVModal(container: HTMLElement, scrutin: Scrutin, results: ResultatsCalcul, onClose: () => void) {
  const config = scrutin.config;
  const tally = results.tally;

  const dateFormatted = config.dateScrutin
    ? new Date(config.dateScrutin).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const heureDebut = scrutin.debut ? new Date(scrutin.debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '09:00';
  const heureFin = scrutin.fin ? new Date(scrutin.fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'pv-modal-overlay';

  // Format mode label
  const modeLabels: Record<string, string> = {
    binome: 'Scrutin de binômes paritaires (1 Fille + 1 Garçon indissociables)',
    uninominal: `Scrutin uninominal majoritaire à 2 sièges (${config.sousMode === 'A' ? 'Majoritaire à deux tours' : 'Plurinominal à 1 tour'})`,
    classement: config.sousMode === 'stv'
      ? 'Scrutin à Vote Unique Transférable (STV / Droop)'
      : 'Scrutin préférentiel de Borda (5 candidats préférés — Barème : 1er = 5 pts, 2e = 4 pts, 3e = 3 pts, 4e = 2 pts, 5e = 1 pt)',
    corrige: `Scrutin uninominal avec correction paritaire conditionnelle (Seuil : ${config.seuilRepechage || 25}%)`
  };

  const elusList: string[] = [];
  if (config.mode === 'binome' && results.binomesResultats) {
    results.binomesResultats.filter(b => b.elu).forEach(b => {
      elusList.push(`• Binôme ${b.binome.nom || b.id} : ${b.candidatFille.prenom} (Fille) et ${b.candidatGarcon.prenom} (Garçon) — ${b.mentionElu || 'Élus'}`);
    });
  } else if (results.candidatsResultats) {
    results.candidatsResultats.filter(c => c.elu).forEach(c => {
      elusList.push(`• ${c.candidat.prenom} (${c.candidat.sexe === 'F' ? 'Fille' : 'Garçon'}) — ${c.mentionElu || 'Élu(e)'}`);
    });
  }

  modal.innerHTML = `
    <div class="modal-card" style="max-width: 900px; max-height: 92vh; overflow-y: auto; text-align: left; padding: 2rem;">
      <!-- Barre d'actions supérieure (non imprimable) -->
      <div class="no-print" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border); padding-bottom: 1rem; margin-bottom: 1.5rem;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
            <span>📜</span> Procès-Verbal Officiel d'Élection (PV)
          </h3>
          <span style="font-size: 0.85rem; color: var(--text-muted);">
            Document officiel à imprimer pour la mairie et la classe
          </span>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button type="button" class="btn btn-primary" id="btn-print-pv-action">
            <span>🖨️</span> Imprimer le PV (Format A4)
          </button>
          <button type="button" class="btn btn-secondary" id="btn-close-pv-modal">
            <span>✕</span> Fermer
          </button>
        </div>
      </div>

      <!-- Corps du Procès-Verbal (Document officiel imprimable) -->
      <div class="pv-document" id="printable-pv-content">
        <div class="pv-header">
          <div class="pv-republic-marianne">
            <div>RÉPUBLIQUE FRANÇAISE</div>
            <div style="font-size: 8.5pt; font-weight: normal; color: #475569;">Liberté • Égalité • Fraternité</div>
            <div style="font-size: 9pt; margin-top: 4px; font-weight: bold;">VILLE DE ${config.commune?.toUpperCase() || 'LA COMMUNE'}</div>
          </div>
          <div class="pv-cme-title">
            <h2>CONSEIL MUNICIPAL DES ENFANTS</h2>
            <div style="font-size: 10pt; font-weight: bold; color: #1e3a8a;">
              PROCÈS-VERBAL DES OPÉRATIONS DE VOTE
            </div>
            <div style="font-size: 8.5pt; color: #475569;">Tour n° ${scrutin.numeroTour || 1}</div>
          </div>
        </div>

        <div class="pv-meta-grid">
          <div><strong>École :</strong> ${config.ecole || 'École élémentaire'}</div>
          <div><strong>Date du scrutin :</strong> ${dateFormatted}</div>
          <div><strong>Classe :</strong> ${config.classe || 'CM1-CM2'}</div>
          <div><strong>Horaires :</strong> De ${heureDebut} à ${heureFin}</div>
          <div style="grid-column: span 2;">
            <strong>Modalité retenue :</strong> ${modeLabels[config.mode] || config.mode}
          </div>
        </div>

        <!-- Chiffres du scrutin -->
        <div class="pv-section-title">1. Résultats du recensement des votes</div>
        <div class="pv-chiffres-grid">
          <div class="pv-chiffre-cell">
            <div class="pv-chiffre-val">${tally.inscrits}</div>
            <div class="pv-chiffre-lbl">Inscrits</div>
          </div>
          <div class="pv-chiffre-cell">
            <div class="pv-chiffre-val">${tally.votants}</div>
            <div class="pv-chiffre-lbl">Votants</div>
          </div>
          <div class="pv-chiffre-cell">
            <div class="pv-chiffre-val">${tally.blancs}</div>
            <div class="pv-chiffre-lbl">Blancs</div>
          </div>
          <div class="pv-chiffre-cell">
            <div class="pv-chiffre-val">${tally.nuls}</div>
            <div class="pv-chiffre-lbl">Nuls</div>
          </div>
          <div class="pv-chiffre-cell">
            <div class="pv-chiffre-val">${tally.exprimes}</div>
            <div class="pv-chiffre-lbl">Exprimés</div>
          </div>
          <div class="pv-chiffre-cell">
            <div class="pv-chiffre-val">${tally.majoriteAbsolue}</div>
            <div class="pv-chiffre-lbl">Majorité absolue</div>
          </div>
        </div>

        <!-- Tableau des suffrages -->
        <div class="pv-section-title">2. Suffrages obtenus par les candidats</div>
        <table class="pv-table">
          <thead>
            <tr>
              <th style="width: 50px;" class="text-center">Rang</th>
              <th>Candidat(e)s / Binôme</th>
              <th style="width: 70px;" class="text-center">Sexe</th>
              <th style="width: 100px;" class="text-right">Voix / Pts</th>
              <th style="width: 90px;" class="text-right">% Exprimés</th>
              <th>Mention & Décision</th>
            </tr>
          </thead>
          <tbody>
            ${config.mode === 'binome' && results.binomesResultats ? results.binomesResultats.map(b => `
              <tr>
                <td class="text-center">${b.rangBrut}</td>
                <td><strong>${b.binome.nom || b.id}</strong> (${b.candidatFille.prenom} & ${b.candidatGarcon.prenom})</td>
                <td class="text-center">F + G</td>
                <td class="text-right"><strong>${b.voix}</strong></td>
                <td class="text-right">${b.pct}%</td>
                <td><strong>${b.elu ? 'ÉLU (Parité respectée)' : 'Non élu'}</strong></td>
              </tr>
            `).join('') : (results.candidatsResultats || []).map(c => `
              <tr>
                <td class="text-center">${c.rangBrut}</td>
                <td><strong>${c.candidat.prenom}</strong></td>
                <td class="text-center">${c.candidat.sexe === 'F' ? 'Fille' : 'Garçon'}</td>
                <td class="text-right"><strong>${c.points !== undefined ? c.points + ' pts' : c.voix}</strong></td>
                <td class="text-right">${c.pct}%</td>
                <td><strong>${c.elu ? 'ÉLU(E) — ' + (c.mentionElu || '') : 'Non élu(e)'}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Proclamation des élus -->
        <div class="pv-section-title">3. Proclamation des délégués titulaires au CME</div>
        <div class="pv-elus-box">
          <h3>Sont officiellement proclamés Conseillers Municipaux Juniors :</h3>
          <div class="pv-elus-list">
            ${elusList.length > 0 ? elusList.map(e => `<div>${e}</div>`).join('') : '<div>Aucun délégué proclamé.</div>'}
          </div>
          ${results.explicationCorrection ? `
            <div class="pv-rule-explanation">
              <strong>Motif de la régulation paritaire :</strong> ${results.explicationCorrection}
            </div>
          ` : ''}
          ${results.departageInfo.applique ? `
            <div class="pv-rule-explanation">
              <strong>Départage d'égalité :</strong> ${results.departageInfo.explication || results.departageInfo.motif}
            </div>
          ` : ''}
        </div>

        <!-- Signatures -->
        <div class="pv-section-title">4. Authentification et signatures du bureau de vote</div>
        <div class="pv-signatures-grid">
          <div class="pv-signature-box">
            <div class="pv-signature-title">Le Président du Bureau (Élève)</div>
            <div class="pv-signature-mention">« Lu et certifié conforme »<br>Date et signature :</div>
          </div>
          <div class="pv-signature-box">
            <div class="pv-signature-title">Les Assesseurs (Élèves)</div>
            <div class="pv-signature-mention">« Vu pour contrôle des émargements »<br>Signatures :</div>
          </div>
          <div class="pv-signature-box">
            <div class="pv-signature-title">L'Élu(e) Référent(e) / L'Enseignant(e)</div>
            <div class="pv-signature-mention">« Vu pour validation municipale »<br>Signature et cachet :</div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(modal);

  // Close actions
  const closeBtn = modal.querySelector<HTMLButtonElement>('#btn-close-pv-modal');
  if (closeBtn) closeBtn.addEventListener('click', () => { modal.remove(); onClose(); });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) { modal.remove(); onClose(); }
  });

  // Print action
  const printBtn = modal.querySelector<HTMLButtonElement>('#btn-print-pv-action');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}
