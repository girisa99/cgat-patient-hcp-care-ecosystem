
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
      <div className={cn("min-h-screen bg-background flex flex-col", className)}>
        {/* Debug Overlay */}
        {debugMode && <LayoutDebugOverlay isEnabled={debugMode} />}
        
        {/* Fixed Header - always 64px */}
        <Header />
        
        {/* Mobile menu bar - 48px when visible */}
        {isMobile && (
          <div className="flex-shrink-0 h-12 bg-background border-b px-4 py-2 md:hidden flex justify-between items-center">
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
        )}
        
        {/* Main content area - flex grow to fill remaining space */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
          
          {/* Main content - full width with proper sidebar offset */}
          <main 
            className={cn(
              "flex-1 overflow-auto w-full",
              // Apply left margin only on desktop when sidebar is visible
              !isMobile && "md:ml-64",
              debugMode && "border-2 border-dashed border-blue-500"
            )}
          >
            {/* Unified content wrapper - left-aligned with consistent padding */}
            <div className="w-full max-w-none p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DesignSystemProvider>
  );
};

export default StandardizedDashboardLayout;
