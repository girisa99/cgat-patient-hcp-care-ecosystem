
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';
import { SystemStatusBanner } from './SystemStatusBanner';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Show system status banner on admin pages
  const isAdminPage = ['/users', '/facilities', '/modules', '/patients'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          {isAdminPage && <SystemStatusBanner />}
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
