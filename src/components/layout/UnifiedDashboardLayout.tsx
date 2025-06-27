
import React, { useState, useEffect } from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import Header from './Header';
import Sidebar from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnifiedDashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
  debugMode?: boolean;
}

const UnifiedDashboardLayout: React.FC<UnifiedDashboardLayoutProps> = ({
  children,
  className,
  debugMode: propDebugMode = false,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [debugMode, setDebugMode] = useState(propDebugMode);
  const { isMobile } = useResponsiveLayout();

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
    <div className="min-h-screen bg-background">
      {/* Fixed Header - 64px height */}
      <Header />
      
      {/* Mobile menu button - 48px height */}
      {isMobile && (
        <div className="fixed top-16 left-0 right-0 z-40 h-12 bg-background border-b px-4 flex items-center justify-between md:hidden">
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
      
      {/* Layout container */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Main content area */}
        <main 
          className={cn(
            "flex-1 min-h-screen w-full",
            // Account for header height and mobile menu
            isMobile ? "pt-28" : "pt-16", // 64px header + 48px mobile menu OR just 64px header
            // Account for sidebar width on desktop only
            !isMobile && "pl-64",
            debugMode && "border-2 border-dashed border-blue-500",
            className
          )}
        >
          <div className="w-full h-full overflow-hidden">
            {children}
          </div>
        </main>
      </div>
      
      {/* Debug info */}
      {debugMode && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 rounded-lg p-3 text-xs text-red-800 z-50 max-w-xs">
          <div className="font-bold mb-1">Layout Debug</div>
          <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
          <div>Sidebar Open: {sidebarOpen ? 'Yes' : 'No'}</div>
          <div>Main PT: {isMobile ? '112px' : '64px'}</div>
          <div>Main PL: {!isMobile ? '256px' : '0px'}</div>
        </div>
      )}
    </div>
  );
};

export default UnifiedDashboardLayout;
