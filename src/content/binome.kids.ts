/**
 * @module content/binome.kids
 * Rôle : contenu pédagogique sur les binômes paritaires pour les élèves.
 */

export const binomeKids = {
  principe: `
    Avant le vote, chaque candidat trouve un partenaire du sexe opposé : par exemple Léa et Hugo forment une équipe.
    Sur le bulletin, il y a les deux prénoms ensemble ! En votant pour cette équipe, on élit directement 1 fille et 1 garçon d'un coup.
  `,
  commentVoter: [
    'Prenez les bulletins des différents binômes (ex: "Léa & Hugo", "Emma & Tom").',
    'Dans l’isoloir, choisissez UNE seule enveloppe avec UN seul binôme.',
    'Si vous écrivez sur le papier ou si vous mettez deux papiers différents, le vote sera compté comme nul.'
  ],
  quiGagne: `
    Le binôme qui obtient plus de la moitié des voix au premier tour (la majorité absolue) gagne tout de suite !
    Par exemple, sur 20 votes valables, s'il a 11 voix, il est élu !
    Si personne n'a la majorité, les deux meilleures équipes vont au second tour.
  `,
  egalite: `
    Si deux binômes ont exactement le même nombre de voix, on organise soit un tirage au sort (comme dans les jeux télévisés avec une graine secrète), soit on fait revoter la classe.
  `,
  pointsForts: [
    'C’est super clair : on sait tout de suite avec qui le délégué va travailler.',
    'La parité est garantie à 100 % : il y aura toujours une fille et un garçon élus.'
  ],
  pointsAttention: [
    'Il faut trouver un(e) camarade pour former le binôme avant de pouvoir se présenter.',
    'Si quelqu’un veut être candidat tout seul, il ne peut pas.'
  ],
  exempleSimple: 'Exemple : Léa et Hugo obtiennent 12 voix sur 22 votants. Ils dépassent 11 voix, ils sont élus dès le 1er tour !'
};
