/**
 * @module content/uninominal.adults
 * Rôle : contenu institutionnel sur le scrutin uninominal pour les adultes.
 */

export const uninominalAdults = {
  principe: `
    Scrutin majoritaire plurinominal où chaque électeur exprime une préférence individuelle pour pourvoir deux sièges vacants. Deux déclinaisons possibles :
    - Option B (défaut) : Scrutin plurinominal à un tour — les deux candidats recueillant le plus de voix sont directement proclamés élus.
    - Option A : Scrutin majoritaire à deux tours — élection au 1er tour à la majorité absolue, second tour pour les sièges restants.
  `,
  commentVoter: [
    'L’électeur choisit un bulletin individuel parmi l’ensemble des candidatures enregistrées.',
    'Une seule voix par électeur.',
    'Tout bulletin comportant plusieurs noms ou une rature est nul.'
  ],
  causesNullite: [
    'Plusieurs bulletins différents insérés dans l’enveloppe.',
    'Bulletin blanc sans mention manuscrite (décompté à part comme blanc, non nul).',
    'Annotation ou signe de reconnaissance volontaire.'
  ],
  quiGagne: `
    En mode B : les deux candidats obtenant le plus grand nombre de suffrages exprimés sont élus.
    En mode A : au 1er tour, seuls sont élus les candidats ayant obtenu la majorité absolue (floor(exprimés/2) + 1). Un 2nd tour est ouvert pour pourvoir le second siège parmi les candidats en ballottage.
  `,
  reglesMajorite: 'Mode B : majorité relative des suffrages. Mode A : majorité absolue au T1, majorité relative au T2.',
  egalite: `
    En cas d'ex æquo pour le 2e siège : application immédiate de la règle décidée avant le vote (tirage au sort scellé ou règle républicaine du plus jeune candidat).
  `,
  atouts: [
    'Liberté absolue de candidature individuelle sans contrainte préalable.',
    'Compréhension immédiate par le corps électoral scolaire.',
    'Scrutin rapide à dépouiller et simuler.'
  ],
  limites: [
    'Absence de tout mécanisme de garantie paritaire : 50 % de probabilité théorique d’élire une délégation monogenre.',
    'Dispersion des voix possible lors de candidatures multiples dans une même classe.'
  ],
  impactParite: 'Aucune garantie de mixité. Déconseillé si la charte municipale impose la parité fille-garçon.',
  checklistJourJ: [
    'Vérifier l’ordre alphabétique des bulletins sur la table de décharge.',
    'Expliquer clairement aux élèves qu’on ne met qu’un seul prénom dans l’enveloppe.',
    'Régler au préalable la modalité de départage en cas d’égalité sur le second siège.'
  ]
};
