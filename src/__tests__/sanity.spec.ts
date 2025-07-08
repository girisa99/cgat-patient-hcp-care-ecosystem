/// <reference types="vitest" />
// @ts-nocheck
import { describe, it, expect } from 'vitest';

describe('sanity', () => {
  it('should add numbers correctly', () => {
    expect(1 + 1).toBe(2);
  });
});