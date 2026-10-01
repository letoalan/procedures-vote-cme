import { Candidat, Config, Mode, Sexe } from '../engine/types.js';
import { getDefaultConfig, store } from '../store.js';

export function renderSetupForm(container: HTMLElement, onStartDepouillement: () => void) {
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
          <h3 style="font-size: 1.3rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
            <span>⚙️</span> Paramètres de l'élection
          </h3>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 0.2rem;">
            ${isLocked
              ? '<span class="badge badge-warning">🔒 Paramètres verrouillés</span> (Dépouillement commencé — ' + scrutin.bulletins.length + ' bulletin(s) saisi(s))'
              : 'Configurez la classe, les candidats et les règles avant d\'ouvrir le dépouillement.'}
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          ${!isLocked ? `
            <button type="button" class="btn btn-secondary" id="btn-load-demo" style="font-size: 0.85rem; padding: 0.45rem 0.85rem;">
              <span>🎲</span> Exemple classe (23 élèves)
            </button>
            <button type="button" class="btn btn-primary" id="btn-start-count">
              <span>🚀</span> Commencer le dépouillement
            </button>
          ` : `
            <button type="button" class="btn btn-danger" id="btn-reset-election" style="font-size: 0.85rem; padding: 0.45rem 0.85rem;">
              <span>🔄</span> Réinitialiser le scrutin
            </button>
          `}
        </div>
      </div>

      <form id="election-setup-form" style="${isLocked ? 'pointer-events: none; opacity: 0.7;' : ''}">
        <!-- Section 1 : Modalité et sous-modes -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 1.25rem;">
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.4rem;">
              Modalité de scrutin
            </label>
            <select id="setup-mode" class="form-control" style="width: 100%; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border); font-family: inherit; font-size: 0.95rem; font-weight: 600;">
              ${Object.entries(modeLabels).map(([m, label]) => `
                <option value="${m}" ${config.mode === m ? 'selected' : ''}>${label}</option>
              `).join('')}
            </select>
          </div>

          <div id="submode-container">
            <!-- Sous-modes injectés dynamiquement -->
          </div>
        </div>

        <!-- Section 2 : Données civiques et classe -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.25rem; background: var(--bg-app); padding: 1rem; border-radius: var(--radius-md);">
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.3rem;">École</label>
            <input type="text" id="setup-ecole" value="${config.ecole || ''}" class="form-control" style="width: 100%; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 0.9rem;">
          </div>
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.3rem;">Classe</label>
            <input type="text" id="setup-classe" value="${config.classe || ''}" class="form-control" style="width: 100%; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 0.9rem;">
          </div>
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.3rem;">Commune</label>
            <input type="text" id="setup-commune" value="${config.commune || ''}" class="form-control" style="width: 100%; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 0.9rem;">
          </div>
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.3rem;">Inscrits (élèves)</label>
            <input type="number" id="setup-inscrits" value="${config.inscrits}" min="1" max="100" class="form-control" style="width: 100%; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 0.9rem; font-weight: 700;">
          </div>
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.3rem;">Sièges à pourvoir</label>
            <input type="number" id="setup-sieges" value="${config.sieges || 2}" min="1" max="10" class="form-control" style="width: 100%; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 0.9rem; font-weight: 700;">
          </div>
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.3rem;">Règle de départage</label>
            <select id="setup-departage" class="form-control" style="width: 100%; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 0.9rem;">
              <option value="tirage" ${config.departage === 'tirage' ? 'selected' : ''}>Tirage au sort (scellé)</option>
              <option value="age" ${config.departage === 'age' ? 'selected' : ''}>Au bénéfice du plus jeune</option>
              <option value="tour" ${config.departage === 'tour' ? 'selected' : ''}>Second tour de scrutin</option>
            </select>
          </div>
        </div>

        <!-- Section 3 : Candidats dynamiques -->
        <div style="margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <label style="font-size: 1rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
              <span>👥</span> Liste des candidats (${config.candidats.length})
            </label>
            ${!isLocked ? `
              <button type="button" class="btn btn-secondary" id="btn-add-candidat" style="font-size: 0.85rem; padding: 0.35rem 0.75rem;">
                <span>➕</span> Ajouter un candidat
              </button>
            ` : ''}
          </div>

          <div id="candidats-list-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.75rem;">
            <!-- Candidats rendus ici -->
          </div>
        </div>

        <!-- Section 4 : Binômes si mode binôme -->
        <div id="binomes-section" style="${config.mode === 'binome' ? 'display: block;' : 'display: none;'} margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <label style="font-size: 1rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
              <span>👫</span> Constitution des binômes paritaires F+G
            </label>
            ${!isLocked ? `
              <button type="button" class="btn btn-secondary" id="btn-add-binome" style="font-size: 0.85rem; padding: 0.35rem 0.75rem;">
                <span>➕</span> Créer un binôme
              </button>
            ` : ''}
          </div>
          <div id="binomes-list-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 0.75rem;">
            <!-- Binômes rendus ici -->
          </div>
        </div>

        <!-- Section 5 : Options avancées selon mode -->
        <div id="mode-specific-options" style="background: var(--bg-app); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.25rem;">
          <!-- Injecté dynamiquement : seuil repêchage pour corrigé, barème pour borda -->
        </div>
      </form>
    </div>
  `;

  // Sous-modes et options spécifiques
  updateSubmodesAndSpecifics(container, config);

  // Rendu des candidats
  renderCandidatsList(container, config, isLocked);

  // Rendu des binômes
  if (config.mode === 'binome') {
    renderBinomesList(container, config, isLocked);
  }

  // Événements
  attachSetupEvents(container, onStartDepouillement);
}

function updateSubmodesAndSpecifics(container: HTMLElement, config: Config) {
  const submodeContainer = container.querySelector<HTMLElement>('#submode-container');
  const specificsContainer = container.querySelector<HTMLElement>('#mode-specific-options');
  if (!submodeContainer || !specificsContainer) return;

  if (config.mode === 'binome') {
    submodeContainer.innerHTML = `
      <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.4rem;">Règle de tour (Binômes)</label>
      <select id="setup-sousmode" class="form-control" style="width: 100%; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border); font-family: inherit; font-size: 0.95rem; font-weight: 600;">
        <option value="deux_tours" ${config.sousMode !== 'un_tour' ? 'selected' : ''}>Option A : Scrutin à 2 tours (Majorité absolue au T1, ballottage au T2)</option>
        <option value="un_tour" ${config.sousMode === 'un_tour' ? 'selected' : ''}>Option B : Scrutin à 1 tour direct (Majorité relative dès le T1)</option>
      </select>
    `;
    specificsContainer.style.display = 'block';
    specificsContainer.innerHTML = `
      <strong>⚖️ Règle du scrutin de binômes paritaires :</strong>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
        ${config.sousMode === 'un_tour'
          ? 'Tour unique : le binôme recueillant le plus grand nombre de voix au 1er tour est immédiatement proclamé élu à la majorité relative.'
          : 'Scrutin à deux tours (Code électoral) : au 1er tour, la majorité absolue est nécessaire. Si aucun binôme ne l’obtient, un second tour de ballottage est automatiquement organisé entre les deux premiers binômes.'}
      </p>
    `;
  } else if (config.mode === 'uninominal') {
    submodeContainer.innerHTML = `
      <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.4rem;">Type de scrutin uninominal</label>
      <select id="setup-sousmode" class="form-control" style="width: 100%; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border); font-family: inherit; font-size: 0.95rem;">
        <option value="B" ${config.sousMode !== 'A' ? 'selected' : ''}>Option B : Deux premiers élus directement (1 tour)</option>
        <option value="A" ${config.sousMode === 'A' ? 'selected' : ''}>Option A : Majoritaire à deux tours (majorité absolue requise au T1)</option>
      </select>
    `;
    specificsContainer.style.display = 'none';
  } else if (config.mode === 'classement') {
    submodeContainer.innerHTML = `
      <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.4rem;">Méthode de calcul du classement</label>
      <select id="setup-sousmode" class="form-control" style="width: 100%; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border); font-family: inherit; font-size: 0.95rem;">
        <option value="borda" ${config.sousMode !== 'stv' ? 'selected' : ''}>Méthode de Borda (points dégressifs par rang)</option>
        <option value="stv" ${config.sousMode === 'stv' ? 'selected' : ''}>Vote Unique Transférable / STV (Quota de Droop & reports)</option>
      </select>
    `;
    specificsContainer.style.display = 'block';
    specificsContainer.innerHTML = `
      <strong>⚙️ Barème officiel Borda (5 candidats préférés) :</strong>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0.25rem 0 0.5rem 0;">
        Règle officielle : Chaque électeur classe jusqu'à 5 candidats (1er = 5 pts, 2e = 4 pts, 3e = 3 pts, 4e = 2 pts, 5e = 1 pt). Les non-classés reçoivent 0 pt.
      </p>
      <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
        <label style="font-size: 0.85rem; font-weight: 700;">Barème de points (1er au 5e) :</label>
        <input type="text" id="setup-bareme" placeholder="5, 4, 3, 2, 1" value="${(config.bareme || [5, 4, 3, 2, 1]).join(', ')}" class="form-control" style="width: 100%; max-width: 260px; padding: 0.45rem; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 0.9rem; font-weight: 700;">
      </div>
    `;
  } else if (config.mode === 'corrige') {
    submodeContainer.innerHTML = '';
    specificsContainer.style.display = 'block';
    const currentSeuil = config.seuilRepechage !== undefined ? config.seuilRepechage : 25;
    specificsContainer.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <strong style="display: block; font-size: 0.95rem;">⚖️ Seuil de repêchage paritaire :</strong>
          <span style="font-size: 0.85rem; color: var(--text-muted);">
            Pour être repêché(e) au 2e siège afin d'assurer la mixité Fille/Garçon, le meilleur candidat du sexe opposé doit atteindre ce pourcentage minimal des suffrages exprimés.
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <input type="number" id="setup-seuil" value="${currentSeuil ?? 25}" min="0" max="50" step="5" class="form-control" style="width: 80px; padding: 0.45rem; font-weight: 700; text-align: center; border-radius: var(--radius-sm); border: 1px solid var(--border);">
          <span style="font-weight: 700;">%</span>
        </div>
      </div>
    `;
  } else {
    submodeContainer.innerHTML = '';
    specificsContainer.style.display = 'none';
  }
}

