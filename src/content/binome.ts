import { ModalityContent } from './types.js';

export const binomeContent: ModalityContent = {
  id: 'binome',
  title: '1. Binômes paritaires',
  subtitle: 'Une équipe fille + garçon sur chaque bulletin',
  shortDesc: 'Les candidats se présentent par deux (1 fille et 1 garçon). On vote pour un binôme complet.',
  tag: 'Parité à la source',
  mode: 'binome',
  kids: {
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
  },
  adults: {
    principe: `
      Inspiré du scrutin départemental français (loi du 17 mai 2013), ce mode impose une candidature sous forme de ticket mixte indissociable composé obligatoirement d'une fille et d'un garçon. L'électeur dispose d'un suffrage unique et choisit un binôme.
    `,
    commentVoter: [
      'Chaque bulletin imprimé comporte les noms des deux colistiers (F et G).',
      'L’électeur glisse un bulletin unique dans l’enveloppe réglementaire.',
      'Pas de panachage autorisé (raturer un nom ou inscrire un autre candidat annule le suffrage).'
    ],
    causesNullite: [
      'Bulletin raturé ou nom rayé.',
      'Deux bulletins de binômes différents dans la même enveloppe.',
      'Signe distinctif ou mention manuscrite sur le bulletin ou l’enveloppe.'
    ],
    quiGagne: `
      Au premier tour : majorité absolue des suffrages exprimés requise (plus de 50 % des exprimés).
      Si aucun binôme ne franchit ce seuil : organisation d'un second tour entre les deux binômes arrivés en tête (ballottage), où la majorité relative suffit.
    `,
    reglesMajorite: 'Seuil 1er tour : floor(exprimés / 2) + 1. Seuil 2nd tour : majorité relative des voix.',
    egalite: `
      En cas d'égalité stricte au 2nd tour (ou pour la qualification au ballottage) : tirage au sort sous contrôle de l'élu municipal, ou critère du plus jeune âge moyen des binômes.
    `,
    atouts: [
      'Garantie absolue et irréversible de la parité stricte (50 % F, 50 % G).',
      'Apprentissage de la coopération et du travail d’équipe dès la campagne électorale.',
      'Dépouillement simple et rapide, identique à un scrutin uninominal classique.'
    ],
    limites: [
      'Barrière à l’entrée pour les élèves isolés peinant à trouver un(e) partenaire mixte.',
      'Risque de binômes par défaut si le nombre de filles et garçons candidats n’est pas équilibré.'
    ],
    impactParite: 'Parité stricte garantie dès la phase de déclaration de candidature.',
    checklistJourJ: [
      'Vérifier que chaque bulletin imprimé mentionne bien 1 fille et 1 garçon.',
      'Afficher la liste des binômes officiellement validés dans la classe.',
      'Rappeler l’interdiction du panachage avant l’ouverture du scrutin.'
    ]
  }
};
