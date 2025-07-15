/**
 * Safe Router - Manages routing with conflict detection and safe navigation
 * Prevents route conflicts and provides secure navigation guards
 */

import { RouteSchema, TypeValidator, FrameworkError } from '../core/types.js';

export class SafeRouter {
  constructor(config = {}) {
    this.config = {
      basePath: '/',
      enableGuards: true,
      trackNavigation: true,
      conflictDetection: true,
      historyMode: 'browser', // 'browser' or 'hash'
      ...config
    };
    
    this.routes = new Map();
    this.guards = new Map();
    this.navigation = [];
    this.conflicts = new Map();
    this.currentRoute = null;
    this.isMonitoring = false;
    
    this.initializeDefaultRoutes();
  }

  /**
   * Initialize default routes for the healthcare system
   */
  initializeDefaultRoutes() {
    const defaultRoutes = [
      {
        path: '/',
        component: 'Dashboard',
        exact: true,
        guards: ['auth'],
        metadata: { 
          title: 'Dashboard',
          description: 'Main dashboard',
          roles: ['admin', 'clinician', 'nurse']
        }
      },
      {
        path: '/login',
        component: 'Login',
        exact: true,
        guards: ['guest'],
        metadata: { 
          title: 'Login',
          description: 'User authentication',
          public: true
        }
      },
      {
        path: '/onboarding',
        component: 'OnboardingDashboard',
        exact: false,
        guards: ['auth', 'role:onboardingTeam'],
        metadata: { 
          title: 'Onboarding',
          description: 'Treatment center onboarding',
          roles: ['onboardingTeam', 'admin']
        }
      },
      {
        path: '/onboarding/:id',
        component: 'OnboardingDetails',
        exact: true,
        guards: ['auth', 'role:onboardingTeam'],
        metadata: { 
          title: 'Onboarding Details',
          description: 'Specific onboarding case',
          roles: ['onboardingTeam', 'admin']
        }
      },
      {
        path: '/facilities',
        component: 'FacilitiesManagement',
        exact: false,
        guards: ['auth', 'permission:facilities.read'],
        metadata: { 
          title: 'Facilities',
          description: 'Facility management',
          roles: ['admin', 'facilityManager']
        }
      },
      {
        path: '/patients',
        component: 'PatientManagement',
        exact: false,
        guards: ['auth', 'permission:patients.read'],
        metadata: { 
          title: 'Patients',
          description: 'Patient management',
          roles: ['clinician', 'nurse', 'pharmacist']
        }
      },
      {
        path: '/users',
        component: 'UserManagement',
        exact: false,
        guards: ['auth', 'role:admin'],
        metadata: { 
          title: 'Users',
          description: 'User management',
          roles: ['admin', 'superAdmin']
        }
      },
      {
        path: '/profile',
        component: 'UserProfile',
        exact: true,
        guards: ['auth'],
        metadata: { 
          title: 'Profile',
          description: 'User profile',
          roles: ['*']
        }
      },
      {
        path: '/api-keys',
        component: 'ApiKeyManagement',
        exact: true,
        guards: ['auth', 'role:admin'],
        metadata: { 
          title: 'API Keys',
          description: 'API key management',
          roles: ['admin', 'superAdmin']
        }
      },
      {
        path: '/reports',
        component: 'Reports',
        exact: false,
        guards: ['auth', 'permission:reports.view'],
        metadata: { 
          title: 'Reports',
          description: 'System reports',
          roles: ['admin', 'clinician', 'facilityManager']
        }
      },
      {
        path: '/settings',
        component: 'Settings',
        exact: false,
        guards: ['auth'],
        metadata: { 
          title: 'Settings',
          description: 'Application settings',
          roles: ['*']
        }
      },
      {
        path: '/404',
        component: 'NotFound',
        exact: true,
        guards: [],
        metadata: { 
          title: 'Not Found',
          description: '404 error page',
          public: true
        }
      }
    ];

    defaultRoutes.forEach(route => this.addRoute(route));
    this.initializeDefaultGuards();
  }

  /**
   * Initialize default route guards
   */
  initializeDefaultGuards() {
    // Authentication guard
    this.addGuard('auth', async (to, from, context) => {
      if (!context.user || !context.user.authenticated) {
        return { redirect: '/login' };
      }
      return { allow: true };
    });

    // Guest guard (for login page)
    this.addGuard('guest', async (to, from, context) => {
      if (context.user && context.user.authenticated) {
        return { redirect: '/' };
      }
      return { allow: true };
    });

    // Role-based guard
    this.addGuard('role', async (to, from, context, requiredRole) => {
      if (!context.user || !context.user.roles) {
        return { redirect: '/login' };
      }
      
      if (!context.user.roles.includes(requiredRole)) {
        return { 
          redirect: '/403',
          error: `Access denied: requires role ${requiredRole}` 
        };
      }
      
      return { allow: true };
    });

    // Permission-based guard
    this.addGuard('permission', async (to, from, context, requiredPermission) => {
      if (!context.user || !context.user.permissions) {
        return { redirect: '/login' };
      }
      
      if (!context.user.permissions.includes(requiredPermission)) {
        return { 
          redirect: '/403',
          error: `Access denied: requires permission ${requiredPermission}` 
        };
      }
      
      return { allow: true };
    });
  }

