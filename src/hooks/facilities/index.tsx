
/**
 * Facilities Hook Index - Consolidated single source of truth
 * All facilities functionality should go through this unified interface
 */

export { useMasterFacilities as useFacilities } from '../useMasterFacilities';
// Legacy hook removed - use useMasterData instead
// export { useFacilityData } from './useFacilityData';
// useFacilityMutations removed - use useMasterFacilities instead

// This ensures all facilities imports use the same consolidated approach
// No more duplicate hooks or mock data
