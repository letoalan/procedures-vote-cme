/**
 * @module content/classement
 * Rôle : assemblage des contenus sur le vote par classement (Borda).
 * Dépend de : content/types, content/classement.kids, content/classement.adults.
 */

import { ModalityContent } from './types.js';
import { classementKids } from './classement.kids.js';
import { classementAdults } from './classement.adults.js';

export const classementContent: ModalityContent = {
  id: 'classement',
  title: '3. Vote par classement préférentiel (Borda)',
  subtitle: 'Chaque électeur classe ses 5 candidats préférés : 1er (5 pts), 2e (4 pts), 3e (3 pts), 4e (2 pts), 5e (1 pt)',
  shortDesc: 'Au lieu de voter pour 1 seul candidat, chaque élève ordonne ses 5 préférés. Les points accumulés désignent les vainqueurs du consensus.',
  tag: 'Consensus & Nuance (5 choix)',
  mode: 'classement',
  sousModeDefaut: 'borda',
  kids: classementKids,
  adults: classementAdults
};

export * from './classement.kids.js';
export * from './classement.adults.js';
