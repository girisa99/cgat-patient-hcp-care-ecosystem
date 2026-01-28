/**
 * Branching Service
 * P4-VER-07/08: Version branching and merge support
 * 
 * Features:
 * - Create branches from any version
 * - Track branch lineage
 * - Merge branches with conflict detection
 * - Named snapshots/tags
 */

import { supabase } from '@/integrations/supabase/client';

export interface Branch {
  id: string;
  name: string;
  projectId: string;
  parentBranchId: string | null;
  baseVersionId: string;
  headVersionId: string;
  createdAt: string;
  createdBy: string;
  status: 'active' | 'merged' | 'abandoned';
  mergedAt?: string;
  mergedInto?: string;
  metadata?: Record<string, unknown>;
}

export interface VersionSnapshot {
  id: string;
  projectId: string;
  branchId: string;
  versionId: string;
  name: string;
  description?: string;
  createdAt: string;
  createdBy: string;
  tags: string[];
  isLocked: boolean;
}

export interface MergeResult {
  success: boolean;
  conflicts: MergeConflict[];
  resolvedData?: Record<string, unknown>;
  mergedVersionId?: string;
}

export interface MergeConflict {
  path: string;
  baseValue: unknown;
  sourceValue: unknown;
  targetValue: unknown;
  resolution?: 'source' | 'target' | 'manual';
  resolvedValue?: unknown;
}

class BranchingService {
  private branches: Map<string, Branch> = new Map();
  private snapshots: Map<string, VersionSnapshot> = new Map();
  private readonly STORAGE_KEY = 'versioning_branches';
  private readonly SNAPSHOTS_KEY = 'versioning_snapshots';

  constructor() {
    this.loadFromStorage();
  }

  // ============================================================================
  // STORAGE
  // ============================================================================

  private loadFromStorage(): void {
    try {
      const branchData = localStorage.getItem(this.STORAGE_KEY);
      if (branchData) {
        const parsed = JSON.parse(branchData) as Branch[];
        parsed.forEach(b => this.branches.set(b.id, b));
      }

      const snapshotData = localStorage.getItem(this.SNAPSHOTS_KEY);
      if (snapshotData) {
        const parsed = JSON.parse(snapshotData) as VersionSnapshot[];
        parsed.forEach(s => this.snapshots.set(s.id, s));
      }
    } catch (e) {
      console.warn('[BranchingService] Failed to load from storage:', e);
    }
  }

