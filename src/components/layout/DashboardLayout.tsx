
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
        {/* Desktop Sidebar - Always visible */}
        <aside className="hidden md:block w-64 border-r bg-background">
          <Sidebar 
            isOpen={true} 
            onClose={() => {}} 
          />
        </aside>
        
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden">
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
        </div>
        
        <main className="flex-1 p-6">
          {/* Mobile Menu Button */}
          <div className="md:hidden mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarOpen(true)}
              className="mb-4"
            >
              <Menu className="h-4 w-4 mr-2" />
              Menu
            </Button>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
