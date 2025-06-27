
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
        
        {/* Single sidebar instance */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Main content area with proper spacing */}
        <main className={cn(
          "transition-all duration-300 ease-in-out",
          isMobile ? "ml-0" : "md:ml-64"
        )}>
          {(isMobile || isTablet) && (
            <div className="md:hidden p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          
          <div className="w-full">
            {showPageHeader && (pageTitle || pageSubtitle || headerActions) && (
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1 text-left">
                    {pageTitle && (
                      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2 text-left">
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
            
            <div className="px-6 pb-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </DesignSystemProvider>
  );
};

export default StandardizedDashboardLayout;
