import React from 'react';

// Route configuration interface
export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  title: string;
  description?: string;
  requiresAuth?: boolean;
  isPublic?: boolean;
  allowedRoles?: string[];
  requiredPermissions?: string[];
  category?: string;
  icon?: string;
  tenantScoped?: boolean;
  crossTenant?: boolean;
  facilityPermission?: 'read' | 'write' | 'admin';
  facilityTypes?: string[];
  requireFacilityContext?: boolean;
  showInNavigation?: boolean;
  order?: number;
}

// Route registry class for centralized route management
class RouteRegistryManager {
  private routes: Map<string, RouteConfig> = new Map();
  private categories: Map<string, RouteConfig[]> = new Map();

  register(config: RouteConfig) {
    this.routes.set(config.path, {
      showInNavigation: true,
      order: 100,
      ...config,
    });

    // Group by category
    const category = config.category || 'other';
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    this.categories.get(category)!.push(config);
  }

  getRoute(path: string): RouteConfig | undefined {
    return this.routes.get(path);
  }

  getAllRoutes(): RouteConfig[] {
    return Array.from(this.routes.values());
  }

  getCategories(): Map<string, RouteConfig[]> {
    return this.categories;
  }

  // Check if user can access a route
  canAccess(
    path: string, 
    userRoles: string[] = [], 
    currentFacilityId?: string, 
    isSuperAdmin: boolean = false
  ): boolean {
    const route = this.getRoute(path);
    if (!route) return false;

    // Public routes
    if (route.isPublic) return true;

    // Super admin can access everything
    if (isSuperAdmin) return true;

    // Check role requirements
    if (route.allowedRoles && route.allowedRoles.length > 0) {
      const hasRequiredRole = route.allowedRoles.some(role => userRoles.includes(role));
      if (!hasRequiredRole) return false;
    }

    // Facility context requirements
    if (route.requireFacilityContext && !currentFacilityId) {
      return false;
    }

    return true;
  }

  // Get accessible routes for user
  getAccessibleRoutes(
    userRoles: string[] = [], 
    currentFacilityId?: string, 
    isSuperAdmin: boolean = false
  ): RouteConfig[] {
    return this.getAllRoutes().filter(route => 
      this.canAccess(route.path, userRoles, currentFacilityId, isSuperAdmin)
    );
  }

  // Get navigation items based on user roles
  getNavigationItems(
    userRoles: string[] = [], 
    currentFacilityId?: string, 
    isSuperAdmin: boolean = false
  ): RouteConfig[] {
    return this.getAccessibleRoutes(userRoles, currentFacilityId, isSuperAdmin)
      .filter(route => route.showInNavigation)
      .sort((a, b) => (a.order || 100) - (b.order || 100));
  }

  // Get stats for debugging
  getStats() {
    return {
      totalRoutes: this.routes.size,
      categories: Array.from(this.categories.keys()),
      routePaths: Array.from(this.routes.keys()),
    };
  }

  // Clear all routes (for testing)
  clear() {
    this.routes.clear();
    this.categories.clear();
  }
}

// Export singleton instance
export const RouteRegistry = new RouteRegistryManager();

// Auto-register utility for modules
export const autoRegisterModule = (
  moduleName: string,
  component: React.ComponentType<any>,
  options: Partial<RouteConfig> = {}
) => {
  const path = options.path || `/${moduleName.toLowerCase()}`;
  
  RouteRegistry.register({
    path,
    component,
    title: moduleName,
    description: options.description || `${moduleName} management`,
    requiresAuth: true,
    allowedRoles: options.allowedRoles || ['superAdmin'],
    category: options.category || 'management',
    icon: options.icon || 'Package',
    ...options,
  });
};