import { Bulletin, Candidat, Scrutin } from '../engine/types.js';
import { calculateElectionResults } from '../engine/index.js';

interface ScenarioPreset {
  name: string;
  desc: string;
  candidats: Candidat[];
  bulletins: Bulletin[];
}

export function renderSimulatorTab(container: HTMLElement) {
  // Scénarios prédéfinis riches pour démonstration en classe
  const scenarios: ScenarioPreset[] = [
    {
      name: 'Scénario 1 : Deux garçons en tête et une fille forte (23 élèves)',
      desc: '10 voix pour Hugo, 8 voix pour Tom, 5 voix pour Léa. Montre le contraste entre l\'uninominal classique et la correction paritaire.',
      candidats: [
        { id: 'g1', prenom: 'Hugo', sexe: 'G' },
        { id: 'g2', prenom: 'Tom', sexe: 'G' },
        { id: 'f1', prenom: 'Léa', sexe: 'F' },
        { id: 'f2', prenom: 'Emma', sexe: 'F' }
      ],
      bulletins: [
        ...Array(10).fill({ type: 'rang', ordre: ['g1', 'f1', 'g2', 'f2'], t: 1 }),
        ...Array(8).fill({ type: 'rang', ordre: ['g2', 'g1', 'f1', 'f2'], t: 2 }),
        ...Array(5).fill({ type: 'rang', ordre: ['f1', 'g1', 'f2', 'g2'], t: 3 })
      ]
    },
    {
      name: 'Scénario 2 : Le candidat de consensus contre le candidat clivant (25 élèves)',
      desc: 'Alice est le 1er choix d\'une minorité (8), mais détestée par les autres. Bob est le 2e choix de presque tout le monde. Borda révèle le consensus !',
      candidats: [
        { id: 'c1', prenom: 'Alice', sexe: 'F' },
        { id: 'c2', prenom: 'Bob', sexe: 'G' },
        { id: 'c3', prenom: 'Chloé', sexe: 'F' },
        { id: 'c4', prenom: 'David', sexe: 'G' }
      ],
      bulletins: [
        ...Array(8).fill({ type: 'rang', ordre: ['c1', 'c2', 'c3', 'c4'], t: 1 }),
        ...Array(9).fill({ type: 'rang', ordre: ['c3', 'c2', 'c4', 'c1'], t: 2 }),
        ...Array(8).fill({ type: 'rang', ordre: ['c4', 'c2', 'c3', 'c1'], t: 3 })
      ]
    }
  ];

  let activeScenarioIndex = 0;

  function update() {
    const sc = scenarios[activeScenarioIndex];

    // 1. Uninominal (on extrait le rang 1 de chaque bulletin)
    const uninominalBulletins: Bulletin[] = sc.bulletins.map(b => ({
      type: 'choix',
      cible: (b as any).ordre[0],
      t: b.t
    }));
    const scrutinUni: Scrutin = {
      id: 'sc-uni',
      config: {
        mode: 'uninominal',
        sousMode: 'B',
        inscrits: sc.bulletins.length,
        sieges: 2,
        candidats: sc.candidats,
        departage: 'tirage'
      },
      bulletins: uninominalBulletins
    };
    const resUni = calculateElectionResults(scrutinUni);
    const elusUni = (resUni.candidatsResultats || []).filter(c => c.elu).map(c => `${c.candidat.prenom} (${c.candidat.sexe})`);

    // 2. Corrigé (rang 1 de chaque bulletin avec règle de parité seuil 25%)
    const scrutinCorr: Scrutin = {
      id: 'sc-corr',
      config: {
        mode: 'corrige',
        inscrits: sc.bulletins.length,
        sieges: 2,
        candidats: sc.candidats,
        departage: 'tirage',
        seuilRepechage: 25
      },
      bulletins: uninominalBulletins
    };
    const resCorr = calculateElectionResults(scrutinCorr);
    const elusCorr = (resCorr.classementCorrige || []).filter(c => c.elu).map(c => `${c.candidat.prenom} (${c.candidat.sexe})`);

    // 3. Classement Borda
    const scrutinBorda: Scrutin = {
      id: 'sc-borda',
      config: {
        mode: 'classement',
        sousMode: 'borda',
        inscrits: sc.bulletins.length,
        sieges: 2,
        candidats: sc.candidats,
        departage: 'tirage'
      },
      bulletins: sc.bulletins
    };
    const resBorda = calculateElectionResults(scrutinBorda);
    const elusBorda = (resBorda.candidatsResultats || []).filter(c => c.elu).map(c => `${c.candidat.prenom} (${c.candidat.sexe})`);

    // 4. Binômes paritaires
    // Formation de binômes automatiques : F1+G1 vs F2+G2
    const filles = sc.candidats.filter(c => c.sexe === 'F');
    const garcons = sc.candidats.filter(c => c.sexe === 'G');
    const binomes = [
      { id: 'b1', fille: filles[0].id, garcon: garcons[0].id, nom: `${filles[0].prenom} & ${garcons[0].prenom}` },
      { id: 'b2', fille: filles[1]?.id || filles[0].id, garcon: garcons[1]?.id || garcons[0].id, nom: `${filles[1]?.prenom || 'F'} & ${garcons[1]?.prenom || 'G'}` }
    ];
    // Vote binôme : choix du binôme dont au moins un membre est classé en tête
    const binomeBulletins: Bulletin[] = sc.bulletins.map(b => {
      const topId = (b as any).ordre[0];
      const targetBin = binomes.find(bn => bn.fille === topId || bn.garcon === topId) || binomes[0];
      return { type: 'choix', cible: targetBin.id, t: b.t };
    });
    const scrutinBin: Scrutin = {
      id: 'sc-bin',
      config: {
        mode: 'binome',
        inscrits: sc.bulletins.length,
        sieges: 2,
        candidats: sc.candidats,
        binomes,
        departage: 'tirage'
      },
      bulletins: binomeBulletins,
      numeroTour: 2 // pour élire directement le meilleur
    };
    const resBin = calculateElectionResults(scrutinBin);
    const elusBin = (resBin.binomesResultats || []).filter(b => b.elu).map(b => `${b.binome.nom}`);

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div class="presentation-hero" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);">
          <h2>🔮 Le Simulateur « Et si... ? »</h2>
          <p>
            Sur une <strong>même classe</strong> avec les <strong>mêmes préférences d'élèves</strong>, regardez comment le choix de la modalité change les personnes élues !
            C'est la démonstration la plus puissante pour l'esprit civique et critique.
          </p>
        </div>

        <!-- Sélecteur de scénario -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.25rem 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div>
            <strong style="font-size: 1rem;">Choisir un cas d'étude réel :</strong>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 0.2rem;">${sc.desc}</p>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            ${scenarios.map((_, idx) => `
              <button type="button" class="btn ${idx === activeScenarioIndex ? 'btn-primary' : 'btn-secondary'} btn-switch-scenario" data-index="${idx}">
                Cas ${idx + 1}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Grille comparative des 4 modes -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 1.25rem;">
          <!-- 1. Binôme -->
          <div class="pedago-card" style="border-top: 5px solid #3b82f6;">
            <div class="pedago-card-header">
              <div class="pedago-card-icon">👫</div>
              <h3>1. Binôme paritaire</h3>
            </div>
            <div class="pedago-card-body">
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
                Équipe mixte indissociable.
              </div>
              <div style="background: var(--accent-subtle); border-radius: var(--radius-md); padding: 1rem; border: 1px solid var(--accent-light);">
                <span class="badge badge-accent" style="margin-bottom: 0.4rem;">Élus avec cette règle</span>
                <div style="font-size: 1.15rem; font-weight: 800; color: var(--accent);">
                  ${elusBin.join('<br>')}
                </div>
              </div>
              <div style="margin-top: 0.75rem; font-size: 0.85rem;">
                ⚖️ <strong>Parité :</strong> 100% garantie (1 Fille + 1 Garçon).
              </div>
            </div>
          </div>

          <!-- 2. Uninominal -->
          <div class="pedago-card" style="border-top: 5px solid #ef4444;">
            <div class="pedago-card-header">
              <div class="pedago-card-icon">👤</div>
              <h3>2. Uninominal classique</h3>
            </div>
            <div class="pedago-card-body">
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
                Les 2 premiers au nombre de voix brutes.
              </div>
              <div style="background: var(--primary-subtle); border-radius: var(--radius-md); padding: 1rem; border: 1px solid var(--primary-light);">
                <span class="badge badge-primary" style="margin-bottom: 0.4rem;">Élus avec cette règle</span>
                <div style="font-size: 1.15rem; font-weight: 800; color: var(--primary);">
                  ${elusUni.join(' et ')}
                </div>
              </div>
              <div style="margin-top: 0.75rem; font-size: 0.85rem;">
                ⚠️ <strong>Parité :</strong> Non garantie si les 2 premiers sont de même sexe !
              </div>
            </div>
          </div>

          <!-- 3. Borda -->
          <div class="pedago-card" style="border-top: 5px solid #8b5cf6;">
            <div class="pedago-card-header">
              <div class="pedago-card-icon">📊</div>
              <h3>3. Classement Borda</h3>
            </div>
            <div class="pedago-card-body">
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
                Cumul de tous les points de préférence.
              </div>
              <div style="background: var(--primary-subtle); border-radius: var(--radius-md); padding: 1rem; border: 1px solid var(--primary-light);">
                <span class="badge badge-primary" style="margin-bottom: 0.4rem;">Élus avec cette règle</span>
                <div style="font-size: 1.15rem; font-weight: 800; color: var(--primary);">
                  ${elusBorda.join(' et ')}
                </div>
              </div>
              <div style="margin-top: 0.75rem; font-size: 0.85rem;">
                🤝 <strong>Consensus :</strong> Récompense le candidat le plus apprécié par l'ensemble.
              </div>
            </div>
          </div>

          <!-- 4. Corrigé -->
          <div class="pedago-card" style="border-top: 5px solid #10b981;">
            <div class="pedago-card-header">
              <div class="pedago-card-icon">⚖️</div>
              <h3>4. Classement corrigé</h3>
            </div>
            <div class="pedago-card-body">
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
                Candidatures libres + parité sous condition de seuil (25%).
              </div>
              <div style="background: var(--accent-subtle); border-radius: var(--radius-md); padding: 1rem; border: 1px solid var(--accent-light);">
                <span class="badge badge-accent" style="margin-bottom: 0.4rem;">Élus avec cette règle</span>
                <div style="font-size: 1.15rem; font-weight: 800; color: var(--accent);">
                  ${elusCorr.join(' et ')}
                </div>
              </div>
              <div style="margin-top: 0.75rem; font-size: 0.85rem;">
                ✨ <strong>Parité & Justice :</strong> 1F + 1G élus avec légitimité populaire prouvée.
              </div>
            </div>
          </div>
        </div>

        <!-- Débriefing pédagogique -->
        <div style="background: var(--bg-surface); border: 2px dashed var(--primary); border-radius: var(--radius-lg); padding: 1.5rem;">
          <h4 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>💡</span> Ce que cela apprend aux élèves
          </h4>
          <p style="line-height: 1.6; font-size: 0.95rem;">
            Il n'existe pas de "méthode magique parfaite" en démocratie : chaque système électoral privilégie une valeur (la parité absolue, la liberté totale des candidatures individuelles, ou la recherche du compromis).
            <strong>Comprendre ces règles dès l'école primaire, c'est former des citoyens éclairés et vigilants !</strong>
          </p>
        </div>
      </div>
    `;

    // Attachement des clics sur scénarios
    container.querySelectorAll<HTMLButtonElement>('.btn-switch-scenario').forEach(btn => {
      btn.addEventListener('click', () => {
        activeScenarioIndex = parseInt(btn.dataset.index || '0', 10);
        update();
      });
    });
  }

  update();
}
