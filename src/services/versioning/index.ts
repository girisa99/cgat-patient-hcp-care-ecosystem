/**
 * Versioning Services Index
 * P4 Versioning & History (5→8 scenarios complete)
 * 
 * Exports:
 * - Branching Service: Branch creation, merging, snapshots
 * - Version Comparison View: Side-by-side diff UI
 */

export {
  branchingService,
  type Branch,
  type VersionSnapshot,
  type MergeResult,
  type MergeConflict,
} from './branchingService';

// Re-export UI components
export { VersionComparisonView, type VersionData, type PropertyDiff } from '@/components/versioning/VersionComparisonView';
