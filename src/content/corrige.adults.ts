/**
 * @module content/corrige.adults
 * Rôle : contenu institutionnel sur le vote corrigé pour les adultes.
 */

export const corrigeAdults = {
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
};
