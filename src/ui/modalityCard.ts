/**
 * @module ui/modalityCard
 * Rôle : gabarits HTML des fiches de modalité pour les élèves et les adultes.
 * Dépend de : content/types.
 */

import { ModalityContent } from '../content/types.js';

export function renderKidsHtml(data: ModalityContent): string {
  const k = data.kids;
  return `
    <div class="modality-grid">
      <div class="pedago-card">
        <div class="pedago-card-header"><div class="pedago-card-icon">💡</div><h3>Le principe en classe</h3></div>
        <div class="pedago-card-body"><p>${k.principe.trim()}</p></div>
      </div>
      <div class="pedago-card">
        <div class="pedago-card-header"><div class="pedago-card-icon">🗳️</div><h3>Comment voter dans l’isoloir</h3></div>
        <div class="pedago-card-body"><ul class="pedago-list steps">${k.commentVoter.map(s => `<li>${s}</li>`).join('')}</ul></div>
      </div>
      <div class="pedago-card">
        <div class="pedago-card-header"><div class="pedago-card-icon">🏆</div><h3>Qui gagne l’élection ?</h3></div>
        <div class="pedago-card-body">
          <p>${k.quiGagne.trim()}</p>
          <div class="example-highlight-box" style="margin-top: 0.75rem;"><strong>⚖️ En cas d'égalité :</strong><p>${k.egalite.trim()}</p></div>
        </div>
      </div>
      <div class="pedago-card">
        <div class="pedago-card-header"><div class="pedago-card-icon">⭐</div><h3>Ce qu'on aime / À quoi faire attention</h3></div>
        <div class="pedago-card-body">
          <strong style="color: var(--accent); font-size: 0.9rem;">Ce qui est super :</strong>
          <ul class="pedago-list" style="margin: 0.35rem 0 0.85rem 0;">${k.pointsForts.map(p => `<li>${p}</li>`).join('')}</ul>
          <strong style="color: var(--warning); font-size: 0.9rem;">À ne pas oublier :</strong>
          <ul class="pedago-list warning" style="margin-top: 0.35rem;">${k.pointsAttention.map(p => `<li>${p}</li>`).join('')}</ul>
        </div>
      </div>
    </div>
    <div class="pedago-card" style="border-left: 5px solid var(--primary-light);">
      <div class="pedago-card-header"><div class="pedago-card-icon">📝</div><h3>Exemple en direct pour bien comprendre</h3></div>
      <div class="pedago-card-body"><p style="font-size: 1.05rem; font-weight: 500;">${k.exempleSimple}</p></div>
    </div>
  `;
}

export function renderAdultsHtml(data: ModalityContent): string {
  const a = data.adults;
  return `
    <div class="modality-grid">
      <div class="pedago-card">
        <div class="pedago-card-header"><div class="pedago-card-icon">📜</div><h3>Cadre électoral & Principe juridique</h3></div>
        <div class="pedago-card-body"><p>${a.principe.trim()}</p></div>
      </div>
      <div class="pedago-card">
        <div class="pedago-card-header"><div class="pedago-card-icon">🗳️</div><h3>Forme du bulletin & Validité du vote</h3></div>
        <div class="pedago-card-body">
          <ul class="pedago-list steps">${a.commentVoter.map(s => `<li>${s}</li>`).join('')}</ul>
          <strong style="color: var(--secondary); font-size: 0.85rem; display: block; margin-top: 0.75rem;">Causes de nullité :</strong>
          <ul class="pedago-list warning" style="margin-top: 0.35rem;">${a.causesNullite.map(c => `<li>${c}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="pedago-card">
        <div class="pedago-card-header"><div class="pedago-card-icon">📊</div><h3>Attribution des sièges & Majorités</h3></div>
        <div class="pedago-card-body">
          <p>${a.quiGagne.trim()}</p>
          <div class="notice-box" style="margin-top: 0.5rem; font-size: 0.84rem;"><strong>Règle formelle :</strong> ${a.reglesMajorite}</div>
          <div class="example-highlight-box" style="margin-top: 0.5rem;"><strong>⚖️ Départage en cas d'égalité :</strong><p>${a.egalite.trim()}</p></div>
        </div>
      </div>
      <div class="pedago-card">
        <div class="pedago-card-header"><div class="pedago-card-icon">⚖️</div><h3>Analyse critique & Effet sur la parité</h3></div>
        <div class="pedago-card-body">
          <strong style="color: var(--accent); font-size: 0.85rem;">Atouts majeurs :</strong>
          <ul class="pedago-list" style="margin: 0.35rem 0 0.75rem 0;">${a.atouts.map(at => `<li>${at}</li>`).join('')}</ul>
          <strong style="color: var(--warning); font-size: 0.85rem;">Limites & Vigilances :</strong>
          <ul class="pedago-list warning" style="margin: 0.35rem 0 0.75rem 0;">${a.limites.map(l => `<li>${l}</li>`).join('')}</ul>
          <div class="notice-box" style="margin-top: 0.5rem;"><strong>Impact sur la parité :</strong> ${a.impactParite}</div>
        </div>
      </div>
    </div>
    <div class="pedago-card" style="border-left: 5px solid var(--accent);">
      <div class="pedago-card-header"><div class="pedago-card-icon">📋</div><h3>Check-list du jour J (Enseignant & Élu municipal)</h3></div>
      <div class="pedago-card-body">
        <ul class="pedago-list steps" style="columns: 2; column-gap: 2rem;">${a.checklistJourJ.map(c => `<li>${c}</li>`).join('')}</ul>
      </div>
    </div>
  `;
}
