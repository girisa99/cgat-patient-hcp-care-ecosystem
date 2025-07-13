import { ComponentType } from 'react';

// Route configuration interface with multi-tenant support
export interface RouteConfig {
  path: string;
  component: ComponentType<any>;
  title: string;
  description?: string;
  requiresAuth: boolean;
  allowedRoles?: string[];
  requiredPermissions?: string[];
  icon?: string;
  category?: 'management' | 'admin' | 'reporting' | 'system';
  isPublic?: boolean;
  isActive?: boolean;
  metadata?: Record<string, any>;
  
  // MULTI-TENANT ENHANCEMENTS
  tenantScoped?: boolean;          // Requires facility context
  crossTenant?: boolean;           // Can access multiple facilities
  facilityTypes?: string[];        // Allowed facility types
  facilityPermission?: 'read' | 'write' | 'admin'; // Required facility permission level
  requireFacilityContext?: boolean; // Must have active facility selected
}

// Route registry class for centralized route management
class RouteRegistryManager {
  private routes: Map<string, RouteConfig> = new Map();
  private categories: Map<string, RouteConfig[]> = new Map();

  /**
   * Register a new route with role-based access control
   */
  register(config: RouteConfig): void {
    console.log(`📍 Registering route: ${config.path} (${config.title})`);
    
    // Validate route configuration
    if (!config.path || !config.component) {
      throw new Error('Route must have path and component');
    }

    // Store route configuration
    this.routes.set(config.path, {
      ...config,
      isActive: config.isActive !== false, // Default to active
      requiresAuth: config.requiresAuth !== false, // Default to requiring auth
    });

    // Categorize route
    const category = config.category || 'management';
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    this.categories.get(category)!.push(config);

    console.log(`✅ Route registered: ${config.path} -> ${category}`);
  }

  /**
   * Register multiple routes at once
   */
  registerBatch(configs: RouteConfig[]): void {
    configs.forEach(config => this.register(config));
  }

  /**
   * Get route configuration by path
   */
  getRoute(path: string): RouteConfig | undefined {
    return this.routes.get(path);
  }

  /**
   * Get all routes
   */
  getAllRoutes(): RouteConfig[] {
    return Array.from(this.routes.values());
  }

  /**
   * Get routes by category
   */
  getRoutesByCategory(category: string): RouteConfig[] {
    return this.categories.get(category) || [];
  }

  /**
   * Get routes accessible by user roles and facility context
   */
  getAccessibleRoutes(userRoles: string[], currentFacilityId?: string, isSuperAdmin: boolean = false): RouteConfig[] {
    return this.getAllRoutes().filter(route => {
      // Public routes are always accessible
      if (route.isPublic) return true;
      
      // Check basic role access
      if (route.allowedRoles && route.allowedRoles.length > 0) {
        const hasRole = route.allowedRoles.some(role => userRoles.includes(role));
        if (!hasRole && !isSuperAdmin) return false;
      }
      
      // Check facility-specific access
      if (route.tenantScoped && !route.crossTenant) {
        // Single tenant routes require facility context
        if (!currentFacilityId && !isSuperAdmin) return false;
      }
      
      return true;
    });
  }

  /**
   * Check if user can access a specific route with tenant context
   */
  canAccess(path: string, userRoles: string[], currentFacilityId?: string, isSuperAdmin: boolean = false): boolean {
    const route = this.getRoute(path);
    if (!route) return false;
    if (route.isPublic) return true;
    
    // Check role access
    if (route.allowedRoles && route.allowedRoles.length > 0) {
      const hasRole = route.allowedRoles.some(role => userRoles.includes(role));
      if (!hasRole && !isSuperAdmin) return false;
    }
    
    // Check tenant access
    if (route.tenantScoped && !route.crossTenant && !currentFacilityId && !isSuperAdmin) {
      return false;
    }
    
    return true;
  }

  /**
   * Get navigation items for sidebar/menu with tenant context
   */
  getNavigationItems(userRoles: string[], currentFacilityId?: string, isSuperAdmin: boolean = false): Array<{
    category: string;
    routes: RouteConfig[];
  }> {
    const accessible = this.getAccessibleRoutes(userRoles, currentFacilityId, isSuperAdmin);
    const grouped = new Map<string, RouteConfig[]>();

    accessible.forEach(route => {
      const category = route.category || 'management';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(route);
    });

    return Array.from(grouped.entries()).map(([category, routes]) => ({
      category,
      routes: routes.sort((a, b) => a.title.localeCompare(b.title))
    }));
  }

  /**
   * Update route configuration
   */
  updateRoute(path: string, updates: Partial<RouteConfig>): void {
    const existing = this.routes.get(path);
    if (existing) {
      this.routes.set(path, { ...existing, ...updates });
      console.log(`🔄 Updated route: ${path}`);
    }
  }

  /**
   * Remove route from registry
   */
  unregister(path: string): void {
    const route = this.routes.get(path);
    if (route) {
      this.routes.delete(path);
      
      // Remove from category
      const category = route.category || 'management';
      const categoryRoutes = this.categories.get(category);
      if (categoryRoutes) {
        const index = categoryRoutes.findIndex(r => r.path === path);
        if (index !== -1) {
          categoryRoutes.splice(index, 1);
        }
      }
      
      console.log(`🗑️ Unregistered route: ${path}`);
    }
  }

  /**
   * Get route statistics
   */
  getStats(): {
    totalRoutes: number;
    categoryCounts: Record<string, number>;
    authRequiredCount: number;
    publicRoutes: number;
  } {
    const routes = this.getAllRoutes();
    const categoryCounts: Record<string, number> = {};
    
    routes.forEach(route => {
      const category = route.category || 'management';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return {
      totalRoutes: routes.length,
      categoryCounts,
      authRequiredCount: routes.filter(r => r.requiresAuth && !r.isPublic).length,
      publicRoutes: routes.filter(r => r.isPublic).length,
    };
  }
}

// Export singleton instance
export const RouteRegistry = new RouteRegistryManager();

// Auto-register utility for modules
export const autoRegisterModule = (
  moduleName: string,
  component: ComponentType<any>,
  options: Partial<RouteConfig> = {}
): void => {
  const path = options.path || `/${moduleName.toLowerCase()}`;
  
  RouteRegistry.register({
    path,
    component,
    title: options.title || moduleName,
    description: options.description || `${moduleName} management interface`,
    requiresAuth: true,
    allowedRoles: options.allowedRoles || ['superAdmin', 'onboardingTeam'],
    category: options.category || 'management',
    icon: options.icon,
    ...options
  });

  console.log(`🎯 Auto-registered module: ${moduleName} -> ${path}`);
};