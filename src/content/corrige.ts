/**
 * @module content/corrige
 * Rôle : assemblage des contenus sur le vote unique avec classement corrigé.
 * Dépend de : content/types, content/corrige.kids, content/corrige.adults.
 */

import { ModalityContent } from './types.js';
import { corrigeKids } from './corrige.kids.js';
import { corrigeAdults } from './corrige.adults.js';

export const corrigeContent: ModalityContent = {
  id: 'corrige',
  title: '4. Vote unique avec classement corrigé',
  subtitle: 'Candidatures libres, vote individuel, et parité protégée par une règle claire',
  shortDesc: 'Chacun vote pour 1 candidat. Le premier est élu, et le 2e siège applique une règle de parité sous condition de voix.',
  tag: 'Parité & Démocratie',
  mode: 'corrige',
  kids: corrigeKids,
  adults: corrigeAdults
};

export * from './corrige.kids.js';
export * from './corrige.adults.js';