  /**
   * Start route monitoring
   */
  async startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🛣️ Route monitoring started');
    
    // Detect conflicts
    if (this.config.conflictDetection) {
      this.detectRouteConflicts();
    }
    
    // Set up navigation tracking
    if (this.config.trackNavigation) {
      this.setupNavigationTracking();
    }
  }

  /**
   * Stop route monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    console.log('⏹️ Route monitoring stopped');
  }

  /**
   * Add a route
   */
  addRoute(routeData) {
    const validation = TypeValidator.validate(routeData, RouteSchema);
    if (!validation.valid) {
      throw new FrameworkError(
        `Invalid route data: ${validation.errors.join(', ')}`,
        'INVALID_ROUTE_DATA',
        'SafeRouter'
      );
    }

    const route = {
      ...routeData,
      id: this.generateRouteId(routeData),
      registeredAt: new Date(),
      pattern: this.compileRoutePattern(routeData.path)
    };

    // Check for conflicts
    if (this.config.conflictDetection) {
      this.checkRouteConflict(route);
    }

    this.routes.set(route.path, route);
    console.log(`🛣️ Route added: ${route.path}`);
  }

  /**
   * Remove a route
   */
  removeRoute(path) {
    if (!this.routes.has(path)) {
      throw new FrameworkError(
        `Route not found: ${path}`,
        'ROUTE_NOT_FOUND',
        'SafeRouter'
      );
    }

    this.routes.delete(path);
    console.log(`🗑️ Route removed: ${path}`);
  }

  /**
   * Add a route guard
   */
  addGuard(name, guardFunction) {
    if (typeof guardFunction !== 'function') {
      throw new FrameworkError(
        'Guard must be a function',
        'INVALID_GUARD',
        'SafeRouter'
      );
    }

    this.guards.set(name, guardFunction);
    console.log(`🛡️ Guard added: ${name}`);
  }

  /**
   * Navigate to a route
   */
  async navigate(path, context = {}) {
    try {
      const route = this.matchRoute(path);
      if (!route) {
        return this.handleNotFound(path);
      }

      // Apply guards
      if (this.config.enableGuards && route.guards.length > 0) {
        const guardResult = await this.applyGuards(route, this.currentRoute, context);
        if (!guardResult.allow) {
          if (guardResult.redirect) {
            return this.navigate(guardResult.redirect, context);
          }
          throw new FrameworkError(
            guardResult.error || 'Navigation blocked by guard',
            'GUARD_BLOCKED',
            'SafeRouter'
          );
        }
      }

      // Track navigation
      if (this.config.trackNavigation) {
        this.trackNavigation(this.currentRoute, route, context);
      }

      this.currentRoute = route;
      
      return {
        success: true,
        route,
        component: route.component,
        params: this.extractParams(route, path)
      };
    } catch (error) {
      console.error('❌ Navigation failed:', error);
      return {
        success: false,
        error: error.message,
        redirect: '/404'
      };
    }
  }

  /**
   * Match route pattern to path
   */
  matchRoute(path) {
    for (const route of this.routes.values()) {
      if (this.testRoutePattern(route, path)) {
        return route;
      }
    }
    return null;
  }

  /**
   * Test if route pattern matches path
   */
  testRoutePattern(route, path) {
    if (route.exact) {
      return route.path === path;
    }
    
    return route.pattern.test(path);
  }

  /**
   * Compile route pattern for matching
   */
  compileRoutePattern(path) {
    // Convert route params (:id) to regex patterns
    const pattern = path
      .replace(/:[^/]+/g, '([^/]+)')
      .replace(/\*/g, '.*');
    
    return new RegExp(`^${pattern}$`);
  }

  /**
   * Extract parameters from route path
   */
  extractParams(route, path) {
    const params = {};
    const routeParts = route.path.split('/');
    const pathParts = path.split('/');

    routeParts.forEach((part, index) => {
      if (part.startsWith(':')) {
        const paramName = part.slice(1);
        params[paramName] = pathParts[index];
      }
    });

    return params;
  }

  /**
   * Apply route guards
   */
  async applyGuards(route, fromRoute, context) {
    for (const guardName of route.guards) {
      const [name, ...args] = guardName.split(':');
      const guard = this.guards.get(name);
      
      if (!guard) {
        console.warn(`⚠️ Guard not found: ${name}`);
        continue;
      }

      try {
        const result = await guard(route, fromRoute, context, ...args);
        if (!result.allow) {
          return result;
        }
      } catch (error) {
        console.error(`❌ Guard error in ${name}:`, error);
        return { 
          allow: false, 
          error: `Guard error: ${error.message}` 
        };
      }
    }

    return { allow: true };
  }

  /**
   * Handle 404 not found
   */
  handleNotFound(path) {
    console.warn(`⚠️ Route not found: ${path}`);
    
    const notFoundRoute = this.routes.get('/404');
    if (notFoundRoute) {
      return {
        success: true,
        route: notFoundRoute,
        component: notFoundRoute.component,
        params: { originalPath: path }
      };
    }

    return {
      success: false,
      error: `Route not found: ${path}`,
      redirect: '/'
    };
  }

  /**
   * Track navigation for analytics
   */
  trackNavigation(from, to, context) {
    const navigationEntry = {
      timestamp: new Date(),
      from: from ? from.path : null,
      to: to.path,
      user: context.user ? context.user.id : null,
      duration: from ? Date.now() - from.enteredAt : 0
    };

    this.navigation.push(navigationEntry);
    
    // Keep only last 1000 navigation entries
    if (this.navigation.length > 1000) {
      this.navigation = this.navigation.slice(-1000);
    }

    // Mark route entry time
    to.enteredAt = Date.now();
  }

  /**
   * Detect route conflicts
   */
  detectRouteConflicts() {
    const conflicts = [];
    const routes = Array.from(this.routes.values());

    for (let i = 0; i < routes.length; i++) {
      for (let j = i + 1; j < routes.length; j++) {
        const routeA = routes[i];
        const routeB = routes[j];

        if (this.routesConflict(routeA, routeB)) {
          conflicts.push({
            routes: [routeA.path, routeB.path],
            type: 'pattern_overlap',
            severity: 'high',
            detectedAt: new Date()
          });
        }
      }
    }

    if (conflicts.length > 0) {
      console.warn(`⚠️ Route conflicts detected:`, conflicts);
      this.conflicts.set('pattern_conflicts', conflicts);
    }
  }

  /**
   * Check if two routes conflict
   */
  routesConflict(routeA, routeB) {
    // Simple conflict detection - more sophisticated logic could be added
    if (routeA.path === routeB.path) return true;
    
    // Check if patterns overlap
    const testPaths = ['/test/123', '/test/abc', '/api/v1/users'];
    return testPaths.some(testPath => 
      this.testRoutePattern(routeA, testPath) && 
      this.testRoutePattern(routeB, testPath)
    );
  }

  /**
   * Check specific route for conflicts
   */
  checkRouteConflict(newRoute) {
    for (const existingRoute of this.routes.values()) {
      if (this.routesConflict(newRoute, existingRoute)) {
        console.warn(`⚠️ Route conflict detected: ${newRoute.path} conflicts with ${existingRoute.path}`);
      }
    }
  }

  /**
   * Setup navigation tracking
   */
  setupNavigationTracking() {
    // This would integrate with browser history API
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', (event) => {
        const path = window.location.pathname;
        this.navigate(path).catch(console.error);
      });
    }
  }

  /**
   * Generate unique route ID
   */
  generateRouteId(routeData) {
    const hash = this.simpleHash(routeData.path + routeData.component);
    return `route_${hash}`;
  }

  /**
   * Simple hash function
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get all routes
   */
  getAllRoutes() {
    return Array.from(this.routes.values());
  }

  /**
   * Get route by path
   */
  getRoute(path) {
    return this.routes.get(path);
  }

  /**
   * Get navigation history
   */
  getNavigationHistory(limit = 50) {
    return this.navigation.slice(-limit);
  }

  /**
   * Get route conflicts
   */
  getConflicts() {
    return Array.from(this.conflicts.values()).flat();
  }

  /**
   * Generate route report
   */
  async generateReport() {
    return {
      timestamp: new Date(),
      summary: {
        totalRoutes: this.routes.size,
        totalGuards: this.guards.size,
        conflicts: this.getConflicts().length,
        monitoring: this.isMonitoring
      },
      routes: this.getAllRoutes().map(route => ({
        path: route.path,
        component: route.component,
        guards: route.guards,
        metadata: route.metadata
      })),
      conflicts: this.getConflicts(),
      navigation: this.getNavigationHistory(20),
      currentRoute: this.currentRoute
    };
  }

  /**
   * Health check for router
   */
  async healthCheck() {
    const conflicts = this.getConflicts();
    const criticalConflicts = conflicts.filter(c => c.severity === 'critical');
    
    return {
      status: criticalConflicts.length > 0 ? 'error' : 'ok',
      routes: this.routes.size,
      guards: this.guards.size,
      conflicts: conflicts.length,
      criticalConflicts: criticalConflicts.length,
      monitoring: this.isMonitoring
    };
  }
}

export default SafeRouter;
