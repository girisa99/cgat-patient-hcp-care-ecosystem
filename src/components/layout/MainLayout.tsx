
import React, { useState } from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import Header from './Header';
import Sidebar from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile } = useResponsiveLayout();

  return (
    <div className="min-h-screen bg-background">
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
      <div className="flex pt-16">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="w-64 flex-shrink-0">
            <div className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto">
              <Sidebar 
                isOpen={true} 
                onClose={() => {}} 
              />
            </div>
          </div>
        )}
        
        {/* Mobile Sidebar Overlay */}
        {isMobile && (
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
        )}
        
        {/* Content Area */}
        <main className={`
          flex-1 
          min-h-[calc(100vh-4rem)]
          ${isMobile ? 'pt-12' : ''} 
          overflow-x-hidden
        `}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
