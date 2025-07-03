import React, { ReactNode } from 'react';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showNavigation?: boolean;
}

/**
 * CENTRAL APP LAYOUT WITH SIDEBAR
 * Single source for consistent page layout with role-based sidebar navigation
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

  // Authenticated layout with sidebar
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        {/* Sidebar */}
        {showNavigation && <AppSidebar />}
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-card">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-4">
                {showNavigation && <SidebarTrigger />}
                {title && <h1 className="text-xl font-semibold">{title}</h1>}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground hidden md:block">
                  {user?.email}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => signOut()}
                  className="md:hidden"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;