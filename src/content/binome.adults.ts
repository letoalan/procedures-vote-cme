/**
 * @module content/binome.adults
 * Rôle : contenu institutionnel sur le scrutin de binôme pour les adultes.
 */

export const binomeAdults = {
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
};
