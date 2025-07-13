import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { RouteRegistry, RouteConfig } from './RouteRegistry';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { PageLoading } from '@/components/ui/LoadingStates';

// Route wrapper with error boundary and loading states
const RouteWrapper: React.FC<{
  config: RouteConfig;
  children: React.ReactNode;
}> = ({ config, children }) => {
  return (
    <ErrorBoundary
      onError={(error) => {
        console.error(`🚨 Error in route ${config.path}:`, error);
      }}
    >
      <React.Suspense fallback={<PageLoading message={`Loading ${config.title}...`} />}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  );
};

// Generate routes from registry
export const generateRoutes = (): React.ReactElement => {
  const routes = RouteRegistry.getAllRoutes();

  return (
    <Routes>
      {routes.map((config) => {
        const RouteComponent = config.component;
        
        const element = (
          <RouteWrapper config={config}>
            <RouteComponent />
          </RouteWrapper>
        );

        // Wrap in ProtectedRoute if authentication is required
        const protectedElement = config.requiresAuth && !config.isPublic ? (
          <ProtectedRoute
            requiredRoles={config.allowedRoles}
            requiredPermissions={config.requiredPermissions}
          >
            {element}
          </ProtectedRoute>
        ) : element;

        return (
          <Route
            key={config.path}
            path={config.path}
            element={protectedElement}
          />
        );
      })}
    </Routes>
  );
};

// Hook to get current route information
export const useCurrentRoute = () => {
  const currentPath = window.location.pathname;
  const currentRoute = RouteRegistry.getRoute(currentPath);
  
  return {
    currentPath,
    currentRoute,
    isValidRoute: !!currentRoute,
  };
};

// Hook to get navigation items based on user roles
export const useNavigationItems = (userRoles: string[] = []) => {
  return RouteRegistry.getNavigationItems(userRoles);
};

// Utility to check route access
export const useRouteAccess = () => {
  return {
    canAccess: (path: string, userRoles: string[]) => 
      RouteRegistry.canAccess(path, userRoles),
    getAccessibleRoutes: (userRoles: string[]) => 
      RouteRegistry.getAccessibleRoutes(userRoles),
  };
};