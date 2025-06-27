
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
    <div className="h-screen w-screen overflow-hidden bg-background">
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
      <div className="flex h-full pt-16">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Content Area */}
        <main 
          className={cn(
            "flex-1 h-full overflow-hidden",
            isMobile ? "pt-12" : "pt-0",
            !isMobile && "ml-64"
          )}
        >
          <div className="h-full w-full overflow-auto">
            <div className="min-h-full w-full max-w-none">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
