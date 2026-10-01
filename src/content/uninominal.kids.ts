/**
 * @module content/uninominal.kids
 * Rôle : contenu pédagogique sur le scrutin uninominal pour les élèves.
 */

export const uninominalKids = {
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
};
