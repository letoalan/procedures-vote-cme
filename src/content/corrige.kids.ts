/**
 * @module content/corrige.kids
 * Rôle : contenu pédagogique sur le vote unique à classement corrigé pour les élèves.
 */

export const corrigeKids = {
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
};
