
import React, { useState } from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import Header from './Header';
import MobileMenuBar from './MobileMenuBar';
import Sidebar from './Sidebar';

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
      <div className="flex">
        {/* Desktop Sidebar - Fixed Position */}
        {!isMobile && (
          <div className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto z-30">
            <Sidebar />
          </div>
        )}
        
        {/* Mobile Sidebar - Overlay */}
        {isMobile && (
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
        )}
        
        {/* Main Content */}
        <main className={`flex-1 min-h-[calc(100vh-4rem)] ${
          isMobile ? 'pt-12' : 'ml-64'
        }`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
