
import React, { useState, useEffect } from 'react';
import { DesignSystemProvider } from '@/components/ui/design-system/DesignSystemProvider';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { LayoutDebugOverlay } from '@/components/debug/LayoutDebugOverlay';
import Header from './Header';
import Sidebar from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu, Bug } from 'lucide-react';
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

  return (
    <DesignSystemProvider>
      <div className={cn("min-h-screen bg-background", className)}>
        {/* Debug Overlay */}
        {debugMode && <LayoutDebugOverlay isEnabled={debugMode} />}
        
        {/* Fixed Header */}
        <Header />
        
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Mobile menu button */}
        {isMobile && (
          <div className="fixed top-16 left-0 right-0 z-40 bg-background border-b px-4 py-2 md:hidden">
            <div className="flex justify-between items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSidebarOpen(true)}
                className="flex items-center space-x-2"
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
        
        {/* Main content area */}
        <main 
          className={cn(
            "transition-all duration-200",
            // Sidebar spacing
            isMobile ? "ml-0" : "md:ml-64",
            // Top spacing calculation:
            // Mobile: header (64px) + mobile menu (48px) = 112px total
            // Desktop: header (64px) only
            isMobile ? "pt-28" : "pt-16",
            debugMode && "border-2 border-dashed border-blue-500"
          )}
          style={{
            minHeight: isMobile ? 'calc(100vh - 112px)' : 'calc(100vh - 64px)'
          }}
        >
          {/* Content wrapper with padding */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </DesignSystemProvider>
  );
};

export default StandardizedDashboardLayout;