function renderCandidatsList(container: HTMLElement, config: Config, isLocked: boolean) {
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
        <button type="button" class="btn-remove-cand" data-id="${c.id}" title="Supprimer" style="border: none; background: transparent; color: var(--secondary); cursor: pointer; font-size: 1.1rem; padding: 0.2rem 0.4rem;">
          ✕
        </button>
      ` : ''}
    </div>
  `).join('');

  // Events for inputs
  listContainer.querySelectorAll<HTMLInputElement>('.cand-name-input').forEach(input => {
    input.addEventListener('change', () => {
      const id = input.dataset.id;
      const cand = config.candidats.find(c => c.id === id);
      if (cand && input.value.trim()) {
        cand.prenom = input.value.trim();
        store.updateConfig({ candidats: [...config.candidats] });
      }
    });
  });

  listContainer.querySelectorAll<HTMLSelectElement>('.cand-sexe-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const id = sel.dataset.id;
      const cand = config.candidats.find(c => c.id === id);
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
      // Supprimer aussi des binômes si présent
      const updatedBinomes = (config.binomes || []).filter(b => b.fille !== id && b.garcon !== id);
      store.updateConfig({ candidats: updated, binomes: updatedBinomes });
      renderCandidatsList(container, store.getScrutin().config, isLocked);
      if (config.mode === 'binome') {
        renderBinomesList(container, store.getScrutin().config, isLocked);
      }
    });
  });
}

