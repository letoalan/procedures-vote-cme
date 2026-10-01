/**
 * @module content/binome
 * Rôle : assemblage des contenus sur les binômes paritaires.
 * Dépend de : content/types, content/binome.kids, content/binome.adults.
 */

import { ModalityContent } from './types.js';
import { binomeKids } from './binome.kids.js';
import { binomeAdults } from './binome.adults.js';

export const binomeContent: ModalityContent = {
  id: 'binome',
  title: '1. Binômes paritaires',
  subtitle: 'Une équipe fille + garçon sur chaque bulletin',
  shortDesc: 'Les candidats se présentent par deux (1 fille et 1 garçon). On vote pour un binôme complet.',
  tag: 'Parité à la source',
  mode: 'binome',
  kids: binomeKids,
  adults: binomeAdults
};

export * from './binome.kids.js';
export * from './binome.adults.js';
