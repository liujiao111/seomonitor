import { describe, expect, it } from 'vitest';
import { evaluateScanQuota, FREE_MONTHLY_SCAN_LIMIT } from './Subscription';

describe('evaluateScanQuota', () => {
  it('always allows scans on the pro plan', () => {
    const result = evaluateScanQuota('pro', 999);

    expect(result).toEqual({ allowed: true, plan: 'pro', used: 0, limit: null });
  });

  it('allows scans on the free plan while under the monthly limit', () => {
    const result = evaluateScanQuota('free', FREE_MONTHLY_SCAN_LIMIT - 1);

    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(FREE_MONTHLY_SCAN_LIMIT);
  });

  it('blocks scans on the free plan once the monthly limit is reached', () => {
    const result = evaluateScanQuota('free', FREE_MONTHLY_SCAN_LIMIT);

    expect(result.allowed).toBe(false);
  });

  it('blocks scans on the free plan when already over the monthly limit', () => {
    const result = evaluateScanQuota('free', FREE_MONTHLY_SCAN_LIMIT + 1);

    expect(result.allowed).toBe(false);
  });
});
