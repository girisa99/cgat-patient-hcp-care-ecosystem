
import React, { useState } from 'react';
import { DesignSystemProvider } from '@/components/ui/design-system/DesignSystemProvider';
import { PageLayout } from '@/components/ui/layout/PageLayout';
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
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showPageHeader?: boolean;
}

const StandardizedDashboardLayout: React.FC<StandardizedDashboardLayoutProps> = ({
  children,
  pageTitle,
  pageSubtitle,
  headerActions,
  containerSize = 'xl',
  showPageHeader = true,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile, isTablet } = useResponsiveLayout();

  return (
    <DesignSystemProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          {/* Desktop Sidebar - Always visible and properly positioned */}
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
          
          {/* Main Content Area */}
          <main className={cn(
            "flex-1 transition-all duration-300",
            isMobile ? "ml-0" : "md:ml-64"
          )}>
            {/* Mobile Menu Button */}
            {(isMobile || isTablet) && (
              <div className="md:hidden p-4 border-b bg-background">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSidebarOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <Menu className="h-4 w-4" />
                  <span>Menu</span>
                </Button>
              </div>
            )}
            
            {/* Page Content with standardized layout */}
            <PageLayout
              title={pageTitle}
              subtitle={pageSubtitle}
              headerActions={headerActions}
              containerSize={containerSize}
              showHeader={showPageHeader}
            >
              {children}
            </PageLayout>
          </main>
        </div>
      </div>
    </DesignSystemProvider>
  );
};

export default StandardizedDashboardLayout;
