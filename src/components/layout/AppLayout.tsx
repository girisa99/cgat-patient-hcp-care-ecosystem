import React, { ReactNode } from 'react';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { RoleBasedNavigation, MobileRoleBasedNavigation } from '@/components/navigation/RoleBasedNavigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showNavigation?: boolean;
}

/**
 * CENTRAL APP LAYOUT
 * Single source for consistent page layout with role-based navigation
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  title,
  showNavigation = true 
}) => {
  const { isLoading, isAuthenticated, signOut, user } = useAuthContext();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-muted-foreground">Loading...</span>
      </div>
    );
  }

  // Not authenticated - show simple layout
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    );
  }

  // Authenticated layout with navigation
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              {title && <h1 className="text-2xl font-bold">{title}</h1>}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      {showNavigation && (
        <>
          {/* Desktop Navigation */}
          <div className="hidden md:block border-b bg-card">
            <div className="container mx-auto px-4 py-2">
              <RoleBasedNavigation />
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <MobileRoleBasedNavigation className="border-b bg-card" />
        </>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;