import { describe, it, expect } from 'vitest';
import { estSeuilAtteint, majoriteAbsolue, quotaSur, seuilVoix } from '../../src/engine/thresholds.js';

describe('Thresholds calculations', () => {
  it('calculates absolute majority', () => {
    expect(majoriteAbsolue(20)).toBe(11);
    expect(majoriteAbsolue(23)).toBe(12);
    expect(majoriteAbsolue(0)).toBe(1);
  });

  it('calculates Droop / safe election quota', () => {
    expect(quotaSur(20, 2)).toBe(7);
    expect(quotaSur(23, 2)).toBe(8);
  });

  it('calculates threshold percentages and tests eligibility', () => {
    expect(seuilVoix(23, 25)).toBe(6); // ceil(23 * 0.25) = ceil(5.75) = 6
    expect(estSeuilAtteint(6, 23, 25)).toBe(true);
    expect(estSeuilAtteint(5, 23, 25)).toBe(false);
    expect(estSeuilAtteint(3, 23, null)).toBe(true);
  });
});
