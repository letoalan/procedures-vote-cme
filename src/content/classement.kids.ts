/**
 * @module content/classement.kids
 * Rôle : contenu pédagogique sur le vote par classement (Borda) pour les élèves.
 */

export const classementKids = {
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
};
