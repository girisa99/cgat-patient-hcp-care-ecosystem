
import React, { useState } from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import Header from './Header';
import MobileMenuBar from './MobileMenuBar';
import SidebarContainer from './SidebarContainer';
import ContentArea from './ContentArea';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile } = useResponsiveLayout();

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      {/* Mobile Menu Bar */}
      {isMobile && (
        <MobileMenuBar onMenuClick={() => setSidebarOpen(true)} />
      )}
      
      {/* Main Container */}
      <div className="flex pt-16">
        {/* Sidebar Container */}
        <SidebarContainer 
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          onSidebarClose={() => setSidebarOpen(false)}
        />
        
        {/* Content Area */}
        <ContentArea isMobile={isMobile}>
          <div className="p-6">
            {children}
          </div>
        </ContentArea>
      </div>
    </div>
  );
};

export default MainLayout;
