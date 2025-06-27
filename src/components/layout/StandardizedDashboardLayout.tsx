
import React, { useState, useEffect } from 'react';
import { DesignSystemProvider } from '@/components/ui/design-system/DesignSystemProvider';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { LayoutDebugOverlay } from '@/components/debug/LayoutDebugOverlay';
import Header from './Header';
import Sidebar from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu, Bug, Ruler } from 'lucide-react';
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
  const [debugMode, setDebugMode] = useState(false);
  const { isMobile, isTablet } = useResponsiveLayout();

  // Debug keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDebugMode(prev => !prev);
        console.log('🐛 Debug mode toggled:', !debugMode);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [debugMode]);

  // Debug info logging
  useEffect(() => {
    if (debugMode) {
      console.log('🔍 Current Layout State:');
      console.log('- isMobile:', isMobile);
      console.log('- isTablet:', isTablet);
      console.log('- sidebarOpen:', sidebarOpen);
      console.log('- showPageHeader:', showPageHeader);
      console.log('- pageTitle:', pageTitle);
    }
  }, [debugMode, isMobile, isTablet, sidebarOpen, showPageHeader, pageTitle]);

  return (
    <DesignSystemProvider>
      <div className={cn("min-h-screen bg-background", className)}>
        {/* Debug Overlay */}
        <LayoutDebugOverlay isEnabled={debugMode} />
        
        {/* Debug Controls */}
        {debugMode && (
          <div className="fixed top-16 right-4 z-[9998] bg-blue-500 text-white p-2 rounded text-xs space-y-1">
            <div className="font-bold flex items-center gap-1">
              <Bug className="h-3 w-3" />
              Debug Controls
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const main = document.querySelector('main');
                if (main) {
                  console.log('📐 Main element styles:', {
                    computed: getComputedStyle(main),
                    classes: main.className,
                    rect: main.getBoundingClientRect(),
                  });
                }
              }}
              className="text-xs h-6"
            >
              <Ruler className="h-3 w-3 mr-1" />
              Log Main Styles
            </Button>
          </div>
        )}
        
        <Header />
        
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Mobile menu button */}
        {(isMobile || isTablet) && (
          <div className="md:hidden fixed top-16 left-0 right-0 z-40 p-2 border-b bg-background/95 backdrop-blur">
            <div className="flex justify-between items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSidebarOpen(true)}
                className="flex items-center space-x-2 hover:bg-accent transition-colors"
              >
                <Menu className="h-4 w-4" />
                <span>Menu</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDebugMode(!debugMode)}
                className={cn(
                  "flex items-center space-x-1",
                  debugMode && "bg-red-100 text-red-700"
                )}
              >
                <Bug className="h-3 w-3" />
                <span className="text-xs">Debug</span>
              </Button>
            </div>
          </div>
        )}
        
        {/* Main content area with debug classes */}
        <main 
          className={cn(
            "transition-all duration-300 ease-in-out",
            isMobile ? "ml-0" : "md:ml-64",
            (isMobile || isTablet) ? "pt-[112px]" : "pt-16",
            debugMode && "border-4 border-dashed border-red-500"
          )}
          data-debug-info={debugMode ? JSON.stringify({
            isMobile,
            isTablet,
            topPadding: (isMobile || isTablet) ? "112px" : "16px",
            leftMargin: isMobile ? "0" : "md:ml-64"
          }) : undefined}
        >
          {/* Page header section */}
          {showPageHeader && (pageTitle || pageSubtitle || headerActions) && (
            <div className={cn(
              "border-b bg-background",
              debugMode && "border-4 border-dashed border-yellow-500"
            )}>
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
          
          {/* Main content with debug borders */}
          <div className={cn(
            "w-full max-w-7xl mx-auto px-6 py-6",
            debugMode && "border-4 border-dashed border-green-500"
          )}>
            {children}
          </div>
        </main>
      </div>
    </DesignSystemProvider>
  );
};

export default StandardizedDashboardLayout;
