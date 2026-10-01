import { ModalityContent } from './types.js';

export const classementContent: ModalityContent = {
  id: 'classement',
  title: '3. Vote par classement préférentiel (Borda)',
  subtitle: 'Chaque électeur classe ses 5 candidats préférés : 1er (5 pts), 2e (4 pts), 3e (3 pts), 4e (2 pts), 5e (1 pt)',
  shortDesc: 'Au lieu de voter pour 1 seul candidat, chaque élève ordonne ses 5 préférés. Les points accumulés désignent les vainqueurs du consensus.',
  tag: 'Consensus & Nuance (5 choix)',
  mode: 'classement',
  sousModeDefaut: 'borda',
  kids: {
    principe: `
      Dans l’isoloir, tu ne choisis pas un seul candidat : tu choisis tes <strong>5 candidats préférés</strong> et tu les numérotes de 1 à 5 selon ton ordre de préférence !
      <br><br>
      Chaque place rapporte des points précieux :
      <ul style="margin: 0.5rem 0 0.5rem 1.5rem; line-height: 1.8;">
        <li>🥇 <strong>1er choix</strong> = <strong>5 points</strong> (ton grand favori)</li>
        <li>🥈 <strong>2e choix</strong> = <strong>4 points</strong></li>
        <li>🥉 <strong>3e choix</strong> = <strong>3 points</strong></li>
        <li><strong>4e choix</strong> = <strong>2 points</strong></li>
        <li><strong>5e choix</strong> = <strong>1 point</strong></li>
        <li><strong>Tous les autres candidats</strong> = <strong>0 point</strong></li>
      </ul>
      Tous les points donnés par tous les élèves de la classe sont additionnés à la fin du vote !
    `,
    commentVoter: [
      'Prends le bulletin unique comportant la liste de tous les candidats de la classe.',
      'Dans l’isoloir, écris 1 devant ton candidat préféré (5 pts), 2 devant ton 2e (4 pts), 3 devant ton 3e (3 pts), 4 devant ton 4e (2 pts) et 5 devant ton 5e (1 pt).',
      'Tu peux classer moins de 5 personnes si tu n’as que 2 ou 3 préférences (vote partiel autorisé).',
      'Attention : n’écris jamais deux fois le même chiffre pour deux personnes différentes, sinon ton vote sera nul !'
    ],
    quiGagne: `
      Le logiciel additionne tous les points reçus par chaque candidat.
      Les deux élèves qui obtiennent le plus grand total de points gagnent les 2 sièges de délégués !
      C’est le candidat qui rassemble le plus d'élèves qui gagne, même s’il n'était pas toujours 1er.
    `,
    egalite: `
      En cas d'égalité sur le total des points, on regarde qui a eu le plus de 1ères places (à 5 points), puis qui a eu le plus de 2es places (à 4 points)... Si l'égalité persiste encore, on procède au tirage au sort !
    `,
    pointsForts: [
      'Chacun de tes 5 choix compte vraiment et aide tes camarades préférés !',
      'Récompense les élèves rassembleurs et appréciés par une large majorité de la classe.',
      'Finie l\'obligation de ne choisir qu\'une seule personne !'
    ],
    pointsAttention: [
      'Il faut bien numéroter de 1 à 5 sans mettre de doublons sur le bulletin.',
      'Comme pour l’uninominal, la parité fille-garçon n’est pas garantie automatiquement (les 2 meilleurs scores en points sont élus).'
    ],
    exempleSimple: 'Exemple : Hugo est classé 1er par 4 élèves (4 × 5 pts = 20 pts) et 2e par 3 élèves (3 × 4 pts = 12 pts). Il cumule déjà 32 points ! On fait la même chose pour tout le monde.'
  },
  adults: {
    principe: `
      Scrutin préférentiel pondéré reposant sur la <a href="https://fr.wikipedia.org/wiki/M%C3%A9thode_Borda" target="_blank" rel="noopener noreferrer" style="color: var(--primary-light); text-decoration: underline; font-weight: 600;">méthode de Jean-Charles de Borda</a>, <strong>limité aux 5 candidats préférés</strong> par ordre décroissant de préférence.
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
  }
};
