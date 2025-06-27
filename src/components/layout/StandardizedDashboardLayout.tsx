
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
        
        {/* Single sidebar instance with proper z-index management */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Main content area - position directly under header with minimal spacing */}
        <main className={cn(
          "min-h-screen",
          "transition-all duration-300 ease-in-out",
          isMobile ? "ml-0" : "md:ml-64"
        )}>
          {/* Mobile menu button - position it directly under the header */}
          {(isMobile || isTablet) && (
            <div className="md:hidden p-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-16 left-0 right-0 z-40">
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
          
          {/* Content container - start immediately after header with minimal offset */}
          <div className={cn(
            "pt-16", // Only offset for the 64px header
            (isMobile || isTablet) ? "pt-20" : "pt-16" // Minimal extra space for mobile menu (20 = 16 + 4 for button)
          )}>
            {/* Page header section - minimal padding */}
            {showPageHeader && (pageTitle || pageSubtitle || headerActions) && (
              <div className="px-6 pt-2 pb-2 bg-background border-b">
                <div className="flex items-start justify-between w-full max-w-7xl mx-auto">
                  <div className="flex-1 text-left">
                    {pageTitle && (
                      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1 text-left">
                        {pageTitle}
                      </h1>
                    )}
                    {pageSubtitle && (
                      <p className="text-muted-foreground text-lg text-left">
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
            
            {/* Main content area - minimal padding */}
            <div className="w-full max-w-7xl mx-auto px-6 pt-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    </DesignSystemProvider>
  );
};

export default StandardizedDashboardLayout;
