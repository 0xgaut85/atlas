import { describe, it, expect } from 'vitest';
import { validateTokenParams } from '../utils/validation';

describe('validateTokenParams', () => {
  it('should validate correct token parameters', () => {
    const params = {
      name: 'Test Token',
      symbol: 'TEST',
      supply: '1000000',
      network: 'base',
    };

    const result = validateTokenParams(params);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid symbol length', () => {
    const params = {
      name: 'Test Token',
      symbol: 'T',
      supply: '1000000',
      network: 'base',
    };

    const result = validateTokenParams(params);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

