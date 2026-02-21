/**
 * Regional Creative Expansion — 40+ expanded regional variants
 * 
 * STUB: This file will be replaced by Claude's full implementation.
 * Provides minimal exports to prevent build errors until the expansion lands.
 */

import type { RegionalStyleVariant } from './castCreativeStylesRegistry';

export const REGIONAL_EXPANSION: Record<string, RegionalStyleVariant> = {};

export function getExpandedRegionalVariant(regionCode: string): RegionalStyleVariant | null {
  return REGIONAL_EXPANSION[regionCode] || null;
}

export function getAllExpandedRegionCodes(): string[] {
  return Object.keys(REGIONAL_EXPANSION);
}
