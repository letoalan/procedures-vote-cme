/**
 * @module content/classement.adults
 * Rôle : contenu institutionnel sur la méthode de Borda pour les adultes.
 */

export const classementAdults = {
  principe: `
    Scrutin préférentiel pondéré reposant sur la méthode de Jean-Charles de Borda, limité aux 5 candidats préférés par ordre décroissant de préférence.
    <br><br>
    <strong>Barème officiel dégressif :</strong>
    <ul style="margin: 0.5rem 0 0.5rem 1.5rem; line-height: 1.7;">
      <li><strong>Rang 1</strong> : <strong>5 points</strong></li>
      <li><strong>Rang 2</strong> : <strong>4 points</strong></li>
      <li><strong>Rang 3</strong> : <strong>3 points</strong></li>
      <li><strong>Rang 4</strong> : <strong>2 points</strong></li>
      <li><strong>Rang 5</strong> : <strong>1 point</strong></li>
      <li><strong>Candidats non classés</strong> : <strong>0 point</strong></li>
    </ul>
    Cette limitation aux 5 premiers choix est idéale pour le cycle 3 : elle allège la charge cognitive de l'élève tout en captant fidèlement le consensus de la classe.
  `,
  commentVoter: [
    'Bulletin unique comportant la liste nominative des candidats et une case de numérotation.',
    'L’élève classe librement jusqu’à 5 candidats en inscrivant les chiffres 1, 2, 3, 4, 5.',
    'Le vote partiel est pleinement recevable : un bulletin ordonnant seulement 2 ou 3 candidats attribue les points des rangs renseignés (les rangs non renseignés rapportent 0 point).'
  ],
  causesNullite: [
    'Attribution d’un même numéro d’ordre à plusieurs candidats distincts (ex: deux n°1).',
    'Rupture d’ordre ou mention équivoque rendant impossible l’identification des rangs.',
    'Signe distinctif, dessin ou signature de l’électeur sur le bulletin ou l’enveloppe.'
  ],
  quiGagne: `
    Agrégation intégrale de l'ensemble des points obtenus par chaque candidat sur l'ensemble des bulletins exprimés.
    Les deux candidats cumulant le plus grand score de points Borda sont proclamés élus titulaires.
  `,
  reglesMajorite: 'Maximisation du consensus préférentiel global (somme pondérée des rangs : 5, 4, 3, 2, 1 pts).',
  egalite: `
    Départage hiérarchique via la matrice des rangs : 
    1. Candidat ayant recueilli le plus de 1ers rangs (5 pts).
    2. À défaut, candidat ayant recueilli le plus de 2es rangs (4 pts), puis 3es (3 pts), etc.
    3. Si l’égalité persiste sur tous les rangs : tirage au sort certifié ou règle républicaine du plus jeune âge.
  `,
  atouts: [
    'Neutralise le vote utile et valorise les candidatures de compromis et de concorde.',
    'Permet à chaque électeur d’exprimer des nuances fortes grâce au barème 5, 4, 3, 2, 1.',
    'Outil pédagogique de premier plan sur la théorie du vote et l’agrégation des préférences.'
  ],
  limites: [
    'Demande des consignes claires au tableau lors de l’émargement pour éviter les doublons de chiffres.',
    'Absence de filtre paritaire automatique (élection des 2 premiers aux points sans considération de genre).'
  ],
  impactParite: 'Non paritaire par nature. Les 2 candidats obtenant le plus de points Borda sont élus.',
  checklistJourJ: [
    'Afficher lisiblement au tableau le barème des points : 1er=5 pts, 2e=4 pts, 3e=3 pts, 4e=2 pts, 5e=1 pt.',
    'Rappeler la règle : « Jusqu’à 5 candidats préférés, jamais deux fois le même numéro ».',
    'Utiliser le tableau de dépouillement en direct de l’application qui décompte instantanément les points et la matrice des rangs.'
  ]
};
