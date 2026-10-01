export type Audience = 'kids' | 'adults';

export interface SectionContent {
  title: string;
  badge?: string;
  icon?: string;
  contentHtml: string;
}

export interface ModalityContent {
  id: string;
  title: string;
  subtitle: string;
  shortDesc: string;
  tag: string;
  mode: 'binome' | 'uninominal' | 'classement' | 'corrige';
  sousModeDefaut?: string;
  kids: {
    principe: string;
    commentVoter: string[];
    quiGagne: string;
    egalite: string;
    pointsForts: string[];
    pointsAttention: string[];
    exempleSimple: string;
  };
  adults: {
    principe: string;
    commentVoter: string[];
    causesNullite: string[];
    quiGagne: string;
    reglesMajorite: string;
    egalite: string;
    atouts: string[];
    limites: string[];
    impactParite: string;
    checklistJourJ: string[];
  };
}
