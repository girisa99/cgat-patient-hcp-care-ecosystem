
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

  return (
    <DesignSystemProvider>
      <div className={cn("min-h-screen bg-background", className)}>
        {/* Debug Overlay - Only show if debug mode is on */}
        {debugMode && <LayoutDebugOverlay isEnabled={debugMode} />}
        
        {/* Fixed Header */}
        <Header />
        
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Mobile menu button - only show on mobile */}
        {isMobile && (
          <div 
            data-mobile-menu
            className="fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur border-b px-4 py-2 md:hidden"
          >
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
        
        {/* Main content area - FIXED */}
        <main 
          className={cn(
            "flex-1 min-h-screen",
            // Sidebar spacing
            isMobile ? "ml-0" : "md:ml-64",
            // Top spacing - only one padding-top class
            isMobile ? "pt-24" : "pt-16", // 24 = header + mobile menu, 16 = header only
            debugMode && "border-4 border-dashed border-red-500"
          )}
        >
          {/* Debug info inside main */}
          {debugMode && (
            <div className="bg-yellow-100 border border-yellow-400 p-4 mb-4 text-sm">
              <div className="font-bold mb-2">🔍 Main Element Debug</div>
              <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
              <div>Tablet: {isTablet ? 'Yes' : 'No'}</div>
              <div>Expected top: {isMobile ? '96px (header + mobile menu)' : '64px (header only)'}</div>
              <div>Applied classes: {cn(
                "flex-1 min-h-screen",
                isMobile ? "ml-0" : "md:ml-64",
                isMobile ? "pt-24" : "pt-16"
              )}</div>
            </div>
          )}
          
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </DesignSystemProvider>
  );
};

export default StandardizedDashboardLayout;
