/**
 * @module content/uninominal
 * Rôle : assemblage des contenus sur le scrutin uninominal.
 * Dépend de : content/types, content/uninominal.kids, content/uninominal.adults.
 */

import { ModalityContent } from './types.js';
import { uninominalKids } from './uninominal.kids.js';
import { uninominalAdults } from './uninominal.adults.js';

export const uninominalContent: ModalityContent = {
  id: 'uninominal',
  title: '2. Scrutin uninominal (2 sièges)',
  subtitle: 'Chaque candidat se présente seul, on vote pour une personne',
  shortDesc: 'Les élèves se présentent individuellement. On vote pour 1 candidat, les 2 premiers sont élus.',
  tag: 'Individuel classique',
  mode: 'uninominal',
  sousModeDefaut: 'B',
  kids: uninominalKids,
  adults: uninominalAdults
};

export * from './uninominal.kids.js';
export * from './uninominal.adults.js';
