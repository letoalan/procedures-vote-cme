export const presentationContent = {
  kids: {
    heroTitle: 'Bienvenue aux élections de votre Conseil Municipal des Enfants ! 🗳️',
    heroSubtitle: 'Aujourd’hui, vous devenez de vrais citoyens : vous allez débattre, voter dans l’isoloir et élire vos délégués.',
    missionTitle: 'Le CME à Saint-Junien et la représentation des élèves',
    missionHtml: `
      <p>Le <strong>Conseil Municipal des Enfants (CME)</strong> permet aux élèves de proposer et réaliser de vrais projets pour leur ville : aménager des espaces, agir pour la solidarité, l'écologie et la vie citoyenne.</p>
      <div class="info-card-kid">
        <span class="kid-badge">⚖️ Comment fonctionne l'élection à Saint-Junien ?</span>
        <p><strong>Chaque école de Saint-Junien élit 4 représentants au CME, 2 en CM1, 2 en CM2.</strong></p>
        <p style="margin-top: 0.5rem;">
          Les élections dans les écoles primaires cherchent à se rapprocher de la parité. Cette parité stricte sera obtenue après tirage au sort des élèves de 6e et 5e des deux collèges, en travaillant à une forte représentativité sociale et géographique des élus.
        </p>
        <p style="margin-top: 0.5rem;">
          Dans les écoles primaires, chaque enseignant choisit les modalités d'élection des CME pour intégrer les procédures choisies à ses objectifs pédagogiques. Un élu sera présent le jour de l'élection pour certifier sa conformité.
        </p>
      </div>
    `,
    stepsTitle: 'Les 4 étapes du jour du vote',
    steps: [
      { num: '1', title: 'Prendre les bulletins', text: 'Prenez les bulletins de vote et une enveloppe bleue sur la table de décharge.' },
      { num: '2', title: 'L’isoloir secret', text: 'Entrez seul(e) dans l’isoloir. Personne n’a le droit de regarder votre choix !' },
      { num: '3', title: 'L’urne et « A voté ! »', text: 'Présentez votre carte électorale, glissez l’enveloppe dans l’urne et signez la liste.' },
      { num: '4', title: 'Le dépouillement en direct', text: 'Les assesseurs ouvrent l’urne et comptent les voix sur le grand écran de la classe !' }
    ],
    modalitiesIntro: 'Découvrez les 4 façons de voter :',
    modalitiesSummary: [
      { id: 'tab-binome', name: '1. Binômes paritaires', desc: 'On vote pour une équipe déjà formée (1 fille + 1 garçon).' },
      { id: 'tab-uninominal', name: '2. Scrutin uninominal', desc: 'On vote pour une seule personne, les 2 premiers sont élus.' },
      { id: 'tab-classement', name: '3. Vote par classement (Borda)', desc: 'On classe ses 5 candidats préférés : 1er (5 pts), 2e (4 pts), 3e (3 pts), 4e (2 pts), 5e (1 pt).' },
      { id: 'tab-corrige', name: '4. Classement corrigé', desc: 'On vote pour 1 candidat, et la règle garantit 1 fille et 1 garçon.' }
    ]
  },
  adults: {
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
  }
};