  private persistToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(Array.from(this.branches.values())));
      localStorage.setItem(this.SNAPSHOTS_KEY, JSON.stringify(Array.from(this.snapshots.values())));
    } catch (e) {
      console.warn('[BranchingService] Failed to persist to storage:', e);
    }
  }

  // ============================================================================
  // BRANCH MANAGEMENT
  // ============================================================================

  async createBranch(
    projectId: string,
    name: string,
    baseVersionId: string,
    userId: string,
    parentBranchId?: string
  ): Promise<Branch> {
    // Validate branch name
    if (!this.isValidBranchName(name)) {
      throw new Error('Invalid branch name. Use alphanumeric characters, hyphens, and underscores.');
    }

    // Check for duplicate names in project
    const existing = Array.from(this.branches.values()).find(
      b => b.projectId === projectId && b.name === name && b.status === 'active'
    );
    if (existing) {
      throw new Error(`Branch "${name}" already exists in this project.`);
    }

    const branch: Branch = {
      id: `branch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      projectId,
      parentBranchId: parentBranchId || null,
      baseVersionId,
      headVersionId: baseVersionId,
      createdAt: new Date().toISOString(),
      createdBy: userId,
      status: 'active',
    };

    this.branches.set(branch.id, branch);
    this.persistToStorage();

    console.info(`[BranchingService] Created branch: ${name} from version ${baseVersionId}`);
    return branch;
  }

  async updateBranchHead(branchId: string, newVersionId: string): Promise<void> {
    const branch = this.branches.get(branchId);
    if (!branch) throw new Error('Branch not found');
    if (branch.status !== 'active') throw new Error('Cannot update inactive branch');

    branch.headVersionId = newVersionId;
    this.persistToStorage();
  }

  async abandonBranch(branchId: string): Promise<void> {
    const branch = this.branches.get(branchId);
    if (!branch) throw new Error('Branch not found');

    branch.status = 'abandoned';
    this.persistToStorage();

    console.info(`[BranchingService] Abandoned branch: ${branch.name}`);
  }

  getBranch(branchId: string): Branch | null {
    return this.branches.get(branchId) || null;
  }

  getBranchesForProject(projectId: string, includeInactive = false): Branch[] {
    return Array.from(this.branches.values()).filter(
      b => b.projectId === projectId && (includeInactive || b.status === 'active')
    );
  }

  getBranchTree(projectId: string): Map<string, Branch[]> {
    const branches = this.getBranchesForProject(projectId, true);
    const tree = new Map<string, Branch[]>();

    // Group by parent
    branches.forEach(branch => {
      const parentId = branch.parentBranchId || 'root';
      if (!tree.has(parentId)) {
        tree.set(parentId, []);
      }
      tree.get(parentId)!.push(branch);
    });

    return tree;
  }

  private isValidBranchName(name: string): boolean {
    return /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(name) && name.length <= 64;
  }

  // ============================================================================
  // MERGING
  // ============================================================================

  async mergeBranches(
    sourceBranchId: string,
    targetBranchId: string,
    sourceData: Record<string, unknown>,
    targetData: Record<string, unknown>,
    baseData: Record<string, unknown>,
    userId: string
  ): Promise<MergeResult> {
    const sourceBranch = this.branches.get(sourceBranchId);
    const targetBranch = this.branches.get(targetBranchId);

    if (!sourceBranch || !targetBranch) {
      throw new Error('One or both branches not found');
    }

    // Detect conflicts using three-way merge
    const conflicts = this.detectConflicts(baseData, sourceData, targetData);

    if (conflicts.length > 0) {
      return {
        success: false,
        conflicts,
      };
    }

    // Auto-merge if no conflicts
    const mergedData = this.autoMerge(baseData, sourceData, targetData);

    // Mark source branch as merged
    sourceBranch.status = 'merged';
    sourceBranch.mergedAt = new Date().toISOString();
    sourceBranch.mergedInto = targetBranchId;
    this.persistToStorage();

    console.info(`[BranchingService] Merged ${sourceBranch.name} into ${targetBranch.name}`);

    return {
      success: true,
      conflicts: [],
      resolvedData: mergedData,
    };
  }

  private detectConflicts(
    base: Record<string, unknown>,
    source: Record<string, unknown>,
    target: Record<string, unknown>,
    prefix = ''
  ): MergeConflict[] {
    const conflicts: MergeConflict[] = [];
    const allKeys = new Set([...Object.keys(base), ...Object.keys(source), ...Object.keys(target)]);

    allKeys.forEach(key => {
      const path = prefix ? `${prefix}.${key}` : key;
      const baseVal = base[key];
      const sourceVal = source[key];
      const targetVal = target[key];

      // Both modified from base differently = conflict
      const sourceChanged = JSON.stringify(baseVal) !== JSON.stringify(sourceVal);
      const targetChanged = JSON.stringify(baseVal) !== JSON.stringify(targetVal);
      const sameChange = JSON.stringify(sourceVal) === JSON.stringify(targetVal);

      if (sourceChanged && targetChanged && !sameChange) {
        // Recurse into objects
        if (typeof sourceVal === 'object' && typeof targetVal === 'object' &&
            sourceVal !== null && targetVal !== null &&
            !Array.isArray(sourceVal) && !Array.isArray(targetVal)) {
          conflicts.push(...this.detectConflicts(
            (baseVal || {}) as Record<string, unknown>,
            sourceVal as Record<string, unknown>,
            targetVal as Record<string, unknown>,
            path
          ));
        } else {
          conflicts.push({
            path,
            baseValue: baseVal,
            sourceValue: sourceVal,
            targetValue: targetVal,
          });
        }
      }
    });

    return conflicts;
  }

  private autoMerge(
    base: Record<string, unknown>,
    source: Record<string, unknown>,
    target: Record<string, unknown>
  ): Record<string, unknown> {
    const result: Record<string, unknown> = { ...target };
    const allKeys = new Set([...Object.keys(base), ...Object.keys(source), ...Object.keys(target)]);

    allKeys.forEach(key => {
      const baseVal = base[key];
      const sourceVal = source[key];
      const targetVal = target[key];

      const sourceChanged = JSON.stringify(baseVal) !== JSON.stringify(sourceVal);
      const targetChanged = JSON.stringify(baseVal) !== JSON.stringify(targetVal);

      if (sourceChanged && !targetChanged) {
        // Only source changed - take source
        result[key] = sourceVal;
      } else if (!sourceChanged && targetChanged) {
        // Only target changed - keep target
        result[key] = targetVal;
      } else if (sourceChanged && targetChanged) {
        // Both changed - if same change, use it; otherwise conflict (already handled)
        if (JSON.stringify(sourceVal) === JSON.stringify(targetVal)) {
          result[key] = sourceVal;
        }
      }
      // Neither changed - keep base/target
    });

    return result;
  }

  async resolveConflict(
    conflict: MergeConflict,
    resolution: 'source' | 'target' | 'manual',
    manualValue?: unknown
  ): Promise<MergeConflict> {
    return {
      ...conflict,
      resolution,
      resolvedValue: resolution === 'manual' ? manualValue :
                     resolution === 'source' ? conflict.sourceValue : conflict.targetValue,
    };
  }

  // ============================================================================
  // NAMED SNAPSHOTS
  // ============================================================================

  async createSnapshot(
    projectId: string,
    branchId: string,
    versionId: string,
    name: string,
    userId: string,
    options?: {
      description?: string;
      tags?: string[];
      isLocked?: boolean;
    }
  ): Promise<VersionSnapshot> {
    // Validate name
    if (!name.trim()) throw new Error('Snapshot name is required');

    // Check for duplicate names
    const existing = Array.from(this.snapshots.values()).find(
      s => s.projectId === projectId && s.name === name
    );
    if (existing) throw new Error(`Snapshot "${name}" already exists`);

    const snapshot: VersionSnapshot = {
      id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      projectId,
      branchId,
      versionId,
      name,
      description: options?.description,
      createdAt: new Date().toISOString(),
      createdBy: userId,
      tags: options?.tags || [],
      isLocked: options?.isLocked || false,
    };

    this.snapshots.set(snapshot.id, snapshot);
    this.persistToStorage();

    console.info(`[BranchingService] Created snapshot: ${name}`);
    return snapshot;
  }

  getSnapshot(snapshotId: string): VersionSnapshot | null {
    return this.snapshots.get(snapshotId) || null;
  }

  getSnapshotsForProject(projectId: string): VersionSnapshot[] {
    return Array.from(this.snapshots.values())
      .filter(s => s.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getSnapshotsForBranch(branchId: string): VersionSnapshot[] {
    return Array.from(this.snapshots.values())
      .filter(s => s.branchId === branchId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateSnapshot(snapshotId: string, updates: Partial<Pick<VersionSnapshot, 'name' | 'description' | 'tags'>>): Promise<void> {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) throw new Error('Snapshot not found');
    if (snapshot.isLocked) throw new Error('Cannot modify locked snapshot');

    Object.assign(snapshot, updates);
    this.persistToStorage();
  }

  async lockSnapshot(snapshotId: string): Promise<void> {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) throw new Error('Snapshot not found');

    snapshot.isLocked = true;
    this.persistToStorage();
  }

  async deleteSnapshot(snapshotId: string): Promise<void> {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) throw new Error('Snapshot not found');
    if (snapshot.isLocked) throw new Error('Cannot delete locked snapshot');

    this.snapshots.delete(snapshotId);
    this.persistToStorage();
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  getLineage(branchId: string): Branch[] {
    const lineage: Branch[] = [];
    let current = this.branches.get(branchId);

    while (current) {
      lineage.push(current);
      current = current.parentBranchId ? this.branches.get(current.parentBranchId) : undefined;
    }

    return lineage.reverse(); // Root first
  }

  findCommonAncestor(branchId1: string, branchId2: string): Branch | null {
    const lineage1 = new Set(this.getLineage(branchId1).map(b => b.id));
    const lineage2 = this.getLineage(branchId2);

    for (const branch of lineage2.reverse()) {
      if (lineage1.has(branch.id)) {
        return branch;
      }
    }

    return null;
  }
}

// Singleton
export const branchingService = new BranchingService();
