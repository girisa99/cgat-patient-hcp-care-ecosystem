
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <aside className="w-64 border-r bg-background">
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
        </aside>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
