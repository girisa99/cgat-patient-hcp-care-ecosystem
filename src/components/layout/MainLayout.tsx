
import React, { useState } from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import Header from './Header';
import Sidebar from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile } = useResponsiveLayout();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background">
      {/* Fixed Header */}
      <Header />
      
      {/* Mobile Menu Bar */}
      {isMobile && (
        <div className="fixed top-16 left-0 right-0 z-40 h-12 bg-background border-b px-4 flex items-center">
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
      
      {/* Main Container */}
      <div className="flex w-full">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Content Area */}
        <main 
          className={cn(
            "flex-1 min-h-screen w-full overflow-x-hidden",
            isMobile ? "pt-28" : "pt-16",
            !isMobile && "ml-64"
          )}
        >
          <div className="w-full overflow-x-hidden">
            <div className="min-h-full w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
