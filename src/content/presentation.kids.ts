/**
 * @module content/presentation.kids
 * Rôle : textes de présentation générale de l'élection CME pour les élèves.
 */

export const presentationKids = {
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
};
