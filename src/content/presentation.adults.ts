/**
 * @module content/presentation.adults
 * Rôle : textes de présentation de l'élection CME pour les enseignants et élus.
 */

export const presentationAdults = {
  heroTitle: 'Élections au Conseil Municipal des Enfants (CME) — Guide & Dépouillement',
  heroSubtitle: 'Ressources civiques, présentation comparative des 4 modes de scrutin et outil de dépouillement conforme pour les écoles de Saint-Junien.',
  missionTitle: 'Cadre électoral de Saint-Junien et liberté pédagogique',
  missionHtml: `
    <p>L'élection des conseillers municipaux juniors constitue un moment fondateur du parcours citoyen de l'élève (cycle 3, CM1-CM2). Elle s'apparente aux élections réelles de la République tout en s'adaptant aux choix pédagogiques de chaque classe.</p>
    <div class="notice-box">
      <strong>Règles électorales de Saint-Junien & Recherche de la parité :</strong>
      <p style="margin-top: 0.35rem;">
        Chaque école de Saint-Junien élit <strong>4 représentants au CME, 2 en CM1, 2 en CM2</strong>. Les élections dans les écoles primaires cherchent à se rapprocher de la parité. Cette parité stricte sera obtenue après tirage au sort des élèves de 6e et 5e des deux collèges, en travaillant à une forte représentativité sociale et géographique des élus.
      </p>
      <p style="margin-top: 0.35rem;">
        Dans les écoles primaires, chaque enseignant choisit les modalités d'élection des CME pour intégrer les procédures choisies à ses objectifs pédagogiques. Un élu sera présent le jour de l'élection pour certifier sa conformité.
      </p>
    </div>
  `,
  stepsTitle: 'Organisation matérielle et rôle des acteurs',
  steps: [
    { num: '1', title: 'Le Bureau de vote', text: 'Composé d’un Président (élève ou enseignant), d’assesseurs élèves (émargement et urne) et d’un secrétaire.' },
    { num: '2', title: 'Matériel officiel', text: 'Isoloir garantissant le secret, urne transparente, enveloppes opaques réglementaires, liste d’émargement.' },
    { num: '3', title: 'Rôle de l’Élu municipal', text: 'L’élu(e) référent(e) de la commune supervise la régularité du scrutin, proclame les résultats et cosigne le procès-verbal officiel.' },
    { num: '4', title: 'Procès-Verbal certifié', text: 'L’application génère automatiquement le PV officiel imprimable conforme au code électoral républicain.' }
  ],
  modalitiesIntro: 'Les 4 procédures électorales comparées :',
  modalitiesSummary: [
    { id: 'tab-binome', name: '1. Scrutin de binôme paritaire', desc: 'Candidatures conjointes F+G. Parité assurée à la source, scrutin majoritaire.' },
    { id: 'tab-uninominal', name: '2. Scrutin uninominal à 2 sièges', desc: 'Scrutin classique sans filtre paritaire, risque d’élire 2 personnes du même sexe.' },
    { id: 'tab-classement', name: '3. Vote par classement préférentiel (Borda)', desc: 'Classement des 5 candidats préférés avec barème dégressif (5, 4, 3, 2, 1 points). Consensus maximisé.' },
    { id: 'tab-corrige', name: '4. Vote unique avec correction paritaire', desc: 'Candidatures individuelles libres avec repêchage paritaire conditionné par un seuil.' }
  ]
};
