import { ModalityContent } from './types.js';

export const corrigeContent: ModalityContent = {
  id: 'corrige',
  title: '4. Vote unique avec classement corrigé',
  subtitle: 'Candidatures libres, vote individuel, et parité protégée par une règle claire',
  shortDesc: 'Chacun vote pour 1 candidat. Le premier est élu, et le 2e siège applique une règle de parité sous condition de voix.',
  tag: 'Parité & Démocratie',
  mode: 'corrige',
  kids: {
    principe: `
      Chacun se présente tout seul, et dans l'isoloir tu votes pour une seule personne.
      Mais pour que la classe soit bien représentée par 1 fille et 1 garçon, on applique une règle de justice :
      - La personne arrivée en tête (1ère) gagne toujours sa place.
      - Pour la 2e place, si le 2e est du sexe opposé, il gagne aussi !
      - Si les deux premiers sont du même sexe (par exemple 2 garçons), on regarde la première fille : si elle a réuni assez de voix (au moins un quart des votes), elle est qualifiée pour la 2e place !
    `,
    commentVoter: [
      'Choisis le bulletin d’un(e) seul(e) candidat(e).',
      'Glisse-le dans l’enveloppe et dépose-le dans l’urne.',
      'C’est tout simple : la correction se fait au moment de proclamer les résultats au tableau !'
    ],
    quiGagne: `
      Le numéro 1 est toujours élu.
      Pour le numéro 2 : si la parité n’est pas respectée et que la candidate ou le candidat du sexe opposé a au moins 25 % des voix, elle/il est repêché(e).
      Sinon, si personne de l’autre sexe n’a assez de voix, les deux premiers du classement brut sont élus.
    `,
    egalite: `
      En cas d’égalité pour la 1ère place ou pour le repêchage, tirage au sort transparent ou choix du plus jeune élève.
    `,
    pointsForts: [
      'Candidatures individuelles simples : pas besoin de négocier un binôme avant le vote.',
      'Protège l’égalité fille-garçon tout en exigeant un vrai soutien de la classe (seuil démocratique).'
    ],
    pointsAttention: [
      'Il faut bien expliquer la règle à la classe avant le vote pour que personne ne soit surpris si le 2e brut cède sa place.',
      'L’ordinateur affiche côte à côte le classement brut et le classement corrigé pour que tout soit parfaitement transparent.'
    ],
    exempleSimple: 'Exemple : Hugo a 10 voix, Tom a 7 voix, Léa a 6 voix (sur 23 votants). Hugo est 1er. Tom et Hugo sont 2 garçons. Léa a 26 % des voix (plus que le seuil de 25 %) : Hugo et Léa sont élus !'
  },
  adults: {
    principe: `
      Ce système concilie la liberté totale des candidatures individuelles et l'exigence institutionnelle de parité de la délégation CME.
      Le scrutin se déroule selon le format uninominal à un tour. Le dépouillement établit un classement brut des suffrages, auquel est appliqué un algorithme de correction paritaire conditionnelle :
      1. Le 1er du classement brut est proclamé titulaire du 1er siège.
      2. Si le 2e candidat est de sexe opposé au 1er, il est élu (parité naturelle).
      3. Si les deux premiers sont du même sexe, le 2e siège est attribué au premier candidat du sexe opposé, à condition qu'il atteigne un seuil minimal de représentativité (25 % des suffrages exprimés par défaut).
      4. Si aucun candidat du sexe opposé n'atteint ce seuil, le 2e du classement brut est confirmé, évitant ainsi d'élire un candidat sans assise démocratique suffisante.
    `,
    commentVoter: [
      'Bulletin uninominal individuel standard.',
      'Un seul nom par suffrage.',
      'Saisie directe des bulletins ou des totaux dans le logiciel.'
    ],
    causesNullite: [
      'Plusieurs bulletins différents dans l’enveloppe.',
      'Ratures ou adjonction de mentions manuscrites.',
      'Bulletin non réglementaire.'
    ],
    quiGagne: `
      Siège 1 : tête du classement brut.
      Siège 2 : candidat du sexe opposé le mieux placé ayant atteint le quorum de repêchage (défaut : 25 % des exprimés), à défaut le second du classement brut.
    `,
    reglesMajorite: '1er siège : majorité relative. 2e siège : meilleur score du sexe complémentaire conditionné au seuil de légitimité.',
    egalite: `
      Départage par tirage au sort officiel horodaté ou règle du plus jeune candidat en cas d'égalité sur le seuil ou la qualification.
    `,
    atouts: [
      'Favorise l’engagement individuel sans la contrainte préalable de former un binôme.',
      'Garantit une mixité démocratiquement légitimée (pas de repêchage d’un candidat marginal avec 1 ou 2 voix).',
      'Double affichage pédagogique "Brut vs Corrigé" extrêmement formateur pour l’esprit critique des élèves.'
    ],
    limites: [
      'Nécessite une pédagogie préalable rigoureuse pour éviter tout sentiment de spoliation chez le 2e candidat brut.',
      'Si aucune candidature du sexe opposé ne franchit le seuil, la parité n’est pas atteinte (choix assumé de préserver la légitimité démocratique).'
    ],
    impactParite: 'Favorise fortement la parité (mixité obtenue dans plus de 90 % des configurations réelles de classe), sous réserve d’un soutien électoral minimal.',
    checklistJourJ: [
      'Lire publiquement la règle du seuil de repêchage (25 %) devant l’ensemble de la classe avant l’ouverture de l’urne.',
      'Projeter l’écran de dépouillement en mode "Double Colonne" pour une transparence intégrale.',
      'Faire valider par l’élu municipal référent la justification textuelle générée automatiquement sur le procès-verbal.'
    ]
  }
};
