import { ModalityContent } from './types.js';

export const uninominalContent: ModalityContent = {
  id: 'uninominal',
  title: '2. Scrutin uninominal (2 sièges)',
  subtitle: 'Chaque candidat se présente seul, on vote pour une personne',
  shortDesc: 'Les élèves se présentent individuellement. On vote pour 1 candidat, les 2 premiers sont élus.',
  tag: 'Individuel classique',
  mode: 'uninominal',
  sousModeDefaut: 'B',
  kids: {
    principe: `
      C'est le vote le plus connu : chaque élève qui le souhaite est candidat tout seul avec ses propres idées.
      Dans l'isoloir, tu choisis le bulletin d'une seule personne (garçon ou fille).
    `,
    commentVoter: [
      'Choisis le bulletin d’un(e) seul(e) candidat(e).',
      'Mets-le dans l’enveloppe sans rien écrire dessus.',
      'Glisse ton enveloppe dans l’urne et signe le registre.'
    ],
    quiGagne: `
      À la fin du comptage, on regarde le tableau des scores : les deux personnes qui ont le plus de voix sont élues !
      Attention : il n'y a pas de filtre garçon/fille, donc il est possible que deux filles ou deux garçons gagnent tous les deux si la classe a voté ainsi.
    `,
    egalite: `
      Si le 2e et le 3e ont exactement le même nombre de voix, on départage par tirage au sort ou au bénéfice de l'âge (le plus jeune gagne).
    `,
    pointsForts: [
      'Très simple à comprendre : chacun vote pour son candidat préféré.',
      'Tout le monde peut se présenter librement sans devoir chercher un partenaire.'
    ],
    pointsAttention: [
      'La parité n’est pas garantie : la classe peut se retrouver avec 2 filles ou 2 garçons.',
      'Les voix peuvent être très éparpillées entre beaucoup de candidats.'
    ],
    exempleSimple: 'Exemple : Hugo a 10 voix, Tom a 8 voix, Léa a 5 voix. Hugo et Tom ont le plus de voix : ils sont élus tous les deux (2 garçons).'
  },
  adults: {
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
  }
};
