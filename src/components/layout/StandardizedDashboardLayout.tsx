
import React, { useState } from 'react';
import { DesignSystemProvider } from '@/components/ui/design-system/DesignSystemProvider';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import Header from './Header';
import Sidebar from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StandardizedDashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  headerActions?: React.ReactNode;
  showPageHeader?: boolean;
  className?: string;
}

const StandardizedDashboardLayout: React.FC<StandardizedDashboardLayoutProps> = ({
  children,
  pageTitle,
  pageSubtitle,
  headerActions,
  showPageHeader = false,
  className,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile, isTablet } = useResponsiveLayout();

  return (
    <DesignSystemProvider>
      <div className={cn("min-h-screen bg-background", className)}>
        <Header />
        
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Mobile menu button */}
        {(isMobile || isTablet) && (
          <div className="md:hidden fixed top-16 left-0 right-0 z-40 p-2 border-b bg-background/95 backdrop-blur">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarOpen(true)}
              className="flex items-center space-x-2 hover:bg-accent transition-colors"
            >
              <Menu className="h-4 w-4" />
              <span>Menu</span>
            </Button>
          </div>
        )}
        
        {/* Main content area - minimal top spacing */}
        <main className={cn(
          "transition-all duration-300 ease-in-out",
          isMobile ? "ml-0" : "md:ml-64",
          (isMobile || isTablet) ? "pt-[112px]" : "pt-16" // Just enough for header + mobile menu
        )}>
          {/* Page header section - only show if there's actual content */}
          {showPageHeader && (pageTitle || pageSubtitle || headerActions) && (
            <div className="border-b bg-background">
              <div className="flex items-start justify-between w-full max-w-7xl mx-auto px-6 py-4">
                <div className="flex-1">
                  {pageTitle && (
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
                      {pageTitle}
                    </h1>
                  )}
                  {pageSubtitle && (
                    <p className="text-muted-foreground">
                      {pageSubtitle}
                    </p>
                  )}
                </div>
                {headerActions && (
                  <div className="flex items-center gap-3 ml-6">
                    {headerActions}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Main content - minimal padding */}
          <div className="w-full max-w-7xl mx-auto px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </DesignSystemProvider>
  );
};

export default StandardizedDashboardLayout;
