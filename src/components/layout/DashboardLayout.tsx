
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        {/* Desktop Sidebar - Always visible and properly positioned */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Main Content Area */}
        <main className="flex-1 md:ml-64">
          {/* Mobile Menu Button */}
          <div className="md:hidden p-4 border-b bg-background">
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
          
          {/* Page Content */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
