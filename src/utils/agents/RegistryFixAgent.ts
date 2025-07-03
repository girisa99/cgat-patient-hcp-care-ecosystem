/**
 * 🤖 RegistryFixAgent
 * 
 * Lightweight background agent that keeps the entity/module registry healthy.
 * - Listens to UnifiedCoreVerificationService events (scanCompleted, duplicatesDetected).
 * - Performs quick sanity checks (missing references, stale entries).
 * - Attempts low-risk automatic fixes (e.g., merge duplicate entities, mark stale entries as inactive).
 * - Emits its own events so the UI or other services can react.
 *
 * The agent is intentionally conservative: it will never delete code or database rows. All destructive
 * actions require manual confirmation and are surfaced via the `fixProposals` event.
 */

/// <reference types="node" />

import { TypedEventEmitter } from '@/utils/TypedEventEmitter';
import {
  UnifiedCoreVerificationService,
  DuplicateEntry,
  DuplicateReport,
  EntityDefinition,
  EntityType,
  RegistryState
} from '@/utils/verification/core/UnifiedCoreVerificationService';

export interface FixProposal {
  id: string;
  type: 'merge' | 'deactivate' | 'mark_missing';
  description: string;
  autoApplicable: boolean;
  entities: string[];
}

// Strongly typed events emitted by RegistryFixAgent
export interface RegistryFixAgentEvents {
  [key: string | number | symbol]: any[];
  started: never[];
  stopped: never[];
  autoMerged: [DuplicateEntry[]];
  fixProposals: [FixProposal[]];
  autoMergeSuccess: [{ entityType: EntityType; kept: string; removed: string[] }];
}

export class RegistryFixAgent extends TypedEventEmitter<RegistryFixAgentEvents> {
  private verificationService: UnifiedCoreVerificationService;
  private isActive = false;

  constructor(service?: UnifiedCoreVerificationService) {
    super();

    // Use existing singleton by default
    this.verificationService = service || UnifiedCoreVerificationService.getInstance();
    this.setupListeners();
  }

  /**
   * Starts the agent (idempotent)
   */
  start() {
    if (this.isActive) return;

    this.verificationService.startBackgroundMonitoring();
    this.isActive = true;
    this.emit('started');
  }

  /**
   * Stops the agent (idempotent)
   */
  stop() {
    if (!this.isActive) return;

    this.verificationService.stopBackgroundMonitoring();
    this.isActive = false;
    this.emit('stopped');
  }

  private setupListeners() {
    // React to new registry scan
    this.verificationService.on('scanCompleted', (registry: RegistryState) => {
      this.checkForMissingReferences(registry);
    });

    // React to duplicate detection
    this.verificationService.on('duplicatesDetected', (report: DuplicateReport) => {
      this.handleDuplicates(report);
    });
  }

  /**
   * Identify entities that are referenced by others but missing from registry.
   * Currently, we only surface a proposal—no auto-fix is executed.
   */
  private checkForMissingReferences(registry: RegistryState) {
    const proposals: FixProposal[] = [];

    // Example check: hooks that refer to non-existing types (simplified demo)
    registry.hooks.forEach((hook) => {
      hook.dependencies.forEach((dep) => {
        // If the dependency is supposed to be a type but isn't registered
        if (!registry.types.has(dep) && !registry.components.has(dep)) {
          proposals.push({
            id: `missing-${dep}`,
            type: 'mark_missing',
            description: `Dependency ${dep} referenced by ${hook.name} is not registered`,
            autoApplicable: false,
            entities: [hook.name]
          });
        }
      });
    });

    if (proposals.length) {
      this.emit('fixProposals', proposals);
    }
  }

  /**
   * Try to automatically merge safe duplicates; otherwise raise proposals.
   */
  private handleDuplicates(report: DuplicateReport) {
    const autoMerged: DuplicateEntry[] = [];
    const proposals: FixProposal[] = [];

    for (const dup of report.duplicates) {
      if (dup.consolidationPriority === 'low') continue; // ignore low priority

      // Conservative auto-merge: only if similarity is 1 (identical hash) and same file path
      const areIdentical = dup.entities.every(
        (e, _, arr) => e.hash === arr[0].hash && e.filePath === arr[0].filePath
      );

      if (areIdentical) {
        this.autoMergeDuplicate(dup.type, dup.entities);
        autoMerged.push(dup);
      } else {
        proposals.push({
          id: `dup-${dup.type}-${Date.now()}`,
          type: 'merge',
          description: `Duplicate ${dup.type} entities detected: ${dup.entities
            .map((e) => e.name)
            .join(', ')}`,
          autoApplicable: false,
          entities: dup.entities.map((e) => e.name)
        });
      }
    }

    if (autoMerged.length) this.emit('autoMerged', autoMerged);
    if (proposals.length) this.emit('fixProposals', proposals);
  }

  /**
   * Perform an in-memory merge of fully identical entities (no functional change).
   */
  private autoMergeDuplicate(entityType: EntityType, entities: EntityDefinition[]) {
    // Keep the first entity; remove others from registry.
    const registry = this.verificationService.getRegistry();
    const targetMap = this.getEntityMap(registry, entityType);

    if (!targetMap) return;

    const [primary, ...rest] = entities;
    rest.forEach((e) => targetMap.delete(e.id));

    // Emit informational event
    this.emit('autoMergeSuccess', {
      entityType,
      kept: primary.name,
      removed: rest.map((r) => r.name)
    });
  }

  private getEntityMap(registry: RegistryState, entityType: EntityType): Map<string, EntityDefinition> | null {
    switch (entityType) {
      case 'hook':
        return registry.hooks;
      case 'component':
        return registry.components;
      case 'type':
        return registry.types;
      case 'table':
        return registry.tables;
      case 'api':
        return registry.apis;
      case 'route':
        return registry.routes;
      case 'service':
        return registry.services;
      default:
        return null;
    }
  }
}

// Singleton helper (optional)
export const registryFixAgent = new RegistryFixAgent();