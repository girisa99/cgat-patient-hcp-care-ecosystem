/**
 * Role-Based Feature Manager
 * Manages features with role-based access controls and gradual rollouts
 */

import { StabilityManager, FeatureFlag } from './StabilityManager';

export interface FeatureConfig {
  name: string;
  requiredRoles: string[];
  minRoleLevel?: number;
  component?: string;
  routes?: RouteConfig[];
  hooks?: string[];
  fallbackComponent?: string;
  enabledByDefault: boolean;
  rolloutPercentage?: number;
}

export interface RouteConfig {
  path: string;
  fallbackRoute?: string;
}

export interface User {
  id: string;
  roles: string[];
  email?: string;
}

export interface RoutePermission {
  feature: string;
  requiredRoles: string[];
  minRoleLevel?: number;
  fallbackRoute: string;
}

export class RoleBasedFeatureManager {
  private roleHierarchy = new Map<string, number>();
  private featurePermissions = new Map<string, FeatureConfig>();
  private routePermissions = new Map<string, RoutePermission>();

  constructor(private stabilityManager: typeof StabilityManager) {
    this.setupDefaultRoleHierarchy();
  }

  /**
   * Setup default role hierarchy based on your database enum
   */
  private setupDefaultRoleHierarchy(): void {
    // Based on your database user_role enum
    const defaultRoles = [
      { role: 'guest', level: 0 },
      { role: 'patientCaregiver', level: 1 },
      { role: 'staff', level: 2 },
      { role: 'practitioner', level: 3 },
      { role: 'onboardingTeam', level: 4 },
      { role: 'superAdmin', level: 5 }
    ];

    defaultRoles.forEach(({ role, level }) => {
      this.roleHierarchy.set(role, level);
    });
  }

  /**
   * Define custom role hierarchy
   */
  defineRoleHierarchy(roles: Array<{ role: string; level: number }>): void {
    this.roleHierarchy.clear();
    roles.forEach(({ role, level }) => {
      this.roleHierarchy.set(role, level);
    });
  }

  /**
   * Register feature with role-based access controls
   */
  registerFeature(featureName: string, config: FeatureConfig): void {
    console.log(`🎛️ Registering feature: ${featureName} with roles: ${config.requiredRoles.join(', ')}`);

    this.featurePermissions.set(featureName, {
      ...config,
      name: featureName
    });

    // Register routes with permissions
    if (config.routes) {
      config.routes.forEach(route => {
        this.routePermissions.set(route.path, {
          feature: featureName,
          requiredRoles: config.requiredRoles,
          minRoleLevel: config.minRoleLevel,
          fallbackRoute: route.fallbackRoute || '/dashboard'
        });
      });
    }

    // Create feature flag in StabilityManager
    this.stabilityManager.createFeatureFlag(featureName, {
      enabled: config.enabledByDefault,
      roles: config.requiredRoles,
      percentage: config.rolloutPercentage || 0,
      dependencies: [],
      rollbackStrategy: 'instant',
      createdAt: new Date()
    });
  }

  /**
   * Check if user can access feature
   */
  canUserAccessFeature(featureName: string, user: User): boolean {
    const feature = this.featurePermissions.get(featureName);
    if (!feature) {
      console.warn(`⚠️ Feature ${featureName} not found`);
      return false;
    }

    // Check feature flag first
    if (!this.stabilityManager.isFeatureEnabledForUser(featureName, user)) {
      return false;
    }

    // Check role-based permissions
    return this.hasRequiredRole(user, feature.requiredRoles, feature.minRoleLevel);
  }

  /**
   * Check route permissions
   */
  canUserAccessRoute(routePath: string, user: User): boolean {
    const routePermission = this.routePermissions.get(routePath);
    if (!routePermission) {
      return true; // No restrictions
    }

    return this.hasRequiredRole(user, routePermission.requiredRoles, routePermission.minRoleLevel);
  }

  /**
   * Check if user has required role
   */
  private hasRequiredRole(user: User, requiredRoles: string[], minRoleLevel?: number): boolean {
    if (requiredRoles.length === 0 && !minRoleLevel) {
      return true;
    }

    // Check specific roles
    if (requiredRoles.length > 0) {
      const hasRole = requiredRoles.some(role => user.roles.includes(role));
      if (!hasRole) {
        return false;
      }
    }

    // Check minimum role level
    if (minRoleLevel !== undefined && minRoleLevel > 0) {
      const userMaxLevel = Math.max(
        ...user.roles.map(role => this.roleHierarchy.get(role) || 0)
      );
      if (userMaxLevel < minRoleLevel) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get appropriate component for user
   */
  getComponentForUser(featureName: string, user: User): string | null {
    const feature = this.featurePermissions.get(featureName);
    if (!feature) {
      return null;
    }

    if (this.canUserAccessFeature(featureName, user)) {
      return feature.component || null;
    }

    return feature.fallbackComponent || null;
  }

  /**
   * Get accessible routes for user
   */
  getAccessibleRoutes(user: User): string[] {
    const accessibleRoutes: string[] = [];

    for (const [routePath, permission] of this.routePermissions) {
      if (this.canUserAccessRoute(routePath, user)) {
        accessibleRoutes.push(routePath);
      }
    }

    return accessibleRoutes;
  }

  /**
   * Get feature access summary for user
   */
  getFeatureAccessSummary(user: User): {
    accessible: string[];
    restricted: string[];
    fallbackAvailable: string[];
  } {
    const summary = {
      accessible: [] as string[],
      restricted: [] as string[],
      fallbackAvailable: [] as string[]
    };

    for (const [featureName, feature] of this.featurePermissions) {
      if (this.canUserAccessFeature(featureName, user)) {
        summary.accessible.push(featureName);
      } else {
        summary.restricted.push(featureName);
        if (feature.fallbackComponent) {
          summary.fallbackAvailable.push(featureName);
        }
      }
    }

    return summary;
  }

  /**
   * Get role hierarchy information
   */
  getRoleHierarchy(): Map<string, number> {
    return new Map(this.roleHierarchy);
  }

  /**
   * Get all registered features
   */
  getRegisteredFeatures(): Map<string, FeatureConfig> {
    return new Map(this.featurePermissions);
  }

  /**
   * Remove feature registration
   */
  unregisterFeature(featureName: string): boolean {
    const removed = this.featurePermissions.delete(featureName);
    
    // Remove associated routes
    for (const [routePath, permission] of this.routePermissions) {
      if (permission.feature === featureName) {
        this.routePermissions.delete(routePath);
      }
    }

    // Remove feature flag
    this.stabilityManager.removeFeatureFlag(featureName);

    return removed;
  }

  /**
   * Update feature configuration
   */
  updateFeature(featureName: string, updates: Partial<FeatureConfig>): boolean {
    const existingFeature = this.featurePermissions.get(featureName);
    if (!existingFeature) {
      return false;
    }

    const updatedFeature = { ...existingFeature, ...updates };
    this.featurePermissions.set(featureName, updatedFeature);

    // Update feature flag if needed
    if (updates.enabledByDefault !== undefined || updates.requiredRoles) {
      this.stabilityManager.removeFeatureFlag(featureName);
      this.stabilityManager.createFeatureFlag(featureName, {
        enabled: updatedFeature.enabledByDefault,
        roles: updatedFeature.requiredRoles,
        percentage: updatedFeature.rolloutPercentage || 0,
        dependencies: [],
        rollbackStrategy: 'instant',
        createdAt: new Date()
      });
    }

    return true;
  }
}