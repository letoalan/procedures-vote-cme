/**
 * @module content/presentation
 * Rôle : assemblage des contenus de présentation pour tous les publics.
 * Dépend de : content/presentation.kids, content/presentation.adults.
 */

import { presentationKids } from './presentation.kids.js';
import { presentationAdults } from './presentation.adults.js';

export const presentationContent = {
  kids: presentationKids,
  adults: presentationAdults
};

export * from './presentation.kids.js';
export * from './presentation.adults.js';