function renderBinomesList(container: HTMLElement, config: Config, isLocked: boolean) {
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
      const id = sel.dataset.id;
      const b = (config.binomes || []).find(it => it.id === id);
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
      const id = sel.dataset.id;
      const b = (config.binomes || []).find(it => it.id === id);
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
      const id = btn.dataset.id;
      const updated = (config.binomes || []).filter(b => b.id !== id);
      store.updateConfig({ binomes: updated });
      renderBinomesList(container, store.getScrutin().config, isLocked);
    });
  });
}

function attachSetupEvents(container: HTMLElement, onStartDepouillement: () => void) {
  const modeSelect = container.querySelector<HTMLSelectElement>('#setup-mode');
  const inscritsInput = container.querySelector<HTMLInputElement>('#setup-inscrits');
  const siegesInput = container.querySelector<HTMLInputElement>('#setup-sieges');
  const departageSelect = container.querySelector<HTMLSelectElement>('#setup-departage');
  const ecoleInput = container.querySelector<HTMLInputElement>('#setup-ecole');
  const classeInput = container.querySelector<HTMLInputElement>('#setup-classe');
  const communeInput = container.querySelector<HTMLInputElement>('#setup-commune');
  const startBtn = container.querySelector<HTMLButtonElement>('#btn-start-count');
  const resetBtn = container.querySelector<HTMLButtonElement>('#btn-reset-election');
  const loadDemoBtn = container.querySelector<HTMLButtonElement>('#btn-load-demo');
  const addCandBtn = container.querySelector<HTMLButtonElement>('#btn-add-candidat');
  const addBinomeBtn = container.querySelector<HTMLButtonElement>('#btn-add-binome');

  if (modeSelect) {
    modeSelect.addEventListener('change', () => {
      const newMode = modeSelect.value as Mode;
      let newSousMode: any = undefined;
      if (newMode === 'binome') newSousMode = 'deux_tours';
      if (newMode === 'uninominal') newSousMode = 'B';
      if (newMode === 'classement') newSousMode = 'borda';

      store.updateConfig({ mode: newMode, sousMode: newSousMode });
      updateSubmodesAndSpecifics(container, store.getScrutin().config);

      const binomesSec = container.querySelector<HTMLElement>('#binomes-section');
      if (binomesSec) {
        binomesSec.style.display = newMode === 'binome' ? 'block' : 'none';
        if (newMode === 'binome') {
          renderBinomesList(container, store.getScrutin().config, false);
        }
      }
    });
  }

  container.addEventListener('change', (e) => {
    const target = e.target as HTMLElement;
    if (target.id === 'setup-sousmode') {
      const sel = target as HTMLSelectElement;
      store.updateConfig({ sousMode: sel.value as any });
      updateSubmodesAndSpecifics(container, store.getScrutin().config);
    } else if (target.id === 'setup-seuil') {
      const inp = target as HTMLInputElement;
      store.updateConfig({ seuilRepechage: parseFloat(inp.value) || 25 });
    } else if (target.id === 'setup-bareme') {
      const inp = target as HTMLInputElement;
      const parts = inp.value.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      if (parts.length > 0) store.updateConfig({ bareme: parts });
    }
  });

  if (inscritsInput) {
    inscritsInput.addEventListener('change', () => {
      const val = parseInt(inscritsInput.value, 10);
      if (val > 0) store.updateConfig({ inscrits: val });
    });
  }

  if (siegesInput) {
    siegesInput.addEventListener('change', () => {
      const val = parseInt(siegesInput.value, 10);
      if (val > 0) store.updateConfig({ sieges: val });
    });
  }

  if (departageSelect) {
    departageSelect.addEventListener('change', () => {
      store.updateConfig({ departage: departageSelect.value as any });
    });
  }

  if (ecoleInput) ecoleInput.addEventListener('change', () => store.updateConfig({ ecole: ecoleInput.value }));
  if (classeInput) classeInput.addEventListener('change', () => store.updateConfig({ classe: classeInput.value }));
  if (communeInput) communeInput.addEventListener('change', () => store.updateConfig({ commune: communeInput.value }));

  if (addCandBtn) {
    addCandBtn.addEventListener('click', () => {
      const config = store.getScrutin().config;
      const newId = 'c-' + (Date.now() % 100000);
      const isF = config.candidats.filter(c => c.sexe === 'F').length <= config.candidats.filter(c => c.sexe === 'G').length;
      const newCand: Candidat = {
        id: newId,
        prenom: isF ? 'Nouvelle Fille' : 'Nouveau Garçon',
        sexe: isF ? 'F' : 'G'
      };
      store.updateConfig({ candidats: [...config.candidats, newCand] });
      renderCandidatsList(container, store.getScrutin().config, false);
      if (config.mode === 'binome') {
        renderBinomesList(container, store.getScrutin().config, false);
      }
    });
  }

  if (addBinomeBtn) {
    addBinomeBtn.addEventListener('click', () => {
      const config = store.getScrutin().config;
      const filles = config.candidats.filter(c => c.sexe === 'F');
      const garcons = config.candidats.filter(c => c.sexe === 'G');
      if (filles.length === 0 || garcons.length === 0) {
        alert('Il faut au moins une candidate Fille et un candidat Garçon pour constituer un binôme !');
        return;
      }
      const newId = 'b-' + (Date.now() % 100000);
      const newBinome = {
        id: newId,
        fille: filles[0].id,
        garcon: garcons[0].id,
        nom: `${filles[0].prenom} & ${garcons[0].prenom}`
      };
      store.updateConfig({ binomes: [...(config.binomes || []), newBinome] });
      renderBinomesList(container, store.getScrutin().config, false);
    });
  }

  if (loadDemoBtn) {
    loadDemoBtn.addEventListener('click', () => {
      store.resetScrutin(getDefaultConfig());
      renderSetupForm(container, onStartDepouillement);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Voulez-vous réinitialiser le dépouillement ? Tous les bulletins saisis seront effacés.')) {
        store.resetScrutin();
        renderSetupForm(container, onStartDepouillement);
      }
    });
  }

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      store.startDepouillement();
      onStartDepouillement();
    });
  }
}
