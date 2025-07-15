/**
 * Stability Manager for preventing breaking changes and managing feature rollouts
 */

export interface ChangeRequest {
  type: 'component' | 'hook' | 'service' | 'api' | 'route';
  name: string;
  changes: any;
  metadata?: any;
}

export interface CompatibilityResult {
  approved: boolean;
  hasBreakingChanges: boolean;
  issues: BreakingChangeIssue[];
  recommendations?: string[];
}

export interface BreakingChangeIssue {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  affectedComponents: string[];
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  roles: string[];
  percentage: number;
  dependencies: string[];
  rollbackStrategy: 'instant' | 'gradual';
  createdAt: Date;
}

export class StabilityManager {
  private static featureFlags = new Map<string, FeatureFlag>();
  private static breakingChangeThreshold = 0.7; // Similarity threshold for breaking changes

  /**
   * Validate if a change would break existing functionality
   */
  static async validateChange(changeRequest: ChangeRequest): Promise<CompatibilityResult> {
    console.log(`🔍 Validating change for ${changeRequest.type}: ${changeRequest.name}`);

    const issues = await this.detectBreakingChanges(changeRequest);
    const hasBreakingChanges = issues.length > 0;

    if (hasBreakingChanges) {
      return {
        approved: false,
        hasBreakingChanges: true,
        issues,
        recommendations: this.generateMigrationStrategy(issues)
      };
    }

    return {
      approved: true,
      hasBreakingChanges: false,
      issues: []
    };
  }

  /**
   * Create and manage feature flags
   */
  static createFeatureFlag(featureName: string, config: Partial<FeatureFlag>): void {
    this.featureFlags.set(featureName, {
      name: featureName,
      enabled: config.enabled || false,
      roles: config.roles || [],
      percentage: config.percentage || 0,
      dependencies: config.dependencies || [],
      rollbackStrategy: config.rollbackStrategy || 'instant',
      createdAt: new Date()
    });
  }

  /**
   * Check if feature is enabled for user
   */
  static isFeatureEnabledForUser(featureName: string, user: { id: string; roles: string[] }): boolean {
    const flag = this.featureFlags.get(featureName);
    if (!flag || !flag.enabled) return false;

    // Role-based access
    if (flag.roles.length > 0 && !flag.roles.some(role => user.roles.includes(role))) {
      return false;
    }

    // Percentage-based rollout
    if (flag.percentage > 0) {
      const userHash = this.hashUser(user.id);
      return (userHash % 100) < flag.percentage;
    }

    return true;
  }

  /**
   * Detect breaking changes in the proposed change
   */
  private static async detectBreakingChanges(changeRequest: ChangeRequest): Promise<BreakingChangeIssue[]> {
    const issues: BreakingChangeIssue[] = [];

    switch (changeRequest.type) {
      case 'component':
        issues.push(...await this.checkComponentCompatibility(changeRequest));
        break;
      case 'hook':
        issues.push(...await this.checkHookCompatibility(changeRequest));
        break;
      case 'service':
        issues.push(...await this.checkServiceCompatibility(changeRequest));
        break;
      case 'api':
        issues.push(...await this.checkApiCompatibility(changeRequest));
        break;
      case 'route':
        issues.push(...await this.checkRouteCompatibility(changeRequest));
        break;
    }

    return issues;
  }

  /**
   * Check component compatibility
   */
  private static async checkComponentCompatibility(changeRequest: ChangeRequest): Promise<BreakingChangeIssue[]> {
    const issues: BreakingChangeIssue[] = [];

    // Check for removed or changed props
    if (changeRequest.changes?.removedProps?.length > 0) {
      issues.push({
        type: 'breaking_component_change',
        description: `Component ${changeRequest.name} removed props: ${changeRequest.changes.removedProps.join(', ')}`,
        severity: 'high',
        affectedComponents: ['Unknown'] // Would scan codebase in real implementation
      });
    }

    return issues;
  }

  /**
   * Check hook compatibility
   */
  private static async checkHookCompatibility(changeRequest: ChangeRequest): Promise<BreakingChangeIssue[]> {
    const issues: BreakingChangeIssue[] = [];

    if (changeRequest.changes?.signatureChanged) {
      issues.push({
        type: 'breaking_hook_change',
        description: `Hook ${changeRequest.name} signature changed`,
        severity: 'high',
        affectedComponents: ['Unknown']
      });
    }

    return issues;
  }

  /**
   * Check service compatibility
   */
  private static async checkServiceCompatibility(changeRequest: ChangeRequest): Promise<BreakingChangeIssue[]> {
    return []; // Implementation would check for removed methods, changed interfaces
  }

  /**
   * Check API compatibility
   */
  private static async checkApiCompatibility(changeRequest: ChangeRequest): Promise<BreakingChangeIssue[]> {
    return []; // Implementation would check for removed endpoints, changed schemas
  }

  /**
   * Check route compatibility
   */
  private static async checkRouteCompatibility(changeRequest: ChangeRequest): Promise<BreakingChangeIssue[]> {
    return []; // Implementation would check for removed routes, changed parameters
  }

  /**
   * Generate migration strategies for breaking changes
   */
  private static generateMigrationStrategy(issues: BreakingChangeIssue[]): string[] {
    return issues.map(issue => {
      switch (issue.type) {
        case 'breaking_component_change':
          return 'Create new component version, keep old as legacy with deprecation warning';
        case 'breaking_hook_change':
          return 'Create new hook version, maintain compatibility wrapper';
        default:
          return 'Manual migration required - review affected components';
      }
    });
  }

  /**
   * Hash user ID for consistent percentage rollouts
   */
  private static hashUser(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get all feature flags
   */
  static getFeatureFlags(): Map<string, FeatureFlag> {
    return new Map(this.featureFlags);
  }

  /**
   * Remove feature flag
   */
  static removeFeatureFlag(featureName: string): boolean {
    return this.featureFlags.delete(featureName);
  }
}