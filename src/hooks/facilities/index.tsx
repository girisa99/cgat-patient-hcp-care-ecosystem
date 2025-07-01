
/**
 * Facilities Hook Index - Consolidated single source of truth
 * All facilities functionality should go through this unified interface
 */

export { useFacilities } from '../useFacilities';
export { useFacilityData } from './useFacilityData';
export { useFacilityMutations } from './useFacilityMutations';

// This ensures all facilities imports use the same consolidated approach
// No more duplicate hooks or mock data
